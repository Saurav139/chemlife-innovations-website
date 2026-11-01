"use client";

import { useEffect, useState } from "react";
import Clarity from "./Clarity";
import Immersive from "./Immersive";
import Bento from "./Bento";
import Finder from "./Finder";
import Science from "./Science";

const DESIGNS = [
  { id: "clarity", label: "Clarity", note: "Clean and corporate: white and navy, one message per section, cards in a calm grid.", Page: Clarity },
  { id: "immersive", label: "Immersive", note: "Photo-led: full-width pictures carry each section, with large, simple text on them.", Page: Immersive },
  { id: "bento", label: "Bento", note: "Tiles: a soft grey page where every part of the story is its own rounded tile.", Page: Bento },
  { id: "finder", label: "Product finder", note: "Product-first: pick your animals or search, and the products come first.", Page: Finder },
  { id: "science", label: "Science", note: "Technology-first: an animated molecule, the five research platforms and the lab-to-farm pipeline.", Page: Science },
] as const;
type Design = (typeof DESIGNS)[number]["id"];

/** The five homepage designs, one at a time, with a switcher fixed at the bottom of the screen. */
export default function HomepageFive() {
  const [design, setDesign] = useState<Design>("clarity");
  useEffect(() => {
    const sync = () => {
      const value = window.location.hash.slice(1);
      if (DESIGNS.some((d) => d.id === value)) setDesign(value as Design);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const select = (id: Design) => {
    setDesign(id);
    window.history.replaceState(null, "", `#${id}`);
    window.scrollTo({ top: 0 });
  };
  const current = DESIGNS.find((d) => d.id === design)!;

  return <>
    <main id="main" tabIndex={-1} aria-label={`Homepage design: ${current.label}`}>
      <current.Page key={design} />
    </main>
    <nav aria-label="Homepage designs" className="fixed z-[45] bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-max">
      <div className="rounded-2xl bg-brand-navy/95 backdrop-blur text-white shadow-2xl p-2">
        <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none]">
          <a href="/previews" className="shrink-0 px-3 min-h-10 inline-flex items-center text-sm font-semibold text-white/80 hover:text-white">←</a>
          {DESIGNS.map((d, i) => <button key={d.id} type="button" onClick={() => select(d.id)} aria-pressed={design === d.id} aria-label={d.label}
            className={`shrink-0 inline-flex items-center justify-center gap-2 min-h-10 min-w-10 px-3 sm:px-3.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors ${design === d.id ? "bg-white text-brand-navy" : "hover:bg-white/10"}`}>
            <span aria-hidden="true" className="sm:opacity-60">{String.fromCharCode(65 + i)}</span><span aria-hidden="true" className="hidden sm:inline">{d.label}</span>
          </button>)}
        </div>
        <p className="px-3 pt-1.5 pb-0.5 text-xs text-white/80"><strong className="text-white sm:hidden">{current.label}. </strong><span className="hidden md:inline">{current.note}</span></p>
      </div>
    </nav>
  </>;
}
