import { readFile } from "node:fs/promises";
import path from "node:path";
import { PRODUCTS, RESEARCH_TOPICS } from "@/lib/catalog";
import { RESEARCH_PAGES } from "../research/pages";

// The second design of the research platform pages reads the same content as the first: each platform's fragment
// in src/previews/research/<slug>.html. This pulls the copy and the animated figure out of a fragment so the page
// can lay them out its own way. The text fields are trusted HTML from the repository (they carry entities).
export type Platform = {
  slug: string;
  number: number;
  short: string;
  image: string;
  kicker: string;
  title: string;
  sub: string;
  lede: string;
  /** The icon symbols the figure and lists refer to, and the animated figure itself. */
  symbols: string;
  figure: string;
  howIntro: string;
  steps: { title: string; text: string }[];
  benefits: { icon: string; title: string; text: string }[];
  facts: { label: string; value: string }[];
  factsSource: string;
  products: { href: string; need: string; name: string; desc: string; image?: string }[];
  rangeNote: string;
  support: string;
  ctaText: string;
};

const one = (html: string, re: RegExp) => html.match(re)?.[1]?.trim() ?? "";
const all = (html: string, re: RegExp) => Array.from(html.matchAll(re));
const plain = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&");

export async function loadPlatform(slug: string): Promise<Platform | null> {
  const index = RESEARCH_PAGES.findIndex((p) => p.slug === slug);
  if (index < 0) return null;
  const page = RESEARCH_PAGES[index];
  const html = await readFile(path.join(process.cwd(), "src/previews/research", `${page.slug}.html`), "utf8");

  return {
    slug: page.slug,
    number: index + 1,
    short: one(html, /aria-current="page">(.*?)</),
    image: RESEARCH_TOPICS.find((t) => t.id === page.topicId)?.banner ?? "",
    kicker: one(html, /<span class="kicker">(.*?)<\/span>/),
    title: one(html, /<h1 id="page-title">(.*?)<\/h1>/),
    sub: one(html, /<p class="r-sub">(.*?)<\/p>/),
    lede: one(html, /<p class="r-lede">([\s\S]*?)<\/p>/),
    symbols: html.match(/<svg width="0"[\s\S]*?<\/svg>/)?.[0] ?? "",
    figure: html.match(/<figure class="plate"[\s\S]*?<\/figure>/)?.[0] ?? "",
    howIntro: one(html, /id="how-title">.*?<\/h2>\s*<p>([\s\S]*?)<\/p>/),
    steps: all(html, /<li><span class="how-num">.*?<\/span>\d+<\/span><h3>(.*?)<\/h3><p>([\s\S]*?)<\/p><\/li>/g).map(
      (m) => ({ title: m[1], text: m[2] })
    ),
    benefits: all(
      html,
      /<li><svg aria-hidden="true"><use href="#(i-[\w-]+)"\/><\/svg><div><strong>(.*?)<\/strong><p>([\s\S]*?)<\/p><\/div><\/li>/g
    ).map((m) => ({ icon: m[1], title: m[2], text: m[3] })),
    facts: all(html, /<div><dt>(.*?)<\/dt><dd>([\s\S]*?)<\/dd><\/div>/g).map((m) => ({ label: m[1], value: m[2] })),
    factsSource: one(html, /<p class="record-src">([\s\S]*?)<\/p>/),
    products: all(
      html,
      /<a href="([^"]+)" data-group="[^"]*"><span class="tile-need">(.*?)<\/span><span class="tile-name">(.*?)<\/span><span class="tile-desc">(.*?)<\/span>/g
    ).map((m) => ({
      href: m[1],
      need: m[2],
      name: m[3],
      desc: m[4],
      image: PRODUCTS.find((p) => p.name.startsWith(plain(m[3])))?.banner,
    })),
    rangeNote: one(html, /<div class="range-note">[\s\S]*?<p>([\s\S]*?)<\/p>/),
    support: html.match(/<section class="support-card"[\s\S]*?<\/section>/)?.[0] ?? "",
    ctaText: one(html, /<p style="margin-top:1rem">([\s\S]*?)<\/p>/),
  };
}

export async function loadPlatforms(): Promise<Platform[]> {
  const pages = await Promise.all(RESEARCH_PAGES.map((p) => loadPlatform(p.slug)));
  return pages.filter((p): p is Platform => p !== null);
}
