import type { InsightItem } from "@/lib/insights";
import { displayDate, instagramPostId } from "./text";
import type { InboxItem } from "./types";

type CardFields = Pick<InboxItem, "kind" | "title" | "summary" | "meta" | "publishedAt" | "url" | "image" | "youtubeId" | "content" | "featured"> & Partial<Pick<InboxItem, "videoUrl" | "contentEdited">>;

/** Instagram posts whose picture never reached the inbox: the feed had dropped them before a check could copy it,
 *  so no later check can. Their pictures are kept in public/images/insights/instagram/<shortcode>.jpg. */
const STORED_INSTAGRAM_PICTURES = new Set(["DfALBAYMboD", "DfCfLAAu_Xu", "DfFArRxDAOP"]);

function storedPicture(url: string): string | undefined {
  const code = url ? instagramPostId(url) : null;
  return code && STORED_INSTAGRAM_PICTURES.has(code) ? `/images/insights/instagram/${code}.jpg` : undefined;
}

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
    imageUrl: item.image || storedPicture(item.url) || undefined,
    youtubeId: item.youtubeId || undefined,
    videoUrl: item.videoUrl || undefined,
    content: item.content || undefined,
    contentEdited: item.contentEdited ?? undefined,
    featured: item.featured || undefined,
  };
}
