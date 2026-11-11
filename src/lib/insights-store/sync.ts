import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { FALLBACK_INSIGHTS, type InsightItem } from "@/lib/insights";
import { addImportedItems, addItems, changeItem, getSetting, knownIds, knownUrls, listItems, removeUnusedImages, setSetting, socialAutoPublishSettings } from "./db";
import type { SocialAutoPublish } from "./social-publishing";
import { fetchInstagramFeed, fetchLinkedInFeed } from "./feed";
import { copyImage, fetchFeedText, linkedinVideoUrl, previewLink } from "./preview";
import { fetchInstagramPosts, fetchWordPressPosts, fetchYouTubeUploads, renewInstagramToken } from "./sources";
import { articleSummary, cleanTitle, instagramEmbedUrl, instagramPostId, instagramReelCode, isFromArticle, linkedinActivityId, normalizeUrl } from "./text";
import type { ItemChanges, Source, SourceItem, SourceState, SyncResult } from "./types";

// Checking the channels for new posts. New posts wait in the inbox for the moderator, except on the very first
// check, when what the Insights page already showed goes straight on: its built-in list, and YouTube's uploads.
// A saved preference can also approve new LinkedIn and Instagram imports automatically.

const g = globalThis as unknown as { insightsSync?: Promise<SyncResult[]> };

/** One check at a time: a second request while one runs gets the same answer. */
export function syncInbox(): Promise<SyncResult[]> {
  g.insightsSync ??= runSync().finally(() => {
    g.insightsSync = undefined;
  });
  return g.insightsSync;
}

/** Rebuilds the Insights page (all languages) with the approved posts. */
export function refreshInsightsPage(): void {
  try {
    revalidatePath("/[locale]/insights", "page");
  } catch {
    // Outside a request (the automatic check): the page is rendered for each visit anyway.
  }
}

async function runSync(): Promise<SyncResult[]> {
  const started = await startInbox();
  const results = [
    await importFrom("youtube", () => fetchYouTubeUploads({ fresh: true }), "approved-first:youtube"),
    await importFrom("wordpress", () => fetchWordPressPosts({ fresh: true })),
    await importFrom("instagram", async () => {
      const feed = process.env.INSTAGRAM_FEED_URL;
      if (feed) return fetchInstagramFeed(feed, fetchFeedText);
      const token = await instagramToken();
      return token ? fetchInstagramPosts(token) : null;
    }),
    await importFrom("linkedin", async () => {
      const feed = process.env.LINKEDIN_FEED_URL;
      return feed ? fetchLinkedInFeed(feed, fetchFeedText) : null;
    }),
  ];
  await setSetting("last_sync", JSON.stringify({ at: new Date().toISOString(), results }));
  await removeUnusedImages().catch(() => undefined);
  if (started || results.some((r) => r.approved && r.added > 0)) refreshInsightsPage();
  return results;
}

