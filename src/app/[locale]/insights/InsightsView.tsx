"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import InsightCardContent, { INSIGHT_CARD_CLASS, isOptimizable, originalLink } from "@/components/InsightCard";
import { Images } from "@/lib/assets";
import type { Insights, InsightItem } from "@/lib/insights";
import { playOnPage, youtubeWatchUrl } from "@/lib/youtube";
import { insightAnchor } from "@/lib/catalog";
import { revealElement, useHashTarget } from "@/lib/deepLink";

const easeOut = [0.25, 0.1, 0, 1] as const;

// Featured card image widths for the browser to pick a file size from. They follow the grid and padding below.
const FEATURED_IMAGE_SIZES = "(min-width: 1024px) 282px, (min-width: 640px) 40vw, calc(100vw - 114px)";

// The grid shows this many cards at first, and this many more each time "Load more" is pressed.
const PAGE_SIZE = 6;

const READER_IMAGE_SIZES = "(min-width: 800px) 702px, calc(100vw - 82px)";

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

  // The post chosen as featured in the Insights inbox, else the newest.
  const featuredBlog = sortedBlogs.find((item) => item.featured) ?? sortedBlogs[0];
  const featuredPodcast = sortedPodcasts.find((item) => item.featured) ?? sortedPodcasts[0];
  const featuredVideo = sortedVideos.find((item) => item.featured) ?? sortedVideos[0];

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

      <main id="main" tabIndex={-1}>
        {/* Hero and Featured are plain sections: they're in the first screen, so they show without waiting for a fade-in.
            The hero image is the page's largest paint (LCP), so it loads first. */}
        <PageHero
          title="Knowledge & Perspectives"
          intro="Stay updated with the latest industry trends, veterinary research, and biotechnology advancements."
          image={Images.process.developmentImage}
          imageAlt="The ChemLife stand at a science and innovation exhibition"
          imagePosition="50% 35%"
        />

        {/* Featured Section (Three Columns) */}
        <section className="pt-16 md:pt-24 pb-16 md:pb-24">
          <div className="frame">
            <Reveal><h2 className="text-title mb-10 md:mb-14">Featured</h2></Reveal>
            
            {/* Tablets and landscape phones (640-1023px): each card is a row, its picture beside the label, title and
                buttons, so Featured takes about one screen instead of three. Phones stack the cards.
                Desktop: each card spans the same four rows (label line, title, image, buttons) through subgrid, so the
                titles, images and buttons line up across the three cards whatever their text length.
                The two buttons in each card are always the same width: half the card on phones and desktop, 192px
                on tablets. On 1024–1279px screens, where the cards are narrowest, their text is 12px so the longest
                label ("Read on WordPress") still fits. */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-8 lg:gap-x-6 lg:gap-y-0">
              
              {/* Featured Blog */}
              {featuredBlog && (
                <Reveal order={0} className="lg:grid lg:grid-rows-subgrid lg:row-span-4">
                <div
                  id={insightAnchor(featuredBlog.title)}
                  data-analytics-item={featuredBlog.title}
                  data-analytics-click="Read Article"
                  className="scroll-mt-28 bg-surface p-5 md:p-6 lg:p-5 xl:p-6 flex flex-col justify-between sm:max-lg:grid sm:max-lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:max-lg:grid-rows-[auto_1fr_auto] sm:max-lg:gap-x-6 lg:grid lg:grid-rows-subgrid lg:row-span-4 lg:gap-y-0 group cursor-pointer"
                  onClick={() => setActiveArticle(featuredBlog)}
                >
                  <div className="sm:contents">
                    <div className="flex items-center gap-2 mb-3 sm:max-lg:col-start-2 sm:max-lg:row-start-1">
                      <span className="text-small font-bold">Blog</span>
                      <span className="text-small text-ink-soft">Featured • {featuredBlog.date} • {featuredBlog.meta}</span>
                    </div>
                    <h3 className="text-lead font-bold mb-4 lg:mb-6 line-clamp-3 sm:max-lg:col-start-2 sm:max-lg:row-start-2">
                      {featuredBlog.title}
                    </h3>
                    
                    {/* Blog Image Preview */}
                    {featuredBlog.imageUrl && (
                      <div className="relative w-full aspect-video overflow-hidden bg-white select-none mb-4 sm:max-lg:col-start-1 sm:max-lg:row-start-1 sm:max-lg:row-span-3 sm:max-lg:aspect-auto sm:max-lg:self-stretch sm:max-lg:min-h-36 sm:max-lg:mb-0">
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

                  <div className="grid grid-cols-2 sm:grid-cols-[repeat(2,minmax(0,12rem))] lg:grid-cols-2 lg:row-start-4 items-center gap-2 sm:gap-4 lg:gap-2 pt-4 sm:max-lg:col-start-2 sm:max-lg:row-start-3 sm:max-lg:self-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveArticle(featuredBlog);
                      }}
                      className="inline-flex items-center justify-center min-h-11 text-center whitespace-nowrap btn btn-ink min-h-11 px-2 text-small lg:text-[13px] xl:text-small cursor-pointer"
                    >
                      Read Article
                    </button>
                    <a
                      href={featuredBlog.linkUrl || "https://www.linkedin.com/company/chemlifeinnovations/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center min-h-11 text-center whitespace-nowrap btn btn-paper min-h-11 px-2 text-small lg:text-[13px] xl:text-small cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ButtonLabel full={originalLink(featuredBlog.linkUrl).full} short={originalLink(featuredBlog.linkUrl).short} />
                    </a>
                  </div>
                </div>
                </Reveal>
              )}

              {/* Featured Video */}
              {featuredVideo && (
                <Reveal order={1} className="lg:grid lg:grid-rows-subgrid lg:row-span-4">
                <div
                  id={insightAnchor(featuredVideo.title)}
                  data-analytics-item={featuredVideo.title}
                  className="scroll-mt-28 bg-surface p-5 md:p-6 lg:p-5 xl:p-6 flex flex-col justify-between sm:max-lg:grid sm:max-lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:max-lg:grid-rows-[auto_1fr_auto] sm:max-lg:gap-x-6 lg:grid lg:grid-rows-subgrid lg:row-span-4 lg:gap-y-0 group"
                >
                  <div className="sm:contents">
                    <div className="flex items-center gap-2 mb-3 sm:max-lg:col-start-2 sm:max-lg:row-start-1">
                      <span className="text-small font-bold">Video</span>
                      <span className="text-small text-ink-soft">Featured • {featuredVideo.date} • {featuredVideo.meta}</span>
                    </div>
                    <h3 className="text-lead font-bold mb-4 lg:mb-6 line-clamp-3 sm:max-lg:col-start-2 sm:max-lg:row-start-2">
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
                        className="block relative w-full aspect-video overflow-hidden bg-deep cursor-pointer group/video select-none mb-4 sm:max-lg:col-start-1 sm:max-lg:row-start-1 sm:max-lg:row-span-3 sm:max-lg:aspect-auto sm:max-lg:self-stretch sm:max-lg:min-h-36 sm:max-lg:mb-0"
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
                          <div className="w-14 h-10 rounded-xl bg-red-600 group-hover/video:bg-red-700 flex items-center justify-center text-white transition-all group-hover/video:scale-110">
                            <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-[repeat(2,minmax(0,12rem))] lg:grid-cols-2 lg:row-start-4 items-center gap-2 sm:gap-4 lg:gap-2 pt-4 sm:max-lg:col-start-2 sm:max-lg:row-start-3 sm:max-lg:self-end">
                    <a
                      href={youtubeWatchUrl(featuredVideo.youtubeId!)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => playOnPage(e, () => setActiveVideoId(featuredVideo.youtubeId!))}
                      className="inline-flex items-center justify-center min-h-11 text-center whitespace-nowrap btn btn-ink min-h-11 px-2 text-small lg:text-[13px] xl:text-small cursor-pointer"
                    >
                      Watch Now
                    </a>
                    <a
                      href={`https://www.youtube.com/watch?v=${featuredVideo.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center min-h-11 text-center whitespace-nowrap btn btn-paper min-h-11 px-2 text-small lg:text-[13px] xl:text-small"
                    >
                      <ButtonLabel full="Watch on YouTube" short="YouTube" />
                    </a>
                  </div>
                </div>
                </Reveal>
              )}

              {/* Featured Podcast */}
              {featuredPodcast && (
                <Reveal order={2} className="lg:grid lg:grid-rows-subgrid lg:row-span-4">
                <div
                  id={insightAnchor(featuredPodcast.title)}
                  data-analytics-item={featuredPodcast.title}
                  className="scroll-mt-28 bg-surface p-5 md:p-6 lg:p-5 xl:p-6 flex flex-col justify-between sm:max-lg:grid sm:max-lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:max-lg:grid-rows-[auto_1fr_auto] sm:max-lg:gap-x-6 lg:grid lg:grid-rows-subgrid lg:row-span-4 lg:gap-y-0 group"
                >
                  <div className="sm:contents">
                    <div className="flex items-center gap-2 mb-3 sm:max-lg:col-start-2 sm:max-lg:row-start-1">
                      <span className="text-small font-bold">Podcast</span>
                      <span className="text-small text-ink-soft">Featured • {featuredPodcast.date} • {featuredPodcast.meta}</span>
                    </div>
                    <h3 className="text-lead font-bold mb-4 lg:mb-6 line-clamp-3 sm:max-lg:col-start-2 sm:max-lg:row-start-2">
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
                        className="block relative w-full aspect-video overflow-hidden bg-deep cursor-pointer group/video select-none mb-4 sm:max-lg:col-start-1 sm:max-lg:row-start-1 sm:max-lg:row-span-3 sm:max-lg:aspect-auto sm:max-lg:self-stretch sm:max-lg:min-h-36 sm:max-lg:mb-0"
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
                          <div className="w-14 h-10 rounded-xl bg-red-600 group-hover/video:bg-red-700 flex items-center justify-center text-white transition-all group-hover/video:scale-110">
                            <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-[repeat(2,minmax(0,12rem))] lg:grid-cols-2 lg:row-start-4 items-center gap-2 sm:gap-4 lg:gap-2 pt-4 sm:max-lg:col-start-2 sm:max-lg:row-start-3 sm:max-lg:self-end">
                    <a
                      href={youtubeWatchUrl(featuredPodcast.youtubeId!)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => playOnPage(e, () => setActiveVideoId(featuredPodcast.youtubeId!))}
                      className="inline-flex items-center justify-center min-h-11 text-center whitespace-nowrap btn btn-ink min-h-11 px-2 text-small lg:text-[13px] xl:text-small cursor-pointer"
                    >
                      Listen Now
                    </a>
                    <a
                      href={`https://www.youtube.com/watch?v=${featuredPodcast.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center min-h-11 text-center whitespace-nowrap btn btn-paper min-h-11 px-2 text-small lg:text-[13px] xl:text-small"
                    >
                      <ButtonLabel full="Watch on YouTube" short="YouTube" />
                    </a>
                  </div>
                </div>
                </Reveal>
              )}

            </div>

          </div>
        </section>

        {/* Social Channel Connectors Banner */}
        <Reveal className="field-ink py-10 md:py-14">
          <div className="frame">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="https://www.linkedin.com/company/chemlifeinnovations/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-white/10 hover:bg-white/15 transition-colors"
              >
                <div className="w-12 h-12 bg-white text-[#0a66c2] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white">Follow us on LinkedIn</h3>
                  <p className="text-small mt-0.5">Smarter Decisions for Better Outcomes via #FeedBites</p>
                </div>
              </a>
              <a
                href="https://www.youtube.com/@chemlifeinnovations2739"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-white/10 hover:bg-white/15 transition-colors"
              >
                <div className="w-12 h-12 bg-white text-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.388.555A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.48 20.5 12 20.5 12 20.5s7.52 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white">Subscribe on YouTube</h3>
                  <p className="text-small mt-0.5">Watch expert talks, video insights, and podcast content</p>
                </div>
              </a>
            </div>
          </div>
        </Reveal>

        {/* Filters and Search Row */}
        <section className="pt-16 md:pt-24 pb-8">
          <div className="frame">
            <Reveal><h2 className="text-title mb-10 md:mb-14">Explore all insights</h2></Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              
              {/* Search Bar + Subtitle */}
              <div className="w-full md:max-w-md">
                <label htmlFor="insights-search" className="text-small font-semibold block mb-2">
                  Search podcasts, blogs and videos
                </label>
                <div className="relative">
                  <input
                    id="insights-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); resetGrid(); }}
                    placeholder="Search titles, topics, or authors..."
                    className="w-full bg-surface rounded-full px-6 py-3 pr-12 text-base text-ink placeholder-slate-aa focus:outline-none focus:ring-2 focus:ring-ink transition-shadow duration-300 [&::-webkit-search-cancel-button]:appearance-none"
                  />
                  <div className="absolute right-4 top-3.5 text-ink pointer-events-none" aria-hidden="true">
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
                      aria-pressed={isActive}
                      className={`btn min-h-11 px-6 ${isActive ? "btn-ink" : "btn-quiet"}`}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>

            </div>
            <p className="text-small text-ink-soft mt-6" role="status">{gridItems.length} items</p>
          </div>
        </section>

        {/* Combined Grid Section */}
        <section className="pt-0 pb-20 md:pb-28 lg:pb-36">
          <div className="frame">
            
            <motion.div
              key={gridVersion}
              initial={gridVersion === 0 || reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-x-6"
            >
                {visibleItems.map((item, index) => {
                  const isNew = index >= revealFrom;
                  return (
                    <motion.div
                      key={item.title}
                      id={featuredTitles.has(item.title) ? undefined : insightAnchor(item.title)}
                      data-analytics-item={item.title}
                      initial={isNew ? (reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }) : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: easeOut, delay: isNew ? Math.min(index - revealFrom, 5) * 0.06 : 0 }}
                      className={`scroll-mt-28 ${INSIGHT_CARD_CLASS}`}
                    >
                      <InsightCardContent item={item} onRead={setActiveArticle} onPlay={setActiveVideoId} />
                    </motion.div>
                  );
                })}
            </motion.div>

            {gridItems.length > visibleCount && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  className="btn btn-ink"
                >
                  Load more ({gridItems.length - visibleCount} more)
                </button>
              </div>
            )}

            {gridItems.length === 0 && (
              <div className="text-center py-20 bg-surface">
                <span>No insights found matching your search query.</span>
              </div>
            )}

          </div>
        </section>
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
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 overflow-y-auto"
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
                  <span className="text-small font-bold">{activeArticle.type}</span>
                  <span className="text-small text-ink-soft">
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
                <h2 className="text-title">
                  {activeArticle.title}
                </h2>

                {activeArticle.imageUrl && (
                  <div className="relative w-full aspect-video overflow-hidden bg-surface select-none">
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

                <div className="whitespace-pre-line space-y-4">
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
                    className="link text-small"
                  >
                    {originalLink(activeArticle.linkUrl).reader}
                  </a>
                )}
                <button
                  onClick={() => setActiveArticle(null)}
                  className="btn btn-ink whitespace-nowrap"
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
