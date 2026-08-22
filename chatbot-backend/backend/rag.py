"""RAG pipeline — retrieve context from Pinecone, generate answer via OpenAI."""

from __future__ import annotations

import logging
import re
import sys
from pathlib import Path

import requests
from pinecone import Pinecone

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))
from config import (
    EMBEDDING_PROVIDER,
    OPENAI_API_KEY,
    PINECONE_API_KEY,
    PINECONE_INDEX_NAME,
    VOYAGE_API_KEY,
)
from prompts import PROMPTS

log = logging.getLogger(__name__)

# ── Clients (initialised lazily) ─────────────────────────────────────────────

_pc_index = None

BOT_NAMESPACE = {
    "kukku": "poultry",
    "mikku": "dairy",
}

OPENAI_CHAT_MODEL = "gpt-4o-mini"
TOP_K = 8


def _get_pinecone_index():
    global _pc_index
    if _pc_index is None:
        pc = Pinecone(api_key=PINECONE_API_KEY)
        _pc_index = pc.Index(PINECONE_INDEX_NAME)
    return _pc_index


# ── Embedding ────────────────────────────────────────────────────────────────


def embed_query(text: str) -> list[float]:
    """Embed a single query string using the configured provider."""
    if EMBEDDING_PROVIDER == "voyage":
        resp = requests.post(
            "https://api.voyageai.com/v1/embeddings",
            headers={"Authorization": f"Bearer {VOYAGE_API_KEY}"},
            json={"input": [text], "model": "voyage-3-lite", "input_type": "query"},
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()["data"][0]["embedding"]
    else:
        resp = requests.post(
            "https://api.openai.com/v1/embeddings",
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            json={"input": [text], "model": "text-embedding-3-small"},
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()["data"][0]["embedding"]


# ── Retrieval ────────────────────────────────────────────────────────────────


def retrieve(query: str, bot: str) -> list[dict]:
    """Retrieve top-K relevant chunks from Pinecone."""
    namespace = BOT_NAMESPACE.get(bot, "poultry")
    query_vec = embed_query(query)
    index = _get_pinecone_index()

    results = index.query(
        vector=query_vec,
        namespace=namespace,
        top_k=TOP_K,
        include_metadata=True,
    )

    chunks = []
    seen_texts: set[str] = set()

    for match in results.get("matches", []):
        meta = match.get("metadata", {})
        text = meta.get("text", "")

        # Skip YouTube docs that have no real transcript (title+description only)
        if meta.get("source") == "youtube" and not meta.get("has_transcript"):
            continue

        # Deduplicate — skip if we've already included an identical text chunk
        text_key = text[:200]  # first 200 chars as fingerprint
        if text_key in seen_texts:
            continue
        seen_texts.add(text_key)

        chunks.append({
            "text": text,
            "title": meta.get("title", ""),
            "source": meta.get("source", ""),
            "url": meta.get("url", ""),
            "score": match.get("score", 0),
        })

    return chunks


# ── Generation ───────────────────────────────────────────────────────────────


def _build_context_block(chunks: list[dict]) -> str:
    """Format retrieved chunks into a context block for the prompt."""
    if not chunks:
        return "No relevant context found in the knowledge base."

    parts: list[str] = []
    for i, c in enumerate(chunks, 1):
        source_info = f"[Source: {c['source']} — {c['title']}]"
        if c.get("url"):
            source_info += f" ({c['url']})"
        parts.append(f"--- Context {i} {source_info} ---\n{c['text']}")

    return "\n\n".join(parts)


def _build_messages(
    user_message: str,
    context: str,
    history: list[dict],
    system_prompt: str,
) -> list[dict]:
    """Build the OpenAI messages array with system + history + context + query."""
    messages: list[dict] = [{"role": "system", "content": system_prompt}]

    # Include conversation history (last 10 turns max)
    for turn in history[-10:]:
        role = turn.get("role", "user")
        content = turn.get("content", "")
        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": content})

    # Current user message with context and strict formatting reinforcement
    augmented = (
        f"Use the following knowledge-base context to answer the user's question. "
        f"If the context doesn't contain relevant information, say so.\n\n"
        f"{context}\n\n"
        f"CRITICAL: You MUST strictly format your response using the Response Formatting Guidelines specified in your system prompt. "
        f"Use the exact bold headers (**Overview**, **Key Benefits**, **Dosage & Usage**, **Next Step** for products; OR "
        f"**Direct Answer**, **Actionable Tips**, **Chemlife Solution** for general queries).\n\n"
        f"User question: {user_message}"
    )
    messages.append({"role": "user", "content": augmented})

    return messages


PRODUCT_URLS = {
    # Poultry (Mono-gastric)
    "maxdmold plus": "/products?expand=MaxDmold+Plus",
    "maxdmold-plus": "/products?expand=MaxDmold+Plus",
    "maxdmold": "/products?expand=MaxDmold",
    "feedgenie forte": "/products?expand=FeedGenie+Forte",
    "feedgenie-forte": "/products?expand=FeedGenie+Forte",
    "chemdmold": "/products?expand=FeedGenie+Forte",
    "feedgenie prime": "/products?expand=FeedGenie+Prime",
    "feedgenie-prime": "/products?expand=FeedGenie+Prime",
    "feedgenie": "/products?expand=FeedGenie+Prime",
    "growgenie-phyto": "/products?expand=GroGenie",
    "growgenie phyto": "/products?expand=GroGenie",
    "growgenie": "/products?expand=GroGenie",
    "grogenie": "/products?expand=GroGenie",
    "egggenie": "/products?expand=EggGenie",
    "gutprogenie": "/products?expand=GutproGenie",
    "livprogenie": "/products?expand=LivproGenie",
    "chembmin-p": "/products?expand=MinBioZen",
    "chembmin p": "/products?expand=MinBioZen",
    "chembmin": "/products?expand=MinBioZen",
    
    # Dairy (Ruminants)
    "syndmold": "/products?expand=SynDmold",
    "methiowiz": "/products?expand=MethioWiz",
    "mbiowiz plus": "/products?expand=MBioWiz+Plus",
    "mbiowiz-plus": "/products?expand=MBioWiz+Plus",
    "mbiowiz ts": "/products?expand=MBioWiz+TS",
    "mbiowiz-ts": "/products?expand=MBioWiz+TS",
    "choliwiz": "/products?expand=CholiWiz",
    "rumiwiz": "/products?expand=RumiWiz",
    "aflamlock": "/products?expand=AflaMlock",
    "smart fertility enhancer": "/products?expand=MBioWiz+Plus",
    "fertility enhancer": "/products?expand=MBioWiz+Plus",
    "rumen ecosystem enhancer": "/products?expand=MBioWiz+Plus",
    "ecosystem enhancer": "/products?expand=MBioWiz+Plus",
    "ultimate aflatoxin binder": "/products?expand=AflaMlock",
    "aflatoxin binder": "/products?expand=AflaMlock",
    "milk yield enhancer": "/products?expand=CholiWiz",
    "milk yield": "/products?expand=CholiWiz",
    "rumen bypass choline": "/products?expand=CholiWiz",
    "bypass choline": "/products?expand=CholiWiz",
    "chelated trace minerals": "/products?expand=MinBioZen",
    "trace minerals": "/products?expand=MinBioZen",

    # Value Addition / General
    "maxdmold spray": "/products?expand=MaxDmold+Spray",
    "maxdmold-spray": "/products?expand=MaxDmold+Spray",
    "minbiozen": "/products?expand=MinBioZen",
    "ddgs-dtox": "/products?expand=DDGS-Dtox",
    "ddgs dtox": "/products?expand=DDGS-Dtox",
}


def _is_source_referenced(reply: str, title: str, url: str) -> bool:
    """Check if a retrieved source is actually cited/referenced in the generated reply."""
    reply_lower = reply.lower()
    title_lower = title.lower()
    url_lower = url.lower()

    # 1. URL check: if the URL is written out or referenced in a markdown link
    if url and url_lower in reply_lower:
        return True

    # 2. Exact Title check
    if title and title_lower in reply_lower:
        return True

    # 3. Normalized Title check (e.g. without file extensions, dashes, underscores)
    clean_title = re.sub(r"\.pdf$", "", title_lower).strip()
    clean_title = re.sub(r"[-_]", " ", clean_title)
    if clean_title and clean_title in reply_lower:
        return True

    # 4. Keyword set check: if the title consists of multiple words, check if all
    # significant words are mentioned in the response (e.g. "smart fertility enhancer")
    words = [w for w in clean_title.split() if len(w) > 3]
    if len(words) >= 2:
        if all(w in reply_lower for w in words):
            return True

    return False


def normalize_url(url: str) -> str:
    """Normalize old production Chemlife URLs to local Next.js product page paths."""
    url_lower = url.lower()
    if "chemlifeinnovations.com" in url_lower:
        # Check standard products
        if "chemdmold" in url_lower:
            return "/products?expand=FeedGenie+Forte"
        elif "maxdmol" in url_lower:
            return "/products?expand=MaxDmold"
        elif "grobiozen" in url_lower:
            return "/products?expand=GroGenie"
        elif "feedgenie" in url_lower:
            return "/products?expand=FeedGenie+Prime"
        elif "product_model2" in url_lower:
            return "/products?expand=EggGenie"
        elif "minbiozen" in url_lower:
            return "/products?expand=MinBioZen"
        elif "ruminantss.php" in url_lower:
            match = re.search(r"id=(\d+)", url_lower)
            if match:
                idx = match.group(1)
                if idx in ("1", "2"):
                    return "/products?expand=MBioWiz+Plus"
                elif idx == "3":
                    return "/products?expand=AflaMlock"
                elif idx in ("4", "5"):
                    return "/products?expand=CholiWiz"
                elif idx == "6":
                    return "/products?expand=MinBioZen"
        return "/products"
    return url


def generate_reply(
    user_message: str,
    bot: str,
    history: list[dict] | None = None,
) -> dict:
    """Full RAG pipeline: retrieve → build prompt → call OpenAI → return."""
    history = history or []

    # 1. Retrieve
    chunks = retrieve(user_message, bot)
    log.info("Retrieved %d chunks (top score: %.3f)", len(chunks), chunks[0]["score"] if chunks else 0)

    # 2. Build prompt
    context = _build_context_block(chunks)
    system_prompt = PROMPTS.get(bot, PROMPTS["kukku"])
    messages = _build_messages(user_message, context, history, system_prompt)

    # 3. Generate via OpenAI Chat Completions API
    resp = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
        json={
            "model": OPENAI_CHAT_MODEL,
            "messages": messages,
            "max_tokens": 1024,
            "temperature": 0.7,
        },
        timeout=60,
    )
    resp.raise_for_status()
    data = resp.json()
    reply_text = data["choices"][0]["message"]["content"]

    # 4. Build source references
    sources = []
    seen_urls: set[str] = set()
    reply_lower = reply_text.lower()

    # Detect if the response is an off-topic refusal or escalation due to lack of info
    is_off_topic = (
        "i specialise in poultry nutrition" in reply_lower
        or "i specialise in dairy nutrition" in reply_lower
        or "don't have enough detail" in reply_lower
    )

    if not is_off_topic:
        # Match against the retrieved chunks
        for c in chunks:
            url = c.get("url", "")
            if not url:
                continue
            
            normalized_u = normalize_url(url)
            if normalized_u in seen_urls:
                continue

            title = c.get("title", "")
            if _is_source_referenced(reply_text, title, url):
                # Clean up title for old names to match redesign names
                clean_title = title
                title_l = title.lower()
                if "chemdmold" in title_l:
                    clean_title = "FeedGenie Forte"
                elif "feedgenie-prime" in title_l or "feedgenie prime" in title_l:
                    clean_title = "FeedGenie Prime"
                elif "feedgenie" in title_l:
                    clean_title = "FeedGenie Prime"
                elif "grobiozen" in title_l or "growgenie" in title_l:
                    clean_title = "GroGenie"
                elif "minbiozen" in title_l or "chembmin" in title_l:
                    clean_title = "MinBioZen"
                elif "ruminantss" in title_l or "fertility" in title_l:
                    clean_title = "MBioWiz Plus"
                elif "aflatoxin" in title_l:
                    clean_title = "AflaMlock"
                elif "choline" in title_l or "milk yield" in title_l:
                    clean_title = "CholiWiz"

                sources.append({"title": clean_title, "url": normalized_u})
                seen_urls.add(normalized_u)

        # Scan for any Chemlife products explicitly mentioned in the reply (even if vector search missed them)
        for product_name, product_url in PRODUCT_URLS.items():
            if product_url in seen_urls:
                continue
            if product_name in reply_lower:
                # Map product name to its exact display title
                if "maxdmold spray" in product_name:
                    title = "MaxDmold Spray"
                elif "maxdmold plus" in product_name:
                    title = "MaxDmold Plus"
                elif "maxdmold" in product_name:
                    title = "MaxDmold"
                elif "feedgenie forte" in product_name or "chemdmold" in product_name:
                    title = "FeedGenie Forte"
                elif "feedgenie prime" in product_name or "feedgenie" in product_name:
                    title = "FeedGenie Prime"
                elif "grogenie" in product_name or "growgenie" in product_name:
                    title = "GroGenie"
                elif "egggenie" in product_name:
                    title = "EggGenie"
                elif "gutprogenie" in product_name:
                    title = "GutproGenie"
                elif "livprogenie" in product_name:
                    title = "LivproGenie"
                elif "syndmold" in product_name:
                    title = "SynDmold"
                elif "methiowiz" in product_name:
                    title = "MethioWiz"
                elif "mbiowiz plus" in product_name:
                    title = "MBioWiz Plus"
                elif "mbiowiz ts" in product_name:
                    title = "MBioWiz TS"
                elif "choliwiz" in product_name:
                    title = "CholiWiz"
                elif "rumiwiz" in product_name:
                    title = "RumiWiz"
                elif "aflamlock" in product_name:
                    title = "AflaMlock"
                elif "ddgs-dtox" in product_name or "ddgs dtox" in product_name:
                    title = "DDGS-Dtox"
                elif "minbiozen" in product_name or "chembmin" in product_name or "trace minerals" in product_name:
                    title = "MinBioZen"
                else:
                    if "fertility" in product_name or "rumen ecosystem" in product_name:
                        title = "MBioWiz Plus"
                    elif "aflatoxin binder" in product_name:
                        title = "AflaMlock"
                    elif "choline" in product_name or "milk yield" in product_name:
                        title = "CholiWiz"
                    else:
                        title = product_name.replace("-", " ").title()

                sources.append({"title": title, "url": product_url})
                seen_urls.add(product_url)

        # Fallback to the top 2 retrieved sources if no specific source/product was referenced
        if not sources and chunks:
            for c in chunks[:2]:
                url = c.get("url", "")
                if url and url not in seen_urls:
                    sources.append({"title": c["title"], "url": url})
                    seen_urls.add(url)

    # Detect cross-bot redirect from tags
    redirect_to = None
    match = re.search(r"<redirect>(mikku|kukku)</redirect>", reply_text, re.IGNORECASE)
    if match:
        redirect_to = match.group(1).lower()
        reply_text = re.sub(r"<redirect>(mikku|kukku)</redirect>", "", reply_text, flags=re.IGNORECASE).strip()

    return {
        "reply": reply_text,
        "sources": sources,
        "redirect_to": redirect_to,
    }
