"""Download audio from YouTube videos and transcribe with OpenAI Whisper API.

Updates existing data/youtube/*.json files that have no transcript.

Usage:
    python scripts/transcribe_youtube.py            # transcribe all missing
    python scripts/transcribe_youtube.py --all      # re-transcribe everything
    python scripts/transcribe_youtube.py --dry-run  # show what would be processed
"""

from __future__ import annotations

import argparse
import json
import logging
import subprocess
import sys
import tempfile
import time
from pathlib import Path

import requests

sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import DATA_DIR, OPENAI_API_KEY

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger(__name__)

YOUTUBE_DIR = DATA_DIR / "youtube"
WHISPER_URL = "https://api.openai.com/v1/audio/transcriptions"


def load_videos(force_all: bool = False) -> list[dict]:
    """Load YouTube JSON files that need transcription."""
    videos = []
    for f in sorted(YOUTUBE_DIR.glob("*.json")):
        data = json.loads(f.read_text())
        if force_all or not data.get("has_transcript"):
            videos.append({"path": f, "data": data})
    return videos


def download_audio(video_id: str, out_dir: Path) -> Path | None:
    """Download audio-only stream using yt-dlp. Returns path to audio file."""
    out_template = str(out_dir / f"{video_id}.%(ext)s")
    cmd = [
        sys.executable, "-m", "yt_dlp",
        "--quiet",
        "--no-warnings",
        "--cookies-from-browser", "chrome",  # use Chrome cookies to bypass 403
        "--extract-audio",
        "--audio-format", "mp3",
        "--audio-quality", "5",          # ~128kbps — enough for speech
        "--output", out_template,
        f"https://www.youtube.com/watch?v={video_id}",
    ]
    try:
        subprocess.run(cmd, check=True, timeout=120)
    except subprocess.CalledProcessError as e:
        log.warning("yt-dlp failed for %s: %s", video_id, e)
        return None
    except subprocess.TimeoutExpired:
        log.warning("yt-dlp timed out for %s", video_id)
        return None

    matches = list(out_dir.glob(f"{video_id}.*"))
    return matches[0] if matches else None


def transcribe_audio(audio_path: Path, title: str) -> str | None:
    """Send audio to OpenAI Whisper API and return transcript text."""
    with audio_path.open("rb") as f:
        resp = requests.post(
            WHISPER_URL,
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            files={"file": (audio_path.name, f, "audio/mpeg")},
            data={
                "model": "whisper-1",
                "prompt": f"This is a video about animal feed additives, poultry, and dairy farming. Title: {title}",
                "response_format": "text",
            },
            timeout=120,
        )
    if resp.status_code != 200:
        log.warning("Whisper API error %d: %s", resp.status_code, resp.text[:200])
        return None
    return resp.text.strip()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--all", action="store_true", help="Re-transcribe all videos")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be processed")
    args = parser.parse_args()

    if not OPENAI_API_KEY:
        log.error("OPENAI_API_KEY not set in .env")
        sys.exit(1)

    videos = load_videos(force_all=args.all)
    log.info("Found %d video(s) to transcribe.", len(videos))

    if args.dry_run:
        for v in videos:
            log.info("  Would transcribe: %s — %s", v["data"]["video_id"], v["data"]["title"])
        return

    success = 0
    failed = 0

    with tempfile.TemporaryDirectory() as tmp:
        tmp_dir = Path(tmp)
        for i, v in enumerate(videos, 1):
            data = v["data"]
            vid = data["video_id"]
            title = data["title"]
            log.info("[%d/%d] %s", i, len(videos), title)

            audio = download_audio(vid, tmp_dir)
            if not audio:
                log.warning("  Skipping — could not download audio.")
                failed += 1
                continue

            transcript = transcribe_audio(audio, title)
            audio.unlink(missing_ok=True)  # clean up immediately

            if not transcript:
                log.warning("  Skipping — transcription failed.")
                failed += 1
                continue

            # Update the JSON file
            data["transcript"] = transcript
            data["has_transcript"] = True
            v["path"].write_text(json.dumps(data, indent=2, ensure_ascii=False))
            log.info("  Saved transcript (%d chars).", len(transcript))
            success += 1

            # Brief pause to avoid rate limits
            if i < len(videos):
                time.sleep(0.5)

    log.info("Done — %d transcribed, %d failed.", success, failed)


if __name__ == "__main__":
    main()
