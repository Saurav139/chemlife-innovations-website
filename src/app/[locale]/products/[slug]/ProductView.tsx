"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteSearch from "@/components/SiteSearch";
import { VariantProvider } from "@/context/VariantContext";
import { PRODUCTS, productPath } from "@/lib/catalog";
import { useHref, useT } from "@/i18n/LocaleProvider";

const easeOut = [0.25, 0.1, 0, 1] as const;

// The category's colours, as on the product cards.
const CATEGORY_TAG: Record<string, string> = {
  "Mono-gastric": "bg-orange-50 text-brand-orange-aa",
  Ruminants: "bg-blue-50 text-blue-700",
  "Value Addition": "bg-emerald-50 text-emerald-700",
};

/** One product's page: what it is, what it does, how to use it, and the other products for the same animals. */
export default function ProductView({ index }: { index: number }) {
  const all = useT();
  const t = all.products;
  const href = useHref();
  const product = { ...PRODUCTS[index], ...t.items[index] };
  const category = t.categories[product.category as keyof typeof t.categories];
  const related = PRODUCTS.map((p, i) => ({ ...p, ...t.items[i] })).filter((p) => p.category === product.category && p.id !== product.id);

  const emailHref = `mailto:innovate@chemlifeinnovations.com?subject=${encodeURIComponent(`Product Inquiry: ${product.name}`)}&body=${encodeURIComponent(
    `Hi ChemLife Innovations team,\n\nI am writing to inquire about ${product.name}. Please share technical datasheets, pricing, and packaging options.\n\nBest regards,\n[Your Name]\n[Your Company]`
  )}`;

  return (
    <VariantProvider>
      <Header />

      <main id="main" tabIndex={-1} className="bg-white min-h-screen text-brand-navy">
        {/* The product at a glance: shown at once (no fade-in), its picture is the page's largest paint. */}
        <section className="pt-26 md:pt-32 lg:pt-36 pb-12 md:pb-16 lg:pb-20 bg-brand-navy text-white">
          <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6">
              <nav aria-label="Breadcrumb" className="text-sm text-white/75 mb-5">
                <Link href={href("/products")} className="tap-target hover:text-white underline-offset-4 hover:underline">
                  {all.nav.products}
                </Link>
                <span aria-hidden="true" className="mx-2">/</span>
                <span aria-current="page" className="text-white">{product.name}</span>
              </nav>
              <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${CATEGORY_TAG[product.category]}`}>{category}</span>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mt-4 text-white">{product.name}</h1>
              {product.tagline && <p className="text-white/85 text-lg md:text-xl leading-relaxed mt-4 max-w-xl">{product.tagline}</p>}
              <div className="flex flex-wrap gap-3 mt-8">
                <a href={emailHref} className="inline-flex items-center justify-center gap-2 min-h-12 px-7 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold transition-colors">
                  {t.enquire} {product.name}
                </a>
                <Link href={href("/contact?type=nutritionist")} className="inline-flex items-center justify-center min-h-12 px-7 rounded-full border-2 border-white/80 text-white font-semibold hover:bg-white hover:text-brand-navy transition-colors">
                  {all.home.talkToNutritionist}
                </Link>
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-white">
                {product.banner ? (
                  <Image src={product.banner} alt={`${product.name} ${t.bannerAlt}`} fill priority sizes="(min-width: 1200px) 552px, (min-width: 1024px) 46vw, 100vw" className="object-cover" />
                ) : (
                  <Image src={product.icon} alt={`${product.name} ${t.iconAlt}`} fill priority sizes="200px" className="object-contain p-12" />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* The details: description, features and variants beside how it's used and packed */}
        <section className="py-12 md:py-20">
          <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-12 gap-10 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: easeOut }}
              className="lg:col-span-7 space-y-10"
            >
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-navy mb-4">{t.about}</h2>
                <p className="text-slate-700 text-base md:text-lg leading-relaxed whitespace-pre-line">{product.about}</p>
              </div>

              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-navy mb-4">{t.features}</h2>
                <ul className="space-y-3">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-slate-700 text-base md:text-lg">
                      <svg aria-hidden="true" className="w-5 h-5 text-brand-orange mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {product.variants && product.variants.length > 0 && (
                <div>
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-navy mb-4">{t.variants}</h2>
                  <ul className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <li key={variant} className="px-4 py-2 rounded-full bg-slate-100 text-brand-navy font-semibold">{variant}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: easeOut }}
              className="lg:col-span-5"
            >
              <div className="lg:sticky lg:top-32 rounded-2xl bg-slate-50 border border-slate-200 p-6 md:p-8">
                <h2 className="font-heading text-xl md:text-2xl font-bold text-brand-navy">{t.usage}</h2>
                <dl className="mt-5 space-y-5">
                  <div>
                    <dt className="text-sm font-semibold text-slate-aa">{t.inclusionRate}</dt>
                    <dd className="mt-1 text-brand-navy font-semibold whitespace-pre-line">{product.inclusionRate}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-semibold text-slate-aa">{t.packSize}</dt>
                    <dd className="mt-1 text-brand-navy font-semibold whitespace-pre-line">{product.packSize}</dd>
                  </div>
                </dl>
                <a href={emailHref} className="mt-8 w-full inline-flex items-center justify-center min-h-12 px-6 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold transition-colors">
                  {t.askAbout}
                </a>
              </div>
            </motion.aside>
          </div>
        </section>

        {/* Other products for the same animals */}
        {related.length > 0 && (
          <section className="py-12 md:py-20 bg-slate-50">
            <div className="max-w-[1200px] mx-auto px-6">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-8 md:mb-10">
                <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-brand-navy">{t.related}</h2>
                <Link href={href("/products")} className="tap-target text-brand-orange-aa font-semibold hover:underline underline-offset-4">
                  {t.allProducts} →
                </Link>
              </div>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.slice(0, 3).map((item) => (
                  <li key={item.id}>
                    <Link href={href(productPath(item.name))} className="group flex h-full flex-col rounded-2xl bg-white border border-slate-200 hover:border-brand-orange/40 overflow-hidden transition-colors">
                      <div className="relative aspect-video bg-white">
                        {item.banner ? (
                          <Image src={item.banner} alt="" fill sizes="(min-width: 1024px) 366px, (min-width: 640px) 50vw, 100vw" className="object-cover group-hover:scale-102 transition-transform duration-500" />
                        ) : (
                          <Image src={item.icon} alt="" fill sizes="80px" className="object-contain p-10" />
                        )}
                      </div>
                      <div className="p-5 flex flex-1 flex-col">
                        <h3 className="font-heading text-lg font-bold text-brand-navy group-hover:text-brand-orange-aa transition-colors">{item.name}</h3>
                        {item.tagline && <p className="text-slate-600 mt-1">{item.tagline}</p>}
                        <span className="mt-auto pt-4 text-brand-orange-aa text-sm font-bold">{t.viewProduct} →</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>

      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
