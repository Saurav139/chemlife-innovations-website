"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { certificateFiles } from "@/components/AwardsRecognition";
import { cardImages } from "@/components/WhoWeAre";
import { AwardsCurrent, SnowflakeCell, type Card } from "./legacy";
import { useHref, useT } from "@/i18n/LocaleProvider";
import { Images } from "@/lib/assets";
import { PRODUCTS } from "@/lib/catalog";

// The homepage's two odd-one-out sections next to versions in the site's corporate style (as on Who We Are): "What
// we serve" as plain photo cards instead of spinning snowflakes, and the awards as a logo wall (A) or a plain
// one-at-a-time card (B) instead of the plaque and rail track. Each block switches between current and proposed.

const easeOut = [0.25, 0.1, 0, 1] as const;
const wrap = "max-w-[1200px] mx-auto px-6";

// The products page's category for each "What we serve" card, in the cards' order.
const SERVE_CATEGORIES = ["Mono-gastric", "Ruminants", "Value Addition"];

/** The site's section heading: small green label, large navy title. */
function SectionHeading({ kicker, children }: { kicker?: string; children: React.ReactNode }) {
  return <div className="text-center">
    {kicker && <span className="text-teal-aa text-sm lg:text-base font-semibold tracking-widest uppercase block mb-3">{kicker}</span>}
    <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-brand-navy">{children}</h2>
  </div>;
}

/** A row of buttons that switches a block between its versions. */
function Switch<T extends string>({ options, value, onChange }: { options: { id: T; label: string }[]; value: T; onChange: (id: T) => void }) {
  return <div role="group" className="inline-flex flex-wrap gap-1 rounded-full bg-slate-100 p-1">
    {options.map((o) => <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)}
      className={`min-h-10 px-4 rounded-full text-sm font-semibold cursor-pointer transition-colors ${value === o.id ? "bg-brand-navy text-white" : "text-brand-navy hover:bg-white"}`}>{o.label}</button>)}
  </div>;
}

/** A labelled block of the preview: what it is, the switch, and a note on the change. */
function Block({ n, title, note, controls, children }: { n: number; title: string; note: string; controls: React.ReactNode; children: React.ReactNode }) {
  return <section className="border-t-8 border-slate-100">
    <div className={`${wrap} pt-10 pb-2 flex flex-wrap items-end justify-between gap-4`}>
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{String(n).padStart(2, "0")} · Preview</p>
        <p className="font-heading text-2xl font-bold text-brand-navy mt-1">{title}</p>
        <p className="text-slate-600 mt-2">{note}</p>
      </div>
      {controls}
    </div>
    {children}
  </section>;
}

// ---------- What we serve ----------

function useCards() {
  const t = useT().home.whoWeAre;
  return t.cards.map((card, i) => ({ ...card, images: cardImages[i].map((src, j) => ({ src, alt: card.alts[j] })) })) as Card[];
}

/** One photo that cross-fades through the card's three pictures, the cards a little out of step. */
function FadingPhoto({ images, offset }: { images: Card["images"]; offset: number }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (reduce) return;
    let timer: ReturnType<typeof setInterval>;
    const start = setTimeout(() => { timer = setInterval(() => setIndex((i) => i + 1), 4500); }, offset * 1500);
    return () => { clearTimeout(start); clearInterval(timer); };
  }, [offset, reduce]);
  const image = images[index % images.length];
  return <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
    <AnimatePresence initial={false}>
      <motion.div key={image.src} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: easeOut }}>
        <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 370px, (min-width: 768px) 33vw, 100vw" className="object-cover" />
      </motion.div>
    </AnimatePresence>
  </div>;
}

function ServeProposed() {
  const href = useHref();
  const cards = useCards();
  return <div className={`${wrap} py-16 md:py-24`}>
    <SectionHeading>What We Serve</SectionHeading>
    <div className="grid md:grid-cols-3 gap-6 mt-12">
      {cards.map((card, i) => {
        const count = PRODUCTS.filter((p) => p.category === SERVE_CATEGORIES[i]).length;
        return <motion.article key={card.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay: i * 0.08, ease: easeOut }}
          className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
          <FadingPhoto images={card.images} offset={i} />
          <div className="flex flex-1 flex-col p-6">
            <h3 className="font-heading text-xl font-bold text-brand-navy">{card.title}</h3>
            <p className="text-slate-600 leading-relaxed mt-2 flex-1">{card.description}</p>
            <a href={href("/products")} className="inline-flex items-center gap-2 min-h-11 mt-4 font-semibold text-teal-aa hover:text-brand-navy">
              View {count} products
              <svg aria-hidden="true" className="w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h12M11 5l5 5-5 5" /></svg>
            </a>
          </div>
        </motion.article>;
      })}
    </div>
  </div>;
}