async function importFrom(source: Source, fetchItems: () => Promise<SourceItem[] | null>, firstTimeApproved?: string): Promise<SyncResult> {
  try {
    const items = await fetchItems();
    if (items === null) return { source, added: 0, approved: false, skipped: "not set up" };
    const known = await knownIds(source, items.map((item) => item.externalId));
    // The API uses numeric media IDs, while feeds and pasted links use URLs. Match the post's shortcode too.
    const seenPosts = new Set(source === "instagram" ? (await knownUrls(source)).map(instagramPostId).filter((id) => id !== null) : []);
    const fresh = items.filter((item) => {
      if (known.has(item.externalId)) return false;
      known.add(item.externalId);
      const post = source === "instagram" && item.url ? instagramPostId(item.url) : null;
      if (post && seenPosts.has(post)) return false;
      if (post) seenPosts.add(post);
      return true;
    });
    if (source === "instagram") await addMissingInstagramPlayers(items.filter((item) => item.videoUrl && !fresh.includes(item)));
    let gained = await addMissingPictures(source, items.filter((item) => !fresh.includes(item)));
    if (source === "instagram" || source === "linkedin") gained = (await addPicturesFromPosts(source)) || gained;
    if (gained) refreshInsightsPage();
    // The source's picture address expires, so keep a copy; without one the card has no picture. A few at a time.
    const withPicture = fresh.filter((item) => item.copyImage && item.imageUrl);
    const failures: string[] = [];
    for (let i = 0; i < withPicture.length; i += 4) {
      await Promise.all(
        withPicture.slice(i, i + 4).map(async (item) => {
          item.imageId = await copyImage(item.imageUrl!).catch((error: unknown) => {
            failures.push(error instanceof Error ? error.message : String(error));
            return undefined;
          });
          item.imageUrl = undefined;
        })
      );
    }
    const pictureProblem = failures.length
      ? `${failures.length === 1 ? "A new post's picture" : `${failures.length} new posts' pictures`} couldn't be copied (${failures[0]}). The inbox tries again from ${failures.length === 1 ? "the post's" : "each post's"} own page.`
      : undefined;
    // A LinkedIn feed doesn't say which posts are videos; their pages do. A few at a time.
    if (source === "linkedin") {
      const unchecked = fresh.filter((item) => !item.videoUrl && item.url);
      for (let i = 0; i < unchecked.length; i += 4) {
        await Promise.all(unchecked.slice(i, i + 4).map(async (item) => {
          item.videoUrl = await linkedinVideoUrl(item.url!).catch(() => undefined);
        }));
      }
    }
    const approveNow = firstTimeApproved ? !(await getSetting(firstTimeApproved)) : false;
    const imported = await addImportedItems(source, fresh, approveNow ? "approved" : "pending");
    if (approveNow) await setSetting(firstTimeApproved!, new Date().toISOString());
    return { source, ...imported, ...(pictureProblem ? { pictureProblem } : {}) };
  } catch (error) {
    return { source, added: 0, approved: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ---------- Starting the inbox ----------

/** The first time: copies the page's built-in list in as approved posts, so nothing on the page changes. Returns
 *  whether it did. */
export async function startInbox(): Promise<boolean> {
  if (await getSetting("started")) {
    await repairBlogText();
    await findLinkedInVideos();
    await findInstagramReels();
    return false;
  }
  await addItems(builtInItems(), "approved");
  await setSetting("started", new Date().toISOString());
  // A new inbox imports blog posts with today's text already.
  await setSetting(BLOG_TEXT_REPAIRED, new Date().toISOString());
  await findLinkedInVideos();
  await findInstagramReels();
  return true;
}

const builtInItems = () => {
  const { blogs, podcasts, videos } = FALLBACK_INSIGHTS;
  return [...blogs, ...podcasts, ...videos].map(builtInItem);
};

const BLOG_TEXT_REPAIRED = "repaired:blog-text";

/** Once, for inboxes started before blog summaries were made from the article (October 2026): blog posts imported
 *  then get the summary and title the importer makes now. A summary the moderator rewrote is left alone (it no
 *  longer matches the start of the article), and so are the built-in list's own summaries. */
async function repairBlogText(): Promise<void> {
  if (await getSetting(BLOG_TEXT_REPAIRED)) return;
  const builtIn = new Set(builtInItems().map((item) => `${item.source}:${item.externalId}`));
  for (const item of await listItems()) {
    if (item.source !== "wordpress" || builtIn.has(`wordpress:${item.externalId}`)) continue;
    const changes: ItemChanges = {};
    const title = cleanTitle(item.title);
    if (title !== item.title) changes.title = title;
    if (item.content && isFromArticle(item.summary, item.content)) {
      const summary = articleSummary(item.content);
      if (summary && summary !== item.summary) changes.summary = summary;
    }
    if (changes.title || changes.summary) await changeItem(item.id, changes);
  }
  await setSetting(BLOG_TEXT_REPAIRED, new Date().toISOString());
}

const LINKEDIN_VIDEOS_FOUND = "repaired:linkedin-videos";

/** Once, for LinkedIn posts added before video posts were recognised (November 2026): each post's page says whether
 *  it is a video, and a video gets LinkedIn's player. Done again on the next check if a page couldn't be read. */
async function findLinkedInVideos(): Promise<void> {
  if (await getSetting(LINKEDIN_VIDEOS_FOUND)) return;
  let complete = true;
  // The built-in list already knows its own video posts.
  const known = new Map(builtInItems().filter((item) => item.videoUrl).map((item) => [item.externalId, item.videoUrl!]));
  for (const item of await listItems()) {
    if (item.source !== "linkedin" || item.videoUrl || !item.url) continue;
    try {
      const videoUrl = known.get(item.externalId) ?? await linkedinVideoUrl(item.url);
      if (videoUrl) await changeItem(item.id, { videoUrl });
    } catch {
      complete = false;
    }
  }
  if (complete) await setSetting(LINKEDIN_VIDEOS_FOUND, new Date().toISOString());
}

/** Reels already in the inbox that the feed or API now says are videos (for instance a reel saved from a /p/ link)
 *  get Instagram's player. */
async function addMissingInstagramPlayers(videos: SourceItem[]): Promise<void> {
  if (videos.length === 0) return;
  const players = new Map(videos.map((item) => [instagramPostId(item.url ?? ""), item.videoUrl!]));
  for (const saved of await listItems()) {
    const player = saved.source === "instagram" && !saved.videoUrl ? players.get(instagramPostId(saved.url)) : undefined;
    if (player) await changeItem(saved.id, { videoUrl: player });
  }
}

/** Posts already in the inbox whose picture couldn't be copied when they came in get it now, while the channel
 *  still lists them. Returns whether a post on the Insights page gained its picture. */
async function addMissingPictures(source: Source, listed: SourceItem[]): Promise<boolean> {
  const withPicture = listed.filter((item) => item.copyImage && item.imageUrl);
  if (withPicture.length === 0) return false;
  // The API and feeds name an Instagram post differently, so match its shortcode, as the import does.
  const key = (externalId: string, url?: string) => (source === "instagram" && url ? instagramPostId(url) : null) ?? externalId;
  const pictures = new Map(withPicture.map((item) => [key(item.externalId, item.url), item.imageUrl!]));
  const missing = (await listItems()).filter((saved) => saved.source === source && !saved.image && pictures.has(key(saved.externalId, saved.url)));
  let shown = false;
  for (let i = 0; i < missing.length; i += 4) {
    await Promise.all(
      missing.slice(i, i + 4).map(async (saved) => {
        const imageId = await copyImage(pictures.get(key(saved.externalId, saved.url))!).catch(() => undefined);
        if (!imageId) return;
        await changeItem(saved.id, { imageId });
        if (saved.status === "approved") shown = true;
      })
    );
  }
  return shown;
}

const PICTURE_LOOKUPS = "picture_lookups";
const LOOKUP_EVERY = 6 * 60 * 60 * 1000;
const LOOKUP_TRIES = 5;

/** Posts in the inbox that still have no picture, once their channel no longer offers one (a feed lists only its
 *  newest posts, and its picture addresses expire), get it from the post's own page, as a pasted link would. Each post
 *  is tried at most every 6 hours and 5 times in all, since some posts (text-only LinkedIn posts) have none. A few per
 *  check. Returns whether a post on the Insights page gained its picture. */
async function addPicturesFromPosts(source: "instagram" | "linkedin"): Promise<boolean> {
  const isPost = (url: string) => (source === "instagram" ? instagramPostId(url) : linkedinActivityId(url)) !== null;
  const missing = (await listItems()).filter((saved) => saved.source === source && !saved.image && saved.url && isPost(saved.url));
  const lookups = JSON.parse((await getSetting(PICTURE_LOOKUPS)) ?? "{}") as Record<string, { tries: number; at: number }>;
  const now = Date.now();
  const due = missing.filter((saved) => {
    const tried = lookups[`${source}:${saved.id}`];
    return !tried || (tried.tries < LOOKUP_TRIES && now - tried.at >= LOOKUP_EVERY);
  }).slice(0, 4);
  if (due.length === 0) return false;
  let shown = false;
  await Promise.all(
    due.map(async (saved) => {
      const key = `${source}:${saved.id}`;
      lookups[key] = { tries: (lookups[key]?.tries ?? 0) + 1, at: now };
      const imageId = await previewLink(saved.url).then((found) => found.item.imageId, () => undefined);
      if (!imageId) return;
      await changeItem(saved.id, { imageId });
      delete lookups[key];
      if (saved.status === "approved") shown = true;
    })
  );
  // Only posts still without a picture are remembered.
  const stillMissing = new Set(missing.map((saved) => `${source}:${saved.id}`));
  for (const key of Object.keys(lookups)) if (key.startsWith(`${source}:`) && !stillMissing.has(key)) delete lookups[key];
  await setSetting(PICTURE_LOOKUPS, JSON.stringify(lookups));
  return shown;
}

const INSTAGRAM_REELS_FOUND = "repaired:instagram-reels";

/** Once, for Instagram posts added before reels got a player (November 2026): a reel is told by its address, or by
 *  the importer having called it a reel (Instagram's API says which posts are videos). */
async function findInstagramReels(): Promise<void> {
  if (await getSetting(INSTAGRAM_REELS_FOUND)) return;
  for (const item of await listItems()) {
    if (item.source !== "instagram" || item.videoUrl || !item.url) continue;
    const code = instagramReelCode(item.url) ?? (item.meta === "Instagram reel" ? instagramPostId(item.url) : null);
    if (code) await changeItem(item.id, { videoUrl: instagramEmbedUrl(code) });
  }
  await setSetting(INSTAGRAM_REELS_FOUND, new Date().toISOString());
}

function builtInItem(item: InsightItem): SourceItem {
  const url = item.linkUrl ?? "";
  const activity = linkedinActivityId(url);
  const source: Source = item.youtubeId ? "youtube" : url.includes("wordpress.com") ? "wordpress" : activity ? "linkedin" : "link";
  const externalId =
    item.youtubeId ?? (source === "wordpress" ? normalizeUrl(url) : activity ?? `built-in:${item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 150)}`);
  const date = new Date(`${item.date} UTC`);
  return {
    source,
    externalId,
    kind: item.type,
    title: item.title,
    summary: item.description,
    content: item.content,
    url: url || (item.youtubeId ? `https://www.youtube.com/watch?v=${item.youtubeId}` : undefined),
    imageUrl: item.imageUrl,
    youtubeId: item.youtubeId,
    videoUrl: item.videoUrl,
    meta: item.meta,
    publishedAt: Number.isNaN(date.getTime()) ? new Date() : date,
  };
}

