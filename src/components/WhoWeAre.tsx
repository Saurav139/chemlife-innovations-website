"use client";

import { motion } from "framer-motion";
import { PRODUCTS } from "@/lib/catalog";
import { useHref, useT } from "@/i18n/LocaleProvider";

export default function WhoWeAre() {
  const t = useT().home.whoWeAre;
  const href = useHref();

  return (
    <section className="bg-white py-16 md:py-24 lg:py-32 border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Title Block */}
        <div className="text-center mb-10 md:mb-14">
          <span className="text-teal-aa text-sm lg:text-base font-semibold tracking-widest uppercase block mb-2">
            {t.kicker}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-brand-navy font-bold leading-tight max-w-3xl mx-auto">
            {t.title}
          </h2>
        </div>

        {/* Phones: introduction, then the proof strip (so it's high on the screen), then what we do and the buttons.
            Desktop: the introduction and buttons on the left, what we do on the right, the proof strip across. */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0, 1] }}
            className="lg:col-start-1 lg:row-start-1"
          >
            <p className="text-brand-navy text-lg md:text-xl leading-relaxed">{t.intro}</p>
          </motion.div>

          <dl className="order-2 lg:order-none lg:col-span-2 lg:row-start-3 grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-slate-200 bg-slate-200">
            {t.stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse justify-end p-5 md:p-6 text-center bg-slate-50">
                <dt className="text-slate-600 text-sm leading-snug mt-1">{stat.label}</dt>
                <dd className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-brand-orange-aa whitespace-nowrap">
                  {stat.value.replace("{products}", String(PRODUCTS.length))}
                </dd>
              </div>
            ))}
          </dl>

          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0, 1] }}
            className="order-3 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2 space-y-6"
          >
            {t.pillars.map((pillar) => (
              <li key={pillar.title}>
                <h3 className="font-heading text-lg md:text-xl font-bold text-brand-navy">{pillar.title}</h3>
                <p className="text-slate-600 leading-relaxed mt-1">{pillar.text}</p>
              </li>
            ))}
          </motion.ul>

          <div className="order-4 lg:order-none lg:col-start-1 lg:row-start-2 lg:self-end">
            <p className="text-lg">
              <span lang="hi-Latn" className="font-semibold italic text-brand-orange-aa">{t.motto}</span>
              {t.mottoTranslation && <span className="italic text-brand-navy"> {t.mottoTranslation}</span>}
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <a
                href={href("/research")}
                data-analytics-click="See our science"
                className="inline-flex items-center justify-center min-h-12 px-7 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold transition-colors"
              >
                {t.seeScience}
              </a>
              <a
                href={href("/contact?type=dossier")}
                data-analytics-click="Request a technical dossier"
                className="inline-flex items-center justify-center min-h-12 px-7 rounded-full border-2 border-brand-navy/20 hover:border-brand-navy text-brand-navy font-semibold transition-colors"
              >
                {t.requestDossier}
              </a>
            </div>
          </div>

          <p className="order-2 lg:order-none lg:col-span-2 lg:row-start-4 -mt-3 lg:-mt-4 text-sm text-slate-600 text-center">{t.statsCaption}</p>
        </div>
      </div>
    </section>
  );
}
