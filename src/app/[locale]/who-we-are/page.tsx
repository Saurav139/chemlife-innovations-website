"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProofStrip from "@/components/ProofStrip";
import { VariantProvider } from "@/context/VariantContext";
import { useHref, useT } from "@/i18n/LocaleProvider";
import { Images } from "@/lib/assets";
import { jsonLd } from "@/lib/structuredData";

// Who We Are in full, from the homepage's "More about who we are" button, set out like an annual report: a navy
// cover with a contents list, the headline figures, a strip of partners and recognition, then three numbered
// chapters (the facts as a fact sheet, the directors as an organisation chart, the questions all open) and a
// closing band whose one main button asks for the technical dossier.

const easeOut = [0.25, 0.1, 0, 1] as const;

// The homepage hero's figures, with their labels in the language file (home.stats), in this order.
const FIGURES = ["30", "16", "22", "7"];

// The fact sheet's three groups, as positions in home.whoWeAre.facts; their titles are in factGroups.
const GROUP_FACTS = [[0, 1, 3], [2, 4, 5], [7, 6, 8]];
// The group whose last fact (Recognition) is followed by the link to the awards.
const AWARDS_GROUP = 2;

// The chapters' ids, for the cover's contents list.
const CHAPTERS = ["at-a-glance", "leadership", "questions"] as const;

/** "Dr Radhakrishna PM (Chairman and MD), Dr Sharada KC (Director, Technical), …" → each director's name and role.
 *  The same pattern in every language; anything else is shown as it is written. */
function directors(value: string): { name: string; role: string }[] | null {
  const people = value.split(/\),\s*/).map((part) => part.replace(/\)$/, "").match(/^(.+?)\s*\((.+)$/));
  return people.every(Boolean) ? people.map((m) => ({ name: m![1], role: m![2] })) : null;
}

/** A monogram from a name, leaving out a "Dr" title: the first letters of its first and last words in English; in
 *  Hindi and Kannada, whose letters join up, just the first letter. */
function initials(name: string): string {
  const words = name.split(/\s+/).filter((word) => !/^(dr\.?|डॉ\.?|ಡಾ\.?)$/i.test(word));
  const first = (word?: string) => (word ? Array.from(word)[0] : "");
  if (!/^[\x00-\x7F]*$/.test(name)) return first(words[0]);
  return (first(words[0]) + (words.length > 1 ? first(words[words.length - 1]) : "")).toUpperCase();
}

/** Fades and rises into view once (still for visitors who prefer less motion). */
function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.6, delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

const wrap = "max-w-[1200px] mx-auto px-6";
const eyebrow = "text-xs md:text-sm font-semibold uppercase tracking-[0.2em]";
const navy = "bg-[#1d3557]";
// Fine architectural grid lines.
const gridLines = "bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:56px_56px]";

function Arrow({ className = "w-4 h-4" }: { className?: string }) {
  return <svg aria-hidden="true" className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h12M11 5l5 5-5 5" /></svg>;
}

/** A chapter heading: a large faint number beside the title, over a heavy navy rule. */
function ChapterHeading({ n, id, aside, children }: { n: number; id: string; aside?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b-2 border-brand-navy pb-5">
      <div className="flex items-end gap-4 md:gap-6">
        <span aria-hidden="true" className="font-heading text-5xl md:text-7xl font-bold leading-[0.8] tabular-nums text-teal-aa/20">{String(n).padStart(2, "0")}</span>
        <h2 id={id} className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-none text-brand-navy">{children}</h2>
      </div>
      {aside && <span className={`${eyebrow} text-slate-500`}>{aside}</span>}
    </div>
  );
}

// The directors' photos, in the order the leadership fact lists them; all share one 4:5 head-and-shoulders crop.
const LEADER_PHOTOS = [Images.people.leaderRadhakrishna, Images.people.leaderSharada, Images.people.leaderSneehaCropped, Images.people.leaderShankar];

