import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { IMAGE_TYPES, findItem, saveImage } from "./db";
import { WORDPRESS_SITE, fetchWordPressPost, fetchYouTubeVideos } from "./sources";
import { decodeEntities, linkedinActivityDate, linkedinActivityId, normalizeUrl, summarizeDescription, titleFromCaption } from "./text";
import type { InboxItem, SourceItem } from "./types";

// "Add a post": the moderator pastes a link and gets a filled-in card to check before adding it. Only the
// moderator can ask for a preview, and only public web addresses are fetched.

const BROWSER = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

export interface Preview {
  item: SourceItem;
  /** Already in the inbox. */
  existing: InboxItem | null;
  /** What couldn't be filled in automatically. */
  notes: string[];
}

export async function previewLink(input: string): Promise<Preview> {
  const url = new URL(input.trim());
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Paste a web address starting with https://");
  const host = url.hostname.replace(/^www\.|^m\./, "");
  const notes: string[] = [];
  let item: SourceItem;

  if (host === "youtube.com" || host === "youtu.be") {
    item = await youtubePreview(url, notes);
  } else if (host === WORDPRESS_SITE) {
    const post = await fetchWordPressPost(url.toString());
    if (!post) throw new Error("That post isn't on the ChemLife blog, or isn't published yet.");
    item = post;
  } else if (host === "linkedin.com" || host.endsWith(".linkedin.com")) {
    item = await linkedinPreview(url, notes);
  } else if (host === "instagram.com") {
    item = await pagePreview(url, "instagram", notes);
  } else {
    item = await pagePreview(url, "link", notes);
  }

  if (item.copyImage && item.imageUrl) {
    try {
      item.imageId = await copyImage(item.imageUrl);
      item.imageUrl = undefined;
    } catch {
      notes.push("The post's picture couldn't be copied. Add one with “Replace picture” after adding the post.");
      item.imageUrl = undefined;
    }
  }
  return { item, existing: await findItem(item.source, item.externalId), notes };
}

async function youtubePreview(url: URL, notes: string[]): Promise<SourceItem> {
  const id = url.hostname.endsWith("youtu.be")
    ? url.pathname.slice(1)
    : url.searchParams.get("v") ?? url.pathname.match(/\/(?:shorts|live|embed)\/([\w-]{11})/)?.[1];
  if (!id || !/^[\w-]{11}$/.test(id)) throw new Error("That doesn't look like a YouTube video link.");
  const [video] = await fetchYouTubeVideos([id], { fresh: true }, true);
  if (video) return video;
  // Without the YouTube key: the public oEmbed answer has the title.
  const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`, { cache: "no-store" });
  if (!res.ok) throw new Error("YouTube doesn't know that video, or it isn't public.");
  const { title } = (await res.json()) as { title: string };
  notes.push("Add a short description, and check the date: YouTube's key isn't set, so only the title was filled in.");
  return { source: "youtube", externalId: id, kind: "Video", title, summary: "", url: `https://www.youtube.com/watch?v=${id}`, youtubeId: id, meta: "Video", publishedAt: new Date() };
}

