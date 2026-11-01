"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import PinnedChapters from "./PinnedChapters";
import SidewaysJourney from "./SidewaysJourney";
import FeedJourney from "./FeedJourney";
import ZoomFacts from "./ZoomFacts";
import ReadAlong from "./ReadAlong";

const options = [
  { id: "chapters", label: "Pinned chapters", type: "Classic scrollytelling", note: "A photo stays pinned while six chapters scroll past it; each chapter brings in its own photo and the counter moves on." },
  { id: "sideways", label: "Sideways journey", type: "Horizontal scroll", note: "Scrolling down carries the story sideways through seven full-screen panels, with a progress bar along the bottom." },
  { id: "journey", label: "Storage to stomach", type: "Scroll-drawn path", note: "A feed pellet travels a path from nature to the farm as you scroll, lighting each stop and showing its photo and story." },
  { id: "zoom", label: "Zoom & fact deck", type: "Reveal", note: "The leadership photo opens from a small frame to the whole screen, then the ten facts turn over one at a time." },
  { id: "read", label: "Read along", type: "Text-led", note: "Large type that fills in word by word as you read, with each question pinned beside its answer." },
] as const;
type Variant = (typeof options)[number]["id"];

export default function ScrollVariations() {
  const [variant, setVariant] = useState<Variant>("chapters");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    const sync = () => {
      const value = window.location.hash.slice(1);
      if (options.some((option) => option.id === value)) setVariant(value as Variant);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const select = (id: Variant) => {
    setVariant(id);
    window.history.replaceState(null, "", `#${id}`);
  };
  const selected = options.find((option) => option.id === variant)!;

  return <main id="main" tabIndex={-1} className="min-h-screen bg-white pt-28 md:pt-32 pb-24">
    <div className="max-w-[1200px] mx-auto px-6">
      <Link href="/previews" className="text-sm font-semibold text-brand-orange-aa hover:underline">← Design previews</Link>
      <p className="text-sm font-semibold uppercase tracking-widest text-slate-500 mt-6">Homepage / Scroll-driven designs</p>
      <h1 className="font-heading text-4xl font-bold text-brand-navy mt-2">Who We Are: scrollytelling</h1>
      <p className="text-brand-navy/70 mt-3 max-w-2xl">Five ways to tell the Who We Are story as you scroll. Pick one, then scroll down slowly. <Link href="/previews/who-we-are" className="font-semibold text-brand-orange-aa hover:underline">See the other seven versions</Link>.</p>
      <div role="tablist" aria-label="Scroll-driven Who We Are designs" className="flex flex-wrap gap-2 mt-8">
        {options.map((option, index) => <button key={option.id} ref={(el) => { tabs.current[index] = el; }}
          type="button" role="tab" id={`tab-${option.id}`} aria-selected={variant === option.id} aria-controls="design-preview"
          tabIndex={variant === option.id ? 0 : -1} onClick={() => select(option.id)}
          onKeyDown={(event) => {
            const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
            if (!direction && event.key !== "Home" && event.key !== "End") return;
            event.preventDefault();
            const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (index + direction + options.length) % options.length;
            select(options[next].id); tabs.current[next]?.focus();
          }}
          className={`inline-flex items-center gap-2 min-h-11 px-4 rounded-full border font-semibold transition-colors ${variant === option.id ? "bg-brand-navy border-brand-navy text-white" : "border-slate-300 text-brand-navy hover:border-brand-navy"}`}>
          <span aria-hidden="true" className="text-xs opacity-70">{String.fromCharCode(65 + index)}</span>{option.label}
        </button>)}
      </div>
      <p className="mt-5 text-brand-navy"><strong>{selected.type}.</strong> <span className="text-slate-600">{selected.note}</span></p>
    </div>

    {/* No overflow clipping here: it would stop the pinned panels from sticking. */}
    <div id="design-preview" role="tabpanel" aria-labelledby={`tab-${variant}`} className="mt-10 border-y border-dashed border-slate-300">
      {variant === "chapters" && <PinnedChapters />}
      {variant === "sideways" && <SidewaysJourney />}
      {variant === "journey" && <FeedJourney />}
      {variant === "zoom" && <ZoomFacts />}
      {variant === "read" && <ReadAlong />}
    </div>
  </main>;
}
