"use client";

import { useEffect, useState } from "react";
import { useHref, useT } from "@/i18n/LocaleProvider";

// Four corporate designs of the Who We Are page (/who-we-are), one at a time, with a switcher at the bottom. Each
// carries the page's full content: the heading and introduction, the headline figures, the nine facts, the four
// directors and their experience, the four questions, the tagline and the four buttons. No photos.

// The homepage hero's figures, with their labels in the language file (home.stats), in this order.
const FIGURES = ["30", "16", "22", "7"];

/** "Dr Radhakrishna PM (Chairman and MD), …" → each director's name and role. */
function directors(value: string): { name: string; role: string }[] {
  const people = value.split(/\),\s*/).map((part) => part.replace(/\)$/, "").match(/^(.+?)\s*\((.+)$/));
  return people.every(Boolean) ? people.map((m) => ({ name: m![1], role: m![2] })) : [{ name: value, role: "" }];
}

/** A monogram from a name: the first letters of its first and last words, leaving out "Dr". */
function initials(name: string): string {
  const words = name.split(/\s+/).filter((word) => !/^dr\.?$/i.test(word));
  return ((words[0]?.[0] ?? "") + (words.length > 1 ? words[words.length - 1][0] : "")).toUpperCase();
}

function useWho() {
  const m = useT();
  const t = m.home.whoWeAre;
  const href = useHref();
  const leadership = t.facts[t.facts.length - 1];
  return {
    t,
    href,
    facts: t.facts.slice(0, -1),
    leadership,
    people: directors(leadership.value),
    lead: t.intro.split(/(?<=[.।])\s+/)[0],
    figures: FIGURES.map((value, i) => ({ value, label: m.home.stats[i] })),
    actions: [
      { label: t.exploreProducts, href: href("/products"), primary: true },
      { label: t.seeResearch, href: href("/research") },
      { label: t.meetLeadership, href: href("/about") },
      { label: t.requestDossier, href: href("/contact?type=dossier") },
    ],
  };
}

// ---------- Shared pieces ----------

const wrap = "max-w-[1200px] mx-auto px-6";
const eyebrow = "text-xs md:text-sm font-semibold uppercase tracking-[0.2em]";

// Figures in a 2×2 (phones) or 1×4 (desktop) grid with hairlines between them; the first column sits flush with
// the page's left edge.
const figurePad = (i: number) => (i === 0 ? "pl-0" : i === 2 ? "pl-0 lg:pl-10" : "pl-6 md:pl-10");

// Fine architectural grid lines, faded out from one corner.
const gridLines = "bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:56px_56px]";

/** A line icon for each fact, in the facts' order. */
const FACT_ICONS = [
  "M9 3h6M10 3v6l-5.2 9.1A2 2 0 0 0 6.5 21h11a2 2 0 0 0 1.7-2.9L14 9V3M7.5 15h9",
  "M5 19c0-8 6-14 14-14 0 8-6 14-14 14zM5 19l8-8",
  "M12 2.5l8.2 4.75v9.5L12 21.5l-8.2-4.75v-9.5zM12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z",
  "M12 3l9 5-9 5-9-5zM3 12.5l9 5 9-5M3 16.5l9 5 9-5",
  "M12 3l9 5H3zM5 10v8M9.7 10v8M14.3 10v8M19 10v8M3 21h18",
  "M12 3l8 3v6c0 5-3.4 8.2-8 9-4.6-.8-8-4-8-9V6zM8.8 12.2l2.2 2.2 4.2-4.4",
  "M12 3a6 6 0 1 1 0 12 6 6 0 0 1 0-12zM8.6 14L7 21.5l5-2.8 5 2.8-1.6-7.5",
  "M10 14a4 4 0 0 0 5.7 0l3-3A4 4 0 0 0 13 5.3l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  "M3 21V10l5 3v-3l5 3v-3l5 3V3h3v18zM3 21h18",
];

function FactIcon({ i, className = "w-6 h-6" }: { i: number; className?: string }) {
  return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={FACT_ICONS[i] ?? FACT_ICONS[0]} /></svg>;
}

function Arrow({ className = "w-4 h-4" }: { className?: string }) {
  return <svg aria-hidden="true" className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h12M11 5l5 5-5 5" /></svg>;
}

function Chevron() {
  return <svg aria-hidden="true" className="w-5 h-5 shrink-0 transition-transform duration-300 group-open:rotate-180" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7.5l5 5 5-5" /></svg>;
}

