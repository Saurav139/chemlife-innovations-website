"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Images } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";
import { Reveal, SectionHead, accentLast, easeOut } from "@/components/site/ui";

// Quotes stay in the words our partners wrote them, in English.
const TESTIMONIALS = [
  {
    quote: "We are happy to inform that we have collaboration arrangement with Chemlife Innovations since 2018 and continuing to have technology developer & novel product manufacturing understanding with them. Specifically with the help of Chemlife Innovations using their proprietary multi-layer microencapsulation technology, we have introduced a novel functionalized feed ingredient for dairy. We are happy with the quality of the product and happy with service support provided by them.",
    name: "Akmal Reyaz", role: "Business Head – Dairy & Aqua", company: "Huvepharma Sea (Pune) Private Limited", short: "Huvepharma", logo: Images.testimonials.huve,
  },
  {
    quote: "We are associated with M/S Chemlife Innovations Pvt Ltd at # 18, KIADB Industrial Area, 3rd Phase, Obadenahalli, Doddaballapur, Bengaluru Rural District for last 2 years. Chemlife is our Technology partner and Product developer in the field of mold inhibition and toxin management using innovative technology for animal health. We are highly satisfied with the quality of Chemlife's Products and Technologies.",
    name: "Dr Manjunatha B P", role: "Chief Executive Officer", company: "GROEXL Vet Private Limited", short: "GROEXL Vet", logo: Images.testimonials.groxel,
  },
  {
    quote: "We are happy to inform, that we have collaboration arrangement with Chemlife Innovations Private Limited, since 2016 and continuing to have technology developer & novel product manufacturing understanding with them. We have been able to launch PromoGen (Natural Growth promoter for poultry) and SlimEat (Lean meat inducer for swine) for export market and Bio-trace minerals for poultry for domestic market specifically with the support of Chemlife Innovations using their ANBioT technology. We are pleased with quality and service/support of ChemLife Innovation.",
    name: "Lakshmikanth Yadav", role: "Managing Director", company: "Quadragen VetHealth Private Limited", short: "Quadragen", logo: Images.testimonials.quadragen,
  },
];

// Every partner logo once.
const LOGOS = [...new Set([...Images.partnerLogos.frontRow, ...Images.partnerLogos.backRow])];

/** What partners say, then the wall of partner logos. */
export default function Voices() {
  const home = useT().home;
  const t = home.testimonials;
  const [current, setCurrent] = useState(0);
  const quote = TESTIMONIALS[current];

  return (
    <>
      <section aria-labelledby="voices-title" className="paper relative bg-page py-20 md:py-28 lg:py-36">
        <div className="container-site">
          <SectionHead id="voices-title" index="05" kicker={t.kicker} title={accentLast(t.title)} />
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12">
            {/* The partners, as tabs */}
            <div role="tablist" aria-label={home.partners.kicker} className="lg:col-span-3 grid grid-cols-3 lg:grid-cols-1 gap-2 self-start"
              onKeyDown={(e) => {
                const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
                if (!step) return;
                e.preventDefault();
                const next = (current + step + TESTIMONIALS.length) % TESTIMONIALS.length;
                setCurrent(next);
                document.getElementById(`voice-tab-${next}`)?.focus();
              }}>
              {TESTIMONIALS.map((item, i) => {
                const active = i === current;
                return <button key={item.short} id={`voice-tab-${i}`} type="button" role="tab" aria-selected={active} aria-controls="voice-panel" tabIndex={active ? 0 : -1}
                  onClick={() => setCurrent(i)}
                  className={`flex flex-col lg:flex-row items-center lg:items-center gap-3 rounded-2xl border p-3 lg:p-4 text-center lg:text-left transition-colors cursor-pointer ${active ? "border-ink bg-card" : "border-line hover:border-ink/40"}`}>
                  <span className="relative w-12 h-12 rounded-full bg-white border border-line overflow-hidden shrink-0"><Image src={item.logo} alt="" fill sizes="48px" className="object-contain p-1.5" /></span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink leading-tight">{item.short}</span>
                    <span className="hidden lg:block text-[13px] text-copy-dim mt-0.5">{item.name}</span>
                  </span>
                </button>;
              })}
            </div>

            <div id="voice-panel" role="tabpanel" aria-labelledby={`voice-tab-${current}`} className="lg:col-span-9 relative">
              <span aria-hidden="true" className="absolute -top-10 -left-2 font-display text-[10rem] leading-none text-flame/15 select-none">“</span>
              <AnimatePresence mode="wait">
                <motion.figure key={current} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.5, ease: easeOut }} className="relative">
                  <blockquote className="font-display text-[1.4rem] md:text-[1.9rem] leading-[1.4] text-ink tracking-[-0.01em]">{quote.quote}</blockquote>
                  <figcaption className="flex items-center gap-4 mt-10 pt-8 border-t border-line">
                    <span className="relative w-16 h-16 rounded-full bg-white border border-line overflow-hidden shrink-0"><Image src={quote.logo} alt={`${quote.company} logo`} fill sizes="64px" className="object-contain p-2" /></span>
                    <span>
                      <span className="block font-semibold text-ink text-lg">{quote.name}</span>
                      <span className="block text-copy">{quote.role}</span>
                      <span className="block label-mono text-copy-dim mt-1 normal-case tracking-normal text-[13px]">{quote.company}</span>
                    </span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="partners-title" className="paper relative bg-page-alt py-20 md:py-28">
        <div className="container-site">
          <SectionHead id="partners-title" index="06" kicker={home.partners.kicker} title={accentLast(home.partners.title)} className="!mb-10" />
          <Reveal>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border-l border-t border-line">
              {LOGOS.map((file) => (
                <li key={file} className="group relative aspect-[3/2] border-r border-b border-line bg-card/60 hover:bg-card transition-colors">
                  <div className="absolute inset-[18%_14%]">
                    <Image src={Images.partnerLogos.path(file)} alt={`${Images.partnerLogos.names[file] ?? "Partner"} ${home.partners.logo}`} fill
                      sizes="(min-width: 1024px) 160px, (min-width: 640px) 25vw, 40vw" className="object-contain mix-blend-multiply grayscale-[0.6] opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-[filter,opacity] duration-500" />
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}
