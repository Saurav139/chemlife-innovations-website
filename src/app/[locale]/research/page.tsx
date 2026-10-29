"use client";

import { useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import { Images } from "@/lib/assets";
import { RESEARCH_TOPICS, researchAnchor } from "@/lib/catalog";
import { revealElement, useHashTarget } from "@/lib/deepLink";
import { useHref, useT } from "@/i18n/LocaleProvider";

const easeOut = [0.25, 0.1, 0, 1] as const;

// Card image widths for the browser to pick a file size from. They follow the research grid below: three
// columns up to 360px wide on desktop, two on tablets, one on phones.
const BANNER_SIZES = "(min-width: 1200px) 360px, (min-width: 1024px) 31vw, (min-width: 640px) 47vw, 92vw";

interface ResearchTopic {
  id: number;
  title: string;
  category: string;
  tagline: string;
  preview: string;
  challenge: string;
  advantage: string;
  recognition?: string;
  applications?: string;
  banner: string;
}

// The topics are listed in src/lib/catalog.ts; their titles and text are in the language file (research.topics),
// in the same order.

export default function ResearchPage() {
  const t = useT().research;
  const href = useHref();
  const researchTopics = RESEARCH_TOPICS.map((topic, i) => ({ ...topic, ...t.topics[i] }));
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Opens at one topic from a link such as /research#research-accelerated-natural-biotransformation-anbiot (the site
  // search): clears the search box, expands the topic and scrolls to it.
  useHashTarget((target) => {
    const topic = researchTopics.find((item) => researchAnchor(item.englishTitle) === target);
    if (!topic) return;
    setSearchQuery("");
    setExpandedId(topic.id);
    revealElement(target);
  });

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filteredTopics = researchTopics.filter((topic) => {
    const query = searchQuery.toLowerCase();
    return (
      topic.title.toLowerCase().includes(query) ||
      topic.preview.toLowerCase().includes(query) ||
      topic.tagline.toLowerCase().includes(query)
    );
  });

  return (
    <VariantProvider>
      <Header />

      <main id="main" className="bg-slate-50/50 min-h-screen text-brand-navy">
        {/* Card animations follow the visitor's "reduce motion" setting */}
        <MotionConfig reducedMotion="user">
        {/* Hero and research list are plain sections: they're in the first screen, so they show without waiting for a fade-in.
            The hero image is the page's largest paint (LCP), so it loads first. */}
        <section className="pt-28 md:pt-36 pb-10 md:pb-20 lg:pt-44 lg:pb-28 text-white relative overflow-hidden bg-brand-navy flex items-center">
          <div className="absolute inset-0 z-0">
            <Image
              src={Images.research.heroBanner}
              alt={t.heroAlt}
              fill
              sizes="100vw"
              className="object-cover opacity-60"
              priority
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/75 to-transparent" />
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>

          <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full text-center md:text-left">
            <span className="text-teal-aa-light text-sm font-semibold tracking-widest uppercase block mb-3">
              {t.kicker}
            </span>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3 md:mb-4 text-white">
              {t.titleStart} <br /><span className="text-teal-400">{t.titleAccent}</span>
            </h1>
            <p className="text-white/85 text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl font-light">
              {t.intro}
            </p>
          </div>
        </section>

        {/* Research List Section */}
        <section className="pt-8 pb-16 md:py-16 bg-slate-50/30 relative overflow-hidden">
          <div className="relative z-10 max-w-[1200px] mx-auto px-6">

            {/* Left-aligned search bar: 48px tall on phones, 46px on desktop; 16px text on phones so iOS doesn't zoom in */}
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8 md:mb-10 w-full">
              <div role="search" className="flex items-center bg-slate-50 border border-slate-200 rounded-full shadow-xs w-full md:max-w-md focus-within:border-teal-500 focus-within:ring-teal-500 focus-within:ring-1 transition-all duration-300 relative">
                {/* Search Icon */}
                <div className="pl-4 text-teal-650 flex-shrink-0">
                  <svg className="w-[18px] h-[18px]" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Input Text Field */}
                <input
                  type="search"
                  enterKeyHint="search"
                  aria-label={t.search}
                  placeholder={t.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 px-3 py-3 md:py-2.5 text-base md:text-[15px] text-brand-navy placeholder-slate-aa focus:outline-none focus:ring-0 [&::-webkit-search-cancel-button]:appearance-none"
                />

                {/* Clear Search Button */}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    aria-label={t.clearSearch}
                    className="mr-4 text-slate-aa hover:text-teal-aa transition-colors duration-250 cursor-pointer"
                  >
                    <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* For screen readers: the topic cards (h3) sit under this heading */}
            <h2 className="sr-only">{t.listHeading}</h2>
            <p className="sr-only" role="status">
              {searchQuery
                ? t.resultsCount.replace("{count}", String(filteredTopics.length)).replace("{total}", String(researchTopics.length))
                : ""}
            </p>
            {/* Research Grid: a wrapping row, so an incomplete last row is centred instead of leaving an empty slot */}
            <div className="flex flex-wrap justify-center gap-8 items-start">
              {filteredTopics.map((topic) => {
                const isExpanded = expandedId === topic.id;
                const anchor = researchAnchor(topic.englishTitle);
                const emailSubject = encodeURIComponent(`Collaboration Inquiry: ${topic.englishTitle}`);
                const emailBody = encodeURIComponent(
                  `Dear ChemLife Innovations R&D Team,\n\nI am interested in learning more about your research pipeline: "${topic.englishTitle}". Please share publication details, trial results, and potential partnership scopes.\n\nBest regards,\n[Your Name]\n[Your Institution/Company]`
                );
                const emailHref = `mailto:innovate@chemlifeinnovations.com?subject=${emailSubject}&body=${emailBody}`;

                return (
                  <motion.div
                    key={topic.id}
                    id={anchor}
                    data-analytics-item={topic.englishTitle}
                    layout
                    transition={{ duration: 0.4, ease: easeOut }}
                    className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc((100%-4rem)/3)] scroll-mt-28 lg:scroll-mt-40 border-2 border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50/85 transition-colors duration-300 overflow-hidden shadow-xs hover:border-brand-orange/40 flex flex-col group"
                  >
                    {/* Card Header (Image/Banner + Title) */}
                    <div
                      onClick={() => toggleExpand(topic.id)}
                      data-analytics-click={isExpanded ? "Show Less" : "Explore Dossier"}
                      className="cursor-pointer select-none flex flex-col"
                    >
                      {/* Card image: the same 16:10 frame on every card and screen. The whole illustration shows (some
                          have labels that cropping would cut), over a blurred copy of itself that fills the rest. */}
                      <div className="w-full aspect-[16/10] relative overflow-hidden bg-slate-100 border-b border-slate-200">
                        <Image
                          src={topic.banner}
                          alt=""
                          aria-hidden="true"
                          fill
                          sizes={BANNER_SIZES}
                          className="object-cover scale-150 blur-2xl"
                        />
                        <Image
                          src={topic.banner}
                          alt={`${topic.title} ${t.bannerAlt}`}
                          fill
                          sizes={BANNER_SIZES}
                          className="object-contain object-center group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Content: Title */}
                      <div className="p-6 flex flex-col gap-3">
                        <h3 id={`${anchor}-name`} className="font-heading text-xl sm:text-2xl font-black text-brand-navy group-hover:text-brand-orange transition-colors duration-300 leading-tight">
                          {topic.title}
                        </h3>

                        {topic.tagline && (
                          <p className="text-base text-slate-550 font-semibold italic leading-relaxed">
                            {topic.tagline}
                          </p>
                        )}

                        {/* A real button, so the card opens from the keyboard and screen readers hear "collapsed"/"expanded".
                            Its click reaches the card header above, which does the opening. */}
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          aria-controls={`${anchor}-details`}
                          aria-describedby={`${anchor}-name`}
                          className="flex items-center gap-1.5 w-fit min-h-11 -mt-1 -mb-3 text-brand-orange-aa text-sm font-bold cursor-pointer rounded-md"
                        >
                          <span>{isExpanded ? t.showLess : t.readMore}</span>
                          <motion.span
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                          </motion.span>
                        </button>
                      </div>
                    </div>

                    {/* Expandable Body */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          id={`${anchor}-details`}
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.4, ease: easeOut }}
                          className="overflow-hidden bg-white border-t-2 border-slate-200"
                        >
                          <div className="p-6 space-y-5">
                            {/* Summary section */}
                            <div>
                              <h4 className="text-xs font-bold uppercase text-teal-655 tracking-wider block mb-1.5">
                                {t.overview}
                              </h4>
                              <p className="text-slate-655 text-sm lg:text-base leading-relaxed font-light">
                                {topic.preview}
                              </p>
                            </div>

                            {/* Challenge section */}
                            <div>
                              <h4 className="text-xs font-bold uppercase text-teal-655 tracking-wider block mb-1.5">
                                {t.challenge}
                              </h4>
                              <p className="text-slate-655 text-sm lg:text-base leading-relaxed font-light">
                                {topic.challenge}
                              </p>
                            </div>

                            {/* Efficacy & Advantage section */}
                            <div>
                              <h4 className="text-xs font-bold uppercase text-teal-655 tracking-wider block mb-1.5">
                                {t.advantage}
                              </h4>
                              <p className="text-slate-655 text-sm lg:text-base leading-relaxed font-light">
                                {topic.advantage}
                              </p>
                            </div>

                            {/* Target Applications (if any) */}
                            {topic.applications && (
                              <div>
                                <h4 className="text-xs font-bold uppercase text-teal-655 tracking-wider block mb-1.5">
                                  {t.applications}
                                </h4>
                                <p className="text-slate-655 text-sm lg:text-base leading-relaxed font-light">
                                  {topic.applications}
                                </p>
                              </div>
                            )}

                            {/* Recognition & Support (if any) */}
                            {topic.recognition && (
                              <div className="bg-teal-50/70 border border-teal-150 p-3.5 rounded-xl">
                                <h4 className="text-xs font-bold uppercase text-teal-800 tracking-wider block mb-1">
                                  {t.recognition}
                                </h4>
                                <p className="text-teal-700 text-sm lg:text-base leading-relaxed font-black">
                                  {topic.recognition}
                                </p>
                              </div>
                            )}

                            {/* Mailto Inquiry Button */}
                            <div className="pt-1">
                              <a
                                href={emailHref}
                                className="w-full inline-flex items-center justify-center py-2.5 rounded-full border-2 border-teal-600 hover:border-teal-700 text-teal-650 hover:text-teal-750 font-bold text-sm hover:bg-teal-50/50 transition-colors duration-300 text-center"
                              >
                                {t.enquire}
                              </a>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </motion.div>
                );
              })}
            </div>

            {filteredTopics.length === 0 && (
              <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-600 text-sm">{t.noResults}</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-4 inline-flex items-center min-h-11 px-6 rounded-full border-2 border-brand-navy/20 hover:border-brand-navy text-brand-navy text-sm font-semibold transition-colors cursor-pointer"
                >
                  {t.clearSearch}
                </button>
              </div>
            )}

            {/* A next step after the topics */}
            <div className="mt-14 md:mt-16 rounded-2xl md:rounded-3xl bg-brand-navy text-white p-6 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">{t.ctaTitle}</h2>
                <p className="text-white/80 text-base mt-2 max-w-2xl leading-relaxed">{t.ctaText}</p>
              </div>
              <a
                href={href("/contact?type=research")}
                className="inline-flex items-center justify-center gap-2 min-h-12 px-7 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold shrink-0 transition-colors"
              >
                {t.ctaButton}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>

          </div>
        </section>
        </MotionConfig>
      </main>

      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
