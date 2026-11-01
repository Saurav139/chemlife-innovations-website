"use client";

import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteSearch from "@/components/SiteSearch";
import Icon from "@/components/site/Icon";
import { Button, CtaBand, Glow, Reveal } from "@/components/site/ui";
import { VariantProvider } from "@/context/VariantContext";
import { PRODUCTS, productPath } from "@/lib/catalog";
import { useHref, useT } from "@/i18n/LocaleProvider";

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

      <main id="main" tabIndex={-1} className="site-ui bg-page min-h-screen">
        {/* The product at a glance: shown at once (no fade-in), its picture is the page's largest paint. */}
        <section className="relative overflow-hidden pt-28 md:pt-36 lg:pt-40 pb-16 md:pb-24">
          <Glow />
          <div className="relative container-site grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-6">
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-copy">
                <Link href={href("/products")} className="tap-target hover:text-ink">{all.nav.products}</Link>
                <Icon name="chevron" className="w-3.5 h-3.5 -rotate-90" />
                <span aria-current="page" className="text-ink">{product.name}</span>
              </nav>
              <span className="inline-flex items-center gap-2 mt-6 rounded-full border border-line bg-ink/5 px-3.5 py-1.5 text-[13px] font-semibold text-mint">{category}</span>
              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-ink leading-[1.02] mt-5">{product.name}</h1>
              {product.tagline && <p className="font-heading text-xl md:text-2xl text-flame mt-5 leading-snug">{product.tagline}</p>}
              <div className="flex flex-wrap gap-3 mt-9">
                <Button href={emailHref} arrow>{t.enquire} {product.name}</Button>
                <Button href={href("/contact?type=nutritionist")} variant="outline">{all.home.talkToNutritionist}</Button>
              </div>
            </div>
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-line bg-card shadow-2xl shadow-ink/10">
                {product.banner
                  ? <Image src={product.banner} alt={`${product.name} ${t.bannerAlt}`} fill priority sizes="(min-width: 1240px) 600px, (min-width: 1024px) 48vw, 100vw" className="object-cover" />
                  : <div className="absolute inset-0 grid place-items-center"><div className="relative w-40 h-40 rounded-full bg-white"><Image src={product.icon} alt={`${product.name} ${t.iconAlt}`} fill priority sizes="160px" className="object-contain p-6" /></div></div>}
              </div>
              <div className="absolute -bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 rounded-2xl border border-line bg-card/95 backdrop-blur-md p-4 shadow-2xl shadow-ink/10 flex items-center gap-4">
                <span className="relative w-14 h-14 rounded-full bg-white shrink-0 overflow-hidden"><Image src={product.icon} alt="" fill sizes="56px" className="object-contain p-1.5" /></span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold tracking-widest uppercase text-copy-dim">{t.packSize}</span>
                  <span className="block font-semibold text-ink leading-snug">{product.packSize.split("\n")[0]}</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* The details: description, features and variants beside how it's used and packed */}
        <section className="bg-page-alt py-20 md:py-28">
          <div className="container-site grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-7 space-y-14">
              <Reveal>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-ink">{t.about}</h2>
                <p className="text-copy text-lg leading-relaxed mt-5 whitespace-pre-line">{product.about}</p>
              </Reveal>
              <Reveal>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-ink">{t.features}</h2>
                <ul className="grid sm:grid-cols-2 gap-3 mt-6">
                  {product.features.map((feature) => <li key={feature} className="flex items-start gap-3 rounded-2xl border border-line bg-card/70 p-4">
                    <span className="grid place-items-center w-8 h-8 rounded-full bg-flame/15 text-flame shrink-0"><Icon name="check" className="w-4 h-4" strokeWidth={2.4} /></span>
                    <span className="text-ink/90 leading-snug pt-1">{feature}</span>
                  </li>)}
                </ul>
              </Reveal>
              {product.variants && product.variants.length > 0 && <Reveal>
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-ink">{t.variants}</h2>
                <ul className="flex flex-wrap gap-2 mt-6">
                  {product.variants.map((variant) => <li key={variant} className="px-4 py-2 rounded-full border border-line bg-card text-ink font-semibold">{variant}</li>)}
                </ul>
              </Reveal>}
            </div>

            <aside className="lg:col-span-5">
              <div className="lg:sticky lg:top-32 rounded-3xl border border-line bg-gradient-to-b from-card-hi to-card p-7 md:p-8">
                <h2 className="font-heading text-2xl font-bold text-ink">{t.usage}</h2>
                <dl className="mt-6 space-y-6">
                  <div className="flex gap-4">
                    <span className="grid place-items-center w-11 h-11 rounded-xl bg-mint/12 text-mint shrink-0"><Icon name="target" className="w-5 h-5" /></span>
                    <div><dt className="text-sm font-semibold text-copy-dim">{t.inclusionRate}</dt><dd className="mt-1 text-ink font-semibold whitespace-pre-line leading-snug">{product.inclusionRate}</dd></div>
                  </div>
                  <div className="flex gap-4">
                    <span className="grid place-items-center w-11 h-11 rounded-xl bg-mint/12 text-mint shrink-0"><Icon name="layers" className="w-5 h-5" /></span>
                    <div><dt className="text-sm font-semibold text-copy-dim">{t.packSize}</dt><dd className="mt-1 text-ink font-semibold whitespace-pre-line leading-snug">{product.packSize}</dd></div>
                  </div>
                </dl>
                <Button href={emailHref} className="mt-8 w-full" arrow>{t.askAbout}</Button>
              </div>
            </aside>
          </div>
        </section>

        {/* Other products for the same animals */}
        {related.length > 0 && (
          <section className="bg-page pt-20 md:pt-28">
            <div className="container-site">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
                <h2 className="font-heading text-3xl md:text-4xl font-bold text-ink">{t.related}</h2>
                <Link href={href("/products")} className="inline-flex items-center gap-2 font-semibold text-flame hover:text-ink">{t.allProducts}<Icon name="arrow" className="w-4 h-4" /></Link>
              </div>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {related.slice(0, 3).map((item) => (
                  <li key={item.id}>
                    <Link href={href(productPath(item.name))} className="group flex h-full flex-col rounded-2xl border border-line bg-card/70 hover:border-flame/40 overflow-hidden transition-colors">
                      <div className="relative aspect-video bg-card-hi">
                        {item.banner
                          ? <Image src={item.banner} alt="" fill sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                          : <div className="absolute inset-0 grid place-items-center"><div className="relative w-16 h-16 rounded-full bg-white"><Image src={item.icon} alt="" fill sizes="64px" className="object-contain p-2" /></div></div>}
                      </div>
                      <div className="p-5 flex flex-1 flex-col">
                        <h3 className="font-heading text-lg font-bold text-ink group-hover:text-flame transition-colors">{item.name}</h3>
                        {item.tagline && <p className="text-copy mt-1">{item.tagline}</p>}
                        <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-flame text-sm font-bold">{t.viewProduct}<Icon name="arrow" className="w-4 h-4" /></span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
        <CtaBand title={all.site.cta.title} lead={all.site.cta.lead}
          primary={{ label: all.home.talkToNutritionist, href: href("/contact?type=nutritionist") }}
          secondary={{ label: all.home.whoWeAre.requestDossier, href: href("/contact?type=dossier") }} />
      </main>

      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
