"""Fetch YouTube video transcripts from the Chemlife channel.

Uses the YouTube Data API to list videos and youtube-transcript-api for transcripts.
Saves JSON per video into data/youtube/.
"""

from __future__ import annotations

import json
import logging
import re
import sys
from pathlib import Path

import requests
from youtube_transcript_api import YouTubeTranscriptApi

sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import DATA_DIR, YOUTUBE_API_KEY, YOUTUBE_CHANNEL_ID
from classify import classify_content

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger(__name__)

OUT_DIR = DATA_DIR / "youtube"
OUT_DIR.mkdir(parents=True, exist_ok=True)

YT_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YT_VIDEO_URL = "https://www.googleapis.com/youtube/v3/videos"


def _list_channel_videos() -> list[dict]:
    """List all video IDs + titles from the channel using YouTube Data API v3."""
    videos: list[dict] = []
    page_token = None

    while True:
        params = {
            "key": YOUTUBE_API_KEY,
            "channelId": YOUTUBE_CHANNEL_ID,
            "part": "snippet",
            "type": "video",
            "order": "date",
            "maxResults": 50,
        }
        if page_token:
            params["pageToken"] = page_token

        resp = requests.get(YT_SEARCH_URL, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()

        for item in data.get("items", []):
            vid = item["id"].get("videoId")
            if vid:
                videos.append({
                    "video_id": vid,
                    "title": item["snippet"]["title"],
                    "description": item["snippet"].get("description", ""),
                    "published_at": item["snippet"].get("publishedAt", ""),
                })

        page_token = data.get("nextPageToken")
        if not page_token:
            break

    return videos


def _get_transcript(video_id: str, retries: int = 3, delay: float = 5.0) -> str | None:
    """Fetch transcript text for a video. Returns None if unavailable."""
    import time
    for attempt in range(1, retries + 1):
        try:
            entries = YouTubeTranscriptApi.get_transcript(video_id, languages=["en", "hi"])
            return " ".join(e["text"] for e in entries)
        except Exception as exc:
            msg = str(exc)
            if "429" in msg or "Too Many Requests" in msg:
                if attempt < retries:
                    log.info("Rate limited on %s, waiting %.0fs (attempt %d/%d)...", video_id, delay, attempt, retries)
                    time.sleep(delay)
                    delay *= 2  # exponential backoff
                    continue
            log.warning("No transcript for %s: %s", video_id, exc)
            return None
    return None




def fetch_all() -> list[dict]:
    videos = _list_channel_videos()
    log.info("Found %d videos on channel.", len(videos))

    results: list[dict] = []
    for i, v in enumerate(videos):
        if i > 0:
            import time; time.sleep(2)  # 2s between videos to avoid rate limits
        log.info("Fetching transcript: %s", v["title"])
        transcript = _get_transcript(v["video_id"])

        # Use transcript if available; fall back to title + description
        content = transcript if transcript else ""
        classify_text = f"{v['description']} {content}".strip() or v["title"]

        results.append({
            "source": "youtube",
            "video_id": v["video_id"],
            "url": f"https://www.youtube.com/watch?v={v['video_id']}",
            "title": v["title"],
            "description": v["description"],
            "published_at": v["published_at"],
            "transcript": content,
            "has_transcript": bool(transcript),
            "category": classify_content(v["title"], classify_text),
        })
        if not transcript:
            log.info("  No transcript — saved title+description only.")

    return results


def save(videos: list[dict]) -> None:
    for v in videos:
        out_path = OUT_DIR / f"{v['video_id']}.json"
        out_path.write_text(json.dumps(v, indent=2, ensure_ascii=False))
    log.info("Saved %d video transcripts.", len(videos))


if __name__ == "__main__":
    if not YOUTUBE_API_KEY or not YOUTUBE_CHANNEL_ID:
        log.error("Set YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID in .env")
        sys.exit(1)
    videos = fetch_all()
    save(videos)
    log.info("Done — %d transcripts saved.", len(videos))
