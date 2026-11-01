"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Images } from "@/lib/assets";
import { Actions, PINNED, useWhoWeAre } from "./shared";

const RANGES = ["MaxDmold", "FeedGenie", "MinBioZen", "MethioWiz", "CholiWiz"];
const TECHNOLOGIES = ["ANBioT", "Green synthesis", "Microencapsulation"];

function Panel({ kicker, children }: { kicker: string; children: React.ReactNode }) {
  return <div className="max-w-[1100px] mx-auto px-6 w-full">
    <p className="text-sm font-semibold tracking-widest uppercase text-teal-300 mb-4">{kicker}</p>
    {children}
  </div>;
}

function Photo({ src, alt }: { src: string; alt: string }) {
  return <div className="relative hidden md:block aspect-[4/3] rounded-2xl overflow-hidden">
    <Image src={src} alt={alt} fill sizes="480px" className="object-cover" />
  </div>;
}

/** Scrolling down carries the story sideways, one panel per screen, with a progress bar along the bottom. */
export default function SidewaysJourney() {
  const t = useWhoWeAre();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const panels: { kicker: string; body: React.ReactNode }[] = [
    { kicker: t.kicker, body: <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-end">
      <div>
        <h2 className="font-heading text-3xl md:text-5xl font-bold text-white leading-tight">{t.title}</h2>
        <p className="font-heading text-lg md:text-xl font-semibold italic text-orange-300 mt-4">{t.tagline}</p>
      </div>
      <p className="text-white/85 md:text-lg leading-relaxed">{t.intro}</p>
    </div> },
    { kicker: "What we make", body: <div className="grid md:grid-cols-2 gap-10 items-center">
      <div>
        <h3 className="font-heading text-2xl md:text-4xl font-bold text-white leading-tight">{t.faq[0].q}</h3>
        <p className="text-white/85 leading-relaxed mt-4">{t.faq[0].a}</p>
        <ul className="flex flex-wrap gap-2 mt-6">{RANGES.map((range) => <li key={range} className="rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-white font-semibold">{range}</li>)}</ul>
      </div>
      <Photo src={Images.research.pellets} alt="Bowls of feed pellets and powdered feed ingredients" />
    </div> },
    { kicker: "Our technologies", body: <div className="grid md:grid-cols-2 gap-10 items-center">
      <ul className="space-y-1 min-w-0">{TECHNOLOGIES.map((tech, i) => <li key={tech} className={`font-heading text-3xl md:text-4xl xl:text-5xl font-bold leading-tight ${i === 0 ? "text-orange-300" : "text-white"}`}>{tech}</li>)}</ul>
      <div>
        <h3 className="font-heading text-xl md:text-2xl font-bold text-white">{t.faq[1].q}</h3>
        <p className="text-white/85 leading-relaxed mt-3">{t.faq[1].a}</p>
      </div>
    </div> },
    { kicker: "Feed hygiene", body: <div className="grid md:grid-cols-2 gap-10 items-center">
      <Photo src={Images.products.banners.maxdmold} alt="Feed grain shielded from mould" />
      <div>
        <h3 className="font-heading text-2xl md:text-4xl font-bold text-white leading-tight">{t.faq[2].q}</h3>
        <p className="text-white/85 leading-relaxed mt-4">{t.faq[2].a}</p>
      </div>
    </div> },
    { kicker: "Proof", body: <dl className="grid sm:grid-cols-2 gap-4 md:gap-6">
      {t.facts.slice(4, 8).map((fact) => <div key={fact.label} className="rounded-2xl bg-white/10 border border-white/15 p-5 md:p-7">
        <dt className="text-xs font-bold tracking-widest uppercase text-orange-300">{fact.label}</dt>
        <dd className="text-white text-lg md:text-xl font-semibold mt-2 leading-snug">{fact.value}</dd>
      </div>)}
    </dl> },
    { kicker: "Delivery", body: <div className="grid md:grid-cols-2 gap-10 items-center">
      <div>
        <h3 className="font-heading text-2xl md:text-4xl font-bold text-white leading-tight">{t.faq[3].q}</h3>
        <p className="text-white/85 leading-relaxed mt-4">{t.faq[3].a}</p>
      </div>
      <Photo src={Images.process.delivery} alt="A feed warehouse and delivery trucks" />
    </div> },
    { kicker: "Leadership", body: <div className="max-w-3xl">
      <p className="font-heading text-2xl md:text-4xl font-bold text-white leading-tight">{t.leadershipCaption}</p>
      <p className="text-white/75 mt-5">{t.facts[9].value}</p>
      <div className="mt-8"><Actions light /></div>
    </div> },
  ];
  const n = panels.length;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${((n - 1) / n) * 100}%`]);
  const [current, setCurrent] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setCurrent(Math.min(n - 1, Math.round(v * (n - 1)))));

  // Reduced motion: the same panels, one under the next.
  if (reduce) return <section ref={ref} aria-label="Who we are, sideways journey" className="bg-brand-navy">
    {panels.map((panel) => <div key={panel.kicker} className="py-16 border-b border-white/10"><Panel kicker={panel.kicker}>{panel.body}</Panel></div>)}
  </section>;

  return <section ref={ref} aria-label="Who we are, sideways journey" className="relative bg-brand-navy" style={{ height: `${n * 100}svh` }}>
    <div className={`${PINNED} overflow-hidden`}>
      <motion.div style={{ x, width: `${n * 100}%` }} className="flex h-full">
        {panels.map((panel) => <div key={panel.kicker} style={{ width: `${100 / n}%` }} className="h-full flex items-center pb-12">
          <Panel kicker={panel.kicker}>{panel.body}</Panel>
        </div>)}
      </motion.div>
      <div className="absolute inset-x-0 bottom-0 px-6 pb-6">
        <div className="max-w-[1100px] mx-auto flex items-center gap-4">
          <span className="text-white font-heading font-bold tabular-nums">{String(current + 1).padStart(2, "0")}<span className="text-white/50"> / {String(n).padStart(2, "0")}</span></span>
          <div className="flex-1 h-1 rounded-full bg-white/15 overflow-hidden">
            <motion.div style={{ scaleX: scrollYProgress }} className="h-full bg-brand-orange origin-left" />
          </div>
          <span className="hidden sm:block text-white/60 text-sm">Keep scrolling</span>
        </div>
      </div>
    </div>
  </section>;
}
