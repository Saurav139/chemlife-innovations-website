import type { Metadata } from "next";
import { Maven_Pro } from "next/font/google";
import "./globals.css";
import RatingWidget from "@/components/RatingWidget";
import LaunchGuard from "@/components/LaunchGuard";

const mavenPro = Maven_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-maven-pro",
});

export const metadata: Metadata = {
  title: "ChemLife Innovations | Nature Driven Functional Feed Additives",
  description:
    "Nature-driven functional feed additives through Ayurvedic holistic approach and novel bio-transformation technology (ANBioT).",
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
        <LaunchGuard>
          {children}
        </LaunchGuard>
        <RatingWidget />
      </body>
    </html>
  );
}
