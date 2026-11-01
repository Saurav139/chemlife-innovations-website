"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useT } from "@/i18n/LocaleProvider";
import { easeOut, useWhoActions } from "../homepage-five/kit";

// What these five designs add to the shared kit: the products grouped by the need they meet, ChemLife's dated
// history, and two small pieces every design uses (the questions and the four Who We Are buttons).

/** Every product once, under the need it meets (from each product's own description). */
export const NEEDS = [
  { id: "hygiene", title: "Feed hygiene", text: "Mould, bacteria and mycotoxin control for feed and feed ingredients, from storage to stomach.",
    products: ["MaxDmold", "MaxDmold Spray", "SynDmold", "MaxDmold Plus", "AflaMlock", "FeedGenie Forte", "FeedGenie Prime", "DDGS-Dtox"] },
  { id: "gut", title: "Gut and liver health", text: "Non-antibiotic gut performance, gut flora balance and liver support for poultry.",
    products: ["GroGenie (12% & 60%)", "GutproGenie", "LivproGenie"] },
  { id: "minerals", title: "Minerals and layers", text: "Chelated bio-trace minerals and precision nutrition for shell quality.",
    products: ["MinBioZen", "EggGenie"] },
  { id: "rumen", title: "Rumen and dairy", text: "Rumen-protected methionine and choline, rumen buffers and rumen optimisers for dairy.",
    products: ["MethioWiz", "CholiWiz", "MBioWiz Plus", "MBioWiz TS", "RumiWiz"] },
];

/** ChemLife's history, from the partner quotes, the awards and the Who We Are facts. */
export const MILESTONES = [
  { year: "2016", title: "Quadragen VetHealth", text: "Collaboration begins; PromoGen, SlimEat and bio-trace minerals for poultry follow, built on ANBioT." },
  { year: "2018", title: "Huvepharma", text: "Collaboration begins; a microencapsulated, functionalised feed ingredient for dairy follows." },
  { year: "2019", title: "Animal Husbandry Grand Challenge", text: "Finalist, for innovation in sustainable animal nutrition." },
  { year: "2020", title: "EW Nutrition and a-IDEA, ICAR-NAARM", text: "Partnership with EW Nutrition; incubated at a-IDEA, ICAR-NAARM's technology business incubator." },
  { year: "2020–21", title: "C-CAMP K-SAP BIO 50", text: "Selected for the second cohort, to validate and scale biotechnology for animal agriculture." },
  { year: "2021", title: "BIRAC", text: "Supported by BIRAC, Department of Biotechnology, Government of India." },
  { year: "2023", title: "Technology Development Board", text: "Department of Science and Technology support for the bio-trace minerals project." },
  { year: "Today", title: "FAMI-QS certified", text: "Feed-additive quality and safety certification, made in Doddaballapura, Bengaluru." },
];

/** The four questions, one open at a time. */
export function Questions({ tone = "light", className = "" }: { tone?: "light" | "dark"; className?: string }) {
  const faq = useT().home.whoWeAre.faq;
  const [open, setOpen] = useState(0);
  const dark = tone === "dark";
  return <ul className={`${className} ${dark ? "divide-white/15 border-white/15" : "divide-slate-200 border-slate-200"} divide-y border-y`}>
    {faq.map((item, i) => <li key={item.q}>
      <h3><button type="button" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}
        className={`w-full flex items-center justify-between gap-6 py-5 text-left font-heading text-lg md:text-xl font-bold cursor-pointer ${dark ? "text-white hover:text-orange-200" : "text-brand-navy hover:text-brand-orange-aa"}`}>
        {item.q}
        <span aria-hidden="true" className={`grid place-items-center w-9 h-9 rounded-full shrink-0 text-xl transition-transform ${open === i ? "rotate-45" : ""} ${dark ? "bg-white/10 text-white" : "bg-slate-100 text-brand-orange-aa"}`}>+</span>
      </button></h3>
      <AnimatePresence initial={false}>
        {open === i && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: easeOut }} className="overflow-hidden">
          <p className={`pb-6 pr-12 leading-relaxed ${dark ? "text-white/85" : "text-slate-600"}`}>{item.a}</p>
        </motion.div>}
      </AnimatePresence>
    </li>)}
  </ul>;
}

/** Who We Are's four buttons: the first filled, the rest outlined. */
export function WhoButtons({ dark = false, className = "" }: { dark?: boolean; className?: string }) {
  const actions = useWhoActions();
  return <div className={`flex flex-wrap gap-3 ${className}`}>
    {actions.map((act, i) => <a key={act.href} href={act.href} data-analytics-click={act.label}
      className={`inline-flex items-center justify-center min-h-12 px-6 rounded-full font-semibold transition-colors ${i === 0 ? "bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white" : dark ? "border-2 border-white/50 text-white hover:bg-white hover:text-brand-navy" : "border-2 border-brand-navy/20 text-brand-navy hover:border-brand-navy"}`}>{act.label}</a>)}
  </div>;
}

/** A partner logo on a white disc. */
export function LogoDisc({ src, alt, size = 56 }: { src: string; alt: string; size?: number }) {
  return <span className="relative block rounded-full bg-white border border-slate-200 overflow-hidden shrink-0" style={{ width: size, height: size }}>
    <Image src={src} alt={alt} fill sizes={`${size}px`} className="object-contain p-1.5" />
  </span>;
}