function ServeCurrent() {
  const t = useT().home.whoWeAre;
  const cards = useCards();
  const [imageIndex, setImageIndex] = useState(0);
  useEffect(() => { const timer = setInterval(() => setImageIndex((i) => i + 1), 4000); return () => clearInterval(timer); }, []);
  return <div className={`${wrap} py-16 md:py-24 overflow-hidden`}>
    <h3 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-brand-navy text-center">{t.serveTitle}</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 max-w-5xl mx-auto justify-items-stretch md:justify-items-center w-full mt-8">
      {cards.map((card, i) => <SnowflakeCell key={card.title} card={card} index={i} imageIndex={imageIndex} />)}
    </div>
    <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  </div>;
}

// ---------- Awards ----------

function useAwards() {
  const t = useT().home.awards;
  return certificateFiles.map((c, i) => ({ ...c, ...t.items[i], logo: Images.awards.path(c.file) }));
}

/** A: every award's logo at once, in a grid of tiles; choosing one shows its details below. */
function AwardsWall() {
  const t = useT().home.awards;
  const awards = useAwards();
  const [chosen, setChosen] = useState(0);
  const award = awards[chosen];
  return <div className={`${wrap} py-16 md:py-24`}>
    <SectionHeading kicker={t.kicker}>{t.title}</SectionHeading>
    <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
      {awards.map((a, i) => <li key={a.file}>
        <button type="button" onClick={() => setChosen(i)} aria-pressed={chosen === i}
          className={`group flex h-full w-full flex-col rounded-xl border bg-white p-4 text-left transition-all cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${chosen === i ? "border-teal-aa ring-2 ring-teal-aa/30 shadow-md" : "border-slate-200 shadow-sm"}`}>
          <span className="relative block h-20 md:h-24 w-full"><Image src={a.logo} alt="" fill sizes="(min-width: 768px) 260px, 45vw" className="object-contain" /></span>
          <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-teal-aa">{a.year || " "}</span>
          <span className="mt-1 font-heading text-sm md:text-base font-bold leading-snug text-brand-navy">{a.title}</span>
        </button>
      </li>)}
    </ul>
    <AnimatePresence mode="wait">
      <motion.div key={chosen} aria-live="polite" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: easeOut }}
        className="mt-6 rounded-xl border border-slate-200 border-l-4 border-l-teal-aa bg-slate-50 p-6 md:p-8">
        <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-teal-aa">{[award.organization, award.year].filter(Boolean).join(" • ")}</p>
        <p className="font-heading text-xl md:text-2xl font-bold text-brand-navy mt-2">{award.title}</p>
        <p className="text-slate-600 leading-relaxed mt-2 max-w-3xl">{award.description}</p>
      </motion.div>
    </AnimatePresence>
  </div>;
}

