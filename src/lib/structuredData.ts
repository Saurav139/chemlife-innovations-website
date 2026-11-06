import { LOCALES, localizePath, type Locale } from "@/i18n/config";
import type { Messages } from "@/i18n/messages/en";
import { Images } from "@/lib/assets";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

// Structured data (schema.org, as JSON-LD): a description of the company and the site that search and answer engines
// read alongside the page. Everything here also appears on the site itself (the footer, About, the awards), as
// Google requires. Check changes with Google's Rich Results Test and the Schema Markup Validator (validator.schema.org).

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const absolute = (path: string) => `${SITE_URL}${path}`;

// The footer's social links.
const PROFILES = [
  "https://www.linkedin.com/company/chemlifeinnovations",
  "https://www.youtube.com/@chemlifeinnovations2739",
  "https://www.instagram.com/chemlifeinnovations_/",
  "https://www.facebook.com/people/Chemlife-Innovations/100063821717542/",
];

const LANGUAGES = { en: "English", hi: "Hindi", kn: "Kannada", bn: "Bengali", mr: "Marathi", te: "Telugu", ta: "Tamil" } as const;

/** The company and the website, on every page. `messages` is the page's language. */
export function siteGraph(locale: Locale, messages: Messages) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: SITE_NAME,
        legalName: "ChemLife Innovations Private Limited",
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: absolute(Images.branding.logo), width: 1021, height: 1024 },
        description: messages.meta.home.description,
        email: "innovate@chemlifeinnovations.com",
        telephone: "+91-95358-62570",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Plot no 18, KIADB Industrial Area, 3rd Phase, Obadenahalli",
          addressLocality: "Doddaballapura",
          addressRegion: "Karnataka",
          postalCode: "561203",
          addressCountry: "IN",
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          telephone: "+91-95358-62570",
          email: "innovate@chemlifeinnovations.com",
          areaServed: "IN",
          availableLanguage: LOCALES.map((code) => LANGUAGES[code]),
        },
        sameAs: PROFILES,
        award: messages.home.awards.items.map((item) => item.title),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: locale,
        publisher: { "@id": ORGANIZATION_ID },
      },
    ],
  };
}

/** A product page's breadcrumb trail: Home › Products › the product, in the page's language. */
export function productBreadcrumbs(locale: Locale, messages: Messages, product: { name: string; path: string }) {
  const crumbs = [
    { name: messages.nav.home, path: "/" },
    { name: messages.nav.products, path: "/products" },
    { name: product.name, path: product.path },
  ];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absolute(localizePath(crumb.path, locale)),
    })),
  };
}

/** The JSON for a <script type="application/ld+json">, with "<" escaped so text can't close the script tag. */
export const jsonLd = (data: object) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
