"use client";

import { motion, useReducedMotion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import { useHref, useT } from "@/i18n/LocaleProvider";

// Who We Are in full, from the homepage's "More about who we are" button, set out like a company profile: a navy
// page header with the key figures beneath it, the facts as a profile table, the four directors, the questions, and
// a closing band with the tagline and the four buttons.

const easeOut = [0.25, 0.1, 0, 1] as const;

// The homepage hero's figures, with their labels in the language file (home.stats), in this order.
const FIGURES = ["30+", "16+", "22+", "7+"];

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

/** A section heading: a short teal rule above the title. */
function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <div>
      <span aria-hidden="true" className="block w-12 h-1 rounded-full bg-teal-aa" />
      <h2 id={id} className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-brand-navy mt-5">{children}</h2>
    </div>
  );
}

export default function WhoWeArePage() {
  const messages = useT();
  const t = messages.home.whoWeAre;
  const href = useHref();
  const actions = [
    { label: t.exploreProducts, path: "/products", primary: true },
    { label: t.seeResearch, path: "/research" },
    { label: t.meetLeadership, path: "/about" },
    { label: t.requestDossier, path: "/contact?type=dossier" },
  ];
  const facts = t.facts.slice(0, -1);
  const leadership = t.facts[t.facts.length - 1];
  const people = directors(leadership.value);
  // The header keeps the introduction's first sentence; the rest (technologies, government support) is in the facts.
  const lead = t.intro.split(/(?<=[.।])\s+/)[0];
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
        {/* Page header, like the other pages': navy with a fine dot grid, the heading and one lead sentence. */}
        <section className="relative overflow-hidden bg-brand-navy text-white pt-28 md:pt-32 lg:pt-36 pb-28 md:pb-32">
          <div aria-hidden="true" className="absolute inset-0 opacity-20 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:16px_16px]" />
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(48rem_24rem_at_85%_0%,rgba(26,219,195,0.14),transparent_70%)]" />
          <div className="relative max-w-[1200px] mx-auto px-6">
            <span className="text-teal-aa-light text-sm font-semibold tracking-widest uppercase block">{t.kicker}</span>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white mt-3 max-w-4xl">{t.title}</h1>
            <p className="text-white/85 text-base md:text-lg lg:text-xl leading-relaxed font-light mt-5 max-w-3xl">{lead}</p>
          </div>
        </section>

        {/* Key figures: a white bar overlapping the header's lower edge. */}
        <div className="relative max-w-[1200px] mx-auto px-6 -mt-16 md:-mt-20">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-xl bg-slate-200 shadow-xl shadow-brand-navy/10 ring-1 ring-slate-200">
            {FIGURES.map((figure, i) => (
              <div key={figure} className="flex flex-col-reverse justify-end bg-white px-6 py-6 md:px-8 md:py-8">
                <dt className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-500 mt-2">{messages.home.stats[i]}</dt>
                <dd className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-brand-navy tabular-nums">
                  {figure.replace("+", "")}<span className="text-teal-aa">+</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* At a glance, as a company profile table: the label in a grey column beside each fact. */}
        <section aria-labelledby="facts-title" className="py-20 md:py-24">
          <div className="max-w-[1200px] mx-auto px-6">
            <SectionHeading id="facts-title">{t.factsTitle}</SectionHeading>
            <Reveal className="mt-10">
              <dl className="overflow-hidden rounded-xl border border-slate-200 divide-y divide-slate-200">
                {facts.map((fact) => (
                  <div key={fact.label} className="grid md:grid-cols-[18rem_minmax(0,1fr)]">
                    <dt className="bg-slate-50 px-6 pt-5 md:py-6 text-xs md:text-sm md:leading-[1.8rem] font-semibold uppercase tracking-wider text-teal-aa md:border-r md:border-slate-200">{fact.label}</dt>
                    <dd className="bg-slate-50 md:bg-white px-6 pt-2 pb-5 md:py-6 text-base md:text-lg leading-relaxed text-brand-navy">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* Leadership: the four directors on cards with a navy top rule, then their combined experience. */}
        <section aria-labelledby="leadership-title" className="bg-slate-50 border-y border-slate-200 py-20 md:py-24">
          <div className="max-w-[1200px] mx-auto px-6">
            <SectionHeading id="leadership-title">{leadership.label}</SectionHeading>
            {people ? (
              <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
                {people.map((person, i) => (
                  <li key={person.name}>
                    <Reveal delay={i * 0.06} className="h-full rounded-xl bg-white border border-slate-200 border-t-4 border-t-brand-navy p-6 md:p-7 shadow-sm">
                      <span aria-hidden="true" className="grid place-items-center w-12 h-12 rounded-lg bg-brand-navy/5 text-brand-navy font-heading text-base font-bold tracking-wide">{initials(person.name)}</span>
                      <p className="font-heading text-lg font-bold text-brand-navy mt-5">{person.name}</p>
                      <p className="text-sm font-medium uppercase tracking-wider text-slate-500 leading-relaxed mt-1">{person.role}</p>
                    </Reveal>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-lg leading-relaxed text-brand-navy mt-8">{leadership.value}</p>
            )}
            <Reveal>
              <p className="mt-10 border-l-4 border-teal-aa bg-white rounded-r-xl px-6 py-5 md:px-8 md:py-6 text-lg md:text-xl leading-relaxed text-slate-700 max-w-4xl">{t.leadershipCaption}</p>
            </Reveal>
          </div>
        </section>

        {/* Questions: native disclosure boxes in one bordered panel, one open at a time; every answer is in the page even while closed. */}
        <section aria-labelledby="faq-title" className="py-20 md:py-24">
          <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <SectionHeading id="faq-title">{t.faqTitle}</SectionHeading>
            </div>
            <div className="lg:col-span-8 overflow-hidden rounded-xl border border-slate-200 divide-y divide-slate-200">
              {t.faq.map((item, i) => (
                <details key={item.q} name="who-we-are-questions" open={i === 0} className="group bg-white open:bg-slate-50/60">
                  <summary className="flex items-center justify-between gap-6 px-6 py-5 md:py-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <h3 className="font-heading text-base md:text-lg font-bold text-brand-navy group-hover:text-teal-aa transition-colors">{item.q}</h3>
                    <svg aria-hidden="true" className="w-5 h-5 shrink-0 text-slate-400 transition-transform duration-300 group-open:rotate-180 group-open:text-teal-aa" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7.5l5 5 5-5" /></svg>
                  </summary>
                  <p className="px-6 pb-6 pr-12 text-base md:text-lg leading-relaxed text-slate-600">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Closing: a full-width navy band with the tagline and the four buttons. */}
        <section className="relative overflow-hidden bg-brand-navy text-white py-16 md:py-20">
          <div aria-hidden="true" className="absolute inset-0 opacity-20 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="relative max-w-[1200px] mx-auto px-6 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <p className="lg:col-span-6 font-heading text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-white">{t.tagline}</p>
            <div className="lg:col-span-6 flex flex-wrap lg:justify-end gap-3">
              {actions.map((action) => (
                <a
                  key={action.path}
                  href={href(action.path)}
                  data-analytics-click={action.label}
                  className={
                    action.primary
                      ? "inline-flex items-center justify-center min-h-12 px-6 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold transition-colors"
                      : "inline-flex items-center justify-center min-h-12 px-6 rounded-full border border-white/40 hover:bg-white hover:text-brand-navy text-white font-semibold transition-colors"
                  }
                >
                  {action.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData).replace(/</g, "\\u003c") }} />
      </main>

      <Footer />
    </VariantProvider>
  );
}
