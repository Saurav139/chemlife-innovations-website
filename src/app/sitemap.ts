import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { LOCALES, TRANSLATED_PATHS, localizePath } from "@/i18n/config";

// Pages for search engines, as their canonical URLs. /launch is left out because it's noindexed.
// Translated pages are also listed in Kannada and Hindi, each with its language alternates. Add new pages here. No lastModified: Google ignores dates that aren't kept accurate.
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
  "/privacy",
  "/terms",
];

const url = (path: string) => (path === "/" ? SITE_URL : `${SITE_URL}${path}`);

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap((path) => {
    if (!TRANSLATED_PATHS.includes(path)) return [{ url: url(path) }];
    const languages = Object.fromEntries(LOCALES.map((l) => [l, url(localizePath(path, l))]));
    return LOCALES.map((l) => ({ url: url(localizePath(path, l)), alternates: { languages } }));
  });
}
