import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { FALLBACK_INSIGHTS, type InsightItem } from "@/lib/insights";
import { addItems, getSetting, knownIds, removeUnusedImages, setSetting } from "./db";
import { copyImage } from "./preview";
import { fetchInstagramPosts, fetchWordPressPosts, fetchYouTubeUploads, renewInstagramToken } from "./sources";
import { linkedinActivityId, normalizeUrl } from "./text";
import type { Source, SourceItem, SourceState, SyncResult } from "./types";

// Checking the channels for new posts. New posts wait in the inbox for the moderator, except on the very first
// check, when what the Insights page already showed goes straight on: its built-in list, and YouTube's uploads.

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
  revalidatePath("/[locale]/insights", "page");
}

async function runSync(): Promise<SyncResult[]> {
  const started = await startInbox();
  const results = [
    await importFrom("youtube", () => fetchYouTubeUploads({ fresh: true }), "approved-first:youtube"),
    await importFrom("wordpress", () => fetchWordPressPosts({ fresh: true })),
    await importFrom("instagram", async () => {
      const token = await instagramToken();
      return token ? fetchInstagramPosts(token) : null;
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
    const fresh = items.filter((item) => !known.has(item.externalId));
    for (const item of fresh) {
      if (!item.copyImage || !item.imageUrl) continue;
      // The source's picture address expires, so keep a copy; without one the card shows a stock photo.
      item.imageId = await copyImage(item.imageUrl).catch(() => undefined);
      item.imageUrl = undefined;
    }
    const approveNow = firstTimeApproved ? !(await getSetting(firstTimeApproved)) : false;
    const added = await addItems(fresh, approveNow ? "approved" : "pending");
    if (approveNow) await setSetting(firstTimeApproved!, new Date().toISOString());
    return { source, added, approved: approveNow };
  } catch (error) {
    return { source, added: 0, approved: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// ---------- Starting the inbox ----------

/** The first time: copies the page's built-in list in as approved posts, so nothing on the page changes. Returns
 *  whether it did. */
export async function startInbox(): Promise<boolean> {
  if (await getSetting("started")) return false;
  const { blogs, podcasts, videos } = FALLBACK_INSIGHTS;
  await addItems([...blogs, ...podcasts, ...videos].map(builtInItem), "approved");
  await setSetting("started", new Date().toISOString());
  return true;
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
async function instagramToken(): Promise<string | null> {
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
  lastSync: { at: string; results: SyncResult[] } | null;
  sources: Record<Source, SourceState>;
}

export async function inboxStatus(): Promise<InboxStatus> {
  const lastSync = JSON.parse((await getSetting("last_sync")) ?? "null") as InboxStatus["lastSync"];
  const failed = (source: Source) => lastSync?.results.find((r) => r.source === source)?.error;
  const instagram = JSON.parse((await getSetting("instagram_access")) ?? "null") as InstagramAccess | null;
  const state = (source: Source, ok: SourceState): SourceState => {
    const error = failed(source);
    return error ? { state: "error", detail: error } : ok;
  };
  return {
    lastSync,
    sources: {
      youtube: process.env.YOUTUBE_API_KEY
        ? state("youtube", { state: "connected", detail: "New uploads are checked automatically." })
        : { state: "not-set-up", detail: "Set YOUTUBE_API_KEY to bring in new uploads. Until then, paste video links." },
      wordpress: state("wordpress", { state: "connected", detail: "New blog posts are checked automatically." }),
      instagram: process.env.INSTAGRAM_ACCESS_TOKEN
        ? state("instagram", {
            state: "connected",
            detail: instagram?.expiresAt
              ? `Renews itself every week. Current access lasts until ${new Date(instagram.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.`
              : "New posts are checked automatically.",
          })
        : { state: "not-set-up", detail: "Set INSTAGRAM_ACCESS_TOKEN to bring in new posts. Until then, paste post links." },
      linkedin: { state: "manual", detail: "Paste a post's link to add it." },
      link: { state: "manual", detail: "Paste any article's link to add it." },
    },
  };
}

