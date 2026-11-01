"use client";

import { useState, useEffect } from "react";
import { motion, MotionConfig, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import Icon from "@/components/site/Icon";
import { PageHero, easeOut } from "@/components/site/ui";
import { PRODUCTS, productAnchor, productPath } from "@/lib/catalog";
import { useHashTarget } from "@/lib/deepLink";
import { useHref, useT } from "@/i18n/LocaleProvider";

// Card image widths for the browser to pick a file size from. They follow the product grid below.
const BANNER_SIZES = "(min-width: 1280px) 400px, (min-width: 1024px) 31vw, (min-width: 640px) 47vw, 92vw";
const CATEGORIES = ["All", "Mono-gastric", "Ruminants", "Value Addition"] as const;

// The products are listed in src/lib/catalog.ts; their taglines, descriptions, features, dosage and pack sizes are in
// the language file (products.items), in the same order.
export default function ProductsPage() {
  const t = useT().products;
  const productsData = PRODUCTS.map((p, i) => ({ ...p, ...t.items[i] }));
  const href = useHref();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Older links to one product (/products#product-maxdmold, #MaxDmold, ?expand=MaxDmold, still in chat answers and
  // bookmarks) go on to that product's own page. ?q=… pre-fills the search box and ?category=… picks a species.
  const openProduct = (product: (typeof productsData)[number]) => router.replace(href(productPath(product.name)));
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
    const category = params.get("category");
    if (category && (CATEGORIES as readonly string[]).includes(category)) setSelectedCategory(category);
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

  const query = searchQuery.toLowerCase();
  const matchesSearch = (product: (typeof productsData)[number]) =>
    product.name.toLowerCase().includes(query) ||
    product.category.toLowerCase().includes(query) ||
    product.about.toLowerCase().includes(query) ||
    product.features.some((f) => f.toLowerCase().includes(query));
  const filteredProducts = productsData.filter((p) => (selectedCategory === "All" || p.category === selectedCategory) && matchesSearch(p));
  const countFor = (category: string) => productsData.filter((p) => (category === "All" || p.category === category) && matchesSearch(p)).length;
  const categoryName = (category: string) => (category === "All" ? t.allSpecies : t.categories[category as keyof typeof t.categories]);

  return (
    <VariantProvider>
      <Header />
      <main id="main" tabIndex={-1} className="site-ui bg-page min-h-screen">
        <MotionConfig reducedMotion="user">
          <PageHero trail={t.kicker} title={`${t.titleStart} *${t.titleAccent}*`} lead={t.intro} />

          {/* Species and search, kept in reach under the header while the list scrolls */}
          <div className="sticky top-18 md:top-20 z-30 bg-page/90 backdrop-blur-xl border-y border-line">
            <div className="container-site flex flex-col md:flex-row md:items-center gap-3 py-3">
              <div role="group" aria-label={t.filterBySpecies} className="flex gap-1.5 overflow-x-auto -mx-1 px-1 [scrollbar-width:none]">
                {CATEGORIES.map((category) => {
                  const active = selectedCategory === category;
                  return <button key={category} type="button" aria-pressed={active} onClick={() => setSelectedCategory(category)}
                    className={`shrink-0 inline-flex items-center gap-2 min-h-11 rounded-full px-4 text-sm font-semibold transition-colors cursor-pointer ${active ? "bg-ink text-page" : "text-ink hover:bg-ink/5"}`}>
                    {categoryName(category)}
                    <span className={`label-mono text-[11px] ${active ? "text-page/70" : "text-copy-dim"}`}>{String(countFor(category)).padStart(2, "0")}</span>
                  </button>;
                })}
              </div>
              <label className="md:ml-auto flex items-center rounded-full border border-line bg-card focus-within:border-ink transition-colors w-full md:max-w-xs">
                <Icon name="search" className="w-[18px] h-[18px] ml-4 text-copy-dim shrink-0" />
                <input type="search" enterKeyHint="search" aria-label={t.search} placeholder={t.search} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full min-w-0 bg-transparent border-0 px-3 py-2.5 text-base md:text-[15px] text-ink placeholder:text-copy-dim focus:outline-none [&::-webkit-search-cancel-button]:appearance-none" />
                {searchQuery && <button type="button" onClick={() => setSearchQuery("")} aria-label={t.clearSearch} className="grid place-items-center w-10 h-10 mr-0.5 text-copy-dim hover:text-ink cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>}
              </label>
            </div>
          </div>

          <section className="paper relative bg-page pt-12 md:pt-16 pb-20 md:pb-28">
            <div className="container-site">
              {/* For screen readers: the product cards (h3) sit under this heading */}
              <h2 className="sr-only">{t.listHeading}</h2>
              <p className="sr-only" role="status">
                {searchQuery || selectedCategory !== "All" ? t.resultsCount.replace("{count}", String(filteredProducts.length)).replace("{total}", String(productsData.length)) : ""}
              </p>

              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                <AnimatePresence initial={false}>
                  {filteredProducts.map((product) => (
                    <motion.li key={product.id} id={productAnchor(product.name)} data-analytics-item={product.name} layout
                      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.4, ease: easeOut }}>
                      <Link href={href(productPath(product.name))} data-analytics-click="View Product" className="group block">
                        <div className="flex items-center justify-between label-mono text-copy-dim pb-3 border-b border-line">
                          <span><span className="text-flame">No.</span> {String(product.id).padStart(2, "0")}</span>
                          <span>{t.categories[product.category as keyof typeof t.categories]}</span>
                        </div>
                        <div className="relative aspect-[4/3] mt-4 rounded-[1.5rem] overflow-hidden bg-card-hi">
                          {product.banner
                            ? <Image src={product.banner} alt={`${product.name} ${t.bannerAlt}`} fill sizes={BANNER_SIZES} className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                            : <Image src={product.icon} alt={`${product.name} ${t.iconAlt}`} fill sizes="200px" className="object-contain p-12" />}
                          <span className="absolute right-3 bottom-3 grid place-items-center w-12 h-12 rounded-full bg-page text-ink translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-all duration-300">
                            <Icon name="arrowUpRight" className="w-5 h-5" />
                          </span>
                        </div>
                        <div className="flex items-start gap-4 mt-5">
                          <span className="relative w-12 h-12 rounded-full bg-white border border-line overflow-hidden shrink-0"><Image src={product.icon} alt="" fill sizes="48px" className="object-contain p-1.5" /></span>
                          <div className="min-w-0">
                            <h3 className="font-display text-2xl text-ink leading-tight group-hover:text-flame transition-colors">{product.name}</h3>
                            {product.tagline && <p className="text-copy leading-snug mt-1.5">{product.tagline}</p>}
                          </div>
                        </div>
                        <span className="sr-only">{t.viewProduct}</span>
                      </Link>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>

              {filteredProducts.length === 0 && (
                <div className="text-center py-20 rounded-[2rem] border border-dashed border-line">
                  <p className="font-display text-2xl text-ink">{t.noResults}</p>
                  <button type="button" onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                    className="mt-6 inline-flex items-center min-h-11 px-6 rounded-full border border-ink/30 hover:bg-ink hover:text-page text-ink text-sm font-semibold transition-colors cursor-pointer">{t.clearSearch}</button>
                </div>
              )}
            </div>
          </section>
        </MotionConfig>
      </main>
      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
