"use client";

import { useEffect, useState } from "react";
import { useHref, useT } from "@/i18n/LocaleProvider";

// Five more designs of the Who We Are page (/who-we-are), one at a time, with a switcher at the bottom. Each carries
// the page's full content: the heading and introduction, the headline figures, the nine facts, the four directors
// and their experience, the four questions, the tagline and the four buttons.

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

const label = "text-xs md:text-sm font-semibold uppercase tracking-[0.18em]";

function Plus() {
  return <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true"><path d="M8 3v10M3 8h10" /></svg>;
}

/** The four questions, one open at a time; every answer stays in the page. */
function Questions({ dark = false, boxed = false }: { dark?: boolean; boxed?: boolean }) {
  const { t } = useWho();
  const name = `q-${dark ? "d" : "l"}-${boxed ? "b" : "p"}`;
  return <div className={boxed ? "space-y-3" : `border-t ${dark ? "border-white/15" : "border-slate-200"}`}>
    {t.faq.map((item, i) => <details key={item.q} name={name} open={i === 0}
      className={`group ${boxed ? `rounded-2xl border ${dark ? "border-white/15 bg-white/5" : "border-slate-200 bg-white"} px-5` : `border-b ${dark ? "border-white/15" : "border-slate-200"}`}`}>
      <summary className="flex items-center justify-between gap-6 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <h3 className={`font-heading text-lg font-bold ${dark ? "text-white" : "text-brand-navy"}`}>{item.q}</h3>
        <span className={`grid place-items-center w-9 h-9 rounded-full shrink-0 border transition-transform duration-300 group-open:rotate-45 ${dark ? "border-white/30 text-teal-300" : "border-slate-300 text-brand-orange-aa"}`}><Plus /></span>
      </summary>
      <p className={`pb-6 pr-12 leading-relaxed ${dark ? "text-white/75" : "text-slate-600"}`}>{item.a}</p>
    </details>)}
  </div>;
}

function Buttons({ dark = false, className = "" }: { dark?: boolean; className?: string }) {
  const { actions } = useWho();
  return <div className={`flex flex-wrap gap-3 ${className}`}>
    {actions.map((a) => <a key={a.href} href={a.href}
      className={`inline-flex items-center justify-center min-h-12 px-6 rounded-full font-semibold transition-colors ${a.primary ? "bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white"
        : dark ? "border-2 border-white/40 text-white hover:bg-white hover:text-brand-navy" : "border-2 border-brand-navy/20 text-brand-navy hover:border-brand-navy"}`}>{a.label}</a>)}
  </div>;
}

function Monogram({ name, dark = false, size = "w-14 h-14 text-lg" }: { name: string; dark?: boolean; size?: string }) {
  return <span aria-hidden="true" className={`grid place-items-center rounded-full font-heading font-bold shrink-0 ${size} ${dark ? "bg-teal-400/15 text-teal-300 ring-1 ring-teal-300/40" : "bg-brand-navy text-white"}`}>{initials(name)}</span>;
}

// ---------- A. Story: photo and figures pinned on the left, everything else in one reading column ----------

function Story() {
  const { t, facts, leadership, people, figures } = useWho();
  return <div className="bg-white text-brand-navy">
    <div className="max-w-[1240px] mx-auto px-6 pt-28 md:pt-32 pb-20 grid lg:grid-cols-12 gap-10 lg:gap-16">
      <aside className="lg:col-span-5">
        <div className="lg:sticky lg:top-28">
          <dl className="grid grid-cols-2 gap-4">
            {figures.map((f, i) => <div key={f.label} className={`flex flex-col-reverse rounded-3xl p-6 md:p-8 ${i === 0 ? "bg-brand-navy text-white" : "bg-slate-50"}`}>
              <dt className={`text-xs font-semibold uppercase tracking-wider mt-2 ${i === 0 ? "text-white/70" : "text-slate-500"}`}>{f.label}</dt>
              <dd className="font-heading text-5xl md:text-6xl font-bold">{f.value}<span className={i === 0 ? "text-teal-300" : "text-teal-aa"}>+</span></dd>
            </div>)}
          </dl>
          <p className="font-heading text-xl font-bold text-brand-orange-aa mt-6">{t.tagline}</p>
        </div>
      </aside>
      <article className="lg:col-span-7">
        <span className={`${label} text-teal-aa`}>{t.kicker}</span>
        <h1 className="font-heading text-4xl md:text-5xl font-bold leading-tight mt-4">{t.title}</h1>
        <p className="text-lg md:text-xl text-slate-600 leading-relaxed mt-6">{t.intro}</p>

        <h2 className="font-heading text-2xl md:text-3xl font-bold mt-16">{t.factsTitle}</h2>
        <dl className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
          {facts.map((f) => <div key={f.label} className="grid sm:grid-cols-[12rem_minmax(0,1fr)] gap-x-6 gap-y-1 py-4">
            <dt className="text-sm font-semibold text-teal-aa">{f.label}</dt><dd className="leading-relaxed">{f.value}</dd>
          </div>)}
        </dl>

        <h2 className="font-heading text-2xl md:text-3xl font-bold mt-16">{leadership.label}</h2>
        <ul className="mt-6 grid sm:grid-cols-2 gap-4">
          {people.map((p) => <li key={p.name} className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4">
            <Monogram name={p.name} size="w-12 h-12 text-base" />
            <span><span className="block font-heading font-bold">{p.name}</span><span className="block text-sm text-slate-600">{p.role}</span></span>
          </li>)}
        </ul>
        <p className="text-slate-600 leading-relaxed mt-5">{t.leadershipCaption}</p>

        <h2 className="font-heading text-2xl md:text-3xl font-bold mt-16 mb-4">{t.faqTitle}</h2>
        <Questions />

        <div className="mt-16 rounded-3xl bg-slate-50 p-8">
          <p className="font-heading text-2xl md:text-3xl font-bold text-brand-orange-aa">{t.tagline}</p>
          <Buttons className="mt-6" />
        </div>
      </article>
    </div>
  </div>;
}