/** A director's 4:5 photo (the name is beside it, so it needs no text alternative), or their initials if there is none. */
function Portrait({ name, photo, lead }: { name: string; photo?: string; lead?: boolean }) {
  const size = lead ? "w-20 h-25" : "w-16 h-20";
  if (!photo) {
    return <span aria-hidden="true" className={`grid place-items-center ${size} shrink-0 rounded-lg font-heading font-bold ${lead ? "bg-white/10 ring-1 ring-white/20 text-lg text-teal-aa-light" : "bg-brand-navy/5 text-brand-navy"}`}>{initials(name)}</span>;
  }
  return (
    <span className={`relative ${size} shrink-0 overflow-hidden rounded-lg ${lead ? "ring-2 ring-white/25" : "ring-1 ring-slate-200"}`}>
      <Image src={photo} alt="" fill sizes={lead ? "80px" : "64px"} className="object-cover" />
    </span>
  );
}

function OrgCard({ person, photo, lead }: { person: { name: string; role: string }; photo?: string; lead?: boolean }) {
  return lead ? (
    <div className={`flex items-center gap-5 rounded-xl ${navy} p-5 md:p-6 w-full max-w-md shadow-xl shadow-brand-navy/20`}>
      <Portrait name={person.name} photo={photo} lead />
      <div className="min-w-0">
        <p className="font-heading text-xl font-bold leading-snug text-white">{person.name}</p>
        <p className="text-sm font-semibold uppercase tracking-wider text-teal-aa-light mt-1">{person.role}</p>
      </div>
    </div>
  ) : (
    <div className="flex items-center gap-4 h-full rounded-xl border border-slate-200 border-t-2 border-t-teal-aa bg-white p-4 md:p-5 shadow-sm">
      <Portrait name={person.name} photo={photo} />
      <div className="min-w-0">
        <p className="font-heading text-lg font-bold leading-snug text-brand-navy">{person.name}</p>
        <p className="text-sm text-slate-500 mt-0.5">{person.role}</p>
      </div>
    </div>
  );
}

