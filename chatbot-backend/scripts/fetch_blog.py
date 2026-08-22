"""Fetch blog posts from the Chemlife WordPress site via REST API.

Saves structured JSON per post into data/blog/.
"""

import json
import logging
import re
import sys
from pathlib import Path

import requests
from bs4 import BeautifulSoup

sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import DATA_DIR
from classify import classify_content

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger(__name__)

OUT_DIR = DATA_DIR / "blog"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# WordPress.com public REST API v1.1 (the self-hosted /wp-json/ endpoint is disabled)
WP_API = "https://public-api.wordpress.com/rest/v1.1/sites/chemlifeinnovations.wordpress.com/posts/"


def _strip_html(html: str) -> str:
    """Convert HTML to plain text."""
    soup = BeautifulSoup(html, "html.parser")
    return re.sub(r"\s+", " ", soup.get_text()).strip()


def fetch_all_posts() -> list[dict]:
    """Paginate through all WordPress.com posts via the v1.1 API."""
    posts: list[dict] = []
    offset = 0
    per_page = 100

    while True:
        log.info("Fetching offset %d ...", offset)
        resp = requests.get(
            WP_API,
            params={"number": per_page, "offset": offset},
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        batch = data.get("posts", [])
        if not batch:
            break

        for raw in batch:
            title = _strip_html(raw.get("title", ""))
            content = _strip_html(raw.get("content", ""))
            excerpt = _strip_html(raw.get("excerpt", ""))
            date = raw.get("date", "")
            link = raw.get("URL", "")
            tags = list(raw.get("tags", {}).keys())

            posts.append({
                "source": "blog",
                "url": link,
                "title": title,
                "date": date,
                "excerpt": excerpt,
                "content": content,
                "wp_tags": tags,
                "category": classify_content(title, content),
            })

        total = data.get("found", 0)
        offset += len(batch)
        if offset >= total:
            break

    return posts


def save(posts: list[dict]) -> None:
    for i, post in enumerate(posts):
        slug = re.sub(r"[^a-z0-9]+", "_", post["title"].lower())[:60] or f"post_{i}"
        out_path = OUT_DIR / f"{slug}.json"
        out_path.write_text(json.dumps(post, indent=2, ensure_ascii=False))
    log.info("Saved %d blog posts.", len(posts))


if __name__ == "__main__":
    posts = fetch_all_posts()
    save(posts)
    log.info("Done — fetched %d posts.", len(posts))
