"use client";

import { useState, useEffect, useRef } from "react";
import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Images } from "@/lib/assets";
import { useHref, useT } from "@/i18n/LocaleProvider";
import { playOnPage, youtubeWatchUrl } from "@/lib/youtube";

// The award photo uses separate landscape and portrait crops to keep faces clear.
const LANDSCAPE_SHAPE = "(min-aspect-ratio: 1/1)";
const LANDSCAPE_SIZES = "(min-aspect-ratio: 3/2) 100vw, 150vh";
const PORTRAIT_SIZES = "(min-aspect-ratio: 11/20) 100vw, 55vh";

const otherPhotos = [
  { src: Images.heroes.chicken, alt: "Poultry farming", sizes: "(min-aspect-ratio: 3/2) 100vw, 150vh" },
  { src: Images.heroes.dairy, alt: "Dairy farming", sizes: "(min-aspect-ratio: 3/2) 100vw, 150vh" },
  { src: Images.heroes.slide76, alt: "ChemLife animal nutrition", sizes: "(min-aspect-ratio: 2/1) 100vw, 200vh" },
  { src: Images.heroes.slide87, alt: "ChemLife innovation", sizes: "(min-aspect-ratio: 2/1) 100vw, 200vh" },
];

const STORY_VIDEO_ID = "-amOgNcjYNg";

// Larger on desktop, so the buttons hold their own under the big headline.
const primaryCtaClass =
  "inline-flex items-center justify-center gap-2 min-h-12 lg:min-h-14 px-7 lg:px-9 py-3 rounded-full text-sm lg:text-base font-semibold bg-brand-orange-aa border-2 border-brand-orange-aa text-white hover:bg-white hover:text-brand-orange-aa shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5";
const secondaryCtaClass =
  "inline-flex items-center justify-center gap-2 min-h-12 lg:min-h-14 px-7 lg:px-9 py-3 rounded-full text-sm lg:text-base font-semibold border-2 border-white/80 text-white hover:bg-white hover:text-brand-navy transition-all duration-300 transform hover:-translate-y-0.5";

// Labels are in the language file (home.stats), in this order.
const stats = [
  { value: 30, suffix: "+" },
  { value: 16, suffix: "+" },
  { value: 22, suffix: "+" },
  { value: 7, suffix: "+" },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  // Starts at the real value so the server-rendered HTML (search engines, slow connections)
  // shows it. The count-up from 0 runs only once the browser is running JavaScript and the number is on screen.
  const [count, setCount] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const duration = 1500;
          const steps = 60;
          const increment = value / steps;
          let current = 0;
          setCount(0);
          timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, [value]);

  return (
    <span ref={ref} className="font-heading text-xl md:text-3xl font-bold leading-none tracking-tight text-brand-navy tabular-nums">
      {count}<span className="text-teal-aa">{suffix}</span>
    </span>
  );
}

