"use client";

import Image from "next/image";
import NaturalInsightImage from "@/components/NaturalInsightImage";
import type { InsightItem } from "@/lib/insights";
import { playOnPage, youtubeWatchUrl } from "@/lib/youtube";

// A card in the Insights page's grid. The Insights inbox shows the same card as its live preview, so what the
// moderator sees while editing is what the page shows.

// Card image widths for the browser to pick a file size from. They follow the grid and padding on the Insights page.
const CARD_IMAGE_SIZES = "(min-width: 1024px) 312px, (min-width: 768px) calc(50vw - 90px), calc(100vw - 98px)";

/** The card's frame. The Insights page adds its anchor and animation around it. */
export const INSIGHT_CARD_CLASS =
  "bg-card border border-line rounded-[1.5rem] p-5 md:p-6 hover:border-ink/40 transition-colors duration-300 group flex flex-col justify-between";

// Hosts next.config.ts lets the image optimizer fetch from. Anything else (LinkedIn) is shown as is.
export const isOptimizable = (src: string) =>
  src.startsWith("/") ||
  src.startsWith("https://chemlifeinnovations.wordpress.com/wp-content/uploads/") ||
  src.startsWith("https://img.youtube.com/vi/");

/** The labels for a post's link to its original: WordPress, Instagram, LinkedIn (the default), or another site. */
export function originalLink(url?: string) {
  let host = "";
  try {
    host = url ? new URL(url).hostname : "";
  } catch {}
  if (host.endsWith("wordpress.com")) return { full: "Read on WordPress", short: "WordPress", reader: "Read the full article on WordPress →" };
  if (host.endsWith("instagram.com")) return { full: "View on Instagram", short: "Instagram", reader: "View post on Instagram →" };
  if (!host || host.endsWith("linkedin.com")) return { full: "View on LinkedIn", short: "LinkedIn", reader: "View post on LinkedIn →" };
  return { full: "Read the original", short: "Original", reader: "Read the original →" };
}

/** What goes inside the card's frame: the label line, picture or video, title, and the two links. */
export default function InsightCardContent({ item, onRead, onPlay, imageLayout = "cropped", centerTextWithoutImage = false }: {
  item: InsightItem;
  /** Opens the article reader. */
  onRead: (item: InsightItem) => void;
  /** Opens the video player. */
  onPlay: (youtubeId: string) => void;
  /** Design preview only; existing cards keep their 16:9 crop. */
  imageLayout?: "cropped" | "natural";
  /** Preview treatment for LinkedIn posts whose feed has no picture. */
  centerTextWithoutImage?: boolean;
}) {
  const isBlog = item.type === "Blog";
  const textOnly = centerTextWithoutImage && isBlog && !item.imageUrl && originalLink(item.linkUrl).short === "LinkedIn";
  return (
    <>
      {/* Clickable Area of Card Content */}
      <div
        className={`${isBlog ? "cursor-pointer" : ""} ${textOnly ? "flex flex-1 flex-col items-center justify-center py-6 text-center sm:py-8" : ""}`}
        data-analytics-click={isBlog ? "Read Article" : undefined}
        onClick={() => {
          if (isBlog) {
            if (item.linkUrl?.includes("wordpress.com")) {
              window.open(item.linkUrl, "_blank", "noopener,noreferrer");
            } else {
              onRead(item);
            }
          }
        }}
      >
        {/* Meta Category & Date Info */}
        <div className={`flex items-center gap-2 mb-3 ${textOnly ? "flex-wrap justify-center" : ""}`}>
          <span className={`label-mono text-[11px] px-2.5 py-1 rounded-full ${
            item.type === "Blog"
              ? "bg-mint/15 text-mint"
              : item.type === "Podcast"
              ? "bg-flame/10 text-flame"
              : "bg-[#305280]/10 text-[#305280]"
          }`}>
            {item.type}
          </span>
          <span className="label-mono text-[11px] text-copy-dim normal-case tracking-normal">
            {item.date} • {item.meta}
          </span>
        </div>

        {/* Blog Image Preview (Only images for blogs, no videos) */}
        {isBlog && item.imageUrl && (
          imageLayout === "natural" ? <div className="mb-4">
            <NaturalInsightImage src={item.imageUrl} alt={item.title} sizes={CARD_IMAGE_SIZES} />
          </div> :
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-4 bg-card-hi select-none">
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              sizes={CARD_IMAGE_SIZES}
              className="object-cover group-hover:scale-103 transition-transform duration-500"
              unoptimized={!isOptimizable(item.imageUrl)}
            />
          </div>
        )}

        {/* Podcast YouTube Preview (Only in Podcast/Video item types) */}
        {!isBlog && item.youtubeId && (
          <a
            href={youtubeWatchUrl(item.youtubeId!)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => playOnPage(e, () => onPlay(item.youtubeId!))}
            aria-label={item.title}
            data-analytics-click={item.type === "Podcast" ? "Listen Now" : "Watch Now"}
            className="block relative w-full aspect-video rounded-2xl overflow-hidden mb-4 bg-card-hi cursor-pointer group/video select-none"
          >
            <Image
              src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
              alt={item.title}
              fill
              sizes={CARD_IMAGE_SIZES}
              className="object-cover group-hover/video:scale-105 transition-transform duration-500 opacity-90"
            />
            <div className="absolute inset-0 bg-black/20 group-hover/video:bg-black/30 transition-colors" />
            {/* YouTube Red Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-brand-orange-aa flex items-center justify-center text-white transition-transform shadow-md group-hover/video:scale-110">
                <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </a>
        )}

        <h4 className={`font-display text-xl leading-snug text-ink mb-4 group-hover:text-flame transition-colors duration-300 ${textOnly ? "max-w-prose" : "line-clamp-3"}`}>
          {item.title}
        </h4>
        {textOnly && item.description && <p className="max-w-prose text-sm leading-relaxed text-copy">{item.description}</p>}
      </div>

      {/* Card Action Buttons (Direct + View on LinkedIn) - isolated outside clicking div */}
      <div className="flex items-center gap-3 pt-3 border-t border-line mt-2">
        {isBlog ? (
          <div className="flex items-center gap-2 w-full justify-between">
            <button
              onClick={() => onRead(item)}
              className="tap-target text-sm font-bold text-flame hover:text-ink transition-colors flex items-center gap-1 cursor-pointer"
            >
              Read Article
            </button>
            <a
              href={item.linkUrl || "https://www.linkedin.com/company/chemlifeinnovations/"}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target text-sm font-semibold text-copy hover:text-ink transition-colors cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              {originalLink(item.linkUrl).full}
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full justify-between">
            <a
              href={youtubeWatchUrl(item.youtubeId!)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => playOnPage(e, () => onPlay(item.youtubeId!))}
              className="tap-target text-sm font-bold text-flame hover:text-ink transition-colors flex items-center gap-1"
            >
              {item.type === "Podcast" ? "Listen Now" : "Watch Now"}
            </a>
            <a
              href={`https://www.youtube.com/watch?v=${item.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target text-sm font-semibold text-copy hover:text-ink transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Watch on YouTube
            </a>
          </div>
        )}
      </div>
    </>
  );
}