// ---------- B. Bento: one mosaic of tiles ----------

function Bento() {
  const { t, facts, leadership, people, figures, lead } = useWho();
  const tile = "rounded-3xl p-6 md:p-7";
  return <div className="bg-slate-100 text-brand-navy pt-28 md:pt-32 pb-20">
    <div className="max-w-[1240px] mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 md:gap-5">
        <div className={`${tile} bg-white md:col-span-6 lg:col-span-12 flex flex-col justify-between`}>
          <span className={`${label} text-teal-aa`}>{t.kicker}</span>
          <div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] mt-8 max-w-4xl">{t.title}</h1>
            <p className="text-lg text-slate-600 leading-relaxed mt-6 max-w-xl">{lead}</p>
          </div>
        </div>
        {figures.map((f) => <div key={f.label} className={`${tile} bg-brand-navy text-white md:col-span-3 lg:col-span-3 flex flex-col-reverse`}>
          <span className="text-sm text-white/70 mt-1">{f.label}</span>
          <span className="font-heading text-4xl md:text-5xl font-bold">{f.value}<span className="text-teal-300">+</span></span>
        </div>)}
        {facts.map((f, i) => <div key={f.label} className={`${tile} bg-white md:col-span-3 ${i === 0 || i === 3 || i === 8 ? "lg:col-span-6" : "lg:col-span-3"}`}>
          <span className={`${label} text-teal-aa`}>{f.label}</span>
          <p className="mt-3 leading-relaxed">{f.value}</p>
        </div>)}
        <div className={`${tile} bg-white md:col-span-6 lg:col-span-12`}>
          <span className={`${label} text-teal-aa`}>{leadership.label}</span>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
            {people.map((p) => <li key={p.name} className="flex items-center gap-3">
              <Monogram name={p.name} size="w-11 h-11 text-sm" />
              <span><span className="block font-heading font-bold">{p.name}</span><span className="block text-sm text-slate-600">{p.role}</span></span>
            </li>)}
          </ul>
        </div>
        <div className={`${tile} bg-teal-700 text-white md:col-span-6 lg:col-span-12`}>
          <p className="font-heading text-xl md:text-2xl leading-snug">{t.leadershipCaption}</p>
        </div>
      </div>
      <div className="grid lg:grid-cols-12 gap-10 mt-16">
        <div className="lg:col-span-4">
          <h2 className="font-heading text-3xl md:text-4xl font-bold">{t.faqTitle}</h2>
          <p className="font-heading text-xl font-bold text-brand-orange-aa mt-6">{t.tagline}</p>
          <Buttons className="mt-6" />
        </div>
        <div className="lg:col-span-8"><Questions boxed /></div>
      </div>
    </div>
  </div>;
}

// ---------- C. Tabs: a short opening, then the facts, leadership and questions as tabs ----------

