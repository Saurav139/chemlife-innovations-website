"use client";

import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Fragment, useEffect, useId, useRef, useState, type ReactNode } from "react";
import Icon, { type IconName } from "./Icon";

// The building blocks of the site's look: paper sections, serif headlines with orange italic accents, mono labels,
// arch-topped pictures and pill buttons.

export const easeOut = [0.22, 1, 0.36, 1] as const;

/** Text with *starred* words set in orange italics: "Nature-driven *science*". */
export function Accented({ text }: { text: string }) {
  return <>{text.split(/\*([^*]+)\*/).map((part, i) =>
    i % 2 ? <em key={i} className="font-display italic font-normal text-flame">{part}</em> : <Fragment key={i}>{part}</Fragment>)}</>;
}

/** Stars the second sentence of a two-sentence line ("Small actions. *Lasting commitments.*"), in any language. */
export function accentSecond(text: string) {
  const match = text.match(/^(.+?[.।?!])\s+(.+)$/);
  return match ? `${match[1]} *${match[2]}*` : text;
}

/** Stars the last word: "Awards & *Recognition*". */
export const accentLast = (text: string) => text.replace(/(\S+)\s*$/, "*$1*");

/** Fades and lifts into place the first time it scrolls into view (only fades, for reduced motion). */
export function Reveal({ children, delay = 0, className, as = "div", y = 28 }: { children: ReactNode; delay?: number; className?: string; as?: "div" | "li" | "article"; y?: number }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return <Tag className={className} initial={{ opacity: 0, y: reduce ? 0 : y }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "0px 0px -8% 0px" }} transition={{ duration: 0.8, delay, ease: easeOut }}>{children}</Tag>;
}

/** A section's small label: "(02) — Our process". */
export function Kicker({ index, children, className = "" }: { index?: string; children: ReactNode; className?: string }) {
  return <p className={`label-mono flex items-center gap-3 text-copy-dim ${className}`}>
    {index && <span className="text-flame">({index})</span>}
    <span aria-hidden="true" className="h-px w-8 bg-current opacity-50" />
    <span>{children}</span>
  </p>;
}

/** A section's heading: the label on the left, a large serif title and its lead on the right. */
export function SectionHead({ id, index, kicker, title, lead, className = "", children }: { id: string; index?: string; kicker: ReactNode; title: string; lead?: ReactNode; className?: string; children?: ReactNode }) {
  return <div className={`grid lg:grid-cols-12 gap-6 lg:gap-10 mb-12 md:mb-16 ${className}`}>
    <Reveal className="lg:col-span-3 lg:pt-4"><Kicker index={index}>{kicker}</Kicker></Reveal>
    <Reveal delay={0.06} className="lg:col-span-9">
      <h2 id={id} className="font-display text-[2.4rem] leading-[1.02] sm:text-5xl lg:text-[4.25rem] tracking-[-0.02em] text-ink max-w-5xl"><Accented text={title} /></h2>
      {lead && <p className="text-copy text-lg md:text-xl leading-relaxed mt-6 max-w-3xl">{lead}</p>}
      {children}
    </Reveal>
  </div>;
}

type Tone = "paper" | "alt" | "ink";
const TONES: Record<Tone, string> = { paper: "bg-page", alt: "bg-page-alt", ink: "theme-dark bg-page" };

export function Section({ tone = "paper", id, labelledBy, className = "", children }: { tone?: Tone; id?: string; labelledBy?: string; className?: string; children: ReactNode }) {
  return <section id={id} aria-labelledby={labelledBy} className={`paper relative ${TONES[tone]} py-20 md:py-28 lg:py-32 ${className}`}>
    <div className="container-site relative">{children}</div>
  </section>;
}

type ButtonVariant = "primary" | "ink" | "outline" | "light";
const BUTTONS: Record<ButtonVariant, string> = {
  primary: "bg-brand-orange-aa text-white hover:bg-brand-orange-aa-hover",
  ink: "bg-ink text-page hover:bg-flame hover:text-white",
  outline: "border border-ink/30 text-ink hover:border-ink hover:bg-ink hover:text-page",
  light: "bg-[#f3eee4] text-[#14243a] hover:bg-white",
};

/** A pill button, or a link styled as one. Internal paths use client-side navigation. */
export function Button({ href, onClick, variant = "primary", arrow, icon, className = "", children, ...rest }: {
  href?: string; onClick?: () => void; variant?: ButtonVariant; arrow?: boolean; icon?: IconName; className?: string; children: ReactNode;
  target?: string; rel?: string; type?: "button" | "submit"; disabled?: boolean; "data-analytics-click"?: string;
}) {
  const cls = `group/btn inline-flex items-center justify-center gap-2.5 min-h-12 rounded-full pl-6 ${arrow ? "pr-2" : "pr-6"} py-1.5 font-semibold text-[15px] transition-colors duration-300 cursor-pointer disabled:opacity-60 ${BUTTONS[variant]} ${className}`;
  const inner = <>
    {icon && <Icon name={icon} className="w-4 h-4 -ml-1" />}
    <span>{children}</span>
    {arrow && <span aria-hidden="true" className="grid place-items-center w-9 h-9 rounded-full bg-white/15 overflow-hidden">
      <Icon name="arrow" className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
    </span>}
  </>;
  if (!href) return <button type={rest.type ?? "button"} onClick={onClick} disabled={rest.disabled} data-analytics-click={rest["data-analytics-click"]} className={cls}>{inner}</button>;
  if (href.startsWith("/") && !rest.target) return <Link href={href} onClick={onClick} data-analytics-click={rest["data-analytics-click"]} className={cls}>{inner}</Link>;
  return <a href={href} onClick={onClick} target={rest.target} rel={rest.rel} data-analytics-click={rest["data-analytics-click"]} className={cls}>{inner}</a>;
}

