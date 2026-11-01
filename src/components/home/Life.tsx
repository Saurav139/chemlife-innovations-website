"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Videos, VideoPosters } from "@/lib/assets";
import BackgroundVideo, { useNearViewport } from "@/components/BackgroundVideo";
import { useHref, useT } from "@/i18n/LocaleProvider";
import { Accented, Button, Kicker, Reveal } from "@/components/site/ui";

const VIDEOS = [
  { src: Videos.trip1, poster: VideoPosters.trip1 },
  { src: Videos.trip2, poster: VideoPosters.trip2 },
  { src: Videos.trip3, poster: VideoPosters.trip3 },
];

/** Life at ChemLife: the team's trips playing in an arch, beside what it's like to work here. */
export default function Life({ index = "04", join = true }: { index?: string; join?: boolean }) {
  const all = useT();
  const t = all.home.life;
  const href = useHref();
  const [video, setVideo] = useState(0);
  const [ref, near] = useNearViewport<HTMLElement>();
  // Rotate only while the section is near the screen, so the other videos aren't fetched for nothing.
  useEffect(() => {
    if (!near) return;
    const timer = setInterval(() => setVideo((v) => (v + 1) % VIDEOS.length), 7000);
    return () => clearInterval(timer);
  }, [near]);

  return (
    <section ref={ref} aria-labelledby="life-title" className="theme-dark paper relative bg-page py-20 md:py-28 lg:py-36 overflow-hidden">
      <div className="container-site grid lg:grid-cols-12 gap-14 lg:gap-12 items-center">
        <div className="lg:col-span-6 order-2 lg:order-1">
          <Reveal><Kicker index={index}>{all.nav.careers}</Kicker></Reveal>
          <Reveal delay={0.05}>
            <h2 id="life-title" className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-[-0.025em] leading-[1] text-ink mt-8"><Accented text={t.title.replace(/(\S+)$/, "*$1*")} /></h2>
          </Reveal>
          <ol className="mt-12 border-t border-line">
            {t.points.map((point, i) => (
              <Reveal as="li" key={point} delay={0.1 + i * 0.07} className="flex items-baseline gap-6 border-b border-line py-5">
                <span className="label-mono text-flame">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-ink text-lg md:text-xl">{point}</span>
              </Reveal>
            ))}
          </ol>
          {join && <Reveal delay={0.4} className="mt-10"><Button href={href("/careers")} arrow>{t.joinUs}</Button></Reveal>}
        </div>

        <Reveal className="lg:col-span-5 lg:col-start-8 order-1 lg:order-2 relative mx-auto w-full max-w-md lg:max-w-none">
          <div aria-hidden="true" className="absolute -inset-5 rounded-t-full border border-line" />
          <div className="relative aspect-[3/4] rounded-t-full overflow-hidden bg-card">
            <AnimatePresence initial={false}>
              <motion.div key={VIDEOS[video].src} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.4 }} className="absolute inset-0">
                <BackgroundVideo src={VIDEOS[video].src} poster={VIDEOS[video].poster} active={near} className="w-full h-full object-cover" />
              </motion.div>
            </AnimatePresence>
          </div>
          <div aria-hidden="true" className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {VIDEOS.map((v, i) => <span key={v.src} className={`h-1.5 rounded-full transition-all duration-500 ${i === video ? "w-8 bg-flame" : "w-1.5 bg-ink/30"}`} />)}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
