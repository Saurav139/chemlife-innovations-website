import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import { englishOnly } from "@/i18n/server";
import { previewsAllowed } from "@/lib/previews";
import ScrollVariations from "./ScrollVariations";

export const metadata: Metadata = { title: "Who We Are scrollytelling | ChemLife", robots: { index: false, follow: false } };

export default async function WhoWeAreScrollPreview({ params }: { params: Promise<{ locale: string }> }) {
  await englishOnly(params);
  if (!previewsAllowed((await headers()).get("host") ?? "")) notFound();
  return <VariantProvider>
    <Header />
    <ScrollVariations />
    <Footer />
  </VariantProvider>;
}
