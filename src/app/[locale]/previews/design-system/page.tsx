import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import { englishOnly } from "@/i18n/server";
import { previewsAllowed } from "@/lib/previews";
import DesignSystem from "./DesignSystem";

export const metadata: Metadata = { title: "Design system | Previews", robots: { index: false, follow: false } };

// The redesign's design system, light and dark side by side, for approval before any page changes. Staging only.
export default async function DesignSystemPreview({ params }: { params: Promise<{ locale: string }> }) {
  await englishOnly(params);
  if (!previewsAllowed((await headers()).get("host") ?? "")) notFound();
  return (
    <VariantProvider>
      <Header />
      <DesignSystem />
      <Footer />
    </VariantProvider>
  );
}
