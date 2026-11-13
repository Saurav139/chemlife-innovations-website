import { decodeEntities } from "./insights-store/text";

// A blog article's own formatting (sub-headings, bold text, lists, tables, pictures), made safe to show on the
// article's page: only the tags below are kept, and every attribute is written here rather than copied.

const UPLOADS = "https://chemlifeinnovations.wordpress.com/wp-content/uploads/";
/** Widths WordPress resizes a picture to (?w=), for the browser to pick from. The text column is 768px wide. */
const IMAGE_WIDTHS = [480, 800, 1200, 1600];
const IMAGE_SIZES = "(min-width: 816px) 768px, calc(100vw - 48px)";

const KEPT = new Set(["p", "h2", "h3", "h4", "ul", "ol", "li", "strong", "em", "a", "img", "figure", "figcaption", "blockquote", "cite", "table", "thead", "tbody", "tr", "th", "td", "br", "hr", "sub", "sup"]);
// The page's own title is the h1, so an article's h1 becomes a section heading.
const RENAMED: Record<string, string> = { h1: "h2", h5: "h4", h6: "h4", b: "strong", i: "em" };
const VOID = new Set(["br", "hr", "img"]);
/** Left out along with everything inside them. */
const REMOVED = new Set(["script", "style", "iframe", "noscript", "svg", "math", "form", "object", "embed", "video", "audio", "button", "select", "textarea", "template"]);

const TOKEN = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:"[^"]*"|'[^']*'|[^'">])*)>|[^<]+|</g;
const ATTRIBUTE = /([a-zA-Z_:][\w:.-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function attributes(source: string): Record<string, string> {
  const found: Record<string, string> = {};
  for (const match of source.matchAll(ATTRIBUTE)) found[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? "").trim();
  return found;
}

/** A picture's address without its size: only pictures uploaded to the blog are shown. */
export function uploadedImage(src?: string): string | null {
  const base = (src ?? "").split("?")[0];
  return base.startsWith(UPLOADS) && /^[\w\-./%~:]+$/.test(base) ? base : null;
}

function image(attrs: Record<string, string>, first: boolean, skip: Set<string>): string {
  const base = uploadedImage(attrs.src);
  if (!base || skip.has(base)) return "";
  skip.add(base); // each picture once
  const size = /^\d+$/.test(attrs.width ?? "") && /^\d+$/.test(attrs.height ?? "") ? ` width="${attrs.width}" height="${attrs.height}"` : "";
  const srcset = IMAGE_WIDTHS.map((width) => `${base}?w=${width} ${width}w`).join(", ");
  // The opening picture is the page's main one, so it loads first; the rest load as they're scrolled to.
  const loading = first ? ' fetchpriority="high"' : ' loading="lazy"';
  return `<img src="${base}?w=1200" srcset="${srcset}" sizes="${IMAGE_SIZES}" alt="${escape(attrs.alt ?? "")}"${size}${loading} decoding="async">`;
}

function link(attrs: Record<string, string>): string | null {
  const href = attrs.href ?? "";
  if (!/^(https?:\/\/|mailto:)/i.test(href)) return null;
  return `<a href="${escape(href)}" target="_blank" rel="noopener noreferrer">`;
}

export interface ArticleHtml {
  html: string;
  /** The article opens with its own picture, so the page doesn't add one above it. */
  startsWithImage: boolean;
}

/** WordPress's HTML for an article, cleaned up for the article page. `skipImage` is a picture the page already shows
 *  above the text. */
export function sanitizeArticleHtml(source: string, skipImage?: string): ArticleHtml {
  const skip = new Set<string>(uploadedImage(skipImage) ? [uploadedImage(skipImage)!] : []);
  const open: { name: string; shown: boolean }[] = [];
  let html = "";
  let removing: string | null = null;
  let removingDepth = 0;
  let hasText = false;
  let startsWithImage = false;

  for (const token of source.matchAll(TOKEN)) {
    const [whole, closing, rawName, rawAttributes] = token;
    if (whole.startsWith("<!--")) continue;
    const tag = rawName?.toLowerCase();

    if (removing) {
      if (tag === removing) removingDepth += closing ? -1 : 1;
      if (removingDepth === 0) removing = null;
      continue;
    }
    if (!tag) {
      // Text. A stray "<" is shown as one.
      if (whole.replace(/&nbsp;|&#160;/g, "").trim()) hasText = true;
      html += whole.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      continue;
    }
    if (REMOVED.has(tag)) {
      if (!closing && !/\/\s*$/.test(rawAttributes)) { removing = tag; removingDepth = 1; }
      continue;
    }

    const name = RENAMED[tag] ?? tag;
    if (!KEPT.has(name)) continue; // div, span and the like: their text stays
    if (closing) {
      const at = open.map((entry) => entry.name).lastIndexOf(name);
      if (at < 0) continue;
      for (const entry of open.splice(at).reverse()) if (entry.shown) html += `</${entry.name}>`;
      continue;
    }
    if (name === "img") {
      const leading = !hasText && !html.includes("<img");
      const picture = image(attributes(rawAttributes), leading, skip);
      if (picture && leading) startsWithImage = true;
      html += picture;
    } else if (VOID.has(name)) {
      html += `<${name}>`;
    } else if (name === "a") {
      const anchor = link(attributes(rawAttributes));
      html += anchor ?? "";
      open.push({ name, shown: anchor !== null });
    } else {
      html += `<${name}>`;
      open.push({ name, shown: true });
    }
  }
  for (const entry of open.reverse()) if (entry.shown) html += `</${entry.name}>`;

  return {
    html: html
      // A picture that isn't shown takes its frame and caption with it; empty paragraphs go too.
      .replace(/<figure>\s*(?:<figcaption>(?:(?!<\/figcaption>)[\s\S])*<\/figcaption>\s*)?<\/figure>/g, "")
      .replace(/<p>(?:\s|&nbsp;|&#160;|<br>)*<\/p>/g, "")
      // Many articles write a sub-heading as a bold line of its own: a short one that doesn't end like a sentence
      // becomes a real heading. Bold inside a heading is dropped (headings are bold already).
      .replace(/<p>\s*<strong>([^<]{1,80})<\/strong>\s*<\/p>/g, (whole, line: string) => (/[.!…:;,]["”’)]?\s*$/.test(decodeEntities(line)) ? whole : `<h3>${line.trim()}</h3>`))
      .replace(/<(h[234])>\s*<strong>((?:(?!<\/?strong>)[\s\S])*)<\/strong>\s*<\/\1>/g, "<$1>$2</$1>")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
    startsWithImage,
  };
}
