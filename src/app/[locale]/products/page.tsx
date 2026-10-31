"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
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

      <main id="main" tabIndex={-1}>
        {/* Card animations follow the visitor's "reduce motion" setting */}
        <MotionConfig reducedMotion="user">
        {/* Hero and product list are plain sections: they're in the first screen, so they show without waiting for a fade-in.
            The hero image is the page's largest paint (LCP), so it loads first. */}
        <PageHero
          title={`${t.titleStart} ${t.titleAccent}`}
          intro={t.intro}
          image={Images.process.delivery}
          imageAlt={t.heroAlt}
          imagePosition="50% 40%"
        />

        {/* Products List Section */}
        <section className="pt-4 pb-20 md:pb-28 lg:pb-36">
          <div className="frame">

            {/* Left-Aligned Search and Category Selector Container */}
            <div className="flex flex-col md:flex-row items-center gap-4 mb-10 w-full">
              {/* Phones: the species filter gets its own row, so the search box has room for its placeholder */}
              <div className={`flex flex-col sm:flex-row sm:items-center bg-surface rounded-3xl sm:rounded-full w-full md:max-w-xl ${activeStyle.focus} focus-within:ring-2 transition-shadow duration-300 relative`}>
                <div className="flex items-center flex-1 min-w-0">
                {/* Search Icon */}
                <div className={`pl-4 ${activeStyle.icon} flex-shrink-0 transition-colors duration-300`}>
                  <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="w-full min-w-0 bg-transparent border-0 px-3 py-3 text-ink placeholder-slate-aa focus:outline-none focus:ring-0 text-base [&::-webkit-search-cancel-button]:appearance-none"
                />

                {/* Clear Search Button */}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    aria-label={t.clearSearch}
                    className={`mr-2 text-slate-aa ${activeStyle.accent} transition-colors duration-250 cursor-pointer`}
                  >
                    <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                </div>

                {/* Category Dropdown Selector inside Search Bar */}
                <div className="relative flex-shrink-0">
                  <select
                    aria-label={t.filterBySpecies}
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full sm:w-auto appearance-none bg-transparent pl-4 pr-10 py-3.5 font-semibold text-base text-ink focus:outline-none cursor-pointer"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category} className="text-brand-navy font-semibold">
                        {category === "All" ? t.allSpecies : t.categories[category as keyof typeof t.categories]}
                      </option>
                    ))}
                  </select>
                  {/* Dropdown Chevron Icon */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-aa pointer-events-none">
                    <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* For screen readers: the product cards (h3) sit under this heading */}
            <h2 className="sr-only">{t.listHeading}</h2>
            <p className="sr-only" role="status">
              {searchQuery || selectedCategory !== "All"
                ? t.resultsCount.replace("{count}", String(filteredProducts.length)).replace("{total}", String(productsData.length))
                : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {filteredProducts.map((product) => {
                const isExpanded = expandedId === product.id;
                const anchor = productAnchor(product.name);
                const emailSubject = encodeURIComponent(`Product Inquiry: ${product.name}`);
                const emailBody = encodeURIComponent(
                  `Hi ChemLife Innovations team,\n\nI am writing to inquire about ${product.name}. Please share technical datasheets, pricing, and packaging options.\n\nBest regards,\n[Your Name]\n[Your Company]`
                );
                const emailHref = `mailto:innovate@chemlifeinnovations.com?subject=${emailSubject}&body=${emailBody}`;

                return (
                  <motion.div
                    key={product.id}
                    id={anchor}
                    data-analytics-item={product.name}
                    layout
                    transition={{ duration: 0.4, ease: easeOut }}
                    className="scroll-mt-28 bg-surface overflow-hidden flex flex-col h-fit group"
                  >
                    {/* Card Header (Image/Icon + Title & Category) */}
                    <div
                      onClick={() => toggleExpand(product.id)}
                      data-analytics-click={isExpanded ? "Show Less" : "Learn More"}
                      className="cursor-pointer select-none flex flex-col"
                    >
                      {/* Top: Product Image or Icon Container */}
                      {product.banner ? (
                        <div className="w-full aspect-video relative overflow-hidden bg-surface">
                          <Image
                            src={product.banner}
                            alt={`${product.name} ${t.bannerAlt}`}
                            fill
                            sizes={BANNER_SIZES}
                            className="object-cover object-center group-hover:scale-102 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-video bg-white flex items-center justify-center p-6 relative">
                          <div className="w-20 h-20 flex items-center justify-center p-2.5">
                            <div className="relative w-full h-full">
                              <Image
                                src={product.icon}
                                alt={`${product.name} ${t.iconAlt}`}
                                fill
                                sizes="60px"
                                className="object-contain"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Content: Title & Category */}
                      <div className="p-5 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-3">
                          <h3 id={`${anchor}-name`} className="text-lead font-bold leading-tight">
                            {product.name}
                          </h3>

                          <span className="text-small text-ink-soft whitespace-nowrap pt-1">
                            {t.categories[product.category as keyof typeof t.categories]}
                          </span>
                        </div>

                        {product.tagline && (
                          <p>
                            {product.tagline}
                          </p>
                        )}

                        {/* A real button, so the card opens from the keyboard and screen readers hear "collapsed"/"expanded".
                            Its click reaches the card header above, which does the opening. */}
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          aria-controls={`${anchor}-details`}
                          aria-describedby={`${anchor}-name`}
                          className="flex items-center gap-1.5 w-fit min-h-11 -mt-1 -mb-3 text-accent font-bold cursor-pointer rounded-md"
                        >
                          <span>{isExpanded ? t.showLess : t.readMore}</span>
                          <motion.span
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                          </motion.span>
                        </button>
                      </div>
                    </div>

                    {/* Expandable Body */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          id={`${anchor}-details`}
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.4, ease: easeOut }}
                          className="overflow-hidden bg-white"
                        >
                          <div className="p-5 space-y-5">
                            {/* About section */}
                            <div>
                              <h4 className="font-bold mb-1.5">
                                {t.about}
                              </h4>
                              <p className="whitespace-pre-line">
                                {product.about}
                              </p>
                            </div>

                            {/* Variants section */}
                            {product.variants && product.variants.length > 0 && (
                              <div>
                                <h4 className="font-bold mb-1.5">
                                  {t.variants}
                                </h4>
                                <ul className="grid grid-cols-1 gap-1.5 font-semibold">
                                  {product.variants.map((variant, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-ink flex-shrink-0" />
                                      {variant}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Key Features section */}
                            <div>
                              <h4 className="font-bold mb-2">
                                {t.features}
                              </h4>
                              <ul className="space-y-2">
                                {product.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <svg aria-hidden="true" className="w-4 h-4 text-ink mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="leading-tight">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Usage & Presentation section */}
                            <div className="space-y-3">
                              <h4 className="font-bold">
                                {t.usage}
                              </h4>

                              <div className="space-y-2.5">
                                {/* Inclusion rate */}
                                <div className="p-4 bg-surface">
                                  <div>
                                    <span className="text-small text-ink-soft block">{t.inclusionRate}</span>
                                    <span className="font-semibold mt-0.5 block whitespace-pre-line">
                                      {product.inclusionRate}
                                    </span>
                                  </div>
                                </div>

                                {/* Pack size */}
                                <div className="p-4 bg-surface">
                                  <div>
                                    <span className="text-small text-ink-soft block">{t.packSize}</span>
                                    <span className="font-semibold mt-0.5 block whitespace-pre-line">
                                      {product.packSize}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Enquire button */}
                            <a
                              href={emailHref}
                              className="btn btn-primary w-full group/btn"
                            >
                              <svg aria-hidden="true" className="w-3.5 h-3.5 text-white group-hover/btn:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="text-center py-16 bg-surface col-span-full">
                  <p>{t.noResults}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All");
                    }}
                    className="btn btn-ink mt-4"
                  >
                    {t.clearSearch}
                  </button>
                </div>
              )}
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
