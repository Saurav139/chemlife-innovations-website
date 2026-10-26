import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { englishOnly } from "@/i18n/server";
import { previewsAllowed } from "@/lib/previews";
import ResearchHubPreview from "./ResearchHubPreview";

export const metadata: Metadata = { title: "Research (preview)", robots: { index: false, follow: false } };

// A copy of the Research page whose cards open each platform's own page. Staging only, English only.
export default async function ResearchPreviewPage({ params }: { params: Promise<{ locale: string }> }) {
  await englishOnly(params);
  if (!previewsAllowed((await headers()).get("host") ?? "")) notFound();
  return <ResearchHubPreview />;
}
