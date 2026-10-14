import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Ask ChemLife Innovations about our feed additives or a distribution partnership. Visit us at KIADB Industrial Area, Doddaballapura, Bengaluru.",
  path: "/contact",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
