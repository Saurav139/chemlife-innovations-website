"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Images } from "@/lib/assets";
import { PRODUCTS } from "@/lib/catalog";
import { useT } from "@/i18n/LocaleProvider";
import Icon from "@/components/site/Icon";
import { Reveal, Section, SectionTitle, StatRow, easeOut } from "@/components/site/ui";

// Quotes stay in the words our partners wrote them, in English (as in the old carousel).
const QUOTES = [
  { quote: "Specifically with the help of Chemlife Innovations using their proprietary multi-layer microencapsulation technology, we have introduced a novel functionalized feed ingredient for dairy. We are happy with the quality of the product and happy with service support provided by them.", name: "Akmal Reyaz", role: "Business Head – Dairy & Aqua, Huvepharma Sea (Pune)", logo: Images.testimonials.huve },
  { quote: "Chemlife is our Technology partner and Product developer in the field of mold inhibition and toxin management using innovative technology for animal health. We are highly satisfied with the quality of Chemlife's Products and Technologies.", name: "Dr Manjunatha B P", role: "Chief Executive Officer, GROEXL Vet", logo: Images.testimonials.groxel },
  { quote: "We have been able to launch PromoGen (Natural Growth promoter for poultry) and SlimEat (Lean meat inducer for swine) for export market and Bio-trace minerals for poultry for domestic market specifically with the support of Chemlife Innovations using their ANBioT technology.", name: "Lakshmikanth Yadav", role: "Managing Director, Quadragen VetHealth", logo: Images.testimonials.quadragen },
];
const AWARDS = [
  { src: Images.awards.ccamp, alt: "C-CAMP" },
  { src: Images.awards.birac, alt: "BIRAC" },
  { src: Images.awards.naarm, alt: "a-IDEA, ICAR-NAARM" },
  { src: Images.awards.animalHusbandry, alt: "Animal Husbandry Grand Challenge" },
];

export default function Proof() {
  const t = useT();
  const p = t.site.proof;
  const reduce = useReducedMotion();
  const [quote, setQuote] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (reduce || paused) return;
    const timer = window.setInterval(() => setQuote((q) => (q + 1) % QUOTES.length), 8000);
    return () => window.clearInterval(timer);
  }, [reduce, paused]);
  const logos = [...Images.partnerLogos.frontRow, ...Images.partnerLogos.backRow].slice(0, 9);
  const current = QUOTES[quote];

  return <Section tone="raised" labelledBy="proof-title">
    <SectionTitle id="proof-title" title={p.title} />
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-0">
      <div className="lg:pr-12 lg:border-r lg:border-line">
        <Reveal><StatRow wide={2} stats={p.stats.map((s) => ({ ...s, value: s.value.replace("{products}", String(PRODUCTS.length)) }))} /></Reveal>
        <Reveal delay={0.1} className="mt-12 pt-10 border-t border-line">
          <p className="text-sm font-semibold text-copy">{p.recognised}</p>
          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {AWARDS.map((award) => <li key={award.alt} className="relative h-20 rounded-xl bg-white border border-line p-3">
              <Image src={award.src} alt={award.alt} fill sizes="160px" className="object-contain p-3" />
            </li>)}
          </ul>
        </Reveal>
      </div>

      <div className="lg:pl-12" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
        <Reveal className="relative rounded-2xl border border-line bg-card/70 p-6 md:p-8 min-h-[22rem] flex flex-col">
          <Icon name="quote" className="w-9 h-9 text-flame" />
          <AnimatePresence mode="wait">
            <motion.figure key={current.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.4, ease: easeOut }} className="flex-1 flex flex-col mt-4">
              <blockquote className="text-ink text-lg md:text-xl leading-relaxed">“{current.quote}”</blockquote>
              <figcaption className="flex items-center gap-4 mt-auto pt-6">
                <span className="relative w-14 h-14 rounded-xl bg-white shrink-0 overflow-hidden"><Image src={current.logo} alt="" fill sizes="56px" className="object-contain p-1.5" /></span>
                <span>
                  <span className="block font-bold text-mint">{current.name}</span>
                  <span className="block text-sm text-copy">{current.role}</span>
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
          <div className="flex gap-2 mt-6" role="group" aria-label="Testimonials">
            {QUOTES.map((q, i) => <button key={q.name} type="button" onClick={() => setQuote(i)} aria-label={q.name} aria-pressed={i === quote}
              className="tap-target h-2 rounded-full transition-all cursor-pointer" style={{ width: i === quote ? 28 : 8, backgroundColor: i === quote ? "var(--color-flame)" : "var(--color-card-hi2)" }} />)}
          </div>
        </Reveal>
        <Reveal delay={0.1} className="mt-10">
          <p className="text-sm font-semibold text-copy">{p.partners}</p>
          <ul className="grid grid-cols-3 gap-3 mt-5">
            {logos.map((logo) => <li key={logo} className="relative h-16 rounded-xl bg-white border border-line">
              <Image src={Images.partnerLogos.path(logo)} alt={Images.partnerLogos.names[logo as keyof typeof Images.partnerLogos.names] ?? "Partner"} fill sizes="140px" className="object-contain p-3" />
            </li>)}
          </ul>
        </Reveal>
      </div>
    </div>
  </Section>;
}
