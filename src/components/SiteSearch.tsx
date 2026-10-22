"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

interface SearchIndexItem {
  title: string;
  category: "Page" | "Product" | "Insight" | "Research";
  description: string;
  link: string;
  tags: string[];
}

const searchIndex: SearchIndexItem[] = [
  // Pages
  {
    title: "Home",
    category: "Page",
    description: "Welcome to ChemLife Innovations. Explore our nature-driven veterinary feed additives and holistic biotechnology process.",
    link: "/",
    tags: ["home", "main", "process", "overview", "chemlife"]
  },
  {
    title: "About Us",
    category: "Page",
    description: "Learn about ChemLife's journey, mission, values, Ayurvedic holistic vision, and leadership in biotechnology.",
    link: "/about",
    tags: ["about", "mission", "vision", "leadership", "ayurvedic", "team"]
  },
  {
    title: "Products & Solutions",
    category: "Page",
    description: "Explore our range of eco-friendly, organic feed additive solutions for livestock, poultry, and animal nutrition.",
    link: "/products",
    tags: ["products", "solutions", "additives", "feed", "poultry", "swine", "dairy", "cattle"]
  },
  {
    title: "Research & Technology",
    category: "Page",
    description: "Read about our patent-pending ANBioT bio-transformation technology and our strict biotechnology principles.",
    link: "/research",
    tags: ["research", "technology", "anbiot", "science", "patent", "innovation", "bio-transformation"]
  },
  {
    title: "Insights & Perspectives",
    category: "Page",
    description: "Stay informed with our latest scientific blogs, articles, and podcast episodes covering veterinary gut health and chelation.",
    link: "/insights",
    tags: ["insights", "blogs", "podcasts", "news", "articles", "learning", "media"]
  },
  {
    title: "Careers",
    category: "Page",
    description: "Join the ChemLife family. View open positions, team culture, benefits, and build the future of animal nutrition.",
    link: "/careers",
    tags: ["careers", "jobs", "hiring", "openings", "culture", "benefits", "team"]
  },
  {
    title: "Contact Us",
    category: "Page",
    description: "Get in touch with ChemLife sales, support, and office locations worldwide.",
    link: "/#footer",
    tags: ["contact", "email", "address", "phone", "sales", "office", "locations"]
  },
  // Products
  {
    title: "Mono-Gastric Feed Additives",
    category: "Product",
    description: "Eco-friendly concepts designed to boost immunity, health, and feed conversion ratios (FCR) in poultry and swine.",
    link: "/products",
    tags: ["poultry", "swine", "pigs", "chicken", "broilers", "mono-gastric", "gut health", "immunity"]
  },
  {
    title: "Ruminant Feed Solutions",
    category: "Product",
    description: "Innovative bio-active formulas designed to balance rumen gut flora, increase milk yield, and provide organic trace minerals.",
    link: "/products",
    tags: ["ruminants", "cattle", "dairy", "cows", "milk", "cows", "rumen", "chelated minerals"]
  },
  {
    title: "Value Addition to Feed Ingredients",
    category: "Product",
    description: "Feed additive formulas designed to optimize nutrient utilization and growth across multiple animal species.",
    link: "/products",
    tags: ["value addition", "ingredients", "growth", "feed conversion", "species", "performance"]
  },
  // Insights
  {
    title: "Gut Flora Optimization in Ruminants",
    category: "Insight",
    description: "A comprehensive blog investigating microbial feed additives and how they stabilize pH balance.",
    link: "/insights",
    tags: ["gut flora", "microbial", "ruminants", "ph balance", "blog"]
  },
  {
    title: "Dairy Feed Transitioning Podcast",
    category: "Insight",
    description: "Listen to Episode 13: Best practices for switching herds to organic chelated formulas without loss in yield.",
    link: "/insights",
    tags: ["dairy", "organic chelated", "milk yield", "transition", "podcast"]
  },
  {
    title: "Organic Trace Minerals vs Synthetics",
    category: "Insight",
    description: "A scientific article comparing absorption rates, retention indices, and bio-accumulation safety in livestock.",
    link: "/insights",
    tags: ["trace minerals", "organic", "synthetic", "absorption", "safety", "blog"]
  },
  {
    title: "Environmental Impact of Dairy Runoff",
    category: "Insight",
    description: "How advanced absorption rates in animal nutrition lead to cleaner local watersheds and eco-safe livestock farming.",
    link: "/insights",
    tags: ["environment", "runoff", "dairy", "watershed", "ecological", "blog"]
  },
  {
    title: "Micro-nutrients in Poultry Podcast",
    category: "Insight",
    description: "Listen to Episode 12: Broiler gut transformation systems and trace absorption mechanisms.",
    link: "/insights",
    tags: ["micro-nutrients", "poultry", "broilers", "absorption", "podcast"]
  },
  {
    title: "Chelation Science FAQ",
    category: "Insight",
    description: "Common questions answered regarding stability constants, metal complexes, and digestive bypass.",
    link: "/insights",
    tags: ["chelation", "faq", "stability", "bypass", "blog"]
  },
  // Research / Tech
  {
    title: "ANBioT Novel Bio-Transformation",
    category: "Research",
    description: "Our proprietary Ayurvedic Novel Bio-Transformation technology for advanced bioavailability in feed formulations.",
    link: "/research",
    tags: ["anbiot", "bio-transformation", "ayurvedic", "patented", "bioavailability"]
  }
];

