"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useHref, useT } from "@/i18n/LocaleProvider";
import { PRODUCTS, productPath } from "@/lib/catalog";

// Four flagship products on the homepage, one from each platform: feed hygiene (MaxDmold, FeedGenie Prime),
// bio-trace minerals (MinBioZen) and rumen bypass (MethioWiz). Cards as on the products page.
const FLAGSHIPS = ["MaxDmold", "FeedGenie Prime", "MinBioZen", "MethioWiz"];

const CATEGORY_STYLE: Record<string, string> = {
  "Mono-gastric": "bg-orange-50/50 border-orange-150 text-brand-orange-aa",
  Ruminants: "bg-blue-50 border-blue-150 text-blue-700",
  "Value Addition": "bg-emerald-50 border-emerald-150 text-emerald-700",
};

export default function FlagshipProducts() {
  const messages = useT();
  const t = messages.home.flagship;
  const p = messages.products;
  const href = useHref();
  const reduce = useReducedMotion();
  const products = FLAGSHIPS.map((name) => {
    const index = PRODUCTS.findIndex((product) => product.name === name);
    return { ...PRODUCTS[index], tagline: p.items[index]?.tagline };
  }).filter((product) => product.name);

  return (
    <section aria-labelledby="flagship-title" className="bg-slate-50 border-y border-slate-200 py-16 md:py-24 lg:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center">
          <span className="text-teal-aa text-sm lg:text-base font-semibold tracking-widest uppercase block mb-3">{t.kicker}</span>
          <h2 id="flagship-title" className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-brand-navy">{t.title}</h2>
        </div>

        {/* Phones: a row to swipe through, the next card showing at the edge. */}
        <ul className="flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-6 px-6 scroll-px-6 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 sm:pb-0 sm:overflow-visible sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 mt-8 md:mt-12">
          {products.map((product, i) => (
            <motion.li key={product.name} className="h-full w-[78%] shrink-0 snap-start sm:w-auto"
              initial={{ opacity: 0, y: reduce ? 0 : 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.25, 0.1, 0, 1] }}>
              <a href={href(productPath(product.name))} data-analytics-click={product.name}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
                <div className="relative aspect-video overflow-hidden bg-slate-100 border-b border-slate-200/60">
                  {product.banner && <Image src={product.banner} alt={`${product.name} ${p.bannerAlt}`} fill sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <span className={`self-start px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${CATEGORY_STYLE[product.category] ?? CATEGORY_STYLE["Value Addition"]}`}>
                    {p.categories[product.category as keyof typeof p.categories]}
                  </span>
                  <h3 className="font-heading text-lg font-bold text-brand-navy leading-tight group-hover:text-brand-orange-aa transition-colors">{product.name}</h3>
                  {product.tagline && <p className="text-sm text-slate-600 leading-relaxed">{product.tagline}</p>}
                  <span className="mt-auto pt-2 inline-flex items-center gap-1.5 min-h-11 text-brand-orange-aa text-sm font-bold">
                    {p.viewProduct} <span aria-hidden="true">→</span>
                  </span>
                </div>
              </a>
            </motion.li>
          ))}
        </ul>

        <div className="flex justify-center mt-10">
          <a href={href("/products")} data-analytics-click={p.allProducts}
            className="group inline-flex items-center gap-2 min-h-12 px-6 rounded-full border border-brand-navy/25 text-brand-navy font-semibold hover:bg-brand-navy hover:text-white transition-colors">
            {p.allProducts}
            <svg aria-hidden="true" className="w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h12M11 5l5 5-5 5" /></svg>
          </a>
        </div>
      </div>
    </section>
  );
}
