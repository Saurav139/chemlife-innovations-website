"""LLM-based content classifier for Chemlife knowledge base.

Classifies a piece of content as 'poultry', 'dairy', or 'general' using
gpt-4o-mini, replacing the fragile keyword-counting approach.

Usage:
    from classify import classify_content
    category = classify_content(title="MaxDmold", text="...")
"""

import logging
import sys
from pathlib import Path

import requests

sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import OPENAI_API_KEY

log = logging.getLogger(__name__)

MODEL = "gpt-4o-mini"

SYSTEM_PROMPT = """\
You are a content classifier for an animal health company called Chemlife Innovations.

Classify the given content into exactly one of these three categories:

- poultry  : Content whose PRIMARY focus is chickens, broilers, layers, egg production,
             hatcheries, poultry feed, or Chemlife poultry products (ChemDmold, MaxDmold,
             GrowGenie-Phyto, FeedGenie-Prime, EggGenie, ChemBmin-P).
             Also use this for topics like mold in feed, mycotoxins, feed hygiene, and
             feed additives when the examples or context are mainly about poultry/swine.

- dairy    : Content whose PRIMARY focus is cows, buffaloes, goats, ruminants, milk
             production, rumen health, fertility in cattle, dairy farming, or Chemlife
             dairy products (Smart Fertility Enhancer, Rumen Ecosystem Enhancer, Ultimate
             Aflatoxin Binder, Milk Yield Enhancer, Rumen Bypass Choline, Chelated Trace
             Minerals).

- general  : ONLY use this when the content has NO clear primary species focus — for
             example, pure company/brand articles, or content that explicitly and equally
             discusses both poultry and dairy with no dominant angle.
             When in doubt between poultry and dairy, pick the more relevant one.
             Do NOT default to general just because both species are mentioned in passing.

Return ONLY the single word: poultry, dairy, or general. No punctuation, no explanation.
"""


def classify_content(title: str, text: str) -> str:
    """Classify content as 'poultry', 'dairy', or 'general' using an LLM.

    Sends only the title + first 400 words of text to keep token usage low.
    Falls back to 'general' on any error so ingestion never fails.
    """
    # Trim to first 400 words to keep costs low — enough context for classification
    words = text.split()
    snippet = " ".join(words[:400])
    user_message = f"Title: {title}\n\nContent: {snippet}"

    try:
        resp = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            json={
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_message},
                ],
                "max_tokens": 5,
                "temperature": 0,
            },
            timeout=15,
        )
        resp.raise_for_status()
        raw = resp.json()["choices"][0]["message"]["content"].strip().lower()
        result = raw if raw in ("poultry", "dairy", "general") else "general"
        log.info("Classified %r → %s (raw=%r)", title[:60], result, raw)
        return result

    except Exception as exc:
        log.warning("Classification failed for %r: %s — defaulting to 'general'", title[:60], exc)
        return "general"
