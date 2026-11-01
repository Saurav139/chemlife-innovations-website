"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { PRODUCTS } from "@/lib/catalog";
import { Counter } from "./graphics";
import type { Photo, RichChapter } from "./content";

export type Level = "info" | "images" | "motion" | "all" | "graphics";
export const LEVELS: { id: Level; label: string; note: string }[] = [
  { id: "info", label: "More info", note: "The same design, with more of ChemLife's story in every chapter: products, platforms, awards, process and people." },
  { id: "images", label: "More info + images", note: "The extra information plus more photography: a collage per chapter, product icons, award logos and leadership portraits." },
  { id: "motion", label: "Motion graphics + images", note: "The original information, brought to life with an animated graphic for each chapter and more photography." },
  { id: "all", label: "All out", note: "Everything at once: extra information, photo collages, motion graphics, counters, parallax, a spinning badge, drifting molecules and a product marquee." },
  { id: "graphics", label: "Motion graphics only", note: "No photos at all. Every chapter is a full animated scene that builds as you scroll, and runs backwards if you scroll back, with the extra information and every all-out effect." },
];
export const flagsFor = (level: Level) => ({
  more: level !== "motion",
  images: level !== "info" && level !== "graphics",
  graphic: level === "motion" || level === "all",
  wild: level === "all" || level === "graphics",
  // Full-size scroll-scrubbed scenes in place of photos.
  scenes: level === "graphics",
});

const easeOut = [0.25, 0.1, 0, 1] as const;

function Thumb({ photo, className, sizes, cover = true }: { photo: Photo; className?: string; sizes: string; cover?: boolean }) {
  return <div className={`relative overflow-hidden ${className ?? ""}`}>
    <Image src={photo.src} alt={photo.alt} fill sizes={sizes} className={cover ? "object-cover" : "object-contain p-1"} style={{ objectPosition: photo.position }} />
  </div>;
}

/** What the "more information" versions add to a chapter. `dense` is the sideways panels' tighter layout. */
export function MoreInfo({ chapter, images, dense = false, light = false, play = true, count = false }: {
  chapter: RichChapter; images: boolean; dense?: boolean; light?: boolean; play?: boolean; count?: boolean;
}) {
  const m = chapter.more;
  const head = `text-xs font-bold tracking-widest uppercase ${light ? "text-orange-300" : "text-brand-orange-aa"}`;
  const body = light ? "text-white/80" : "text-slate-600";
  const strong = light ? "text-white" : "text-brand-navy";
  const card = light ? "bg-white/8 border-white/15" : "bg-slate-50 border-slate-200";
  const portraits = chapter.id === "leaders";
  return <div className={dense ? "space-y-4 mt-5" : "space-y-7 mt-8"}>
    {m.lead && !dense && <p className={`${body} leading-relaxed border-l-2 border-brand-orange pl-4`}>{m.lead}</p>}

    {m.stats && <dl className={`grid gap-3 ${m.stats.length > 1 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1"}`}>
      {m.stats.map((stat) => <div key={stat.label} className={`rounded-xl border p-3 ${card}`}>
        <dd className={`font-heading text-2xl md:text-3xl font-bold ${light ? "text-orange-300" : "text-brand-orange-aa"}`}>{count ? <Counter to={stat.value} play={play} /> : stat.value}</dd>
        <dt className={`text-xs leading-snug mt-1 ${body}`}>{stat.label}</dt>
      </div>)}
    </dl>}

    {m.items && <div>
      {m.itemsTitle && <p className={`${head} mb-3`}>{m.itemsTitle}</p>}
      <ul className={`grid gap-x-5 ${dense ? "gap-y-2.5 sm:grid-cols-2" : "gap-y-4 sm:grid-cols-2"}`}>
        {m.items.map((item, i) => <motion.li key={item.title} className="flex gap-3 items-start"
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05, ease: easeOut }}>
          {images && item.icon && <Thumb photo={{ src: item.icon, alt: "" }} sizes="56px" cover={portraits}
            className={`shrink-0 ${dense ? "w-10 h-10" : "w-12 h-12"} rounded-xl bg-white border border-slate-200 ${portraits ? "rounded-full" : ""}`} />}
          <div className="min-w-0">
            <p className={`font-bold leading-snug ${strong} ${dense ? "text-sm" : ""}`}>{item.title}</p>
            {/* Sideways panels on short laptop screens keep only the item names, so the panel still fits. */}
            {item.text && <p className={`${body} leading-snug ${dense ? "text-[13px] [@media(max-height:820px)]:hidden" : "text-sm"} mt-0.5`}>{item.text}</p>}
          </div>
        </motion.li>)}
      </ul>
    </div>}

    {m.list && <ul className={`grid sm:grid-cols-2 gap-x-5 gap-y-1.5 ${dense ? "text-[13px]" : "text-sm"}`}>
      {m.list.map((line) => <li key={line} className={`flex gap-2 ${light ? "text-white/85" : "text-slate-700"}`}>
        <svg aria-hidden="true" viewBox="0 0 20 20" className="w-4 h-4 mt-0.5 shrink-0 text-brand-orange"><path d="M5 10.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" /></svg>{line}
      </li>)}
    </ul>}

    {m.chips && <div>
      {m.chipsTitle && <p className={`${head} mb-2`}>{m.chipsTitle}</p>}
      <ul className="flex flex-wrap gap-1.5">{m.chips.map((chip) => <li key={chip} className={`rounded-full px-3 py-1 text-[13px] font-semibold border ${light ? "border-white/25 text-white" : "border-slate-300 text-brand-navy bg-white"}`}>{chip}</li>)}</ul>
    </div>}
  </div>;
}

