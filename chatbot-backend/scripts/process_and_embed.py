"""Load scraped data, chunk, embed, and upload to Pinecone.

Usage:
    python scripts/process_and_embed.py          # full pipeline
    python scripts/process_and_embed.py --dry-run # preview chunks without uploading
"""

import argparse
import json
import logging
import re
import sys
import time
import uuid
from pathlib import Path

import requests
from pinecone import Pinecone

sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import (
    DATA_DIR,
    EMBEDDING_DIMENSIONS,
    EMBEDDING_PROVIDER,
    OPENAI_API_KEY,
    PINECONE_API_KEY,
    PINECONE_INDEX_NAME,
    VOYAGE_API_KEY,
)

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger(__name__)

# ── Text cleaning ────────────────────────────────────────────────────────────


def clean_text(text: str) -> str:
    """Remove HTML artifacts, collapse whitespace."""
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"&[a-z]+;", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


# ── Document loading ─────────────────────────────────────────────────────────


def load_documents() -> list[dict]:
    """Load all JSON files from data/ subdirectories."""
    docs: list[dict] = []

    for json_file in sorted(DATA_DIR.rglob("*.json")):
        try:
            raw = json.loads(json_file.read_text())
        except json.JSONDecodeError:
            log.warning("Skipping invalid JSON: %s", json_file)
            continue

        source_dir = json_file.parent.name  # website, blog, youtube, fliers
        category = raw.get("category", "general")

        # Normalize text field
        if "full_text" in raw:
            text = raw["full_text"]
        elif "content" in raw:
            text = raw["content"]
        elif "transcript" in raw:
            # For YouTube: combine transcript (may be empty) with title + description
            parts = [raw.get("title", ""), raw.get("description", ""), raw["transcript"]]
            text = " ".join(p for p in parts if p)
        else:
            text = json.dumps(raw)

        text = clean_text(text)
        if len(text) < 50:
            log.info("Skipping short document: %s", json_file.name)
            continue

        docs.append({
            "text": text,
            "metadata": {
                "source": source_dir,
                "title": raw.get("title", json_file.stem),
                "category": category,
                "url": raw.get("url", raw.get("filename", "")),
                "file": json_file.name,
            },
        })

    log.info("Loaded %d documents from data/.", len(docs))
    return docs


# ── Chunking ─────────────────────────────────────────────────────────────────


def chunk_text(text: str, max_chars: int = 2500, overlap: int = 300) -> list[str]:
    """Recursively split text into semantic chunks by paragraph, sentence, and word.
    
    Tries to keep paragraphs and sentences intact rather than slicing mid-line.
    """
    def _split(text_to_split: str, separators: list[str]) -> list[str]:
        if not separators:
            return [text_to_split]
        
        separator = separators[0]
        next_separators = separators[1:]
        
        parts = text_to_split.split(separator)
        result_chunks = []
        
        for part in parts:
            if not part.strip():
                continue
            if len(part) <= max_chars:
                result_chunks.append(part)
            else:
                result_chunks.extend(_split(part, next_separators))
                
        return result_chunks

    separators = ["\n\n", "\n", ". ", " "]
    raw_pieces = _split(text, separators)
    
    chunks: list[str] = []
    current_chunk: list[str] = []
    current_length = 0
    
    for piece in raw_pieces:
        piece_len = len(piece)
        if current_length + piece_len + 1 > max_chars:
            if current_chunk:
                chunks.append(" ".join(current_chunk).strip())
            
            overlap_chunk = []
            overlap_len = 0
            for prev_piece in reversed(current_chunk):
                if overlap_len + len(prev_piece) + 1 <= overlap:
                    overlap_chunk.insert(0, prev_piece)
                    overlap_len += len(prev_piece) + 1
                else:
                    break
            
            current_chunk = overlap_chunk
            current_length = overlap_len
            
        current_chunk.append(piece)
        current_length += piece_len + 1
        
    if current_chunk:
        chunks.append(" ".join(current_chunk).strip())
        
    return chunks


def chunk_documents(docs: list[dict]) -> list[dict]:
    """Split documents into chunks, preserving metadata."""
    chunked: list[dict] = []

    for doc in docs:
        chunks = chunk_text(doc["text"])
        for i, chunk in enumerate(chunks):
            chunked.append({
                "id": str(uuid.uuid4()),
                "text": chunk,
                "metadata": {
                    **doc["metadata"],
                    "chunk_index": i,
                    "total_chunks": len(chunks),
                },
            })

    log.info("Created %d chunks from %d documents.", len(chunked), len(docs))
    return chunked


# ── Embedding ────────────────────────────────────────────────────────────────


def _embed_voyage(texts: list[str]) -> list[list[float]]:
    """Embed via Voyage AI API."""
    resp = requests.post(
        "https://api.voyageai.com/v1/embeddings",
        headers={"Authorization": f"Bearer {VOYAGE_API_KEY}"},
        json={"input": texts, "model": "voyage-3-lite"},
        timeout=60,
    )
    resp.raise_for_status()
    data = resp.json()
    return [item["embedding"] for item in data["data"]]


