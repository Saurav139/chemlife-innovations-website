"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, motionValue, useInView, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { Closing } from "../shared";
import { useRichChapters, type RichChapter } from "./content";
import { ChapterGraphic } from "./graphics";
import { SceneStage } from "./scenes";
import { Collage, KineticTitle, Marquee, MoreInfo, Particles, SpinBadge, flagsFor, type Level } from "./blocks";

type Flags = ReturnType<typeof flagsFor>;
const pad = (n: number) => String(n).padStart(2, "0");

function Step({ chapter, index, flags, current, onActive, progress }: { chapter: RichChapter; index: number; flags: Flags; current: boolean; onActive: (i: number) => void; progress: MotionValue<number> }) {
  const ref = useRef<HTMLLIElement>(null);
  // Only the chapter crossing the middle of the screen counts as current.
  const inMiddle = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => { if (inMiddle) onActive(index); }, [inMiddle, index, onActive]);
  // How far through this chapter the reader is, for its scene: done a little before the next chapter takes over.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.95"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => progress.set(v));
  const titleClass = "font-heading text-2xl md:text-4xl font-bold text-brand-navy leading-tight mt-3";
  return <li ref={ref} id={`pinned-${chapter.id}`} className="relative min-h-[75svh] lg:min-h-[90svh] flex flex-col justify-center py-12 scroll-mt-28">
    {flags.wild && <span aria-hidden="true" className="absolute -left-1 lg:-left-8 top-4 font-heading font-bold text-[7rem] lg:text-[10rem] leading-none text-transparent [-webkit-text-stroke:2px_rgba(47,79,127,0.12)] select-none pointer-events-none">{pad(index + 1)}</span>}
    <motion.div className="relative" animate={{ opacity: current ? 1 : 0.35 }} transition={{ duration: 0.4 }}>
      <p className="text-sm font-semibold tracking-widest uppercase text-teal-aa">{pad(index + 1)} · {chapter.kicker}</p>
      {flags.wild ? <KineticTitle text={chapter.title} play={current} className={titleClass} /> : <h3 className={titleClass}>{chapter.title}</h3>}
      {chapter.text && <p className="text-slate-700 text-base md:text-lg leading-relaxed mt-4">{chapter.text}</p>}
      {chapter.facts && <dl className="mt-6 grid sm:grid-cols-2 gap-5">
        {chapter.facts.map((fact) => <div key={fact.label} className="border-l-2 border-brand-orange pl-4">
          <dt className="text-xs font-bold tracking-widest uppercase text-slate-500">{fact.label}</dt>
          <dd className="text-brand-navy font-semibold mt-1">{fact.value}</dd>
        </div>)}
      </dl>}
      {flags.more && <MoreInfo chapter={chapter} images={flags.images} play={current} count={flags.wild} />}
    </motion.div>
  </li>;
}

function PhotoLayer({ chapter, parallax }: { chapter: RichChapter; parallax?: MotionValue<string> }) {
  return <motion.div className={`absolute ${parallax ? "-inset-[6%]" : "inset-0"}`} style={parallax ? { y: parallax } : undefined}>
    <Image src={chapter.photo.src} alt={chapter.photo.alt} fill sizes="(min-width: 1024px) 600px, 100vw" className="object-cover" style={{ objectPosition: chapter.photo.position }} />
  </motion.div>;
}

/** The pinned picture: one photo, a collage, or a photo with the chapter's motion graphic over it. */
function Visual({ chapter, index, show, flags, parallax, progress }: { chapter: RichChapter; index: number; show: boolean; flags: Flags; parallax?: MotionValue<string>; progress: MotionValue<number> }) {
  if (flags.scenes) return <SceneStage chapter={chapter} index={index} p={progress} active={show} />;
  if (flags.images && !flags.graphic) return <Collage chapter={chapter} show={show} />;
  return <div className="absolute inset-0 rounded-2xl overflow-hidden bg-slate-100">
    <PhotoLayer chapter={chapter} parallax={parallax} />
    {flags.graphic && <>
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-navy/50 via-transparent to-transparent" />
      <div className="absolute right-3 top-3 bottom-3 w-[22%] hidden md:flex flex-col gap-2">
        {chapter.gallery.map((photo, i) => <motion.div key={photo.src} className="relative flex-1 rounded-xl overflow-hidden border-2 border-white/80 shadow-lg" initial={false}
          animate={{ opacity: show ? 1 : 0, x: show ? 0 : 30 }} transition={{ duration: 0.5, delay: show ? 0.2 + i * 0.12 : 0 }}>
          <Image src={photo.src} alt={photo.alt} fill sizes="140px" className="object-cover" style={{ objectPosition: photo.position }} />
        </motion.div>)}
      </div>
      <motion.div className="absolute left-3 bottom-3 lg:left-5 lg:bottom-5 w-[64%] md:w-[60%] aspect-[4/3] rounded-2xl bg-white/95 backdrop-blur shadow-2xl p-2 lg:p-3" initial={false}
        animate={{ opacity: show ? 1 : 0, y: show ? 0 : 30 }} transition={{ duration: 0.5, delay: show ? 0.1 : 0 }}>
        <ChapterGraphic id={chapter.id} play={show} />
      </motion.div>
    </>}
  </div>;
}

