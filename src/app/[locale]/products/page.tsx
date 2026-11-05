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
import { Images } from "@/lib/assets";
import { PLATFORMS, PRODUCTS, productAnchor, productPath, slugify, type Platform } from "@/lib/catalog";
import { useHashTarget } from "@/lib/deepLink";
import { useHref, useT } from "@/i18n/LocaleProvider";

const easeOut = [0.25, 0.1, 0, 1] as const;

// Card image widths for the browser to pick a file size from. They follow the product grid below.
const BANNER_SIZES = "(min-width: 1024px) 366px, (min-width: 640px) calc(50vw - 38px), calc(100vw - 50px)";

interface Product {
  id: number;
  name: string;
  category: string;
  platform: Platform;
  dose?: string;
  tagline?: string;
  about: string;
  features: string[];
  inclusionRate: string;
  packSize: string;
  icon: string;
  variants?: string[];
  banner?: string;
}

const CATEGORY_STYLE: Record<string, string> = {
  "Mono-gastric": "bg-orange-50/50 border-orange-150 text-brand-orange-aa",
  Ruminants: "bg-blue-50 border-blue-150 text-blue-700",
  "Value Addition": "bg-emerald-50 border-emerald-150 text-emerald-700",
};

/** A product in the list: its picture (from tablets up), its own icon, name, species, tagline, and its usual dose and
 *  pack. On phones a compact row with the icon beside the text. */
