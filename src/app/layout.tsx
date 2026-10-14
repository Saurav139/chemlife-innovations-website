import type { Metadata } from "next";
import { Maven_Pro } from "next/font/google";
import "./globals.css";
import RatingWidget from "@/components/RatingWidget";
import { SITE_URL, pageMetadata } from "@/lib/seo";

const mavenPro = Maven_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-maven-pro",
});

// Homepage metadata. Other pages set their own in a layout.tsx next to their page.tsx.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...pageMetadata({
    description:
      "Nature-derived functional feed additives for poultry, dairy and livestock, made with ANBioT, our bio-transformation technology rooted in Ayurveda.",
    path: "/",
  }),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={mavenPro.variable}>
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
        {children}
        <RatingWidget />
      </body>
    </html>
  );
}
