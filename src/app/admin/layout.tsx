import type { Metadata } from "next";
import { Maven_Pro } from "next/font/google";
import "../globals.css";

const mavenPro = Maven_Pro({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap", variable: "--font-maven-pro" });

export const metadata: Metadata = {
  title: "Insights inbox | ChemLife Innovations",
  robots: { index: false, follow: false },
};

// The Insights inbox: a page for the moderator only, without the public site's header, chat or analytics.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={mavenPro.variable}>
      <body className="bg-slate-100 text-brand-navy antialiased">{children}</body>
    </html>
  );
}
