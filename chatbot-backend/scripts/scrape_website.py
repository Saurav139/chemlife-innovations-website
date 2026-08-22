"""Scrape product and information pages from chemlifeinnovations.com.

Handles two rendering strategies found on the site:
  - Poultry products: loaded via AJAX from products/<slug>.php
  - Ruminant products: server-rendered with show/hide sections on ruminantss.php
  - Info pages: standard server-rendered HTML

Poultry slugs are discovered dynamically from the productMap in product_model2.php
so the scraper stays correct even if the website adds or renames products.

Saves structured JSON per page into data/website/.
"""

import json
import logging
import re
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

sys.path.insert(0, str(Path(__file__).resolve().parent))
from config import BASE_URL, DATA_DIR, SCRAPE_URLS
from classify import classify_content

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger(__name__)

OUT_DIR = DATA_DIR / "website"
OUT_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; ChemlifeBot/1.0; "
        "+https://chemlifeinnovations.com)"
    )
}

# ── Ruminant section IDs — discovered dynamically at runtime ─────────────────
# (kept as fallback in case the page structure ever changes)
RUMINANT_SECTIONS_FALLBACK = {
    "FertiBioZen": "Smart Fertility Enhancer",
    "MetaBioZen":  "Rumen Ecosystem Enhancer",
    "afla":        "Ultimate Aflatoxin Binder",
    "lacto":       "Milk Yield Enhancer",
    "choli":       "Rumen Bypass Choline",
    "minbio":      "Chelated Trace Minerals",
}


def _discover_poultry_products(session: requests.Session) -> dict[str, dict]:
    """Dynamically extract poultry product slugs and names from product_model2.php.

    Reads the JS productMap (id → slug) and nav links (id → display name),
    combines them into {slug: {name, id}} so we never rely on hardcoded slugs.
    """
    url = f"{BASE_URL}/product_model2.php"
    log.info("Discovering poultry products from %s ...", url)
    try:
        resp = session.get(url, timeout=30)
        resp.raise_for_status()
    except requests.RequestException as exc:
        log.error("Could not fetch product_model2.php: %s", exc)
        return {}

    html = resp.text

    # --- Extract productMap from JS: e.g.  1: 'chemdmold',  (skip commented lines)
    id_to_slug: dict[int, str] = {}
    for m in re.finditer(r"^\s*(\d+):\s*'([^']+)'", html, re.MULTILINE):
        id_to_slug[int(m.group(1))] = m.group(2)

    if not id_to_slug:
        log.warning("productMap not found in page JS — falling back to hardcoded slugs")
        return {}

    log.info("Found productMap: %s", id_to_slug)

    # --- Extract product names from nav links: href="product_model2.php?id=N"
    soup = BeautifulSoup(html, "html.parser")
    id_to_name: dict[int, str] = {}
    for a in soup.find_all("a", href=re.compile(r"product_model2\.php\?id=\d+")):
        m = re.search(r"id=(\d+)", a["href"])
        if m:
            name = _clean(a.get_text())
            if name:
                id_to_name[int(m.group(1))] = name

    log.info("Found product names: %s", id_to_name)

    # --- Combine: slug → {name, id}
    products: dict[str, dict] = {}
    for pid, slug in id_to_slug.items():
        name = id_to_name.get(pid, slug)   # fall back to slug if name not found
        products[slug] = {"name": name, "id": pid}

    return products


def _discover_ruminant_sections(session: requests.Session) -> dict[str, str]:
    """Dynamically extract ruminant section IDs and names from ruminantss.php.

    Reads the JS `const map` (id → sectionId) and nav links (id → display name),
    returns {sectionId: productName}.
    """
    url = f"{BASE_URL}/ruminantss.php"
    log.info("Discovering ruminant sections from %s ...", url)
    try:
        resp = session.get(url, timeout=30)
        resp.raise_for_status()
    except requests.RequestException as exc:
        log.error("Could not fetch ruminantss.php: %s — using fallback", exc)
        return RUMINANT_SECTIONS_FALLBACK

    html = resp.text

    # --- Extract JS map: e.g.  1: "FertiBioZen",
    id_to_section: dict[int, str] = {}
    for m in re.finditer(r'^\s*(\d+):\s*"([^"]+)"', html, re.MULTILINE):
        id_to_section[int(m.group(1))] = m.group(2)

    if not id_to_section:
        log.warning("Section map not found in ruminantss.php JS — using fallback")
        return RUMINANT_SECTIONS_FALLBACK

    log.info("Found section map: %s", id_to_section)

    # --- Extract product names from nav links: href="ruminantss.php?id=N"
    soup = BeautifulSoup(html, "html.parser")
    id_to_name: dict[int, str] = {}
    for a in soup.find_all("a", href=re.compile(r"ruminantss\.php\?id=\d+")):
        m = re.search(r"id=(\d+)", a["href"])
        if m:
            name = _clean(a.get_text())
            if name:
                id_to_name[int(m.group(1))] = name

    log.info("Found ruminant product names: %s", id_to_name)

    # --- Combine: sectionId → name
    sections: dict[str, str] = {}
    for pid, section_id in id_to_section.items():
        name = id_to_name.get(pid, section_id)  # fall back to section ID if name missing
        sections[section_id] = name

    return sections

# ── Category detection ───────────────────────────────────────────────────────

def _detect_category(url: str, title: str, text: str) -> str:
    """Detect category using URL first (reliable), then LLM for general info pages."""
    url_lower = url.lower()
    if "product_model2" in url_lower or "monogastric" in url_lower:
        return "poultry"
    if "ruminant" in url_lower:
        return "dairy"
    # For general info pages (about, technology, etc.) use LLM
    return classify_content(title, text)


