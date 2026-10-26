"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import { Images } from "@/lib/assets";
import type { Insights, InsightItem } from "@/lib/insights";
import { playOnPage, youtubeWatchUrl } from "@/lib/youtube";
import { insightAnchor } from "@/lib/catalog";
import { revealElement, useHashTarget } from "@/lib/deepLink";

const easeOut = [0.25, 0.1, 0, 1] as const;

// Card image widths for the browser to pick a file size from. They follow the grid and padding below.
const FEATURED_IMAGE_SIZES = "(min-width: 1024px) 282px, calc(100vw - 114px)";
const CARD_IMAGE_SIZES = "(min-width: 1024px) 312px, (min-width: 768px) calc(50vw - 90px), calc(100vw - 98px)";

// The grid shows this many cards at first, and this many more each time "Load more" is pressed.
const PAGE_SIZE = 6;

// Grid card buttons: the main action and the outside link, side by side at equal width, styled like the featured
// cards' buttons. Text is 12px where the cards are narrowest (phones under 400px, desktop 1024–1279px) so the longest
// label, "Read on WordPress", still fits.
const GRID_BTN =
  "inline-flex items-center justify-center min-h-11 text-center whitespace-nowrap px-2 py-2.5 rounded-full font-bold leading-5 text-xs min-[400px]:text-[13px] lg:text-xs xl:text-sm transition-all duration-300 cursor-pointer";
const GRID_BTN_PRIMARY = `${GRID_BTN} bg-teal-aa hover:bg-teal-700 text-white shadow-sm hover:shadow`;
const GRID_BTN_SECONDARY = `${GRID_BTN} border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-teal-aa`;
const READER_IMAGE_SIZES = "(min-width: 800px) 702px, calc(100vw - 82px)";

// Hosts next.config.ts lets the image optimizer fetch from. Anything else (LinkedIn) is shown as is.
const isOptimizable = (src: string) =>
  src.startsWith("/") ||
  src.startsWith("https://chemlifeinnovations.wordpress.com/wp-content/uploads/") ||
  src.startsWith("https://img.youtube.com/vi/");

/** A card button label that shortens on the narrowest phones (under 360px), where the full text doesn't fit
 *  beside the other button. Screen readers always get the full text. */
function ButtonLabel({ full, short }: { full: string; short: string }) {
  return (
    <>
      <span aria-hidden="true" className="min-[360px]:hidden">{short}</span>
      {/* max-[359px]:sr-only rather than sr-only + not-sr-only, which would undo the button's no-wrap and let the
          label break onto two lines just above 360px. */}
      <span className="max-[359px]:sr-only">{full}</span>
    </>
  );
}

