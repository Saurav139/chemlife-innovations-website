import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { IMAGE_TYPES, findItem, saveImage } from "./db";
import { WORDPRESS_SITE, fetchWordPressPost, fetchYouTubeVideos, findInstagramPost } from "./sources";
import { cleanTitle, decodeEntities, instagramEmbedUrl, instagramPostDate, instagramPostId, instagramReelCode, isLinkedInVideoPage, linkedinActivityDate, linkedinActivityId, linkedinEmbedUrl, normalizeUrl, summarizeDescription, titleFromCaption } from "./text";
import type { InboxItem, SourceItem } from "./types";

// "Add a post": the moderator pastes a link and gets a filled-in card to check before adding it. Only the
// moderator can ask for a preview, and only public web addresses are fetched.

// The site says who it is. Instagram and LinkedIn give their link preview (title, text, picture) to a named visitor,
// while one claiming to be a browser can get a sign-in page instead.
const VISITOR = "Mozilla/5.0 (compatible; ChemLifeInsights/1.0; +https://chemlifeinnovations.com)";

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
    item = await instagramPreview(url, notes);
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
  return { source: "youtube", externalId: id, kind: "Video", title: cleanTitle(title), summary: "", url: `https://www.youtube.com/watch?v=${id}`, youtubeId: id, meta: "Video", publishedAt: new Date() };
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
  // The post's page first; LinkedIn's embed page, made for showing a post on other sites, if that page is turned away
  // or comes back without the post (a sign-in page).
  let html = await readPage(url.toString());
  if (activity && !hasPreview(html)) html = (await readPage(linkedinEmbedUrl(activity).replace("?compact=true", ""))) || html;
  if (!hasPreview(html)) {
    notes.push("LinkedIn didn't share a preview of this post. Fill in the title and summary yourself, and add a picture with “Replace picture”.");
    return base;
  }
  const meta = metaTags(html);
  // LinkedIn's titles end in " | Chemlife Innovations posted on the topic | LinkedIn", or " | Chemlife Innovations"
  // for a shared article.
  const parts = (meta["og:title"] ?? "").split(" | ");
  while (parts.length > 1 && /linkedin|posted on the topic|chemlife innovations/i.test(parts[parts.length - 1])) parts.pop();
  // A post without a headline is titled "Chemlife Innovations on LinkedIn: the text".
  const title = cleanTitle(parts.join(" | ").replace(/^[^:]{1,80} on LinkedIn:\s*/i, "").replace(/^["“]|["”]$/g, ""));
  const text = htmlText(html.match(/<p[^>]*data-test-id="main-feed-activity-card__commentary"[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? "") || meta["og:description"] || meta.description || "";
  const published = html.match(/"datePublished":"([^"]+)"/)?.[1];
  if (!title && !text) notes.push("LinkedIn didn't give this post a title. Write a short one.");
  if (!meta["og:image"]) notes.push("LinkedIn didn't share this post's picture. Add one with “Replace picture”.");
  return {
    ...base,
    url: meta["og:url"] ? normalizeUrl(meta["og:url"]) : base.url,
    title: title || titleFromCaption(text, ""),
    summary: summarizeDescription(text.replace(/#\S+/g, "")),
    content: text,
    imageUrl: meta["og:image"],
    copyImage: true,
    videoUrl: activity && isLinkedInVideoPage(html) ? linkedinEmbedUrl(activity) : undefined,
    publishedAt: published ? new Date(published) : base.publishedAt,
  };
}

/** An Instagram post: from Instagram's API when it's connected (exact caption, picture and date), otherwise from the
 *  post's link preview, with Instagram's embed page (made for showing a post on other sites) filling any gaps. */
async function instagramPreview(url: URL, notes: string[]): Promise<SourceItem> {
  const code = instagramPostId(url.toString());
  if (!code) return pagePreview(url, "instagram", notes);
  const fromApi = await instagramFromApi(code);
  if (fromApi) return fromApi;

  // One address per post, however it was shared (with the account's name, tracking codes or a trailing slash).
  const address = `https://www.instagram.com/${instagramReelCode(url.toString()) ? "reel" : "p"}/${code}`;
  const page = await readPage(`${address}/`);
  const meta = metaTags(page);
  const description = meta["og:description"] ?? meta.description ?? "";
  // The description is the caption, or reads "123 likes, 4 comments - chemlife on June 5, 2026: "the caption"".
  let caption = description.match(/:\s*["“]([\s\S]*)["”]\.?\s*$/)?.[1] ?? description;
  // The title reads 'Chemlife Innovations on Instagram: "the caption"'.
  if (!caption) caption = meta["og:title"]?.match(/on Instagram:\s*["“]([\s\S]*)["”]\s*$/)?.[1] ?? "";
  let image: string | undefined = meta["og:image"];
  if (!caption || !image) {
    const embed = await readPage(`https://www.instagram.com/p/${code}/embed/captioned/`);
    image ||= embedImage(embed);
    caption ||= embedCaption(embed);
  }
  if (!caption && !image) {
    notes.push("Instagram didn't share a preview of this post. Fill in the title and summary yourself, and add a picture with “Replace picture”.");
  } else if (!image) {
    notes.push("Instagram didn't share this post's picture. Add one with “Replace picture”.");
  }
  const said = meta["article:published_time"] ?? description.match(/on ([A-Z][a-z]+ \d{1,2}, \d{4})/)?.[1];
  const published = (said && !Number.isNaN(Date.parse(said)) ? new Date(said) : null) ?? instagramPostDate(code);
  if (!published) notes.push("Check the date: the post doesn't say when it was published, so it's set to today.");
  const isVideo = Boolean(address.includes("/reel/") || meta["og:video"] || meta["og:type"]?.startsWith("video"));
  return {
    source: "instagram",
    externalId: address,
    kind: "Blog",
    title: titleFromCaption(caption, "Instagram post"),
    summary: summarizeDescription(caption.replace(/#\S+/g, "")),
    content: caption,
    url: address,
    imageUrl: image,
    copyImage: true,
    videoUrl: isVideo ? instagramEmbedUrl(code) : undefined,
    meta: isVideo ? "Instagram reel" : "Instagram post",
    publishedAt: published ?? new Date(),
  };
}

/** The post from ChemLife's own account through Instagram's API, when INSTAGRAM_ACCESS_TOKEN is set. Kept under the
 *  pasted address, like any pasted post, so the importer and the paste recognise each other. */
async function instagramFromApi(code: string): Promise<SourceItem | null> {
  try {
    const { instagramToken } = await import("./sync");
    const token = await instagramToken();
    const post = token ? await findInstagramPost(token, code) : null;
    return post?.url ? { ...post, externalId: normalizeUrl(post.url), url: normalizeUrl(post.url) } : null;
  } catch {
    // Another account's post, or the API is unavailable: the post's own page is read instead.
    return null;
  }
}

function embedImage(html: string): string | undefined {
  const tag = html.match(/<img\b[^>]*class="[^"]*EmbeddedMediaImage[^"]*"[^>]*>/i)?.[0];
  const src = tag?.match(/\bsrc="([^"]+)"/i)?.[1];
  return src ? decodeEntities(src) : undefined;
}

function embedCaption(html: string): string {
  const block = html.match(/<div class="Caption">([\s\S]*?)<div class="CaptionComments"/i)?.[1] ?? html.match(/<div class="Caption">([\s\S]*?)<\/div>/i)?.[1] ?? "";
  return htmlText(block.replace(/<a class="CaptionUsername"[\s\S]*?<\/a>/i, ""));
}

/** A page's text, or "" if it couldn't be read. An address the site won't fetch is still refused. */
async function readPage(address: string): Promise<string> {
  try {
    return await fetchText(address);
  } catch (error) {
    if (error instanceof RefusedAddress) throw error;
    return "";
  }
}

/** Whether a page carries a post's link preview, rather than a sign-in page. */
function hasPreview(html: string): boolean {
  const meta = metaTags(html);
  if (/\b(?:sign in|sign up|log in|join linkedin)\b/i.test(meta["og:title"] ?? "")) return false;
  return Boolean(meta["og:image"] || meta["og:description"]);
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
    title: source === "instagram" ? titleFromCaption(caption, "Instagram post") : cleanTitle(meta["og:title"] ?? html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? ""),
    summary: summarizeDescription(caption.replace(/#\S+/g, "")),
    content: caption,
    imageUrl: meta["og:image"],
    copyImage: true,
    videoUrl: source === "instagram" ? instagramPlayer(url.toString(), meta) : undefined,
    publishedAt: published && !Number.isNaN(Date.parse(published)) ? new Date(published) : base.publishedAt,
  };
}

/** A reel's address says it's a video; a /p/ address that is one says so in its preview tags. */
function instagramPlayer(address: string, meta: Record<string, string>): string | undefined {
  const reel = instagramReelCode(address);
  if (reel) return instagramEmbedUrl(reel);
  const code = instagramPostId(address);
  return code && (meta["og:video"] || meta["og:type"]?.startsWith("video")) ? instagramEmbedUrl(code) : undefined;
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
    const res = await fetch(url, { redirect: "manual", cache: "no-store", headers: { "User-Agent": VISITOR, Accept: accept, "Accept-Language": "en-US,en;q=0.9" }, signal: AbortSignal.timeout(10_000) });
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

/** LinkedIn's player for a post, if the post is a video; nothing if it isn't, or its page can't be read. */
export async function linkedinVideoUrl(postUrl: string): Promise<string | undefined> {
  const activity = linkedinActivityId(postUrl);
  if (!activity) return undefined;
  // LinkedIn sometimes turns servers away from a post's page; its embed page says the same and is let through more.
  const html = await fetchText(postUrl).catch(() => fetchText(linkedinEmbedUrl(activity)));
  return isLinkedInVideoPage(html) ? linkedinEmbedUrl(activity) : undefined;
}

/** A feed's text, from a public address only. */
export async function fetchFeedText(address: string): Promise<string> {
  return (await fetchPublic(address, "application/rss+xml,application/atom+xml,application/feed+json,application/json,text/xml,*/*;q=0.5", 3_000_000)).bytes.toString("utf8");
}

/** Copies a picture from the web into the database, so it keeps working after the source's address expires. */
export async function copyImage(address: string): Promise<number> {
  const res = await fetchPublic(address, "image/avif,image/webp,image/png,image/jpeg,image/*", 6_000_000);
  const mime = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!IMAGE_TYPES.includes(mime)) throw new Error("That isn't a JPEG, PNG, WebP or GIF picture.");
  return saveImage(mime, res.bytes);
}
