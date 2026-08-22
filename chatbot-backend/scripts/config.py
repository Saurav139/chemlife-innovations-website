"""Centralised configuration — reads from .env file or environment variables."""

import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env from project root
_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_ENV_PATH)

# ── Pinecone ─────────────────────────────────────────────────────────────────
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY", "")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "chemlife-knowledge")

# ── Embeddings ───────────────────────────────────────────────────────────────
EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER", "voyage")  # "voyage" or "openai"
VOYAGE_API_KEY = os.getenv("VOYAGE_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# ── YouTube ──────────────────────────────────────────────────────────────────
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY", "")
YOUTUBE_CHANNEL_ID = os.getenv("YOUTUBE_CHANNEL_ID", "")

# ── Google Drive ─────────────────────────────────────────────────────────────
GOOGLE_DRIVE_FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID", "")

# ── Paths ────────────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"

# ── Backend ──────────────────────────────────────────────────────────────────
API_CORS_ORIGINS = os.getenv(
    "API_CORS_ORIGINS", "https://chemlifeinnovations.com,http://localhost:3000"
).split(",")
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# ── Website URLs to scrape ───────────────────────────────────────────────────
BASE_URL = "https://chemlifeinnovations.com"
SCRAPE_URLS = [
    # Product pages
    f"{BASE_URL}/product_model2.php",   # MonoGastric / Poultry
    f"{BASE_URL}/ruminantss.php",       # Ruminant / Dairy
    f"{BASE_URL}/value_addition.php",   # Value Addition
    # Info pages
    f"{BASE_URL}/technology.php",
    f"{BASE_URL}/about.php",
    f"{BASE_URL}/concept_theme.php",
]

# ── Embedding dimensions ─────────────────────────────────────────────────────
EMBEDDING_DIMENSIONS = {
    "voyage": 1024,   # voyage-3-lite
    "openai": 1536,   # text-embedding-3-small
}
