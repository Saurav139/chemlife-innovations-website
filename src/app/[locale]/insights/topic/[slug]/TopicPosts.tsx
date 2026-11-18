"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import InsightCardContent, { INSIGHT_CARD_CLASS, isSocialPost } from "@/components/InsightCard";
import InsightVideoModal from "@/components/InsightVideoModal";
import { insightAnchor } from "@/lib/catalog";
import type { InsightItem } from "@/lib/insights";
import { topicPath } from "@/lib/insight-topics";
import { useMasonry } from "@/lib/masonry";

/** A topic page's posts: the Insights page's cards, newest first. An article opens its own page, a video or podcast
 *  plays here, and a LinkedIn or Instagram post opens in the Insights page's reader. Each card's tags lead to the
 *  other topics' pages. */
export default function TopicPosts({ items, topic }: { items: InsightItem[]; topic: string }) {
  const router = useRouter();
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  useMasonry(gridRef, [items.length]);

  // Escape closes the video player, and the page behind it doesn't scroll while it's open.
  useEffect(() => {
    if (!activeVideoId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveVideoId(null);
    };
    const root = document.documentElement;
    root.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [activeVideoId]);

  return (
    <>
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {items.map((item) => (
          <div key={`${item.type}|${item.linkUrl ?? item.youtubeId ?? ""}|${item.title}`} data-analytics-item={item.title} className={INSIGHT_CARD_CLASS}>
            <InsightCardContent
              item={item}
              imageLayout={isSocialPost(item) ? "natural" : "cropped"}
              centerTextWithoutImage
              onRead={(post) => router.push(`/insights#${insightAnchor(post.title)}`)}
              onPlay={setActiveVideoId}
              topicHref={topicPath}
              selectedTopics={[topic]}
            />
          </div>
        ))}
      </div>
      <InsightVideoModal videoId={activeVideoId} onClose={() => setActiveVideoId(null)} />
    </>
  );
}
