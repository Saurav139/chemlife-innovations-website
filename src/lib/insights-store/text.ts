// Text helpers for turning posts from YouTube, WordPress, Instagram and LinkedIn into Insights cards.

/** The first two sentences of a description, without timestamps, links, handles and emoji, at most 180 characters. */
export function summarizeDescription(text: string): string {
  if (!text) return "";

  // Cut off long metadata headers, timestamps, social handles, or footers
  const cutoffIndex = text.search(/(⏱️|TIMESTAMPS|\b\d{2}:\d{2}\b|🔗|🌐|📧|📞|🔔|👍|📲)/i);
  let cleaned = cutoffIndex !== -1 ? text.substring(0, cutoffIndex) : text;

  // Standardize line breaks to periods so they split cleanly into sentences
  cleaned = cleaned
    .replace(/\r?\n/g, ". ")
    .replace(/\s*(?:--|—|–)\s*/g, " - ") // Normalize em-dashes and double dashes to single dash
    .replace(/\s+/g, " ")                // Collapse consecutive spaces
    .replace(/\.+/g, ".")                // Clean up duplicate periods
    .trim();

  // Remove emojis
  cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, "");

  // Extract the first 2 sentences
  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  let summary = "";
  if (sentences.length > 0) {
    summary = sentences[0] || "";
    if (sentences[1]) {
      summary += " " + sentences[1];
    }
  } else {
    summary = cleaned;
  }

  // A line ending in "?" or "!" doesn't need the period added for its line break
  summary = summary.replace(/([!?])\./g, "$1").trim();

  // Strip trailing period if duplicate, ensure clean structure
  if (summary.endsWith(".") && summary.endsWith("..")) {
    summary = summary.replace(/\.+$/, ".");
  }

  // Capped length safety limit
  if (summary.length > 180) {
    summary = summary.substring(0, 177) + "...";
  }

  return summary;
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", ndash: "–", mdash: "—", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“" };

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : match;
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

/** Article HTML as plain text: one paragraph per block, for the Insights reader (which keeps line breaks). */
export function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<(script|style|figure|figcaption)[\s\S]*?<\/\1>/gi, "")
      .replace(/<li[^>]*>/gi, "\n• ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|h[1-6]|li|ul|ol|blockquote|div)>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/[ \t ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** At most `max` characters, cut at a word with "…" when it's longer. */
export function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:–—-]+$/, "")}…`;
}

const letters = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

/** Whether a summary was cut from the start of the article itself, like WordPress's automatic excerpts (which run
 *  headings into the next sentence: "IntroductionAccess to…"), rather than written for it. */
export function isFromArticle(summary: string, article: string): boolean {
  const start = letters(summary.replace(/(…|\[…\]|\.\.\.)\s*$/, ""));
  return start.length >= 20 && letters(article).startsWith(start);
}

/** A summary from an article's text (one paragraph per line, as htmlToText gives it): from its first paragraph,
 *  without the headings above it or a leading "Introduction:" label, at most `max` characters. */
export function articleSummary(text: string, max = 220): string {
  const paragraphs = text.split(/\n+/).map((p) => p.replace(/^•\s*/, "").trim()).filter(Boolean);
  // A heading is a short line that doesn't end like a sentence ("Introduction", "Why feed hygiene matters").
  while (paragraphs.length > 1 && paragraphs[0].length <= 80 && !/[.!?…]["”’)]?$/.test(paragraphs[0])) paragraphs.shift();
  const start = paragraphs.join(" ").replace(/^(introduction|overview|summary|abstract)\s*[:.–—-]\s*/i, "");
  return clip(start.replace(/\s+/g, " ").trim(), max);
}

const CLOSING_QUOTE: Record<string, string> = { "“": "”", "„": "“", '"': '"', "‘": "’", "'": "'", "«": "»" };

/** A title without quote marks around all of it, or around its first part before a colon: “Harmony in Nutrition”
 *  becomes Harmony in Nutrition, and “Resilience Amidst Adversity”: Marking Doctor's Day loses its quotes too. */
export function cleanTitle(title: string): string {
  const t = title.trim();
  const close = CLOSING_QUOTE[t[0]];
  const end = close ? t.indexOf(close, 1) : -1;
  if (end === t.length - 1) return t.slice(1, -1).trim();
  if (end > 0 && t[end + 1] === ":") return `${t.slice(1, end)}${t.slice(end + 1)}`.trim();
  return t;
}

/** "6 min read" for an article of this many words (about 200 words a minute). */
export function readingTime(text: string): string {
  const words = text.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

/** A short title from the start of a social post's caption: its first line, without hashtags, at most 90 characters. */
export function titleFromCaption(caption: string, fallback: string): string {
  const line = (caption.split(/\r?\n/).find((l) => l.replace(/#\S+/g, "").trim()) ?? "")
    .replace(/#\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!line) return fallback;
  return line.length > 90 ? line.slice(0, 87).trimEnd() + "…" : line;
}

/** "July 15, 2026", the date format the Insights page shows and sorts by. */
export function displayDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/** A post address without tracking parameters or a trailing slash, so the same post always matches itself. */
export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    u.search = "";
    u.hostname = u.hostname.toLowerCase();
    return u.toString().replace(/\/+$/, "");
  } catch {
    return url.trim();
  }
}

/** Instagram's shortcode stays the same across API, feed and manually pasted post addresses. */
export function instagramPostId(address: string): string | null {
  try {
    const url = new URL(address);
    if (!/^https?:$/.test(url.protocol) || !/^(?:www\.)?instagram\.com$/i.test(url.hostname)) return null;
    return url.pathname.match(/^\/(?:p|reel|tv)\/([\w-]+)\/?$/)?.[1] ?? null;
  } catch {
    return null;
  }
}

/** A LinkedIn post's activity number, from a /posts/… or /feed/update/urn:li:activity:… address. */
export function linkedinActivityId(url: string): string | null {
  return url.match(/activity[-:](\d{19})/)?.[1] ?? null;
}

/** When a LinkedIn post was published: its activity number starts with the time in milliseconds. */
export function linkedinActivityDate(id: string): Date {
  return new Date(Number(BigInt(id) >> BigInt(22)));
}
