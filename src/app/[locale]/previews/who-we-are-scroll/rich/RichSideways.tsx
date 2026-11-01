"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Closing, PINNED } from "../shared";
import { useRichChapters, type RichChapter } from "./content";
import { ChapterGraphic } from "./graphics";
import { Collage, KineticTitle, Marquee, MoreInfo, Particles, SpinBadge, flagsFor, type Level } from "./blocks";

type Flags = ReturnType<typeof flagsFor>;
const pad = (n: number) => String(n).padStart(2, "0");
// Each chapter's backdrop in the "all out" version: its accent, deepened.
const DEEP = ["#1f3557", "#4a1d15", "#0e3a36", "#1d3a1b", "#3b290c", "#10334f", "#2b2046"];

// The fuller panels need a tablet-sized screen or larger; phones get them one under the next.
function useWide() {
  return useSyncExternalStore(
    (onChange) => { const m = window.matchMedia("(min-width: 768px)"); m.addEventListener("change", onChange); return () => m.removeEventListener("change", onChange); },
    () => window.matchMedia("(min-width: 768px)").matches,
    () => true,
  );
}

function ChapterText({ chapter, index, flags, current, dense }: { chapter: RichChapter; index: number; flags: Flags; current: boolean; dense: boolean }) {
  const titleClass = `font-heading font-bold text-white leading-tight ${dense ? "text-2xl lg:text-3xl xl:text-4xl" : "text-3xl"}`;
  return <>
    <p className="text-sm font-semibold tracking-widest uppercase text-teal-300 mb-3">{pad(index + 1)} · {chapter.kicker}</p>
    {flags.wild ? <KineticTitle text={chapter.title} play={current} className={titleClass} /> : <h3 className={titleClass}>{chapter.title}</h3>}
    {chapter.text && <p className={`text-white/85 leading-relaxed mt-3 ${dense ? "text-[15px] xl:text-base" : ""}`}>{chapter.text}</p>}
    {chapter.facts && <dl className="grid grid-cols-2 gap-3 mt-4">
      {chapter.facts.map((fact) => <div key={fact.label} className="rounded-xl bg-white/10 border border-white/15 p-3">
        <dt className="text-[11px] font-bold tracking-widest uppercase text-orange-300">{fact.label}</dt>
        <dd className="text-white text-sm font-semibold mt-1 leading-snug">{fact.value}</dd>
      </div>)}
    </dl>}
    {flags.more && <MoreInfo chapter={chapter} images={flags.images} dense={dense} light play={current} count={flags.wild} />}
  </>;
}

function ChapterVisual({ chapter, flags, current, wild }: { chapter: RichChapter; flags: Flags; current: boolean; wild: boolean }) {
  if (flags.images && !flags.graphic) return <Collage chapter={chapter} show={current} sizes="(min-width: 768px) 46vw, 100vw" />;
  if (!flags.graphic) return <div className="relative h-full rounded-2xl overflow-hidden">
    <Image src={chapter.photo.src} alt={chapter.photo.alt} fill sizes="(min-width: 768px) 46vw, 100vw" className="object-cover" style={{ objectPosition: chapter.photo.position }} />
  </div>;
  return <div className="relative h-full">
    <motion.div className="absolute right-0 top-0 w-[78%] h-[72%] rounded-2xl overflow-hidden shadow-2xl" initial={false} animate={{ rotate: current && wild ? 2 : 0 }}>
      <Image src={chapter.photo.src} alt={chapter.photo.alt} fill sizes="(min-width: 768px) 38vw, 100vw" className="object-cover" style={{ objectPosition: chapter.photo.position }} />
    </motion.div>
    <div className="absolute right-0 bottom-0 w-[36%] h-[24%] flex gap-2">
      {chapter.gallery.slice(0, 2).map((photo, i) => <motion.div key={photo.src} className="relative flex-1 rounded-xl overflow-hidden border-2 border-white/70" initial={false}
        animate={{ opacity: current ? 1 : 0, y: current ? 0 : 20 }} transition={{ delay: current ? 0.3 + i * 0.12 : 0 }}>
        <Image src={photo.src} alt={photo.alt} fill sizes="160px" className="object-cover" style={{ objectPosition: photo.position }} />
      </motion.div>)}
    </div>
    <motion.div className="absolute left-0 bottom-0 w-[62%] aspect-[4/3] rounded-2xl bg-white shadow-2xl p-3" initial={false}
      animate={{ opacity: current ? 1 : 0.6, y: current ? 0 : 20, rotate: current && wild ? -2 : 0 }} transition={{ duration: 0.5 }}>
      <ChapterGraphic id={chapter.id} play={current} />
    </motion.div>
    {wild && <SpinBadge text="Nature-driven science · Proof in every kilo · " className="absolute -top-6 -left-4 w-24 z-10" />}
  </div>;
}

