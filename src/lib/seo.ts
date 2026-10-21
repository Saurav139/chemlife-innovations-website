import type { Metadata } from "next";

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
}

/**
 * Builds a page's title, description, canonical URL and share-preview tags.
 * Next.js replaces (does not merge) a parent's openGraph and twitter objects,
 * so every page sets them in full here, including the share image: a page that
 * sets its own openGraph does not inherit the root opengraph-image.
 */
export function pageMetadata({ title, description, path, noIndex }: PageSeo): Metadata {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} | Natural Functional Feed Additives`;

  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_IN",
      url: path,
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
