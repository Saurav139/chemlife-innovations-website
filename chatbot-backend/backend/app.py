"""FastAPI application for Dr. Kukku & Dr. Mikku chatbots.

Run locally:
    uvicorn backend.app:app --reload

Deploy on AWS Lambda via Mangum adapter (see deploy/).
"""

import json
import logging
import random
import sys
from pathlib import Path

from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum
from pydantic import BaseModel, Field

# Ensure scripts/ and backend/ are importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import API_CORS_ORIGINS, DATA_DIR, LOG_LEVEL

from rag import generate_reply
from graph import graph, classify_query

logging.basicConfig(level=getattr(logging, LOG_LEVEL, logging.INFO))
log = logging.getLogger(__name__)

# ── App setup ────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Chemlife Chatbot API",
    description="Backend for Dr. Kukku (poultry) & Dr. Mikku (dairy) chatbots",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=API_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# ── Request / Response models ────────────────────────────────────────────────


class RouteRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)


class RouteResponse(BaseModel):
    bot: str  # "kukku" or "mikku"


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    bot: str = Field(..., pattern=r"^(kukku|mikku)$")
    history: list[dict] = Field(default_factory=list)


class SourceRef(BaseModel):
    title: str
    url: str


class ChatResponse(BaseModel):
    reply: str
    sources: list[SourceRef]
    redirect_to: Optional[str] = None


REDIRECT_SIGNALS = {
    "kukku": "Dr. Kukku",
    "mikku": "Dr. Mikku",
}


# ── Endpoints ────────────────────────────────────────────────────────────────


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/route", response_model=RouteResponse)
def route(req: RouteRequest):
    log.info("Route request: message=%s", req.message[:80])
    try:
        bot = classify_query(req.message)
        return RouteResponse(bot=bot)
    except Exception:
        log.exception("Error classifying query")
        raise HTTPException(status_code=500, detail="Failed to classify query. Please try again.")


FAQ_CATEGORIES = {
    "kukku": {"poultry"},
    "mikku": {"dairy"},
}

_faq_cache: dict[str, list[str]] = {}


def _load_faqs(bot: str) -> list[str]:
    if bot in _faq_cache:
        return _faq_cache[bot]

    categories = FAQ_CATEGORIES.get(bot, {"general"})
    faq_dir = DATA_DIR / "faqs"
    questions: list[str] = []

    for path in faq_dir.glob("*.json"):
        try:
            data = json.loads(path.read_text())
        except Exception:
            continue
        if data.get("category") not in categories:
            continue
        for section in data.get("sections", []):
            for qa in section.get("qas", []):
                q = qa.get("q", "").strip()
                a = qa.get("a", "").strip()
                if q and a:
                    questions.append(q)

    _faq_cache[bot] = questions
    return questions


@app.get("/api/faqs")
def get_faqs(bot: str = Query("kukku", pattern=r"^(kukku|mikku)$"), n: int = Query(3, ge=1, le=10)):
    questions = _load_faqs(bot)
    if not questions:
        return {"questions": []}
    sample = random.sample(questions, min(n, len(questions)))
    return {"questions": sample}


@app.post("/api/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    log.info("Chat request: bot=%s message=%s", req.bot, req.message[:80])
    try:
        # Run the full LangGraph workflow
        initial_state = {
            "query": req.message,
            "bot": req.bot,
            "history": req.history,
            "reply": "",
            "sources": [],
            "redirect_to": None,
        }
        final_state = graph.invoke(initial_state)

        # Also detect cross-bot redirect if the router routed to the other bot
        redirect_to = final_state.get("redirect_to")
        if final_state["bot"] != req.bot:
            redirect_to = final_state["bot"]

        if redirect_to:
            if redirect_to == "mikku":
                reply = "That's Dr. Mikku's area of expertise — redirecting you to Dr. Mikku! 🐄"
            else:
                reply = "That's Dr. Kukku's area of expertise — redirecting you to Dr. Kukku! 🐔"
            sources = []
        else:
            reply = final_state["reply"]
            sources = final_state["sources"]

        return ChatResponse(
            reply=reply,
            sources=[SourceRef(**s) for s in sources],
            redirect_to=redirect_to,
        )
    except Exception:
        log.exception("Error generating reply")
        raise HTTPException(status_code=500, detail="Failed to generate response. Please try again.")


# ── Lambda handler ───────────────────────────────────────────────────────────

handler = Mangum(app, lifespan="off")
