// The site's languages. English keeps the plain addresses (/products); the others are prefixed (/kn/products).
// src/proxy.ts maps the plain addresses onto the [locale] folder in src/app.

export const LOCALES = ["en", "kn", "hi"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** Remembers the language picked in the switcher. It overrides the browser's language preference (src/proxy.ts). */
export const LOCALE_COOKIE = "lang";

/** Each language's name, written in that language, for the switcher. */
export const LOCALE_NAMES: Record<Locale, string> = { en: "English", kn: "ಕನ್ನಡ", hi: "हिन्दी" };

/** Open Graph locale codes, for link previews. */
export const OG_LOCALES: Record<Locale, string> = { en: "en_IN", kn: "kn_IN", hi: "hi_IN" };

/** Pages that exist in every language. The rest (Insights, Privacy, Terms, chat) are English only for now. */
export const TRANSLATED_PATHS = ["/", "/about", "/products", "/research", "/careers", "/contact"];

/** Whether a page exists in every language: the pages above, and each product's own page (/products/maxdmold). */
export function isTranslatedPath(path: string): boolean {
  return TRANSLATED_PATHS.includes(path) || /^\/products\/[a-z0-9-]+$/.test(path);
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** The language a browser address is in, and the address without its language prefix. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const first = pathname.split("/")[1] ?? "";
  // English pages are served from /en/... behind the scenes, and the page code can see that address.
  if (isLocale(first)) return { locale: first, path: pathname.slice(first.length + 1) || "/" };
  return { locale: DEFAULT_LOCALE, path: pathname };
}

/**
 * The address of an English path in the given language, e.g. ("/products", "kn") → "/kn/products".
 * Pages that aren't translated, external links and anchors are returned unchanged.
 */
export function localizePath(href: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE || !href.startsWith("/")) return href;
  const path = href.split(/[?#]/)[0];
  if (!isTranslatedPath(path)) return href;
  return `/${locale}${path === "/" ? href.slice(1) : href}`;
}

/**
 * The site language a browser asks for first, from its Accept-Language header, e.g. "kn-IN,kn;q=0.9,en;q=0.8" → "kn".
 * Languages the site doesn't have are skipped; English is the answer when none match.
 */
export function preferredLocale(acceptLanguage: string | null): Locale {
  const ranked = (acceptLanguage ?? "")
    .split(",")
    .map((part, i) => {
      const [tag, ...params] = part.trim().toLowerCase().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { lang: tag.split("-")[0], q: q ? Number(q.slice(2)) || 0 : 1, i };
    })
    .filter((x) => x.q > 0)
    .sort((a, b) => b.q - a.q || a.i - b.i);
  return ranked.map((x) => x.lang).find(isLocale) ?? DEFAULT_LOCALE;
}
