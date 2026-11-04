"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Images } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";

// Titles and descriptions are in the language file (home.awards.items), in this order. New awards go at the end:
// previews pair these by position.
export const certificateFiles = [
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
  {
    file: "business-success-awards-2026.png",
    organization: "Business Success Awards (Proficorn)",
    year: "2026",
  },
  {
    file: "elevate-2019.png",
    organization: "Department of IT, BT and S&T, Government of Karnataka",
    year: "2019",
  },
  {
    file: "azadi-ka-amrit-mahotsav-top-75.png",
    organization: "Dept. of Animal Husbandry & Dairying, Government of India, with CII",
    year: "",
  },
  {
    file: "climate-launchpad.png",
    organization: "ClimateLaunchpad, EIT Climate-KIC",
    year: "",
  },
];

const easeOut = [0.25, 0.1, 0, 1] as const;

// Every award at once, as a wall of logo tiles with each one's year and title; choosing a tile shows its organisation
// and description in the panel below (on phones the page scrolls to it).
export default function AwardsRecognition() {
  const t = useT().home.awards;
  const reduce = useReducedMotion();
  const certificates = certificateFiles.map((c, i) => ({ ...c, ...t.items[i] }));
  const [chosen, setChosen] = useState(0);
  const panel = useRef<HTMLDivElement>(null);
  const award = certificates[chosen];
  const choose = (i: number) => {
    setChosen(i);
    if (window.matchMedia("(max-width: 767px)").matches) {
      requestAnimationFrame(() => panel.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" }));
    }
  };

  return (
    <section id="awards" aria-labelledby="awards-title" className="bg-white py-16 md:py-24 lg:py-32 scroll-mt-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-10 md:mb-14">
          <span className="text-teal-aa text-sm lg:text-base font-semibold tracking-widest uppercase block mb-3">{t.kicker}</span>
          <h2 id="awards-title" className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-brand-navy leading-tight">{t.title}</h2>
        </div>

        <ul className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {certificates.map((c, i) => (
            <motion.li key={c.file}
              initial={{ opacity: 0, y: reduce ? 0 : 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.05, ease: easeOut }}>
              <button type="button" onClick={() => choose(i)} aria-pressed={chosen === i} aria-controls="award-detail"
                className={`flex h-full w-full flex-col rounded-xl border bg-white p-3 md:p-4 text-left transition-all duration-300 cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${chosen === i ? "border-teal-aa ring-2 ring-teal-aa/25 shadow-md" : "border-slate-200 shadow-sm"}`}>
                <span className="relative block h-16 md:h-24 w-full">
                  <Image src={Images.awards.path(c.file)} alt="" fill sizes="(min-width: 768px) 260px, 45vw" className="object-contain" />
                </span>
                <span className="mt-3 md:mt-4 text-[11px] md:text-xs font-semibold uppercase tracking-wider text-teal-aa">{c.year || "\u00a0"}</span>
                <span className="mt-1 font-heading text-sm md:text-base font-bold leading-snug text-brand-navy">{c.title}</span>
              </button>
            </motion.li>
          ))}
        </ul>

        <div ref={panel} id="award-detail" aria-live="polite" className="mt-4 md:mt-6 scroll-mb-28">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={chosen} initial={{ opacity: 0, y: reduce ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: easeOut }}
              className="rounded-xl border border-slate-200 border-l-4 border-l-teal-aa bg-slate-50 p-5 md:p-8">
              <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-teal-aa">{[award.organization, award.year].filter(Boolean).join(" • ")}</p>
              <h3 className="font-heading text-xl md:text-2xl font-bold text-brand-navy mt-2">{award.title}</h3>
              <p className="text-slate-600 leading-relaxed mt-2 max-w-3xl">{award.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
