import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import { englishOnly } from "@/i18n/server";
import { previewsAllowed } from "@/lib/previews";
import WhoWeAreVariations from "./WhoWeAreVariations";

export const metadata: Metadata = { title: "Who We Are variations | ChemLife", robots: { index: false, follow: false } };

export default async function WhoWeArePreview({ params }: { params: Promise<{ locale: string }> }) {
  await englishOnly(params);
  if (!previewsAllowed((await headers()).get("host") ?? "")) notFound();
  return <VariantProvider>
    <Header />
    <WhoWeAreVariations />
    <Footer />
  </VariantProvider>;
}
