"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Images } from "@/lib/assets";
import { useHref, useT } from "@/i18n/LocaleProvider";
import { playOnPage, youtubeWatchUrl } from "@/lib/youtube";
import Icon from "@/components/site/Icon";
import { Button, Counter, Seal, easeOut } from "@/components/site/ui";

const STORY_VIDEO_ID = "-amOgNcjYNg";
const SLIDE_MS = 6000;

// The award photo first, then the farms. Each crossfades inside the arch.
const PHOTOS = [
  { src: Images.heroes.awardsPortrait, position: "50% 40%" },
  { src: Images.heroes.chicken, alt: "Poultry farming", position: "50% 50%" },
  { src: Images.heroes.dairy, alt: "Dairy farming", position: "40% 50%" },
  { src: Images.heroes.slide76, alt: "ChemLife animal nutrition", position: "50% 50%" },
  { src: Images.heroes.slide87, alt: "ChemLife innovation", position: "50% 50%" },
];

// Labels are in the language file (home.stats), in this order.
const STATS = [30, 16, 22, 7];

export default function Hero() {
  const t = useT();
  const href = useHref();
  const reduce = useReducedMotion();
  const taglines = t.home.taglines;
  const [slide, setSlide] = useState(0);
  const [photo, setPhoto] = useState(0);
  const [storyOpen, setStoryOpen] = useState(false);
  const quality = t.home.whoWeAre.facts[5];

  // On desktop, where it sits beside the headline, the arch drifts up a little as the page scrolls.
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const desktop = matchMedia("(min-width: 1024px)");
    const update = () => setWide(desktop.matches);
    update();
    desktop.addEventListener("change", update);
    return () => desktop.removeEventListener("change", update);
  }, []);
  const { scrollY } = useScroll();
  const drift = useTransform(scrollY, [0, 800], [0, reduce || !wide ? 0 : -80]);

  // Restarts on every change, so a headline picked from the numbers also stays up for the full time.
  useEffect(() => {
    const timer = setTimeout(() => setSlide((s) => (s + 1) % taglines.length), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [slide, taglines.length]);
  useEffect(() => {
    const timer = setInterval(() => setPhoto((p) => (p + 1) % PHOTOS.length), SLIDE_MS);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!storyOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setStoryOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [storyOpen]);

  const line = (text: string, i: number, accent?: boolean) => (
    <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
      <motion.span className={`block ${accent ? "italic text-flame" : ""}`}
        initial={reduce ? { opacity: 0 } : { y: "105%" }} animate={reduce ? { opacity: 1 } : { y: 0 }} exit={reduce ? { opacity: 0 } : { y: "-105%" }}
        transition={{ duration: 0.8, delay: i * 0.08, ease: easeOut }}>{text}</motion.span>
    </span>
  );

  return (
    <section className="paper relative bg-page overflow-hidden pt-28 md:pt-32 lg:pt-36">
      {/* Fine guide lines behind everything, like a drawing sheet */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 container-site hidden lg:grid grid-cols-12">
        {Array.from({ length: 12 }, (_, i) => <span key={i} className="border-l border-line/60 last:border-r" />)}
      </div>

      <div className="container-site relative grid lg:grid-cols-12 gap-x-10 gap-y-14 items-center">
        <div className="lg:col-span-7 xl:col-span-7">
          <p className="label-mono text-copy-dim flex items-center gap-3">
            <span className="relative flex w-2 h-2"><span className="absolute inset-0 rounded-full bg-flame animate-ping opacity-60 motion-reduce:hidden" /><span className="relative w-2 h-2 rounded-full bg-flame" /></span>
            {t.meta.siteTitle}
          </p>

          {/* The headline changes every few seconds. Its box keeps the height of three lines so nothing below moves. */}
          <h1 className="font-display text-ink tracking-[-0.03em] leading-[0.98] text-[clamp(2.6rem,9.6vw,3.6rem)] sm:text-7xl xl:text-[5.9rem] mt-7 min-h-[3em]">
            <AnimatePresence mode="wait" initial={false}>
              <span key={slide} className="block">
                {line(taglines[slide][0], 0)}
                {line(taglines[slide][1], 1, true)}
                {line(taglines[slide][2], 2)}
              </span>
            </AnimatePresence>
          </h1>

          {/* Which headline is showing, with a bar that fills until the next */}
          <div className="flex gap-1 mt-8" role="group">
            {taglines.map((_, i) => (
              <button key={i} type="button" onClick={() => setSlide(i)} aria-label={`${t.home.goToSlide} ${i + 1}`} aria-current={i === slide ? "true" : undefined}
                className="group flex flex-col gap-2 py-2 pr-3 min-w-11 text-left cursor-pointer">
                <span className={`label-mono transition-colors ${i === slide ? "text-ink" : "text-copy-dim group-hover:text-ink"}`}>{String(i + 1).padStart(2, "0")}</span>
                <span className="relative block h-px w-10 sm:w-14 bg-line overflow-hidden">
                  {i === slide && <motion.span key={slide} className="absolute inset-0 bg-flame origin-left" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: reduce ? 0 : SLIDE_MS / 1000, ease: "linear" }} />}
                </span>
              </button>
            ))}
          </div>

          <p className="text-copy text-lg md:text-xl leading-relaxed mt-8 max-w-xl">{t.footer.bio}</p>

          <div className="flex flex-wrap items-center gap-3 mt-9">
            <Button href={href("/products")} arrow>{t.home.findProduct}</Button>
            <Button href={href("/contact?type=nutritionist")} variant="outline">{t.home.talkToNutritionist}</Button>
            <a href={youtubeWatchUrl(STORY_VIDEO_ID)} target="_blank" rel="noopener noreferrer" onClick={(e) => playOnPage(e, () => setStoryOpen(true))}
              className="group inline-flex items-center gap-3 min-h-12 pl-1 pr-3 font-semibold text-ink">
              <span className="grid place-items-center w-12 h-12 rounded-full border border-ink/25 group-hover:bg-ink group-hover:text-page transition-colors"><Icon name="play" className="w-4 h-4 ml-0.5" /></span>
              {t.home.watchStory}
            </a>
          </div>
        </div>

        {/* The photos, in an arch, with a turning seal and the quality certificate pinned to it */}
        <motion.div style={{ y: drift }} className="lg:col-span-5 relative mx-auto w-full max-w-[460px] lg:max-w-none">
          <div aria-hidden="true" className="absolute -inset-6 sm:-inset-10 rounded-t-full border border-line" />
          <div className="relative aspect-[4/5] rounded-t-full overflow-hidden bg-ink shadow-[0_40px_80px_-30px_rgb(20_36_58/0.45)]">
            {PHOTOS.map((p, i) => (
              <div key={p.src} aria-hidden={i !== photo} className={`absolute inset-0 transition-opacity duration-[1400ms] motion-reduce:transition-none ${i === photo ? "opacity-100" : "opacity-0"}`}>
                <Image src={p.src} alt={p.alt ?? t.home.heroAlt} fill priority={i === 0} loading={i === 0 ? undefined : "eager"}
                  sizes="(min-width: 1280px) 500px, (min-width: 1024px) 40vw, 460px" style={{ objectPosition: p.position }}
                  className={`object-cover ${i === photo && !reduce ? "scale-105 transition-transform duration-[7000ms] ease-out" : "scale-100"}`} />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-[#13233a]/50 via-transparent to-transparent" />
          </div>

          <Seal text="ANBioT · Accelerated Natural Bio-Transformation · " className="absolute -left-4 sm:-left-10 bottom-10 w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-brand-orange-aa text-white shadow-xl">
            <Icon name="leaf" className="w-9 h-9" strokeWidth={1.4} />
          </Seal>

          <div className="absolute -right-2 sm:-right-6 top-[18%] max-w-[13.5rem] rounded-2xl border border-line bg-card/95 backdrop-blur p-4 shadow-xl shadow-ink/10">
            <p className="label-mono text-flame">{quality.label}</p>
            <p className="text-ink text-[15px] font-semibold leading-snug mt-1.5">{quality.value}</p>
          </div>
        </motion.div>
      </div>

      {/* The numbers */}
      <div className="container-site relative mt-14 md:mt-24">
        <dl className="grid grid-cols-2 lg:grid-cols-4 border-t border-line">
          {STATS.map((value, i) => (
            <div key={i} className={`py-8 md:py-10 pr-4 ${i % 2 ? "pl-5 border-l border-line" : ""} ${i === 2 ? "lg:pl-5 lg:border-l border-t lg:border-t-0" : ""} ${i === 3 ? "border-t lg:border-t-0" : ""} border-line`}>
              <dt className="label-mono text-copy-dim">{t.home.stats[i]}</dt>
              <dd className="font-display text-6xl md:text-7xl text-ink tracking-tight mt-3"><Counter value={value} /><span className="text-flame">+</span></dd>
            </div>
          ))}
        </dl>
      </div>

      {/* The story video plays on the page */}
      <AnimatePresence>
        {storyOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setStoryOpen(false)}
            className="fixed inset-0 z-[60] flex overflow-y-auto bg-[#0b1626]/95 p-4" role="dialog" aria-modal="true" aria-label={t.home.storyVideo}>
            <motion.div initial={{ scale: 0.96, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 20 }} transition={{ duration: 0.4, ease: easeOut }}
              className="m-auto w-full flex flex-col gap-3" style={{ width: "min(100%, 64rem, calc((100dvh - 8rem) * 16 / 9))" }} onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setStoryOpen(false)} autoFocus aria-label={t.home.closeVideo}
                className="self-end grid place-items-center w-11 h-11 rounded-full border border-white/25 text-white hover:bg-white hover:text-[#13233a] transition-colors cursor-pointer">
                <Icon name="close" className="w-5 h-5" />
              </button>
              <div className="aspect-video bg-black rounded-2xl overflow-hidden">
                <iframe src={`https://www.youtube-nocookie.com/embed/${STORY_VIDEO_ID}?autoplay=1&rel=0`} title="ChemLife Innovations story" allowFullScreen className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; compute-pressure; encrypted-media; gyroscope; picture-in-picture; web-share" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
