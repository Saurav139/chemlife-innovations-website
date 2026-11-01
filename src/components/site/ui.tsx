"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Icon, { type IconName } from "./Icon";

// Building blocks for the redesign: dark sections, two-tone headlines, pill buttons and cards.

export const easeOut = [0.25, 0.1, 0, 1] as const;

/** Text with its *starred* words in the accent colour: "*Nature-driven* science." */
export function Accented({ text, accent = "text-flame" }: { text: string; accent?: string }) {
  return <>{text.split(/(\*[^*]+\*)/g).filter(Boolean).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") ? <span key={i} className={accent}>{part.slice(1, -1)}</span> : <span key={i}>{part}</span>)}</>;
}

/** The same text without its accent marks, for alt text, titles and metadata. */
export const plain = (text: string) => text.replace(/\*/g, "");

/** A two-part title (white, then accent), from the pages' existing titleStart / titleAccent copy. */
export const twoTone = (first: string, second: string) => `${first} *${second}*`;

type Tone = "base" | "raised" | "glow";
const TONES: Record<Tone, string> = { base: "bg-page", raised: "bg-page-alt", glow: "bg-page" };

export function Section({ id, tone = "base", className = "", children, labelledBy, tight = false }: {
  id?: string; tone?: Tone; className?: string; children: React.ReactNode; labelledBy?: string; tight?: boolean;
}) {
  return <section id={id} aria-labelledby={labelledBy} className={`relative overflow-hidden scroll-mt-18 md:scroll-mt-20 lg:scroll-mt-24 ${TONES[tone]} ${tight ? "py-14 md:py-20" : "py-20 md:py-28"} ${className}`}>
    {tone === "glow" && <Glow />}
    <div className="relative container-site">{children}</div>
  </section>;
}

/** Soft orange and teal light behind a section. */
export function Glow({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
    <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-brand-orange/10 blur-[120px]" />
    <div className="absolute bottom-0 -left-40 w-[500px] h-[400px] rounded-full bg-mint/8 blur-[120px]" />
  </div>;
}

export function Eyebrow({ children, icon }: { children: React.ReactNode; icon?: IconName }) {
  return <p className="inline-flex items-center gap-2 rounded-full border border-line bg-ink/5 px-3.5 py-1.5 text-[13px] font-semibold text-copy">
    {icon && <Icon name={icon} className="w-4 h-4 text-mint" />}{children}
  </p>;
}

export function SectionTitle({ id, title, lead, align = "center", className = "" }: { id?: string; title: string; lead?: string; align?: "center" | "left"; className?: string }) {
  return <div className={`${align === "center" ? "text-center max-w-3xl mx-auto" : "max-w-2xl"} mb-12 md:mb-16 ${className}`}>
    <h2 id={id} className="font-heading text-[2rem] leading-[1.12] sm:text-4xl md:text-5xl font-bold tracking-tight text-ink"><Accented text={title} /></h2>
    {lead && <p className="text-copy text-lg mt-4 md:mt-5 leading-relaxed">{lead}</p>}
  </div>;
}

export type ButtonVariant = "primary" | "outline" | "ghost" | "light";
const BUTTONS: Record<ButtonVariant, string> = {
  primary: "bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white shadow-[0_8px_30px_-8px_rgb(207_65_40/0.6)]",
  outline: "border border-flame/60 text-flame hover:bg-flame/10 hover:border-flame",
  ghost: "text-ink hover:text-flame px-2",
  light: "bg-white text-ink hover:bg-copy",
};

export function Button({ href, variant = "primary", children, arrow = false, className = "", external = false, onClick }: {
  href: string; variant?: ButtonVariant; children: React.ReactNode; arrow?: boolean; className?: string; external?: boolean; onClick?: () => void;
}) {
  return <a href={href} onClick={onClick} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    className={`group inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-full font-semibold transition-colors ${BUTTONS[variant]} ${className}`}>
    {children}{arrow && <Icon name="arrow" className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.2} />}
  </a>;
}

export function Card({ className = "", children, hover = false }: { className?: string; children: React.ReactNode; hover?: boolean }) {
  return <div className={`rounded-2xl border border-line bg-card/70 ${hover ? "transition-colors hover:border-flame/40 hover:bg-card-hi/70" : ""} ${className}`}>{children}</div>;
}

export function IconBadge({ name, tone = "flame", className = "" }: { name: IconName; tone?: "flame" | "mint"; className?: string }) {
  return <span className={`inline-grid place-items-center w-11 h-11 rounded-xl shrink-0 ${tone === "flame" ? "bg-flame/12 text-flame" : "bg-mint/12 text-mint"} ${className}`}>
    <Icon name={name} className="w-5.5 h-5.5" />
  </span>;
}

/** Fades and lifts its children in the first time they scroll into view. */
export function Reveal({ children, delay = 0, className = "", as = "div" }: { children: React.ReactNode; delay?: number; className?: string; as?: "div" | "li" }) {
  const reduce = useReducedMotion();
  const Tag = as === "li" ? motion.li : motion.div;
  return <Tag className={className} initial={reduce ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.6, delay, ease: easeOut }}>{children}</Tag>;
}

