"use client";

import { useState, useEffect, useRef } from "react";
import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/VariantContext";
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
    <span ref={ref} className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-teal-400">
      {count}{suffix}
    </span>
  );
}

export default function HeroVariantA() {
  // Headlines and photos rotate independently so every photo is shown in every language.
  const [slide, setSlide] = useState(0);
  const [photo, setPhoto] = useState(0);
  const [storyOpen, setStoryOpen] = useState(false);
  const { theme } = useTheme();
  const t = useT();
  const href = useHref();
  const taglines = t.home.taglines;
  const tagline = taglines[slide];
  const photoProps = (src: string, sizes: string) => getImageProps({ src, alt: t.home.heroAlt, fill: true, sizes, priority: true, className: "object-cover animate-ken-burns [@media(min-aspect-ratio:1/1)]:object-[50%_0%]" }).props;
  const landscape = photoProps(Images.heroes.awardsLandscape, LANDSCAPE_SIZES);
  const portrait = photoProps(Images.heroes.awardsPortrait, PORTRAIT_SIZES);

  useEffect(() => {
    if (!storyOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setStoryOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [storyOpen]);

  useEffect(() => {
    const timer = setInterval(() => setPhoto((p) => (p + 1) % (otherPhotos.length + 1)), 6000);
    return () => clearInterval(timer);
  }, []);

  // Restarts on every change, so a headline picked from the dots also stays up for the full 6 s.
  useEffect(() => {
    const timer = setTimeout(() => setSlide((p) => (p + 1) % taglines.length), 6000);
    return () => clearTimeout(timer);
  }, [slide, taglines.length]);

  // min-h-svh: the screen height with the browser's toolbars showing, so on phones the stats aren't hidden under them.
  return (
    <section className="relative min-h-svh flex items-center justify-center overflow-hidden bg-brand-navy">
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
        {otherPhotos.map((image, index) => (
          <div key={image.src} className={`absolute inset-0 transition-opacity duration-1000 motion-reduce:transition-none ${photo === index + 1 ? "opacity-100" : "opacity-0"}`} aria-hidden={photo !== index + 1}>
            <Image src={image.src} alt={image.alt} fill sizes={image.sizes} loading="eager" className="object-cover animate-ken-burns" />
          </div>
        ))}
      </div>

      {/* Subtle Dark Overlay for text readability (keeps original image colors) */}
      <div className="absolute inset-x-0 top-0 h-[58%] bg-gradient-to-b from-black/60 via-black/30 to-transparent z-20" />
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-black/65 via-black/15 to-transparent z-20" />
      <div className="absolute inset-0 bg-black/10 z-20" />

      <div className="relative z-30 max-w-[1200px] mx-auto px-6 pt-24 pb-28 md:pt-28 md:pb-32 lg:pt-36 w-full min-h-svh flex flex-col justify-center">
        {/* w-full: without it, this box has no explicit width, so its auto side margins (for centering)
            stop it from stretching and it shrinks to fit whichever tagline is showing — moving and
            resizing the buttons below it from one slide to the next. */}
        <div className="w-full max-w-4xl flex-1 flex flex-col justify-start mx-auto text-center items-center">
          <div className="flex flex-col justify-start items-center text-center w-full">
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
                className="font-heading text-[length:clamp(24px,8.8vw_-_4.5px,34px)] sm:text-5xl md:text-6xl 2xl:text-7xl leading-[1.1] mb-5 sm:mb-8 text-white font-bold text-center"
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
              className="tap-target mt-4 lg:mt-5 inline-flex items-center gap-2 text-sm lg:text-base font-semibold text-white/85 hover:text-white underline-offset-4 hover:underline transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M8 5v14l11-7z" />
              </svg>
              {t.home.watchStory}
            </a>

            {/* Slide dots, centred under the buttons at every width (they used to sit on the right edge on desktop,
                crowding the Rate Us tab). A 44px-tall tap area around each dot, at least 24px wide (WCAG 2.5.8), so the row stays compact. */}
            <div className="flex mt-3 lg:mt-4">
              {taglines.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  className="py-[18px] px-2 flex items-center justify-center"
                  aria-label={`${t.home.goToSlide} ${i + 1}`}
                  aria-current={i === slide ? "true" : undefined}
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
