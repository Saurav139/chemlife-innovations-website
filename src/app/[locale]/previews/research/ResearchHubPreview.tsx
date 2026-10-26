"use client";

import { useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import { Images } from "@/lib/assets";
import { RESEARCH_TOPICS } from "@/lib/catalog";
import { useT } from "@/i18n/LocaleProvider";
import { RESEARCH_PAGES } from "./pages";

// The same card image sizes as the Research page.
const BANNER_SIZES = "(min-width: 1200px) 360px, (min-width: 1024px) 31vw, (min-width: 640px) 47vw, 92vw";

/**
 * The Research page, duplicated for the design preview: the same hero, search, cards and closing panel, built from
 * the same data, except each card links to the platform's own page instead of opening in place.
 */
export default function ResearchHubPreview() {
  const t = useT().research;
  const [searchQuery, setSearchQuery] = useState("");

  const topics = RESEARCH_PAGES.map((page, index) => {
    const i = RESEARCH_TOPICS.findIndex((topic) => topic.id === page.topicId);
    return { ...RESEARCH_TOPICS[i], ...t.topics[i], slug: page.slug, number: index + 1 };
  });
  const query = searchQuery.toLowerCase();
  const filtered = topics.filter(
    (topic) =>
      topic.title.toLowerCase().includes(query) ||
      topic.preview.toLowerCase().includes(query) ||
      topic.tagline.toLowerCase().includes(query)
  );

  return (
    <VariantProvider>
      <Header />

      <main className="bg-slate-50/50 min-h-screen text-brand-navy">
        <section className="pt-26 md:pt-32 pb-10 md:pb-20 lg:pt-36 lg:pb-28 text-white relative overflow-hidden bg-brand-navy flex items-center">
          <div className="absolute inset-0 z-0">
            <Image
              src={Images.research.heroBanner}
              alt={t.heroAlt}
              fill
              sizes="100vw"
              className="object-cover opacity-60"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/75 to-transparent" />
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>

          <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full text-center md:text-left">
            <span className="text-teal-aa-light text-sm font-semibold tracking-widest uppercase block mb-3">{t.kicker}</span>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3 md:mb-4 text-white">
              {t.titleStart} <br /><span className="text-teal-400">{t.titleAccent}</span>
            </h1>
            <p className="text-white/85 text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl font-light">{t.intro}</p>
          </div>
        </section>

        <section className="pt-8 pb-16 md:py-16 bg-slate-50/30 relative overflow-hidden">
          <div className="relative z-10 max-w-[1200px] mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8 md:mb-10 w-full">
              <div role="search" className="flex items-center bg-slate-50 border border-slate-200 rounded-full shadow-xs w-full md:max-w-md focus-within:border-teal-500 focus-within:ring-teal-500 focus-within:ring-1 transition-all duration-300 relative">
                <div className="pl-4 text-teal-650 flex-shrink-0">
                  <svg className="w-[18px] h-[18px]" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="search"
                  enterKeyHint="search"
                  aria-label={t.search}
                  placeholder={t.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 px-3 py-3 md:py-2.5 text-base md:text-[15px] text-brand-navy placeholder-slate-aa focus:outline-none focus:ring-0 [&::-webkit-search-cancel-button]:appearance-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    aria-label={t.clearSearch}
                    className="mr-3 w-11 h-11 flex items-center justify-center text-slate-aa hover:text-teal-aa transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <h2 className="sr-only">{t.listHeading}</h2>
            {/* A wrapping row, so an incomplete last row is centred instead of leaving an empty slot */}
            <ul className="flex flex-wrap justify-center gap-8 items-stretch">
              {filtered.map((topic) => (
                <li key={topic.slug} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc((100%-4rem)/3)]">
                  <a
                    href={`/previews/research/${topic.slug}`}
                    className="h-full border-2 border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-white transition-colors duration-300 overflow-hidden shadow-xs hover:border-brand-orange/40 flex flex-col group"
                  >
                    <div className="w-full aspect-[16/10] relative overflow-hidden bg-slate-100 border-b border-slate-200">
                      <Image src={topic.banner} alt="" aria-hidden="true" fill sizes={BANNER_SIZES} className="object-cover scale-150 blur-2xl" />
                      <Image
                        src={topic.banner}
                        alt={`${topic.title} ${t.bannerAlt}`}
                        fill
                        sizes={BANNER_SIZES}
                        className="object-contain object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6 flex flex-col gap-3 flex-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-aa">Platform {topic.number} of 5</span>
                      <h3 className="font-heading text-xl sm:text-2xl font-black text-brand-navy group-hover:text-brand-orange transition-colors duration-300 leading-tight">
                        {topic.title}
                      </h3>
                      <p className="text-base text-slate-550 font-semibold italic leading-relaxed">{topic.tagline}</p>
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{topic.preview}</p>
                      <span className="mt-auto inline-flex items-center gap-1.5 text-brand-orange-aa text-sm font-bold pt-2">
                        {t.readMore}
                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>

            {filtered.length === 0 && (
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

            <div className="mt-14 md:mt-16 rounded-2xl md:rounded-3xl bg-brand-navy text-white p-6 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">{t.ctaTitle}</h2>
                <p className="text-white/80 text-base mt-2 max-w-2xl leading-relaxed">{t.ctaText}</p>
              </div>
              <a
                href="/contact?type=research"
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
      </main>

      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