/** Big numbers in a row, split by fine lines: two to a row on phones, `wide` to a row on desktop. */
export function StatRow({ stats, wide = 4, className = "" }: { stats: { value: string; label: string }[]; wide?: 2 | 3 | 4; className?: string }) {
  const cols = { 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" }[wide];
  return <dl className={`grid grid-cols-2 ${cols} gap-y-10 ${className}`}>
    {stats.map((stat, i) => <div key={stat.label} className={`${i % 2 ? "pl-5 sm:pl-6 border-l border-line" : "pr-5 sm:pr-6"} ${wide === 2 ? "" : i % wide ? "lg:pl-6 lg:border-l lg:border-line" : "lg:pl-0 lg:border-l-0"}`}>
      <dd className="font-heading text-4xl md:text-5xl font-bold text-ink tracking-tight">{stat.value}</dd>
      <dt className="text-copy mt-2 text-sm md:text-base leading-snug">{stat.label}</dt>
    </div>)}
  </dl>;
}

/** Questions that open and close; one open at a time. */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState(0);
  const id = useId();
  return <ul className="divide-y divide-line border-y border-line">
    {items.map((item, i) => <li key={item.q}>
      <h3>
        <button type="button" id={`${id}-q${i}`} aria-expanded={open === i} aria-controls={`${id}-a${i}`} onClick={() => setOpen(open === i ? -1 : i)}
          className="w-full flex items-start justify-between gap-6 py-5 md:py-6 text-left font-heading text-lg md:text-xl font-bold text-ink cursor-pointer hover:text-flame transition-colors">
          {item.q}
          <span aria-hidden="true" className={`shrink-0 grid place-items-center w-8 h-8 rounded-full border border-line text-flame transition-transform duration-300 ${open === i ? "rotate-45" : ""}`}><Icon name="plus" className="w-4 h-4" strokeWidth={2.2} /></span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open === i && <motion.div id={`${id}-a${i}`} role="region" aria-labelledby={`${id}-q${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: easeOut }} className="overflow-hidden">
          <p className="text-copy leading-relaxed pb-6 max-w-[70ch]">{item.a}</p>
        </motion.div>}
      </AnimatePresence>
    </li>)}
  </ul>;
}

/** The closing band: a headline, a line, and two buttons, on a glowing panel. */
export function CtaBand({ title, lead, primary, secondary }: { title: string; lead: string; primary: { label: string; href: string }; secondary?: { label: string; href: string } }) {
  return <section className="bg-page py-20 md:py-28">
    <div className="container-site">
      <div className="theme-dark relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-card-hi via-card to-page-alt px-6 py-14 md:px-16 md:py-20 text-center">
        <div aria-hidden="true" className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[320px] rounded-full bg-brand-orange/20 blur-[100px]" />
        <div aria-hidden="true" className="absolute -bottom-24 right-0 w-[400px] h-[260px] rounded-full bg-mint/10 blur-[100px]" />
        <div className="relative">
          <h2 className="font-heading text-[2rem] leading-[1.12] sm:text-4xl md:text-5xl font-bold tracking-tight text-ink"><Accented text={title} /></h2>
          <p className="text-copy text-lg mt-5 max-w-2xl mx-auto leading-relaxed">{lead}</p>
          <div className="flex flex-wrap justify-center gap-3 mt-9">
            <Button href={primary.href} arrow>{primary.label}</Button>
            {secondary && <Button href={secondary.href} variant="outline">{secondary.label}</Button>}
          </div>
        </div>
      </div>
    </div>
  </section>;
}

/** The top of an inner page: a centred two-tone headline over a soft glow. */
export function PageHero({ eyebrow, title, lead, children, actions }: { eyebrow?: string; title: string; lead?: string; children?: React.ReactNode; actions?: React.ReactNode }) {
  return <section className="relative overflow-hidden bg-page pt-32 md:pt-40 lg:pt-44 pb-16 md:pb-24">
    <Glow />
    <div aria-hidden="true" className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(rgb(48_82_128/0.14)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
    <div className="relative container-site text-center">
      {eyebrow && <Reveal><Eyebrow>{eyebrow}</Eyebrow></Reveal>}
      <Reveal delay={0.05}>
        <h1 className="font-heading text-[2.4rem] leading-[1.08] sm:text-5xl md:text-6xl lg:text-[4.2rem] font-bold tracking-tight text-ink mt-6 max-w-5xl mx-auto"><Accented text={title} /></h1>
      </Reveal>
      {lead && <Reveal delay={0.1}><p className="text-copy text-lg md:text-xl mt-6 max-w-3xl mx-auto leading-relaxed">{lead}</p></Reveal>}
      {actions && <Reveal delay={0.15}><div className="flex flex-wrap justify-center gap-3 mt-9">{actions}</div></Reveal>}
      {children}
    </div>
  </section>;
}
