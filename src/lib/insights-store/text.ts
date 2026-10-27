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

/** A LinkedIn post's activity number, from a /posts/… or /feed/update/urn:li:activity:… address. */
export function linkedinActivityId(url: string): string | null {
  return url.match(/activity[-:](\d{19})/)?.[1] ?? null;
}

/** When a LinkedIn post was published: its activity number starts with the time in milliseconds. */
export function linkedinActivityDate(id: string): Date {
  return new Date(Number(BigInt(id) >> BigInt(22)));
}