function Panel({ chapter, index, n, flags, current, progress }: { chapter: RichChapter; index: number; n: number; flags: Flags; current: boolean; progress: MotionValue<number> }) {
  // Where this panel is: 0 when centred, -1 one screen to the right, 1 one screen to the left. Layers move at
  // different speeds against it in the "all out" version.
  const local = useTransform(progress, (v) => v * (n - 1) - index);
  const textX = useTransform(local, [-1, 1], [120, -120]);
  const visualX = useTransform(local, [-1, 1], [-160, 160]);
  const numberX = useTransform(local, [-1, 1], [420, -420]);
  return <div className={`relative h-full flex items-center ${flags.wild ? "pb-36" : "pb-20"}`} style={{ width: `${100 / n}%` }}>
    {flags.wild && <motion.span aria-hidden="true" style={{ x: numberX }} className="absolute right-[6%] top-[8%] font-heading font-bold text-[16rem] leading-none text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.12)] select-none pointer-events-none">{pad(index + 1)}</motion.span>}
    <div className="relative max-w-[1240px] mx-auto px-8 w-full grid grid-cols-12 gap-8 lg:gap-12 items-center">
      <motion.div className="col-span-6" style={flags.wild ? { x: textX } : undefined}>
        <ChapterText chapter={chapter} index={index} flags={flags} current={current} dense />
      </motion.div>
      <motion.div className="col-span-6 h-[min(58svh,540px)]" style={flags.wild ? { x: visualX } : undefined}>
        <ChapterVisual chapter={chapter} flags={flags} current={current} wild={flags.wild} />
      </motion.div>
    </div>
  </div>;
}

// Phones and reduced motion: the same chapters, one under the next.
function StackedChapter({ chapter, index, flags }: { chapter: RichChapter; index: number; flags: Flags }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { margin: "-30% 0px -30% 0px" });
  return <div ref={ref} className="relative py-14 border-b border-white/10 overflow-hidden" style={flags.wild ? { backgroundColor: DEEP[index] } : undefined}>
    {flags.wild && <Particles light count={8} />}
    <div className="relative px-6 max-w-[700px] mx-auto">
      <ChapterText chapter={chapter} index={index} flags={flags} current={seen} dense={false} />
      <div className={`mt-8 ${flags.graphic ? "h-[340px]" : "h-[300px]"}`}><ChapterVisual chapter={chapter} flags={flags} current={seen} wild={false} /></div>
    </div>
  </div>;
}

/** The sideways journey with more on every panel. */
export default function RichSideways({ level }: { level: Level }) {
  const chapters = useRichChapters();
  const flags = flagsFor(level);
  const wide = useWide();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const n = chapters.length;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${((n - 1) / n) * 100}%`]);
  const background = useTransform(scrollYProgress, chapters.map((_, i) => i / (n - 1)), DEEP);
  const [current, setCurrent] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setCurrent(Math.min(n - 1, Math.round(v * (n - 1)))));

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (i / (n - 1)) * (el.offsetHeight - window.innerHeight), behavior: "smooth" });
  };

  if (!wide || reduce) return <section ref={ref} aria-label={`Who we are, sideways journey, ${level}`} className="bg-brand-navy">
    {chapters.map((chapter, i) => <StackedChapter key={chapter.id} chapter={chapter} index={i} flags={flags} />)}
    {flags.wild && <Marquee light />}
    <Closing light />
  </section>;

  return <div>
    <section ref={ref} aria-label={`Who we are, sideways journey, ${level}`} className="relative bg-brand-navy" style={{ height: `${n * 110}svh` }}>
      <motion.div className={`${PINNED} overflow-hidden`} style={flags.wild ? { backgroundColor: background } : undefined}>
        {flags.wild && <Particles light />}
        <motion.div style={{ x, width: `${n * 100}%` }} className="relative flex h-full">
          {chapters.map((chapter, i) => <Panel key={chapter.id} chapter={chapter} index={i} n={n} flags={flags} current={current === i} progress={scrollYProgress} />)}
        </motion.div>
        <div className="absolute inset-x-0 bottom-0">
          {flags.wild && <div className="border-t border-white/10"><Marquee light /></div>}
          <div className="px-8 pb-5 pt-3">
            <div className="max-w-[1240px] mx-auto flex items-center gap-5">
              <span className="text-white font-heading font-bold tabular-nums">{pad(current + 1)}<span className="text-white/50"> / {pad(n)}</span></span>
              <div className="flex-1">
                <div className="h-1 rounded-full bg-white/15 overflow-hidden"><motion.div style={{ scaleX: scrollYProgress }} className="h-full bg-brand-orange origin-left" /></div>
                <ol className="hidden lg:flex justify-between mt-2" aria-label="Chapters">
                  {chapters.map((chapter, i) => <li key={chapter.id}>
                    <button type="button" onClick={() => goTo(i)} className={`text-xs font-semibold cursor-pointer transition-colors ${i === current ? "text-white" : "text-white/45 hover:text-white"}`}>{chapter.kicker}</button>
                  </li>)}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
    <Closing />
  </div>;
}
