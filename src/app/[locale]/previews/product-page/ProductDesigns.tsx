"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import DataSheet from "./DataSheet";
import Executive from "./Executive";
import Marketplace from "./Marketplace";
import SplitPanel from "./SplitPanel";
import type { PreviewProduct } from "./kit";

const DESIGNS = [
  { id: "marketplace", label: "Marketplace", Design: Marketplace, note: "Laid out like an online-store listing: pictures, key attributes and “About this item”, an enquiry box where the buy box would be, then product information tables." },
  { id: "data-sheet", label: "Data sheet", Design: DataSheet, note: "Set like the Technical Data Sheet itself: document numbers up top, a numbered index beside the page, ruled tables. The most formal." },
  { id: "executive", label: "Executive", Design: Executive, note: "Short and tabbed, as large ingredient companies do it: a white hero, the key facts on a navy bar, then four tabs instead of a long scroll." },
  { id: "split-panel", label: "Split panel", Design: SplitPanel, note: "A navy product panel with the enquiry buttons stays beside the page while the detail scrolls past in numbered chapters." },
] as const;

/** A product page in four corporate designs, for any product that has approved technical data. */
export default function ProductDesigns({ products }: { products: PreviewProduct[] }) {
  const [design, setDesign] = useState<string>(DESIGNS[0].id);
  const [productName, setProductName] = useState(products[0].name);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  // The chosen design is kept in the address (#executive), so a link opens on it.
  useEffect(() => {
    const sync = () => {
      const value = window.location.hash.slice(1);
      if (DESIGNS.some((option) => option.id === value)) setDesign(value);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const index = Math.max(0, DESIGNS.findIndex((option) => option.id === design));
  const product = products.find((item) => item.name === productName) ?? products[0];
  const { Design, note } = DESIGNS[index];
  const select = (next: number, focus = false) => {
    const wrapped = (next + DESIGNS.length) % DESIGNS.length;
    setDesign(DESIGNS[wrapped].id);
    window.history.replaceState(null, "", `#${DESIGNS[wrapped].id}`);
    window.scrollTo({ top: 0 });
    if (focus) tabs.current[wrapped]?.focus();
  };

  return (
    <main id="main" tabIndex={-1} className="bg-white pt-28 md:pt-36">
      <div className="max-w-[1280px] mx-auto px-6 pb-5">
        <Link href="/previews" className="text-sm font-semibold text-brand-navy/70 hover:text-brand-navy">← Design previews</Link>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-navy mt-3">Product page: four corporate designs</h1>
        <p className="text-brand-navy/70 mt-2 max-w-3xl">
          The same product and the same approved data in four layouts. Pick a design and a product; the bar stays with you as you read.{" "}
          <Link href={product.path} target="_blank" className="font-semibold text-brand-orange-aa hover:underline">Open the current {product.name} page</Link> to compare.
        </p>
      </div>

      {/* Stays under the header while reading down the page; on a phone it would take half the screen. */}
      <div className="lg:sticky lg:top-32 z-30 bg-white border-y border-slate-200 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-6 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-2">
          <div role="tablist" aria-label="Product page designs" className="flex flex-wrap gap-2">
            {DESIGNS.map((option, i) => (
              <button
                key={option.id}
                ref={(el) => { tabs.current[i] = el; }}
                type="button"
                role="tab"
                id={`tab-${option.id}`}
                aria-selected={index === i}
                aria-controls="product-design"
                tabIndex={index === i ? 0 : -1}
                onClick={() => select(i)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight") { event.preventDefault(); select(i + 1, true); }
                  if (event.key === "ArrowLeft") { event.preventDefault(); select(i - 1, true); }
                }}
                className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors duration-200 ${
                  index === i ? "border-brand-navy bg-brand-navy text-white" : "border-brand-navy/20 text-brand-navy hover:border-brand-navy"
                }`}
              >
                <span aria-hidden="true" className="mr-2 opacity-70">{String.fromCharCode(65 + i)}</span>
                {option.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
            Product
            <select value={product.name} onChange={(event) => setProductName(event.target.value)} className="min-h-11 rounded-full border border-brand-navy/20 bg-white px-4 font-semibold text-brand-navy">
              {products.map((item) => (
                <option key={item.name}>{item.name}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <p className="max-w-[1280px] mx-auto px-6 py-3 text-sm text-slate-700">
        <span className="font-bold text-brand-navy">{String.fromCharCode(65 + index)}. {DESIGNS[index].label}: </span>
        {note}
      </p>

      <div id="product-design" role="tabpanel" aria-labelledby={`tab-${DESIGNS[index].id}`} className="border-t border-slate-200">
        <Design key={product.name} product={product} />
      </div>
    </main>
  );
}
