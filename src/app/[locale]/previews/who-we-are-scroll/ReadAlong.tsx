"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Closing, easeOut, useWhoWeAre } from "./shared";

function Word({ word, progress, range }: { word: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return <motion.span style={{ opacity }}>{word} </motion.span>;
}

/** Text that fills in word by word as it moves up the screen. */
function Highlight({ text, className }: { text: string; className: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  if (reduce) return <p ref={ref} className={className}>{text}</p>;
  const words = text.split(" ");
  return <p ref={ref} className={className}>
    {words.map((word, i) => <Word key={`${word}-${i}`} word={word} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} />)}
  </p>;
}

/** Large type that fills in as it's read, with each question pinned beside its answer. */
export default function ReadAlong() {
  const t = useWhoWeAre();
  return <section aria-label="Who we are, read along" className="bg-white">
    <div className="max-w-[1100px] mx-auto px-6 pt-16 md:pt-24">
      <p className="text-sm font-semibold tracking-widest uppercase text-teal-aa">{t.kicker}</p>
      <h2 className="font-heading text-3xl md:text-5xl font-bold text-brand-navy leading-tight mt-3 max-w-4xl">{t.title}</h2>
      <p className="font-heading text-lg md:text-xl font-semibold italic text-brand-orange-aa mt-4">{t.tagline}</p>
      <Highlight text={t.intro} className="font-heading text-2xl md:text-4xl font-bold text-brand-navy leading-snug mt-[18svh] mb-[22svh]" />
    </div>

    <div className="max-w-[1100px] mx-auto px-6">
      {t.faq.map((item, i) => <div key={item.q} className="grid lg:grid-cols-12 gap-4 lg:gap-12 py-[14svh] border-t border-slate-200">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <p className="font-heading text-5xl font-bold text-brand-orange-aa">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="font-heading text-xl md:text-2xl font-bold text-brand-navy mt-2">{item.q}</h3>
          </div>
        </div>
        <Highlight text={item.a} className="lg:col-span-8 text-xl md:text-3xl text-brand-navy leading-snug" />
      </div>)}
    </div>

    <div className="bg-slate-50 py-16 md:py-24">
      <dl className="max-w-[1100px] mx-auto px-6">
        {t.facts.map((fact, i) => <motion.div key={fact.label} className="grid md:grid-cols-12 gap-2 md:gap-8 py-4 border-b border-slate-200"
          initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.45, delay: (i % 3) * 0.05, ease: easeOut }}>
          <dt className="md:col-span-4 text-sm font-bold tracking-widest uppercase text-teal-aa">{fact.label}</dt>
          <dd className="md:col-span-8 text-brand-navy text-lg">{fact.value}</dd>
        </motion.div>)}
      </dl>
    </div>
    <Closing />
  </section>;
}
