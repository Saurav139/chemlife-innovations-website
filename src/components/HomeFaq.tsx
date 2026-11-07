"use client";

import Link from "next/link";
import { useHref, useT } from "@/i18n/LocaleProvider";

/**
 * Questions buyers ask: the Who We Are page's questions and answers, on the homepage where a first-time visitor has
 * them. Plain <details>, so they work before JavaScript loads and are readable by search engines.
 */
export default function HomeFaq() {
  const messages = useT();
  const t = messages.home.faq;
  const faq = messages.home.whoWeAre.faq;
  const href = useHref();

  return (
    <section aria-labelledby="home-faq-title" className="bg-[#faf8f5] py-16 md:py-24 lg:py-28 border-t border-slate-200/80">
      <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-12 gap-8 lg:gap-16">
        <div className="lg:col-span-4">
          <span className="text-teal-aa text-sm lg:text-base font-semibold tracking-widest uppercase block mb-3">{t.kicker}</span>
          <h2 id="home-faq-title" className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-brand-navy">
            {t.title}
          </h2>
          <Link
            href={href("/who-we-are")}
            className="inline-flex items-center gap-2 mt-6 font-semibold text-brand-orange-aa hover:text-brand-orange-aa-hover underline-offset-4 hover:underline"
          >
            {t.more}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="lg:col-span-8 border-t border-slate-200">
          {faq.map((item, i) => (
            <details key={item.q} className="group border-b border-slate-200" open={i === 0}>
              <summary className="flex items-center justify-between gap-6 cursor-pointer list-none min-h-14 py-4 font-heading text-lg md:text-xl font-semibold text-brand-navy [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  className="shrink-0 w-9 h-9 rounded-full border border-slate-300 flex items-center justify-center text-brand-navy transition-transform duration-300 group-open:rotate-45 group-open:bg-brand-navy group-open:text-white"
                  aria-hidden="true"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14m-7-7h14" />
                  </svg>
                </span>
              </summary>
              <p className="pb-6 pr-12 md:pr-16 text-slate-700 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
