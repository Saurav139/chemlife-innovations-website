"use client";

import { useEffect, useState } from "react";
import Journey from "./Journey";
import JourneyBrands from "./JourneyBrands";
import JourneyDark from "./JourneyDark";
import JourneyMotion from "./JourneyMotion";
import JourneyScience from "./JourneyScience";
import Needs from "./Needs";
import Storyboard from "./Storyboard";
import Milestones from "./Milestones";
import Duality from "./Duality";
import Refined from "./Refined";

const DESIGNS = [
  { id: "journey", label: "Journey", note: "Told as you scroll: the hero's photographs part, and the four process steps pin while their pictures change.", Page: Journey },
  { id: "journey-2", label: "Journey 2", note: "Journey with the live site's rotating hero lines under \"Innovations in Bioactives\", and the partner logos scrolling sideways instead of the taglines.", Page: JourneyBrands },
  { id: "journey-2-dark", label: "Journey 2 dark", note: "Journey 2 in a dark theme: deep navy, white type, the partner logos and award marks on white.", Page: JourneyDark },
  { id: "journey-3", label: "Journey 3", note: "Journey 2 with a slow, faint network of molecules moving behind the hero titles.", Page: JourneyMotion },
  { id: "journey-4", label: "Journey 4", note: "Journey 2 with ChemLife's science moving behind the titles: chelated minerals, microencapsulation, ANBioT and mycotoxin binding.", Page: JourneyScience },
  { id: "needs", label: "Needs", note: "Arranged by what animals need: feed hygiene, gut and liver, minerals, rumen and dairy, with every product under one.", Page: Needs },
  { id: "storyboard", label: "Storyboard", note: "A front page of stories: a lead story, cards of different sizes, and Who We Are as the long read.", Page: Storyboard },
  { id: "milestones", label: "Milestones", note: "ChemLife's dated history, 2016 to today, is the spine; a line draws down the years as you read.", Page: Milestones },
  { id: "duality", label: "Nature & science", note: "Two halves that meet: the farm and plant wisdom on one side, the lab and ANBioT on the other.", Page: Duality },
  { id: "refined", label: "Refined original", note: "The staging homepage's sections, order and look, tidied into one type scale and rhythm.", Page: Refined },
] as const;
type Design = (typeof DESIGNS)[number]["id"];

/** Six more homepage designs, one at a time, with a switcher fixed at the bottom of the screen. */
export default function HomepageClaude() {
  const [design, setDesign] = useState<Design>("journey");
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
