"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Images } from "@/lib/assets";
import { Closing, easeOut, useWhoWeAre } from "./shared";

type Chapter = { image: string; alt: string; position?: string; kicker: string; title: string; text?: string; facts?: { label: string; value: string }[] };

function Step({ chapter, index, onActive }: { chapter: Chapter; index: number; onActive: (i: number) => void }) {
  const ref = useRef<HTMLLIElement>(null);
  // Only the chapter crossing the middle of the screen counts as current.
  const current = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => { if (current) onActive(index); }, [current, index, onActive]);
  return <li ref={ref} className="min-h-[70svh] lg:min-h-[85svh] flex flex-col justify-center py-10">
    <motion.div animate={{ opacity: current ? 1 : 0.3 }} transition={{ duration: 0.4 }}>
      <p className="text-sm font-semibold tracking-widest uppercase text-teal-aa">{String(index + 1).padStart(2, "0")} · {chapter.kicker}</p>
      <h3 className="font-heading text-2xl md:text-4xl font-bold text-brand-navy leading-tight mt-3">{chapter.title}</h3>
      {chapter.text && <p className="text-slate-700 text-base md:text-lg leading-relaxed mt-4">{chapter.text}</p>}
      {chapter.facts && <dl className="mt-6 grid sm:grid-cols-2 gap-5">
        {chapter.facts.map((fact) => <div key={fact.label} className="border-l-2 border-brand-orange pl-4">
          <dt className="text-xs font-bold tracking-widest uppercase text-slate-500">{fact.label}</dt>
          <dd className="text-brand-navy font-semibold mt-1">{fact.value}</dd>
        </div>)}
      </dl>}
    </motion.div>
  </li>;
}

/** The picture stays pinned while the chapters scroll past it; each chapter brings in its own picture. */
export default function PinnedChapters() {
  const t = useWhoWeAre();
  const [active, setActive] = useState(0);
  const chapters: Chapter[] = [
    { image: Images.people.foundersNew, alt: "ChemLife's founders and leadership team", position: "40% 50%", kicker: t.kicker, title: t.title, text: t.intro },
    { image: Images.research.pellets, alt: "Bowls of feed pellets and powdered feed ingredients", kicker: "What we make", title: t.faq[0].q, text: t.faq[0].a },
    { image: Images.research.researchImage, alt: "ChemLife's research laboratory", kicker: "Technology", title: t.faq[1].q, text: t.faq[1].a },
    { image: Images.products.banners.maxdmold, alt: "Feed grain shielded from mould", kicker: "Feed hygiene", title: t.faq[2].q, text: t.faq[2].a },
    { image: Images.process.delivery, alt: "A feed warehouse and delivery trucks", kicker: "Delivery", title: t.faq[3].q, text: t.faq[3].a },
    { image: Images.process.manufacturingImage, alt: "Machinery at the Doddaballapura plant", kicker: "Proof", title: "Certified, recognised and supported", facts: t.facts.slice(4, 8) },
  ];

  return <section aria-label="Who we are, pinned chapters" className="bg-white">
    <div className="max-w-[1200px] mx-auto px-6 pt-10 md:pt-16 lg:grid lg:grid-cols-12 lg:gap-16">
      {/* Phones: the picture pins across the top and the text scrolls up under it. */}
      <div className="sticky top-18 md:top-20 lg:top-24 z-10 h-[34svh] md:h-[40svh] lg:h-[calc(100svh-6rem)] lg:col-span-6 lg:order-2 flex items-center py-3 bg-white">
        <div className="relative w-full h-full lg:h-[80%] rounded-2xl overflow-hidden bg-slate-100">
          {chapters.map((chapter, i) => <motion.div key={chapter.title} className="absolute inset-0" initial={false}
            animate={{ opacity: active === i ? 1 : 0, scale: active === i ? 1 : 1.08 }} transition={{ duration: 0.7, ease: easeOut }}>
            <Image src={chapter.image} alt={active === i ? chapter.alt : ""} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" style={{ objectPosition: chapter.position }} />
          </motion.div>)}
          <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 bg-gradient-to-t from-brand-navy/80 to-transparent flex items-end justify-between gap-4">
            <span className="text-white font-heading font-bold text-lg">{String(active + 1).padStart(2, "0")} <span className="text-white/60">/ {String(chapters.length).padStart(2, "0")}</span></span>
            <span className="flex gap-1.5" aria-hidden="true">
              {chapters.map((chapter, i) => <span key={chapter.title} className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-8 bg-brand-orange" : "w-3 bg-white/50"}`} />)}
            </span>
          </div>
        </div>
      </div>
      <ol className="lg:col-span-6 lg:order-1 lg:py-[10svh]">
        {chapters.map((chapter, i) => <Step key={chapter.title} chapter={chapter} index={i} onActive={setActive} />)}
      </ol>
    </div>
    <Closing />
  </section>;
}
