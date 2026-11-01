"use client";

import { motion } from "framer-motion";
import { useHref, useT } from "@/i18n/LocaleProvider";

const easeOut = [0.25, 0.1, 0, 1] as const;

export default function WhoWeAre() {
  const t = useT().home.whoWeAre;
  const href = useHref();

  const actions = [
    { label: t.exploreProducts, path: "/products", primary: true },
    { label: t.seeResearch, path: "/research" },
    { label: t.meetLeadership, path: "/about" },
    { label: t.requestDossier, path: "/contact?type=dossier" },
  ];

  return (
    <section className="bg-white py-16 md:py-24 lg:py-32 border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Title Block */}
        <div className="text-center mb-10 md:mb-14">
          <span className="text-teal-aa text-sm lg:text-base font-semibold tracking-widest uppercase block mb-2">
            {t.kicker}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-brand-navy font-bold leading-tight max-w-4xl mx-auto">
            {t.title}
          </h2>
          <p className="font-heading text-lg md:text-xl font-semibold italic text-brand-orange-aa mt-4">{t.tagline}</p>
        </div>

        {/* Desktop: the introduction and the facts on the left, the questions on the right. Phones: one after the other. */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="lg:col-span-7"
          >
            <p className="text-brand-navy text-lg md:text-xl leading-relaxed">{t.intro}</p>

            <dl className="mt-8 border-t border-slate-200">
              {t.facts.map((fact) => (
                <div key={fact.label} className="grid sm:grid-cols-[11rem_minmax(0,1fr)] gap-x-6 gap-y-1 py-3.5 border-b border-slate-200">
                  <dt className="text-sm font-semibold text-teal-aa">{fact.label}</dt>
                  <dd className="text-slate-700 leading-relaxed">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: easeOut }}
            className="lg:col-span-5 space-y-8"
          >
            {t.faq.map((item) => (
              <div key={item.q}>
                <h3 className="font-heading text-lg md:text-xl font-bold text-brand-navy">{item.q}</h3>
                <p className="text-slate-600 leading-relaxed mt-2">{item.a}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <p className="mt-12 md:mt-16 text-sm text-slate-600 text-center max-w-3xl mx-auto">{t.leadershipCaption}</p>

        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {actions.map((action) => (
            <a
              key={action.path}
              href={href(action.path)}
              data-analytics-click={action.label}
              className={
                action.primary
                  ? "inline-flex items-center justify-center min-h-12 px-7 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold transition-colors"
                  : "inline-flex items-center justify-center min-h-12 px-7 rounded-full border-2 border-brand-navy/20 hover:border-brand-navy text-brand-navy font-semibold transition-colors"
              }
            >
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