function ProductCard({ product, href }: { product: Product; href: string }) {
  const t = useT().products;
  const dose = product.dose
    ? product.dose.replace(/\{(day|birds|water)\}/g, (_, word: keyof typeof t.units) => t.units[word])
    : product.inclusionRate.split("\n")[0];
  const pack = product.packSize.split("\n").filter(Boolean).join(" · ");
  return (
    <Link
      href={href}
      data-analytics-click="View Product"
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-[box-shadow,border-color] duration-300 hover:border-brand-orange/30 hover:shadow-lg"
    >
      {product.banner && (
        <div className="relative hidden sm:block aspect-video overflow-hidden bg-slate-100">
          <Image src={product.banner} alt={`${product.name} ${t.bannerAlt}`} fill sizes={BANNER_SIZES} className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        </div>
      )}
      <div className="flex flex-1 gap-4 p-4 sm:flex-col sm:gap-0 sm:px-5 sm:pb-5 sm:pt-0">
        {/* The product's own icon: beside the text on phones, overlapping the picture from tablets up. */}
        <span className={`relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 overflow-hidden rounded-full bg-white ring-4 ring-white shadow-md ${product.banner ? "sm:-mt-8" : "sm:mt-5"}`}>
          <Image src={product.icon} alt={`${product.name} ${t.iconAlt}`} fill sizes="64px" className="object-contain" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col sm:mt-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading text-lg font-bold leading-tight text-brand-navy transition-colors duration-300 group-hover:text-brand-orange-aa">{product.name}</h3>
            <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border whitespace-nowrap ${CATEGORY_STYLE[product.category] ?? CATEGORY_STYLE["Value Addition"]}`}>
              {t.categories[product.category as keyof typeof t.categories]}
            </span>
          </div>
          {product.tagline && <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{product.tagline}</p>}
          <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-xs">
            <div className="min-w-0">
              <dt className="font-semibold uppercase tracking-wider text-[10px] text-slate-500">{t.inclusionRate}</dt>
              <dd className="mt-0.5 font-semibold text-brand-navy">{dose}</dd>
            </div>
            <div className="min-w-0">
              <dt className="font-semibold uppercase tracking-wider text-[10px] text-slate-500">{t.packSize}</dt>
              <dd className="mt-0.5 font-semibold text-brand-navy">{pack}</dd>
            </div>
          </dl>
          <span className="mt-auto pt-3 inline-flex items-center gap-1.5 min-h-10 text-brand-orange-aa text-sm font-bold">
            {t.viewProduct} <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
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
  const [selectedPlatform, setSelectedPlatform] = useState<"all" | Platform>("all");

  const categories = ["All", "Mono-gastric", "Ruminants", "Value Addition"];


  // Older links to one product (/products#product-maxdmold, #MaxDmold, ?expand=MaxDmold, still in chat answers and
  // bookmarks) go on to that product's own page. ?q=… pre-fills the search box, ?category=ruminants (from the
  // homepage's "What we serve" cards) picks that animal group, and ?platform=rumen that product group.
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
    const category = categories.find((c) => c !== "All" && slugify(c) === params.get("category"));
    if (category) setSelectedCategory(category);
    const platform = PLATFORMS.find((p) => p === params.get("platform"));
    if (platform) setSelectedPlatform(platform);
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
    const matchesPlatform = selectedPlatform === "all" || product.platform === selectedPlatform;
    return matchesCategory && matchesSearch && matchesPlatform;
  });
  // The matching products in their groups, in the groups' order; empty groups are left out.
  const groups = PLATFORMS.map((platform) => ({ platform, products: filteredProducts.filter((p) => p.platform === platform) }))
    .filter((group) => group.products.length > 0);

  const categoryColorStyles = {
    "All": {
      focus: "focus-within:border-brand-navy focus-within:ring-brand-navy",
      accent: "hover:text-brand-navy text-slate-aa",
      icon: "text-slate-aa"
    },
    "Mono-gastric": {
      focus: "focus-within:border-brand-orange focus-within:ring-brand-orange",
      accent: "hover:text-brand-orange text-brand-orange",
      icon: "text-brand-orange"
    },
    "Ruminants": {
      focus: "focus-within:border-blue-600 focus-within:ring-blue-600",
      accent: "hover:text-blue-600 text-blue-600",
      icon: "text-blue-600"
    },
    "Value Addition": {
      focus: "focus-within:border-emerald-600 focus-within:ring-emerald-600",
      accent: "hover:text-emerald-600 text-emerald-600",
      icon: "text-emerald-600"
    }
  };

  const activeStyle = categoryColorStyles[selectedCategory as keyof typeof categoryColorStyles] || categoryColorStyles["All"];

  return (
    <VariantProvider>
      <Header />

      <main id="main" tabIndex={-1} className="bg-slate-50/50 min-h-screen text-brand-navy">
        {/* Card animations follow the visitor's "reduce motion" setting */}
        <MotionConfig reducedMotion="user">
        {/* Hero and product list are plain sections: they're in the first screen, so they show without waiting for a fade-in.
            The hero image is the page's largest paint (LCP), so it loads first. */}
        <section className="pt-26 md:pt-32 pb-10 md:pb-20 lg:pt-36 lg:pb-28 text-white relative overflow-hidden bg-brand-navy flex items-center">
          <div className="absolute inset-0 z-0">
            <Image
              src={Images.products.heroBanner}
              alt={t.heroAlt}
              fill
              sizes="100vw"
              className="object-cover opacity-60"
              priority
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/75 to-transparent" />
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>

          <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full text-center md:text-left">
            <span className="text-teal-aa-light text-sm font-semibold tracking-widest uppercase block mb-3">{t.kicker}</span>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3 md:mb-4 text-white">
              {t.titleStart} <span className="text-teal-400">{t.titleAccent}</span>
            </h1>
            <p className="text-white/85 text-base lg:text-lg leading-relaxed max-w-3xl font-light">
              {t.intro}
            </p>
          </div>
        </section>

        {/* Search and species, above the list. */}
        <div className="max-w-[1200px] mx-auto px-6 pt-6 md:pt-8">
            <div className={`flex items-center bg-white border border-slate-200 shadow-xs rounded-full text-sm w-full md:max-w-md ${activeStyle.focus} focus-within:ring-1 transition-all duration-300`}>
              <div className={`pl-4 ${activeStyle.icon} flex-shrink-0 transition-colors duration-300`}>
                <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="search"
                enterKeyHint="search"
                aria-label={t.search}
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-w-0 bg-transparent border-0 px-3 py-2.5 text-brand-navy placeholder-slate-aa focus:outline-none focus:ring-0 text-base md:text-sm [&::-webkit-search-cancel-button]:appearance-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  aria-label={t.clearSearch}
                  className={`mr-1 grid place-items-center w-9 h-9 text-slate-aa ${activeStyle.accent} transition-colors duration-250 cursor-pointer`}
                >
                  <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <span aria-hidden="true" className="h-6 w-px bg-slate-200 flex-shrink-0" />
              <div className="relative flex-shrink-0">
                <select
                  aria-label={t.filterBySpecies}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-transparent pl-3 pr-9 py-2.5 font-semibold text-base md:text-xs text-slate-600 focus:outline-none cursor-pointer"
                >
                  {categories.map((category) => (
                    <option key={category} value={category} className="text-brand-navy font-semibold">
                      {category === "All" ? t.allSpecies : t.categories[category as keyof typeof t.categories]}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-aa pointer-events-none">
                  <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

        </div>

        {/* The product groups as chips, kept in view below the header while the list scrolls: one row to swipe on
            phones, wrapping from tablets up. */}
        <div className="sticky top-18 md:top-20 lg:top-24 z-30 mt-4 bg-slate-50/95 backdrop-blur-md border-y border-slate-200/80">
          <div className="max-w-[1200px] mx-auto px-6 py-2.5">
            <div role="group" aria-label={t.filterByPlatform} className="flex gap-2 overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 md:flex-wrap md:overflow-visible [scrollbar-width:none]">
              {(["all", ...PLATFORMS] as const).map((platform) => {
                const active = selectedPlatform === platform;
                return (
                  <button
                    key={platform}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedPlatform(platform)}
                    className={`shrink-0 whitespace-nowrap min-h-10 px-4 rounded-full border text-sm font-semibold transition-colors cursor-pointer ${active ? "bg-brand-navy border-brand-navy text-white" : "bg-white border-slate-200 text-slate-600 hover:border-brand-navy/40 hover:text-brand-navy"}`}
                  >
                    {platform === "all" ? t.allPlatforms : t.platforms[platform].title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* The products, in their groups. */}
        <section className="pt-8 pb-16 md:pt-10 md:pb-20 relative">
          <div className="relative z-10 max-w-[1200px] mx-auto px-6">
            <h2 className="sr-only">{t.listHeading}</h2>
            <p className="sr-only" role="status">
              {searchQuery || selectedCategory !== "All" || selectedPlatform !== "all"
                ? t.resultsCount.replace("{count}", String(filteredProducts.length)).replace("{total}", String(productsData.length))
                : ""}
            </p>

            <div className="space-y-12 md:space-y-16">
              {groups.map(({ platform, products }) => (
                <section key={platform} aria-labelledby={`group-${platform}`} className="scroll-mt-48">
                  <div className="border-b border-slate-200 pb-4 mb-6 max-w-3xl">
                    <h3 id={`group-${platform}`} className="flex items-center gap-3 font-heading text-2xl md:text-3xl font-bold text-brand-navy">
                      {t.platforms[platform].title}
                      <span className="shrink-0 grid place-items-center min-w-8 h-8 px-2 rounded-full bg-brand-navy/5 text-sm font-bold tabular-nums text-brand-navy">{products.length}</span>
                    </h3>
                    <p className="text-slate-600 mt-1">{t.platforms[platform].note}</p>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {products.map((product) => (
                      <motion.li
                        key={product.id}
                        id={productAnchor(product.name)}
                        data-analytics-item={product.name}
                        layout
                        transition={{ duration: 0.4, ease: easeOut }}
                        className="h-full scroll-mt-48"
                      >
                        <ProductCard product={product} href={href(productPath(product.name))} />
                      </motion.li>
                    ))}
                  </ul>
                </section>
              ))}

              {filteredProducts.length === 0 && (
                <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-slate-600 text-sm">{t.noResults}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                      setSelectedPlatform("all");
                    }}
                    className="mt-4 inline-flex items-center min-h-11 px-6 rounded-full border-2 border-brand-navy/20 hover:border-brand-navy text-brand-navy text-sm font-semibold transition-colors cursor-pointer"
                  >
                    {t.clearSearch}
                  </button>
                </div>
              )}
            </div>

            {/* The next step, for visitors still deciding. */}
            <div className="relative overflow-hidden mt-16 md:mt-20 rounded-3xl bg-brand-navy text-white px-6 py-10 md:px-12 md:py-12 grid lg:grid-cols-12 gap-6 lg:gap-10 items-center">
              <div aria-hidden="true" className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-teal-aa-light/15 blur-3xl" />
              <div className="relative lg:col-span-7">
                <p className="font-heading text-2xl md:text-3xl font-bold leading-tight text-white">{t.closing.title}</p>
                <p className="text-white/80 leading-relaxed mt-3">{t.closing.text}</p>
              </div>
              <div className="relative lg:col-span-5 flex flex-wrap lg:justify-end gap-3">
                <Link href={href("/contact?type=nutritionist")} data-analytics-click={all.home.talkToNutritionist}
                  className="inline-flex items-center justify-center min-h-12 px-6 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold transition-colors">
                  {all.home.talkToNutritionist}
                </Link>
                <Link href={href("/contact?type=dossier")} data-analytics-click={all.home.whoWeAre.requestDossier}
                  className="inline-flex items-center justify-center min-h-12 px-6 rounded-full border border-white/40 text-white font-semibold hover:bg-white hover:text-brand-navy transition-colors">
                  {all.home.whoWeAre.requestDossier}
                </Link>
              </div>
            </div>
          </div>
        </section>
        </MotionConfig>
      </main>

      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