function Tabs() {
  const { t, facts, leadership, people, figures, lead } = useWho();
  const tabs = [t.factsTitle, leadership.label, t.faqTitle];
  const [tab, setTab] = useState(0);
  return <div className="bg-white text-brand-navy">
    <section className="bg-brand-navy text-white pt-28 md:pt-32 pb-12">
      <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          <span className={`${label} text-teal-300`}>{t.kicker}</span>
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mt-4 text-white">{t.title}</h1>
          <p className="text-lg text-white/80 leading-relaxed mt-5 max-w-xl">{lead}</p>
        </div>
        <dl className="lg:col-span-5 grid grid-cols-2 gap-px rounded-3xl overflow-hidden bg-white/10 ring-1 ring-white/10">
          {figures.map((f) => <div key={f.label} className="flex flex-col-reverse bg-brand-navy p-6"><dt className="text-xs uppercase tracking-wider text-white/60 mt-1">{f.label}</dt><dd className="font-heading text-4xl font-bold text-teal-300">{f.value}+</dd></div>)}
        </dl>
      </div>
    </section>
    <div className="sticky top-[72px] md:top-24 z-10 bg-white border-b border-slate-200">
      <div role="tablist" aria-label={t.kicker} className="max-w-[1200px] mx-auto px-6 flex gap-2 overflow-x-auto [scrollbar-width:none]">
        {tabs.map((name, i) => <button key={name} type="button" role="tab" id={`tab-${i}`} aria-selected={tab === i} aria-controls={`panel-${i}`} onClick={() => setTab(i)}
          className={`shrink-0 min-h-14 px-4 font-heading font-bold border-b-[3px] cursor-pointer transition-colors ${tab === i ? "border-brand-orange-aa text-brand-navy" : "border-transparent text-slate-500 hover:text-brand-navy"}`}>{name}</button>)}
      </div>
    </div>
    <div className="max-w-[1200px] mx-auto px-6 py-12 md:py-16">
      {/* Every panel is in the page (hidden ones too), for search engines. */}
      <div role="tabpanel" id="panel-0" aria-labelledby="tab-0" hidden={tab !== 0}>
        <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {facts.map((f) => <div key={f.label} className="rounded-2xl border border-slate-200 p-6"><dt className={`${label} text-teal-aa`}>{f.label}</dt><dd className="mt-3 leading-relaxed">{f.value}</dd></div>)}
        </dl>
      </div>
      <div role="tabpanel" id="panel-1" aria-labelledby="tab-1" hidden={tab !== 1}>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {people.map((p) => <li key={p.name} className="rounded-2xl border border-slate-200 p-6"><Monogram name={p.name} /><p className="font-heading text-lg font-bold mt-5">{p.name}</p><p className="text-slate-600 mt-1">{p.role}</p></li>)}
        </ul>
        <p className="text-lg text-slate-600 leading-relaxed mt-8 max-w-3xl">{t.leadershipCaption}</p>
      </div>
      <div role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden={tab !== 2} className="max-w-3xl"><Questions /></div>
    </div>
    <div className="max-w-[1200px] mx-auto px-6 pb-20">
      <div className="rounded-3xl bg-slate-50 p-8 md:p-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <p className="font-heading text-2xl md:text-3xl font-bold text-brand-orange-aa">{t.tagline}</p>
        <Buttons />
      </div>
    </div>
  </div>;
}

// ---------- D. Chapters: four numbered chapters down the page ----------

