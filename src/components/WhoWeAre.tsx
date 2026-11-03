"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Images } from "@/lib/assets";
import { useHref, useT } from "@/i18n/LocaleProvider";
import type { Messages } from "@/i18n/messages/en";

const easeOut = [0.25, 0.1, 0, 1] as const;

// Each card's title, description and photo descriptions are in the language file (home.whoWeAre.cards), in this order.
const cardImages = [
  [Images.gallery.rotate11, Images.gallery.rotate12, Images.gallery.rotate13],
  [Images.gallery.rotate21, Images.gallery.rotate22, Images.gallery.rotate23],
  [Images.research.pellets, Images.gallery.rotate32, Images.gallery.rotate33],
];

type Card = Messages["home"]["whoWeAre"]["cards"][number] & { images: { src: string; alt: string }[] };

// Detailed geometric SVG Snowflake vector component for the outer cell boundary
function SnowflakeFrame({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* 6 primary spokes */}
      <line x1="60" y1="10" x2="60" y2="110" />
      <line x1="16.7" y1="35" x2="103.3" y2="85" />
      <line x1="16.7" y1="85" x2="103.3" y2="35" />

      {/* Central rings */}
      <circle cx="60" cy="60" r="15" strokeWidth="1" />
      <circle cx="60" cy="60" r="7" strokeWidth="0.8" />

      {/* Hexagonal inner connector */}
      <polygon
        points="60,38 79,49 79,71 60,82 41,71 41,49"
        strokeWidth="0.6"
        strokeDasharray="2,2"
      />

      {/* Dendrites on vertical arm (top) */}
      <line x1="60" y1="20" x2="52" y2="15" />
      <line x1="60" y1="20" x2="68" y2="15" />
      <line x1="60" y1="32" x2="48" y2="25" />
      <line x1="60" y1="32" x2="72" y2="25" />

      {/* Dendrites on vertical arm (bottom) */}
      <line x1="60" y1="100" x2="52" y2="105" />
      <line x1="60" y1="100" x2="68" y2="105" />
      <line x1="60" y1="88" x2="48" y2="95" />
      <line x1="60" y1="88" x2="72" y2="95" />

      {/* Top-Right Spoke (pointing to 103.3, 35) */}
      <line x1="94.6" y1="40" x2="94.6" y2="30" />
      <line x1="94.6" y1="40" x2="103.2" y2="45" />
      <line x1="84.2" y1="46" x2="84.2" y2="36" />
      <line x1="84.2" y1="46" x2="92.8" y2="51" />

      {/* Bottom-Left Spoke (pointing to 16.7, 85) */}
      <line x1="25.4" y1="80" x2="25.4" y2="90" />
      <line x1="25.4" y1="80" x2="16.8" y2="75" />
      <line x1="35.8" y1="74" x2="35.8" y2="84" />
      <line x1="35.8" y1="74" x2="27.2" y2="69" />

      {/* Bottom-Right Spoke (pointing to 103.3, 85) */}
      <line x1="94.6" y1="80" x2="94.6" y2="90" />
      <line x1="94.6" y1="80" x2="103.2" y2="75" />
      <line x1="84.2" y1="74" x2="84.2" y2="84" />
      <line x1="84.2" y1="74" x2="92.8" y2="69" />

      {/* Top-Left Spoke (pointing to 16.7, 35) */}
      <line x1="25.4" y1="40" x2="25.4" y2="30" />
      <line x1="25.4" y1="40" x2="16.8" y2="45" />
      <line x1="35.8" y1="46" x2="35.8" y2="36" />
      <line x1="35.8" y1="46" x2="27.2" y2="51" />
    </svg>
  );
}

