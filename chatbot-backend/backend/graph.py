"""LangGraph routing workflow for Dr. Kukku & Dr. Mikku chatbots.

The graph classifies an incoming query as 'kukku' (poultry) or 'mikku' (dairy)
using a lightweight LLM call, then dispatches to the appropriate RAG node.

Graph:
    START → router_node → (conditional edge) → kukku_node | mikku_node → END
"""

from __future__ import annotations

import logging
import sys
from pathlib import Path
from typing import Literal, Optional

import requests
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
from config import OPENAI_API_KEY

log = logging.getLogger(__name__)

ROUTER_MODEL = "gpt-4o-mini"

ROUTER_PROMPT = (
    "You are a query classifier. Classify the following query as either "
    "'kukku' (poultry-related: chickens, broilers, layers, eggs, hens, feed, "
    "poultry diseases, chicks) or 'mikku' (dairy-related: cows, buffaloes, "
    "milk, rumen, dairy, calves, lactation, fertility in cattle). "
    "Return ONLY the single word 'kukku' or 'mikku' with no punctuation or explanation."
)


# ── State ─────────────────────────────────────────────────────────────────────


class ChatState(TypedDict):
    query: str
    bot: str            # filled by router_node: "kukku" or "mikku"
    history: list[dict]
    reply: str          # filled by bot node
    sources: list[dict]
    redirect_to: Optional[str]


# ── Nodes ─────────────────────────────────────────────────────────────────────


def router_node(state: ChatState) -> ChatState:
    """Classify query as 'kukku' or 'mikku' using a short LLM call."""
    query = state["query"]
    log.info("router_node: classifying query=%s", query[:80])

    resp = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
        json={
            "model": ROUTER_MODEL,
            "messages": [
                {"role": "system", "content": ROUTER_PROMPT},
                {"role": "user", "content": query},
            ],
            "max_tokens": 5,
            "temperature": 0,
        },
        timeout=15,
    )
    resp.raise_for_status()
    raw = resp.json()["choices"][0]["message"]["content"].strip().lower()

    # Normalise — default to kukku if unrecognised
    bot = raw if raw in ("kukku", "mikku") else "kukku"
    log.info("router_node: classified as bot=%s (raw=%r)", bot, raw)
    return {**state, "bot": bot}


def kukku_node(state: ChatState) -> ChatState:
    """Run the full RAG pipeline for Dr. Kukku (poultry)."""
    from rag import generate_reply  # local import to avoid circular issues at module load

    result = generate_reply(
        user_message=state["query"],
        bot="kukku",
        history=state.get("history", []),
    )
    return {**state, "reply": result["reply"], "sources": result["sources"], "redirect_to": result.get("redirect_to")}


def mikku_node(state: ChatState) -> ChatState:
    """Run the full RAG pipeline for Dr. Mikku (dairy)."""
    from rag import generate_reply
 
    result = generate_reply(
        user_message=state["query"],
        bot="mikku",
        history=state.get("history", []),
    )
    return {**state, "reply": result["reply"], "sources": result["sources"], "redirect_to": result.get("redirect_to")}


# ── Conditional edge ──────────────────────────────────────────────────────────


def _route_to_bot(state: ChatState) -> Literal["kukku_node", "mikku_node"]:
    return "kukku_node" if state.get("bot") == "kukku" else "mikku_node"


# ── Build graph ───────────────────────────────────────────────────────────────


def build_graph():
    """Compile and return the LangGraph workflow."""
    builder = StateGraph(ChatState)

    builder.add_node("router_node", router_node)
    builder.add_node("kukku_node", kukku_node)
    builder.add_node("mikku_node", mikku_node)

    builder.add_edge(START, "router_node")
    builder.add_conditional_edges("router_node", _route_to_bot)
    builder.add_edge("kukku_node", END)
    builder.add_edge("mikku_node", END)

    return builder.compile()


# Singleton graph (compiled once on import)
graph = build_graph()


def classify_query(query: str) -> str:
    """Lightweight helper: run only the router_node and return bot name.

    Used by POST /api/route — no RAG, no Pinecone call.
    """
    initial_state: ChatState = {
        "query": query,
        "bot": "",
        "history": [],
        "reply": "",
        "sources": [],
    }
    # Invoke only the router by running the classification prompt directly
    result = router_node(initial_state)
    return result["bot"]
