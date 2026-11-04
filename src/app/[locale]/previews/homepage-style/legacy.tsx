"use client";

// The homepage's earlier "What we serve" snowflakes and awards plaque, kept so this preview can show them next to
// what replaced them.

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/VariantContext";
import { Images } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";
import { certificateFiles } from "@/components/AwardsRecognition";
import type { Messages } from "@/i18n/messages/en";

export type Card = Messages["home"]["whoWeAre"]["cards"][number] & { images: { src: string; alt: string }[] };

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

export function SnowflakeCell({
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
        <p className="text-slate-600 text-lg leading-relaxed font-normal">
          {card.description}
        </p>
      </div>
    </motion.div>
  );
}


const easeOut = [0.25, 0.1, 0, 1] as const;

export function AwardsCurrent() {
  const [activeStep, setActiveStep] = useState(0);
  const { theme } = useTheme();
  const t = useT().home.awards;
  const certificates = certificateFiles.map((c, i) => ({ ...c, ...t.items[i] }));

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % certificateFiles.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [activeStep]);

  return (
    <section className="bg-white py-16 md:py-24 lg:py-32 overflow-hidden scroll-mt-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-10 md:mb-16">
          <span className="text-teal-aa text-sm lg:text-base font-semibold tracking-widest uppercase">
            {t.kicker}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-brand-navy mt-2 mb-4 leading-tight">
            {t.title}
          </h2>
        </div>

        {/* Plaque frame */}
        <motion.div 
          className="relative max-w-[900px] mx-auto"
          whileHover={{ y: -8, scale: 1.015 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0, 1] }}
        >
          <div className="bg-brand-orange rounded-2xl p-[3px] shadow-2xl">
            <div className="bg-white rounded-xl p-6 lg:p-8 min-h-[320px] flex items-center">
              <AnimatePresence mode="wait">
                {activeStep >= 0 && (
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.4, ease: easeOut }}
                    className="flex flex-col sm:flex-row items-center gap-8 lg:gap-10 w-full"
                  >
                    {/* Digital Award Plaque */}
                    <div className="relative w-full sm:w-80 lg:w-[360px] aspect-[4/3] shrink-0">
                      {/* Uniform light orange base card */}
                      <div className="absolute inset-0 bg-orange-200 rounded-2xl shadow-2xl border-4 border-orange-300 p-4 flex items-center justify-center">
                        {/* Subtle inset overlay */}
                        <div className="absolute inset-1.5 border border-white/15 rounded-lg pointer-events-none" />

                        {/* Logo Image centered on the wood plaque */}
                        <div className="relative w-full h-full bg-white rounded-lg overflow-hidden shadow-inner p-4 flex items-center justify-center">
                          <Image
                            src={Images.awards.path(certificates[activeStep].file)}
                            alt={certificates[activeStep].title}
                            fill
                            className="object-contain p-2"
                            sizes="(max-width: 640px) 90vw, 320px"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Caption */}
                    <div className="flex-1 text-center sm:text-left">
                      <span className="text-teal-aa text-sm font-semibold tracking-widest uppercase">
                        {[certificates[activeStep].organization, certificates[activeStep].year].filter(Boolean).join(" • ")}
                      </span>
                       {certificates[activeStep].title && (
                         <h3 className="font-heading text-2xl lg:text-3xl font-bold text-brand-navy mt-2 mb-4 leading-tight">
                           {certificates[activeStep].title}
                         </h3>
                       )}
                       <p className="text-brand-navy/85 text-base lg:text-lg leading-relaxed">
                        {certificates[activeStep].description}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Top decorative ribbon */}
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex gap-1">
            <div className="w-6 h-3 bg-brand-orange rounded-b-sm skew-x-[20deg]" />
            <div className="w-6 h-3 bg-brand-orange rounded-b-sm -skew-x-[20deg]" />
          </div>
        </motion.div>

        {/* Train-track railway navigation */}
        <div className="w-full max-w-[700px] mx-auto mt-10">
          <div className="relative h-20">
            {/* Top rail */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-teal-400/30 rounded-full" />

            {/* Bottom rail */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-teal-400/30 rounded-full" />

            {/* Train diamond on top rail */}
            <motion.div
              className="absolute -top-[3px] w-4 h-4 bg-teal-400 rotate-45 z-10 shadow-lg shadow-teal-400/40"
              animate={{
                left: `${(activeStep / (certificates.length - 1)) * (100 - 100 / certificates.length)}%`,
              }}
              transition={{ duration: 0.7, ease: easeOut }}
              style={{ marginLeft: `${50 / certificates.length}%` }}
            />

            <div className="relative flex justify-between h-full">
              {certificates.map((_, i) => {
                const isActive = i === activeStep;
                const isCompleted = i < activeStep;

                return (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className="relative flex flex-col items-center justify-between h-full cursor-pointer"
                    style={{ width: `${100 / certificates.length}%` }}
                    // Starts with the number on the button ("01"), so voice control users can say what they see
                    aria-label={`0${i + 1}: ${certificates[i].title}`}
                    aria-current={isActive ? "true" : undefined}
                  >
                     {/* Top cross-tie */}
                     <div className={`w-[2px] h-5 transition-colors duration-500 ${isCompleted ? 'bg-teal-400/70' : isActive ? 'bg-teal-400' : 'bg-teal-400/20'}`} />

                    {/* Station marker */}
                    <div
                      className={`w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center rounded-md border-2 transition-all duration-500 ${
                         isActive
                          ? 'bg-teal-aa-light border-teal-aa-light text-brand-navy scale-110 shadow-lg shadow-teal-400/30'
                          : isCompleted
                          ? 'bg-teal-400/20 border-teal-400/40 text-teal-700'
                          : 'bg-transparent border-teal-400/30 text-slate-aa'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-bold">{`0${i + 1}`}</span>
                    </div>

                     {/* Bottom cross-tie */}
                     <div className={`w-[2px] h-5 transition-colors duration-500 ${isCompleted ? 'bg-teal-400/70' : isActive ? 'bg-teal-400' : 'bg-teal-400/20'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
