"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Images } from "@/lib/assets";
import { useHref, useT } from "@/i18n/LocaleProvider";
import { playOnPage, youtubeWatchUrl } from "@/lib/youtube";

// The homepage hero, "Open split tall" from the design previews: a white introduction beside a framed photograph,
// with the company's figures in a strip underneath.

const STORY_VIDEO_ID = "-amOgNcjYNg";

// Labels are in the language file (home.stats), in this order.
const FIGURES = ["30+", "16+", "22+", "7+"];

export default function HeroOpenSplit() {
  const t = useT().home;
  const href = useHref();
  const [storyOpen, setStoryOpen] = useState(false);

  useEffect(() => {
    if (!storyOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setStoryOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [storyOpen]);

  return (
    <>
      {/* Clear of the fixed header. Shown at once, without a fade-in: the photo is the page's largest paint. */}
      <section className="bg-white pt-18 md:pt-20 lg:pt-24">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-6 py-13 md:py-16 lg:py-22 grid items-center gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-11 md:min-h-[440px] lg:gap-16 lg:min-h-[500px]">
          <div className="min-w-0">
            <p className="flex items-center gap-2.5 mb-4.5 text-[11px] font-bold uppercase tracking-[0.12em] text-brand-navy">
              <span aria-hidden="true" className="w-5.5 h-[3px] bg-brand-orange" />
              {t.heroKicker}
            </p>
            <h1 className="max-w-[600px] font-heading text-[length:clamp(2rem,4vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.025em] text-brand-navy">
              {t.heroLine1}
              <br />
              <span className="text-brand-orange-aa">{t.heroLine2}</span>
            </h1>
            <p className="max-w-[490px] mt-5 text-slate-600 text-[15px] sm:text-base leading-relaxed">{t.heroSummary}</p>
            <div className="flex flex-wrap items-center gap-2.5 mt-6">
              <Link
                href={href("/products")}
                className="inline-flex items-center justify-center gap-2.5 min-h-[46px] px-5 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white text-sm font-semibold transition-colors"
              >
                {t.findProduct}
                <span aria-hidden="true">↗</span>
              </Link>
              <Link
                href={href("/contact?type=nutritionist")}
                className="inline-flex items-center justify-center min-h-[46px] px-5 rounded-full border border-[#b7c6d5] hover:border-brand-navy hover:bg-[#f0f5fa] text-brand-navy text-sm font-semibold transition-colors"
              >
                {t.talkToNutritionist}
              </Link>
            </div>
            <a
              href={youtubeWatchUrl(STORY_VIDEO_ID)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => playOnPage(e, () => setStoryOpen(true))}
              className="inline-flex items-center gap-2 min-h-11 mt-2 text-sm font-semibold text-brand-navy underline underline-offset-4 cursor-pointer"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="w-4.5 h-4.5">
                <path d="m7 4 9 6-9 6z" />
              </svg>
              {t.watchStory}
            </a>
          </div>

          <figure className="min-w-0">
            <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-[#edf1f5]">
              <Image
                src={Images.heroes.awardsLandscape}
                alt={t.heroAlt}
                fill
                priority
                fetchPriority="high"
                sizes="(min-width: 1200px) 600px, (min-width: 768px) 52vw, calc(100vw - 40px)"
                className="object-contain"
              />
            </div>
            <figcaption className="flex items-center gap-2 min-h-7.5 pt-2 text-xs text-slate-600">
              <span aria-hidden="true" className="w-3.5 h-0.5 bg-brand-orange shrink-0" />
              {t.heroCaption}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ChemLife at a glance */}
      <section className="border-y border-[#e0e7ee] bg-[#fafbfd]" aria-label={t.heroKicker}>
        <dl className="max-w-[1200px] mx-auto px-5 sm:px-6 py-5 md:py-6 grid grid-cols-2 md:grid-cols-4 gap-5.5">
          {FIGURES.map((value, i) => (
            <div key={value} className={`flex flex-col-reverse gap-1.5 ${i > 0 ? "md:pl-7 md:border-l md:border-[#dbe3eb]" : ""}`}>
              <dt className="text-slate-600 text-xs font-semibold uppercase tracking-[0.06em]">{t.stats[i]}</dt>
              <dd className="font-heading text-[28px] md:text-[32px] font-bold leading-none text-brand-navy">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* The story video plays on the page */}
      <AnimatePresence>
        {storyOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex overflow-y-auto bg-black/95 p-4"
            onClick={() => setStoryOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={t.storyVideo}
          >
            <div className="m-auto flex flex-col gap-2" style={{ width: "min(100%, calc((100dvh - 6rem) * 16 / 9))" }} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setStoryOpen(false)}
                className="self-end w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label={t.closeVideo}
                autoFocus
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${STORY_VIDEO_ID}?autoplay=1&rel=0`}
                  title="ChemLife Innovations story"
                  allow="accelerometer; autoplay; clipboard-write; compute-pressure; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
