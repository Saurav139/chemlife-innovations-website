"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { PRODUCTS } from "@/lib/catalog";
import { useHref, useT } from "@/i18n/LocaleProvider";
import Icon, { iconPath, type IconName } from "@/components/site/Icon";
import { Button, Reveal, Section, SectionTitle, easeOut } from "@/components/site/ui";

// The research platforms' short names, as on the Research page's cards.
const PLATFORMS: { name: string; icon: IconName }[] = [
  { name: "ANBioT", icon: "leaf" },
  { name: "Green chelation", icon: "mineral" },
  { name: "Microencapsulation", icon: "capsule" },
  { name: "Nano trace minerals", icon: "spark" },
  { name: "Nature-identical bioactives", icon: "molecule" },
];
const ANIMALS: { key: "poultry" | "dairy" | "swine"; label: string; icon: IconName }[] = [
  { key: "poultry", label: "Poultry", icon: "chick" },
  { key: "dairy", label: "Dairy cattle", icon: "cow" },
  { key: "swine", label: "Swine", icon: "pig" },
];

const W = 1080, H = 440, CX = 540, CY = 220;
const leftY = (i: number) => 50 + i * 85;
const rightY = (i: number) => 110 + i * 110;

function HubDiagram() {
  const reduce = useReducedMotion();
  const ref = useRef<SVGSVGElement>(null);
  const seen = useInView(ref, { once: true, margin: "-120px" });
  const show = seen || !!reduce;
  const inPaths = PLATFORMS.map((_, i) => `M282 ${leftY(i)} C 400 ${leftY(i)}, 420 ${CY}, ${CX - 70} ${CY}`);
  const outPaths = ANIMALS.map((_, i) => `M${CX + 70} ${CY} C 660 ${CY}, 680 ${rightY(i)}, 798 ${rightY(i)}`);
  return <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Five research platforms feed into ChemLife's product range, which serves poultry, dairy cattle and swine.">
    <defs>
      <radialGradient id="hub-core"><stop offset="0" style={{ stopColor: "var(--color-flame)" }} stopOpacity={0.25} /><stop offset="1" style={{ stopColor: "var(--color-flame)" }} stopOpacity={0} /></radialGradient>
    </defs>
    {[...inPaths, ...outPaths].map((d, i) => <g key={d}>
      <motion.path d={d} fill="none" className={i < 5 ? "stroke-mint/40" : "stroke-flame/45"} strokeWidth={2}
        initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: show ? 1 : 0 }} transition={{ duration: 1, delay: reduce ? 0 : (i < 5 ? 0.1 * i : 0.9 + 0.1 * (i - 5)), ease: easeOut }} />
      {show && !reduce && <circle r={4} className={i < 5 ? "fill-mint" : "fill-flame"}><animateMotion dur="2.4s" begin={`${1.4 + i * 0.25}s`} repeatCount="indefinite" path={d} /></circle>}
    </g>)}
    <circle cx={CX} cy={CY} r={150} fill="url(#hub-core)" />
    {[100, 125].map((r, i) => <motion.circle key={r} cx={CX} cy={CY} r={r} fill="none" className="stroke-line" strokeDasharray="4 10"
      animate={reduce ? {} : { rotate: i ? -360 : 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} />)}
    <circle cx={CX} cy={CY} r={70} className="fill-card stroke-flame" strokeWidth={2.5} />
    <text x={CX} y={CY - 4} textAnchor="middle" fontSize={22} fontWeight={800} className="fill-ink">ChemLife</text>
    <text x={CX} y={CY + 20} textAnchor="middle" fontSize={13} className="fill-copy">{PRODUCTS.length} products</text>
    {PLATFORMS.map((platform, i) => <motion.g key={platform.name} initial={{ opacity: 0, x: -16 }} animate={show ? { opacity: 1, x: 0 } : {}} transition={{ delay: reduce ? 0 : 0.1 * i, duration: 0.5 }}>
      <rect x={20} y={leftY(i) - 26} width={262} height={52} rx={26} className="fill-card stroke-line" />
      <circle cx={46} cy={leftY(i)} r={16} className="fill-mint/12" />
      <path d={iconPath(platform.icon)} transform={`translate(${46 - 9} ${leftY(i) - 9}) scale(0.75)`} fill="none" className="stroke-mint" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <text x={72} y={leftY(i) + 5} fontSize={16} fontWeight={700} className="fill-ink">{platform.name}</text>
    </motion.g>)}
    {ANIMALS.map((animal, i) => <motion.g key={animal.key} initial={{ opacity: 0, x: 16 }} animate={show ? { opacity: 1, x: 0 } : {}} transition={{ delay: reduce ? 0 : 1 + 0.12 * i, duration: 0.5 }}>
      <rect x={798} y={rightY(i) - 30} width={262} height={60} rx={30} className="fill-card-hi stroke-flame/45" />
      <circle cx={830} cy={rightY(i)} r={18} className="fill-flame/12" />
      <path d={iconPath(animal.icon)} transform={`translate(${830 - 10.5} ${rightY(i) - 10.5}) scale(0.875)`} fill="none" className="stroke-flame" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <text x={860} y={rightY(i) + 6} fontSize={18} fontWeight={800} className="fill-ink">{animal.label}</text>
    </motion.g>)}
  </svg>;
}

export default function Hub() {
  const t = useT();
  const h = t.site.hub;
  const href = useHref();
  return <Section tone="glow" labelledBy="hub-title">
    <SectionTitle id="hub-title" title={h.title} lead={h.lead} />
    <Reveal className="rounded-3xl border border-line bg-page-alt/70 p-4 md:p-8">
      <div className="hidden md:flex justify-between text-xs font-bold tracking-widest uppercase text-copy-dim px-2 mb-2">
        <span>{h.inLabel}</span><span>{h.outLabel}</span>
      </div>
      <div className="hidden md:block"><HubDiagram /></div>
      {/* Phones: the same flow, top to bottom. */}
      <div className="md:hidden space-y-3">
        <p className="text-xs font-bold tracking-widest uppercase text-copy-dim">{h.inLabel}</p>
        <ul className="flex flex-wrap gap-2">{PLATFORMS.map((p) => <li key={p.name} className="flex items-center gap-2 rounded-full border border-line bg-card px-3 py-2 text-sm font-semibold text-ink"><Icon name={p.icon} className="w-4 h-4 text-mint" />{p.name}</li>)}</ul>
        <div aria-hidden="true" className="mx-auto w-px h-8 bg-gradient-to-b from-mint/60 to-flame/60" />
        <p className="mx-auto w-fit rounded-full border-2 border-flame bg-card px-6 py-3 text-center font-heading font-bold text-ink">ChemLife · {PRODUCTS.length} products</p>
        <div aria-hidden="true" className="mx-auto w-px h-8 bg-flame/60" />
        <p className="text-xs font-bold tracking-widest uppercase text-copy-dim">{h.outLabel}</p>
        <ul className="grid grid-cols-3 gap-2">{ANIMALS.map((a) => <li key={a.key} className="flex flex-col items-center gap-1 rounded-2xl border border-flame/40 bg-card-hi px-2 py-3 text-sm font-bold text-ink"><Icon name={a.icon} className="w-6 h-6 text-flame" />{a.label}</li>)}</ul>
      </div>
    </Reveal>
    <div className="text-center mt-10"><Button href={href("/research")} variant="outline" arrow>{h.cta}</Button></div>
  </Section>;
}
