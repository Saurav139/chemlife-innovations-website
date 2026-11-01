import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import { englishOnly } from "@/i18n/server";
import { previewsAllowed } from "@/lib/previews";
import HomepageClaude from "./HomepageClaude";

export const metadata: Metadata = { title: "Homepage: six more designs | ChemLife", robots: { index: false, follow: false } };

export default async function HomepageClaudePreview({ params }: { params: Promise<{ locale: string }> }) {
  await englishOnly(params);
  if (!previewsAllowed((await headers()).get("host") ?? "")) notFound();
  return <VariantProvider>
    <Header />
    <HomepageClaude />
    <Footer />
  </VariantProvider>;
}