/** A chapter's main photo with its gallery beside it; the thumbnails arrive one after another. */
export function Collage({ chapter, show, sizes = "(min-width: 1024px) 560px, 100vw" }: { chapter: RichChapter; show: boolean; sizes?: string }) {
  return <div className="grid grid-cols-3 grid-rows-[1fr_1fr_1fr] gap-2 h-full">
    <Thumb photo={chapter.photo} sizes={sizes} className="col-span-3 row-span-2 rounded-2xl bg-slate-100" />
    {chapter.gallery.map((photo, i) => <motion.div key={photo.src} className="relative min-h-0" initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 24 }} transition={{ duration: 0.5, delay: show ? 0.15 + i * 0.1 : 0, ease: easeOut }}>
      <Thumb photo={photo} sizes="200px" className="h-full rounded-xl bg-slate-100" />
    </motion.div>)}
  </div>;
}

/** Product names running sideways, forever. */
export function Marquee({ light = false }: { light?: boolean }) {
  const reduce = useReducedMotion();
  const names = PRODUCTS.map((p) => p.name);
  const row = <div className="flex shrink-0 gap-8 pr-8">{names.map((name) => <span key={name} className="flex items-center gap-8 whitespace-nowrap">{name}<span aria-hidden="true" className="text-brand-orange">✦</span></span>)}</div>;
  return <div aria-hidden="true" className={`overflow-hidden py-3 font-heading font-bold text-lg md:text-2xl ${light ? "text-white/70" : "text-brand-navy/70"}`}>
    <motion.div className="flex w-max" animate={reduce ? {} : { x: ["0%", "-50%"] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>{row}{row}</motion.div>
  </div>;
}

/** A round badge with the tagline running round it, turning slowly. */
export function SpinBadge({ text, className = "" }: { text: string; className?: string }) {
  const reduce = useReducedMotion();
  const id = `badge${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return <motion.svg aria-hidden="true" viewBox="0 0 120 120" className={className} animate={reduce ? {} : { rotate: 360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }}>
    <defs><path id={id} d="M60 60 m-45 0 a45 45 0 1 1 90 0 a45 45 0 1 1 -90 0" /></defs>
    <circle cx={60} cy={60} r={58} fill="#d4462a" />
    <text fill="#fff" fontSize={9.5} fontWeight={800}><textPath href={`#${id}`} textLength={280} lengthAdjust="spacing">{text.toUpperCase()}</textPath></text>
    <circle cx={60} cy={60} r={14} fill="#fff" />
  </motion.svg>;
}

/** Molecules drifting slowly behind a section. */
export function Particles({ light = false, count = 14 }: { light?: boolean; count?: number }) {
  const reduce = useReducedMotion();
  const dots = Array.from({ length: count }, (_, i) => ({ x: (i * 37) % 100, y: (i * 61) % 100, r: 3 + (i % 4) * 2, d: 10 + (i % 5) * 3 }));
  return <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
    {dots.map((dot, i) => <motion.span key={i} className={`absolute rounded-full ${light ? "bg-white/15" : i % 3 ? "bg-brand-navy/10" : "bg-brand-orange/20"}`}
      style={{ left: `${dot.x}%`, top: `${dot.y}%`, width: dot.r * 2, height: dot.r * 2 }}
      animate={reduce ? {} : { y: [0, -40, 0], x: [0, i % 2 ? 20 : -20, 0] }} transition={{ duration: dot.d, repeat: Infinity, ease: "easeInOut" }} />)}
  </div>;
}

/** A heading whose words rise into place the first time it becomes current. */
export function KineticTitle({ text, play, className }: { text: string; play: boolean; className: string }) {
  const reduce = useReducedMotion();
  const [seen, setSeen] = useState(false);
  useEffect(() => { if (play) setSeen(true); }, [play]);
  return <h3 className={className} aria-label={text}>
    {text.split(" ").map((word, i) => <span key={`${word}-${i}`} aria-hidden="true" className="inline-block overflow-hidden align-bottom mr-[0.25em]">
      <motion.span className="inline-block" initial={false} animate={{ y: seen || reduce ? "0%" : "100%" }} transition={{ duration: 0.5, delay: i * 0.04, ease: easeOut }}>{word}</motion.span>
    </span>)}
  </h3>;
}
