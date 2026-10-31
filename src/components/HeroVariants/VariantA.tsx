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
const primaryCtaClass = "btn btn-primary lg:min-h-14 lg:px-9";
const secondaryCtaClass = "btn btn-paper lg:min-h-14 lg:px-9";

// Neutral scrims under the white text, darkest where the text sits.
const TOP_SCRIM = "bg-[linear-gradient(to_bottom,rgb(0_0_0/0.62),rgb(0_0_0/0.3)_50%,rgb(0_0_0/0))]";
const BOTTOM_SCRIM = "bg-[linear-gradient(to_top,rgb(0_0_0/0.68),rgb(0_0_0/0.15)_50%,rgb(0_0_0/0))]";
const SIDE_SCRIM = "bg-[linear-gradient(to_right,rgb(0_0_0/0.7),rgb(0_0_0/0.4)_50%,rgb(0_0_0/0))]";

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
    <span ref={ref} className="text-title text-white tabular-nums">
      {count}{suffix}
    </span>
  );
}

export default function HeroVariantA() {
  // Headlines and photos rotate independently so every photo is shown in every language.
  const [slide, setSlide] = useState(0);
  const [photo, setPhoto] = useState(0);
  const [storyOpen, setStoryOpen] = useState(false);
  const t = useT();
  const href = useHref();
  const taglines = t.home.taglines;
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
      <div className={`absolute inset-x-0 top-0 h-[58%] ${TOP_SCRIM} z-20 transition-opacity duration-1000 motion-reduce:transition-none ${awardLayout ? "opacity-100" : "opacity-0"}`} />
      <div className={`absolute inset-x-0 bottom-0 h-[42%] ${BOTTOM_SCRIM} z-20 transition-opacity duration-1000 motion-reduce:transition-none ${awardLayout ? "opacity-100" : "opacity-0"}`} />
      <div className={`absolute inset-0 ${SIDE_SCRIM} z-20 transition-opacity duration-1000 motion-reduce:transition-none ${awardLayout ? "opacity-0" : "opacity-100"}`} />
      <div className="absolute inset-0 bg-black/10 z-20" />

      <div className={`relative z-30 frame min-h-svh flex flex-col justify-center ${awardLayout ? "pt-24 pb-28 md:pt-28 md:pb-32 lg:pt-36" : "pt-28 pb-28 md:py-32 lg:pt-40"}`}>
        <div className={`w-full flex-1 flex flex-col text-left items-start ${awardLayout ? "justify-start" : "justify-center"}`}>
          <div className={`flex flex-col items-start w-full ${awardLayout ? "justify-start" : "min-h-[300px] md:min-h-[340px] justify-center"}`}>
            {/* Keep the initial headline visible during hydration. */}
            <AnimatePresence mode="wait" initial={false}>
              {/* One line of words in one colour, wrapping on its own: two lines on tablets and desktop, where it
                  runs across the frame; the longer taglines take three on phones. */}
              <motion.h1
                key={slide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0, 1] }}
                className={`text-[length:clamp(1.75rem,0.8rem+3.2vw,3.5rem)] leading-[1.06] tracking-[-0.025em] font-bold text-white ${awardLayout ? "mb-6 sm:mb-8" : "mb-8 sm:mb-12"}`}
              >
                {tagline.join(" ")}
              </motion.h1>
            </AnimatePresence>

            {/* Phones: stacked, both as wide as the longer label. Wider screens: side by side. */}
            <div className="grid gap-3 sm:flex sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 mt-2">
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
              className={`tap-target link inline-flex items-center gap-2 text-white cursor-pointer ${awardLayout ? "mt-4 lg:mt-5" : "mt-5 lg:mt-6"}`}
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
                  <span className={`h-2 rounded-full transition-all duration-300 ${i === slide ? "w-6 bg-white" : "w-2 bg-white/40"}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* The company in four figures */}
        <div className="w-full mt-12 md:mt-24 md:pt-12 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-start">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <span className="text-small text-white mt-1 md:mt-2">{t.home.stats[idx]}</span>
            </div>
          ))}
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
