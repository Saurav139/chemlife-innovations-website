"""Download PDF fliers from Google Drive and extract text.

Supports both a shared folder (via GOOGLE_DRIVE_FOLDER_ID in .env)
and individual file URLs (listed in DRIVE_FILE_IDS below).

Saves extracted text as JSON into data/fliers/.
"""

from __future__ import annotations

import json
import logging
import re
import sys
import tempfile
from pathlib import Path

import gdown
import pdfplumber

sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import DATA_DIR, GOOGLE_DRIVE_FOLDER_ID
from classify import classify_content

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger(__name__)

OUT_DIR = DATA_DIR / "fliers"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Individual file IDs when no shared folder is available
DRIVE_FILE_IDS = [
    "1jkVnPGnjA2--Itf0SiYr6FPTWP-0tvCr",
    "108okVz2Bt0VFbmQc980_iwmFRt1S9jVL",
    "10ySq-p51YYjWsjMOncWACbA7M5Z1GW5r",
    "18P7PCbvEYegZFizdYGNi7Qc6PZ6-vjR5",
]



def _extract_pdf_text(pdf_path: str) -> str:
    """Extract text from all pages of a PDF."""
    text_parts: list[str] = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n\n".join(text_parts)


def _download_individual_files(tmp_dir: str) -> None:
    """Download individual files by ID using gdown."""
    for file_id in DRIVE_FILE_IDS:
        url = f"https://drive.google.com/uc?id={file_id}"
        log.info("Downloading file %s ...", file_id)
        try:
            gdown.download(url, output=tmp_dir + "/", fuzzy=True, quiet=False)
        except Exception as exc:
            log.warning("Failed to download %s: %s", file_id, exc)


def download_and_extract() -> list[dict]:
    """Download PDFs and extract text."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        if GOOGLE_DRIVE_FOLDER_ID:
            folder_url = f"https://drive.google.com/drive/folders/{GOOGLE_DRIVE_FOLDER_ID}"
            log.info("Downloading PDFs from Google Drive folder...")
            try:
                gdown.download_folder(
                    url=folder_url,
                    output=tmp_dir,
                    quiet=False,
                    remaining_ok=True,
                )
            except Exception as exc:
                log.error("Failed to download folder: %s", exc)
                return []
        else:
            log.info("No folder ID set — downloading individual files...")
            _download_individual_files(tmp_dir)

        results: list[dict] = []
        tmp_path = Path(tmp_dir)

        # Look for PDFs and any other downloaded files
        all_files = sorted(tmp_path.rglob("*"))
        pdf_files = [f for f in all_files if f.is_file() and f.suffix.lower() == ".pdf"]

        if not pdf_files:
            log.warning("No PDF files found. Downloaded files: %s",
                        [f.name for f in all_files if f.is_file()])
            return []

        for pdf_file in pdf_files:
            log.info("Extracting text from: %s", pdf_file.name)
            try:
                text = _extract_pdf_text(str(pdf_file))
            except Exception as exc:
                log.warning("Failed to extract %s: %s", pdf_file.name, exc)
                continue

            if not text.strip():
                log.warning("No text extracted from %s (may be image-based).", pdf_file.name)
                continue

            results.append({
                "source": "flier",
                "filename": pdf_file.name,
                "content": re.sub(r"\s+", " ", text).strip(),
                "category": classify_content(pdf_file.stem, text),
            })

        return results


def save(docs: list[dict]) -> None:
    for doc in docs:
        slug = re.sub(r"[^a-z0-9]+", "_", doc["filename"].lower().replace(".pdf", ""))[:60]
        out_path = OUT_DIR / f"{slug}.json"
        out_path.write_text(json.dumps(doc, indent=2, ensure_ascii=False))
    log.info("Saved %d flier documents.", len(docs))


if __name__ == "__main__":
    if not GOOGLE_DRIVE_FOLDER_ID and not DRIVE_FILE_IDS:
        log.error("Set GOOGLE_DRIVE_FOLDER_ID in .env or add file IDs to DRIVE_FILE_IDS")
        sys.exit(1)
    docs = download_and_extract()
    save(docs)
    log.info("Done — %d PDFs processed.", len(docs))