export default function HeroVariantA() {
  // One position for both: each headline has its photo, so the dots change the photo along with the headline.
  const [photo, setPhoto] = useState(0);
  const [storyOpen, setStoryOpen] = useState(false);
  const t = useT();
  const href = useHref();
  const taglines = t.home.taglines;
  const slideCount = otherPhotos.length + 1;
  const slide = photo % taglines.length;
  const tagline = taglines[slide];
  // Only the award photo needs the compact top layout to leave the people unobstructed.
  const awardLayout = photo === 0;
  const photoProps = (src: string, sizes: string) => getImageProps({ src, alt: t.home.heroAlt, fill: true, sizes, priority: true, className: "object-cover animate-ken-burns object-[75%_50%] [@media(min-aspect-ratio:1/1)]:object-[75%_40%]" }).props;
  const landscape = photoProps(Images.heroes.awardsLandscape, LANDSCAPE_SIZES);
  const portrait = photoProps(Images.heroes.awardsPortrait, PORTRAIT_SIZES);

  useEffect(() => {
    if (!storyOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setStoryOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [storyOpen]);

  // The other photos aren't shown for 6 s, so they load once the page has: before that they'd share the connection
  // with the first photo and slow it down on phones. The slideshow starts once they're loading.
  const [othersReady, setOthersReady] = useState(false);
  useEffect(() => {
    const ready = () => setOthersReady(true);
    if (document.readyState === "complete") return ready();
    window.addEventListener("load", ready, { once: true });
    return () => window.removeEventListener("load", ready);
  }, []);

  // Restarts on every change, so a slide picked from the dots also stays up for the full 6 s.
  useEffect(() => {
    if (!othersReady) return;
    const timer = setTimeout(() => setPhoto((p) => (p + 1) % slideCount), 6000);
    return () => clearTimeout(timer);
  }, [photo, othersReady, slideCount]);

  // Picking a dot before the page has finished loading starts the other photos loading straight away.
  const goTo = (i: number) => {
    setOthersReady(true);
    setPhoto(i);
  };

  // While the numbers' strip is behind the floating search and chat buttons (at the bottom of the screen on arrival),
  // they sit centred on it, at its two ends, beside the figures; once it scrolls past, they settle back.
  const stripRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const root = document.documentElement;
    const wide = window.matchMedia("(min-width: 768px)");
    const laptop = window.matchMedia("(min-width: 1024px)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const { top, bottom } = strip.getBoundingClientRect();
      const view = window.innerHeight;
      // The buttons' band, up from the bottom of the screen: 16px (24px from tablets up) below a 60px bubble (72px
      // from laptops up).
      const gap = wide.matches ? 24 : 16;
      const tallest = laptop.matches ? 72 : 60;
      const behind = top < view - gap && bottom > view - gap - tallest;
      root.style.setProperty("--float-lift", `${behind ? Math.round(view - gap - tallest / 2 - (top + bottom) / 2) : 0}px`);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      root.style.removeProperty("--float-lift");
    };
  }, []);

  // min-h-svh: the screen height with the browser's toolbars showing, so on phones the stats aren't hidden under them.
  return (
    <section className="relative min-h-svh flex flex-col overflow-hidden bg-brand-navy">
      {/* The photo, behind the headline and actions; the numbers' strip sits below it. */}
      <div className="relative flex-1 flex flex-col">
      {/* Deep Navy Backdrop Base */}
      <div className="absolute inset-0 bg-brand-navy z-0" />

      {/* The photo. Preloaded for the screen's shape, since it's the page's largest paint. */}
      <link rel="preload" as="image" imageSrcSet={landscape.srcSet} imageSizes={landscape.sizes} media={LANDSCAPE_SHAPE} fetchPriority="high" />
      <link rel="preload" as="image" imageSrcSet={portrait.srcSet} imageSizes={portrait.sizes} media="not all and (min-aspect-ratio: 1/1)" fetchPriority="high" />
      <div className="absolute inset-0 z-10">
        <div className={`absolute inset-0 transition-opacity duration-1000 motion-reduce:transition-none ${photo === 0 ? "opacity-100" : "opacity-0"}`} aria-hidden={photo !== 0}>
        <picture>
          <source media={LANDSCAPE_SHAPE} srcSet={landscape.srcSet} sizes={landscape.sizes} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img {...portrait} alt={t.home.heroAlt} />
        </picture>
        </div>
        {othersReady && otherPhotos.map((image, index) => (
          <div key={image.src} className={`absolute inset-0 transition-opacity duration-1000 motion-reduce:transition-none ${photo === index + 1 ? "opacity-100" : "opacity-0"}`} aria-hidden={photo !== index + 1}>
            <Image src={image.src} alt={image.alt} fill sizes={image.sizes} loading="eager" className="object-cover animate-ken-burns" />
          </div>
        ))}
      </div>

      {/* A fade from the left behind the left-aligned headline, on every photo (keeps the rest of the photo's colours). */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent z-20" />
      <div className="absolute inset-0 bg-black/10 z-20" />

      {/* The headline and actions; the headline dots sit at their right. */}
      <div className="relative z-30 flex-1 flex">
      {/* Not held to the 1200px column: the headline sits a fixed margin in from the screen's left edge. */}
      <div className={`px-6 md:px-12 lg:px-16 xl:px-20 w-full flex flex-col justify-start md:justify-center pt-36 pb-6 md:pt-40 md:pb-8 short:pt-40 short:pb-4 short-phone:pt-36 short-phone:pb-2`}>
        {/* w-full: without it, this box has no explicit width, so its auto side margins (for centering)
            stop it from stretching and it shrinks to fit whichever tagline is showing — moving and
            resizing the buttons below it from one slide to the next. */}
        {/* Phones: at the top, under the header, leaving the photo below in view. Wider screens: centred in the height
            above the numbers' strip, on every photo. */}
        <div className="w-full max-w-3xl flex-1 flex flex-col text-left items-start justify-start md:justify-center">
          <div className="flex flex-col items-start text-left w-full md:min-h-[340px] short:min-h-0 justify-start md:justify-center">
            {/* Keep the initial headline visible during hydration. */}
            <AnimatePresence mode="wait" initial={false}>
              {/* On phones the size follows the screen width so every tagline fits on its three lines, which keeps
                  the buttons below in the same place on every slide. */}
              <motion.h1
                key={slide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0, 1] }}
                className={`font-heading text-[length:clamp(24px,8.8vw_-_4.5px,34px)] sm:text-5xl md:text-6xl leading-[1.1] text-white font-bold text-left ${awardLayout ? "2xl:text-7xl mb-5 sm:mb-8" : "lg:text-7xl mb-8 sm:mb-16"} short:text-5xl short:mb-5 short-phone:mb-4`}
              >
                {tagline[0]}<br />
                <span className="text-teal-400">{tagline[1]}</span><br />
                {tagline[2]}
              </motion.h1>
            </AnimatePresence>

            {/* Phones: stacked, both as wide as the longer label. Wider screens: side by side. */}
            <div className="grid justify-start gap-3 sm:flex sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 w-full mt-2">
              <Link href={href("/products")} className={primaryCtaClass}>
                {t.home.findProduct}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href={href("/contact?type=nutritionist")} className={secondaryCtaClass}>
                {t.home.talkToNutritionist}
              </Link>
            </div>

            <a
              href={youtubeWatchUrl(STORY_VIDEO_ID)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => playOnPage(e, () => setStoryOpen(true))}
              className={`tap-target inline-flex items-center gap-2 text-sm lg:text-base font-semibold text-white/85 hover:text-white underline-offset-4 hover:underline transition-colors cursor-pointer ${awardLayout ? "mt-4 lg:mt-5" : "mt-5 lg:mt-6"} short:mt-3 short-phone:mt-2`}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M8 5v14l11-7z" />
              </svg>
              {t.home.watchStory}
            </a>

            {/* Phones: the headline dots under the buttons (wider screens have them down the right side).
                A 44px-tall tap area around each dot, at least 24px wide (WCAG 2.5.8), so the row stays compact. */}
            <div className="flex mt-3 short-phone:mt-0 md:hidden">
              {Array.from({ length: slideCount }, (_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="py-[18px] px-2 flex items-center justify-center"
                  aria-label={`${t.home.goToSlide} ${i + 1}`}
                  aria-current={i === photo ? "true" : undefined}
                >
                  <span className={`h-2 rounded-full transition-all duration-300 ${i === photo ? "w-6 bg-teal-400" : "w-2 bg-white/40"}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

        {/* Tablets and wider: the headline dots in a column down the right side, set in from the edge so they clear
            the Rate Us tab. A 44px-wide tap area around each dot, at least 24px tall. */}
        <div className="hidden md:flex flex-col absolute right-14 lg:right-16 top-1/2 -translate-y-1/2 py-1 rounded-full bg-black/30 backdrop-blur-sm" role="group" aria-label={t.home.goToSlide}>
          {Array.from({ length: slideCount }, (_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="px-[18px] py-2 flex items-center justify-center cursor-pointer"
              aria-label={`${t.home.goToSlide} ${i + 1}`}
              aria-current={i === photo ? "true" : undefined}
            >
              <span className={`w-2 rounded-full transition-all duration-300 ${i === photo ? "h-6 bg-teal-400" : "h-2 bg-white/60"}`} />
            </button>
          ))}
        </div>
      </div>

      </div>

      {/* The numbers on a light strip along the bottom of the hero, below the photo, so they never blend into it: navy
          figures with a teal "+", small grey labels and hairline dividers (between pairs below 1280px). The same room at
          both ends, as wide as the chat bubble (on the right) needs, keeps the figures centred on the page; the floating
          search button (left) and chat bubble sit there on arrival. */}
      <div ref={stripRef} className="relative z-30 bg-white/95 backdrop-blur-md shadow-[0_-10px_30px_rgba(0,0,0,0.18)]">
        <div className="px-[104px] md:px-[116px] lg:px-[312px]">
          <dl className="max-w-[1000px] mx-auto py-2 md:py-4 grid grid-cols-2 xl:grid-cols-4 gap-y-1.5 md:gap-y-3 xl:divide-x divide-slate-200">
            {stats.map((stat, idx) => (
              <div key={idx} className={`flex flex-col-reverse items-center justify-center text-center px-2 ${idx % 2 === 1 ? "max-xl:border-l max-xl:border-slate-200" : ""}`}>
                <dt className="text-slate-500 text-[10px] md:text-[11px] font-semibold md:uppercase tracking-normal md:tracking-[0.22em] leading-[1.15] mt-1 md:mt-1.5">{t.home.stats[idx]}</dt>
                <dd><AnimatedCounter value={stat.value} suffix={stat.suffix} /></dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Story video plays on the page, with the hero actions underneath */}
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
            aria-label={t.home.storyVideo}
          >
            {/* m-auto centres the content when it fits and lets the overlay scroll when it does not */}
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="m-auto w-full max-w-4xl flex flex-col items-center gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Video width is capped by the screen height (minus the close button and buttons below) so it fits on landscape phones */}
              <div className="w-full flex flex-col gap-2" style={{ width: "min(100%, calc((100dvh - 10rem) * 16 / 9))" }}>
                <button
                  onClick={() => setStoryOpen(false)}
                  className="self-end w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20"
                  aria-label={t.home.closeVideo}
                  autoFocus
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${STORY_VIDEO_ID}?autoplay=1&rel=0`}
                    title="ChemLife Innovations story"
                    allow="accelerometer; autoplay; clipboard-write; compute-pressure; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href={href("/products")} className={primaryCtaClass}>
                  {t.home.findProduct}
                </Link>
                <Link href={href("/contact?type=nutritionist")} className={secondaryCtaClass}>
                  {t.home.talkToNutritionist}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
