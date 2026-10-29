import { cleanTitle, decodeEntities, htmlToText, linkedinActivityDate, linkedinActivityId, normalizeUrl, summarizeDescription, titleFromCaption } from "./text";
import type { SourceItem } from "./types";

// ChemLife's LinkedIn posts from a feed (LINKEDIN_FEED_URL): a service such as RSS.app turns the public company page
// into an RSS, Atom or JSON feed, and each check reads it. LinkedIn's own API only opens to approved apps. New posts
// wait in the inbox like any other; nothing goes on the Insights page until the moderator adds it.

/** Only the newest posts of the feed are looked at, so a first check doesn't import its whole history. */
const NEWEST = 20;

interface FeedEntry {
  link: string;
  title: string;
  html: string;
  image?: string;
  date?: Date;
}

// ---------- Reading a feed ----------

const unwrap = (raw: string) => {
  const cdata = raw.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  return cdata ? cdata[1] : decodeEntities(raw);
};

/** The text of the first <name>…</name> in a block. Namespaced names (content:encoded) work too. */
function field(block: string, name: string): string {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return match ? unwrap(match[1]).trim() : "";
}

function attribute(tag: string, name: string): string {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"));
  return decodeEntities(match?.[1] ?? match?.[2] ?? "").trim();
}

const asDate = (value: unknown): Date | undefined => {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const date = new Date(value.trim());
  return Number.isNaN(date.getTime()) ? undefined : date;
};

function xmlEntries(body: string): FeedEntry[] {
  return [...body.matchAll(/<(item|entry)\b[\s\S]*?<\/\1>/gi)].map(([block]) => {
    const tags = [...block.matchAll(/<link\b[^>]*>/gi)].map(([tag]) => tag);
    const alternate = tags.find((tag) => attribute(tag, "href") && (!attribute(tag, "rel") || attribute(tag, "rel") === "alternate"));
    const guid = field(block, "guid");
    const text = field(block, "link");
    const link = (alternate && attribute(alternate, "href")) || (/^https?:\/\//i.test(text) ? text : "") || (/^https?:\/\//i.test(guid) ? guid : "");

    // The longest of the fields that can hold the post's text.
    const html = ["content:encoded", "content", "description", "summary"].map((name) => field(block, name)).sort((a, b) => b.length - a.length)[0] ?? "";

    const media = [...block.matchAll(/<(?:media:content|media:thumbnail|enclosure)\b[^>]*>/gi)]
      .map(([tag]) => tag)
      .find((tag) => attribute(tag, "url") && !/video|audio/i.test(`${attribute(tag, "type")} ${attribute(tag, "medium")}`));
    const image = (media && attribute(media, "url")) || html.match(/<img\b[^>]*\bsrc\s*=\s*"([^"]+)"/i)?.[1];

    const date = asDate(field(block, "pubDate")) ?? asDate(field(block, "published")) ?? asDate(field(block, "dc:date")) ?? asDate(field(block, "updated"));
    return { link, title: field(block, "title"), html, image: image ? decodeEntities(image) : undefined, date };
  });
}

function jsonEntries(body: string): FeedEntry[] {
  const feed = JSON.parse(body) as { items?: Record<string, unknown>[] };
  const text = (value: unknown) => (typeof value === "string" ? value : "");
  return (feed.items ?? []).map((item) => {
    const attachments = Array.isArray(item.attachments) ? (item.attachments as Record<string, unknown>[]) : [];
    const attached = attachments.find((a) => text(a.mime_type).startsWith("image/"));
    return {
      link: text(item.url) || text(item.external_url),
      title: text(item.title),
      html: text(item.content_html) || text(item.content_text) || text(item.summary),
      image: text(item.image) || text(item.banner_image) || text(attached?.url) || undefined,
      date: asDate(item.date_published) ?? asDate(item.date_modified),
    };
  });
}

/** The entries of an RSS, Atom or JSON feed. Throws when the text is none of those. */
export function parseFeed(body: string): FeedEntry[] {
  const start = body.trimStart();
  if (start.startsWith("{")) return jsonEntries(body);
  if (/<(rss|feed|rdf:RDF)\b/i.test(start.slice(0, 2000))) return xmlEntries(body);
  throw new Error("The feed address doesn't give an RSS, Atom or JSON feed.");
}

// ---------- From a feed entry to a post ----------

const LINKEDIN_POST = /https?:\/\/(?:[\w-]+\.)?linkedin\.com\/(?:posts|feed\/update|pulse)\/[^\s"'<>)\]]+/i;

/** One feed entry as an inbox post, or null when it has no address to link to. */
export function feedItem(entry: FeedEntry): SourceItem | null {
  // The post's own LinkedIn address, even when the feed links through its own page.
  const own = /^https?:\/\/(?:[\w-]+\.)?linkedin\.com\//i.test(entry.link) ? entry.link : entry.html.match(LINKEDIN_POST)?.[0] ?? entry.link;
  if (!own) return null;
  const url = normalizeUrl(own);
  const text = htmlToText(entry.html) || entry.title;
  if (!text && !entry.title) return null;

  const activity = linkedinActivityId(url);
  // A LinkedIn post's number starts with the time it was published: more exact than the feed's own date.
  const fromNumber = activity ? linkedinActivityDate(activity) : undefined;
  const sensible = (date?: Date) => date && date.getFullYear() >= 2010 && date.getTime() < Date.now() + 86_400_000 ? date : undefined;
  return {
    source: "linkedin",
    externalId: activity ?? url,
    kind: "Blog",
    title: cleanTitle(titleFromCaption(text, "LinkedIn post")),
    summary: summarizeDescription(text.replace(/#\S+/g, "")) || "A post from ChemLife Innovations on LinkedIn.",
    content: text,
    url,
    imageUrl: entry.image,
    copyImage: Boolean(entry.image),
    meta: "LinkedIn post",
    publishedAt: sensible(fromNumber) ?? sensible(entry.date) ?? new Date(),
  };
}

/** The newest posts in the feed at this address. `read` fetches it: only public web addresses are allowed. */
export async function fetchLinkedInFeed(address: string, read: (address: string) => Promise<string>): Promise<SourceItem[]> {
  let url: URL;
  try {
    url = new URL(address.trim());
  } catch {
    throw new Error("LINKEDIN_FEED_URL isn't a valid web address.");
  }
  if (url.protocol !== "https:") throw new Error("LINKEDIN_FEED_URL must start with https://");
  const items = parseFeed(await read(url.toString()))
    .map(feedItem)
    .filter((item): item is SourceItem => item !== null)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  return items.slice(0, NEWEST);
}
