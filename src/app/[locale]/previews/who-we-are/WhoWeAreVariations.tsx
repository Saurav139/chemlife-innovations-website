"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import WhoWeAre from "@/components/WhoWeAre";
import { Images } from "@/lib/assets";
import { useHref, useT } from "@/i18n/LocaleProvider";

const options = [
  { id: "current", label: "Current", type: "On staging now", note: "The section as it is on staging: facts beside the questions, the buttons, then What we serve." },
  { id: "sheet", label: "Navy fact sheet", type: "Bold & factual", note: "The introduction on a navy band, with the facts as a two-column sheet of cards and the questions below." },
  { id: "questions", label: "Questions first", type: "Answer-led", note: "The four questions open and close like an FAQ, with the facts kept in a sticky sidebar beside them." },
  { id: "photo", label: "Photo-led", type: "Human & grounded", note: "The leadership photo carries the tagline; the key facts sit beside it as short labelled lines." },
  { id: "tabs", label: "Tabbed", type: "Compact", note: "One short introduction, then tabs for the facts, the questions and the leadership, so the section stays short." },
  { id: "timeline", label: "Milestones", type: "Story & proof", note: "The partnerships, recognition and government support as a timeline, with the questions in a grid below." },
] as const;
type Variant = (typeof options)[number]["id"];

const MILESTONES = [
  { year: "2018", title: "Huvepharma", text: "Collaboration with Huvepharma begins." },
  { year: "2020", title: "EW Nutrition", text: "Partnership with EW Nutrition begins." },
  { year: "2020-21", title: "C-CAMP K-SAP BIO 50", text: "Selected for the C-CAMP K-SAP BIO 50 cohort." },
  { year: "2023", title: "Technology Development Board", text: "Department of Science and Technology support for the bio-trace minerals project." },
  { year: "Today", title: "FAMI-QS", text: "Feed-additive quality and safety certification, made in Doddaballapura." },
];

const primaryBtn = "inline-flex items-center justify-center min-h-12 px-7 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold transition-colors";
const outlineBtn = "inline-flex items-center justify-center min-h-12 px-7 rounded-full border-2 border-brand-navy/20 hover:border-brand-navy text-brand-navy font-semibold transition-colors";
const outlineBtnLight = "inline-flex items-center justify-center min-h-12 px-7 rounded-full border-2 border-white/40 hover:border-white text-white font-semibold transition-colors";

function useCopy() {
  const t = useT().home.whoWeAre;
  const href = useHref();
  const actions = [
    { label: t.exploreProducts, path: "/products" },
    { label: t.seeResearch, path: "/research" },
    { label: t.meetLeadership, path: "/about" },
    { label: t.requestDossier, path: "/contact?type=dossier" },
  ];
  return { t, href, actions };
}

function Actions({ light = false, center = false }: { light?: boolean; center?: boolean }) {
  const { href, actions } = useCopy();
  return <div className={`flex flex-wrap gap-3 ${center ? "justify-center" : ""}`}>
    {actions.map((action, i) => <a key={action.path} href={href(action.path)} className={i === 0 ? primaryBtn : light ? outlineBtnLight : outlineBtn}>{action.label}</a>)}
  </div>;
}

function Heading({ light = false, center = false }: { light?: boolean; center?: boolean }) {
  const { t } = useCopy();
  return <div className={center ? "text-center" : ""}>
    <span className={`text-sm font-semibold tracking-widest uppercase block mb-2 ${light ? "text-teal-300" : "text-teal-aa"}`}>{t.kicker}</span>
    <h2 className={`font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight ${center ? "max-w-4xl mx-auto" : ""} ${light ? "text-white" : "text-brand-navy"}`}>{t.title}</h2>
    <p className={`font-heading text-lg md:text-xl font-semibold italic mt-4 ${light ? "text-orange-300" : "text-brand-orange-aa"}`}>{t.tagline}</p>
  </div>;
}

