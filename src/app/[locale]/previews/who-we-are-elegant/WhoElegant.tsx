"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import WhoWeAre from "@/components/WhoWeAre";
import { Images } from "@/lib/assets";
import { useHref, useT } from "@/i18n/LocaleProvider";
import { RotatingImages, SERVE_CATEGORIES, useWhoActions } from "../homepage-five/kit";

// Five more restrained versions of Who We Are. Same words as the live section, in the site's own fonts: a lighter
// touch, more space, fine lines, and one idea per version.

const options = [
  { id: "current", label: "Current", type: "On staging now", note: "The section as it is on staging, for comparison." },
  { id: "quiet", label: "Quiet", type: "Centred & calm", note: "One narrow column: the title, a short orange rule, the introduction, then the facts in two fine columns, the questions, and three round photographs." },
  { id: "editorial", label: "Editorial", type: "Long-read", note: "The title stays in place on the left while the story reads down the right, opening with a large first letter. Facts as a ruled list." },
  { id: "portrait", label: "Portrait", type: "Photo & text", note: "The founders' photograph stands tall beside the introduction and a pair of fact columns. Tall arched photographs for What we serve." },
  { id: "index", label: "Index", type: "Organised", note: "The facts as a numbered index, the questions as tabs, and What we serve as three wide photograph panels." },
  { id: "panel", label: "Soft panel", type: "Gentle & airy", note: "A pale panel with four key facts set large, the other six in three columns beneath, and the questions as four open cards." },
] as const;
type Variant = (typeof options)[number]["id"];

const kick = "text-[13px] font-semibold tracking-[0.2em] uppercase text-teal-aa";
const title = "font-heading font-medium text-brand-navy tracking-tight";
const lead = "text-lg md:text-xl leading-[1.8] text-slate-700";
const btnPrimary = "inline-flex items-center justify-center min-h-12 px-7 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold transition-colors";
const btnLine = "inline-flex items-center min-h-12 px-3 font-semibold text-brand-navy underline decoration-brand-navy/25 underline-offset-8 hover:decoration-brand-orange transition-colors";

function useCopy() {
  const t = useT();
  return { w: t.home.whoWeAre, t, actions: useWhoActions(), href: useHref() };
}

