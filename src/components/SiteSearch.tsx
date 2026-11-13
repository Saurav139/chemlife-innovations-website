"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useHref, useLocale, useT } from "@/i18n/LocaleProvider";
import type { Messages } from "@/i18n/messages";
import { goToResult } from "@/lib/deepLink";
import type { Insights } from "@/lib/insights";
import { buildSearchIndex, highlight, searchSite, type SearchCategory, type SearchOutcome, type SearchTerm } from "@/lib/siteSearch";

// What the search looks through, and how it matches and ranks, is in src/lib/siteSearch.ts.

const SUGGESTIONS = ["MaxDmold", "ANBioT", "Toxin binder", "Dairy", "Internships", "Feed Bites"];

const BADGE: Record<SearchCategory, string> = {
  Page: "bg-blue-50 text-blue-600 border border-blue-100",
  Product: "bg-teal-50 text-teal-aa border border-teal-100",
  Research: "bg-purple-50 text-purple-600 border border-purple-100",
  Career: "bg-amber-50 text-amber-700 border border-amber-100",
  Article: "bg-orange-50/50 text-brand-orange-aa border border-orange-100",
  Video: "bg-orange-50/50 text-brand-orange-aa border border-orange-100",
  Podcast: "bg-orange-50/50 text-brand-orange-aa border border-orange-100",
};

const NOTHING: SearchOutcome = { results: [], partial: false, terms: [] };

/** Text with the words the search matched picked out. */
function Matched({ text, terms, className }: { text: string; terms: SearchTerm[]; className: string }) {
  return (
    <>
      {highlight(text, terms).map((part, i) =>
        part.hit ? (
          <mark key={i} className={className}>
            {part.text}
          </mark>
        ) : (
          part.text
        ),
      )}
    </>
  );
}

/** `hideButtonOnPhones`: leave out the floating button on phones (the chat page, where it would cover the message
 *  box). Ctrl/Cmd + K still opens the search. */
