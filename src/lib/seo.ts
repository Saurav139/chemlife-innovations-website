import type { Metadata } from "next";
import { DEFAULT_LOCALE, LOCALES, OG_LOCALES, TRANSLATED_PATHS, localizePath, type Locale } from "@/i18n/config";

export const SITE_URL = "https://chemlifeinnovations.com";
export const SITE_NAME = "ChemLife Innovations";

const LIVE_HOSTS = ["chemlifeinnovations.com", "www.chemlifeinnovations.com"];
const LOCAL_HOSTS = ["localhost", "127.0.0.1"];

/** The live site's own addresses. */
export function isLiveHost(host: string): boolean {
  return LIVE_HOSTS.includes(host.split(":")[0].toLowerCase());
}

/**
 * Any address other than the live site or a developer's machine, e.g. staging.chemlifeinnovations.com or
 * Hostinger's temporary domain. Staging is kept out of search results and analytics (src/proxy.ts).
 */
export function isStagingHost(host: string): boolean {
  const name = host.split(":")[0].toLowerCase();
  return name !== "" && !LIVE_HOSTS.includes(name) && !LOCAL_HOSTS.includes(name);
}

// Generated at build time by src/app/opengraph-image.tsx.
const SHARE_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "ChemLife Innovations: nature-driven functional feed additives",
};

interface PageSeo {
  /** Page name shown before the brand, e.g. "Contact Us". Omit for the homepage. */
  title?: string;
  description: string;
  /** Path of the page, used for the canonical URL and og:url. */
  path: string;
  noIndex?: boolean;
  /** The page's language. Translated pages also list their other languages for search engines. */
  locale?: Locale;
  /** The homepage title, in the page's language. */
  siteTitle?: string;
}

/**
 * Builds a page's title, description, canonical URL and share-preview tags.
 * Next.js replaces (does not merge) a parent's openGraph and twitter objects,
 * so every page sets them in full here, including the share image: a page that
 * sets its own openGraph does not inherit the root opengraph-image.
 */
export function pageMetadata({ title, description, path, noIndex, locale = DEFAULT_LOCALE, siteTitle }: PageSeo): Metadata {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} | ${siteTitle ?? "Natural Functional Feed Additives"}`;
  const url = localizePath(path, locale);
  // hreflang: tells search engines which address to show for each language. English is also the default.
  const languages = TRANSLATED_PATHS.includes(path)
    ? { ...Object.fromEntries(LOCALES.map((l) => [l, localizePath(path, l)])), "x-default": path }
    : undefined;

  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: url, ...(languages && { languages }) },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: OG_LOCALES[locale],
      url,
      title: fullTitle,
      description,
      images: [SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [SHARE_IMAGE],
    },
    ...(noIndex && { robots: { index: false, follow: true } }),
  };
}
