"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import InsightCardContent, { INSIGHT_CARD_CLASS, isOptimizable, originalLink } from "@/components/InsightCard";
import Icon from "@/components/site/Icon";
import { PageHero } from "@/components/site/ui";
import type { Insights, InsightItem } from "@/lib/insights";
import { playOnPage, youtubeWatchUrl } from "@/lib/youtube";
import { insightAnchor } from "@/lib/catalog";
import { revealElement, useHashTarget } from "@/lib/deepLink";

const easeOut = [0.25, 0.1, 0, 1] as const;

// Featured card image widths for the browser to pick a file size from. They follow the grid and padding below.
const FEATURED_IMAGE_SIZES = "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw";

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

  // The three featured posts, each with its picture or video, title and two buttons.
  const featured = [
    featuredBlog && { item: featuredBlog, label: "Blog", primary: "Read Article", secondary: originalLink(featuredBlog.linkUrl), video: false },
    featuredVideo && { item: featuredVideo, label: "Video", primary: "Watch Now", secondary: { full: "Watch on YouTube", short: "YouTube" }, video: true },
    featuredPodcast && { item: featuredPodcast, label: "Podcast", primary: "Listen Now", secondary: { full: "Watch on YouTube", short: "YouTube" }, video: true },
  ].filter((entry): entry is NonNullable<typeof entry> => !!entry);
  const BADGE: Record<string, string> = { Blog: "bg-mint/15 text-mint", Video: "bg-[#3b6fb6]/12 text-[#2f5d9e]", Podcast: "bg-flame/10 text-flame" };

  return (
    <VariantProvider>
      <Header />

      <main id="main" tabIndex={-1} className="site-ui bg-page min-h-screen">
        <PageHero eyebrow="Insights" title="*Knowledge* & Perspectives" lead="Stay updated with the latest industry trends, veterinary research, and biotechnology advancements." />

        {/* Featured: the newest (or chosen) post of each kind */}
        <section aria-labelledby="featured-title" className="bg-page pb-16 md:pb-20">
          <div className="container-site">
            <h2 id="featured-title" className="font-heading text-3xl md:text-4xl font-bold text-ink mb-8">Featured</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map(({ item, label, primary, secondary, video }) => {
                const open = () => (video ? setActiveVideoId(item.youtubeId!) : setActiveArticle(item));
                return <article key={item.title} id={insightAnchor(item.title)} data-analytics-item={item.title}
                  className="scroll-mt-28 group flex flex-col rounded-3xl border border-line bg-card/70 overflow-hidden hover:border-flame/40 transition-colors">
                  <div className="relative aspect-video bg-card-hi">
                    {video && item.youtubeId
                      ? <a href={youtubeWatchUrl(item.youtubeId)} target="_blank" rel="noopener noreferrer" onClick={(e) => playOnPage(e, () => setActiveVideoId(item.youtubeId!))}
                        aria-label={item.title} data-analytics-click={primary} className="absolute inset-0 block">
                        <Image src={`https://img.youtube.com/vi/${item.youtubeId}/0.jpg`} alt={item.title} fill sizes={FEATURED_IMAGE_SIZES} className="object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                        <span className="absolute inset-0 grid place-items-center bg-black/20"><span className="grid place-items-center w-14 h-14 rounded-full bg-brand-orange-aa text-white shadow-xl"><Icon name="play" className="w-6 h-6 ml-0.5" /></span></span>
                      </a>
                      : item.imageUrl && <button type="button" onClick={open} aria-label={item.title} data-analytics-click="Read Article" className="absolute inset-0 cursor-pointer">
                        <Image src={item.imageUrl} alt={item.title} fill sizes={FEATURED_IMAGE_SIZES} className="object-cover group-hover:scale-[1.03] transition-transform duration-500" unoptimized={!isOptimizable(item.imageUrl)} />
                      </button>}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <p className="flex items-center gap-2 text-xs text-copy-dim">
                      <span className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${BADGE[label]}`}>{label}</span>Featured • {item.date} • {item.meta}
                    </p>
                    <h3 className="font-heading text-xl font-bold text-ink mt-3 leading-snug line-clamp-3 group-hover:text-flame transition-colors">{item.title}</h3>
                    <div className="grid grid-cols-2 gap-2 mt-auto pt-6">
                      {video && item.youtubeId
                        ? <a href={youtubeWatchUrl(item.youtubeId)} target="_blank" rel="noopener noreferrer" onClick={(e) => playOnPage(e, () => setActiveVideoId(item.youtubeId!))}
                          className="inline-flex items-center justify-center min-h-11 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white text-sm font-semibold transition-colors">{primary}</a>
                        : <button type="button" onClick={open} data-analytics-click="Read Article"
                          className="inline-flex items-center justify-center min-h-11 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white text-sm font-semibold transition-colors cursor-pointer">{primary}</button>}
                      <a href={video ? `https://www.youtube.com/watch?v=${item.youtubeId}` : item.linkUrl || "https://www.linkedin.com/company/chemlifeinnovations/"} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center justify-center min-h-11 rounded-full border border-line text-ink/85 hover:border-flame/50 text-sm font-semibold transition-colors">
                        <ButtonLabel full={secondary.full} short={secondary.short} />
                      </a>
                    </div>
                  </div>
                </article>;
              })}
            </div>

            {/* Where else to follow along */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {[
                { href: "https://www.linkedin.com/company/chemlifeinnovations/", title: "Follow us on LinkedIn", text: "Smarter Decisions for Better Outcomes via #FeedBites", color: "text-[#4ea1ff] bg-[#0a66c2]/15", d: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" },
                { href: "https://www.youtube.com/@chemlifeinnovations2739", title: "Subscribe on YouTube", text: "Watch expert talks, video insights, and podcast content", color: "text-[#ff5a5a] bg-red-600/15", d: "M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.388.555A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.48 20.5 12 20.5 12 20.5s7.52 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
              ].map((channel) => <a key={channel.title} href={channel.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 p-5 rounded-2xl border border-line bg-card/60 hover:border-flame/40 transition-colors">
                <span className={`grid place-items-center w-12 h-12 rounded-xl shrink-0 ${channel.color}`}><svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d={channel.d} /></svg></span>
                <span><span className="block font-bold text-ink">{channel.title}</span><span className="block text-sm text-copy mt-0.5">{channel.text}</span></span>
                <Icon name="arrowUpRight" className="w-5 h-5 text-copy-dim ml-auto shrink-0" />
              </a>)}
            </div>
          </div>
        </section>

        {/* Everything: search, filters and the grid */}
        <section aria-labelledby="all-title" className="bg-page-alt py-16 md:py-24">
          <div className="container-site">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-line">
              <div>
                <h2 id="all-title" className="font-heading text-3xl md:text-4xl font-bold text-ink">Explore all insights <span className="text-copy-dim text-2xl">({gridItems.length})</span></h2>
                <div className="flex flex-wrap gap-2 mt-5">
                  {filters.map((filter) => {
                    const isActive = selectedFilter === filter;
                    return <button key={filter} aria-pressed={isActive} onClick={() => { setSelectedFilter(filter); resetGrid(); }}
                      className={`min-h-11 px-5 rounded-full text-sm font-semibold border transition-colors cursor-pointer ${isActive ? "bg-brand-orange-aa border-brand-orange-aa text-white" : "border-line text-copy hover:border-flame/50 hover:text-ink"}`}>{filter}</button>;
                  })}
                </div>
              </div>
              <label className="flex items-center rounded-full border border-line bg-card focus-within:border-flame/60 transition-colors w-full md:max-w-sm">
                <span className="sr-only">Search Podcasts, Blogs and Videos</span>
                <Icon name="search" className="w-5 h-5 ml-4 text-copy-dim shrink-0" />
                <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); resetGrid(); }} placeholder="Search titles, topics, or authors..."
                  className="w-full bg-transparent border-0 px-3 py-3 text-base text-ink placeholder:text-copy-dim focus:outline-none" />
              </label>
            </div>

            <motion.div key={gridVersion} initial={gridVersion === 0 || reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25, ease: "easeOut" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
              {visibleItems.map((item, index) => {
                const isNew = index >= revealFrom;
                return <motion.div key={item.title} id={featuredTitles.has(item.title) ? undefined : insightAnchor(item.title)} data-analytics-item={item.title}
                  initial={isNew ? (reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }) : false} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: easeOut, delay: isNew ? Math.min(index - revealFrom, 5) * 0.06 : 0 }} className={`scroll-mt-28 ${INSIGHT_CARD_CLASS}`}>
                  <InsightCardContent item={item} onRead={setActiveArticle} onPlay={setActiveVideoId} />
                </motion.div>;
              })}
            </motion.div>

            {gridItems.length > visibleCount && <div className="mt-10 flex justify-center">
              <button type="button" onClick={loadMore} className="inline-flex items-center justify-center min-h-12 px-8 rounded-full border border-flame/60 text-flame hover:bg-flame/10 font-semibold transition-colors cursor-pointer">
                Load more ({gridItems.length - visibleCount} more)
              </button>
            </div>}

            {gridItems.length === 0 && <div className="text-center py-20 mt-10 rounded-2xl border border-dashed border-line"><span className="text-copy">No insights found matching your search query.</span></div>}
          </div>
        </section>
      </main>

      {/* YouTube video player */}
      <AnimatePresence>
        {activeVideoId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="theme-dark fixed inset-0 z-[70] flex items-center justify-center bg-black/95 p-4" onClick={() => setActiveVideoId(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} transition={{ duration: 0.3 }} className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
              {/* Close button above the player, so it doesn't cover YouTube's own controls */}
              <div className="flex justify-end mb-3">
                <button onClick={() => setActiveVideoId(null)} className="w-11 h-11 rounded-full bg-ink/10 hover:bg-ink/20 text-ink grid place-items-center cursor-pointer border border-ink/15" aria-label="Close video player"><Icon name="close" className="w-5 h-5" /></button>
              </div>
              <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-ink/10">
                <iframe src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&rel=0`} title="YouTube video player" frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; compute-pressure; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="w-full h-full" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Article reader */}
      <AnimatePresence>
        {activeArticle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setActiveArticle(null)}>
            <motion.div role="dialog" aria-modal="true" aria-labelledby="reader-title" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} transition={{ duration: 0.3 }}
              className="site-ui relative w-full max-w-3xl bg-card rounded-3xl overflow-hidden shadow-2xl border border-line flex flex-col my-8 max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-card border-b border-line px-6 py-4 flex items-center justify-between z-10">
                <p className="flex items-center gap-2 text-xs text-copy-dim">
                  <span className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${BADGE[activeArticle.type] ?? BADGE.Blog}`}>{activeArticle.type}</span>{activeArticle.date}
                </p>
                <button onClick={() => setActiveArticle(null)} className="w-9 h-9 rounded-full bg-ink/5 hover:bg-ink/10 text-copy hover:text-ink grid place-items-center cursor-pointer" aria-label="Close article reader"><Icon name="close" className="w-4 h-4" /></button>
              </div>
              <div className="overflow-y-auto p-6 md:p-8 space-y-6">
                <h2 id="reader-title" className="font-heading text-2xl md:text-3xl font-bold text-ink leading-tight">{activeArticle.title}</h2>
                {activeArticle.imageUrl && <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-card-hi border border-line select-none">
                  <Image src={activeArticle.imageUrl} alt={activeArticle.title} fill sizes={READER_IMAGE_SIZES} className="object-cover" unoptimized={!isOptimizable(activeArticle.imageUrl)} />
                </div>}
                <div className="text-copy leading-relaxed whitespace-pre-line space-y-4">{activeArticle.content}</div>
              </div>
              <div className="border-t border-line px-6 py-4 flex justify-between items-center gap-4 bg-page-alt">
                {activeArticle.linkUrl && <a href={activeArticle.linkUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-flame hover:text-ink">{originalLink(activeArticle.linkUrl).reader}</a>}
                <button onClick={() => setActiveArticle(null)} className="whitespace-nowrap min-h-11 px-6 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold cursor-pointer">Close Reader</button>
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
