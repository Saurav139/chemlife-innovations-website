"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { PRODUCTS } from "@/lib/catalog";
import { useHref, useT } from "@/i18n/LocaleProvider";
import Icon from "@/components/site/Icon";
import { Accented, Button, Eyebrow, Glow, Reveal, easeOut } from "@/components/site/ui";

const FLAME = "var(--color-flame)";
const MINT = "var(--color-mint)";
const GOLD = "#f5bf4f";

function BentoCard({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return <motion.div initial={reduce ? false : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35 + delay, ease: easeOut }}
    className={`relative overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-card-hi/90 to-page-alt p-5 text-left flex flex-col ${className}`}>
    <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ink/25 to-transparent" />
    {children}
  </motion.div>;
}

/** Mould spores drifting at a shield over a heap of grain. */
function ShieldArt() {
  const reduce = useReducedMotion();
  const spores = [[24, 30], [92, 10], [170, 26], [190, 76], [10, 86]];
  return <svg viewBox="0 0 200 120" className="w-full h-full" aria-hidden="true">
    {[[60, 108], [76, 108], [92, 108], [108, 108], [124, 108], [140, 108], [68, 98], [84, 98], [100, 98], [116, 98], [132, 98], [76, 88], [92, 88], [108, 88], [124, 88], [92, 78], [108, 78]].map(([x, y]) =>
      <ellipse key={`${x}-${y}`} cx={x} cy={y} rx={7} ry={5} fill={GOLD} opacity={0.9} />)}
    <path d="M40 112 A60 60 0 0 1 160 112" className="fill-mint/10 stroke-mint" strokeWidth={2.5} />
    {!reduce && <motion.path d="M40 112 A60 60 0 0 1 160 112" fill="none" className="stroke-mint" strokeWidth={9} animate={{ strokeOpacity: [0.05, 0.25, 0.05] }} transition={{ duration: 2.4, repeat: Infinity }} />}
    {spores.map(([x, y], i) => {
      const dx = (100 - x) * 0.35, dy = (112 - y) * 0.35;
      return <motion.g key={i} animate={reduce ? {} : { x: [0, dx, 0], y: [0, dy, 0] }} transition={{ duration: 2.8, delay: i * 0.45, repeat: Infinity, ease: "easeInOut" }}>
        <circle cx={x} cy={y} r={5} fill="#4f9d3a" /><circle cx={x - 4} cy={y - 5} r={2.2} fill="#4f9d3a" />
      </motion.g>;
    })}
  </svg>;
}

/** Product icons bobbing in a loose cluster. */
function RangeArt() {
  const reduce = useReducedMotion();
  const spots = [
    { x: 50, y: 48, s: 30 }, { x: 24, y: 30, s: 18 }, { x: 76, y: 26, s: 20 }, { x: 80, y: 66, s: 17 },
    { x: 20, y: 70, s: 16 }, { x: 52, y: 12, s: 14 }, { x: 36, y: 86, s: 13 }, { x: 64, y: 88, s: 12 }, { x: 92, y: 44, s: 11 },
  ];
  const picks = ["MaxDmold", "MinBioZen", "MethioWiz", "FeedGenie Prime", "CholiWiz", "GroGenie (12% & 60%)", "EggGenie", "AflaMlock", "RumiWiz"];
  return <div className="relative w-full h-full" aria-hidden="true">
    {spots.map((spot, i) => {
      const product = PRODUCTS.find((p) => p.name === picks[i]) ?? PRODUCTS[i];
      return <motion.div key={product.id} className="absolute rounded-full bg-white shadow-lg shadow-ink/10 ring-4 ring-ink/5 overflow-hidden"
        style={{ left: `${spot.x}%`, top: `${spot.y}%`, width: `${spot.s}%`, aspectRatio: "1", translate: "-50% -50%" }}
        animate={reduce ? {} : { y: [0, i % 2 ? -6 : 6, 0] }} transition={{ duration: 3 + (i % 3), repeat: Infinity, ease: "easeInOut" }}>
        <Image src={product.icon} alt="" fill sizes="80px" className="object-contain p-[8%]" />
      </motion.div>;
    })}
  </div>;
}

/** A hexagonal molecule turning, with atoms orbiting it. */
function MoleculeArt() {
  const reduce = useReducedMotion();
  const hex = Array.from({ length: 6 }, (_, k) => [60 + 26 * Math.cos(((60 * k - 30) * Math.PI) / 180), 60 + 26 * Math.sin(((60 * k - 30) * Math.PI) / 180)]);
  return <svg viewBox="0 0 120 120" className="w-full h-full" aria-hidden="true">
    <circle cx={60} cy={60} r={48} fill="none" className="stroke-line" strokeDasharray="3 6" />
    <motion.g animate={reduce ? {} : { rotate: 360 }} transition={{ duration: 16, repeat: Infinity, ease: "linear" }}>
      <circle cx={60} cy={60} r={56} fill="none" />
      <polygon points={hex.map((p) => p.join(",")).join(" ")} className="fill-mint/10 stroke-mint" strokeWidth={2.5} />
      <circle cx={60} cy={60} r={9} fill="none" className="stroke-mint" strokeWidth={2} />
      {hex.filter((_, k) => k % 2 === 0).map(([x, y]) => <circle key={x} cx={x} cy={y} r={5} className="fill-flame" />)}
    </motion.g>
    <motion.g animate={reduce ? {} : { rotate: -360 }} transition={{ duration: 9, repeat: Infinity, ease: "linear" }}>
      <circle cx={60} cy={60} r={56} fill="none" />
      <circle cx={60} cy={12} r={4} fill={GOLD} />
    </motion.g>
  </svg>;
}

