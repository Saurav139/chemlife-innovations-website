"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import { Images } from "@/lib/assets";
import { PRODUCTS, productAnchor } from "@/lib/catalog";
import { revealElement, useHashTarget } from "@/lib/deepLink";
import { useT } from "@/i18n/LocaleProvider";

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
  const t = useT().products;
  const productsData: Product[] = PRODUCTS.map((p, i) => ({ ...p, ...t.items[i] }));
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Mono-gastric", "Ruminants", "Value Addition"];


  // Opens at one product from a link such as /products#product-maxdmold (the site search) or the older
  // ?expand=MaxDmold and #MaxDmold forms: shows every category, expands the product and scrolls to it.
  // ?q=… pre-fills the search box.
  const openProduct = (product: Product) => {
    setSelectedCategory("All");
    setSearchQuery("");
    setExpandedId(product.id);
    revealElement(productAnchor(product.name));
  };
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

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

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

  const categoryColorStyles = {
    "All": {
      focus: "focus-within:border-brand-navy dark:focus-within:border-night-soft focus-within:ring-brand-navy",
      accent: "hover:text-brand-navy dark:hover:text-night-text text-slate-aa dark:text-night-muted",
      icon: "text-slate-aa dark:text-night-muted"
    },
    "Mono-gastric": {
      focus: "focus-within:border-brand-orange focus-within:ring-brand-orange",
      accent: "hover:text-brand-orange text-brand-orange",
      icon: "text-brand-orange"
    },
    "Ruminants": {
      focus: "focus-within:border-blue-600 focus-within:ring-blue-600",
      accent: "hover:text-blue-600 dark:hover:text-blue-300 text-blue-600 dark:text-blue-300",
      icon: "text-blue-600 dark:text-blue-300"
    },
    "Value Addition": {
      focus: "focus-within:border-emerald-600 focus-within:ring-emerald-600",
      accent: "hover:text-emerald-600 dark:hover:text-emerald-400 text-emerald-600 dark:text-emerald-400",
      icon: "text-emerald-600 dark:text-emerald-400"
    }
  };

  const activeStyle = categoryColorStyles[selectedCategory as keyof typeof categoryColorStyles] || categoryColorStyles["All"];

  return (
    <VariantProvider>
      <Header />

      <main className="bg-slate-50/50 dark:bg-night-900/50 min-h-screen text-brand-navy dark:text-night-text">
        {/* Hero and product list are plain sections: they're in the first screen, so they show without waiting for a fade-in.
            The hero image is the page's largest paint (LCP), so it loads first. */}
        <section className="pt-26 md:pt-32 pb-10 md:pb-20 lg:pt-36 lg:pb-28 text-white relative overflow-hidden bg-brand-navy dark:bg-night-band flex items-center">
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
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 dark:from-night-band/95 via-brand-navy/75 dark:via-night-band/75 to-transparent" />
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

        {/* Products List Section */}
        <section className="pt-8 pb-16 md:py-16 bg-slate-50/30 dark:bg-night-900/30 relative overflow-hidden">
          {/* Subtle Product-based Background Image. At 4% opacity a small file looks the same as the 3840px original,
              and it's decorative, so its empty alt makes screen readers skip it. */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none opacity-[0.04]">
            <Image
              src={Images.products.customBg}
              alt=""
              fill
              sizes="640px"
              className="object-cover object-center"
            />
          </div>

          <div className="relative z-10 max-w-[1200px] mx-auto px-6">

            {/* Left-Aligned Search and Category Selector Container */}
            <div className="flex flex-col md:flex-row items-center gap-4 mb-10 w-full">
              <div className={`flex items-center bg-slate-50 dark:bg-night-900 border border-slate-200 dark:border-night-600 rounded-full shadow-xs text-sm w-full md:max-w-xl ${activeStyle.focus} focus-within:ring-1 transition-all duration-300 relative`}>
                {/* Search Icon */}
                <div className={`pl-4 ${activeStyle.icon} flex-shrink-0 transition-colors duration-300`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Input Text Field */}
                <input
                  type="search"
                  enterKeyHint="search"
                  aria-label={t.search}
                  placeholder={t.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 px-3 py-3 text-brand-navy dark:text-night-text placeholder-slate-aa focus:outline-none focus:ring-0 text-base md:text-sm [&::-webkit-search-cancel-button]:appearance-none"
                />

                {/* Clear Search Button */}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    aria-label={t.clearSearch}
                    className={`mr-2 text-slate-aa dark:text-night-muted ${activeStyle.accent} transition-colors duration-250 cursor-pointer`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {/* Vertical Divider Line */}
                <div className="h-6 w-[1px] bg-slate-200 dark:bg-night-600 flex-shrink-0" />

                {/* Category Dropdown Selector inside Search Bar */}
                <div className="relative flex-shrink-0">
                  <select
                    aria-label={t.filterBySpecies}
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none bg-transparent pl-4 pr-10 py-3.5 font-semibold text-base md:text-xs text-slate-600 dark:text-night-soft focus:outline-none cursor-pointer"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category} className="text-brand-navy dark:text-night-text font-semibold">
                        {category === "All" ? t.allSpecies : t.categories[category as keyof typeof t.categories]}
                      </option>
                    ))}
                  </select>
                  {/* Dropdown Chevron Icon */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-aa dark:text-night-muted pointer-events-none">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* For screen readers: the product cards (h3) sit under this heading */}
            <h2 className="sr-only">{t.listHeading}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {filteredProducts.map((product) => {
                const isExpanded = expandedId === product.id;
                const emailSubject = encodeURIComponent(`Product Inquiry: ${product.name}`);
                const emailBody = encodeURIComponent(
                  `Hi ChemLife Innovations team,\n\nI am writing to inquire about ${product.name}. Please share technical datasheets, pricing, and packaging options.\n\nBest regards,\n[Your Name]\n[Your Company]`
                );
                const emailHref = `mailto:innovate@chemlifeinnovations.com?subject=${emailSubject}&body=${emailBody}`;

                return (
                  <motion.div
                    key={product.id}
                    id={productAnchor(product.name)}
                    data-analytics-item={product.name}
                    layout
                    transition={{ duration: 0.4, ease: easeOut }}
                    className="scroll-mt-28 border border-slate-200 dark:border-night-600 rounded-2xl bg-slate-50/50 dark:bg-night-900/50 hover:bg-slate-50/85 dark:hover:bg-night-900/85 transition-colors duration-300 overflow-hidden shadow-xs hover:border-brand-orange/30 flex flex-col h-fit group"
                  >
                    {/* Card Header (Image/Icon + Title & Category) */}
                    <div
                      onClick={() => toggleExpand(product.id)}
                      data-analytics-click={isExpanded ? "Show Less" : "Learn More"}
                      className="cursor-pointer select-none flex flex-col"
                    >
                      {/* Top: Product Image or Icon Container */}
                      {product.banner ? (
                        <div className="w-full aspect-video relative overflow-hidden bg-slate-100 dark:bg-night-700 border-b border-slate-200/60 dark:border-night-600/60">
                          <Image
                            src={product.banner}
                            alt={`${product.name} ${t.bannerAlt}`}
                            fill
                            sizes={BANNER_SIZES}
                            className="object-cover object-center group-hover:scale-102 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-video bg-white dark:bg-night-800 border-b border-slate-200/60 dark:border-night-600/60 flex items-center justify-center p-6 relative">
                          <div className="w-16 h-16 rounded-xl bg-white dark:bg-night-800 border border-slate-150 dark:border-night-600 shadow-sm flex items-center justify-center p-2.5">
                            <div className="relative w-full h-full">
                              <Image
                                src={product.icon}
                                alt={`${product.name} ${t.iconAlt}`}
                                fill
                                sizes="42px"
                                className="object-contain"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Content: Title & Category */}
                      <div className="p-5 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-heading text-lg font-black text-brand-navy dark:text-night-text group-hover:text-brand-orange-aa dark:group-hover:text-brand-orange transition-colors duration-300 leading-tight">
                            {product.name}
                          </h3>

                          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border whitespace-nowrap ${product.category === "Mono-gastric"
                            ? "bg-orange-50/50 dark:bg-orange-400/10 border-orange-150 dark:border-night-600 text-brand-orange-aa dark:text-brand-orange"
                            : product.category === "Ruminants"
                              ? "bg-blue-50 dark:bg-blue-400/10 border-blue-150 dark:border-night-600 text-blue-700 dark:text-blue-300"
                              : "bg-emerald-50 dark:bg-emerald-400/10 border-emerald-150 dark:border-night-600 text-emerald-700 dark:text-emerald-400"
                            }`}>
                            {t.categories[product.category as keyof typeof t.categories]}
                          </span>
                        </div>

                        {product.tagline && (
                          <p className="text-sm text-slate-550 dark:text-night-muted italic leading-relaxed">
                            {product.tagline}
                          </p>
                        )}

                        <div className="flex items-center gap-1.5 text-brand-orange-aa dark:text-brand-orange text-sm font-bold mt-2">
                          <span>{isExpanded ? t.showLess : t.readMore}</span>
                          <motion.span
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                          </motion.span>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Body */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.4, ease: easeOut }}
                          className="overflow-hidden border-t border-slate-100 dark:border-night-600 bg-white dark:bg-night-800"
                        >
                          <div className="p-5 space-y-5">
                            {/* About section */}
                            <div>
                              <span className="text-xs font-black uppercase text-teal-aa dark:text-teal-aa-light tracking-wider block mb-1.5">
                                {t.about}
                              </span>
                              <p className="text-slate-600 dark:text-night-soft text-sm leading-relaxed whitespace-pre-line">
                                {product.about}
                              </p>
                            </div>

                            {/* Variants section */}
                            {product.variants && product.variants.length > 0 && (
                              <div>
                                <span className="text-xs font-black uppercase text-teal-aa dark:text-teal-aa-light tracking-wider block mb-1.5">
                                  {t.variants}
                                </span>
                                <ul className="grid grid-cols-1 gap-1.5 text-slate-600 dark:text-night-soft text-sm font-semibold">
                                  {product.variants.map((variant, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                                      {variant}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Key Features section */}
                            <div>
                              <span className="text-xs font-black uppercase text-teal-aa dark:text-teal-aa-light tracking-wider block mb-2">
                                {t.features}
                              </span>
                              <ul className="space-y-2">
                                {product.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-slate-600 dark:text-night-soft text-sm">
                                    <svg className="w-3.5 h-3.5 text-brand-orange mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="leading-tight">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Usage & Presentation section */}
                            <div className="space-y-3">
                              <span className="text-xs font-black uppercase text-teal-aa dark:text-teal-aa-light tracking-wider block">
                                {t.usage}
                              </span>

                              <div className="space-y-2.5">
                                {/* Inclusion rate */}
                                <div className="flex items-start gap-2.5 p-3 bg-slate-50 dark:bg-night-900 rounded-lg border border-slate-100 dark:border-night-600">
                                  <div className="w-7 h-7 rounded-md bg-teal-50 dark:bg-teal-400/10 text-teal-aa dark:text-teal-aa-light flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                  </div>
                                  <div>
                                    <span className="text-xs text-slate-aa dark:text-night-muted font-bold uppercase tracking-wider block">{t.inclusionRate}</span>
                                    <span className="text-sm text-brand-navy dark:text-night-text font-semibold leading-relaxed mt-0.5 block whitespace-pre-line">
                                      {product.inclusionRate}
                                    </span>
                                  </div>
                                </div>

                                {/* Pack size */}
                                <div className="flex items-start gap-2.5 p-3 bg-slate-50 dark:bg-night-900 rounded-lg border border-slate-100 dark:border-night-600">
                                  <div className="w-7 h-7 rounded-md bg-teal-50 dark:bg-teal-400/10 text-teal-aa dark:text-teal-aa-light flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                  </div>
                                  <div>
                                    <span className="text-xs text-slate-aa dark:text-night-muted font-bold uppercase tracking-wider block">{t.packSize}</span>
                                    <span className="text-sm text-brand-navy dark:text-night-text font-semibold leading-relaxed mt-0.5 block whitespace-pre-line">
                                      {product.packSize}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Enquire button */}
                            <a
                              href={emailHref}
                              className="w-full py-3 px-4 rounded-xl bg-brand-orange-aa hover:bg-brand-navy text-white text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow flex items-center justify-center gap-2 group/btn cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5 text-white group-hover/btn:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {t.enquire} {product.name}
                            </a>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="text-center py-16 bg-slate-50 dark:bg-night-900 border border-dashed border-slate-200 dark:border-night-600 rounded-2xl col-span-full">
                  <p className="text-slate-600 dark:text-night-soft text-sm">{t.noResults}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                    className="mt-4 inline-flex items-center min-h-11 px-6 rounded-full border-2 border-brand-navy/20 dark:border-night-soft/20 hover:border-brand-navy dark:hover:border-night-soft text-brand-navy dark:text-night-text text-sm font-semibold transition-colors cursor-pointer"
                  >
                    {t.clearSearch}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
