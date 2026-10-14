import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Insights: Articles, Videos & Podcasts",
  description:
    "Articles, videos and podcasts on feed hygiene, mycotoxins, mold control and animal nutrition from the ChemLife Innovations team.",
  path: "/insights",
});

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
