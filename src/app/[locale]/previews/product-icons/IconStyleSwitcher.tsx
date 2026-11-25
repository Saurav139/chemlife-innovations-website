"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";

export interface IconStyleOption {
  id: string;
  label: string;
  note: string;
  /** Every icon in this style, in a row. */
  sheet: ReactNode;
  /** A product's technical sections drawn with this style. */
  sections: ReactNode;
}

/** The icon styles side by side, then a product page's technical sections in the chosen one. */
export default function IconStyleSwitcher({ product, options, legend }: { product: string; options: IconStyleOption[]; legend: string }) {
  const [chosen, setChosen] = useState(options[0].id);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  // The chosen style is kept in the address (#solid), so a link opens on it.
  useEffect(() => {
    const sync = () => {
      const value = window.location.hash.slice(1);
      if (options.some((option) => option.id === value)) setChosen(value);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [options]);

  const index = options.findIndex((option) => option.id === chosen);
  const select = (next: number, focus = false) => {
    const wrapped = (next + options.length) % options.length;
    setChosen(options[wrapped].id);
    window.history.replaceState(null, "", `#${options[wrapped].id}`);
    if (focus) tabs.current[wrapped]?.focus();
  };

  return (
    <main id="main" tabIndex={-1} className="bg-white pt-28 md:pt-36">
      <div className="max-w-[1200px] mx-auto px-6 pb-6">
        <Link href="/previews" className="text-sm font-semibold text-brand-navy/70 hover:text-brand-navy">← Design previews</Link>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-navy mt-3">Product page icons</h1>
        <p className="text-brand-navy/70 mt-2 max-w-2xl">
          Four styles for the icons in a product page&apos;s technical sections. Compare them here, then pick one to see it on {product}&apos;s page below.
        </p>

        {/* Every style at once: pick a row to see it on the page. */}
        <ul className="mt-6 rounded-2xl border border-slate-200 divide-y divide-slate-200 overflow-hidden">
          {options.map((option, i) => (
            <li key={option.id} className={option.id === chosen ? "bg-slate-50" : "bg-white"}>
              <button type="button" onClick={() => select(i)} aria-pressed={option.id === chosen} className="w-full text-left px-4 md:px-6 py-4 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6">
                <span className="lg:w-36 flex-shrink-0 flex items-center gap-2 font-bold text-brand-navy">
                  <span aria-hidden="true" className={`w-7 h-7 rounded-full text-sm flex items-center justify-center ${option.id === chosen ? "bg-brand-navy text-white" : "bg-slate-200 text-brand-navy"}`}>{String.fromCharCode(65 + i)}</span>
                  {option.label}
                </span>
                {option.sheet}
              </button>
            </li>
          ))}
        </ul>
        <p className="text-sm text-slate-600 mt-3">{legend}</p>
      </div>

      {/* Stays under the header while reading down the page. */}
      <div className="sticky top-32 z-30 bg-white/95 border-y border-slate-200">
        <div className="max-w-[1200px] mx-auto px-6 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <div role="tablist" aria-label="Icon styles" className="flex flex-wrap gap-2">
            {options.map((option, i) => (
              <button
                key={option.id}
                ref={(el) => { tabs.current[i] = el; }}
                type="button"
                role="tab"
                id={`tab-${option.id}`}
                aria-selected={chosen === option.id}
                aria-controls="icon-style-preview"
                tabIndex={chosen === option.id ? 0 : -1}
                onClick={() => select(i)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight") { event.preventDefault(); select(i + 1, true); }
                  if (event.key === "ArrowLeft") { event.preventDefault(); select(i - 1, true); }
                }}
                className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors duration-200 ${
                  chosen === option.id ? "border-brand-navy bg-brand-navy text-white" : "border-brand-navy/20 text-brand-navy hover:border-brand-navy"
                }`}
              >
                <span aria-hidden="true" className="mr-2 opacity-70">{String.fromCharCode(65 + i)}</span>
                {option.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-700 flex-1 min-w-60">{options[index].note}</p>
        </div>
      </div>

      <div id="icon-style-preview" role="tabpanel" aria-labelledby={`tab-${chosen}`} key={chosen}>
        {options[index].sections}
      </div>
    </main>
  );
}
