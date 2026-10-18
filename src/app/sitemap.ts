import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Pages for search engines, as their canonical URLs. /launch is left out because it's noindexed.
// Add new pages here. No lastModified: Google ignores dates that aren't kept accurate.
const PAGES = [
  "/",
  "/about",
  "/products",
  "/research",
  "/insights",
  "/careers",
  "/contact",
  "/chat",
  "/chat/kukku",
  "/chat/mikku",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((path) => ({ url: path === "/" ? SITE_URL : `${SITE_URL}${path}` }));
}