// ---------- Instagram's access ----------

interface InstagramAccess {
  token: string;
  /** Which INSTAGRAM_ACCESS_TOKEN this was renewed from: a new token in the environment starts over. */
  from: string;
  renewedAt: string | null;
  expiresAt: string | null;
}

/** The current Instagram token: INSTAGRAM_ACCESS_TOKEN, renewed every week and kept in the database, since a
 *  token lasts 60 days and the environment can't be updated from here. */
export async function instagramToken(): Promise<string | null> {
  const given = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!given) return null;
  const from = createHash("sha256").update(given).digest("hex").slice(0, 16);
  const saved = JSON.parse((await getSetting("instagram_access")) ?? "null") as InstagramAccess | null;
  let access: InstagramAccess = saved?.from === from ? saved : { token: given, from, renewedAt: null, expiresAt: null };
  if (!access.renewedAt || Date.now() - Date.parse(access.renewedAt) > 7 * 24 * 3600 * 1000) {
    try {
      const renewed = await renewInstagramToken(access.token);
      access = { token: renewed.token, from, renewedAt: new Date().toISOString(), expiresAt: renewed.expiresAt.toISOString() };
      await setSetting("instagram_access", JSON.stringify(access));
    } catch {
      // A token less than a day old can't be renewed yet: use it as it is and try again next time.
    }
  }
  return access.token;
}

