import type { Metadata } from "next";
import { englishOnly } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Insights: Articles, Videos & Podcasts",
  description:
    "Articles, videos and podcasts on feed hygiene, mycotoxins, mold control and animal nutrition from the ChemLife Innovations team.",
  path: "/insights",
});

// English only for now.
export default async function InsightsLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  await englishOnly(params);
  return children;
}
