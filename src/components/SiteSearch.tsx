"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useHref, useT } from "@/i18n/LocaleProvider";
import { INTERNSHIP_ROLES, PRODUCTS, RESEARCH_TOPICS, insightAnchor, productAnchor, researchAnchor, roleAnchor } from "@/lib/catalog";
import { goToResult } from "@/lib/deepLink";
import type { Insights } from "@/lib/insights";

type Category = "Page" | "Product" | "Research" | "Career" | "Article" | "Video" | "Podcast";

interface SearchItem {
  title: string;
  category: Category;
  description: string;
  /** Where the result goes: a page, or one item on it (/products#product-maxdmold). */
  link: string;
  /** Extra words that match but aren't shown. */
  keywords: string;
}

// The site's pages. Products, research topics, internships and Insights are added from their own data below, each
// linking straight to the item.
const PAGES: Omit<SearchItem, "category">[] = [
  { title: "Home", link: "/", description: "Nature-driven functional feed additives and our process, from research to delivery.", keywords: "home main overview chemlife process awards partners" },
  { title: "About Us", link: "/about", description: "Our mission, core values and leadership team.", keywords: "about mission vision values leadership team founders gift" },
  { title: "Products & Solutions", link: "/products", description: "All our feed additives for poultry, swine, dairy and cattle.", keywords: "products solutions additives feed poultry swine dairy cattle catalogue" },
  { title: "Research & Development", link: "/research", description: "Our research pipeline, including ANBioT bio-transformation.", keywords: "research technology science innovation pipeline dossier" },
  { title: "Insights", link: "/insights", description: "Articles, videos and podcasts on feed hygiene, gut health and chelation.", keywords: "insights blogs articles podcasts videos news learning" },
  { title: "Careers", link: "/careers", description: "Internships at ChemLife and how to apply.", keywords: "careers jobs internships hiring openings apply" },
  { title: "Contact Us", link: "/contact", description: "Send us a message, or find our office and plant.", keywords: "contact email address phone office location enquiry nutritionist" },
  { title: "AI Experts", link: "/chat", description: "Ask Dr. Kukku (poultry) or Dr. Mikku (dairy), our AI nutrition assistants.", keywords: "chat ai assistant kukku mikku chatbot ask" },
];

const SUGGESTIONS = ["MaxDmold", "ANBioT", "Mould", "Ruminants", "Internships", "Feed Bites"];

const BADGE: Record<Category, string> = {
  Page: "bg-blue-50 dark:bg-blue-400/10 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-night-600",
  Product: "bg-teal-50 dark:bg-teal-400/10 text-teal-aa dark:text-teal-aa-light border border-teal-100 dark:border-night-600",
  Research: "bg-purple-50 text-purple-600 border border-purple-100",
  Career: "bg-amber-50 dark:bg-amber-400/10 text-amber-700 dark:text-amber-200 border border-amber-100 dark:border-night-600",
  Article: "bg-orange-50/50 dark:bg-orange-400/10 text-brand-orange-aa dark:text-brand-orange border border-orange-100 dark:border-night-600",
  Video: "bg-orange-50/50 dark:bg-orange-400/10 text-brand-orange-aa dark:text-brand-orange border border-orange-100 dark:border-night-600",
  Podcast: "bg-orange-50/50 dark:bg-orange-400/10 text-brand-orange-aa dark:text-brand-orange border border-orange-100 dark:border-night-600",
};

// British and American spellings both match ("mould" finds "mold" and the other way round).
const spellings = (word: string) => [word, word.replace(/mould/g, "mold"), word.replace(/mold/g, "mould")];

/** Results that contain every word typed, best first: title matches, then the rest in index order. */
function search(items: SearchItem[], query: string): SearchItem[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const phrase = words.join(" ");
  return items
    .map((item, order) => {
      const title = item.title.toLowerCase();
      const text = `${title} ${item.description.toLowerCase()} ${item.keywords.toLowerCase()}`;
      const has = (haystack: string, word: string) => spellings(word).some((form) => haystack.includes(form));
      if (!words.every((word) => text.includes(word) || has(text, word))) return null;
      const score = title.startsWith(phrase) ? 3 : title.includes(phrase) ? 2 : words.every((word) => has(title, word)) ? 1 : 0;
      return { item, score, order };
    })
    .filter((result): result is { item: SearchItem; score: number; order: number } => result !== null)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, 25)
    .map((result) => result.item);
}