/** A text link with an arrow and an underline that draws in on hover. */
export function ArrowLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  const cls = `group/link inline-flex items-center gap-2 min-h-11 font-semibold text-ink ${className}`;
  const inner = <>
    <span className="bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat bg-[length:0%_1px] bg-left-bottom group-hover/link:bg-[length:100%_1px] transition-[background-size] duration-500">{children}</span>
    <Icon name="arrow" className="w-4 h-4 text-flame transition-transform duration-300 group-hover/link:translate-x-1" />
  </>;
  return href.startsWith("/") ? <Link href={href} className={cls}>{inner}</Link> : <a href={href} className={cls}>{inner}</a>;
}

/** Counts up to a number the first time it's on screen. The server renders the final number. */
export function Counter({ value, suffix = "", className = "" }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (!inView || reduce) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1600);
      setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduce, value]);
  return <span ref={ref} className={`tabular-nums ${className}`}>{shown}{suffix}</span>;
}

/** Text running round a circle, slowly turning, with something in the middle. Decorative. */
export function Seal({ text, children, className = "" }: { text: string; children?: ReactNode; className?: string }) {
  const id = `seal${useId().replace(/[^\w-]/g, "")}`;
  return <div aria-hidden="true" className={`relative grid place-items-center ${className}`}>
    <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full animate-spin-slow">
      <defs><path id={id} d="M100 100m-78 0a78 78 0 1 1 156 0a78 78 0 1 1-156 0" /></defs>
      <text className="fill-current label-mono" style={{ fontSize: 13.5, letterSpacing: "0.2em" }}>
        <textPath href={`#${id}`} textLength="486">{text}</textPath>
      </text>
    </svg>
    {children}
  </div>;
}

/** A slowly scrolling line of text. The copy that makes it seamless is hidden from screen readers. */
export function Marquee({ items, className = "", reverse }: { items: ReactNode[]; className?: string; reverse?: boolean }) {
  const row = (hidden?: boolean) => <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
    {items.map((item, i) => <li key={i} className="flex items-center shrink-0">
      {item}<span aria-hidden="true" className="mx-8 md:mx-12 text-flame">✳</span>
    </li>)}
  </ul>;
  return <div className={`overflow-hidden ${className}`}>
    <div className={`flex w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}>{row()}{row(true)}</div>
  </div>;
}

/** Questions that open one at a time, as native disclosure widgets. */
export function Faq({ items }: { items: readonly { q: string; a: string }[] }) {
  return <div className="border-t border-line">
    {items.map((item, i) => <details key={item.q} className="group border-b border-line" open={i === 0}>
      <summary className="flex items-start gap-5 py-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span className="label-mono text-flame pt-2 w-7 shrink-0">{String(i + 1).padStart(2, "0")}</span>
        <span className="flex-1 font-display text-xl md:text-2xl text-ink leading-snug">{item.q}</span>
        <span aria-hidden="true" className="grid place-items-center w-10 h-10 rounded-full border border-line text-ink shrink-0 transition-transform duration-300 group-open:rotate-45 group-open:bg-ink group-open:text-page">
          <Icon name="plus" className="w-4 h-4" />
        </span>
      </summary>
      <p className="text-copy text-lg leading-relaxed pb-7 pl-12 pr-4 md:pr-16 -mt-1">{item.a}</p>
    </details>)}
  </div>;
}

/** The top of an inner page: a mono trail, a very large serif title and the lead beside the actions. */
export function PageHero({ trail, title, lead, actions, children }: { trail: string; title: string; lead?: ReactNode; actions?: ReactNode; children?: ReactNode }) {
  return <section className="paper relative bg-page pt-28 md:pt-36 lg:pt-44 pb-14 md:pb-20 overflow-hidden">
    <div className="container-site relative">
      <Reveal className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-line">
        <p className="label-mono text-copy-dim"><span className="text-flame">●</span>&nbsp;&nbsp;ChemLife&nbsp;&nbsp;/&nbsp;&nbsp;{trail}</p>
        <p aria-hidden="true" className="label-mono text-copy-dim hidden sm:block">13.27° N &nbsp;—&nbsp; 77.58° E</p>
      </Reveal>
      <Reveal delay={0.05}>
        <h1 className="font-display text-[2.75rem] leading-[0.98] sm:text-6xl md:text-7xl lg:text-[6.25rem] tracking-[-0.025em] text-ink mt-10 md:mt-14 max-w-6xl"><Accented text={title} /></h1>
      </Reveal>
      {(lead || actions) && <Reveal delay={0.1} className="grid lg:grid-cols-12 gap-8 mt-10 md:mt-14">
        {lead && <p className="lg:col-span-7 lg:col-start-6 text-copy text-lg md:text-xl leading-relaxed">{lead}</p>}
        {actions && <div className="lg:col-span-7 lg:col-start-6 flex flex-wrap gap-3 -mt-2">{actions}</div>}
      </Reveal>}
      {children}
    </div>
  </section>;
}
