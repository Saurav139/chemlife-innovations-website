import { isLiveHost } from "@/lib/seo";

// Design mock-ups shown to approvers on staging, from the header's "Design previews" button. Most are standalone
// HTML pages in src/previews, served as-is by src/app/previews/[slug]/route.ts; an entry with `href` is a page of
// the site instead. Never shown on the live site.
export const PREVIEWS = [
  {
    slug: "landscape-homepage",
    file: "landscape-homepage.html",
    title: "Homepage: living landscape",
    description: "A full homepage redesign: an animated farm panorama hero, the ANBioT figure, the product finder and a sideways-scrolling process.",
  },
  {
    slug: "anbiot-hero-layouts",
    file: "anbiot-hero-layouts.html",
    // Opens on the stacked layout, the default option.
    anchor: "#s2",
    title: "ANBioT hero layouts",
    description: "Four ways to lay out the hero around the ANBioT animation, starting with the stacked layout, then split, arch and cycle, on navy or paper.",
  },
  {
    slug: "mould-loss-calculator",
    file: "mould-loss-calculator.html",
    title: "Mould-loss calculator",
    description: "Farmers enter their feed, feed price and mould losses to see what prevention saves a year, based on the worked example in our Economics of Prevention article.",
  },
  {
    slug: "research-pages",
    href: "/previews/research",
    title: "Research platform pages",
    description: "The Research page, with each of the five platforms opening its own page: an animated figure, how it works, why it matters and the products built on it.",
  },
] as const;

/** Previews show everywhere except the live site, so they can be checked locally too. */
export function previewsAllowed(host: string): boolean {
  return host !== "" && !isLiveHost(host);
}
