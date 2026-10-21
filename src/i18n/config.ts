// The site's languages. English keeps the plain addresses (/products); the others are prefixed (/kn/products).
// src/proxy.ts maps the plain addresses onto the [locale] folder in src/app.

export const LOCALES = ["en", "kn", "hi"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** Each language's name, written in that language, for the switcher. */
export const LOCALE_NAMES: Record<Locale, string> = { en: "English", kn: "ಕನ್ನಡ", hi: "हिन्दी" };

/** Open Graph locale codes, for link previews. */
export const OG_LOCALES: Record<Locale, string> = { en: "en_IN", kn: "kn_IN", hi: "hi_IN" };

/** Pages that exist in every language. The rest (Insights, Privacy, Terms, chat) are English only for now. */
export const TRANSLATED_PATHS = ["/", "/about", "/products", "/research", "/careers", "/contact"];

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** The language a browser address is in, and the address without its language prefix. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const first = pathname.split("/")[1] ?? "";
  if (isLocale(first) && first !== DEFAULT_LOCALE) {
    return { locale: first, path: pathname.slice(first.length + 1) || "/" };
  }
  return { locale: DEFAULT_LOCALE, path: pathname };
}

/**
 * The address of an English path in the given language, e.g. ("/products", "kn") → "/kn/products".
 * Pages that aren't translated, external links and anchors are returned unchanged.
 */
export function localizePath(href: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE || !href.startsWith("/")) return href;
  const path = href.split(/[?#]/)[0];
  if (!TRANSLATED_PATHS.includes(path)) return href;
  return `/${locale}${path === "/" ? href.slice(1) : href}`;
}
