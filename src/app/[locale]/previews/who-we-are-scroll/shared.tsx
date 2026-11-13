"use client";

import { useHref, useT } from "@/i18n/LocaleProvider";

export const easeOut = [0.25, 0.1, 0, 1] as const;

// A pinned panel sits just below the fixed header (h-32) and fills the rest of the screen.
export const PINNED = "sticky top-32 h-[calc(100svh-8rem)]";

export function useWhoWeAre() {
  return useT().home.whoWeAre;
}

export function Actions({ light = false, center = false }: { light?: boolean; center?: boolean }) {
  const t = useWhoWeAre();
  const href = useHref();
  const actions = [
    { label: t.exploreProducts, path: "/products" },
    { label: t.seeResearch, path: "/research" },
    { label: t.meetLeadership, path: "/about" },
    { label: t.requestDossier, path: "/contact?type=dossier" },
  ];
  const outline = light ? "border-white/40 hover:border-white text-white" : "border-brand-navy/20 hover:border-brand-navy text-brand-navy";
  return <div className={`flex flex-wrap gap-3 ${center ? "justify-center" : ""}`}>
    {actions.map((action, i) => <a key={action.path} href={href(action.path)}
      className={`inline-flex items-center justify-center min-h-12 px-7 rounded-full font-semibold transition-colors ${i === 0 ? "bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white" : `border-2 ${outline}`}`}>
      {action.label}
    </a>)}
  </div>;
}

/** The closing lines every version ends on: the leadership caption and the buttons. */
export function Closing({ light = false }: { light?: boolean }) {
  const t = useWhoWeAre();
  return <div className={`py-16 md:py-20 ${light ? "bg-brand-navy" : "bg-white"}`}>
    <div className="max-w-[1200px] mx-auto px-6 text-center">
      <p className={`text-sm max-w-3xl mx-auto ${light ? "text-white/75" : "text-slate-600"}`}>{t.leadershipCaption}</p>
      <div className="mt-6"><Actions light={light} center /></div>
    </div>
  </div>;
}
