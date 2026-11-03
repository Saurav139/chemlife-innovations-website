"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import { useHref, useT } from "@/i18n/LocaleProvider";

// Who We Are in full, from the homepage's "More about who we are" button: the introduction, the facts at a glance
// (Leadership across the bottom, with the directors' experience) and the four questions, then the four buttons.

export default function WhoWeArePage() {
  const t = useT().home.whoWeAre;
  const href = useHref();
  const actions = [
    { label: t.exploreProducts, path: "/products", primary: true },
    { label: t.seeResearch, path: "/research" },
    { label: t.meetLeadership, path: "/about" },
    { label: t.requestDossier, path: "/contact?type=dossier" },
  ];
  const last = t.facts.length - 1;
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
        <section className="pt-26 md:pt-32 lg:pt-36 pb-12 md:pb-16 bg-brand-navy text-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <span className="text-teal-aa-light text-sm lg:text-base font-semibold tracking-widest uppercase">{t.kicker}</span>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white mt-3 max-w-4xl">{t.title}</h1>
            <p className="text-lg text-white/80 leading-relaxed mt-6 max-w-3xl">{t.intro}</p>
          </div>
        </section>

        <section aria-labelledby="facts-title" className="py-16 md:py-24">
          <div className="max-w-[1200px] mx-auto px-6">
            <h2 id="facts-title" className="font-heading text-2xl md:text-3xl font-bold text-brand-navy">{t.factsTitle}</h2>
            <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 rounded-3xl overflow-hidden mt-8 border border-slate-200">
              {t.facts.map((fact, i) => (
                <div key={fact.label} className={`bg-white p-6 ${i === last ? "sm:col-span-2 lg:col-span-3" : ""}`}>
                  <dt className="text-xs font-bold uppercase tracking-wider text-teal-aa">{fact.label}</dt>
                  <dd className="mt-2 leading-relaxed text-brand-navy">
                    {fact.value}
                    {i === last && <span className="block mt-2 text-slate-600">{t.leadershipCaption}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section aria-labelledby="faq-title" className="pb-16 md:pb-24">
          <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <h2 id="faq-title" className="font-heading text-2xl md:text-3xl font-bold text-brand-navy">{t.faqTitle}</h2>
              <p className="font-heading text-xl md:text-2xl font-bold text-brand-orange-aa mt-6">{t.tagline}</p>
              <div className="flex flex-wrap gap-3 mt-8">
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
            {/* Native disclosure boxes, one open at a time: every answer is in the page even while closed. */}
            <div className="lg:col-span-8 divide-y divide-slate-200 border-y border-slate-200">
              {t.faq.map((item, i) => (
                <details key={item.q} name="who-we-are-questions" open={i === 0} className="group">
                  <summary className="flex items-center justify-between gap-6 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden font-heading text-lg md:text-xl font-bold text-brand-navy hover:text-brand-orange-aa">
                    <h3>{item.q}</h3>
                    <span aria-hidden="true" className="grid place-items-center w-9 h-9 rounded-full shrink-0 text-xl bg-slate-100 text-brand-orange-aa transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="pb-6 pr-12 leading-relaxed text-slate-600">{item.a}</p>
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
