import type { InsightItem } from "@/lib/insights";
import { displayDate } from "./text";
import type { InboxItem } from "./types";

type CardFields = Pick<InboxItem, "kind" | "title" | "summary" | "meta" | "publishedAt" | "url" | "image" | "youtubeId" | "content" | "featured">;

/** How a post appears on the Insights page. Shared by the page's data and the inbox's live preview, so the preview
 *  shows exactly what the page will. */
export function insightCard(item: CardFields): InsightItem {
  return {
    type: item.kind,
    title: item.title,
    description: item.summary,
    meta: item.meta,
    date: displayDate(new Date(item.publishedAt)),
    linkUrl: item.url || undefined,
    imageUrl: item.image || undefined,
    youtubeId: item.youtubeId || undefined,
    content: item.content || undefined,
    featured: item.featured || undefined,
  };
}