export default function SiteSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Keybind listener to trigger search on Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  const filteredResults = query.trim()
    ? searchIndex.filter((item) => {
        const matchesTitle = item.title.toLowerCase().includes(query.toLowerCase());
        const matchesDesc = item.description.toLowerCase().includes(query.toLowerCase());
        const matchesTags = item.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));
        return matchesTitle || matchesDesc || matchesTags;
      })
    : [];

  const handleResultClick = (link: string) => {
    setIsOpen(false);
    router.push(link);
  };

  return (
    <>
      {/* Floating Search Button on Bottom-Left */}
      <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-50">
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="w-12 h-12 rounded-full bg-brand-orange-aa text-white flex items-center justify-center shadow-2xl hover:bg-brand-orange-aa-hover border-2 border-white/20 cursor-pointer transition-colors"
          title="Search ChemLife website (Ctrl+K)"
          aria-label="Open Site Search"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </motion.button>
      </div>

      {/* Search Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-brand-navy/60 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-100 overflow-hidden flex flex-col z-10"
            >
              {/* Search Input Bar */}
              <div className="relative border-b border-slate-100 p-4">
                <div className="absolute left-7 top-7 text-slate-aa">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search ChemLife website (e.g., ANBioT, poultry, careers...)"
                  className="w-full text-sm pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-brand-navy focus:ring-1 focus:ring-brand-navy text-slate-800 placeholder-slate-aa focus:bg-white transition-all font-medium"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-7 top-7 w-6 h-6 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-aa hover:text-slate-600 transition-colors text-sm cursor-pointer"
                  title="Close search"
                >
                  ESC
                </button>
              </div>

              {/* Results Area */}
              <div className="max-h-[350px] overflow-y-auto p-4 flex flex-col gap-2">
                {query.trim() === "" ? (
                  // Suggested Searches
                  <div className="py-2">
                    <p className="text-[10px] font-bold text-slate-aa uppercase tracking-wider mb-3 px-2">
                      Suggested Topics
                    </p>
                    <div className="flex flex-wrap gap-2 px-2">
                      {["ANBioT", "Ruminants", "Poultry", "Careers", "About Us", "Insights"].map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-150 text-xs font-semibold text-slate-600 cursor-pointer transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : filteredResults.length > 0 ? (
                  // Search Results
                  filteredResults.map((item) => (
                    <button
                      key={item.title}
                      onClick={() => handleResultClick(item.link)}
                      className="w-full text-left p-3 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-xl transition-all flex items-start gap-4 group cursor-pointer"
                    >
                      {/* Badge indicator */}
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${
                          item.category === "Page"
                            ? "bg-blue-50 text-blue-600 border border-blue-100"
                            : item.category === "Product"
                            ? "bg-teal-50 text-teal-aa border border-teal-100"
                            : item.category === "Research"
                            ? "bg-purple-50 text-purple-600 border border-purple-100"
                            : "bg-orange-50/50 text-brand-orange-aa border border-orange-100"
                        }`}
                      >
                        {item.category}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-heading text-sm font-bold text-slate-800 group-hover:text-brand-orange-aa transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 leading-normal line-clamp-1 mt-0.5 font-normal">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  // No results state
                  <div className="text-center py-10 font-normal">
                    <span className="text-slate-aa text-sm">
                      No matching pages or insights found for &ldquo;<span className="font-semibold text-slate-600">{query}</span>&rdquo;.
                    </span>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-aa font-semibold tracking-wider uppercase">
                <span>Navigate directly by clicking results</span>
                <span>ChemLife Search</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