function Buttons({ center = false }: { center?: boolean }) {
  const { actions } = useCopy();
  return <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 ${center ? "justify-center" : ""}`}>
    {actions.map((a, i) => <a key={a.href} href={a.href} data-analytics-click={a.label} className={i === 0 ? btnPrimary : btnLine}>{a.label}</a>)}
  </div>;
}

/** The four questions, one open at a time, with only fine lines between them. */
function Questions({ className = "" }: { className?: string }) {
  const { w } = useCopy();
  const [open, setOpen] = useState(0);
  return <ul className={`border-t border-brand-navy/15 ${className}`}>
    {w.faq.map((item, i) => <li key={item.q} className="border-b border-brand-navy/15">
      <h3><button type="button" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}
        className="w-full flex items-center justify-between gap-6 py-6 text-left font-heading text-lg md:text-xl font-medium text-brand-navy cursor-pointer hover:text-brand-orange-aa transition-colors">
        {item.q}<span aria-hidden="true" className={`text-2xl font-light text-brand-orange-aa transition-transform duration-300 ${open === i ? "rotate-45" : ""}`}>+</span>
      </button></h3>
      <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden"><p className="pb-7 pr-10 leading-[1.8] text-slate-600">{item.a}</p></div>
      </div>
    </li>)}
  </ul>;
}

function Rule() { return <span aria-hidden="true" className="block w-12 h-px bg-brand-orange mx-auto" />; }

function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section aria-label="Who we are" className={`bg-white py-20 md:py-28 lg:py-32 ${className}`}><div className="max-w-[1200px] mx-auto px-6">{children}</div></section>;
}

/** Three species groups; each group's three photographs take turns. */
function Serve({ shape }: { shape: "circle" | "arch" | "panel" | "plain" }) {
  const { w, t, href } = useCopy();
  const frame = { circle: "rounded-full aspect-square w-52 md:w-60 mx-auto", arch: "rounded-t-full aspect-[3/4]", panel: "aspect-[16/10] md:aspect-[4/5]", plain: "aspect-[4/3]" }[shape];
  return <div>
    <h3 className={`${title} text-2xl md:text-3xl text-center`}>{w.serveTitle}</h3>
    <div className={`grid md:grid-cols-3 gap-x-10 gap-y-14 mt-12 ${shape === "panel" ? "md:gap-5" : ""}`}>
      {w.cards.map((card, i) => <a key={card.title} href={href(`/products?q=${encodeURIComponent(SERVE_CATEGORIES[i])}`)} className="group block text-center">
        <div className={`relative overflow-hidden bg-slate-100 ${frame} ${shape === "panel" ? "rounded-2xl" : ""}`}>
          <RotatingImages group={i} offset={i} sizes="(min-width: 768px) 360px, 100vw" className="group-hover:scale-[1.04] transition-transform duration-700" />
          {shape === "panel" && <><span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-6 text-left"><span className="block font-heading text-2xl font-medium text-white">{card.title}</span></span></>}
        </div>
        {shape !== "panel" && <h4 className="font-heading text-2xl font-medium text-brand-navy mt-6 group-hover:text-brand-orange-aa transition-colors">{card.title}</h4>}
        <p className={`text-slate-600 leading-[1.8] mt-3 ${shape === "panel" ? "text-left" : "max-w-xs mx-auto"}`}>{card.description}</p>
        <span className="inline-block mt-3 text-sm font-semibold text-brand-orange-aa">{t.products.allProducts} →</span>
      </a>)}
    </div>
  </div>;
}

function Quiet() {
  const { w } = useCopy();
  return <Section>
    <div className="max-w-3xl mx-auto text-center">
      <span className={kick}>{w.kicker}</span>
      <h2 className={`${title} text-3xl md:text-5xl leading-[1.15] mt-5`}>{w.title}</h2>
      <p className="font-heading italic text-xl md:text-2xl text-brand-orange-aa mt-6">{w.tagline}</p>
      <div className="mt-8"><Rule /></div>
      <p className={`${lead} mt-8`}>{w.intro}</p>
    </div>
    <dl className="grid sm:grid-cols-2 gap-x-20 gap-y-9 max-w-4xl mx-auto mt-20">
      {w.facts.map((f, i) => <div key={f.label} className={`border-t border-brand-navy/15 pt-4 ${i === 9 ? "sm:col-span-2" : ""}`}>
        <dt className="text-[13px] font-semibold tracking-[0.14em] uppercase text-teal-aa">{f.label}</dt>
        <dd className="mt-2 leading-[1.75] text-brand-navy">{f.value}</dd>
      </div>)}
    </dl>
    <p className="text-center text-slate-600 max-w-2xl mx-auto mt-16 leading-[1.8]">{w.leadershipCaption}</p>
    <div className="max-w-3xl mx-auto mt-16"><Questions /></div>
    <div className="mt-12"><Buttons center /></div>
    <div className="mt-24"><Serve shape="circle" /></div>
  </Section>;
}

function Editorial() {
  const { w, actions } = useCopy();
  return <Section>
    <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-32">
          <span className={kick}>{w.kicker}</span>
          <h2 className={`${title} text-3xl md:text-4xl leading-[1.2] mt-5`}>{w.title}</h2>
          <p className="font-heading italic text-xl text-brand-orange-aa mt-5">{w.tagline}</p>
          <div className="mt-8 flex flex-col items-start">{actions.map((a, i) => <a key={a.href} href={a.href} data-analytics-click={a.label} className={i === 0 ? `${btnPrimary} mb-2` : btnLine}>{a.label}</a>)}</div>
        </div>
      </div>
      <div className="lg:col-span-8">
        <p className="text-xl md:text-[1.4rem] leading-[1.85] text-brand-navy first-letter:float-left first-letter:font-heading first-letter:text-[4.6rem] first-letter:leading-[0.8] first-letter:mr-3 first-letter:mt-2 first-letter:text-brand-orange-aa">{w.intro}</p>
        <blockquote className="mt-10 border-l-2 border-brand-orange pl-6 text-slate-600 leading-[1.8]">{w.leadershipCaption}</blockquote>
        <dl className="mt-14 border-t border-brand-navy/15">
          {w.facts.map((f) => <div key={f.label} className="grid sm:grid-cols-[11rem_1fr] gap-x-8 gap-y-1 py-5 border-b border-brand-navy/10">
            <dt className="text-[13px] font-semibold tracking-[0.14em] uppercase text-teal-aa pt-1">{f.label}</dt>
            <dd className="leading-[1.75] text-brand-navy">{f.value}</dd>
          </div>)}
        </dl>
        <div className="mt-16"><Questions /></div>
      </div>
    </div>
    <div className="mt-28"><Serve shape="plain" /></div>
  </Section>;
}

function Portrait() {
  const { w, t } = useCopy();
  return <Section>
    <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
      <figure className="lg:col-span-5 relative">
        <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden"><Image src={Images.people.foundersNew} alt={t.about.foundersAlt} fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover object-[50%_40%]" /></div>
        <figcaption className="mt-5 text-slate-600 leading-[1.8] lg:absolute lg:left-6 lg:right-6 lg:bottom-6 lg:mt-0 lg:rounded-2xl lg:bg-white/95 lg:p-5 lg:text-sm">{w.leadershipCaption}</figcaption>
      </figure>
      <div className="lg:col-span-7">
        <span className={kick}>{w.kicker}</span>
        <h2 className={`${title} text-3xl md:text-5xl leading-[1.15] mt-5`}>{w.title}</h2>
        <p className="font-heading italic text-xl md:text-2xl text-brand-orange-aa mt-5">{w.tagline}</p>
        <p className={`${lead} mt-7`}>{w.intro}</p>
        <dl className="grid sm:grid-cols-2 gap-x-10 gap-y-6 mt-10">
          {w.facts.map((f, i) => <div key={f.label} className={`border-l-2 border-brand-orange/40 pl-4 ${i === 9 ? "sm:col-span-2" : ""}`}>
            <dt className="text-[13px] font-semibold tracking-[0.14em] uppercase text-teal-aa">{f.label}</dt>
            <dd className="mt-1 leading-[1.7] text-brand-navy">{f.value}</dd>
          </div>)}
        </dl>
      </div>
    </div>
    <div className="grid lg:grid-cols-12 gap-12 mt-24">
      <div className="lg:col-span-4 flex flex-col justify-center gap-6">
        <h3 className={`${title} text-2xl md:text-3xl`}>Questions, answered</h3>
        <Buttons />
      </div>
      <Questions className="lg:col-span-8" />
    </div>
    <div className="mt-28"><Serve shape="arch" /></div>
  </Section>;
}

function Index() {
  const { w } = useCopy();
  const [tab, setTab] = useState(0);
  return <Section>
    <div className="grid lg:grid-cols-12 gap-10 items-end">
      <div className="lg:col-span-7">
        <span className={kick}>{w.kicker}</span>
        <h2 className={`${title} text-3xl md:text-5xl leading-[1.15] mt-5`}>{w.tagline}</h2>
        <p className="text-slate-500 mt-4 max-w-xl leading-[1.7]">{w.title}</p>
      </div>
      <p className={`lg:col-span-5 ${lead} text-base md:text-lg`}>{w.intro}</p>
    </div>
    <ol className="mt-16 border-t border-brand-navy/20">
      {w.facts.map((f, i) => <li key={f.label} className="group grid grid-cols-[2.5rem_1fr] sm:grid-cols-[3.5rem_13rem_1fr] gap-x-4 gap-y-1 py-5 border-b border-brand-navy/10 hover:bg-slate-50 transition-colors">
        <span className="font-heading text-brand-orange-aa text-lg tabular-nums">{String(i + 1).padStart(2, "0")}</span>
        <span className="font-heading font-medium text-brand-navy">{f.label}</span>
        <span className="col-start-2 sm:col-start-3 leading-[1.7] text-slate-600 group-hover:text-brand-navy transition-colors">{f.value}</span>
      </li>)}
    </ol>
    <p className="text-slate-600 mt-10 max-w-3xl leading-[1.8]">{w.leadershipCaption}</p>

    <div className="mt-20 rounded-3xl bg-slate-50 p-6 md:p-10">
      <div role="tablist" aria-label="Questions" className="flex flex-wrap gap-2">
        {w.faq.map((item, i) => <button key={item.q} id={`idx-tab-${i}`} role="tab" type="button" aria-selected={tab === i} aria-controls="idx-panel" onClick={() => setTab(i)}
          className={`rounded-full px-5 min-h-11 text-sm font-semibold cursor-pointer transition-colors ${tab === i ? "bg-brand-navy text-white" : "bg-white text-brand-navy hover:bg-brand-navy/10"}`}>{item.q}</button>)}
      </div>
      <div id="idx-panel" role="tabpanel" aria-labelledby={`idx-tab-${tab}`} className="mt-8 max-w-3xl">
        <h3 className={`${title} text-2xl md:text-3xl`}>{w.faq[tab].q}</h3>
        <p className="mt-4 text-lg leading-[1.85] text-slate-700">{w.faq[tab].a}</p>
      </div>
    </div>
    <div className="mt-12"><Buttons /></div>
    <div className="mt-24"><Serve shape="panel" /></div>
  </Section>;
}

function Panel() {
  const { w } = useCopy();
  const highlight = [1, 2, 5, 6].map((i) => w.facts[i]);
  const rest = [0, 3, 4, 7, 8, 9].map((i) => w.facts[i]);
  return <Section>
    <div className="rounded-[2.5rem] bg-gradient-to-b from-slate-50 to-white border border-slate-100 px-6 py-14 md:px-16 md:py-20">
      <div className="max-w-3xl mx-auto text-center">
        <span className={kick}>{w.kicker}</span>
        <h2 className={`${title} text-3xl md:text-5xl leading-[1.15] mt-5`}>{w.title}</h2>
        <p className="font-heading italic text-xl md:text-2xl text-brand-orange-aa mt-6">{w.tagline}</p>
        <p className={`${lead} mt-8`}>{w.intro}</p>
      </div>
      <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-brand-navy/10 rounded-2xl overflow-hidden mt-14">
        {highlight.map((f) => <div key={f.label} className="bg-white px-6 py-8">
          <dt className="text-[13px] font-semibold tracking-[0.14em] uppercase text-teal-aa">{f.label}</dt>
          <dd className="font-heading text-xl font-medium leading-snug text-brand-navy mt-3">{f.value}</dd>
        </div>)}
      </dl>
      <dl className="grid md:grid-cols-3 gap-x-10 gap-y-8 mt-12">
        {rest.map((f) => <div key={f.label}>
          <dt className="text-[13px] font-semibold tracking-[0.14em] uppercase text-teal-aa">{f.label}</dt>
          <dd className="mt-2 leading-[1.75] text-slate-700">{f.value}</dd>
        </div>)}
      </dl>
      <p className="text-slate-600 mt-12 max-w-3xl leading-[1.8]">{w.leadershipCaption}</p>
    </div>
    <div className="grid md:grid-cols-2 gap-5 mt-10">
      {w.faq.map((item) => <div key={item.q} className="rounded-3xl border border-brand-navy/10 p-7 md:p-9">
        <h3 className="font-heading text-xl font-medium text-brand-navy leading-snug">{item.q}</h3>
        <p className="mt-3 leading-[1.8] text-slate-600">{item.a}</p>
      </div>)}
    </div>
    <div className="mt-12"><Buttons center /></div>
    <div className="mt-24"><Serve shape="plain" /></div>
  </Section>;
}

export default function WhoElegant() {
  const [variant, setVariant] = useState<Variant>("quiet");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    const sync = () => {
      const value = window.location.hash.slice(1);
      if (options.some((o) => o.id === value)) setVariant(value as Variant);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const select = (id: Variant) => { setVariant(id); window.history.replaceState(null, "", `#${id}`); };
  const selected = options.find((o) => o.id === variant)!;

  return <main id="main" tabIndex={-1} className="min-h-screen bg-white pt-28 md:pt-32 pb-24">
    <div className="max-w-[1200px] mx-auto px-6">
      <Link href="/previews" className="text-sm font-semibold text-brand-orange-aa hover:underline">← Design previews</Link>
      <p className="text-sm font-semibold uppercase tracking-widest text-slate-500 mt-6">Homepage / Design variations</p>
      <h1 className="font-heading text-4xl font-bold text-brand-navy mt-2">Who We Are, more elegant</h1>
      <p className="text-brand-navy/70 mt-3 max-w-2xl">Five refined ways to set the same words, with the current section first for comparison.</p>
      <div role="tablist" aria-label="Who We Are designs" className="flex flex-wrap gap-2 mt-8">
        {options.map((o, index) => <button key={o.id} ref={(el) => { tabs.current[index] = el; }} type="button" role="tab" id={`tab-${o.id}`} aria-selected={variant === o.id} aria-controls="design-preview"
          tabIndex={variant === o.id ? 0 : -1} onClick={() => select(o.id)}
          onKeyDown={(e) => {
            const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
            if (!d && e.key !== "Home" && e.key !== "End") return;
            e.preventDefault();
            const next = e.key === "Home" ? 0 : e.key === "End" ? options.length - 1 : (index + d + options.length) % options.length;
            select(options[next].id); tabs.current[next]?.focus();
          }}
          className={`inline-flex items-center gap-2 min-h-11 px-4 rounded-full border font-semibold transition-colors ${variant === o.id ? "bg-brand-navy border-brand-navy text-white" : "border-slate-300 text-brand-navy hover:border-brand-navy"}`}>
          <span aria-hidden="true" className="text-xs opacity-70">{String.fromCharCode(65 + index)}</span>{o.label}
        </button>)}
      </div>
      <p className="mt-5 text-brand-navy"><strong>{selected.type}.</strong> <span className="text-slate-600">{selected.note}</span></p>
    </div>
    <div id="design-preview" role="tabpanel" aria-labelledby={`tab-${variant}`} tabIndex={0} className="mt-10 border-y border-dashed border-slate-300">
      {variant === "current" && <WhoWeAre />}
      {variant === "quiet" && <Quiet />}
      {variant === "editorial" && <Editorial />}
      {variant === "portrait" && <Portrait />}
      {variant === "index" && <Index />}
      {variant === "panel" && <Panel />}
    </div>
  </main>;
}
