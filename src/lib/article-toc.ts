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

/** A heading as the list shows it. */
export interface TocEntry extends ArticleHeading {
  /** Short enough for a narrow list: "1. Feed Formulation Optimization: Getting More Value" → "1. Feed Formulation Optimization". */
  label: string;
}

const compare = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function shortLabel(text: string): string {
  const [topic, ...rest] = text.split(/[:–—]\s/);
  const short = rest.length && topic.trim().split(/\s+/).length >= 2 ? topic.trim() : text;
  return short.length > 64 ? `${short.slice(0, 61).trimEnd()}…` : short;
}

/** The headings worth listing: the article's own title (WordPress posts often repeat it as a heading) is left out,
 *  and when the article has enough main headings (h2), the sub-headings under them are left out too, so the list
 *  stays short. Articles written with bold lines only have h3s, which are listed instead. */
export function tocEntries(headings: ArticleHeading[], title: string): TocEntry[] {
  const own = compare(title);
  const kept = headings.filter((heading) => compare(heading.text) !== own);
  const main = kept.filter((heading) => heading.level === 2);
  const listed = main.length >= MIN_HEADINGS ? main : kept;
  if (listed.length < MIN_HEADINGS) return [];
  return listed.map((heading) => ({ ...heading, level: main.length >= MIN_HEADINGS ? 2 : heading.level, label: shortLabel(heading.text) }));
}
