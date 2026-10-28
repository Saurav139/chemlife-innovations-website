import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { preload } from "react-dom";
import "../fonts.css";
import "../globals.css";
import RatingWidget from "@/components/RatingWidget";
import SkipLink from "@/components/SkipLink";
import AnalyticsLoader from "@/components/AnalyticsLoader";
import { GA_ID } from "@/lib/analytics";
import { SITE_URL, pageMetadata } from "@/lib/seo";
import { LOCALES, isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { LocaleProvider } from "@/i18n/LocaleProvider";


export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

// Homepage metadata. Other pages set their own in a layout.tsx next to their page.tsx.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getMessages(locale);
  return {
    metadataBase: new URL(SITE_URL),
    ...pageMetadata({ description: t.meta.home.description, path: "/", locale, siteTitle: t.meta.siteTitle }),
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = await getMessages(locale);
  // The site font's Latin letters, needed on every page (see src/app/fonts.css). The Hindi and Kannada fonts load
  // only when a page shows those letters.
  preload("/fonts/google/maven-pro-v40-latin.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });

  return (
    <html lang={locale}>
      <head>
        <style>{`
          nextjs-portal,
          #nextjs-portal,
          .nextjs-static-indicator,
          [data-nextjs-toast],
          [data-nextjs-dialog] {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
            height: 0 !important;
            width: 0 !important;
            overflow: hidden !important;
          }
        `}</style>
      </head>
      <body>
        <LocaleProvider locale={locale} messages={messages}>
          <SkipLink />
          {children}
          <RatingWidget />
          {/* Without a GA ID, the banner and GA code are neither rendered nor downloaded. */}
          {GA_ID && <AnalyticsLoader />}
        </LocaleProvider>
      </body>
    </html>
  );
}