function Chapters() {
  const { t, facts, leadership, people, figures } = useWho();
  const Chapter = ({ n, title, children, tint = false }: { n: string; title: string; children: React.ReactNode; tint?: boolean }) =>
    <section className={tint ? "bg-[#f6f4ef]" : "bg-white"}>
      <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-24 grid lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-3">
          <span aria-hidden="true" className="block font-heading text-6xl md:text-8xl font-bold leading-none text-brand-navy/10">{n}</span>
          <h2 className="font-heading text-2xl md:text-3xl font-bold mt-3">{title}</h2>
        </div>
        <div className="lg:col-span-9">{children}</div>
      </div>
    </section>;
  return <div className="text-brand-navy pt-20 md:pt-24">
    <Chapter n="01" title={t.kicker} tint>
      <h1 className="font-heading text-4xl md:text-5xl font-bold leading-tight">{t.title}</h1>
      <p className="text-lg md:text-xl text-slate-600 leading-relaxed mt-8 max-w-3xl">{t.intro}</p>
      <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-8 border-t border-brand-navy/15">
        {figures.map((f) => <div key={f.label} className="flex flex-col-reverse"><dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">{f.label}</dt><dd className="font-heading text-4xl font-bold">{f.value}<span className="text-teal-aa">+</span></dd></div>)}
      </dl>
    </Chapter>
    <Chapter n="02" title={t.factsTitle}>
      <dl className="grid md:grid-cols-2 gap-x-12">
        {facts.map((f) => <div key={f.label} className="py-5 border-b border-slate-200"><dt className={`${label} text-teal-aa`}>{f.label}</dt><dd className="mt-2 text-lg leading-relaxed">{f.value}</dd></div>)}
      </dl>
    </Chapter>
    <Chapter n="03" title={leadership.label} tint>
      <ul className="grid sm:grid-cols-2 gap-x-12 gap-y-6">
        {people.map((p) => <li key={p.name} className="flex items-center gap-4"><Monogram name={p.name} /><span><span className="block font-heading text-lg font-bold">{p.name}</span><span className="block text-slate-600">{p.role}</span></span></li>)}
      </ul>
      <p className="font-heading text-xl md:text-2xl leading-snug mt-10 border-l-2 border-teal-aa pl-6">{t.leadershipCaption}</p>
    </Chapter>
    <Chapter n="04" title={t.faqTitle}>
      <Questions />
      <div className="mt-12">
        <p className="font-heading text-2xl md:text-3xl font-bold text-brand-orange-aa">{t.tagline}</p>
        <Buttons className="mt-6" />
      </div>
    </Chapter>
  </div>;
}

// ---------- E. Navy: the whole page dark ----------

function Navy() {
  const { t, facts, leadership, people, figures, lead } = useWho();
  return <div className="bg-[#0d1b33] text-white [--color-near-black:#ffffff]">
    <section className="relative overflow-hidden pt-28 md:pt-36 pb-16 md:pb-24">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(50rem_26rem_at_80%_0%,rgba(26,219,195,0.16),transparent_65%)]" />
      <div className="relative max-w-[1200px] mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-9">
          <span className={`${label} text-teal-300`}>{t.kicker}</span>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.06] mt-5">{t.title}</h1>
          <p className="text-lg md:text-xl text-white/75 leading-relaxed mt-6 max-w-2xl">{lead}</p>
        </div>
      </div>
      <dl className="relative max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 mt-14 border-y border-white/10 divide-white/10 md:divide-x">
        {figures.map((f) => <div key={f.label} className="flex flex-col-reverse items-center py-6"><dt className="text-xs uppercase tracking-[0.18em] text-white/60 mt-1">{f.label}</dt><dd className="font-heading text-4xl md:text-5xl font-bold text-teal-300">{f.value}+</dd></div>)}
      </dl>
    </section>
    <section className="max-w-[1200px] mx-auto px-6 py-16 md:py-24">
      <h2 className="font-heading text-3xl md:text-4xl font-bold">{t.factsTitle}</h2>
      <dl className="grid md:grid-cols-3 gap-px bg-white/10 rounded-3xl overflow-hidden mt-10 border border-white/10">
        {facts.map((f) => <div key={f.label} className="bg-[#0d1b33] p-6"><dt className={`${label} text-teal-300`}>{f.label}</dt><dd className="mt-3 leading-relaxed text-white/85">{f.value}</dd></div>)}
      </dl>
    </section>
    <section className="bg-[#11223d] py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="font-heading text-3xl md:text-4xl font-bold">{leadership.label}</h2>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
          {people.map((p) => <li key={p.name} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6"><Monogram name={p.name} dark /><p className="font-heading text-lg font-bold mt-5">{p.name}</p><p className="text-white/70 mt-1">{p.role}</p></li>)}
        </ul>
        <p className="font-heading text-xl md:text-2xl leading-snug text-white/90 mt-12 max-w-4xl">{t.leadershipCaption}</p>
      </div>
    </section>
    <section className="max-w-[1200px] mx-auto px-6 py-16 md:py-24 grid lg:grid-cols-12 gap-10">
      <div className="lg:col-span-4">
        <h2 className="font-heading text-3xl md:text-4xl font-bold">{t.faqTitle}</h2>
        <p className="font-heading text-xl font-bold text-brand-orange mt-6">{t.tagline}</p>
        <Buttons dark className="mt-6 lg:flex-col lg:items-start" />
      </div>
      <div className="lg:col-span-8"><Questions dark /></div>
    </section>
  </div>;
}

// ---------- The switcher ----------

const VERSIONS = [
  { id: "story", label: "Story", note: "The figures stay pinned on the left while the whole page reads as one column on the right.", Page: Story },
  { id: "bento", label: "Bento", note: "One mosaic of tiles: heading, figures, each fact, the leadership and their experience; then the questions.", Page: Bento },
  { id: "tabs", label: "Tabs", note: "A short navy opening, then At a glance, Leadership and Questions as tabs, so the page is about a screen long.", Page: Tabs },
  { id: "chapters", label: "Chapters", note: "Four numbered chapters, 01 to 04, alternating paper and white: who, the facts, the leadership, the questions.", Page: Chapters },
  { id: "navy", label: "Navy", note: "The whole page in deep navy with teal figures, the facts in a hairline grid and the directors on dark cards.", Page: Navy },
] as const;
type Version = (typeof VERSIONS)[number]["id"];

export default function Versions() {
  const [version, setVersion] = useState<Version>("story");
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
