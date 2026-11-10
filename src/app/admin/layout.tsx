import type { Metadata } from "next";
import { preload } from "react-dom";
import "../fonts.css";
import "../globals.css";

export const metadata: Metadata = {
  title: "Insights inbox | ChemLife Innovations",
  robots: { index: false, follow: false },
};

// The Insights inbox: a page for the moderator only, without the public site's header, chat or analytics.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  preload("/fonts/google/maven-pro-v40-latin.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  return (
    <html lang="en">
      <body className="bg-slate-100 text-brand-navy antialiased">{children}</body>
    </html>
  );
}
