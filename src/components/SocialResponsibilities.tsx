"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import SectionWrapper from "./SectionWrapper";
import { Images, Videos, VideoPosters } from "@/lib/assets";
import BackgroundVideo, { useNearViewport } from "./BackgroundVideo";
import { useT } from "@/i18n/LocaleProvider";

// Titles and descriptions are in the language file (home.social.items), in this order.
const itemMedia = [
  {
    id: 0,
    emoji: "🚲",
    bgType: "video",
    bgSrc: Videos.social1,
    bgPoster: VideoPosters.social1,
  },
  {
    id: 1,
    emoji: "🛡️",
    bgType: "image",
    bgSrc: Images.social.image2,
  },
  {
    id: 2,
    emoji: "🐄",
    bgType: "image",
    bgSrc: Images.social.image3,
  },
];

export default function SocialResponsibilities() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [bgIndex, setBgIndex] = useState(0);
  const [bgRef, near] = useNearViewport<HTMLDivElement>();
  const t = useT().home.social;
  const items = itemMedia.map((m, i) => ({ ...m, ...t.items[i] }));

  // Auto-rotate the background every 5 seconds if not hovering
  useEffect(() => {
    if (hoveredIndex !== null) return;
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % itemMedia.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [hoveredIndex]);

  // Hover overrides the active background slideshow
  const activeBgIndex = hoveredIndex !== null ? hoveredIndex : bgIndex;
  const activeBg = items[activeBgIndex];

  return (
    <SectionWrapper className="relative py-16 md:py-32 lg:py-40 bg-white overflow-hidden border-b border-gray-100">
      {/* Dynamic Background Media with cross-fade */}
      <div ref={bgRef} className="absolute inset-0 z-0 select-none pointer-events-none">
        <AnimatePresence initial={false}>
          {activeBg.bgType === "video" ? (
            <motion.div
              key={activeBg.bgSrc}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.0, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <BackgroundVideo
                src={activeBg.bgSrc}
                poster={activeBg.bgPoster}
                active={near}
                className="w-full h-full object-cover"
              />
            </motion.div>
          ) : (
            <motion.div
              key={activeBg.bgSrc}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.0, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={activeBg.bgSrc}
                alt={t.bgAlt}
                fill
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-white/40" />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-10 md:mb-16">
          <span className="text-teal-aa text-sm lg:text-base font-semibold tracking-widest uppercase">
            {t.kicker}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-brand-navy mt-3 leading-tight">
            {t.title}
          </h2>
        </div>

        {/* 3-Column Centered Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 max-w-5xl mx-auto">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.1, 0, 1] }}
              className="text-center group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* 176px, so the description on the back fits at 14px */}
              <div className="relative w-44 h-44 mx-auto mb-6 perspective-1000">
                <div
                  className={`w-full h-full transition-transform duration-500 transform-style-preserve-3d ${hoveredIndex === index ? 'rotate-y-180' : ''
                    }`}
                >
                  {/* Front side - Logo/Emoji (Scaled emoji to text-6xl) */}
                  <div className="absolute inset-0 w-full h-full bg-brand-navy rounded-xl flex items-center justify-center backface-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <span className="text-6xl select-none" role="img" aria-label={item.title}>
                      {item.emoji}
                    </span>
                  </div>

                  {/* Back side - Description */}
                  <div className="absolute inset-0 w-full h-full bg-brand-navy rounded-xl flex items-center justify-center backface-hidden rotate-y-180 p-4 border border-white/10">
                    <span className="text-white text-sm font-semibold text-center leading-snug">
                      {item.desc}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`transition-transform duration-300 ${hoveredIndex === index ? 'transform translate-y-1 scale-105' : ''
                  }`}
              >
                <h3 className="font-heading text-xl font-bold text-brand-navy mb-3 group-hover:text-teal-aa transition-colors duration-300">
                  {item.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
