"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import { Images } from "@/lib/assets";
import type { Insights, InsightItem } from "@/lib/insights";

const easeOut = [0.25, 0.1, 0, 1] as const;

// Card image widths for the browser to pick a file size from. They follow the grid and padding below.
const FEATURED_IMAGE_SIZES = "(min-width: 1024px) 282px, calc(100vw - 114px)";
const CARD_IMAGE_SIZES = "(min-width: 1024px) 312px, (min-width: 768px) calc(50vw - 90px), calc(100vw - 98px)";
const READER_IMAGE_SIZES = "(min-width: 800px) 702px, calc(100vw - 82px)";

// Hosts next.config.ts lets the image optimizer fetch from. Anything else (LinkedIn) is shown as is.
const isOptimizable = (src: string) =>
  src.startsWith("/") ||
  src.startsWith("https://chemlifeinnovations.wordpress.com/wp-content/uploads/") ||
  src.startsWith("https://img.youtube.com/vi/");

export default function InsightsView({ blogs, podcasts, videos }: Insights) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [activeArticle, setActiveArticle] = useState<InsightItem | null>(null);

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

  // Filter, sort by date (descending), and search/deduplicate helper
  const getFilteredAndSorted = (list: InsightItem[]) => {
    return list
      .filter((item, index, self) => self.findIndex((x) => x.title === item.title) === index)
      .sort((a, b) => getTimestamp(b.date) - getTimestamp(a.date))
      .filter((item) => {
        const query = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
        );
      });
  };

  const filteredBlogs = getFilteredAndSorted(blogs);
  const filteredPodcasts = getFilteredAndSorted(podcasts);
  const filteredVideos = getFilteredAndSorted(videos);

  let filteredItems: InsightItem[] = [];

  if (selectedFilter === "Blogs") {
    filteredItems = filteredBlogs;
  } else if (selectedFilter === "Podcasts") {
    filteredItems = filteredPodcasts;
  } else if (selectedFilter === "Videos") {
    filteredItems = filteredVideos;
  } else {
    // Interleave: 1 Video, 1 Podcast, 2 Blogs, and repeat
    let vIndex = 0;
    let pIndex = 0;
    let bIndex = 0;

    while (
      vIndex < filteredVideos.length ||
      pIndex < filteredPodcasts.length ||
      bIndex < filteredBlogs.length
    ) {
      if (vIndex < filteredVideos.length) {
        filteredItems.push(filteredVideos[vIndex]);
        vIndex++;
      }
      if (pIndex < filteredPodcasts.length) {
        filteredItems.push(filteredPodcasts[pIndex]);
        pIndex++;
      }
      for (let k = 0; k < 2; k++) {
        if (bIndex < filteredBlogs.length) {
          filteredItems.push(filteredBlogs[bIndex]);
          bIndex++;
        }
      }
    }
  }

  return (
    <VariantProvider>
      <Header />

      <main className="bg-white min-h-screen text-brand-navy">
        {/* Hero and Featured are plain sections: they're in the first screen, so they show without waiting for a fade-in.
            The hero image is the page's largest paint (LCP), so it loads first. */}
        <section className="pt-30 md:pt-32 pb-24 lg:pt-36 lg:pb-32 text-white relative overflow-hidden bg-brand-navy flex items-center">
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
            <span className="text-teal-400 text-sm font-semibold tracking-widest uppercase block mb-3">
              Insights
            </span>
            <h1 className="font-heading text-4xl lg:text-6xl font-bold leading-tight mb-4 text-white max-w-4xl">
              <span className="text-teal-400">Knowledge</span> & Perspectives
            </h1>
            <p className="text-white/85 text-lg lg:text-xl leading-relaxed max-w-3xl font-light">
              Stay updated with the latest industry trends, veterinary research, and biotechnology advancements.
            </p>
          </div>
        </section>

        {/* Featured Section (Three Columns) */}
        <section className="pt-24 pb-8 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="mb-10">
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-brand-navy">
                Featured
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Featured Blog */}
              {featuredBlog && (
                <div
                  data-analytics-item={featuredBlog.title}
                  data-analytics-click="Read Article"
                  className="bg-gray-55 border border-gray-200 rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                  onClick={() => setActiveArticle(featuredBlog)}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-700">
                        Blog
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">Featured • {featuredBlog.date} • {featuredBlog.meta}</span>
                    </div>
                    <h3 className="font-heading text-xl lg:text-2xl font-bold text-brand-navy mb-6 group-hover:text-teal-600 transition-colors duration-300 line-clamp-3">
                      {featuredBlog.title}
                    </h3>
                    
                    {/* Blog Image Preview */}
                    {featuredBlog.imageUrl && (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-gray-200 select-none mb-4">
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

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveArticle(featuredBlog);
                      }}
                      className="flex-1 sm:flex-none text-center whitespace-nowrap px-6 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all duration-300 cursor-pointer"
                    >
                      Read Article
                    </button>
                    <a
                      href={featuredBlog.linkUrl || "https://www.linkedin.com/company/chemlifeinnovations/posts/?feedView=all"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none text-center whitespace-nowrap px-6 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-teal-600 font-bold text-sm transition-all duration-300 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {featuredBlog.linkUrl?.includes("wordpress.com") ? "Read on WordPress" : "View on LinkedIn"}
                    </a>
                  </div>
                </div>
              )}

              {/* Featured Video */}
              {featuredVideo && (
                <div
                  data-analytics-item={featuredVideo.title}
                  className="bg-gray-55 border border-gray-200 rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        Video
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">Featured • {featuredVideo.date} • {featuredVideo.meta}</span>
                    </div>
                    <h3 className="font-heading text-xl lg:text-2xl font-bold text-brand-navy mb-6 group-hover:text-teal-600 transition-colors duration-300 line-clamp-3">
                      {featuredVideo.title}
                    </h3>
                    
                    {/* YouTube Preview Thumbnail */}
                    {featuredVideo.youtubeId && (
                      <div
                        onClick={() => setActiveVideoId(featuredVideo.youtubeId!)}
                        data-analytics-click="Watch Now"
                        className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 cursor-pointer shadow-sm group/video select-none mb-4"
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
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setActiveVideoId(featuredVideo.youtubeId!)}
                      className="flex-1 sm:flex-none text-center whitespace-nowrap px-6 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all duration-300 cursor-pointer"
                    >
                      Watch Now
                    </button>
                    <a
                      href={`https://www.youtube.com/watch?v=${featuredVideo.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none text-center whitespace-nowrap px-6 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-teal-600 font-bold text-sm transition-all duration-300"
                    >
                      Watch on YouTube
                    </a>
                  </div>
                </div>
              )}

              {/* Featured Podcast */}
              {featuredPodcast && (
                <div
                  data-analytics-item={featuredPodcast.title}
                  className="bg-gray-55 border border-gray-200 rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-50 text-red-700">
                        Podcast
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">Featured • {featuredPodcast.date} • {featuredPodcast.meta}</span>
                    </div>
                    <h3 className="font-heading text-xl lg:text-2xl font-bold text-brand-navy mb-6 group-hover:text-teal-600 transition-colors duration-300 line-clamp-3">
                      {featuredPodcast.title}
                    </h3>
                    
                    {/* YouTube Preview Thumbnail */}
                    {featuredPodcast.youtubeId && (
                      <div
                        onClick={() => setActiveVideoId(featuredPodcast.youtubeId!)}
                        data-analytics-click="Listen Now"
                        className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 cursor-pointer shadow-sm group/video select-none mb-4"
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
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setActiveVideoId(featuredPodcast.youtubeId!)}
                      className="flex-1 sm:flex-none text-center whitespace-nowrap px-6 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all duration-300 cursor-pointer"
                    >
                      Listen Now
                    </button>
                    <a
                      href={`https://www.youtube.com/watch?v=${featuredPodcast.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none text-center whitespace-nowrap px-6 py-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-teal-600 font-bold text-sm transition-all duration-300"
                    >
                      Watch on YouTube
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
                  <p className="text-gray-400 text-xs mt-0.5">Smarter Decisions for Better Outcomes via #FeedBites</p>
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
                  <p className="text-gray-400 text-xs mt-0.5">Watch expert talks, video insights, and podcast content</p>
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
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider block mb-2">
                  Search Podcasts, Blogs and Videos
                </span>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search titles, topics, or authors..."
                    className="w-full bg-gray-50 border border-gray-250 rounded-full px-6 py-3 text-sm text-brand-navy placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-300 shadow-sm"
                  />
                  <div className="absolute right-4 top-3.5 text-gray-400">
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
                      onClick={() => setSelectedFilter(filter)}
                      className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 border cursor-pointer ${
                        isActive
                          ? "bg-teal-600 border-teal-600 text-white shadow-sm"
                          : "bg-gray-100 border-transparent text-gray-500 hover:bg-gray-200"
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
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Explore All Insights ({filteredItems.length})
            </span>
            <div className="w-full h-[1px] bg-gray-150" />
          </div>
        </div>

        {/* Combined Grid Section */}
        <SectionWrapper className="pt-0 pb-24 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredItems.map((item) => {
                  const isBlog = item.type === "Blog";
                  return (
                    <motion.div
                      layout
                      key={item.title}
                      data-analytics-item={item.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4, ease: easeOut }}
                      className="bg-gray-55 border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-teal-500/20 transition-all duration-300 group flex flex-col justify-between"
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
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            item.type === "Blog"
                              ? "bg-teal-50 text-teal-700"
                              : item.type === "Podcast"
                              ? "bg-red-50 text-red-700"
                              : "bg-blue-50 text-blue-700"
                          }`}>
                            {item.type}
                          </span>
                          <span className="text-[11px] text-gray-400 font-medium">
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
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveVideoId(item.youtubeId!);
                            }}
                            data-analytics-click={item.type === "Podcast" ? "Listen Now" : "Watch Now"}
                            className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 bg-slate-900 border border-slate-200/80 cursor-pointer shadow-sm group/video select-none"
                          >
                            <Image
                              src={`https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg`}
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
                          </div>
                        )}

                        <h4 className="font-heading text-lg font-bold text-brand-navy mb-4 group-hover:text-teal-600 transition-colors duration-300 line-clamp-3">
                          {item.title}
                        </h4>
                      </div>

                      {/* Card Action Buttons (Direct + View on LinkedIn) - isolated outside clicking div */}
                      <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mt-2">
                        {isBlog ? (
                          <div className="flex items-center gap-2 w-full justify-between">
                            <button
                              onClick={() => setActiveArticle(item)}
                              className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              Read Article
                            </button>
                            <a
                              href={item.linkUrl || "https://www.linkedin.com/company/chemlifeinnovations/posts/?feedView=all"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-gray-500 hover:text-teal-600 transition-colors cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {item.linkUrl?.includes("wordpress.com") ? "Read on WordPress" : "View on LinkedIn"}
                            </a>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 w-full justify-between">
                            <button
                              onClick={() => setActiveVideoId(item.youtubeId!)}
                              className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1"
                            >
                              {item.type === "Podcast" ? "Listen Now" : "Watch Now"}
                            </button>
                            <a
                              href={`https://www.youtube.com/watch?v=${item.youtubeId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-gray-500 hover:text-teal-600 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Watch on YouTube
                            </a>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {filteredItems.length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <span className="text-gray-400 text-sm">No insights found matching your search query.</span>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            onClick={() => setActiveVideoId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveVideoId(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
                aria-label="Close video player"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* YouTube Iframe Embed */}
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&rel=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; compute-pressure; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
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
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-700">
                    {activeArticle.type}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
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
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                  >
                    {activeArticle.linkUrl.includes("wordpress.com") ? "Read the full article on WordPress →" : "View post on LinkedIn →"}
                  </a>
                )}
                <button
                  onClick={() => setActiveArticle(null)}
                  className="whitespace-nowrap px-6 py-2.5 rounded-full bg-brand-navy text-white font-bold text-sm hover:bg-teal-600 transition-colors cursor-pointer"
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