async function linkedinPreview(url: URL, notes: string[]): Promise<SourceItem> {
  const activity = linkedinActivityId(url.toString());
  const base: SourceItem = {
    source: "linkedin",
    externalId: activity ?? normalizeUrl(url.toString()),
    kind: "Blog",
    title: "",
    summary: "",
    url: normalizeUrl(url.toString()),
    meta: "LinkedIn post",
    publishedAt: activity ? linkedinActivityDate(activity) : new Date(),
  };
  let html = "";
  try {
    html = await fetchText(url.toString());
  } catch (error) {
    if (error instanceof RefusedAddress) throw error;
    notes.push("LinkedIn didn't share a preview of this post. Fill in the title and summary yourself.");
    return base;
  }
  const meta = metaTags(html);
  // LinkedIn's titles end in " | Chemlife Innovations posted on the topic | LinkedIn", or " | Chemlife Innovations"
  // for a shared article.
  const parts = (meta["og:title"] ?? "").split(" | ");
  while (parts.length > 1 && /linkedin|posted on the topic|chemlife innovations/i.test(parts[parts.length - 1])) parts.pop();
  const title = parts.join(" | ").trim();
  const text = htmlText(html.match(/<p[^>]*data-test-id="main-feed-activity-card__commentary"[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? "") || meta["og:description"] || meta.description || "";
  const published = html.match(/"datePublished":"([^"]+)"/)?.[1];
  if (!title) notes.push("LinkedIn didn't give this post a title. Write a short one.");
  return {
    ...base,
    url: meta["og:url"] ? normalizeUrl(meta["og:url"]) : base.url,
    title: title || titleFromCaption(text, ""),
    summary: summarizeDescription(text.replace(/#\S+/g, "")),
    content: text,
    imageUrl: meta["og:image"],
    copyImage: true,
    publishedAt: published ? new Date(published) : base.publishedAt,
  };
}

/** Any other page: its title, description and picture from the tags that link previews use. */
async function pagePreview(url: URL, source: "instagram" | "link", notes: string[]): Promise<SourceItem> {
  const base: SourceItem = {
    source,
    externalId: normalizeUrl(url.toString()),
    kind: "Blog",
    title: "",
    summary: "",
    url: normalizeUrl(url.toString()),
    meta: source === "instagram" ? "Instagram post" : "Article",
    publishedAt: new Date(),
  };
  let html = "";
  try {
    html = await fetchText(url.toString());
  } catch (error) {
    if (error instanceof RefusedAddress) throw error;
    notes.push("That page didn't share a preview. Fill in the title and summary yourself.");
    return base;
  }
  const meta = metaTags(html);
  const description = meta["og:description"] ?? meta.description ?? "";
  // Instagram's description reads "123 likes, 4 comments - chemlife on June 5, 2026: "the caption"".
  const caption = source === "instagram" ? (description.match(/:\s*["“]([\s\S]*)["”]\.?\s*$/)?.[1] ?? description) : description;
  const published = meta["article:published_time"] ?? description.match(/on ([A-Z][a-z]+ \d{1,2}, \d{4})/)?.[1];
  if (!published) notes.push("Check the date: the page doesn't say when it was published, so it's set to today.");
  return {
    ...base,
    title: source === "instagram" ? titleFromCaption(caption, "Instagram post") : (meta["og:title"] ?? html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? "").trim(),
    summary: summarizeDescription(caption.replace(/#\S+/g, "")),
    content: caption,
    imageUrl: meta["og:image"],
    copyImage: true,
    publishedAt: published && !Number.isNaN(Date.parse(published)) ? new Date(published) : base.publishedAt,
  };
}

function metaTags(html: string): Record<string, string> {
  const tags: Record<string, string> = {};
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const key = tag.match(/\b(?:property|name)="([^"]+)"/i)?.[1];
    const value = tag.match(/\bcontent="([^"]*)"/i)?.[1];
    if (key && value !== undefined && !(key.toLowerCase() in tags)) tags[key.toLowerCase()] = decodeEntities(value);
  }
  return tags;
}

function htmlText(html: string): string {
  return decodeEntities(html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")).replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

// ---------- Fetching public addresses only ----------

/** An address the site won't fetch: not a public web address. */
class RefusedAddress extends Error {}

function isPrivate(address: string): boolean {
  if (isIP(address) === 6) {
    const a = address.toLowerCase();
    if (a.startsWith("::ffff:")) return isPrivate(a.slice(7));
    return a === "::" || a === "::1" || a.startsWith("fc") || a.startsWith("fd") || a.startsWith("fe8") || a.startsWith("fe9") || a.startsWith("fea") || a.startsWith("feb");
  }
  const [a, b] = address.split(".").map(Number);
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
}

async function checkAddress(url: URL) {
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new RefusedAddress("Only web addresses can be fetched.");
  if (url.port && url.port !== "443" && url.port !== "80") throw new RefusedAddress("That address isn't on the public internet.");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
  if (addresses.length === 0 || addresses.some(({ address }) => isPrivate(address))) throw new RefusedAddress("That address isn't on the public internet.");
}

/** GET a public address, following up to three redirects (each checked), within 10 seconds and maxBytes. */
async function fetchPublic(address: string, accept: string, maxBytes: number): Promise<Response & { bytes: Buffer }> {
  let url = new URL(address);
  for (let hop = 0; hop < 4; hop++) {
    await checkAddress(url);
    const res = await fetch(url, { redirect: "manual", cache: "no-store", headers: { "User-Agent": BROWSER, Accept: accept, "Accept-Language": "en-US,en;q=0.9" }, signal: AbortSignal.timeout(10_000) });
    const next = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && next) {
      url = new URL(next, url);
      continue;
    }
    if (!res.ok || !res.body) throw new Error(`The page answered ${res.status}`);
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
      size += chunk.length;
      if (size > maxBytes) throw new Error("That's too large to fetch.");
      chunks.push(Buffer.from(chunk));
    }
    return Object.assign(res, { bytes: Buffer.concat(chunks) });
  }
  throw new Error("Too many redirects.");
}

async function fetchText(address: string): Promise<string> {
  return (await fetchPublic(address, "text/html,application/xhtml+xml", 3_000_000)).bytes.toString("utf8");
}

/** Copies a picture from the web into the database, so it keeps working after the source's address expires. */
export async function copyImage(address: string): Promise<number> {
  const res = await fetchPublic(address, "image/avif,image/webp,image/png,image/jpeg,image/*", 6_000_000);
  const mime = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!IMAGE_TYPES.includes(mime)) throw new Error("That isn't a JPEG, PNG, WebP or GIF picture.");
  return saveImage(mime, res.bytes);
}
