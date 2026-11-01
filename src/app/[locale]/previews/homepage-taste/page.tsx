import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { englishOnly } from "@/i18n/server";
import { previewsAllowed } from "@/lib/previews";
import TasteHome from "./TasteHome";

export const metadata: Metadata = { title: "Homepage: Taste Skill version | ChemLife", robots: { index: false, follow: false } };

// Built with the design-taste-frontend skill, which sets its own navigation and footer, so the site's are left out.
export default async function HomepageTastePreview({ params }: { params: Promise<{ locale: string }> }) {
  await englishOnly(params);
  if (!previewsAllowed((await headers()).get("host") ?? "")) notFound();
  return <TasteHome />;
}