def _embed_openai(texts: list[str]) -> list[list[float]]:
    """Embed via OpenAI API."""
    resp = requests.post(
        "https://api.openai.com/v1/embeddings",
        headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
        json={"input": texts, "model": "text-embedding-3-small"},
        timeout=60,
    )
    resp.raise_for_status()
    data = resp.json()
    return [item["embedding"] for item in data["data"]]


def embed_batch(texts: list[str], batch_size: int = 64) -> list[list[float]]:
    """Embed texts in batches."""
    embed_fn = _embed_voyage if EMBEDDING_PROVIDER == "voyage" else _embed_openai
    all_embeddings: list[list[float]] = []

    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        log.info("Embedding batch %d–%d of %d ...", i, i + len(batch), len(texts))
        embeddings = embed_fn(batch)
        all_embeddings.extend(embeddings)
        time.sleep(0.5)  # rate-limit courtesy

    return all_embeddings


# ── Pinecone upload ──────────────────────────────────────────────────────────


def upload_to_pinecone(chunks: list[dict], embeddings: list[list[float]]) -> None:
    """Upload vectors to Pinecone with namespace routing."""
    pc = Pinecone(api_key=PINECONE_API_KEY)
    dimension = EMBEDDING_DIMENSIONS[EMBEDDING_PROVIDER]

    # Create index if it doesn't exist
    existing_indexes = [idx.name for idx in pc.list_indexes()]
    if PINECONE_INDEX_NAME not in existing_indexes:
        log.info("Creating Pinecone index '%s' (dim=%d)...", PINECONE_INDEX_NAME, dimension)
        pc.create_index(
            name=PINECONE_INDEX_NAME,
            dimension=dimension,
            metric="cosine",
            spec={"serverless": {"cloud": "aws", "region": "us-east-1"}},
        )
        # Wait for index to be ready
        time.sleep(10)

    index = pc.Index(PINECONE_INDEX_NAME)

    # Group chunks by target namespace
    namespace_vectors: dict[str, list] = {"poultry": [], "dairy": []}

    for chunk, embedding in zip(chunks, embeddings):
        category = chunk["metadata"]["category"]
        vector = {
            "id": chunk["id"],
            "values": embedding,
            "metadata": {
                **chunk["metadata"],
                "text": chunk["text"][:1000],  # Store truncated text for retrieval
            },
        }

        if category == "poultry":
            namespace_vectors["poultry"].append(vector)
        elif category == "dairy":
            namespace_vectors["dairy"].append(vector)
        else:
            # General content goes into BOTH namespaces
            namespace_vectors["poultry"].append(vector)
            dairy_vector = {**vector, "id": str(uuid.uuid4())}
            namespace_vectors["dairy"].append(dairy_vector)

    # Upload in batches per namespace
    for namespace, vectors in namespace_vectors.items():
        try:
            log.info("Deleting existing vectors in namespace '%s' to avoid duplicates...", namespace)
            index.delete(delete_all=True, namespace=namespace)
            time.sleep(1)
        except Exception as e:
            log.warning("Could not clear namespace '%s': %s", namespace, e)

        log.info("Uploading %d vectors to namespace '%s'...", len(vectors), namespace)
        batch_size = 100
        for i in range(0, len(vectors), batch_size):
            batch = vectors[i : i + batch_size]
            index.upsert(vectors=batch, namespace=namespace)
            time.sleep(0.3)

    log.info("Upload complete.")
    for ns in ("poultry", "dairy"):
        stats = index.describe_index_stats()
        count = stats.get("namespaces", {}).get(ns, {}).get("vector_count", 0)
        log.info("  %s namespace: %d vectors", ns, count)


# ── Main ─────────────────────────────────────────────────────────────────────


def main() -> None:
    parser = argparse.ArgumentParser(description="Process and embed Chemlife data")
    parser.add_argument("--dry-run", action="store_true", help="Preview chunks without uploading")
    args = parser.parse_args()

    docs = load_documents()
    if not docs:
        log.error("No documents found in %s. Run the scraping scripts first.", DATA_DIR)
        sys.exit(1)

    chunks = chunk_documents(docs)

    if args.dry_run:
        log.info("DRY RUN — showing first 5 chunks:")
        for c in chunks[:5]:
            log.info("  [%s] %s: %s...", c["metadata"]["category"], c["metadata"]["title"], c["text"][:100])
        log.info("Total chunks: %d", len(chunks))
        return

    texts = [c["text"] for c in chunks]
    embeddings = embed_batch(texts)
    upload_to_pinecone(chunks, embeddings)
    log.info("Pipeline complete — %d chunks embedded and uploaded.", len(chunks))


if __name__ == "__main__":
    main()
