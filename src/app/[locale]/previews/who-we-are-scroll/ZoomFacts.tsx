"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionTemplate, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Images } from "@/lib/assets";
import { Closing, PINNED, easeOut, useWhoWeAre } from "./shared";

/** The leadership photo opens from a small frame to the whole screen, then the facts turn over one at a time. */
export default function ZoomFacts() {
  const t = useWhoWeAre();
  const reduce = useReducedMotion();
  const zoomRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: zoom } = useScroll({ target: zoomRef, offset: ["start start", "end end"] });
  const insetTop = useTransform(zoom, [0, 0.55], [reduce ? 0 : 42, 0]);
  const insetSide = useTransform(zoom, [0, 0.55], [reduce ? 0 : 28, 0]);
  const insetBottom = useTransform(zoom, [0, 0.55], [reduce ? 0 : 6, 0]);
  const radius = useTransform(zoom, [0, 0.55], [reduce ? 0 : 24, 0]);
  const clipPath = useMotionTemplate`inset(${insetTop}% ${insetSide}% ${insetBottom}% ${insetSide}% round ${radius}px)`;
  const photoScale = useTransform(zoom, [0, 1], [reduce ? 1 : 1.2, 1]);
  const headlineOpacity = useTransform(zoom, [0.04, 0.2], [1, reduce ? 1 : 0]);
  const headlineY = useTransform(zoom, [0, 0.2], [0, reduce ? 0 : -60]);
  const shade = useTransform(zoom, [0.5, 0.75], [reduce ? 1 : 0, 1]);
  const storyY = useTransform(zoom, [0.55, 0.8], [reduce ? 0 : 40, 0]);

  const { scrollYProgress: deck } = useScroll({ target: deckRef, offset: ["start start", "end end"] });
  const n = t.facts.length;
  const [fact, setFact] = useState(0);
  useMotionValueEvent(deck, "change", (v) => setFact(Math.min(n - 1, Math.max(0, Math.floor(v * n)))));
  const current = t.facts[fact];

  return <section aria-label="Who we are, zoom and fact deck" className="bg-white">
    {/* The zoom */}
    <div ref={zoomRef} className="relative" style={{ height: reduce ? "auto" : "280svh" }}>
      <div className={`${PINNED} overflow-hidden`}>
        <motion.div style={{ clipPath }} className="absolute inset-0">
          <motion.div style={{ scale: photoScale }} className="absolute inset-0">
            <Image src={Images.people.foundersNew} alt="ChemLife's founders and leadership team" fill sizes="100vw" className="object-cover object-[42%_55%]" />
          </motion.div>
          <motion.div style={{ opacity: shade }} className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/70 to-brand-navy/20" />
        </motion.div>
        <motion.div style={{ opacity: headlineOpacity, y: headlineY }} className="absolute inset-x-0 top-[8%] px-6 text-center pointer-events-none">
          <p className="text-sm font-semibold tracking-widest uppercase text-teal-aa">{t.kicker}</p>
          <p className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-brand-navy leading-[1.05] mt-3 max-w-4xl mx-auto">{t.tagline}</p>
        </motion.div>
        <motion.div style={{ opacity: shade, y: storyY }} className="absolute inset-x-0 bottom-0 pb-10 md:pb-16">
          <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-12 gap-6 lg:gap-12 items-end">
            <h2 className="lg:col-span-6 font-heading text-3xl md:text-5xl font-bold text-white leading-tight">{t.title}</h2>
            <p className="lg:col-span-6 text-white/90 md:text-lg leading-relaxed">{t.intro}</p>
          </div>
        </motion.div>
      </div>
    </div>

    {/* The fact deck. The full list is also there for screen readers, since only one fact shows at a time. */}
    <dl className="sr-only">{t.facts.map((f) => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}</dl>
    <div ref={deckRef} className="relative" style={{ height: `${n * 55}svh` }} aria-hidden="true">
      <div className={`${PINNED} flex items-center`}>
        <div className="max-w-[1200px] mx-auto px-6 w-full grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-8">
            <p className="text-sm font-semibold tracking-widest uppercase text-teal-aa">At a glance</p>
            <p className="font-heading text-7xl md:text-9xl font-bold text-brand-orange-aa tabular-nums leading-none mt-4">
              {String(fact + 1).padStart(2, "0")}<span className="text-slate-300 text-3xl md:text-5xl"> / {n}</span>
            </p>
            <div className="min-h-[220px] md:min-h-[200px] mt-6">
              <AnimatePresence mode="wait">
                <motion.div key={current.label} initial={{ opacity: 0, y: reduce ? 0 : 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduce ? 0 : -30 }} transition={{ duration: 0.35, ease: easeOut }}>
                  <h3 className="text-sm md:text-base font-bold tracking-widest uppercase text-brand-navy/60">{current.label}</h3>
                  <p className="font-heading text-2xl md:text-4xl font-bold text-brand-navy leading-tight mt-3">{current.value}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex gap-1.5 mt-6 lg:hidden">
              {t.facts.map((f, i) => <span key={f.label} className={`h-1.5 rounded-full transition-all duration-300 ${i === fact ? "w-8 bg-brand-orange" : "w-3 bg-slate-300"}`} />)}
            </div>
          </div>
          <ol className="hidden lg:block lg:col-span-4 border-l border-slate-200">
            {t.facts.map((f, i) => <li key={f.label} className={`-ml-px pl-5 py-2 border-l-2 transition-colors duration-300 ${i === fact ? "border-brand-orange text-brand-navy font-bold" : "border-transparent text-slate-400"}`}>{f.label}</li>)}
          </ol>
        </div>
      </div>
    </div>
    <Closing />
  </section>;
}