export default function InsightsView({ blogs, podcasts, videos }: Insights) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [activeArticle, setActiveArticle] = useState<InsightItem | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  // Grid animation. Cards already on screen never move: only the cards "Load more" adds fade in (from `revealFrom`
  // on), a few at a time; a new filter or search fades the grid in as a whole. Nothing animates on first load.
  const reduceMotion = useReducedMotion();
  const [revealFrom, setRevealFrom] = useState(Infinity);
  const [gridVersion, setGridVersion] = useState(0);
  const loadMore = () => {
    setRevealFrom(visibleCount);
    setVisibleCount((count) => count + PAGE_SIZE);
  };
  const resetGrid = () => {
    setVisibleCount(PAGE_SIZE);
    setRevealFrom(Infinity);
    setGridVersion((v) => v + 1);
  };

  // Escape closes the video player or the article reader, and the page behind them doesn't scroll while one is open.
  const overlayOpen = !!activeVideoId || !!activeArticle;
  useEffect(() => {
    if (!overlayOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setActiveVideoId(null);
      setActiveArticle(null);
    };
    const root = document.documentElement;
    root.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [overlayOpen]);

  const filters = ["All", "Blogs", "Podcasts", "Videos"];

  // Helper to convert date string for sorting
  const getTimestamp = (dateStr: string) => {
    try {
      return new Date(dateStr).getTime();
    } catch {
      return 0;
    }
  };

  // Sort helper to get newest list
  const getSortedItems = (items: InsightItem[]) => {
    return [...items].sort((a, b) => getTimestamp(b.date) - getTimestamp(a.date));
  };

  // Compute featured items dynamically (guaranteed latest)
  const sortedBlogs = getSortedItems(blogs);
  const sortedPodcasts = getSortedItems(podcasts);
  const sortedVideos = getSortedItems(videos);

  const featuredBlog = sortedBlogs[0];
  const featuredPodcast = sortedPodcasts[0];
  const featuredVideo = sortedVideos[0];

  const featuredTitles = new Set([featuredBlog, featuredVideo, featuredPodcast].filter(Boolean).map((item) => item.title));

  // The grid's items for a filter and search: deduplicated, newest first, and for "All" interleaved as 1 video,
  // 1 podcast, 2 blogs. The newest blog, video and podcast are already in Featured above, so they're left out, unless
  // the visitor is searching (then every match is listed) or leaving them out would empty the grid.
  const gridItemsFor = (filter: string, rawQuery: string) => {
    const query = rawQuery.toLowerCase();
    const filterAndSort = (list: InsightItem[]) =>
      list
        .filter((item, index, self) => self.findIndex((x) => x.title === item.title) === index)
        .sort((a, b) => getTimestamp(b.date) - getTimestamp(a.date))
        .filter((item) => item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query));

    const filteredBlogs = filterAndSort(blogs);
    const filteredPodcasts = filterAndSort(podcasts);
    const filteredVideos = filterAndSort(videos);

    let items: InsightItem[] = [];
    if (filter === "Blogs") {
      items = filteredBlogs;
    } else if (filter === "Podcasts") {
      items = filteredPodcasts;
    } else if (filter === "Videos") {
      items = filteredVideos;
    } else {
      let vIndex = 0;
      let pIndex = 0;
      let bIndex = 0;
      while (vIndex < filteredVideos.length || pIndex < filteredPodcasts.length || bIndex < filteredBlogs.length) {
        if (vIndex < filteredVideos.length) items.push(filteredVideos[vIndex++]);
        if (pIndex < filteredPodcasts.length) items.push(filteredPodcasts[pIndex++]);
        for (let k = 0; k < 2; k++) {
          if (bIndex < filteredBlogs.length) items.push(filteredBlogs[bIndex++]);
        }
      }
    }

    const withoutFeatured = items.filter((item) => !featuredTitles.has(item.title));
    return rawQuery.trim() || withoutFeatured.length === 0 ? items : withoutFeatured;
  };

  const gridItems = gridItemsFor(selectedFilter, searchQuery);

  // Opens at one item from a link such as /insights#insight-feed-bites-… (the site search): an article opens in the
  // reader; a video or podcast is scrolled to (its card in Featured, or in the grid, showing enough cards to reach it).
  useHashTarget((target) => {
    const item = [...blogs, ...videos, ...podcasts].find((entry) => insightAnchor(entry.title) === target);
    if (!item) return;
    setSelectedFilter("All");
    setSearchQuery("");
    if (item.type === "Blog") {
      setActiveArticle(item);
      return;
    }
    const index = gridItemsFor("All", "").findIndex((entry) => entry.title === item.title);
    if (index >= 0) setVisibleCount(Math.max(PAGE_SIZE, Math.ceil((index + 1) / PAGE_SIZE) * PAGE_SIZE));
    revealElement(target, 500);
  });
  const visibleItems = gridItems.slice(0, visibleCount);

  return (
    <VariantProvider>
      <Header />

      <main className="bg-white min-h-screen text-brand-navy">
        {/* Hero and Featured are plain sections: they're in the first screen, so they show without waiting for a fade-in.
            The hero image is the page's largest paint (LCP), so it loads first. */}
        <section className="pt-26 md:pt-32 pb-10 md:pb-24 lg:pt-36 lg:pb-32 text-white relative overflow-hidden bg-brand-navy flex items-center">
          <div className="absolute inset-0 z-0">
            <Image
              src={Images.heroes.insights}
              alt="Biotechnology research papers and books backdrop"
              fill
              sizes="100vw"
              className="object-cover opacity-60"
              priority
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/90 via-brand-navy/60 to-brand-navy/35" />
            <div className="absolute inset-0 bg-black/10" />
          </div>

          <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full">
            <span className="text-teal-aa-light text-sm font-semibold tracking-widest uppercase block mb-3">
              Insights
            </span>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-6xl font-bold leading-tight mb-3 md:mb-4 text-white max-w-4xl">
              <span className="text-teal-400">Knowledge</span> & Perspectives
            </h1>
            <p className="text-white/85 text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl font-light">
              Stay updated with the latest industry trends, veterinary research, and biotechnology advancements.
            </p>
          </div>
        </section>

        {/* Featured Section (Three Columns) */}
        <section className="pt-10 md:pt-24 pb-8 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="mb-6 md:mb-10">
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-brand-navy">
                Featured
              </h2>
            </div>
            
            {/* Desktop: each card spans the same four rows (label line, title, image, buttons) through subgrid, so the
                titles, images and buttons line up across the three cards whatever their text length.
                The two buttons in each card are always the same width: half the card on phones and desktop, 192px
                on tablets. On 1024–1279px screens, where the cards are narrowest, their text is 12px so the longest
                label ("Read on WordPress") still fits. */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-8 lg:gap-x-6 lg:gap-y-0">
              
              {/* Featured Blog */}
              {featuredBlog && (
                <div
                  id={insightAnchor(featuredBlog.title)}
                  data-analytics-item={featuredBlog.title}
                  data-analytics-click="Read Article"
                  className="scroll-mt-28 bg-gray-55 border border-gray-200 rounded-2xl md:rounded-3xl p-5 md:p-8 lg:p-5 xl:p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between lg:grid lg:grid-rows-subgrid lg:row-span-4 lg:gap-y-0 group cursor-pointer"
                  onClick={() => setActiveArticle(featuredBlog)}
                >
                  <div className="lg:contents">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-50 text-teal-700">
                        Blog
                      </span>
                      <span className="text-xs text-gray-aa font-medium">Featured • {featuredBlog.date} • {featuredBlog.meta}</span>
                    </div>
                    <h3 className="font-heading text-lg md:text-xl lg:text-2xl font-bold text-brand-navy mb-4 md:mb-6 group-hover:text-teal-aa transition-colors duration-300 line-clamp-3">
                      {featuredBlog.title}
                    </h3>
                    
                    {/* Blog Image Preview */}
                    {featuredBlog.imageUrl && (
                      <div className="relative w-full aspect-video rounded-xl md:rounded-2xl overflow-hidden bg-slate-100 border border-gray-200 select-none mb-4">
                        <Image
                          src={featuredBlog.imageUrl}
                          alt={featuredBlog.title}
                          fill
                          sizes={FEATURED_IMAGE_SIZES}
                          className="object-cover group-hover:scale-102 transition-transform duration-500"
                          unoptimized={!isOptimizable(featuredBlog.imageUrl)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-[repeat(2,12rem)] lg:grid-cols-2 lg:row-start-4 items-center gap-2 sm:gap-4 lg:gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveArticle(featuredBlog);
                      }}
                      className="inline-flex items-center justify-center min-h-11 text-center whitespace-nowrap px-2 sm:px-6 lg:px-2 py-2.5 rounded-full text-[13px] sm:text-sm lg:text-xs xl:text-sm leading-5 bg-teal-aa hover:bg-teal-700 text-white font-bold shadow-sm hover:shadow transition-all duration-300 cursor-pointer"
                    >
                      Read Article
                    </button>
                    <a
                      href={featuredBlog.linkUrl || "https://www.linkedin.com/company/chemlifeinnovations/posts/?feedView=all"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center min-h-11 text-center whitespace-nowrap px-2 sm:px-6 lg:px-2 py-2.5 rounded-full text-[13px] sm:text-sm lg:text-xs xl:text-sm leading-5 border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-teal-aa font-bold transition-all duration-300 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {featuredBlog.linkUrl?.includes("wordpress.com")
                        ? <ButtonLabel full="Read on WordPress" short="WordPress" />
                        : <ButtonLabel full="View on LinkedIn" short="LinkedIn" />}
                    </a>
                  </div>
                </div>
              )}

              {/* Featured Video */}
              {featuredVideo && (
                <div
                  id={insightAnchor(featuredVideo.title)}
                  data-analytics-item={featuredVideo.title}
                  className="scroll-mt-28 bg-gray-55 border border-gray-200 rounded-2xl md:rounded-3xl p-5 md:p-8 lg:p-5 xl:p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between lg:grid lg:grid-rows-subgrid lg:row-span-4 lg:gap-y-0 group"
                >
                  <div className="lg:contents">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                        Video
                      </span>
                      <span className="text-xs text-gray-aa font-medium">Featured • {featuredVideo.date} • {featuredVideo.meta}</span>
                    </div>
                    <h3 className="font-heading text-lg md:text-xl lg:text-2xl font-bold text-brand-navy mb-4 md:mb-6 group-hover:text-teal-aa transition-colors duration-300 line-clamp-3">
                      {featuredVideo.title}
                    </h3>
                    
                    {/* YouTube Preview Thumbnail */}
                    {featuredVideo.youtubeId && (
                      <a
                        href={youtubeWatchUrl(featuredVideo.youtubeId!)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => playOnPage(e, () => setActiveVideoId(featuredVideo.youtubeId!))}
                        aria-label={featuredVideo.title}
                        data-analytics-click="Watch Now"
                        className="block relative w-full aspect-video rounded-xl md:rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 cursor-pointer shadow-sm group/video select-none mb-4"
                      >
                        <Image
                          src={`https://img.youtube.com/vi/${featuredVideo.youtubeId}/0.jpg`}
                          alt={featuredVideo.title}
                          fill
                          sizes={FEATURED_IMAGE_SIZES}
                          className="object-cover group-hover/video:scale-103 transition-transform duration-500 opacity-90"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover/video:bg-black/20 transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-10 rounded-xl bg-red-600 group-hover/video:bg-red-700 flex items-center justify-center text-white transition-all shadow-md group-hover/video:scale-110">
                            <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-[repeat(2,12rem)] lg:grid-cols-2 lg:row-start-4 items-center gap-2 sm:gap-4 lg:gap-2 pt-4 border-t border-gray-100">
                    <a
                      href={youtubeWatchUrl(featuredVideo.youtubeId!)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => playOnPage(e, () => setActiveVideoId(featuredVideo.youtubeId!))}
                      className="inline-flex items-center justify-center min-h-11 text-center whitespace-nowrap px-2 sm:px-6 lg:px-2 py-2.5 rounded-full text-[13px] sm:text-sm lg:text-xs xl:text-sm leading-5 bg-teal-aa hover:bg-teal-700 text-white font-bold shadow-sm hover:shadow transition-all duration-300 cursor-pointer"
                    >
                      Watch Now
                    </a>
                    <a
                      href={`https://www.youtube.com/watch?v=${featuredVideo.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center min-h-11 text-center whitespace-nowrap px-2 sm:px-6 lg:px-2 py-2.5 rounded-full text-[13px] sm:text-sm lg:text-xs xl:text-sm leading-5 border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-teal-aa font-bold transition-all duration-300"
                    >
                      <ButtonLabel full="Watch on YouTube" short="YouTube" />
                    </a>
                  </div>
                </div>
              )}

              {/* Featured Podcast */}
              {featuredPodcast && (
                <div
                  id={insightAnchor(featuredPodcast.title)}
                  data-analytics-item={featuredPodcast.title}
                  className="scroll-mt-28 bg-gray-55 border border-gray-200 rounded-2xl md:rounded-3xl p-5 md:p-8 lg:p-5 xl:p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between lg:grid lg:grid-rows-subgrid lg:row-span-4 lg:gap-y-0 group"
                >
                  <div className="lg:contents">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-50 text-red-700">
                        Podcast
                      </span>
                      <span className="text-xs text-gray-aa font-medium">Featured • {featuredPodcast.date} • {featuredPodcast.meta}</span>
                    </div>
                    <h3 className="font-heading text-lg md:text-xl lg:text-2xl font-bold text-brand-navy mb-4 md:mb-6 group-hover:text-teal-aa transition-colors duration-300 line-clamp-3">
                      {featuredPodcast.title}
                    </h3>
                    
                    {/* YouTube Preview Thumbnail */}
                    {featuredPodcast.youtubeId && (
                      <a
                        href={youtubeWatchUrl(featuredPodcast.youtubeId!)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => playOnPage(e, () => setActiveVideoId(featuredPodcast.youtubeId!))}
                        aria-label={featuredPodcast.title}
                        data-analytics-click="Listen Now"
                        className="block relative w-full aspect-video rounded-xl md:rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 cursor-pointer shadow-sm group/video select-none mb-4"
                      >
                        <Image
                          src={`https://img.youtube.com/vi/${featuredPodcast.youtubeId}/0.jpg`}
                          alt={featuredPodcast.title}
                          fill
                          sizes={FEATURED_IMAGE_SIZES}
                          className="object-cover group-hover/video:scale-103 transition-transform duration-500 opacity-90"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover/video:bg-black/20 transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-10 rounded-xl bg-red-600 group-hover/video:bg-red-700 flex items-center justify-center text-white transition-all shadow-md group-hover/video:scale-110">
                            <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-[repeat(2,12rem)] lg:grid-cols-2 lg:row-start-4 items-center gap-2 sm:gap-4 lg:gap-2 pt-4 border-t border-gray-100">
                    <a
                      href={youtubeWatchUrl(featuredPodcast.youtubeId!)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => playOnPage(e, () => setActiveVideoId(featuredPodcast.youtubeId!))}
                      className="inline-flex items-center justify-center min-h-11 text-center whitespace-nowrap px-2 sm:px-6 lg:px-2 py-2.5 rounded-full text-[13px] sm:text-sm lg:text-xs xl:text-sm leading-5 bg-teal-aa hover:bg-teal-700 text-white font-bold shadow-sm hover:shadow transition-all duration-300 cursor-pointer"
                    >
                      Listen Now
                    </a>
                    <a
                      href={`https://www.youtube.com/watch?v=${featuredPodcast.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center min-h-11 text-center whitespace-nowrap px-2 sm:px-6 lg:px-2 py-2.5 rounded-full text-[13px] sm:text-sm lg:text-xs xl:text-sm leading-5 border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-teal-aa font-bold transition-all duration-300"
                    >
                      <ButtonLabel full="Watch on YouTube" short="YouTube" />
                    </a>
                  </div>
                </div>
              )}

            </div>

          </div>
        </section>

        {/* Social Channel Connectors Banner */}
        <SectionWrapper className="py-6 bg-slate-50 border-y border-gray-200/60">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="https://www.linkedin.com/company/chemlifeinnovations/posts/?feedView=all"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-xs transition-all duration-300"
              >
                <div className="w-12 h-12 bg-[#0a66c2]/10 text-[#0a66c2] rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-brand-navy text-sm">Follow us on LinkedIn</h4>
                  <p className="text-gray-aa text-xs mt-0.5">Smarter Decisions for Better Outcomes via #FeedBites</p>
                </div>
              </a>
              <a
                href="https://www.youtube.com/@chemlifeinnovations2739"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200 hover:border-red-500 hover:shadow-xs transition-all duration-300"
              >
                <div className="w-12 h-12 bg-red-600/10 text-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.388.555A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.48 20.5 12 20.5 12 20.5s7.52 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-brand-navy text-sm">Subscribe on YouTube</h4>
                  <p className="text-gray-aa text-xs mt-0.5">Watch expert talks, video insights, and podcast content</p>
                </div>
              </a>
            </div>
          </div>
        </SectionWrapper>

        {/* Filters and Search Row */}
        <SectionWrapper className="pt-12 pb-8 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-gray-100">
              
              {/* Search Bar + Subtitle */}
              <div className="w-full md:max-w-md">
                <span className="text-gray-aa text-xs font-semibold uppercase tracking-wider block mb-2">
                  Search Podcasts, Blogs and Videos
                </span>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); resetGrid(); }}
                    placeholder="Search titles, topics, or authors..."
                    className="w-full bg-gray-50 border border-gray-250 rounded-full px-6 py-3 text-base md:text-sm text-brand-navy placeholder-gray-aa focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-300 shadow-sm"
                  />
                  <div className="absolute right-4 top-3.5 text-gray-aa">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Oval Filter Pills */}
              <div className="flex flex-wrap gap-3">
                {filters.map((filter) => {
                  const isActive = selectedFilter === filter;
                  return (
                    <button
                      key={filter}
                      onClick={() => { setSelectedFilter(filter); resetGrid(); }}
                      className={`tap-target px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 border cursor-pointer ${
                        isActive
                          ? "bg-teal-aa border-teal-600 text-white shadow-sm"
                          : "bg-gray-100 border-transparent text-gray-aa hover:bg-gray-200"
                      }`}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>

            </div>
          </div>
        </SectionWrapper>

        {/* Separator Section */}
        <div className="max-w-[1200px] mx-auto px-6 mb-8">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-gray-aa uppercase tracking-wider whitespace-nowrap">
              Explore All Insights ({gridItems.length})
            </span>
            <div className="w-full h-[1px] bg-gray-150" />
          </div>
        </div>

        {/* Combined Grid Section */}
        <SectionWrapper className="pt-0 pb-24 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            
            <motion.div
              key={gridVersion}
              initial={gridVersion === 0 || reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-x-6"
            >
                {visibleItems.map((item, index) => {
                  const isBlog = item.type === "Blog";
                  const isNew = index >= revealFrom;
                  return (
                    <motion.div
                      key={item.title}
                      id={featuredTitles.has(item.title) ? undefined : insightAnchor(item.title)}
                      data-analytics-item={item.title}
                      initial={isNew ? (reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }) : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: easeOut, delay: isNew ? Math.min(index - revealFrom, 5) * 0.06 : 0 }}
                      className="scroll-mt-28 bg-gray-55 border border-gray-200 rounded-2xl p-5 md:p-6 lg:p-5 xl:p-6 shadow-sm hover:shadow-md hover:border-teal-500/20 transition-[box-shadow,border-color] duration-300 group flex flex-col justify-between"
                    >
                      {/* Clickable Area of Card Content */}
                      <div
                        className={isBlog ? "cursor-pointer" : ""}
                        data-analytics-click={isBlog ? "Read Article" : undefined}
                        onClick={() => {
                          if (isBlog) {
                            if (item.linkUrl?.includes("wordpress.com")) {
                              window.open(item.linkUrl, "_blank", "noopener,noreferrer");
                            } else {
                              setActiveArticle(item);
                            }
                          }
                        }}
                      >
                        {/* Meta Category & Date Info */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            item.type === "Blog"
                              ? "bg-teal-50 text-teal-700"
                              : item.type === "Podcast"
                              ? "bg-red-50 text-red-700"
                              : "bg-blue-50 text-blue-700"
                          }`}>
                            {item.type}
                          </span>
                          <span className="text-xs text-gray-aa font-medium">
                            {item.date} • {item.meta}
                          </span>
                        </div>

                        {/* Blog Image Preview (Only images for blogs, no videos) */}
                        {isBlog && item.imageUrl && (
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 bg-slate-100 border border-gray-200 select-none">
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
                            onClick={(e) => playOnPage(e, () => setActiveVideoId(item.youtubeId!))}
                            aria-label={item.title}
                            data-analytics-click={item.type === "Podcast" ? "Listen Now" : "Watch Now"}
                            className="block relative w-full aspect-video rounded-xl overflow-hidden mb-4 bg-slate-900 border border-slate-200/80 cursor-pointer shadow-sm group/video select-none"
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
                              <div className="w-12 h-8 rounded-lg bg-red-600 group-hover/video:bg-red-700 flex items-center justify-center text-white transition-all shadow-md group-hover/video:scale-110">
                                <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          </a>
                        )}

                        <h4 className="font-heading text-lg font-bold text-brand-navy mb-4 group-hover:text-teal-aa transition-colors duration-300 line-clamp-3">
                          {item.title}
                        </h4>
                      </div>

                      {/* Card buttons, outside the clickable area above */}
                      <div className="grid grid-cols-2 gap-2 pt-4 mt-2 border-t border-gray-100">
                        {isBlog ? (
                          <>
                            <button onClick={() => setActiveArticle(item)} className={GRID_BTN_PRIMARY}>
                              Read Article
                            </button>
                            <a
                              href={item.linkUrl || "https://www.linkedin.com/company/chemlifeinnovations/posts/?feedView=all"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={GRID_BTN_SECONDARY}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {item.linkUrl?.includes("wordpress.com")
                                ? <ButtonLabel full="Read on WordPress" short="WordPress" />
                                : <ButtonLabel full="View on LinkedIn" short="LinkedIn" />}
                            </a>
                          </>
                        ) : (
                          <>
                            <a
                              href={youtubeWatchUrl(item.youtubeId!)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => playOnPage(e, () => setActiveVideoId(item.youtubeId!))}
                              className={GRID_BTN_PRIMARY}
                            >
                              {item.type === "Podcast" ? "Listen Now" : "Watch Now"}
                            </a>
                            <a
                              href={`https://www.youtube.com/watch?v=${item.youtubeId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={GRID_BTN_SECONDARY}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ButtonLabel full="Watch on YouTube" short="YouTube" />
                            </a>
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
            </motion.div>

            {gridItems.length > visibleCount && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  className="inline-flex items-center justify-center min-h-12 px-8 rounded-full border-2 border-teal-aa text-teal-aa hover:bg-teal-aa hover:text-white text-sm font-bold transition-colors cursor-pointer"
                >
                  Load more ({gridItems.length - visibleCount} more)
                </button>
              </div>
            )}

            {gridItems.length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <span className="text-gray-aa text-sm">No insights found matching your search query.</span>
              </div>
            )}

          </div>
        </SectionWrapper>
      </main>

      {/* YouTube Video Modal Overlay */}
      <AnimatePresence>
        {activeVideoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 p-4"
            onClick={() => setActiveVideoId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button above the player, so it doesn't cover YouTube's own controls */}
              <div className="flex justify-end mb-3">
                <button
                  onClick={() => setActiveVideoId(null)}
                  className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/15"
                  aria-label="Close video player"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              {/* YouTube Iframe Embed */}
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&rel=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; compute-pressure; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blog Article Reader Modal Overlay */}
      <AnimatePresence>
        {activeArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={() => setActiveArticle(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col my-8 max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Sticky Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-50 text-teal-700">
                    {activeArticle.type}
                  </span>
                  <span className="text-xs text-gray-aa font-medium">
                    {activeArticle.date}
                  </span>
                </div>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-brand-navy flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Close article reader"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Scrollable Article Body */}
              <div className="overflow-y-auto p-6 md:p-8 space-y-6">
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-navy leading-tight">
                  {activeArticle.title}
                </h2>

                {activeArticle.imageUrl && (
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-gray-250 select-none">
                    <Image
                      src={activeArticle.imageUrl}
                      alt={activeArticle.title}
                      fill
                      sizes={READER_IMAGE_SIZES}
                      className="object-cover"
                      unoptimized={!isOptimizable(activeArticle.imageUrl)}
                    />
                  </div>
                )}

                <div className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-line space-y-4">
                  {activeArticle.content}
                </div>
              </div>

              {/* Footer Action */}
              <div className="border-t border-gray-100 px-6 py-4 flex justify-between bg-gray-50 items-center">
                {activeArticle.linkUrl && (
                  <a
                    href={activeArticle.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-teal-aa hover:text-teal-700 transition-colors"
                  >
                    {activeArticle.linkUrl.includes("wordpress.com") ? "Read the full article on WordPress →" : "View post on LinkedIn →"}
                  </a>
                )}
                <button
                  onClick={() => setActiveArticle(null)}
                  className="whitespace-nowrap px-6 py-2.5 rounded-full bg-brand-navy text-white font-bold text-sm hover:bg-teal-aa transition-colors cursor-pointer"
                >
                  Close Reader
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