function Button({ href, primary, dark, children }: { href: string; primary?: boolean; dark?: boolean; children: React.ReactNode }) {
  return <a href={href} className={`group/b inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-full font-semibold transition-colors ${primary ? "bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white"
    : dark ? "border border-white/35 text-white hover:bg-white hover:text-brand-navy" : "border border-brand-navy/25 text-brand-navy hover:bg-brand-navy hover:text-white"}`}>
    {children}{primary && <Arrow className="w-4 h-4 transition-transform group-hover/b:translate-x-0.5" />}
  </a>;
}

function Buttons({ dark, className = "" }: { dark?: boolean; className?: string }) {
  const { actions } = useWho();
  return <div className={`flex flex-wrap gap-3 ${className}`}>
    {actions.map((a) => <Button key={a.href} href={a.href} primary={a.primary} dark={dark}>{a.label}</Button>)}
  </div>;
}

/** The four questions as an accordion, one open at a time; every answer stays in the page. */
function Accordion({ name, numbered, dark }: { name: string; numbered?: boolean; dark?: boolean }) {
  const { t } = useWho();
  return <div className={`divide-y ${dark ? "divide-white/15 border-y border-white/15" : "divide-slate-200 border-y border-slate-200"}`}>
    {t.faq.map((item, i) => <details key={item.q} name={name} open={i === 0} className="group">
      <summary className={`flex items-center gap-5 py-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden ${dark ? "text-white" : "text-brand-navy"}`}>
        {numbered && <span aria-hidden="true" className={`font-heading text-sm font-bold tabular-nums ${dark ? "text-teal-aa-light" : "text-teal-aa"}`}>{String(i + 1).padStart(2, "0")}</span>}
        <h3 className="flex-1 font-heading text-lg md:text-xl font-bold">{item.q}</h3>
        <span className={dark ? "text-white/60" : "text-slate-400 group-open:text-teal-aa"}><Chevron /></span>
      </summary>
      <p className={`pb-7 pr-10 leading-relaxed md:text-lg ${numbered ? "pl-10" : ""} ${dark ? "text-white/75" : "text-slate-600"}`}>{item.a}</p>
    </details>)}
  </div>;
}

// ---------- A · Annual report ----------
// A navy cover with a contents list on an architectural grid, the figures as an oversized band, then three numbered
// chapters: the facts grouped like a report's fact sheet, the directors as an organisation chart, and the questions
// as an open two-column grid.

const GROUPS = [
  { title: "Portfolio", note: "What we make and who it is for.", facts: [0, 1, 3] },
  { title: "Science & standards", note: "The technology and the checks behind it.", facts: [2, 4, 5] },
  { title: "Partners & presence", note: "Who we work with, and where.", facts: [7, 6, 8] },
];

const REPORT_CHAPTERS = ["report-glance", "report-leadership", "report-questions"] as const;