/** `hideButtonOnPhones`: leave out the floating button on phones (the chat page, where it would cover the message
 *  box). Ctrl/Cmd + K still opens the search. */
export default function SiteSearch({ hideButtonOnPhones = false }: { hideButtonOnPhones?: boolean }) {
  const router = useRouter();
  const t = useT();
  const href = useHref();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [insights, setInsights] = useState<Insights | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cmd/Ctrl + K opens the search; Escape closes it.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === "Escape") {
        setIsOpen(false);
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

  // The Insights list (articles, videos, podcasts) loads the first time the search opens, so pages don't carry it.
  useEffect(() => {
    if (!isOpen || insights) return;
    fetch("/api/insights")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: Insights | null) => data && setInsights(data))
      .catch(() => {
        // Search still works for pages, products, research and careers.
      });
  }, [isOpen, insights]);

  // Products, research topics and internships come in the page's language; Insights is English only.
  const index = useMemo<SearchItem[]>(() => {
    const pages = PAGES.map((page) => ({ ...page, category: "Page" as const, link: href(page.link) }));
    const products = PRODUCTS.map((product, i) => {
      const text = t.products.items[i];
      return {
        title: product.name,
        category: "Product" as const,
        description: text.tagline ?? text.about,
        link: href(`/products#${productAnchor(product.name)}`),
        keywords: [product.category, text.about, ...text.features].join(" "),
      };
    });
    const research = RESEARCH_TOPICS.map((topic, i) => {
      const text = t.research.topics[i];
      return {
        title: text.title,
        category: "Research" as const,
        description: text.tagline,
        link: href(`/research#${researchAnchor(topic.englishTitle)}`),
        keywords: `${topic.englishTitle} ${text.preview}`,
      };
    });
    const roles = INTERNSHIP_ROLES.map((role, i) => {
      const text = t.careers.roles[i];
      return {
        title: text.title,
        category: "Career" as const,
        description: text.department,
        link: href(`/careers#${roleAnchor(role.id)}`),
        keywords: `${role.englishTitle} ${role.englishDepartment} internship job ${text.roleScope}`,
      };
    });
    const media = insights
      ? [...insights.blogs, ...insights.videos, ...insights.podcasts]
          .filter((item, i, all) => all.findIndex((other) => other.title === item.title) === i)
          .map((item) => ({
            title: item.title,
            category: (item.type === "Blog" ? "Article" : item.type) as Category,
            description: item.description,
            link: `/insights#${insightAnchor(item.title)}`,
            keywords: `${item.type} ${item.date}`,
          }))
      : [];
    return [...products, ...research, ...roles, ...media, ...pages];
  }, [t, href, insights]);

  const filteredResults = useMemo(() => search(index, query), [index, query]);
  // The result picked with the arrow keys (Enter opens it); back to the top one as the query changes.
  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [query]);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const handleResultClick = (link: string) => {
    setIsOpen(false);
    goToResult(link, router.push);
  };

  return (
    <>
      {/* Floating Search Button on Bottom-Left */}
      <div className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] md:bottom-6 md:left-6 z-50 ${hideButtonOnPhones ? "max-md:hidden" : ""}`}>
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
          <div className="fixed inset-0 z-[70] flex items-start justify-center pt-20 px-4">
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
              className="relative bg-white dark:bg-night-800 rounded-2xl shadow-2xl max-w-xl w-full border border-slate-100 dark:border-night-600 overflow-hidden flex flex-col z-10"
            >
              {/* Search Input Bar */}
              <div className="relative border-b border-slate-100 dark:border-night-600 p-4">
                <div className="absolute left-7 top-7 text-slate-aa dark:text-night-muted">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    // Up and down move through the results; Enter opens the highlighted one.
                    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                      e.preventDefault();
                      const last = filteredResults.length - 1;
                      setActive((i) => (e.key === "ArrowDown" ? (i >= last ? 0 : i + 1) : i <= 0 ? last : i - 1));
                    } else if (e.key === "Enter" && filteredResults[active]) {
                      handleResultClick(filteredResults[active].link);
                    }
                  }}
                  role="combobox"
                  aria-expanded={filteredResults.length > 0}
                  aria-controls="search-results"
                  aria-activedescendant={filteredResults[active] ? `search-result-${active}` : undefined}
                  aria-label="Search the ChemLife website"
                  placeholder="Search products, research, articles…"
                  className="w-full text-base md:text-sm pl-11 pr-14 py-3 bg-slate-50 dark:bg-night-900 border border-slate-200 dark:border-night-600 rounded-xl focus:outline-hidden focus:border-brand-navy dark:focus:border-night-soft focus:ring-1 focus:ring-brand-navy text-slate-800 dark:text-night-text placeholder-slate-aa focus:bg-white dark:focus:bg-night-800 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close search"
                  className="absolute right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full hover:bg-slate-100 dark:hover:bg-night-700 flex items-center justify-center text-slate-aa dark:text-night-muted hover:text-slate-700 dark:hover:text-night-soft transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Results Area */}
              <div ref={listRef} id="search-results" role="listbox" className="max-h-[min(420px,60dvh)] overflow-y-auto p-3 flex flex-col gap-1">
                {query.trim() === "" ? (
                  // Suggested Searches
                  <div className="py-2">
                    <p className="text-xs font-bold text-slate-aa dark:text-night-muted uppercase tracking-wider mb-3 px-2">
                      Suggested Topics
                    </p>
                    <div className="flex flex-wrap gap-2 px-2">
                      {SUGGESTIONS.map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="inline-flex items-center min-h-9 px-3.5 rounded-full bg-slate-50 dark:bg-night-900 hover:bg-slate-100 dark:hover:bg-night-700 border border-slate-200 dark:border-night-600 text-sm font-semibold text-slate-600 dark:text-night-soft cursor-pointer transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : filteredResults.length > 0 ? (
                  // Search Results
                  filteredResults.map((item, i) => (
                    <button
                      key={item.link}
                      id={`search-result-${i}`}
                      data-index={i}
                      role="option"
                      aria-selected={i === active}
                      tabIndex={-1}
                      onClick={() => handleResultClick(item.link)}
                      onMouseMove={() => setActive(i)}
                      className={`w-full text-left p-3 border rounded-xl transition-colors flex items-start gap-4 group cursor-pointer ${i === active ? "bg-slate-50 dark:bg-night-900 border-slate-200 dark:border-night-600" : "border-transparent"}`}
                    >
                      {/* Badge indicator */}
                      <span
                        className={`w-[4.75rem] text-center text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 mt-0.5 rounded-md shrink-0 ${BADGE[item.category]}`}
                      >
                        {item.category}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`font-heading text-sm font-bold transition-colors ${i === active ? "text-brand-orange-aa dark:text-brand-orange" : "text-slate-800 dark:text-night-text"}`}>
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-night-muted leading-normal line-clamp-1 mt-0.5 font-normal">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  // No results state
                  <div className="text-center py-10 font-normal">
                    <span className="text-slate-aa dark:text-night-muted text-sm">
                      No matching pages, products or articles found for &ldquo;<span className="font-semibold text-slate-600 dark:text-night-soft">{query}</span>&rdquo;.
                    </span>
                  </div>
                )}
              </div>

              {/* Keyboard hints (desktop only: there's no keyboard to hint at on a phone) */}
              <div className="hidden md:flex px-5 py-2.5 bg-slate-50 dark:bg-night-900 border-t border-slate-100 dark:border-night-600 items-center gap-4 text-xs text-slate-aa dark:text-night-muted">
                <span><kbd className="font-sans font-semibold text-slate-600 dark:text-night-soft">↑ ↓</kbd> to move</span>
                <span><kbd className="font-sans font-semibold text-slate-600 dark:text-night-soft">Enter</kbd> to open</span>
                <span><kbd className="font-sans font-semibold text-slate-600 dark:text-night-soft">Esc</kbd> to close</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
