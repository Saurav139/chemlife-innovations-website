"use client";

import { useState, useEffect, useRef } from "react";
import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/VariantContext";
import { Images } from "@/lib/assets";
import { useHref, useT } from "@/i18n/LocaleProvider";
import { playOnPage, youtubeWatchUrl } from "@/lib/youtube";

// The headlines (home.taglines in the language files) and the photos rotate separately: five headlines, four photos.

// The slides cover the hero, so on screens taller than the image they're drawn wider than the screen:
// 1.5× the screen height for 3:2 photos, 2× for 2:1. `sizes` tells the browser which file is sharp enough.
// Phones only show the middle of a 3:2 photo, so they get a half-width file: about 150 KB instead of 1 MB.
const sizesFor = (aspect: "3/2" | "2/1") =>
  aspect === "3/2"
    ? "(min-aspect-ratio: 3/2) 100vw, (max-width: 767px) 75vh, 150vh"
    : "(min-aspect-ratio: 2/1) 100vw, 200vh";

const bgImages = [
  { id: "poultry", src: Images.heroes.chicken, sizes: sizesFor("3/2") },
  { id: "dairy", src: Images.heroes.dairy, sizes: sizesFor("3/2") },
  { id: "img76", src: Images.heroes.slide76, sizes: sizesFor("2/1") },
  { id: "img87", src: Images.heroes.slide87, sizes: sizesFor("2/1") },
];

const STORY_VIDEO_ID = "-amOgNcjYNg";

const primaryCtaClass =
  "inline-flex items-center justify-center gap-2 min-h-12 px-7 py-3 rounded-full text-sm font-semibold bg-brand-orange-aa border-2 border-brand-orange-aa text-white hover:bg-white hover:text-brand-orange-aa shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5";
const secondaryCtaClass =
  "inline-flex items-center justify-center gap-2 min-h-12 px-7 py-3 rounded-full text-sm font-semibold border-2 border-white/80 text-white hover:bg-white hover:text-brand-navy transition-all duration-300 transform hover:-translate-y-0.5";

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
    <span ref={ref} className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-teal-400">
      {count}{suffix}
    </span>
  );
}