/** The directors' years as bars filling up. */
function YearsArt() {
  const bars = [{ v: 38, c: FLAME }, { v: 30, c: GOLD }, { v: 23, c: MINT }, { v: 15, c: "#3b6fb6" }];
  return <div className="space-y-2" aria-hidden="true">
    {bars.map((bar, i) => <div key={bar.v} className="h-2 rounded-full bg-ink/8 overflow-hidden">
      <motion.div className="h-full rounded-full" style={{ backgroundColor: bar.c }} initial={{ width: 0 }} animate={{ width: `${(bar.v / 40) * 100}%` }} transition={{ duration: 1.2, delay: 0.8 + i * 0.12, ease: easeOut }} />
    </div>)}
  </div>;
}

export default function HomeHero() {
  const t = useT();
  const s = t.site.hero;
  const href = useHref();
  return <section className="relative overflow-hidden bg-page pt-32 md:pt-40 lg:pt-44 pb-16 md:pb-24">
    <Glow />
    <div aria-hidden="true" className="absolute inset-0 opacity-40 [background-image:radial-gradient(rgb(48_82_128/0.14)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
    <div className="relative container-site text-center">
      <Reveal><Eyebrow icon="shield">{s.badge}</Eyebrow></Reveal>
      <Reveal delay={0.05}>
        <h1 className="font-heading text-[2.6rem] leading-[1.05] sm:text-6xl md:text-7xl lg:text-[5.2rem] font-bold tracking-tight text-ink mt-7 max-w-5xl mx-auto">
          <Accented text={s.title} />
        </h1>
      </Reveal>
      <Reveal delay={0.1}><p className="text-copy text-lg md:text-xl mt-7 max-w-3xl mx-auto leading-relaxed">{s.lead}</p></Reveal>
      <Reveal delay={0.15}>
        <div className="flex flex-wrap justify-center gap-3 mt-9">
          <Button href={href("/products")} arrow>{t.home.findProduct}</Button>
          <Button href={href("/contact?type=nutritionist")} variant="outline">{t.home.talkToNutritionist}</Button>
        </div>
      </Reveal>

      <div className="grid grid-cols-2 lg:grid-cols-[1fr_1.45fr_1fr_1fr] gap-3 md:gap-4 mt-14 md:mt-20">
        <BentoCard className="min-h-[15rem]">
          <div className="flex-1 -mx-1"><ShieldArt /></div>
          <p className="font-heading font-bold text-ink mt-3 leading-snug">{s.hygieneTitle}</p>
          <p className="text-sm text-copy mt-1 leading-snug">{s.hygieneText}</p>
        </BentoCard>
        <BentoCard className="col-span-2 lg:col-span-1 order-first lg:order-none min-h-[17rem]" delay={0.08}>
          <div className="relative flex-1 min-h-40"><RangeArt /></div>
          <a href={href("/products")} className="group flex items-end justify-between gap-4 mt-3">
            <span>
              <span className="block font-heading text-lg font-bold text-ink leading-snug">{s.rangeTitle}</span>
              <span className="block text-sm text-copy mt-1">{s.rangeText.replace("{products}", String(PRODUCTS.length))}</span>
            </span>
            <span className="grid place-items-center w-9 h-9 rounded-full border border-line text-flame group-hover:bg-brand-orange-aa group-hover:text-white transition-colors shrink-0"><Icon name="arrowUpRight" className="w-4 h-4" strokeWidth={2.2} /></span>
          </a>
        </BentoCard>
        <BentoCard className="min-h-[15rem]" delay={0.16}>
          <div className="flex-1 grid place-items-center"><div className="w-28 h-28"><MoleculeArt /></div></div>
          <p className="font-heading font-bold text-ink mt-3 leading-snug">{s.techTitle}</p>
          <p className="text-sm text-copy mt-1 leading-snug">{s.techText}</p>
        </BentoCard>
        <BentoCard className="col-span-2 lg:col-span-1 min-h-[15rem]" delay={0.24}>
          <p className="font-heading text-5xl font-bold text-ink tracking-tight">106</p>
          <p className="font-heading font-bold text-flame">{s.leadersTitle}</p>
          <div className="mt-auto pt-5"><YearsArt /></div>
          <p className="text-sm text-copy mt-4 leading-snug">{s.leadersText}</p>
        </BentoCard>
      </div>
    </div>
  </section>;
}