export default function WhoWeArePage() {
  const messages = useT();
  const t = messages.home.whoWeAre;
  const href = useHref();
  const facts = t.facts.slice(0, -1);
  const leadership = t.facts[t.facts.length - 1];
  const people = directors(leadership.value);
  const [head, ...board] = people ?? [];
  // The cover keeps the introduction's first sentence; the rest (technologies, government support) is in the facts.
  const lead = t.intro.split(/(?<=[.।])\s+/)[0];
  const chapters = [t.factsTitle, leadership.label, t.faqTitle];
  // The one main action, and the other three as quieter links.
  const links = [
    { label: t.exploreProducts, path: "/products" },
    { label: t.seeResearch, path: "/research" },
    { label: t.meetLeadership, path: "/about" },
  ];
  // The questions as FAQ structured data, for search and answer engines.
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
  };

  return (
    <VariantProvider>
      <Header />

      <main id="main" tabIndex={-1} className="bg-white min-h-screen text-brand-navy">
        {/* Cover: the heading and lead sentence, with the contents on the right. */}
        <section className={`relative overflow-hidden ${navy} text-white pt-28 md:pt-36 lg:pt-40 pb-16 md:pb-24`}>
          <div aria-hidden="true" className={`absolute inset-0 ${gridLines} [mask-image:radial-gradient(ellipse_80%_90%_at_100%_0%,black,transparent)]`} />
          <div aria-hidden="true" className="absolute -right-32 -top-32 w-[38rem] h-[38rem] rounded-full bg-[radial-gradient(circle,rgba(26,219,195,0.18),transparent_65%)]" />
          <div className={`relative ${wrap} grid lg:grid-cols-12 gap-12 lg:gap-16 items-end`}>
            <div className="lg:col-span-8">
              <div className="flex items-center gap-4 text-white/70">
                <span className={`${eyebrow} text-teal-aa-light`}>{t.kicker}</span>
                <span aria-hidden="true" className="h-px flex-1 max-w-24 bg-white/25" />
                <span className={eyebrow}>{t.profileLabel}</span>
              </div>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight text-white mt-6">{t.title}</h1>
              <p className="text-white/80 text-lg md:text-xl leading-relaxed font-light mt-6 max-w-2xl">{lead}</p>
            </div>
            <nav aria-label={t.contentsLabel} className="lg:col-span-4">
              <p className={`${eyebrow} text-white/60`}>{t.contentsLabel}</p>
              <ol className="mt-4 border-t border-white/20">
                {chapters.map((title, i) => (
                  <li key={CHAPTERS[i]} className="border-b border-white/20">
                    <a href={`#${CHAPTERS[i]}`} className="group flex items-center gap-4 min-h-12 py-3 text-white/85 hover:text-white">
                      <span className="font-heading text-sm font-bold tabular-nums text-teal-aa-light">{String(i + 1).padStart(2, "0")}</span>
                      <span className="flex-1 font-heading text-lg font-semibold">{title}</span>
                      <Arrow className="w-4 h-4 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </section>

        {/* Headline figures, with a short teal bar over each; hairlines between them, the first flush left. */}
        <section aria-label={t.kicker} className="border-b border-slate-200">
          <dl className={`${wrap} grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 bg-clip-content`}>
            {FIGURES.map((figure, i) => (
              <div key={figure} className={`flex flex-col-reverse justify-end bg-white py-10 md:py-14 pr-6 ${i === 0 ? "pl-0" : i === 2 ? "pl-0 lg:pl-10" : "pl-6 md:pl-10"}`}>
                <dt className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-500 mt-3">{messages.home.stats[i]}</dt>
                <dd className="font-heading text-5xl md:text-7xl font-bold tabular-nums tracking-tight leading-none text-brand-navy">{figure}<span className="text-teal-aa">+</span></dd>
                <span aria-hidden="true" className="block w-8 h-1 rounded-full bg-teal-aa mb-6" />
              </div>
            ))}
          </dl>
        </section>

        {/* Partners and recognition: logos and the two certifications, before the detail. */}
        <ProofStrip />

        {/* 01 · The facts as a fact sheet: three groups with hairlines between them. */}
        <section aria-labelledby="at-a-glance-title" id={CHAPTERS[0]} className={`${wrap} py-20 md:py-28 scroll-mt-20`}>
          <ChapterHeading n={1} id="at-a-glance-title">{t.factsTitle}</ChapterHeading>
          <div className="grid lg:grid-cols-3 lg:divide-x divide-slate-200">
            {GROUP_FACTS.map((positions, gi) => (
              <Reveal key={gi} delay={gi * 0.06} className={`pt-10 ${gi === 0 ? "lg:pr-10" : gi === GROUP_FACTS.length - 1 ? "lg:pl-10" : "lg:px-10"}`}>
                <p className={`${eyebrow} text-teal-aa`}>{String(gi + 1).padStart(2, "0")} · {t.factGroups[gi].title}</p>
                <p className="text-slate-500 mt-2">{t.factGroups[gi].note}</p>
                <dl className="mt-6 divide-y divide-slate-200 border-t border-slate-200">
                  {positions.map((fi) => (
                    <div key={facts[fi].label} className="py-5">
                      <dt className="text-sm font-semibold text-slate-500">{facts[fi].label}</dt>
                      <dd className="text-lg leading-relaxed mt-1.5 text-brand-navy">{facts[fi].value}</dd>
                    </div>
                  ))}
                </dl>
                {gi === AWARDS_GROUP && (
                  <a href={`${href("/")}#awards`} className="inline-flex items-center gap-2 min-h-11 mt-2 font-semibold text-teal-aa hover:text-brand-navy">
                    {t.awardsLink}<Arrow />
                  </a>
                )}
              </Reveal>
            ))}
          </div>
        </section>

        {/* 02 · Leadership: the chairman on a navy card, the three directors linked below, then their experience. */}
        <section aria-labelledby="leadership-title" id={CHAPTERS[1]} className="bg-slate-50 border-y border-slate-200 py-20 md:py-28 scroll-mt-20">
          <div className={wrap}>
            <ChapterHeading n={2} id="leadership-title" aside={t.boardLabel}>{leadership.label}</ChapterHeading>
            {people ? (
              <Reveal className="flex flex-col items-center mt-14">
                {head && <OrgCard person={head} photo={LEADER_PHOTOS[0]} lead />}
                {board.length > 0 && <>
                  <span aria-hidden="true" className="w-px h-10 bg-slate-300" />
                  <div className="relative w-full grid md:grid-cols-3 gap-4 md:gap-6 md:pt-10">
                    <span aria-hidden="true" className="hidden md:block absolute top-0 left-[calc((100%-3rem)/6)] right-[calc((100%-3rem)/6)] h-px bg-slate-300" />
                    {board.map((person, i) => (
                      <div key={person.name} className="relative">
                        <span aria-hidden="true" className="hidden md:block absolute -top-10 left-1/2 w-px h-10 bg-slate-300" />
                        <OrgCard person={person} photo={LEADER_PHOTOS[i + 1]} />
                      </div>
                    ))}
                  </div>
                </>}
              </Reveal>
            ) : (
              <p className="text-lg leading-relaxed mt-10">{leadership.value}</p>
            )}
            <Reveal>
              <p className="mt-14 md:mt-16 border-l-4 border-teal-aa pl-6 md:pl-8 font-heading text-xl md:text-2xl leading-snug text-brand-navy max-w-4xl">{t.leadershipCaption}</p>
            </Reveal>
          </div>
        </section>

        {/* 03 · Questions, all open: nothing to click, and every answer is plain text for search and answer engines. */}
        <section aria-labelledby="questions-title" id={CHAPTERS[2]} className={`${wrap} py-20 md:py-28 scroll-mt-20`}>
          <ChapterHeading n={3} id="questions-title">{t.faqTitle}</ChapterHeading>
          <div className="grid md:grid-cols-2 gap-x-12">
            {t.faq.map((item, i) => (
              <div key={item.q} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-2 py-8 border-b border-slate-200">
                <span aria-hidden="true" className="font-heading text-sm font-bold text-teal-aa tabular-nums pt-1.5">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-heading text-xl font-bold leading-snug text-brand-navy">{item.q}</h3>
                  <p className="text-slate-600 leading-relaxed mt-3">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Closing: the tagline, the dossier request as the one main button, and quieter links to the rest. */}
        <section className={`relative overflow-hidden ${navy} text-white`}>
          <div aria-hidden="true" className="h-1 bg-gradient-to-r from-teal-aa-light via-teal-aa to-brand-orange" />
          <div aria-hidden="true" className={`absolute inset-0 ${gridLines} [mask-image:linear-gradient(to_left,black,transparent_60%)]`} />
          <div className={`relative ${wrap} py-16 md:py-20 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center`}>
            <p className="lg:col-span-6 font-heading text-3xl md:text-4xl font-bold leading-tight">{t.tagline}</p>
            <div className="lg:col-span-6 lg:justify-self-end">
              <a href={href("/contact?type=dossier")} data-analytics-click={t.requestDossier}
                className="group inline-flex items-center justify-center gap-2 min-h-12 px-7 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold transition-colors">
                {t.requestDossier}<Arrow className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <ul className="flex flex-wrap gap-x-6 gap-y-1 mt-5">
                {links.map((link) => (
                  <li key={link.path}>
                    <a href={href(link.path)} data-analytics-click={link.label} className="inline-flex items-center gap-1.5 min-h-11 font-semibold text-white/80 hover:text-white underline-offset-4 hover:underline">
                      {link.label}<Arrow className="w-3.5 h-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqData)} />
      </main>

      <Footer />
    </VariantProvider>
  );
}