function SnowflakeCell({
  card,
  index,
  imageIndex,
}: {
  card: Card;
  index: number;
  imageIndex: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.1, 0, 1] }}
      className="flex flex-row md:flex-col items-center gap-5 md:gap-0 text-left md:text-center group cursor-pointer"
    >
      {/* 3D Visual Snowflake Image Container (No text overlay). Phones: a smaller circle beside the text. */}
      <div className="relative shrink-0 w-[132px] h-[132px] sm:w-[160px] sm:h-[160px] md:w-[220px] md:h-[220px] lg:w-[320px] lg:h-[320px] flex items-center justify-center">
        {/* Outer Snowflake Frame (acting as outer border structure) */}
        <SnowflakeFrame
          className="absolute w-[128px] h-[128px] sm:w-[156px] sm:h-[156px] md:w-[214px] md:h-[214px] lg:w-[310px] lg:h-[310px] text-teal-500/20 group-hover:text-brand-orange/45 transition-colors duration-500 z-0 pointer-events-none select-none"
          style={{ animation: "spin 45s linear infinite" }}
        />

        {/* Enlarged Inner Circular Card (100% visible image, zero overlap) */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative w-[98px] h-[98px] sm:w-[120px] sm:h-[120px] md:w-[165px] md:h-[165px] lg:w-[235px] lg:h-[235px] rounded-full overflow-hidden border-2 border-teal-500/25 group-hover:border-brand-orange transition-all duration-300 z-10 bg-gray-50 shadow-xl"
        >
          <AnimatePresence mode="popLayout">
            <motion.div
              key={card.images[imageIndex % card.images.length].src}
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={card.images[imageIndex % card.images.length].src}
                alt={card.images[imageIndex % card.images.length].alt}
                fill
                sizes="(min-width: 1024px) 235px, 165px"
                className="object-cover opacity-100 group-hover:scale-105 transition-transform duration-700"
                priority={index === 0}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Combined Typography Content (Clean alignment below the image) */}
      <div className="flex-1 md:flex-none md:mt-4 md:max-w-[270px] md:px-2 flex flex-col items-start md:items-center">
        <h3 className="font-heading text-lg md:text-xl font-bold text-teal-aa mb-1 md:mb-2 leading-tight transition-colors duration-300 group-hover:text-brand-orange">
          {card.title}
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed font-normal">
          {card.description}
        </p>
      </div>
    </motion.div>
  );
}

/** Fades and rises into view once, as it scrolls in (still for visitors who prefer less motion). */
function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.6, delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

export default function WhoWeAre() {
  const messages = useT();
  const t = messages.home.whoWeAre;
  const foundersAlt = messages.about.foundersAlt;
  const href = useHref();
  const [imageIndex, setImageIndex] = useState(0);
  const cards: Card[] = t.cards.map((card, i) => ({
    ...card,
    images: cardImages[i].map((src, j) => ({ src, alt: card.alts[j] })),
  }));

  useEffect(() => {
    const timer = setInterval(() => {
      setImageIndex((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);


  return (
    <section aria-labelledby="who-we-are-title" className="bg-white py-20 md:py-32 overflow-hidden border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Who we are: the introduction beside the founders' photo, with a link to the full Who We Are page. */}
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <Reveal className="lg:col-span-6">
            <span className="text-teal-aa text-sm lg:text-base font-semibold tracking-widest uppercase">{t.homeKicker}</span>
            <h2 id="who-we-are-title" className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-brand-navy mt-3">{t.homeTitle}</h2>
            {/* What ChemLife is, in a line, under the heading. */}
            <p className="font-heading text-xl md:text-2xl font-semibold leading-snug text-brand-navy/80 mt-4">{t.title}</p>
            <p className="text-lg text-slate-700 leading-relaxed mt-6">{t.intro}</p>
            {/* The facts and questions that used to be here, in full on their own page. */}
            <a href={href("/who-we-are")} data-analytics-click={t.moreAboutUs} className="inline-flex items-center gap-2 min-h-12 px-6 mt-8 rounded-full bg-brand-navy hover:bg-brand-navy/90 text-white font-semibold transition-colors">
              {t.moreAboutUs}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-6">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
              <Image src={Images.people.foundersNew} alt={foundersAlt} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
            </div>
          </Reveal>
        </div>

        {/* What we serve: the three species groups */}
        <h3 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-brand-navy text-center mt-16 md:mt-24">
          {t.serveTitle}
        </h3>

        {/* Grid layout containing the Snowflake Cells */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 max-w-5xl mx-auto justify-items-stretch md:justify-items-center w-full mt-8 z-10 relative">
          {cards.map((card, i) => (
            <SnowflakeCell
              key={`snowflake-cell-${i}`}
              card={card}
              index={i}
              imageIndex={imageIndex}
            />
          ))}
        </div>
      </div>

      {/* CSS Spin Keyframes for slowly rotating snowflakes */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}
