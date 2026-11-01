"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteSearch from "@/components/SiteSearch";
import Icon from "@/components/site/Icon";
import { ArrowLink, Button, Reveal } from "@/components/site/ui";
import { VariantProvider } from "@/context/VariantContext";
import { PRODUCTS, productPath } from "@/lib/catalog";
import { useHref, useT } from "@/i18n/LocaleProvider";

/** One product's page, set out like a specification sheet: what it is, what it does, how it's used and packed. */
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

      <main id="main" tabIndex={-1} className="site-ui bg-page min-h-screen">
        {/* The product at a glance: shown at once (no fade-in), as its picture is the page's largest paint. */}
        <section className="paper relative bg-page pt-28 md:pt-36 lg:pt-40 pb-16 md:pb-24 overflow-hidden">
          <div className="container-site">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-line">
              <ol className="flex items-center gap-2 label-mono text-copy-dim">
                <li><Link href={href("/products")} className="inline-flex items-center min-h-11 -my-3 hover:text-ink">{all.nav.products}</Link></li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-ink">{product.name}</li>
              </ol>
              <p className="label-mono text-copy-dim"><span className="text-flame">No.</span> {String(product.id).padStart(2, "0")} / {String(PRODUCTS.length).padStart(2, "0")}</p>
            </nav>

            <div className="grid lg:grid-cols-12 gap-12 lg:gap-12 items-end mt-10 md:mt-14">
              <div className="lg:col-span-7">
                <p className="label-mono text-mint">{category}</p>
                <h1 className="font-display text-[3.2rem] leading-[0.95] sm:text-7xl lg:text-[6.5rem] tracking-[-0.03em] text-ink mt-5 break-words">{product.name}</h1>
                {product.tagline && <p className="font-display italic text-2xl md:text-3xl text-flame leading-snug mt-6 max-w-2xl">{product.tagline}</p>}
                <div className="flex flex-wrap gap-3 mt-10">
                  <Button href={emailHref} arrow>{t.enquire} {product.name}</Button>
                  <Button href={href("/contact?type=nutritionist")} variant="outline">{all.home.talkToNutritionist}</Button>
                </div>
              </div>
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-[4/5] rounded-t-full overflow-hidden bg-card-hi">
                  {product.banner
                    ? <Image src={product.banner} alt={`${product.name} ${t.bannerAlt}`} fill priority sizes="(min-width: 1280px) 480px, (min-width: 1024px) 40vw, 100vw" className="object-cover" />
                    : <Image src={product.icon} alt={`${product.name} ${t.iconAlt}`} fill priority sizes="300px" className="object-contain p-16" />}
                </div>
                <span className="absolute -left-3 sm:-left-6 bottom-8 grid place-items-center w-28 h-28 rounded-full bg-white border border-line shadow-xl shadow-ink/10 overflow-hidden">
                  <Image src={product.icon} alt="" fill sizes="112px" className="object-contain p-3" />
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* The sheet: about and features on the left, usage and packing in a panel that stays in view */}
        <section className="paper relative bg-page-alt py-20 md:py-28">
          <div className="container-site grid lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-7 space-y-16">
              <Reveal>
                <h2 className="label-mono text-copy-dim flex items-center gap-3"><span className="text-flame">(01)</span><span className="h-px w-8 bg-current opacity-50" />{t.about}</h2>
                <p className="font-display text-2xl md:text-[1.9rem] leading-[1.4] text-ink mt-7 whitespace-pre-line">{product.about}</p>
              </Reveal>
              <Reveal>
                <h2 className="label-mono text-copy-dim flex items-center gap-3"><span className="text-flame">(02)</span><span className="h-px w-8 bg-current opacity-50" />{t.features}</h2>
                <ol className="mt-7 border-t border-line">
                  {product.features.map((feature, i) => <li key={feature} className="flex items-baseline gap-5 border-b border-line py-5">
                    <span className="label-mono text-flame">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-ink text-lg leading-snug">{feature}</span>
                  </li>)}
                </ol>
              </Reveal>
              {product.variants && product.variants.length > 0 && <Reveal>
                <h2 className="label-mono text-copy-dim flex items-center gap-3"><span className="text-flame">(03)</span><span className="h-px w-8 bg-current opacity-50" />{t.variants}</h2>
                <ul className="flex flex-wrap gap-2 mt-7">
                  {product.variants.map((variant) => <li key={variant} className="px-4 py-2.5 rounded-full border border-line bg-card text-ink font-semibold">{variant}</li>)}
                </ul>
              </Reveal>}
            </div>

            <aside className="lg:col-span-5">
              <div className="lg:sticky lg:top-28 theme-dark paper rounded-[2rem] bg-page p-7 md:p-9">
                <h2 className="font-display text-3xl text-ink">{t.usage}</h2>
                <dl className="mt-7 border-t border-line">
                  {[{ icon: "target" as const, label: t.inclusionRate, value: product.inclusionRate }, { icon: "layers" as const, label: t.packSize, value: product.packSize }].map((row) => (
                    <div key={row.label} className="border-b border-line py-6">
                      <dt className="label-mono text-flame flex items-center gap-2"><Icon name={row.icon} className="w-4 h-4" />{row.label}</dt>
                      <dd className="mt-3 text-ink text-lg leading-relaxed whitespace-pre-line">{row.value}</dd>
                    </div>
                  ))}
                </dl>
                <Button href={emailHref} className="mt-8 w-full" arrow>{t.askAbout}</Button>
              </div>
            </aside>
          </div>
        </section>

        {/* Other products for the same animals */}
        {related.length > 0 && (
          <section className="paper relative bg-page py-20 md:py-28">
            <div className="container-site">
              <div className="flex flex-wrap items-end justify-between gap-4 pb-8 mb-10 border-b border-line">
                <h2 className="font-display text-4xl md:text-5xl text-ink tracking-tight">{t.related}</h2>
                <ArrowLink href={href("/products")}>{t.allProducts}</ArrowLink>
              </div>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                {related.slice(0, 3).map((item) => (
                  <li key={item.id}>
                    <Link href={href(productPath(item.name))} className="group block">
                      <div className="relative aspect-[4/3] rounded-[1.5rem] overflow-hidden bg-card-hi">
                        {item.banner
                          ? <Image src={item.banner} alt="" fill sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="object-cover group-hover:scale-[1.04] transition-transform duration-700" />
                          : <Image src={item.icon} alt="" fill sizes="160px" className="object-contain p-10" />}
                      </div>
                      <p className="label-mono text-copy-dim mt-5"><span className="text-flame">No.</span> {String(item.id).padStart(2, "0")}</p>
                      <h3 className="font-display text-2xl text-ink mt-2 group-hover:text-flame transition-colors">{item.name}</h3>
                      {item.tagline && <p className="text-copy mt-1.5">{item.tagline}</p>}
                      <span className="sr-only">{t.viewProduct}</span>
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
