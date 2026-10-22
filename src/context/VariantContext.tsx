"use client";

import { createContext, useContext, ReactNode } from "react";

export type Variant = "A";

export interface VariantTheme {
  label: string;
  description: string;
  /**
   * Hero
   */
  heroBg: string;
  heroTagline: string;
  heroHeading: string;
  heroAccent: string;
  heroText: string;
  heroCtaPrimary: string;
  heroCtaPrimaryText: string;
  heroCtaSecondary: string;
  heroCtaSecondaryText: string;
  heroBottomGradient: string;

  /**
   * Company Highlights
   */
  highlightsBg: string;
  highlightsTagline: string;
  highlightsCounterText: string;
  highlightsCounterLabel: string;

  /**
   * Products / Cards
   */
  productsSectionBg: string;
  cardBg: string;
  cardTitle: string;
  cardText: string;
  cardHoverBorder: string;
  cardImageOverlay: string;
  cardTagline: string;

  /**
   * How We Do (Process)
   */
  processBg: string;
  processTagline: string;
  processTitle: string;
  processText: string;
  processCircleBg: string;
  processCircleText: string;
  processLineColor: string;

  /**
   * Awards
   */
  awardsBg: string;
  awardsAccent: string;
  awardsCardBg: string;
  awardsCardBorder: string;

  /**
   * Testimonials
   */
  testimonialsBg: string;
  testimonialsTagline: string;
  testimonialsTitle: string;
  testimonialsText: string;
  testimonialsName: string;
  testimonialsRole: string;
  testimonialDot: string;
  testimonialDotActive: string;
  testimonialQuote: string;
}

const theme: VariantTheme = {
  label: "ChemLife Brand",
  description: "Warm orange hero, navy accents, professional biotech feel",

  heroBg: "bg-brand-navy",
  heroTagline: "text-white/80",
  heroHeading: "text-white",
  heroAccent: "text-teal-400",
  heroText: "text-white/90",
  heroCtaPrimary: "border-2 border-teal-400 text-teal-400 bg-transparent hover:bg-teal-400 hover:text-brand-navy",
  heroCtaPrimaryText: "text-brand-navy",
  heroCtaSecondary: "border-2 border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-brand-navy",
  heroCtaSecondaryText: "text-brand-navy",
  heroBottomGradient: "from-warm-white",

  highlightsBg: "bg-brand-navy",
  highlightsTagline: "text-teal-400",
  highlightsCounterText: "text-brand-orange",
  highlightsCounterLabel: "text-white/80",

  productsSectionBg: "bg-warm-light",
  cardBg: "bg-white",
  cardTitle: "text-near-black",
  cardText: "text-muted",
  cardHoverBorder: "hover:border-brand-orange/20",
  cardImageOverlay: "from-black/20",
  cardTagline: "text-brand-orange",

  processBg: "bg-brand-navy",
  processTagline: "text-brand-orange",
  processTitle: "text-white",
  processText: "text-white/60",
  processCircleBg: "bg-teal-400",
  processCircleText: "text-brand-navy",
  processLineColor: "bg-brand-navy",

  awardsBg: "bg-warm-white",
  awardsAccent: "text-brand-orange",
  awardsCardBg: "bg-white",
  awardsCardBorder: "border-brand-orange/20",

  testimonialsBg: "bg-brand-navy",
  testimonialsTagline: "text-brand-orange",
  testimonialsTitle: "text-white",
  testimonialsText: "text-white/80",
  testimonialsName: "text-white",
  testimonialsRole: "text-white/85",
  testimonialDot: "bg-white/30",
  testimonialDotActive: "bg-brand-orange",
  testimonialQuote: "text-brand-orange/40",
};

const VariantContext = createContext<{
  theme: VariantTheme;
}>({
  theme: theme,
});

export function VariantProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <VariantContext.Provider value={{ theme }}>
      {children}
    </VariantContext.Provider>
  );
}

export function useTheme() {
  return useContext(VariantContext);
}