/** B: one award at a time, as now, on a plain card with numbered tabs and arrows. */
function AwardsSimple() {
  const t = useT().home.awards;
  const awards = useAwards();
  const [chosen, setChosen] = useState(0);
  const award = awards[chosen];
  const step = (d: number) => setChosen((c) => (c + d + awards.length) % awards.length);
  const arrow = "grid place-items-center w-11 h-11 rounded-full border border-slate-300 text-brand-navy hover:bg-brand-navy hover:text-white transition-colors cursor-pointer";
  return <div className={`${wrap} py-16 md:py-24`}>
    <SectionHeading kicker={t.kicker}>{t.title}</SectionHeading>
    <div className="max-w-[900px] mx-auto mt-12 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div key={chosen} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
          className="grid sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-6 md:gap-10 p-6 md:p-10">
          <div className="relative aspect-[4/3] rounded-xl border border-slate-200 bg-white"><Image src={award.logo} alt="" fill sizes="(min-width: 640px) 320px, 90vw" className="object-contain p-6" /></div>
          <div>
            <p className="text-xs md:text-sm font-semibold uppercase tracking-wider text-teal-aa">{[award.organization, award.year].filter(Boolean).join(" • ")}</p>
            <p className="font-heading text-2xl md:text-3xl font-bold text-brand-navy mt-2 leading-tight">{award.title}</p>
            <p className="text-slate-600 leading-relaxed mt-3">{award.description}</p>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="flex items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-4 md:px-6 py-4">
        <button type="button" aria-label="Previous award" onClick={() => step(-1)} className={arrow}>‹</button>
        <div className="flex flex-wrap justify-center gap-1.5">
          {awards.map((a, i) => <button key={a.file} type="button" onClick={() => setChosen(i)} aria-pressed={chosen === i} aria-label={`${String(i + 1).padStart(2, "0")}: ${a.title}`}
            className={`min-w-10 h-10 px-2 rounded-full text-sm font-bold tabular-nums cursor-pointer transition-colors ${chosen === i ? "bg-brand-navy text-white" : "text-slate-500 hover:bg-white hover:text-brand-navy"}`}>{String(i + 1).padStart(2, "0")}</button>)}
        </div>
        <button type="button" aria-label="Next award" onClick={() => step(1)} className={arrow}>›</button>
      </div>
    </div>
  </div>;
}

// ---------- Headings ----------

const HEADINGS = [
  ["How We Do It?", "How We Work"],
  ["What Our Partners Say?", "What Our Partners Say"],
  ["What we serve", "What We Serve"],
];

export default function StyleFixes() {
  const [serve, setServe] = useState<"proposed" | "current">("proposed");
  const [awards, setAwards] = useState<"wall" | "simple" | "current">("wall");
  return <main id="main" tabIndex={-1} className="bg-white text-brand-navy pt-24 md:pt-28">
    <div className={`${wrap} py-10`}>
      <p className="text-teal-aa text-sm font-semibold tracking-widest uppercase">Design preview</p>
      <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-brand-navy mt-2">Homepage: one consistent style</h1>
      <p className="text-lg text-slate-600 leading-relaxed mt-4 max-w-3xl">The two homepage sections that don&apos;t match the rest of the site, redrawn in its corporate style (as on Who We Are): white cards, rectangular photos, gentle fades and nothing spinning. Switch each block between the proposal and what is on the homepage now.</p>
    </div>

    <Block n={1} title="What We Serve" note="Three equal photo cards instead of circles in spinning snowflakes. Each photo still changes, with a soft fade, and each card links to the products, with how many there are."
      controls={<Switch options={[{ id: "proposed", label: "Proposed" }, { id: "current", label: "Current" }]} value={serve} onChange={setServe} />}>
      {serve === "proposed" ? <ServeProposed /> : <ServeCurrent />}
    </Block>

    <Block n={2} title="Awards & Recognition" note="A shows all eight awards at once as a logo wall; choose one to read about it. B keeps one at a time, on a plain card with numbered tabs, without the orange plaque and the rail track."
      controls={<Switch options={[{ id: "wall", label: "A · Logo wall" }, { id: "simple", label: "B · One at a time" }, { id: "current", label: "Current" }]} value={awards} onChange={setAwards} />}>
      {awards === "wall" ? <AwardsWall /> : awards === "simple" ? <AwardsSimple /> : <AwardsCurrent />}
    </Block>

    <Block n={3} title="Headings" note="One style for every heading: title case and no question marks. The Hindi and Kannada headings would change to match." controls={null}>
      <div className={`${wrap} py-10 md:py-14`}>
        <ul className="divide-y divide-slate-200 border-y border-slate-200 max-w-3xl">
          {HEADINGS.map(([before, after]) => <li key={before} className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 py-4">
            <span className="font-heading text-lg md:text-xl font-bold text-slate-400 line-through decoration-1">{before}</span>
            <span aria-hidden="true" className="text-teal-aa">→</span>
            <span className="font-heading text-lg md:text-xl font-bold text-brand-navy">{after}</span>
          </li>)}
        </ul>
      </div>
    </Block>
  </main>;
}
