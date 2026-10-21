import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Only an absolute URL points the chat at another host; a relative one stays same-origin.
const chatbotApiUrl = process.env.NEXT_PUBLIC_CHATBOT_API_URL ?? "";
const chatbotApiOrigin = /^https?:\/\//.test(chatbotApiUrl) ? new URL(chatbotApiUrl).origin : "";

// Every outside host the browser loads from must be listed here, or the browser blocks it.
// Add to this list when adding a new embed, image host or client-side API.
const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js inlines page data as <script> tags. Nonces would remove 'unsafe-inline' but force every page to render per request.
  // Google Analytics (gtag.js) loads only after a visitor accepts the cookie banner.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  // Insights images: WordPress blog, YouTube thumbnails, LinkedIn post thumbnails (once the LinkedIn feed is enabled).
  // Google Analytics hosts below are Google's documented list for GA4 without Google Signals.
  "img-src 'self' data: https://chemlifeinnovations.wordpress.com https://img.youtube.com https://media.licdn.com https://*.google-analytics.com https://*.googletagmanager.com",
  "font-src 'self'",
  "media-src 'self'",
  `connect-src 'self'${chatbotApiOrigin ? ` ${chatbotApiOrigin}` : ""} https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com`,
  // YouTube player on Insights; Google Maps on Contact (maps.google.com redirects to www.google.com).
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://maps.google.com https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const securityHeaders = [
  // HSTS: browsers use HTTPS only, for a year (raised from 1 week on 21 Oct 2026 after a clean trial week).
  // Add includeSubDomains only once every subdomain serves HTTPS (ftp. does not yet).
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Not no-referrer: YouTube embeds refuse to play without the embedding site's origin.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Leaves YouTube's player features (autoplay, fullscreen, encrypted-media) alone.
  // Microphone stays open to this site for the planned chatbot voice input.
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), payment=(), usb=(), microphone=(self)" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Cache resized images for 30 days (default 4 hours). File names don't change when an image does,
    // so save a replacement under a new name in src/lib/assets.ts.
    minimumCacheTTL: 2592000,
    // Insights images, resized here instead of loading the originals (WordPress uploads run up to 1.9 MB).
    // Keep in step with isOptimizable in src/app/insights/InsightsView.tsx.
    remotePatterns: [
      { protocol: "https", hostname: "chemlifeinnovations.wordpress.com", pathname: "/wp-content/uploads/**" },
      { protocol: "https", hostname: "img.youtube.com", pathname: "/vi/**" },
    ],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Staging design previews are standalone pages that embed their fonts as data: URLs.
      { source: "/previews/:slug", headers: [{ key: "Content-Security-Policy", value: contentSecurityPolicy.replace("font-src 'self'", "font-src 'self' data:") }] },
    ];
  },
};

export default nextConfig;
