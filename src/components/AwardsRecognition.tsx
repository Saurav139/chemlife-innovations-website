"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/VariantContext";
import { Images } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";

// Titles and descriptions are in the language file (home.awards.items), in this order.
const certificateFiles = [
  {
    file: "c-camp-logo.png",
    organization: "Centre for Cellular and Molecular Platforms (C-CAMP)",
    year: "2020-21",
  },
  {
    file: "animal-husbandry.png",
    organization: "Department of Animal Husbandry, Dairying & Fisheries",
    year: "2019",
  },
  {
    file: "birac.png",
    organization: "Biotechnology Industry Research Assistance Council (BIRAC)",
    year: "2021",
  },
  {
    file: "naarm.png",
    organization: "a-IDEA, ICAR-NAARM",
    year: "2020",
  },
];

const easeOut = [0.25, 0.1, 0, 1] as const;

export default function AwardsRecognition() {
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
    <section className="bg-white dark:bg-night-800 py-16 md:py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-10 md:mb-16">
          <span className="text-teal-aa dark:text-teal-aa-light text-sm lg:text-base font-semibold tracking-widest uppercase">
            {t.kicker}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-brand-navy dark:text-night-text mt-2 mb-4 leading-tight">
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
            <div className="bg-white dark:bg-night-800 rounded-xl p-6 lg:p-8 min-h-[320px] flex items-center">
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
                      <span className="text-teal-aa dark:text-teal-aa-light text-sm font-semibold tracking-widest uppercase">
                        {certificates[activeStep].organization} &bull; {certificates[activeStep].year}
                      </span>
                       {certificates[activeStep].title && (
                         <h3 className="font-heading text-2xl lg:text-3xl font-bold text-brand-navy dark:text-night-text mt-2 mb-4 leading-tight">
                           {certificates[activeStep].title}
                         </h3>
                       )}
                       <p className="text-brand-navy/85 dark:text-night-text/85 text-base lg:text-lg leading-relaxed">
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
                    aria-label={`${t.goTo} ${i + 1}`}
                  >
                     {/* Top cross-tie */}
                     <div className={`w-[2px] h-5 transition-colors duration-500 ${isCompleted ? 'bg-teal-400/70' : isActive ? 'bg-teal-400' : 'bg-teal-400/20'}`} />

                    {/* Station marker */}
                    <div
                      className={`w-12 h-12 flex items-center justify-center rounded-md border-2 transition-all duration-500 ${
                         isActive
                          ? 'bg-teal-aa-light border-teal-aa-light text-brand-navy dark:text-night-text scale-110 shadow-lg shadow-teal-400/30'
                          : isCompleted
                          ? 'bg-teal-400/20 border-teal-400/40 text-teal-700 dark:text-teal-aa-light'
                          : 'bg-transparent border-teal-400/30 text-slate-aa dark:text-night-muted'
                      }`}
                    >
                      <span className="text-sm font-bold">{`0${i + 1}`}</span>
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
