// Blog articles get their own page on this site, /insights/<slug>, so they're read (and found by search engines) here
// rather than on WordPress. The slug is the last part of the article's WordPress address, so it never changes.

const WORDPRESS_UPLOADS = "https://chemlifeinnovations.wordpress.com/wp-content/uploads/";

/** The article's slug, from its WordPress address; null for anything that isn't a WordPress article. */
export function articleSlug(linkUrl?: string): string | null {
  let url: URL;
  try { url = new URL(linkUrl ?? ""); } catch { return null; }
  if (!url.hostname.endsWith("wordpress.com")) return null;
  const slug = url.pathname.split("/").filter(Boolean).pop()?.toLowerCase();
  return slug && /^[a-z0-9-]+$/.test(slug) ? slug : null;
}

/** The article's page on this site, or null when the post has none (LinkedIn, Instagram, other links). */
export function articlePath(item: { type: string; linkUrl?: string }): string | null {
  const slug = item.type === "Blog" ? articleSlug(item.linkUrl) : null;
  return slug ? `/insights/${slug}` : null;
}

/** Pictures next.config.ts lets the image optimizer fetch: this site's own and WordPress uploads. */
export const isOptimizableImage = (src: string) => src.startsWith("/") || src.startsWith(WORDPRESS_UPLOADS);

export type ArticleBlock = { kind: "heading" | "paragraph"; text: string } | { kind: "list"; items: string[] };

// List items: the importer's "•", and the ticks and dashes the articles use for lists.
const LIST_MARK = /^[•✔✓✅▪●◦–-]️?\s+/;

/** The article's text, as the importer stored it (one paragraph per line, list items starting with "•"), split into
 *  headings, paragraphs and lists. A heading is a short line that doesn't end like a sentence (a question may be one). */
export function articleBlocks(content: string): ArticleBlock[] {
  const blocks: ArticleBlock[] = [];
  for (const raw of content.split(/\n+/)) {
    const line = raw.trim();
    if (!line) continue;
    if (LIST_MARK.test(line)) {
      const item = line.replace(LIST_MARK, "");
      const last = blocks[blocks.length - 1];
      if (last?.kind === "list") last.items.push(item);
      else blocks.push({ kind: "list", items: [item] });
    } else if (line.length <= 80 && !/[.!…:;,]["”’)]?$/.test(line)) {
      blocks.push({ kind: "heading", text: line });
    } else {
      blocks.push({ kind: "paragraph", text: line });
    }
  }
  return blocks;
}

/** "September 28, 2025" → "2025-09-28", for search engines; undefined if the date can't be read. */
export function isoDate(displayDate: string): string | undefined {
  const date = new Date(displayDate);
  if (Number.isNaN(date.getTime())) return undefined;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
