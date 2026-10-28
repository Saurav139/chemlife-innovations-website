import { Images } from "@/lib/assets";
import type { Kind, SourceItem } from "./types";
import { articleSummary, cleanTitle, clip, decodeEntities, htmlToText, isFromArticle, normalizeUrl, readingTime, summarizeDescription, titleFromCaption } from "./text";

// Reading posts from ChemLife's channels. Each function returns the latest posts, newest first, or null when the
// channel isn't set up (no key in the environment).

type FetchMode = { fresh?: boolean };
const cacheFor = ({ fresh }: FetchMode) => (fresh ? { cache: "no-store" as const } : { next: { revalidate: 3600 } });

// ---------- YouTube ----------

// The channel's uploads playlist. YOUTUBE_PLAYLIST_ID overrides it.
const DEFAULT_PLAYLIST = "UUw9YQ4V85x2n_L3mC0uE7yA";

interface YouTubeVideo {
  id: string;
  snippet?: { title?: string; description?: string; publishedAt?: string };
  contentDetails?: { duration?: string };
}

/** The channel's latest uploads, without Shorts. Long videos and anything mentioning a podcast are podcasts. */
export async function fetchYouTubeUploads(mode: FetchMode = {}): Promise<SourceItem[] | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;
  const playlist = process.env.YOUTUBE_PLAYLIST_ID || DEFAULT_PLAYLIST;
  const list = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlist}&maxResults=25&key=${key}`,
    cacheFor(mode)
  );
  if (!list.ok) throw new Error(`YouTube answered ${list.status}`);
  const ids: string[] = ((await list.json()).items ?? [])
    .map((item: { contentDetails?: { videoId?: string }; snippet?: { resourceId?: { videoId?: string } } }) =>
      item.contentDetails?.videoId || item.snippet?.resourceId?.videoId)
    .filter(Boolean);
  return fetchYouTubeVideos(ids, mode);
}

/** Details for these videos, mapped to Insights posts. Shorts (under two minutes) are left out. */
export async function fetchYouTubeVideos(ids: string[], mode: FetchMode = {}, keepShorts = false): Promise<SourceItem[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key || ids.length === 0) return [];
  const details = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${ids.join(",")}&key=${key}`,
    cacheFor(mode)
  );
  if (!details.ok) throw new Error(`YouTube answered ${details.status}`);
  const items: YouTubeVideo[] = (await details.json()).items ?? [];
  return items.flatMap((video) => {
    const item = youtubeItem(video);
    return item && (keepShorts || durationSeconds(video.contentDetails?.duration) >= 120) ? [item] : [];
  });
}

function durationSeconds(iso = "") {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  return m ? Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0) : 0;
}

function youtubeItem(video: YouTubeVideo): SourceItem | null {
  const snippet = video.snippet ?? {};
  const seconds = durationSeconds(video.contentDetails?.duration);
  const text = `${snippet.title ?? ""} ${snippet.description ?? ""}`.toLowerCase();
  const isPodcast = /podcast|grand ?master/.test(text) || seconds >= 600;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const meta = hours > 0 ? `${hours} hr ${minutes} min play` : minutes > 0 ? `${minutes} min play` : `${seconds} sec play`;
  return {
    source: "youtube",
    externalId: video.id,
    kind: (isPodcast ? "Podcast" : "Video") as Kind,
    title: cleanTitle(snippet.title || "YouTube Video"),
    summary: summarizeDescription(snippet.description ?? "") || "ChemLife Innovations YouTube upload details.",
    content: snippet.description ?? "",
    url: `https://www.youtube.com/watch?v=${video.id}`,
    youtubeId: video.id,
    meta,
    publishedAt: new Date(snippet.publishedAt || Date.now()),
  };
}

// ---------- WordPress ----------

export const WORDPRESS_SITE = "chemlifeinnovations.wordpress.com";
const WORDPRESS_API = `https://public-api.wordpress.com/wp/v2/sites/${WORDPRESS_SITE}/posts`;
const WORDPRESS_FIELDS = "id,date_gmt,link,title,excerpt,content,jetpack_featured_media_url";

interface WordPressPost {
  date_gmt: string;
  link: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  jetpack_featured_media_url?: string;
}

/** The blog's latest posts. WordPress.com's public API needs no key. */
export async function fetchWordPressPosts(mode: FetchMode = {}): Promise<SourceItem[]> {
  const res = await fetch(`${WORDPRESS_API}?per_page=50&_fields=${WORDPRESS_FIELDS}`, cacheFor(mode));
  if (!res.ok) throw new Error(`WordPress answered ${res.status}`);
  return ((await res.json()) as WordPressPost[]).map(wordpressItem);
}

