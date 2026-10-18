import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Everything is open to search engines and AI crawlers except the API. /launch stays crawlable
// on purpose: it's hidden with a noindex tag, which crawlers can only see if they can fetch it.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
