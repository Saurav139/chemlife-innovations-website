"use client";

import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import { useHref, useT } from "@/i18n/LocaleProvider";
import { Images } from "@/lib/assets";

// Who We Are in full, from the homepage's "More about who we are" button: the introduction beside the founders'
// photo, the facts at a glance as an editorial list, the leadership, and the four questions with the four buttons.

/** "Dr Radhakrishna PM (Chairman and MD), Dr Sharada KC (Director, Technical), …" → each director's name and role.
 *  The same pattern in every language; anything else is shown as it is written. */
function directors(value: string): { name: string; role: string }[] | null {
  const people = value.split(/\),\s*/).map((part) => part.replace(/\)$/, "").match(/^(.+?)\s*\((.+)$/));
  return people.every(Boolean) ? people.map((m) => ({ name: m![1], role: m![2] })) : null;
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
        {/* Opening: the introduction beside the founders' photo, on a softly lit navy ground. */}
        <section className="relative overflow-hidden bg-brand-navy text-white pt-28 md:pt-36 lg:pt-40 pb-16 md:pb-24">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(60rem_30rem_at_85%_0%,rgba(26,219,195,0.16),transparent_65%),radial-gradient(40rem_24rem_at_0%_100%,rgba(232,97,74,0.12),transparent_70%)]" />
          <div className="relative max-w-[1200px] mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-3 text-teal-aa-light text-sm font-semibold tracking-widest uppercase">
                <span aria-hidden="true" className="w-8 h-px bg-teal-aa-light" />
                {t.kicker}
              </span>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] text-white mt-5">{t.title}</h1>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed mt-8 max-w-2xl">{t.intro}</p>
            </div>
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] lg:aspect-[4/5] rounded-[2rem] overflow-hidden ring-1 ring-white/15 shadow-2xl shadow-black/30">
                <Image src={Images.people.foundersNew} alt={messages.about.foundersAlt} fill priority sizes="(min-width: 1024px) 460px, 100vw" className="object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* At a glance: label on the left, the detail on the right, hairlines between. */}
        <section aria-labelledby="facts-title" className="py-20 md:py-28">
          <div className="max-w-[1100px] mx-auto px-6">
            <h2 id="facts-title" className="font-heading text-3xl md:text-4xl font-bold text-brand-navy">{t.factsTitle}</h2>
            <dl className="mt-10 border-t border-slate-200">
              {facts.map((fact) => (
                <div key={fact.label} className="grid md:grid-cols-[15rem_minmax(0,1fr)] gap-x-12 gap-y-2 py-6 md:py-7 border-b border-slate-200">
                  <dt className="text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-teal-aa md:pt-1">{fact.label}</dt>
                  <dd className="text-lg md:text-xl leading-relaxed text-brand-navy">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Leadership: the four directors, then their combined experience. */}
        <section aria-labelledby="leadership-title" className="bg-slate-50 py-20 md:py-28">
          <div className="max-w-[1100px] mx-auto px-6">
            <h2 id="leadership-title" className="font-heading text-3xl md:text-4xl font-bold text-brand-navy">{leadership.label}</h2>
            {people ? (
              <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
                {people.map((person) => (
                  <li key={person.name} className="rounded-2xl bg-white border border-slate-200 p-6">
                    <span aria-hidden="true" className="block w-8 h-0.5 bg-brand-orange-aa" />
                    <p className="font-heading text-lg font-bold text-brand-navy mt-4">{person.name}</p>
                    <p className="text-slate-600 leading-relaxed mt-1">{person.role}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-lg leading-relaxed text-brand-navy mt-8">{leadership.value}</p>
            )}
            <p className="font-heading text-xl md:text-2xl leading-snug text-brand-navy/85 mt-12 max-w-3xl border-l-2 border-teal-aa pl-6">{t.leadershipCaption}</p>
          </div>
        </section>

        {/* Questions: the heading, tagline and buttons stay in view beside the answers on wide screens. */}
        <section aria-labelledby="faq-title" className="py-20 md:py-28">
          <div className="max-w-[1100px] mx-auto px-6 grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <h2 id="faq-title" className="font-heading text-3xl md:text-4xl font-bold text-brand-navy">{t.faqTitle}</h2>
                <p className="font-heading text-xl md:text-2xl font-bold text-brand-orange-aa mt-6">{t.tagline}</p>
                <div className="flex flex-wrap lg:flex-col lg:items-start gap-3 mt-8">
                  {actions.map((action) => (
                    <a
                      key={action.path}
                      href={href(action.path)}
                      data-analytics-click={action.label}
                      className={
                        action.primary
                          ? "inline-flex items-center justify-center min-h-12 px-6 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold transition-colors"
                          : "inline-flex items-center justify-center min-h-12 px-6 rounded-full border-2 border-brand-navy/20 hover:border-brand-navy text-brand-navy font-semibold transition-colors"
                      }
                    >
                      {action.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            {/* Native disclosure boxes, one open at a time: every answer is in the page even while closed. */}
            <div className="lg:col-span-8 border-t border-slate-200">
              {t.faq.map((item, i) => (
                <details key={item.q} name="who-we-are-questions" open={i === 0} className="group border-b border-slate-200">
                  <summary className="flex items-start justify-between gap-6 py-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <h3 className="font-heading text-lg md:text-xl font-bold text-brand-navy group-hover:text-brand-orange-aa transition-colors">{item.q}</h3>
                    <span aria-hidden="true" className="grid place-items-center w-9 h-9 rounded-full shrink-0 border border-slate-300 text-brand-orange-aa transition-transform duration-300 group-open:rotate-45">
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
                    </span>
                  </summary>
                  <p className="pb-7 pr-12 text-lg leading-relaxed text-slate-600">{item.a}</p>
                </details>
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