export default function HeroVariantA() {
  // `slide` is the headline (and its dot); `photo` is the background, on its own timer.
  const [slide, setSlide] = useState(0);
  const [photo, setPhoto] = useState(0);
  const [storyOpen, setStoryOpen] = useState(false);
  const { theme } = useTheme();
  const t = useT();
  const href = useHref();
  const taglines = t.home.taglines;
  const tagline = taglines[slide];

  useEffect(() => {
    if (!storyOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setStoryOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [storyOpen]);

  // Restarts on every change, so a headline picked from the dots also stays up for the full 6 s.
  useEffect(() => {
    const timer = setTimeout(() => setSlide((p) => (p + 1) % taglines.length), 6000);
    return () => clearTimeout(timer);
  }, [slide, taglines.length]);

  useEffect(() => {
    const timer = setInterval(() => setPhoto((p) => (p + 1) % bgImages.length), 6000);
    return () => clearInterval(timer);
  }, []);

  // Fetch the next slide while this one is showing, so on slow connections it doesn't fade in blank.
  // The browser picks the same size from srcset as the slide itself will, so it's reused from the cache.
  // It waits 2.5 s so the first slide, the page's largest paint, has the connection to itself.
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = bgImages[(photo + 1) % bgImages.length];
      const { props } = getImageProps({ src: next.src, alt: "", fill: true, sizes: next.sizes });
      const img = document.createElement("img");
      img.fetchPriority = "low";
      img.sizes = props.sizes ?? "";
      img.srcset = props.srcSet ?? "";
      img.src = props.src;
    }, 2500);
    return () => clearTimeout(timer);
  }, [photo]);

  // min-h-svh: the screen height with the browser's toolbars showing, so on phones the stats aren't hidden under them.
  return (
    <section className="relative min-h-svh flex items-center justify-center overflow-hidden bg-brand-navy">
      {/* Deep Navy Backdrop Base */}
      <div className="absolute inset-0 bg-brand-navy z-0" />

      {/* Dynamic Background Image cross-fading */}
      <div className="absolute inset-0 z-10 opacity-100 transition-opacity duration-1000">
        {/* initial={false}: the first slide and tagline are in the server HTML already visible,
            so they paint without waiting for JavaScript. Later ones still animate in. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={photo}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={bgImages[photo].src}
              alt={t.home.slideAlts[photo]}
              fill
              sizes={bgImages[photo].sizes}
              className="object-cover animate-ken-burns"
              priority={photo === 0}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Subtle Dark Overlay for text readability (keeps original image colors) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-20" />
      <div className="absolute inset-0 bg-black/10 z-20" />

      <div className="relative z-30 max-w-[1200px] mx-auto px-6 pt-28 pb-16 md:py-32 w-full h-full flex flex-col justify-center">
        {/* w-full: without it, this box has no explicit width, so its auto side margins (for centering)
            stop it from stretching and it shrinks to fit whichever tagline is showing — moving and
            resizing the buttons below it from one slide to the next. */}
        <div className="w-full max-w-4xl flex-1 flex flex-col justify-center mx-auto text-center items-center">
          <div className="min-h-[300px] md:min-h-[340px] flex flex-col justify-center items-center text-center w-full">
            {/* initial={false}: see the background slides above */}
            <AnimatePresence mode="wait" initial={false}>
              {/* On phones the size follows the screen width so every tagline fits on its three lines, which keeps
                  the buttons below in the same place on every slide. */}
              <motion.h1
                key={slide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0, 1] }}
                className="font-heading text-[length:clamp(24px,8.8vw_-_4.5px,34px)] sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-8 sm:mb-16 text-white font-bold text-center"
              >
                {tagline[0]}<br />
                <span className="text-teal-400">{tagline[1]}</span><br />
                {tagline[2]}
              </motion.h1>
            </AnimatePresence>

            {/* Phones: stacked, centred, both as wide as the longer label. Wider screens: side by side. */}
            <div className="grid justify-center gap-3 sm:flex sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 w-full mt-2">
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
              className="tap-target mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white/85 hover:text-white underline-offset-4 hover:underline transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M8 5v14l11-7z" />
              </svg>
              {t.home.watchStory}
            </a>

            {/* A 44px-tall tap area around each dot, but narrow, so the row stays compact */}
            <div className="flex md:hidden mt-3">
              {taglines.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  className="py-[18px] px-1.5 flex items-center justify-center"
                  aria-label={`${t.home.goToSlide} ${i + 1}`}
                >
                  <span className={`h-2 rounded-full transition-all duration-300 ${i === slide ? "w-6 bg-teal-400" : "w-2 bg-white/40"}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Serial Embedded Company Stats */}
        <div className="w-full mt-12 md:mt-24 md:pt-12 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center text-center">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <span className="text-white/70 text-xs md:text-sm font-semibold uppercase tracking-wider md:tracking-widest mt-2 md:mt-3">{t.home.stats[idx]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Vertical Dotted Navigator on the Right */}
      <div className="absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 hidden md:flex flex-col z-40">
        {taglines.map((_, i) => {
          const isActive = i === slide;
          return (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className="group w-11 h-11 flex items-center justify-center"
              aria-label={`${t.home.goToSlide} ${i + 1}`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full transition-all duration-350 ${isActive
                  ? "bg-teal-400 scale-125 shadow-lg shadow-teal-400/50"
                  : "bg-white/30 border border-white/10 group-hover:bg-white/60"
                  }`}
              />
            </button>
          );
        })}
      </div>

      <div className={`absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t ${theme.heroBottomGradient} to-transparent`} />

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
