import { KINDS, SOURCES, STATUSES, type ItemChanges, type Kind, type Source, type SourceItem, type Status } from "@/lib/insights-store/types";

// Checks what the dashboard sends before it reaches the database.

const text = (value: unknown, max: number): string | undefined =>
  typeof value === "string" ? value.trim().slice(0, max) : undefined;

const webAddress = (value: unknown): string | undefined => {
  if (typeof value !== "string" || !value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
};

const picture = (value: unknown): string | undefined =>
  typeof value === "string" && (value.startsWith("/images/") || value.startsWith("/api/insights/media/")) ? value : webAddress(value);

export function parseChanges(body: Record<string, unknown>): ItemChanges | string {
  const changes: ItemChanges = {};
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status as Status)) return "Unknown status.";
    changes.status = body.status as Status;
  }
  if (body.featured !== undefined) changes.featured = Boolean(body.featured);
  if (body.kind !== undefined) {
    if (!KINDS.includes(body.kind as Kind)) return "Unknown type.";
    changes.kind = body.kind as Kind;
  }
  if (body.title !== undefined) {
    const title = text(body.title, 300);
    if (!title) return "A post needs a title.";
    changes.title = title;
  }
  if (body.summary !== undefined) changes.summary = text(body.summary, 2000) ?? "";
  if (body.content !== undefined) changes.content = text(body.content, 100_000) ?? "";
  if (body.meta !== undefined) changes.meta = text(body.meta, 60) ?? "";
  if (body.imageId !== undefined) changes.imageId = body.imageId === null ? null : Number(body.imageId) || null;
  if (body.publishedAt !== undefined) {
    const date = new Date(String(body.publishedAt));
    if (Number.isNaN(date.getTime())) return "That date isn't valid.";
    changes.publishedAt = date;
  }
  return changes;
}

export function parseNewItem(body: Record<string, unknown>): SourceItem | string {
  const source = body.source as Source;
  if (!SOURCES.includes(source)) return "Unknown source.";
  const kind = body.kind as Kind;
  if (!KINDS.includes(kind)) return "Unknown type.";
  const externalId = text(body.externalId, 191);
  const title = text(body.title, 300);
  if (!externalId) return "The post has no address.";
  if (!title) return "A post needs a title.";
  const youtubeId = typeof body.youtubeId === "string" && /^[\w-]{11}$/.test(body.youtubeId) ? body.youtubeId : undefined;
  if (kind !== "Blog" && !youtubeId) return "Only YouTube videos can be shown as a video or podcast.";
  const publishedAt = new Date(String(body.publishedAt));
  return {
    source,
    externalId,
    kind,
    title,
    summary: text(body.summary, 2000) ?? "",
    content: text(body.content, 100_000),
    url: webAddress(body.url),
    imageUrl: picture(body.imageUrl),
    imageId: Number(body.imageId) || undefined,
    youtubeId,
    meta: text(body.meta, 60) ?? "",
    publishedAt: Number.isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
  };
}
