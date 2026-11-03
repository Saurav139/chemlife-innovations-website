"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import { useHref, useT } from "@/i18n/LocaleProvider";
import { Images } from "@/lib/assets";

// Who We Are in full, from the homepage's "More about who we are" button, set like a magazine feature: the
// introduction beside the founders' photo with the headline figures, the facts as a numbered list, the four
// directors, the questions, and a closing panel with the tagline and the four buttons.

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
      initial={{ opacity: 0, y: reduce ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.7, delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

const sectionLabel = "inline-flex items-center gap-3 text-teal-aa text-xs md:text-sm font-semibold tracking-[0.2em] uppercase";

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
        {/* Opening: on a warm paper ground, the introduction and the headline figures beside the founders' photo. */}
        <section className="bg-[#f6f4ef] pt-28 md:pt-36 lg:pt-44 pb-20 md:pb-28">
          <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-12 gap-14 lg:gap-16 items-center">
            <Reveal className="lg:col-span-7">
              <span className={sectionLabel}>
                <span aria-hidden="true" className="w-10 h-px bg-teal-aa" />
                {t.kicker}
              </span>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.75rem] font-bold leading-[1.06] tracking-tight text-brand-navy mt-6">{t.title}</h1>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed mt-8 max-w-2xl">{t.intro}</p>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 mt-12 pt-8 border-t border-brand-navy/15">
                {FIGURES.map((figure, i) => (
                  <div key={figure} className={`flex flex-col-reverse ${i > 0 ? "sm:border-l sm:border-brand-navy/15 sm:pl-6" : ""} ${i % 2 === 1 ? "max-sm:border-l max-sm:border-brand-navy/15 max-sm:pl-6" : ""}`}>
                    <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mt-2">{messages.home.stats[i]}</dt>
                    <dd className="font-heading text-3xl md:text-4xl font-bold text-brand-navy tabular-nums">
                      {figure.replace("+", "")}<span className="text-teal-aa">+</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
            <Reveal delay={0.12} className="lg:col-span-5">
              {/* The photo in an offset frame. */}
              <div className="relative">
                <div aria-hidden="true" className="absolute -inset-0 translate-x-4 translate-y-4 md:translate-x-6 md:translate-y-6 rounded-[2rem] border border-brand-navy/20" />
                <div className="relative aspect-[4/3] lg:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-xl shadow-brand-navy/10">
                  <Image src={Images.people.foundersNew} alt={messages.about.foundersAlt} fill priority sizes="(min-width: 1024px) 440px, 100vw" className="object-cover" />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* At a glance: the heading stays beside the numbered facts as they pass. */}
        <section aria-labelledby="facts-title" className="py-24 md:py-32">
          <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <span className={sectionLabel}><span aria-hidden="true" className="w-10 h-px bg-teal-aa" />01–{String(facts.length).padStart(2, "0")}</span>
                <h2 id="facts-title" className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-brand-navy mt-5">{t.factsTitle}</h2>
              </div>
            </div>
            <dl className="lg:col-span-8 border-t border-slate-200">
              {facts.map((fact, i) => (
                <Reveal key={fact.label} className="grid grid-cols-[2.5rem_minmax(0,1fr)] md:grid-cols-[3.5rem_13rem_minmax(0,1fr)] gap-x-6 gap-y-2 py-7 md:py-8 border-b border-slate-200">
                  <span aria-hidden="true" className="font-heading text-sm font-semibold text-slate-400 tabular-nums md:pt-1">{String(i + 1).padStart(2, "0")}</span>
                  <dt className="text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-teal-aa md:pt-1">{fact.label}</dt>
                  <dd className="col-start-2 md:col-start-3 text-lg md:text-xl leading-relaxed text-brand-navy">{fact.value}</dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>

        {/* Leadership: the four directors, then their combined experience as a pull quote. */}
        <section aria-labelledby="leadership-title" className="bg-[#f6f4ef] py-24 md:py-32">
          <div className="max-w-[1200px] mx-auto px-6">
            <span className={sectionLabel}><span aria-hidden="true" className="w-10 h-px bg-teal-aa" />{leadership.label}</span>
            <h2 id="leadership-title" className="sr-only">{leadership.label}</h2>
            {people ? (
              <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
                {people.map((person, i) => (
                  <li key={person.name}>
                    <Reveal delay={i * 0.06} className="h-full rounded-3xl bg-white p-7 shadow-sm shadow-brand-navy/5 ring-1 ring-brand-navy/5">
                      <span aria-hidden="true" className="grid place-items-center w-14 h-14 rounded-full bg-brand-navy text-white font-heading text-lg font-bold tracking-wide">{initials(person.name)}</span>
                      <p className="font-heading text-lg font-bold text-brand-navy mt-6">{person.name}</p>
                      <p className="text-slate-600 leading-relaxed mt-1">{person.role}</p>
                    </Reveal>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-lg leading-relaxed text-brand-navy mt-8">{leadership.value}</p>
            )}
            <Reveal>
              <figure className="relative mt-16 md:mt-20 max-w-4xl">
                <svg aria-hidden="true" className="w-12 h-12 text-teal-aa/30" viewBox="0 0 48 48" fill="currentColor">
                  <path d="M20 10c-8 3-13 10-13 19v9h13V25h-7c0-6 3-10 9-12zm22 0c-8 3-13 10-13 19v9h13V25h-7c0-6 3-10 9-12z" />
                </svg>
                <blockquote className="font-heading text-2xl md:text-3xl leading-snug text-brand-navy mt-4">{t.leadershipCaption}</blockquote>
              </figure>
            </Reveal>
          </div>
        </section>

        {/* Questions: the heading stays beside the answers as they pass. */}
        <section aria-labelledby="faq-title" className="py-24 md:py-32">
          <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <span className={sectionLabel}><span aria-hidden="true" className="w-10 h-px bg-teal-aa" />01–{String(t.faq.length).padStart(2, "0")}</span>
                <h2 id="faq-title" className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-brand-navy mt-5">{t.faqTitle}</h2>
              </div>
            </div>
            {/* Native disclosure boxes, one open at a time: every answer is in the page even while closed. */}
            <div className="lg:col-span-8 border-t border-slate-200">
              {t.faq.map((item, i) => (
                <details key={item.q} name="who-we-are-questions" open={i === 0} className="group border-b border-slate-200">
                  <summary className="flex items-start justify-between gap-6 py-7 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <h3 className="font-heading text-lg md:text-xl font-bold text-brand-navy group-hover:text-brand-orange-aa transition-colors">{item.q}</h3>
                    <span aria-hidden="true" className="grid place-items-center w-10 h-10 rounded-full shrink-0 border border-slate-300 text-brand-orange-aa transition-all duration-300 group-open:rotate-45 group-open:bg-brand-orange-aa group-open:border-brand-orange-aa group-open:text-white">
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
                    </span>
                  </summary>
                  <p className="pb-8 pr-14 text-lg leading-relaxed text-slate-600">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Closing: the tagline and the four buttons on a navy panel. */}
        <section className="pb-24 md:pb-32">
          <div className="max-w-[1200px] mx-auto px-6">
            <Reveal>
              <div className="relative overflow-hidden rounded-[2rem] bg-brand-navy px-8 py-14 md:px-16 md:py-20 text-center">
                <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(40rem_20rem_at_50%_0%,rgba(26,219,195,0.18),transparent_70%)]" />
                <p className="relative font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white max-w-3xl mx-auto">{t.tagline}</p>
                <div className="relative flex flex-wrap justify-center gap-3 mt-10">
                  {actions.map((action) => (
                    <a
                      key={action.path}
                      href={href(action.path)}
                      data-analytics-click={action.label}
                      className={
                        action.primary
                          ? "inline-flex items-center justify-center min-h-12 px-7 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold transition-colors"
                          : "inline-flex items-center justify-center min-h-12 px-7 rounded-full border-2 border-white/40 hover:bg-white hover:text-brand-navy text-white font-semibold transition-colors"
                      }
                    >
                      {action.label}
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData).replace(/</g, "\\u003c") }} />
      </main>

      <Footer />
    </VariantProvider>
  );
}
