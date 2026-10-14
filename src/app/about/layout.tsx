import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description:
    "ChemLife Innovations bridges Ayurvedic plant wisdom and modern biotechnology to build green, trusted feed additives. Meet our founders, mission and values.",
  path: "/about",
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