function Sheet() {
  const { t } = useCopy();
  return <section aria-label="Who we are, navy fact sheet">
    <div className="bg-brand-navy text-white py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-7"><Heading light /></div>
        <p className="lg:col-span-5 text-white/85 text-lg leading-relaxed">{t.intro}</p>
      </div>
    </div>
    <div className="bg-slate-50 py-14 md:py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <dl className="grid sm:grid-cols-2 gap-4 -mt-24 md:-mt-32">
          {t.facts.map((fact) => <div key={fact.label} className="rounded-2xl bg-white border border-slate-200 p-5 md:p-6 shadow-sm">
            <dt className="text-xs font-bold tracking-widest uppercase text-brand-orange-aa">{fact.label}</dt>
            <dd className="text-brand-navy mt-2 leading-relaxed">{fact.value}</dd>
          </div>)}
        </dl>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-10 mt-16">
          {t.faq.map((item) => <div key={item.q}>
            <h3 className="font-heading text-xl font-bold text-brand-navy">{item.q}</h3>
            <p className="text-slate-600 leading-relaxed mt-2">{item.a}</p>
          </div>)}
        </div>
        <p className="text-sm text-slate-600 mt-14 max-w-3xl">{t.leadershipCaption}</p>
        <div className="mt-6"><Actions /></div>
      </div>
    </div>
  </section>;
}

function Questions() {
  const { t } = useCopy();
  return <section aria-label="Who we are, questions first" className="bg-white py-16 md:py-24">
    <div className="max-w-[1200px] mx-auto px-6">
      <Heading />
      <p className="text-brand-navy text-lg md:text-xl leading-relaxed mt-8 max-w-3xl">{t.intro}</p>
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mt-12">
        <div className="lg:col-span-7 divide-y divide-slate-200 border-y border-slate-200">
          {t.faq.map((item, i) => <details key={item.q} open={i === 0} className="group py-5">
            <summary className="flex items-start justify-between gap-6 cursor-pointer list-none font-heading text-lg md:text-xl font-bold text-brand-navy">
              {item.q}
              <span aria-hidden="true" className="shrink-0 grid place-items-center w-8 h-8 rounded-full border border-slate-300 text-brand-orange-aa transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="text-slate-600 leading-relaxed mt-3 max-w-[62ch]">{item.a}</p>
          </details>)}
          <div className="pt-8 pb-2"><p className="text-sm text-slate-600">{t.leadershipCaption}</p><div className="mt-5"><Actions /></div></div>
        </div>
        <aside className="lg:col-span-5">
          <div className="lg:sticky lg:top-28 rounded-2xl bg-slate-50 border border-slate-200 p-6 md:p-8">
            <h3 className="font-heading text-lg font-bold text-brand-navy">At a glance</h3>
            <dl className="mt-4 space-y-4">
              {t.facts.map((fact) => <div key={fact.label}>
                <dt className="text-xs font-bold tracking-widest uppercase text-teal-aa">{fact.label}</dt>
                <dd className="text-slate-700 text-[15px] leading-relaxed mt-1">{fact.value}</dd>
              </div>)}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  </section>;
}