export default function SiteSearch({ hideButtonOnPhones = false }: { hideButtonOnPhones?: boolean }) {
  const router = useRouter();
  const t = useT();
  const href = useHref();
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [insights, setInsights] = useState<Insights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [english, setEnglish] = useState<Messages | null>(null);
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

  // The box takes the keyboard as soon as the search opens, so typing straight after Ctrl+K loses no letters.
  useEffect(() => {
    if (isOpen) inputRef.current?.focus({ preventScroll: true });
    else setQuery("");
  }, [isOpen]);

  // The Insights list (articles, videos, podcasts) loads the first time the search opens, so pages don't carry it.
  useEffect(() => {
    if (!isOpen || insights) return;
    setInsightsLoading(true);
    fetch("/api/insights")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: Insights | null) => data && setInsights(data))
      .catch(() => {
        // Search still works for pages, products, research and careers.
      })
      .finally(() => setInsightsLoading(false));
  }, [isOpen, insights]);

  // On a page in another language, the English text loads too, so "mold inhibitor" still finds MaxDmold there.
  useEffect(() => {
    if (!isOpen || locale === "en" || english) return;
    import("@/i18n/messages/en").then((messages) => setEnglish(messages.default)).catch(() => {});
  }, [isOpen, locale, english]);

  // Built when the search first opens. Products, research topics and internships come in the page's language;
  // Insights is English only.
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    if (isOpen) setOpened(true);
  }, [isOpen]);
  const index = useMemo(() => (opened ? buildSearchIndex({ messages: t, english: english ?? undefined, href, insights }) : null), [opened, t, english, href, insights]);

  const outcome = useMemo(() => (index ? searchSite(index, query) : NOTHING), [index, query]);
  const filteredResults = outcome.results;
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
      {/* Floating Search Button on Bottom-Left, centred level with the chat bubble on the right: that bubble is 60px
          tall on phones and tablets and 72px from laptops up, this button 48px, so it sits 6px higher (12px from
          laptops up) than the bubble's 16px (24px from tablets up) from the bottom. It also
          moves with the bubble onto the homepage hero's numbers strip (--float-lift, set by the hero). */}
      <div className={`fixed bottom-[calc(max(1rem,env(safe-area-inset-bottom))+6px)] left-[max(1rem,env(safe-area-inset-left))] md:bottom-[30px] lg:bottom-9 md:left-6 z-50 [transform:translateY(calc(-1*var(--float-lift,0px)))] transition-transform duration-300 motion-reduce:transition-none ${hideButtonOnPhones ? "max-md:hidden" : ""}`}>
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
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  enterKeyHint="search"
                  className="w-full text-base md:text-sm pl-11 pr-14 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-brand-navy focus:ring-1 focus:ring-brand-navy text-slate-800 placeholder-slate-aa focus:bg-white transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close search"
                  className="absolute right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-aa hover:text-slate-700 transition-colors cursor-pointer"
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
                    <p className="text-xs font-bold text-slate-aa uppercase tracking-wider mb-3 px-2">
                      Suggested Topics
                    </p>
                    <div className="flex flex-wrap gap-2 px-2">
                      {SUGGESTIONS.map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="inline-flex items-center min-h-9 px-3.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-sm font-semibold text-slate-600 cursor-pointer transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : filteredResults.length > 0 ? (
                  // Search Results
                  <>
                    {outcome.partial && (
                      <p role="presentation" className="px-3 pt-1 pb-2 text-xs text-slate-500">
                        Nothing matches all of &ldquo;<span className="font-semibold text-slate-600">{query.trim()}</span>&rdquo;. The closest results:
                      </p>
                    )}
                    {filteredResults.map((item, i) => (
                      <button
                        key={item.link}
                        id={`search-result-${i}`}
                        data-index={i}
                        role="option"
                        aria-selected={i === active}
                        tabIndex={-1}
                        onClick={() => handleResultClick(item.link)}
                        onMouseMove={() => setActive(i)}
                        className={`w-full text-left p-3 border rounded-xl transition-colors flex items-start gap-4 group cursor-pointer ${i === active ? "bg-slate-50 border-slate-200" : "border-transparent"}`}
                      >
                        {/* Badge indicator */}
                        <span
                          className={`w-[4.75rem] text-center text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 mt-0.5 rounded-md shrink-0 ${BADGE[item.category]}`}
                        >
                          {item.category}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-heading text-sm font-bold transition-colors ${i === active ? "text-brand-orange-aa" : "text-slate-800"}`}>
                            <Matched text={item.title} terms={outcome.terms} className="bg-teal-100/80 text-inherit rounded-[3px]" />
                          </p>
                          <p className="text-xs text-slate-500 leading-normal line-clamp-2 mt-0.5 font-normal">
                            <Matched text={item.snippet} terms={outcome.terms} className="bg-transparent font-semibold text-slate-800" />
                          </p>
                        </div>
                      </button>
                    ))}
                  </>
                ) : insightsLoading ? (
                  // Articles, videos and podcasts are still on their way
                  <p className="text-center py-10 text-slate-aa text-sm font-normal">Searching…</p>
                ) : (
                  // No results state
                  <div className="text-center py-8 font-normal">
                    <p className="text-slate-aa text-sm">
                      No matching pages, products or articles found for &ldquo;<span className="font-semibold text-slate-600">{query}</span>&rdquo;.
                    </p>
                    <p className="text-xs text-slate-500 mt-4 mb-2.5">Try one of these, or a product name:</p>
                    <div className="flex flex-wrap justify-center gap-2 px-2">
                      {SUGGESTIONS.map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="inline-flex items-center min-h-9 px-3.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-sm font-semibold text-slate-600 cursor-pointer transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Tells screen readers how many results there are, as they change */}
              <p className="sr-only" role="status">
                {query.trim() === "" ? "" : filteredResults.length === 0 ? (insightsLoading ? "Searching" : "No results") : `${filteredResults.length} result${filteredResults.length === 1 ? "" : "s"}`}
              </p>

              {/* Keyboard hints (desktop only: there's no keyboard to hint at on a phone) */}
              <div className="hidden md:flex px-5 py-2.5 bg-slate-50 border-t border-slate-100 items-center gap-4 text-xs text-slate-aa">
                <span><kbd className="font-sans font-semibold text-slate-600">↑ ↓</kbd> to move</span>
                <span><kbd className="font-sans font-semibold text-slate-600">Enter</kbd> to open</span>
                <span><kbd className="font-sans font-semibold text-slate-600">Esc</kbd> to close</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