/** Pinned chapters with more to see: the picture stays while seven chapters scroll past it. */
export default function RichPinned({ level }: { level: Level }) {
  const chapters = useRichChapters();
  const flags = flagsFor(level);
  const [active, setActive] = useState(0);
  const onActive = useCallback((i: number) => setActive(i), []);
  const [progresses] = useState(() => chapters.map(() => motionValue(0)));
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  const parallax = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const chapter = chapters[active];

  return <section aria-label={`Who we are, pinned chapters, ${level}`} className="bg-white">
    <div ref={ref} className="relative">
      {flags.wild && <Particles />}
      <div className="relative max-w-[1240px] mx-auto px-6 pt-10 md:pt-16 lg:grid lg:grid-cols-12 lg:gap-14">
        {/* Phones: the picture pins across the top and the text scrolls up under it. */}
        <div className={`sticky top-20 md:top-24 lg:top-32 z-10 ${flags.scenes ? "h-[46svh]" : "h-[38svh]"} md:h-[46svh] lg:h-[calc(100svh-8rem)] lg:col-span-6 lg:order-2 flex flex-col justify-center py-3 bg-white lg:bg-transparent`}>
          {flags.wild && <motion.div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 rounded-full bg-brand-orange origin-left z-20" style={{ scaleX: progress }} />}
          <div className="relative w-full flex-1 lg:flex-none lg:h-[76%]">
            {flags.wild && <motion.div aria-hidden="true" className="absolute -inset-5 rounded-[2.5rem] blur-2xl opacity-30" animate={{ backgroundColor: chapter.accent }} transition={{ duration: 0.8 }} />}
            <div className="relative w-full h-full">
              {chapters.map((c, i) => <motion.div key={c.id} className="absolute inset-0" initial={false} style={{ pointerEvents: active === i ? "auto" : "none" }}
                animate={{ opacity: active === i ? 1 : 0, scale: active === i ? 1 : 1.04, filter: flags.scenes && active !== i ? "blur(10px)" : "blur(0px)" }} transition={{ duration: 0.6 }} aria-hidden={active !== i}>
                <Visual chapter={c} index={i} show={active === i} flags={flags} parallax={flags.wild && !flags.scenes ? parallax : undefined} progress={progresses[i]} />
              </motion.div>)}
              {!flags.scenes && <span className="absolute left-3 top-3 z-10 rounded-full bg-white/95 shadow px-3 py-1 text-sm font-bold text-brand-navy">
                {pad(active + 1)} <span className="text-slate-400">/ {pad(chapters.length)}</span> · {chapter.kicker}
              </span>}
            </div>
            {flags.wild && <SpinBadge text="Nature-driven science · Proof in every kilo · " className="absolute -top-8 -right-6 w-24 lg:w-32 z-20 hidden md:block" />}
          </div>
          <ol className="hidden lg:flex flex-wrap gap-x-4 gap-y-1 mt-5" aria-label="Chapters">
            {chapters.map((c, i) => <li key={c.id}>
              <button type="button" onClick={() => document.getElementById(`pinned-${c.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                className={`flex items-center gap-2 text-sm font-semibold transition-colors cursor-pointer ${i === active ? "text-brand-navy" : "text-slate-400 hover:text-brand-navy"}`}>
                <span className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-6 bg-brand-orange" : "w-2 bg-slate-300"}`} />{c.kicker}
              </button>
            </li>)}
          </ol>
        </div>
        <ol className="relative lg:col-span-6 lg:order-1 lg:py-[6svh]">
          {chapters.map((c, i) => <Step key={c.id} chapter={c} index={i} flags={flags} current={active === i} onActive={onActive} progress={progresses[i]} />)}
        </ol>
      </div>
    </div>
    {flags.wild && <div className="border-y border-slate-200 bg-slate-50"><Marquee /></div>}
    <Closing />
  </section>;
}