function Photo() {
  const { t } = useCopy();
  // The facts that read well in a line; the leadership names are on the photo instead.
  const shortFacts = t.facts.filter((_, i) => [1, 2, 5, 6, 7, 8].includes(i));
  return <section aria-label="Who we are, photo-led" className="bg-white py-16 md:py-24">
    <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-12 gap-10 lg:gap-14">
      <figure className="lg:col-span-6 relative min-h-[420px] lg:min-h-full rounded-2xl overflow-hidden">
        <Image src={Images.people.foundersNew} alt="ChemLife's founders and leadership team" fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover object-[18%_40%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/20 to-transparent" aria-hidden="true" />
        <figcaption className="absolute inset-x-0 bottom-0 p-6 md:p-8 text-white">
          <p className="font-heading text-2xl md:text-3xl font-bold leading-tight">{t.tagline}</p>
          <p className="text-white/85 text-sm mt-3 max-w-md">{t.leadershipCaption}</p>
        </figcaption>
      </figure>
      <div className="lg:col-span-6">
        <span className="text-teal-aa text-sm font-semibold tracking-widest uppercase block mb-2">{t.kicker}</span>
        <h2 className="font-heading text-3xl md:text-4xl font-bold leading-tight text-brand-navy">{t.title}</h2>
        <p className="text-brand-navy text-lg leading-relaxed mt-6">{t.intro}</p>
        <dl className="mt-8 grid sm:grid-cols-2 gap-x-8 gap-y-5">
          {shortFacts.map((fact) => <div key={fact.label} className="border-l-2 border-brand-orange pl-4">
            <dt className="text-xs font-bold tracking-widest uppercase text-slate-500">{fact.label}</dt>
            <dd className="text-brand-navy font-semibold mt-1 leading-snug">{fact.value}</dd>
          </div>)}
        </dl>
        <div className="mt-10"><Actions /></div>
      </div>
    </div>
    <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
      {t.faq.map((item) => <div key={item.q} className="rounded-2xl bg-slate-50 p-6">
        <h3 className="font-heading text-lg font-bold text-brand-navy">{item.q}</h3>
        <p className="text-slate-600 text-[15px] leading-relaxed mt-2">{item.a}</p>
      </div>)}
    </div>
  </section>;
}

function Tabbed() {
  const { t } = useCopy();
  const panels = [
    { id: "glance", label: "At a glance" },
    { id: "questions", label: "Questions" },
    { id: "milestones", label: "Milestones" },
  ] as const;
  const [panel, setPanel] = useState<(typeof panels)[number]["id"]>("glance");
  return <section aria-label="Who we are, tabbed" className="bg-white py-16 md:py-24">
    <div className="max-w-[1000px] mx-auto px-6">
      <Heading center />
      <p className="text-brand-navy text-lg md:text-xl leading-relaxed mt-8 text-center max-w-3xl mx-auto">{t.intro}</p>
      <div role="tablist" aria-label="About ChemLife" className="flex justify-center gap-2 mt-10">
        {panels.map((p) => <button key={p.id} type="button" role="tab" aria-selected={panel === p.id} onClick={() => setPanel(p.id)}
          className={`min-h-11 px-5 rounded-full font-semibold transition-colors ${panel === p.id ? "bg-brand-navy text-white" : "bg-slate-100 text-brand-navy hover:bg-slate-200"}`}>{p.label}</button>)}
      </div>
      <div role="tabpanel" className="mt-8 min-h-[360px]">
        {panel === "glance" && <dl className="grid sm:grid-cols-2 gap-x-10 border-t border-slate-200">
          {t.facts.map((fact) => <div key={fact.label} className="py-4 border-b border-slate-200">
            <dt className="text-sm font-semibold text-teal-aa">{fact.label}</dt>
            <dd className="text-slate-700 mt-1 leading-relaxed">{fact.value}</dd>
          </div>)}
        </dl>}
        {panel === "questions" && <div className="grid md:grid-cols-2 gap-8">
          {t.faq.map((item) => <div key={item.q}>
            <h3 className="font-heading text-lg font-bold text-brand-navy">{item.q}</h3>
            <p className="text-slate-600 leading-relaxed mt-2">{item.a}</p>
          </div>)}
        </div>}
        {panel === "milestones" && <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MILESTONES.map((m) => <li key={m.title} className="rounded-2xl bg-slate-50 p-5">
            <span className="font-heading text-2xl font-bold text-brand-orange-aa">{m.year}</span>
            <p className="font-bold text-brand-navy mt-1">{m.title}</p>
            <p className="text-slate-600 text-[15px] mt-1">{m.text}</p>
          </li>)}
        </ol>}
      </div>
      <p className="text-sm text-slate-600 text-center mt-10 max-w-3xl mx-auto">{t.leadershipCaption}</p>
      <div className="mt-6"><Actions center /></div>
    </div>
  </section>;
}

