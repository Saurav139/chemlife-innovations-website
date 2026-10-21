import { isLiveHost } from "@/lib/seo";

// Design mock-ups shown to approvers on staging, from the header's "Design previews" button. Each is a
// standalone HTML page in src/previews, served as-is by src/app/previews/[slug]/route.ts. Never shown on the live site.
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
    title: "ANBioT hero layouts",
    description: "Four ways to lay out the hero around the ANBioT animation: split, stacked, arch and cycle, on navy or paper.",
  },
] as const;

/** Previews show everywhere except the live site, so they can be checked locally too. */
export function previewsAllowed(host: string): boolean {
  return host !== "" && !isLiveHost(host);
}