# ── Extraction helpers ───────────────────────────────────────────────────────

def _clean(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _extract_text_from_soup(soup: BeautifulSoup) -> tuple[list[dict], str]:
    """Extract sections and full_text from a BeautifulSoup tree."""
    # Remove nav, footer, script, style
    for tag in soup.find_all(["nav", "footer", "script", "style", "noscript"]):
        tag.decompose()

    main = soup.find("main") or soup.find("div", class_=re.compile(r"content|main"))
    body = main or soup.body or soup

    sections: list[dict] = []
    current_heading = ""
    current_text: list[str] = []

    for el in body.descendants:
        if el.name in ("h1", "h2", "h3", "h4", "h5"):
            if current_text:
                sections.append({
                    "heading": current_heading,
                    "text": _clean(" ".join(current_text)),
                })
            current_heading = _clean(el.get_text())
            current_text = []
        elif el.name in ("p", "li", "td", "span", "div"):
            txt = _clean(el.get_text())
            if txt and len(txt) > 10:
                current_text.append(txt)

    if current_text:
        sections.append({
            "heading": current_heading,
            "text": _clean(" ".join(current_text)),
        })

    full_text = " ".join(s["text"] for s in sections)
    return sections, full_text


def _extract_page(url: str, html: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    title = soup.title.string.strip() if soup.title and soup.title.string else ""
    sections, full_text = _extract_text_from_soup(soup)
    return {
        "url": url,
        "title": title,
        "category": _detect_category(url, title, full_text),
        "sections": sections,
        "full_text": full_text,
    }


# ── Scrape poultry product AJAX pages ────────────────────────────────────────

def _scrape_poultry_products(session: requests.Session) -> list[dict]:
    """Discover poultry slugs dynamically then fetch each AJAX endpoint."""
    products = _discover_poultry_products(session)
    if not products:
        log.error("No poultry products discovered — skipping poultry scrape.")
        return []

    pages: list[dict] = []
    for slug, info in products.items():
        url = f"{BASE_URL}/products/{slug}.php"
        log.info("Fetching poultry product: %s → %s", info["name"], url)
        try:
            resp = session.get(url, timeout=30)
            resp.raise_for_status()
        except requests.RequestException as exc:
            log.warning("  Failed (%s): %s", url, exc)
            continue

        soup = BeautifulSoup(resp.text, "html.parser")
        sections, full_text = _extract_text_from_soup(soup)

        if len(full_text) < 30:
            log.warning("  Very little content for %s (%d chars)", info["name"], len(full_text))

        pages.append({
            "url": url,
            "title": info["name"],
            "category": "poultry",
            "sections": sections,
            "full_text": full_text,
        })
        time.sleep(0.5)

    return pages


# ── Extract ruminant product sections from single page ───────────────────────

def _scrape_ruminant_products(session: requests.Session) -> list[dict]:
    """Parse ruminant product sections from ruminantss.php."""
    sections = _discover_ruminant_sections(session)

    url = f"{BASE_URL}/ruminantss.php"
    log.info("Fetching ruminant page: %s", url)
    try:
        resp = session.get(url, timeout=30)
        resp.raise_for_status()
    except requests.RequestException as exc:
        log.warning("Failed to fetch ruminant page: %s", exc)
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    pages: list[dict] = []

    for section_id, product_name in sections.items():
        section_el = soup.find(id=section_id)
        if not section_el:
            log.warning("  Section #%s not found for %s", section_id, product_name)
            continue

        section_soup = BeautifulSoup(str(section_el), "html.parser")
        sections, full_text = _extract_text_from_soup(section_soup)

        if len(full_text) < 30:
            log.warning("  Very little content for %s (%d chars)", product_name, len(full_text))

        pages.append({
            "url": f"{url}?id={list(RUMINANT_SECTIONS.keys()).index(section_id) + 1}",
            "title": product_name,
            "category": "dairy",
            "sections": sections,
            "full_text": full_text,
        })

    return pages


# ── Main ─────────────────────────────────────────────────────────────────────

def scrape_all() -> list[dict]:
    session = requests.Session()
    session.headers.update(HEADERS)
    all_pages: list[dict] = []

    # 1. Scrape info pages (technology, about, concept_theme)
    info_urls = [u for u in SCRAPE_URLS if "product_model2" not in u and "ruminant" not in u]
    for url in info_urls:
        log.info("Scraping info page: %s", url)
        try:
            resp = session.get(url, timeout=30)
            resp.raise_for_status()
        except requests.RequestException as exc:
            log.warning("Failed to fetch %s: %s", url, exc)
            continue
        all_pages.append(_extract_page(url, resp.text))
        time.sleep(0.5)

    # 2. Scrape poultry products (AJAX endpoints)
    all_pages.extend(_scrape_poultry_products(session))

    # 3. Scrape ruminant products (section-based)
    all_pages.extend(_scrape_ruminant_products(session))

    return all_pages


def save(pages: list[dict]) -> None:
    for i, page in enumerate(pages):
        slug = re.sub(r"[^a-z0-9]+", "_", page.get("title", "").lower())[:60]
        if not slug or slug == "_":
            slug = (
                urlparse(page["url"]).path.strip("/").replace("/", "_").replace(".php", "")
                or f"page_{i}"
            )
        out_path = OUT_DIR / f"{slug}.json"
        out_path.write_text(json.dumps(page, indent=2, ensure_ascii=False))
        log.info("Saved %s — %s (%d sections, %d chars)",
                 out_path.name, page.get("title", ""), len(page["sections"]), len(page["full_text"]))


if __name__ == "__main__":
    pages = scrape_all()
    save(pages)
    log.info("Done — scraped %d pages total.", len(pages))
