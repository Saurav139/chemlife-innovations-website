import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import { englishOnly } from "@/i18n/server";
import { getMessages } from "@/i18n/messages";
import { previewsAllowed } from "@/lib/previews";
import VisionMissionVariations from "./VisionMissionVariations";

export const metadata: Metadata = { title: "Vision & Mission variations | ChemLife", robots: { index: false, follow: false } };

export default async function VisionMissionPreview({ params }: { params: Promise<{ locale: string }> }) {
  await englishOnly(params);
  if (!previewsAllowed((await headers()).get("host") ?? "")) notFound();
  const { about } = await getMessages("en");
  return <VariantProvider>
    <Header />
    <VisionMissionVariations statements={[
      { title: about.visionKicker, text: about.visionText },
      { title: about.missionKicker, text: about.missionText },
    ]} />
    <Footer />
  </VariantProvider>;
}
