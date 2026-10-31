"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Videos, VideoPosters } from "@/lib/assets";
import BackgroundVideo, { useNearViewport } from "./BackgroundVideo";
import { useHref, useT } from "@/i18n/LocaleProvider";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

const videos = [
  { src: Videos.trip1, poster: VideoPosters.trip1 },
  { src: Videos.trip2, poster: VideoPosters.trip2 },
  { src: Videos.trip3, poster: VideoPosters.trip3 },
];

export default function LifeAtChemLife() {
  const t = useT().home.life;
  const href = useHref();
  const [videoIndex, setVideoIndex] = useState(0);
  const [sectionRef, near] = useNearViewport<HTMLElement>();

  // Rotate only while the section is near the screen, so the other videos aren't fetched for nothing.
  useEffect(() => {
    if (!near) return;
    const timer = setInterval(() => {
      setVideoIndex((prev) => (prev + 1) % videos.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [near]);

  return (
    <section ref={sectionRef} className="relative overflow-hidden field-ink">
      {/* The team's own trip films, under a flat navy wash so the white text reads on any frame. */}
      <div className="absolute inset-0 bg-ink">
        <AnimatePresence initial={false}>
          <motion.div
            key={videos[videoIndex].src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <BackgroundVideo
              src={videos[videoIndex].src}
              poster={videos[videoIndex].poster}
              active={near}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="absolute inset-0 bg-ink/80" />

      <div className="relative frame section-y">
        <SectionHead title={t.title} />
        <div className="grid lg:grid-cols-12 gap-x-8">
          <ul className="lg:col-start-6 lg:col-span-7 space-y-5 md:space-y-6">
            {t.points.map((text, i) => (
              <Reveal as="li" key={text} order={i + 1} className="text-lead">
                {text}
              </Reveal>
            ))}
          </ul>
          <Reveal order={t.points.length + 1} className="lg:col-start-6 lg:col-span-7 mt-10 md:mt-12">
            <a href={href("/careers")} className="btn btn-paper">
              {t.joinUs}
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
