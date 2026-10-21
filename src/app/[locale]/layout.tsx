import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Maven_Pro, Noto_Sans_Devanagari, Noto_Sans_Kannada } from "next/font/google";
import "../globals.css";
import RatingWidget from "@/components/RatingWidget";
import AnalyticsLoader from "@/components/AnalyticsLoader";
import { GA_ID } from "@/lib/analytics";
import { SITE_URL, pageMetadata } from "@/lib/seo";
import { LOCALES, isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { LocaleProvider } from "@/i18n/LocaleProvider";

const mavenPro = Maven_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-maven-pro",
});

// Maven Pro has no Hindi or Kannada letters, so the browser falls back to these for them (see globals.css).
// Not preloaded: a browser downloads one only when a page actually shows those letters.
const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
  variable: "--font-noto-devanagari",
});
const notoKannada = Noto_Sans_Kannada({
  subsets: ["kannada"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
  variable: "--font-noto-kannada",
});

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

  return (
    <html lang={locale} className={`${mavenPro.variable} ${notoKannada.variable} ${notoDevanagari.variable}`}>
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
          {children}
          <RatingWidget />
          {/* Without a GA ID, the banner and GA code are neither rendered nor downloaded. */}
          {GA_ID && <AnalyticsLoader />}
        </LocaleProvider>
      </body>
    </html>
  );
}