function Timeline() {
  const { t } = useCopy();
  return <section aria-label="Who we are, milestones" className="bg-white py-16 md:py-24">
    <div className="max-w-[1200px] mx-auto px-6">
      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7"><Heading /></div>
        <p className="lg:col-span-5 text-brand-navy text-lg leading-relaxed lg:pt-8">{t.intro}</p>
      </div>
      <ol className="relative grid md:grid-cols-5 gap-8 mt-16">
        <span aria-hidden="true" className="hidden md:block absolute left-0 right-0 top-[11px] h-px bg-slate-300" />
        {MILESTONES.map((m) => <li key={m.title} className="relative pl-8 md:pl-0">
          <span aria-hidden="true" className="absolute left-0 md:static block w-6 h-6 rounded-full bg-white border-4 border-brand-orange" />
          <span className="block font-heading text-2xl font-bold text-brand-navy md:mt-5">{m.year}</span>
          <p className="font-bold text-brand-orange-aa mt-1">{m.title}</p>
          <p className="text-slate-600 text-[15px] leading-relaxed mt-1">{m.text}</p>
        </li>)}
      </ol>
      <div className="rounded-2xl bg-brand-navy text-white p-8 md:p-12 mt-16 grid md:grid-cols-2 gap-x-12 gap-y-10">
        {t.faq.map((item) => <div key={item.q}>
          <h3 className="font-heading text-lg md:text-xl font-bold text-white">{item.q}</h3>
          <p className="text-white/80 leading-relaxed mt-2">{item.a}</p>
        </div>)}
      </div>
      <p className="text-sm text-slate-600 mt-10 max-w-3xl">{t.leadershipCaption}</p>
      <div className="mt-6"><Actions /></div>
    </div>
  </section>;
}

export default function WhoWeAreVariations() {
  const [variant, setVariant] = useState<Variant>("current");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    const sync = () => {
      const value = window.location.hash.slice(1);
      if (options.some((option) => option.id === value)) setVariant(value as Variant);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const select = (id: Variant) => {
    setVariant(id);
    window.history.replaceState(null, "", `#${id}`);
  };
  const selected = options.find((option) => option.id === variant)!;

  return <main id="main" tabIndex={-1} className="min-h-screen bg-white pt-28 md:pt-32 pb-24">
    <div className="max-w-[1200px] mx-auto px-6">
      <Link href="/previews" className="text-sm font-semibold text-brand-orange-aa hover:underline">← Design previews</Link>
      <p className="text-sm font-semibold uppercase tracking-widest text-slate-500 mt-6">Homepage / Design variations</p>
      <h1 className="font-heading text-4xl font-bold text-brand-navy mt-2">Who We Are</h1>
      <p className="text-brand-navy/70 mt-3 max-w-2xl">Six ways to lay out the same copy. The What we serve circles stay below the section in every version.</p>
      <div role="tablist" aria-label="Who We Are designs" className="flex flex-wrap gap-2 mt-8">
        {options.map((option, index) => <button key={option.id} ref={(el) => { tabs.current[index] = el; }}
          type="button" role="tab" id={`tab-${option.id}`} aria-selected={variant === option.id} aria-controls="design-preview"
          tabIndex={variant === option.id ? 0 : -1} onClick={() => select(option.id)}
          onKeyDown={(event) => {
            const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
            if (!direction && event.key !== "Home" && event.key !== "End") return;
            event.preventDefault();
            const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (index + direction + options.length) % options.length;
            select(options[next].id); tabs.current[next]?.focus();
          }}
          className={`inline-flex items-center gap-2 min-h-11 px-4 rounded-full border font-semibold transition-colors ${variant === option.id ? "bg-brand-navy border-brand-navy text-white" : "border-slate-300 text-brand-navy hover:border-brand-navy"}`}>
          <span aria-hidden="true" className="text-xs opacity-70">{String.fromCharCode(65 + index)}</span>{option.label}
        </button>)}
      </div>
      <p className="mt-5 text-brand-navy"><strong>{selected.type}.</strong> <span className="text-slate-600">{selected.note}</span></p>
    </div>

    <div id="design-preview" role="tabpanel" aria-labelledby={`tab-${variant}`} tabIndex={0} className="mt-10 border-y border-dashed border-slate-300">
      {variant === "current" && <WhoWeAre />}
      {variant === "sheet" && <Sheet />}
      {variant === "questions" && <Questions />}
      {variant === "photo" && <Photo />}
      {variant === "tabs" && <Tabbed />}
      {variant === "timeline" && <Timeline />}
    </div>
  </main>;
}
