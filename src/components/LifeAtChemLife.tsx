"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/VariantContext";
import { Videos, VideoPosters } from "@/lib/assets";
import BackgroundVideo, { useNearViewport } from "./BackgroundVideo";
import { useHref, useT } from "@/i18n/LocaleProvider";

const easeOut = [0.25, 0.1, 0, 1] as const;

const videos = [
  { src: Videos.trip1, poster: VideoPosters.trip1 },
  { src: Videos.trip2, poster: VideoPosters.trip2 },
  { src: Videos.trip3, poster: VideoPosters.trip3 },
];

export default function LifeAtChemLife() {
  const { theme } = useTheme();
  const t = useT().home.life;
  const href = useHref();
  const bulletPoints = t.points;
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
    <section ref={sectionRef} className="relative min-h-[600px] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0 w-full h-full bg-brand-navy">
        <AnimatePresence initial={false}>
          <motion.div
            key={videos[videoIndex].src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
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

      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-black/60 to-brand-navy/80 z-10" />

      <div className="relative z-20 w-full max-w-[1200px] mx-auto px-6 py-16 md:py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="text-center"
        >
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-white mb-10 md:mb-16 leading-tight">
            {t.title}
          </h2>
        </motion.div>
 
         <div className="max-w-2xl mx-auto">
          {bulletPoints.map((text, i) => (
            <div key={text} className="relative flex items-start gap-5 pb-7 md:pb-10 last:pb-0">
              {i < bulletPoints.length - 1 && (
                <motion.div
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: (i + 1) * 0.4, ease: easeOut }}
                  className="absolute w-[3px] bg-brand-navy/40 origin-top"
                  style={{ left: "10.5px", top: "12px", bottom: "-12px" }}
                />
              )}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.4, ease: easeOut }}
                className="relative z-10 w-6 h-6 rounded-full bg-brand-navy flex items-center justify-center flex-shrink-0"
              >
                <div className="w-3 h-3 rounded-full bg-teal-400" />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.4, ease: easeOut }}
                className="text-white/90 text-lg md:text-xl lg:text-2xl"
              >
                {text}
              </motion.span>
            </div>
          ))}
        </div>
 
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 1.6, ease: easeOut }}
          className="text-center mt-12"
        >
          <a
            href={href("/careers")}
            className="inline-block border-2 border-brand-orange-dark text-brand-orange-dark bg-white hover:bg-brand-orange-dark hover:text-white font-semibold px-8 py-3 rounded-full shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            {t.joinUs}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
