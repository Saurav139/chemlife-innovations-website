"use client";

import { useState, useEffect } from "react";
import { motion, MotionConfig } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import Icon from "@/components/site/Icon";
import { CtaBand, PageHero, twoTone } from "@/components/site/ui";
import { PRODUCTS, productAnchor, productPath } from "@/lib/catalog";
import { useHashTarget } from "@/lib/deepLink";
import { useHref, useT } from "@/i18n/LocaleProvider";

const easeOut = [0.25, 0.1, 0, 1] as const;

// Card image widths for the browser to pick a file size from. They follow the product grid below.
const BANNER_SIZES = "(min-width: 1024px) 366px, (min-width: 640px) calc(50vw - 38px), calc(100vw - 50px)";

interface Product {
  id: number;
  name: string;
  category: string;
  tagline?: string;
  about: string;
  features: string[];
  inclusionRate: string;
  packSize: string;
  icon: string;
  variants?: string[];
  banner?: string;
}

// The products are listed in src/lib/catalog.ts; their taglines, descriptions, features, dosage and pack sizes are in
// the language file (products.items), in the same order.

export default function ProductsPage() {
  const all = useT();
  const t = all.products;
  const productsData: Product[] = PRODUCTS.map((p, i) => ({ ...p, ...t.items[i] }));
  const href = useHref();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Mono-gastric", "Ruminants", "Value Addition"];


  // Older links to one product (/products#product-maxdmold, #MaxDmold, ?expand=MaxDmold, still in chat answers and
  // bookmarks) go on to that product's own page. ?q=… pre-fills the search box.
  const openProduct = (product: Product) => router.replace(href(productPath(product.name)));
  useHashTarget((target) => {
    const product =
      productsData.find((p) => productAnchor(p.name) === target) ||
      productsData.find((p) => p.name.toLowerCase() === target.toLowerCase());
    if (product) openProduct(product);
  });
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || params.get("query");
    if (query) setSearchQuery(query);
    // ?category=Ruminants opens the list on one species, as the homepage's "Browse all" buttons do.
    const category = params.get("category");
    if (category && categories.includes(category)) setSelectedCategory(category);
    const expand = params.get("expand")?.toLowerCase();
    if (expand) {
      const product =
        productsData.find((p) => p.name.toLowerCase() === expand) ||
        productsData.find((p) => p.name.toLowerCase().startsWith(expand)) ||
        productsData.find((p) => p.name.toLowerCase().includes(expand));
      if (product) openProduct(product);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on arrival
  }, []);

  const filteredProducts = productsData.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.about.toLowerCase().includes(query) ||
      product.features.some((f) => f.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  return (
    <VariantProvider>
      <Header />

      <main id="main" tabIndex={-1} className="site-ui bg-page min-h-screen">
        {/* Card animations follow the visitor's "reduce motion" setting */}
        <MotionConfig reducedMotion="user">
        <PageHero eyebrow={t.kicker} title={twoTone(t.titleStart, t.titleAccent)} lead={t.intro} />

        <section aria-label={t.listHeading} className="bg-page pb-20 md:pb-28">
          <div className="container-site">
            {/* Species as tabs, with the search box beside them */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10">
              <div role="group" aria-label={t.filterBySpecies} className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
                {categories.map((category) => {
                  const count = category === "All" ? productsData.length : productsData.filter((p) => p.category === category).length;
                  return <button key={category} type="button" aria-pressed={selectedCategory === category} onClick={() => setSelectedCategory(category)}
                    className={`shrink-0 inline-flex items-center gap-2 min-h-11 px-5 rounded-full border text-[15px] font-semibold transition-colors cursor-pointer ${selectedCategory === category ? "bg-brand-orange-aa border-brand-orange-aa text-white" : "border-line text-copy hover:border-flame/50 hover:text-ink"}`}>
                    {category === "All" ? t.allSpecies : t.categories[category as keyof typeof t.categories]}
                    <span className={`text-xs ${selectedCategory === category ? "text-white" : "text-copy-dim"}`}>{count}</span>
                  </button>;
                })}
              </div>
              <div className="flex items-center rounded-full border border-line bg-card focus-within:border-flame/60 transition-colors w-full lg:max-w-sm">
                <Icon name="search" className="w-5 h-5 ml-4 text-copy-dim shrink-0" />
                <input type="search" enterKeyHint="search" aria-label={t.search} placeholder={t.search} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full min-w-0 bg-transparent border-0 px-3 py-3 text-ink placeholder:text-copy-dim focus:outline-none text-base [&::-webkit-search-cancel-button]:appearance-none" />
                {searchQuery && <button onClick={() => setSearchQuery("")} aria-label={t.clearSearch} className="mr-2 grid place-items-center w-9 h-9 rounded-full text-copy hover:text-ink cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>}
              </div>
            </div>

            {/* For screen readers: the product cards (h3) sit under this heading */}
            <h2 className="sr-only">{t.listHeading}</h2>
            <p className="sr-only" role="status">
              {searchQuery || selectedCategory !== "All"
                ? t.resultsCount.replace("{count}", String(filteredProducts.length)).replace("{total}", String(productsData.length))
                : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
              {filteredProducts.map((product) => (
                <motion.div key={product.id} id={productAnchor(product.name)} data-analytics-item={product.name} layout transition={{ duration: 0.4, ease: easeOut }} className="h-full">
                  <Link href={href(productPath(product.name))} data-analytics-click="View Product"
                    className="scroll-mt-28 h-full rounded-2xl border border-line bg-card/70 hover:border-flame/40 hover:bg-card-hi/70 transition-colors overflow-hidden flex flex-col group">
                    <div className="relative w-full aspect-video overflow-hidden bg-card-hi">
                      {product.banner
                        ? <Image src={product.banner} alt={`${product.name} ${t.bannerAlt}`} fill sizes={BANNER_SIZES} className="object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                        : <div className="absolute inset-0 grid place-items-center"><div className="relative w-20 h-20 rounded-full bg-white"><Image src={product.icon} alt={`${product.name} ${t.iconAlt}`} fill sizes="80px" className="object-contain p-3" /></div></div>}
                      <span className="absolute left-3 top-3 rounded-full bg-page/80 backdrop-blur px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-mint">
                        {t.categories[product.category as keyof typeof t.categories]}
                      </span>
                    </div>
                    <div className="p-5 flex flex-1 flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <span className="relative w-9 h-9 rounded-full bg-white shrink-0 overflow-hidden"><Image src={product.icon} alt="" fill sizes="36px" className="object-contain p-1" /></span>
                        <h3 className="font-heading text-lg font-bold text-ink group-hover:text-flame transition-colors leading-tight">{product.name}</h3>
                      </div>
                      {product.tagline && <p className="text-[15px] text-copy leading-relaxed">{product.tagline}</p>}
                      <span className="mt-auto pt-3 inline-flex items-center gap-1.5 text-flame text-sm font-bold">
                        {t.viewProduct}<Icon name="arrow" className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="text-center py-16 rounded-2xl border border-dashed border-line col-span-full">
                  <p className="text-copy">{t.noResults}</p>
                  <button type="button" onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                    className="mt-4 inline-flex items-center min-h-11 px-6 rounded-full border border-flame/60 text-flame font-semibold hover:bg-flame/10 cursor-pointer">
                    {t.clearSearch}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
        <CtaBand title={all.site.cta.title} lead={all.site.cta.lead}
          primary={{ label: all.home.talkToNutritionist, href: href("/contact?type=nutritionist") }}
          secondary={{ label: all.home.whoWeAre.requestDossier, href: href("/contact?type=dossier") }} />
        </MotionConfig>
      </main>

      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