/** One post by its address on the blog, or null if there isn't one. */
export async function fetchWordPressPost(url: string): Promise<SourceItem | null> {
  const slug = new URL(url).pathname.split("/").filter(Boolean).pop();
  if (!slug) return null;
  const res = await fetch(`${WORDPRESS_API}?slug=${encodeURIComponent(slug)}&_fields=${WORDPRESS_FIELDS}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`WordPress answered ${res.status}`);
  const [post] = (await res.json()) as WordPressPost[];
  return post ? wordpressItem(post) : null;
}

function wordpressItem(post: WordPressPost): SourceItem {
  const content = htmlToText(post.content.rendered);
  const excerpt = htmlToText(post.excerpt.rendered).replace(/\s*\[(…|&hellip;|\.\.\.)\]\s*$/, "…");
  // WordPress's automatic excerpt runs headings into the text after them, so make one from the article instead. An
  // excerpt written for the post is kept.
  // The featured picture, else the article's first picture, else a stock farm photo.
  const firstPicture = post.content.rendered.match(/<img[^>]+src="([^"]+)"/i)?.[1];
  const picture = post.jetpack_featured_media_url || (firstPicture ? firstPicture.split("?")[0] : "");
  return {
    source: "wordpress",
    externalId: normalizeUrl(post.link),
    kind: "Blog",
    title: cleanTitle(decodeEntities(post.title.rendered.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ")),
    summary: !excerpt || isFromArticle(excerpt, content) ? articleSummary(content) : clip(excerpt, 220),
    content,
    url: post.link,
    imageUrl: picture || Images.gallery.rotate21,
    meta: readingTime(content),
    publishedAt: new Date(`${post.date_gmt}Z`),
  };
}

// ---------- Instagram ----------

// The Instagram API with Instagram Login (a Meta app connected to ChemLife's business account). Its access token
// lasts 60 days; src/lib/insights-store/sync.ts renews it well before then.
const INSTAGRAM_API = "https://graph.instagram.com";

interface InstagramMedia {
  id: string;
  caption?: string;
  media_type?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
}

/** The account's latest posts. Their picture addresses expire, so the pictures are copied in when added. */
export async function fetchInstagramPosts(token: string): Promise<SourceItem[]> {
  const fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
  const res = await fetch(`${INSTAGRAM_API}/me/media?fields=${fields}&limit=30&access_token=${encodeURIComponent(token)}`, { cache: "no-store" });
  if (!res.ok) throw new Error(await instagramError(res));
  return (((await res.json()).data ?? []) as InstagramMedia[]).map(instagramItem);
}

// Meta explains a refusal in the body, e.g. code 190 for an expired or revoked token.
async function instagramError(res: Response) {
  const error = ((await res.json().catch(() => ({}))) as { error?: { message?: string; code?: number } }).error;
  if (error?.code === 190) return "Instagram's access token has expired or was revoked. Create a new one and set INSTAGRAM_ACCESS_TOKEN.";
  return `Instagram answered ${res.status}${error?.message ? `: ${error.message}` : ""}`;
}

function instagramItem(media: InstagramMedia): SourceItem {
  const caption = media.caption ?? "";
  const isVideo = media.media_type === "VIDEO";
  return {
    source: "instagram",
    externalId: media.id,
    kind: "Blog",
    title: titleFromCaption(caption, "Instagram post"),
    summary: summarizeDescription(caption.replace(/#\S+/g, "")) || "A post from ChemLife Innovations on Instagram.",
    content: caption,
    url: media.permalink,
    imageUrl: (isVideo ? media.thumbnail_url : media.media_url) ?? undefined,
    copyImage: true,
    meta: isVideo ? "Instagram reel" : "Instagram post",
    publishedAt: new Date(media.timestamp || Date.now()),
  };
}

/** A fresh 60-day token for this one. Meta accepts a token for renewal once it's at least a day old. */
export async function renewInstagramToken(token: string): Promise<{ token: string; expiresAt: Date }> {
  const res = await fetch(`${INSTAGRAM_API}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`, { cache: "no-store" });
  if (!res.ok) throw new Error(await instagramError(res));
  const body = (await res.json()) as { access_token: string; expires_in: number };
  return { token: body.access_token, expiresAt: new Date(Date.now() + body.expires_in * 1000) };
}