// ---------- For the dashboard ----------

export interface InboxStatus {
  autoPublishSocial: SocialAutoPublish;
  lastSync: { at: string; results: SyncResult[] } | null;
  sources: Record<Source, SourceState>;
}

export async function inboxStatus(): Promise<InboxStatus> {
  const lastSync = JSON.parse((await getSetting("last_sync")) ?? "null") as InboxStatus["lastSync"];
  const result = (source: Source) => lastSync?.results.find((r) => r.source === source);
  const failed = (source: Source) => result(source)?.error;
  const instagram = JSON.parse((await getSetting("instagram_access")) ?? "null") as InstagramAccess | null;
  const state = (source: Source, ok: SourceState): SourceState => {
    const error = failed(source);
    if (error) return { state: "error", detail: error };
    const pictures = result(source)?.pictureProblem;
    return pictures ? { ...ok, detail: [ok.detail, pictures].filter(Boolean).join(" ") } : ok;
  };
  return {
    autoPublishSocial: await socialAutoPublishSettings(),
    lastSync,
    sources: {
      youtube: process.env.YOUTUBE_API_KEY
        ? state("youtube", { state: "connected", detail: "New uploads are checked automatically." })
        : { state: "not-set-up", detail: "Set YOUTUBE_API_KEY to bring in new uploads. Until then, paste video links." },
      wordpress: state("wordpress", { state: "connected", detail: "New blog posts are checked automatically." }),
      instagram: process.env.INSTAGRAM_FEED_URL
        ? state("instagram", { state: "connected", detail: "New Instagram posts come in through its feed. No Instagram access token is needed." })
        : process.env.INSTAGRAM_ACCESS_TOKEN
        ? state("instagram", {
            state: "connected",
            detail: instagram?.expiresAt
              ? `Renews itself every week. Current access lasts until ${new Date(instagram.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.`
              : "New posts are checked automatically.",
          })
        : { state: "not-set-up", detail: "Set INSTAGRAM_FEED_URL (or INSTAGRAM_ACCESS_TOKEN) to bring in new posts. Until then, paste post links." },
      linkedin: process.env.LINKEDIN_FEED_URL
        ? state("linkedin", { state: "connected", detail: "New company page posts come in through its feed. To add any other post, paste its link." })
        : { state: "manual", detail: "Paste a post's link to add it. To bring posts in by themselves, set LINKEDIN_FEED_URL (see the README)." },
      link: { state: "manual", detail: "Paste any article's link to add it." },
    },
  };
}

