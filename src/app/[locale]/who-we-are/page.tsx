"use client";

import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import { VariantProvider } from "@/context/VariantContext";
import { useHref, useT } from "@/i18n/LocaleProvider";
import { Images } from "@/lib/assets";

// Who We Are in full, from the homepage's "More about who we are" button, in the site's own page style (as on
// Research): a navy photo hero with the headline figures, the facts as cards, the four directors, the questions,
// and a navy panel with the tagline and the four buttons.

// The homepage hero's figures, with their labels in the language file (home.stats), in this order.
const FIGURES = ["30", "16", "22", "7"];

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

// The site's section heading: a large navy title, centred.
const h2 = "font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-brand-navy leading-tight";

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
        {/* Hero, as on the site's other pages: the founders' photo under a navy wash, the heading, the introduction and
            the headline figures. A plain section, so it shows at once. */}
        <section className="pt-26 md:pt-32 pb-12 md:pb-20 lg:pt-36 lg:pb-24 text-white relative overflow-hidden bg-brand-navy">
          <div className="absolute inset-0 z-0">
            <Image src={Images.people.foundersNew} alt={messages.about.foundersAlt} fill sizes="100vw" priority fetchPriority="high" className="object-cover object-[70%_40%] opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/80 to-brand-navy/30" />
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>

          <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full text-center md:text-left">
            <span className="text-teal-aa-light text-sm font-semibold tracking-widest uppercase block mb-3">{t.kicker}</span>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white max-w-3xl md:mx-0 mx-auto">{t.title}</h1>
            <p className="text-white/85 text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl font-light mt-4 md:mx-0 mx-auto">{t.intro}</p>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mt-10 md:mt-12 mx-auto md:mx-0">
              {FIGURES.map((figure, i) => (
                <div key={figure} className="flex flex-col-reverse items-center md:items-start">
                  <dt className="text-white/70 text-xs md:text-sm font-semibold uppercase tracking-wider mt-1">{messages.home.stats[i]}</dt>
                  <dd className="font-heading text-3xl md:text-4xl font-bold text-teal-400 tabular-nums">{figure}+</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* At a glance: the facts as cards. */}
        <SectionWrapper className="py-16 md:py-24 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-10 md:mb-14">
              <h2 className={h2}>{t.factsTitle}</h2>
            </div>
            <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {facts.map((fact) => (
                <div key={fact.label} className="border-2 border-slate-200 rounded-2xl bg-slate-50/50 hover:border-brand-orange/40 transition-colors duration-300 p-6">
                  <dt className="text-xs font-bold uppercase tracking-wider text-teal-aa">{fact.label}</dt>
                  <dd className="mt-2 leading-relaxed text-brand-navy">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </SectionWrapper>

        {/* Leadership: the four directors, then their combined experience. */}
        <SectionWrapper className="py-16 md:py-24 bg-slate-50">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-10 md:mb-14">
              <h2 className={h2}>{leadership.label}</h2>
            </div>
            {people ? (
              <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                {people.map((person) => (
                  <li key={person.name} className="border-2 border-slate-200 rounded-2xl bg-white p-6 text-center">
                    <span aria-hidden="true" className="mx-auto grid place-items-center w-16 h-16 rounded-full bg-brand-navy text-white font-heading text-xl font-bold ring-4 ring-teal-400/20">{initials(person.name)}</span>
                    <p className="font-heading text-lg font-bold text-brand-navy mt-5">{person.name}</p>
                    <p className="text-slate-600 text-sm leading-relaxed mt-1">{person.role}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-lg leading-relaxed text-brand-navy text-center">{leadership.value}</p>
            )}
            <p className="text-slate-600 text-base md:text-lg leading-relaxed text-center max-w-3xl mx-auto mt-10">{t.leadershipCaption}</p>
          </div>
        </SectionWrapper>

        {/* Questions. Native disclosure boxes, one open at a time: every answer is in the page even while closed. */}
        <SectionWrapper className="py-16 md:py-24 bg-white">
          <div className="max-w-[900px] mx-auto px-6">
            <div className="text-center mb-10 md:mb-14">
              <h2 className={h2}>{t.faqTitle}</h2>
            </div>
            <div className="space-y-4">
              {t.faq.map((item, i) => (
                <details key={item.q} name="who-we-are-questions" open={i === 0} className="group border-2 border-slate-200 rounded-2xl bg-slate-50/50 open:bg-white open:border-brand-orange/40 transition-colors">
                  <summary className="flex items-center justify-between gap-6 px-6 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <h3 className="font-heading text-lg md:text-xl font-bold text-brand-navy">{item.q}</h3>
                    <span aria-hidden="true" className="grid place-items-center w-9 h-9 rounded-full shrink-0 bg-white border border-slate-200 text-brand-orange-aa transition-transform duration-300 group-open:rotate-45">
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
                    </span>
                  </summary>
                  <p className="px-6 pb-6 pr-14 leading-relaxed text-slate-600">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </SectionWrapper>

        {/* A next step, as on Research: the tagline and the four buttons on a navy panel. */}
        <SectionWrapper className="pb-16 md:pb-24 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="rounded-2xl md:rounded-3xl bg-brand-navy text-white p-6 md:p-10 flex flex-col gap-6">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-white">{t.tagline}</h2>
              <div className="flex flex-wrap gap-3 shrink-0">
                {actions.map((action) => (
                  <a
                    key={action.path}
                    href={href(action.path)}
                    data-analytics-click={action.label}
                    className={
                      action.primary
                        ? "inline-flex items-center justify-center gap-2 min-h-12 px-7 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold transition-colors"
                        : "inline-flex items-center justify-center min-h-12 px-6 rounded-full border-2 border-white/40 hover:bg-white hover:text-brand-navy text-white font-semibold transition-colors"
                    }
                  >
                    {action.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </SectionWrapper>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData).replace(/</g, "\\u003c") }} />
      </main>

      <Footer />
    </VariantProvider>
  );
}
