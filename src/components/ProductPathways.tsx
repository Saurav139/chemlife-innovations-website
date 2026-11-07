"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Images } from "@/lib/assets";
import { PRODUCTS, productPath } from "@/lib/catalog";
import { useHref, useT } from "@/i18n/LocaleProvider";
import { REVEAL_VIEWPORT } from "@/lib/reveal";

const easeOut = [0.25, 0.1, 0, 1] as const;

// One card per species group, in the order of the language file (home.pathways.items). The category names are the
// Products page's filter values; the photo descriptions are the first of each group's in home.whoWeAre.cards.
const groups = [
  { category: "Mono-gastric", image: Images.gallery.rotate11 },
  { category: "Ruminants", image: Images.gallery.rotate21 },
  { category: "Value Addition", image: Images.research.pellets },
] as const;

const fill = (template: string, count: number) => template.replace("{count}", String(count));

/**
 * Find the right product: a buyer arrives with animals and a problem, not a product name. Each card names the
 * animals, what the group's products help with, and the products themselves. The whole card opens the Products
 * page filtered to that group (through its "See all" link, stretched over the card); each product name opens
 * that product's own page.
 */
export default function ProductPathways() {
  const messages = useT();
  const t = messages.home.pathways;
  const photoAlts = messages.home.whoWeAre.cards;
  const href = useHref();

  return (
    <section id="products" aria-labelledby="pathways-title" className="bg-[#faf8f5] py-16 md:py-24 lg:py-28 scroll-mt-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
          <div className="max-w-2xl">
            <span className="text-teal-aa text-sm lg:text-base font-semibold tracking-widest uppercase block mb-3">{t.kicker}</span>
            <h2 id="pathways-title" className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-brand-navy">
              {t.title}
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed mt-4">{t.intro}</p>
          </div>
          <Link
            href={href("/products")}
            className="inline-flex items-center gap-2 min-h-12 px-6 rounded-full border-2 border-brand-navy text-brand-navy font-semibold hover:bg-brand-navy hover:text-white transition-colors shrink-0 self-start md:self-auto"
          >
            {t.allProducts}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {groups.map((group, i) => {
            const products = PRODUCTS.filter((p) => p.category === group.category);
            const shown = products.slice(0, 4);
            const copy = t.items[i];
            return (
              <motion.article
                key={group.category}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={REVEAL_VIEWPORT}
                transition={{ duration: 0.5, delay: i * 0.1, ease: easeOut }}
                aria-labelledby={`pathway-${i}`}
                className="group relative flex flex-col h-full rounded-2xl overflow-hidden bg-white border border-slate-200 hover:border-brand-orange/50 hover:shadow-xl hover:-translate-y-1 focus-within:border-brand-orange/50 focus-within:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={group.image}
                    alt={photoAlts[i].alts[0]}
                    fill
                    sizes="(min-width: 1024px) 384px, (min-width: 768px) 33vw, 100vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 via-transparent to-transparent" />
                  <span className="absolute left-4 bottom-4 inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-brand-navy shadow-sm">
                    {fill(t.count, products.length)}
                  </span>
                </div>
                <div className="flex flex-col flex-1 p-6 lg:p-7">
                  <h3 id={`pathway-${i}`} className="font-heading text-xl lg:text-2xl font-bold text-brand-navy group-hover:text-brand-orange-aa transition-colors">
                    {copy.title}
                  </h3>
                  <p className="text-sm text-slate-aa mt-1">{copy.who}</p>

                  <p className="text-xs font-semibold tracking-widest uppercase text-teal-aa mt-5">{t.solves}</p>
                  <p className="text-slate-700 leading-relaxed mt-1">{copy.solves}</p>

                  <p className="text-xs font-semibold tracking-widest uppercase text-teal-aa mt-5">{t.includes}</p>
                  {/* Above the stretched link (z-10), so each name opens its own product page. */}
                  <ul className="relative z-10 flex flex-wrap gap-2 mt-2">
                    {shown.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={href(productPath(p.name))}
                          data-analytics-click={`Home products: ${p.name}`}
                          className="inline-flex min-h-8 items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-brand-navy hover:bg-brand-navy hover:text-white transition-colors"
                        >
                          {p.name}
                        </Link>
                      </li>
                    ))}
                    {products.length > shown.length && (
                      <li className="inline-flex min-h-8 items-center px-1 text-sm font-medium text-slate-aa">+{products.length - shown.length}</li>
                    )}
                  </ul>

                  {/* Stretched over the whole card (after:inset-0), so a click anywhere else opens the filtered list. */}
                  <Link
                    href={href(`/products?category=${encodeURIComponent(group.category)}`)}
                    data-analytics-click={`Home products: ${group.category}`}
                    className="mt-auto pt-6 inline-flex items-center gap-2 font-semibold text-brand-orange-aa after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-teal-aa focus-visible:after:outline-offset-2"
                  >
                    {fill(t.seeAll, products.length)}
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>

        <p className="mt-10 text-center text-slate-700">
          {t.notSure}{" "}
          <Link
            href={href("/contact?type=nutritionist")}
            className="font-semibold text-brand-orange-aa underline underline-offset-4 hover:text-brand-orange-aa-hover"
          >
            {messages.home.talkToNutritionist}
          </Link>
        </p>
      </div>
    </section>
  );
}
