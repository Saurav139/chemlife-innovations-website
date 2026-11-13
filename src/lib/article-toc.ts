import { decodeEntities } from "./insights-store/text";

// The table of contents of an article's page: its sub-headings (h2 and h3), each given an id so the list can link to
// it. Works on the cleaned-up WordPress HTML from article-html.ts, where headings carry no attributes.

export interface ArticleHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

const HEADING = /<h([23])>([\s\S]*?)<\/h\1>/g;
/** Shorter than this and a list isn't worth showing. */
export const MIN_HEADINGS = 3;

/** "Why feed hygiene matters" → "why-feed-hygiene-matters"; made unique among `used`. */
export function headingId(text: string, used: Set<string>): string {
  const base = text.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-").slice(0, 60).replace(/-$/, "") || "section";
  let id = base;
  for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
  used.add(id);
  return id;
}

/** The HTML with an id on each h2 and h3, and the list of those headings. */
export function withHeadingIds(html: string): { html: string; headings: ArticleHeading[] } {
  const used = new Set<string>();
  const headings: ArticleHeading[] = [];
  const marked = html.replace(HEADING, (whole, level: string, inner: string) => {
    const text = decodeEntities(inner.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
    if (!text) return whole;
    const id = headingId(text, used);
    headings.push({ id, text, level: level === "2" ? 2 : 3 });
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });
  return { html: marked, headings };
}