/** A chapter heading: a large faint number beside the title, over a heavy navy rule. */
function ReportHeading({ n, id, aside, children }: { n: number; id: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b-2 border-brand-navy pb-5">
    <div className="flex items-end gap-4 md:gap-6">
      <span aria-hidden="true" className="font-heading text-5xl md:text-7xl font-bold leading-[0.8] tabular-nums text-teal-aa/20">{String(n).padStart(2, "0")}</span>
      <h2 id={id} className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-none">{children}</h2>
    </div>
    {aside && <span className={`${eyebrow} text-slate-500`}>{aside}</span>}
  </div>;
}

function AnnualReport() {
  const { t, facts, leadership, people, lead, figures } = useWho();
  const [head, ...board] = people;
  const chapters = [t.factsTitle, leadership.label, t.faqTitle];
  return <div className="bg-white text-brand-navy">
    {/* Cover: the heading and lead sentence, with the report's contents on the right. */}
    <section className="relative overflow-hidden bg-[#1d3557] text-white pt-32 md:pt-40 pb-16 md:pb-24">
      <div aria-hidden="true" className={`absolute inset-0 ${gridLines} [mask-image:radial-gradient(ellipse_80%_90%_at_100%_0%,black,transparent)]`} />
      <div aria-hidden="true" className="absolute -right-32 -top-32 w-[38rem] h-[38rem] rounded-full bg-[radial-gradient(circle,rgba(26,219,195,0.18),transparent_65%)]" />
      <div className={`relative ${wrap} grid lg:grid-cols-12 gap-12 lg:gap-16 items-end`}>
        <div className="lg:col-span-8">
          <div className="flex items-center gap-4 text-white/70">
            <span className={`${eyebrow} text-teal-aa-light`}>{t.kicker}</span>
            <span aria-hidden="true" className="h-px flex-1 max-w-24 bg-white/25" />
            <span className={eyebrow}>Company profile</span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight text-white mt-6">{t.title}</h1>
          <p className="text-white/80 text-lg md:text-xl leading-relaxed font-light mt-6 max-w-2xl">{lead}</p>
        </div>
        <nav aria-label="Contents" className="lg:col-span-4">
          <p className={`${eyebrow} text-white/55`}>Contents</p>
          <ol className="mt-4 border-t border-white/20">
            {chapters.map((title, i) => <li key={title} className="border-b border-white/20">
              <a href={`#${REPORT_CHAPTERS[i]}`} onClick={(e) => { e.preventDefault(); document.getElementById(REPORT_CHAPTERS[i])?.scrollIntoView({ behavior: "smooth" }); }}
                className="group flex items-center gap-4 py-4 text-white/85 hover:text-white">
                <span className="font-heading text-sm font-bold tabular-nums text-teal-aa-light">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 font-heading text-lg font-semibold">{title}</span>
                <Arrow className="w-4 h-4 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white" />
              </a>
            </li>)}
          </ol>
        </nav>
      </div>
    </section>

    {/* Figures band: a short teal bar over each figure. */}
    <section aria-label="Key figures" className="border-b border-slate-200">
      <dl className={`${wrap} grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 bg-clip-content`}>
        {figures.map((f, i) => <div key={f.label} className={`flex flex-col-reverse justify-end bg-white py-10 md:py-14 pr-6 ${figurePad(i)}`}>
          <dt className="text-sm font-semibold uppercase tracking-wider text-slate-500 mt-3">{f.label}</dt>
          <dd className="font-heading text-5xl md:text-7xl font-bold tabular-nums tracking-tight leading-none">{f.value}<span className="text-teal-aa">+</span></dd>
          <span aria-hidden="true" className="block w-8 h-1 rounded-full bg-teal-aa mb-6" />
        </div>)}
      </dl>
    </section>

    {/* 01 · Fact sheet, in three columns with hairlines between them. */}
    <section aria-labelledby={`${REPORT_CHAPTERS[0]}-title`} id={REPORT_CHAPTERS[0]} className={`${wrap} py-20 md:py-28 scroll-mt-24`}>
      <ReportHeading n={1} id={`${REPORT_CHAPTERS[0]}-title`} aside={`${facts.length} facts · ${GROUPS.length} areas`}>{t.factsTitle}</ReportHeading>
      <div className="grid lg:grid-cols-3 lg:divide-x divide-slate-200">
        {GROUPS.map((g, gi) => <div key={g.title} className={`pt-10 ${gi === 0 ? "lg:pr-10" : gi === GROUPS.length - 1 ? "lg:pl-10" : "lg:px-10"}`}>
          <p className={`${eyebrow} text-teal-aa`}>{String(gi + 1).padStart(2, "0")} · {g.title}</p>
          <p className="text-slate-500 mt-2">{g.note}</p>
          <dl className="mt-6 divide-y divide-slate-200 border-t border-slate-200">
            {g.facts.map((fi) => <div key={fi} className="py-5">
              <dt className="flex items-center gap-2.5 text-sm font-semibold text-slate-500"><FactIcon i={fi} className="w-4 h-4 text-teal-aa" />{facts[fi].label}</dt>
              <dd className="text-lg leading-relaxed mt-1.5">{facts[fi].value}</dd>
            </div>)}
          </dl>
        </div>)}
      </div>
    </section>

    {/* 02 · Organisation chart: the chairman on a navy card, the three directors linked below. */}
    <section aria-labelledby={`${REPORT_CHAPTERS[1]}-title`} id={REPORT_CHAPTERS[1]} className="bg-slate-50 border-y border-slate-200 py-20 md:py-28 scroll-mt-24">
      <div className={wrap}>
        <ReportHeading n={2} id={`${REPORT_CHAPTERS[1]}-title`} aside="Board of directors">{leadership.label}</ReportHeading>
        <div className="flex flex-col items-center mt-14">
          {head && <OrgCard person={head} lead />}
          {board.length > 0 && <>
            <span aria-hidden="true" className="w-px h-10 bg-slate-300" />
            <div className="relative w-full grid md:grid-cols-3 gap-4 md:gap-6 md:pt-10">
              <span aria-hidden="true" className="hidden md:block absolute top-0 left-[calc((100%-3rem)/6)] right-[calc((100%-3rem)/6)] h-px bg-slate-300" />
              {board.map((p) => <div key={p.name} className="relative">
                <span aria-hidden="true" className="hidden md:block absolute -top-10 left-1/2 w-px h-10 bg-slate-300" />
                <OrgCard person={p} />
              </div>)}
            </div>
          </>}
        </div>
        {/* Their combined experience, as a pull statement. */}
        <p className="mt-14 md:mt-16 border-l-4 border-teal-aa pl-6 md:pl-8 font-heading text-xl md:text-2xl leading-snug text-brand-navy max-w-4xl">{t.leadershipCaption}</p>
      </div>
    </section>

    {/* 03 · Questions, all open */}
    <section aria-labelledby={`${REPORT_CHAPTERS[2]}-title`} id={REPORT_CHAPTERS[2]} className={`${wrap} py-20 md:py-28 scroll-mt-24`}>
      <ReportHeading n={3} id={`${REPORT_CHAPTERS[2]}-title`}>{t.faqTitle}</ReportHeading>
      <div className="grid md:grid-cols-2 gap-x-12">
        {t.faq.map((item, i) => <div key={item.q} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-2 py-8 border-b border-slate-200">
          <p aria-hidden="true" className="font-heading text-sm font-bold text-teal-aa tabular-nums pt-1.5">Q{i + 1}</p>
          <div>
            <h3 className="font-heading text-xl font-bold leading-snug">{item.q}</h3>
            <p className="text-slate-600 leading-relaxed mt-3">{item.a}</p>
          </div>
        </div>)}
      </div>
    </section>

    <Closing />
  </div>;
}

function OrgCard({ person, lead }: { person: { name: string; role: string }; lead?: boolean }) {
  return lead
    ? <div className="flex items-center gap-5 rounded-xl bg-[#1d3557] text-white p-6 w-full max-w-md shadow-xl shadow-brand-navy/20">
      <span aria-hidden="true" className="grid place-items-center w-14 h-14 shrink-0 rounded-lg bg-white/10 ring-1 ring-white/20 font-heading text-lg font-bold text-teal-aa-light">{initials(person.name)}</span>
      <div className="min-w-0">
        <p className="font-heading text-xl font-bold leading-snug text-white">{person.name}</p>
        <p className="text-sm font-semibold uppercase tracking-wider text-teal-aa-light mt-1">{person.role}</p>
      </div>
    </div>
    : <div className="flex items-center gap-4 h-full rounded-xl border border-slate-200 border-t-2 border-t-teal-aa bg-white p-5 shadow-sm">
      <span aria-hidden="true" className="grid place-items-center w-12 h-12 shrink-0 rounded-lg bg-brand-navy/5 font-heading font-bold text-brand-navy">{initials(person.name)}</span>
      <div className="min-w-0">
        <p className="font-heading text-lg font-bold leading-snug">{person.name}</p>
        <p className="text-sm text-slate-500 mt-0.5">{person.role}</p>
      </div>
    </div>;
}

/** The tagline and the four buttons on a navy band with a teal-to-orange top rule. */
function Closing() {
  const { t } = useWho();
  return <section className="relative overflow-hidden bg-[#1d3557] text-white">
    <div aria-hidden="true" className="h-1 bg-gradient-to-r from-teal-aa-light via-teal-aa to-brand-orange" />
    <div aria-hidden="true" className={`absolute inset-0 ${gridLines} [mask-image:linear-gradient(to_left,black,transparent_60%)]`} />
    <div className={`relative ${wrap} py-16 md:py-20 grid lg:grid-cols-12 gap-8 items-center`}>
      <p className="lg:col-span-5 font-heading text-3xl md:text-4xl font-bold leading-tight">{t.tagline}</p>
      <Buttons dark className="lg:col-span-7 lg:justify-end" />
    </div>
  </section>;
}

// ---------- B · Executive ----------
// A deep gradient hero with its two main actions and the figures on glass tiles, the facts as icon cards, the
// directors on cards with a ringed monogram, numbered questions, and a floating closing card.

function Executive() {
  const { t, facts, leadership, people, lead, figures, href } = useWho();
  return <div className="bg-white text-brand-navy">
    <section className="relative overflow-hidden text-white bg-[linear-gradient(135deg,#17304f_0%,#305280_55%,#1f6f7d_100%)] pt-32 md:pt-40 pb-12 md:pb-16">
      {/* A hexagonal lattice, like a molecule, drawn faintly on the right. */}
      <svg aria-hidden="true" className="absolute right-[-6rem] top-16 w-[36rem] h-[36rem] text-white/10 hidden md:block" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="0.6">
        {[[100, 40], [152, 70], [152, 130], [100, 160], [48, 130], [48, 70], [100, 100]].map(([x, y]) => <g key={`${x}-${y}`}>
          <polygon points={`${x},${y - 22} ${x + 19},${y - 11} ${x + 19},${y + 11} ${x},${y + 22} ${x - 19},${y + 11} ${x - 19},${y - 11}`} />
          <circle cx={x} cy={y} r="2.2" fill="currentColor" />
        </g>)}
      </svg>
      <div className={`relative ${wrap}`}>
        <p className={`${eyebrow} text-teal-aa-light`}>{t.kicker}</p>
        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight text-white mt-5 max-w-3xl">{t.title}</h1>
        <p className="text-white/80 text-lg md:text-xl leading-relaxed font-light mt-6 max-w-2xl">{lead}</p>
        <div className="flex flex-wrap gap-3 mt-9">
          <Button href={href("/products")} primary>{t.exploreProducts}</Button>
          <Button href={href("/contact?type=dossier")} dark>{t.requestDossier}</Button>
        </div>
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-14 md:mt-20">
          {figures.map((f) => <div key={f.label} className="flex flex-col-reverse justify-end rounded-2xl bg-white/[0.07] ring-1 ring-white/15 backdrop-blur-sm px-5 py-5 md:px-7 md:py-6">
            <dt className="text-xs md:text-sm font-medium uppercase tracking-wider text-white/65 mt-2">{f.label}</dt>
            <dd className="font-heading text-4xl md:text-5xl font-bold tabular-nums">{f.value}<span className="text-teal-aa-light">+</span></dd>
          </div>)}
        </dl>
      </div>
    </section>

    <section className={`${wrap} py-20 md:py-28`}>
      <div className="max-w-2xl">
        <p className={`${eyebrow} text-teal-aa`}>{t.kicker}</p>
        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mt-3">{t.factsTitle}</h2>
      </div>
      <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mt-12">
        {facts.map((f, i) => <div key={f.label} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 md:p-7 transition-all duration-300 hover:-translate-y-1 hover:border-teal-aa/40 hover:shadow-xl hover:shadow-brand-navy/10">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-teal-aa to-brand-navy transition-transform duration-500 group-hover:scale-x-100" />
          <span className="grid place-items-center w-11 h-11 rounded-xl bg-teal-aa/10 text-teal-aa"><FactIcon i={i} /></span>
          <dt className="text-sm font-semibold uppercase tracking-wider text-slate-500 mt-5">{f.label}</dt>
          <dd className="text-lg leading-relaxed mt-2">{f.value}</dd>
        </div>)}
      </dl>
    </section>

    <section className="bg-slate-50 py-20 md:py-28">
      <div className={wrap}>
        <div className="grid lg:grid-cols-12 gap-6 items-end">
          <h2 className="lg:col-span-5 font-heading text-3xl md:text-4xl lg:text-5xl font-bold">{leadership.label}</h2>
          <p className="lg:col-span-7 text-lg leading-relaxed text-slate-600">{t.leadershipCaption}</p>
        </div>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
          {people.map((p, i) => <li key={p.name} className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-200 text-center">
            <span aria-hidden="true" className="relative mx-auto grid place-items-center w-20 h-20 rounded-full p-[3px] bg-[conic-gradient(from_200deg,#1adbc3,#305280,#e8614a,#1adbc3)]">
              <span className="grid place-items-center w-full h-full rounded-full bg-white font-heading text-xl font-bold text-brand-navy">{initials(p.name)}</span>
            </span>
            <p className="font-heading text-lg font-bold mt-5">{p.name}</p>
            <p className={`text-sm font-semibold mt-1 ${i === 0 ? "text-brand-orange-aa" : "text-teal-aa"}`}>{p.role}</p>
          </li>)}
        </ul>
      </div>
    </section>

    <section className="py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-center">{t.faqTitle}</h2>
        <div className="mt-12"><Accordion name="exec-q" numbered /></div>
      </div>
    </section>

    <section className={`${wrap} pb-20 md:pb-28`}>
      <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#17304f_0%,#305280_100%)] text-white px-8 py-14 md:px-14 md:py-16">
        <div aria-hidden="true" className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-brand-orange/25 blur-3xl" />
        <div aria-hidden="true" className="absolute -left-24 -top-24 w-80 h-80 rounded-full bg-teal-aa-light/15 blur-3xl" />
        <div className="relative grid lg:grid-cols-12 gap-8 items-center">
          <p className="lg:col-span-5 font-heading text-3xl md:text-4xl font-bold leading-tight">{t.tagline}</p>
          <Buttons dark className="lg:col-span-7 lg:justify-end" />
        </div>
      </div>
    </section>
  </div>;
}

// ---------- C · Dossier ----------
// A consultancy-style white page: a breadcrumb and large type, light oversized figures, then a sticky "On this
// page" index beside the sections, with the active one marked as you scroll; ends on a dossier request card.

const DOSSIER_SECTIONS = ["overview", "glance", "leadership", "questions"] as const;

function Dossier() {
  const { t, facts, leadership, people, lead, figures, href, actions } = useWho();
  const sections = [
    { id: DOSSIER_SECTIONS[0], label: "Overview" },
    { id: DOSSIER_SECTIONS[1], label: t.factsTitle },
    { id: DOSSIER_SECTIONS[2], label: leadership.label },
    { id: DOSSIER_SECTIONS[3], label: t.faqTitle },
  ];
  const [active, setActive] = useState<string>(DOSSIER_SECTIONS[0]);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: "-30% 0px -60% 0px" });
    DOSSIER_SECTIONS.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  return <div className="bg-white text-brand-navy">
    <section className={`${wrap} pt-32 md:pt-40 pb-12`}>
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500">
        <a href={href("/")} className="hover:text-brand-navy">Home</a><span aria-hidden="true">/</span><span className="text-brand-navy font-medium">{t.kicker}</span>
      </nav>
      <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.04] tracking-tight mt-8 max-w-5xl">{t.title}</h1>
      <div className="grid lg:grid-cols-12 gap-8 mt-10 pt-8 border-t border-slate-200">
        <p className={`lg:col-span-3 ${eyebrow} text-teal-aa`}>{t.kicker}</p>
        <p className="lg:col-span-9 text-xl md:text-2xl leading-relaxed text-slate-600 max-w-3xl">{lead}</p>
      </div>
    </section>

    <section aria-label="Key figures" className="bg-slate-50 border-y border-slate-200">
      <dl className={`${wrap} grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 bg-clip-content`}>
        {figures.map((f, i) => <div key={f.label} className={`flex flex-col-reverse justify-end bg-slate-50 py-10 md:py-12 pr-6 ${figurePad(i)}`}>
          <dt className="text-sm text-slate-500 mt-3">{f.label}</dt>
          <dd className="font-heading text-5xl md:text-6xl font-light tracking-tight tabular-nums">{f.value}<span className="text-teal-aa font-bold">+</span></dd>
        </div>)}
      </dl>
    </section>

    <div className={`${wrap} grid lg:grid-cols-12 gap-10 lg:gap-16 py-20 md:py-24`}>
      <aside className="hidden lg:block lg:col-span-3">
        <nav aria-label="On this page" className="sticky top-32">
          <p className={`${eyebrow} text-slate-400`}>On this page</p>
          <ol className="mt-5 border-l border-slate-200">
            {sections.map((s, i) => <li key={s.id}>
              <a href={`#${s.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" }); }}
                className={`-ml-px flex gap-3 border-l-2 pl-4 py-2.5 text-sm transition-colors ${active === s.id ? "border-teal-aa text-brand-navy font-semibold" : "border-transparent text-slate-500 hover:text-brand-navy"}`}>
                <span className="tabular-nums text-slate-400">{String(i + 1).padStart(2, "0")}</span>{s.label}
              </a>
            </li>)}
          </ol>
          <a href={actions[3].href} className="mt-8 flex items-center justify-between gap-3 rounded-xl bg-brand-navy text-white px-5 py-4 text-sm font-semibold hover:bg-brand-navy/90">{actions[3].label}<Arrow /></a>
        </nav>
      </aside>

      <div className="lg:col-span-9 space-y-24 md:space-y-28">
        <section id="overview" className="scroll-mt-32">
          <DossierHeading n={1}>Overview</DossierHeading>
          <p className="text-lg md:text-xl leading-relaxed text-slate-700 mt-8">{t.intro}</p>
        </section>

        <section id="glance" className="scroll-mt-32">
          <DossierHeading n={2}>{t.factsTitle}</DossierHeading>
          <dl className="grid md:grid-cols-2 gap-x-12 mt-4">
            {facts.map((f) => <div key={f.label} className="py-6 border-b border-slate-200">
              <dt className="text-sm font-semibold uppercase tracking-wider text-teal-aa">{f.label}</dt>
              <dd className="text-lg leading-relaxed mt-2">{f.value}</dd>
            </div>)}
          </dl>
        </section>

        <section id="leadership" className="scroll-mt-32">
          <DossierHeading n={3}>{leadership.label}</DossierHeading>
          <ul className="mt-6 border-t border-slate-200">
            {people.map((p) => <li key={p.name} className="grid grid-cols-[3rem_minmax(0,1fr)] md:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1fr)] items-center gap-x-5 gap-y-1 py-5 border-b border-slate-200">
              <span aria-hidden="true" className="row-span-2 md:row-span-1 grid place-items-center w-12 h-12 rounded-full border border-slate-300 font-heading text-sm font-bold">{initials(p.name)}</span>
              <p className="font-heading text-lg font-bold">{p.name}</p>
              <p className="text-slate-500">{p.role}</p>
            </li>)}
          </ul>
          <p className="text-lg leading-relaxed text-slate-600 mt-8">{t.leadershipCaption}</p>
        </section>

        <section id="questions" className="scroll-mt-32">
          <DossierHeading n={4}>{t.faqTitle}</DossierHeading>
          <div className="mt-6"><Accordion name="dossier-q" /></div>
        </section>

        {/* The dossier request as a document card, with the other three buttons beside it. */}
        <section className="grid md:grid-cols-[minmax(0,1fr)_auto] gap-8 items-center rounded-2xl border border-slate-200 bg-slate-50 p-8 md:p-10">
          <div className="flex items-start gap-6">
            <span aria-hidden="true" className="relative shrink-0 w-14 h-[4.5rem] rounded-md bg-white border border-slate-300 shadow-sm [clip-path:polygon(0_0,72%_0,100%_22%,100%_100%,0_100%)]">
              <span className="absolute right-0 top-0 w-4 h-4 bg-slate-200" />
              <span className="absolute left-3 right-4 top-7 h-px bg-slate-300" /><span className="absolute left-3 right-3 top-10 h-px bg-slate-300" /><span className="absolute left-3 right-6 top-[3.25rem] h-px bg-slate-300" />
            </span>
            <div>
              <p className="font-heading text-2xl md:text-3xl font-bold leading-tight">{t.tagline}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
                {actions.slice(0, 3).map((a) => <a key={a.href} href={a.href} className="inline-flex items-center gap-1.5 font-semibold text-teal-aa hover:text-brand-navy">{a.label}<Arrow className="w-3.5 h-3.5" /></a>)}
              </div>
            </div>
          </div>
          <Button href={actions[3].href} primary>{actions[3].label}</Button>
        </section>
      </div>
    </div>
  </div>;
}

function DossierHeading({ n, children }: { n: number; children: React.ReactNode }) {
  return <div className="flex items-baseline gap-5 border-b-2 border-brand-navy pb-4">
    <span className="font-heading text-sm font-bold tabular-nums text-teal-aa">{String(n).padStart(2, "0")}</span>
    <h2 className="font-heading text-3xl md:text-4xl font-bold">{children}</h2>
  </div>;
}

// ---------- D · Split ----------
// On wide screens a navy panel holds the heading and figures in place on the left while the facts, leadership,
// questions, tagline and buttons scroll on the right; on phones the panel comes first.

function Split() {
  const { t, facts, leadership, people, lead, figures } = useWho();
  return <div className="bg-white text-brand-navy lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:pt-24">
    <aside className="relative bg-[#1d3557] text-white lg:sticky lg:top-24 lg:h-[calc(100svh-6rem)] overflow-hidden">
      <div aria-hidden="true" className={`absolute inset-0 ${gridLines} [mask-image:linear-gradient(to_bottom,black,transparent_85%)]`} />
      <div aria-hidden="true" className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-teal-aa-light via-teal-aa/40 to-brand-orange/60" />
      <div className="relative h-full flex flex-col justify-between gap-12 px-6 md:px-12 xl:pl-[max(3rem,calc((100vw-1200px)/2+1.5rem))] xl:pr-14 pt-32 lg:pt-14 pb-12 lg:pb-14 short:lg:pt-10 short:lg:pb-10">
        <div>
          <p className={`${eyebrow} text-teal-aa-light`}>{t.kicker}</p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-[2.6rem] xl:text-5xl short:lg:text-[2.1rem] font-bold leading-[1.08] tracking-tight text-white mt-5">{t.title}</h1>
          <p className="text-white/75 text-lg short:lg:text-base leading-relaxed font-light mt-6 short:lg:mt-4">{lead}</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-t border-white/15 pt-8">
          {figures.map((f) => <div key={f.label} className="flex flex-col-reverse justify-end">
            <dt className="text-xs uppercase tracking-wider text-white/60 mt-1">{f.label}</dt>
            <dd className="font-heading text-4xl short:lg:text-3xl font-bold tabular-nums">{f.value}<span className="text-teal-aa-light">+</span></dd>
          </div>)}
        </dl>
      </div>
    </aside>

    <div className="px-6 md:px-12 xl:pr-[max(3rem,calc((100vw-1200px)/2+1.5rem))] xl:pl-16 py-20 lg:pt-14 space-y-24">
      <section>
        <p className={`${eyebrow} text-teal-aa`}>01</p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2">{t.factsTitle}</h2>
        <dl className="mt-8 border-t border-slate-200">
          {facts.map((f, i) => <div key={f.label} className="flex gap-5 py-6 border-b border-slate-200">
            <span className="grid place-items-center w-10 h-10 shrink-0 rounded-lg bg-slate-100 text-brand-navy"><FactIcon i={i} className="w-5 h-5" /></span>
            <div>
              <dt className="text-sm font-semibold uppercase tracking-wider text-slate-500">{f.label}</dt>
              <dd className="text-lg leading-relaxed mt-1">{f.value}</dd>
            </div>
          </div>)}
        </dl>
      </section>

      <section>
        <p className={`${eyebrow} text-teal-aa`}>02</p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2">{leadership.label}</h2>
        <ul className="grid sm:grid-cols-2 gap-4 mt-8">
          {people.map((p) => <li key={p.name} className="flex items-center gap-4 rounded-xl border border-slate-200 p-5 hover:border-brand-navy/30 hover:shadow-md transition-all">
            <span aria-hidden="true" className="grid place-items-center w-12 h-12 shrink-0 rounded-full bg-brand-navy text-white font-heading font-bold">{initials(p.name)}</span>
            <div><p className="font-heading font-bold">{p.name}</p><p className="text-sm text-slate-500">{p.role}</p></div>
          </li>)}
        </ul>
        <p className="leading-relaxed text-slate-600 mt-6 border-l-2 border-teal-aa pl-5">{t.leadershipCaption}</p>
      </section>

      <section>
        <p className={`${eyebrow} text-teal-aa`}>03</p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2">{t.faqTitle}</h2>
        <div className="mt-6"><Accordion name="split-q" /></div>
      </section>

      <section className="relative overflow-hidden rounded-2xl bg-slate-50 border border-slate-200 p-8 md:p-10">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-aa-light via-teal-aa to-brand-orange" />
        <p className="font-heading text-2xl md:text-3xl font-bold leading-tight">{t.tagline}</p>
        <Buttons className="mt-6" />
      </section>
    </div>
  </div>;
}

// ---------- The switcher ----------

const VERSIONS = [
  { id: "report", label: "Annual report", note: "A navy cover with a contents list, oversized figures, then three numbered chapters: the fact sheet, an organisation chart and every answer open.", Page: AnnualReport },
  { id: "executive", label: "Executive", note: "A gradient hero with its two main buttons and glass figure tiles, icon cards for the facts, ringed monograms and numbered questions.", Page: Executive },
  { id: "dossier", label: "Dossier", note: "A consultancy-style white page: large type, light figures, a sticky “On this page” index that follows your scroll, and a dossier request card.", Page: Dossier },
  { id: "split", label: "Split", note: "A navy panel with the heading and figures stays on the left while the facts, leadership, questions and buttons scroll on the right.", Page: Split },
] as const;
type Version = (typeof VERSIONS)[number]["id"];

export default function Versions() {
  const [version, setVersion] = useState<Version>("report");
  useEffect(() => {
    const sync = () => {
      const value = window.location.hash.slice(1);
      if (VERSIONS.some((v) => v.id === value)) setVersion(value as Version);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const select = (id: Version) => {
    setVersion(id);
    window.history.replaceState(null, "", `#${id}`);
    window.scrollTo({ top: 0 });
  };
  const current = VERSIONS.find((v) => v.id === version)!;

  return <>
    <main id="main" tabIndex={-1} aria-label={`Who We Are page: ${current.label}`} className="pb-28">
      <current.Page key={version} />
    </main>
    <nav aria-label="Who We Are page versions" className="fixed z-[45] bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-max">
      <div className="rounded-2xl bg-brand-navy/95 backdrop-blur text-white shadow-2xl p-2">
        <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none]">
          <a href="/previews" className="shrink-0 px-3 min-h-10 inline-flex items-center text-sm font-semibold text-white/80 hover:text-white">←</a>
          <a href="/who-we-are" className="shrink-0 px-3 min-h-10 inline-flex items-center rounded-xl text-sm font-semibold text-white/80 hover:bg-white/10">Current</a>
          {VERSIONS.map((v, i) => <button key={v.id} type="button" onClick={() => select(v.id)} aria-pressed={version === v.id} aria-label={v.label}
            className={`shrink-0 inline-flex items-center justify-center gap-2 min-h-10 min-w-10 px-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors ${version === v.id ? "bg-white text-brand-navy" : "hover:bg-white/10"}`}>
            <span aria-hidden="true" className="sm:opacity-60">{String.fromCharCode(65 + i)}</span><span aria-hidden="true" className="hidden sm:inline">{v.label}</span>
          </button>)}
        </div>
        <p className="px-3 pt-1.5 pb-0.5 text-xs text-white/80"><strong className="text-white sm:hidden">{current.label}. </strong><span className="hidden md:inline">{current.note}</span></p>
      </div>
    </nav>
  </>;
}
