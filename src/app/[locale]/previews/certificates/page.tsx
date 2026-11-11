import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Certifications from "@/components/Certifications";
import { VariantProvider } from "@/context/VariantContext";
import { englishOnly } from "@/i18n/server";
import { previewsAllowed } from "@/lib/previews";

export const metadata: Metadata = { title: "Certificates section | ChemLife", robots: { index: false, follow: false } };

// The Certificates section on its own, before it goes on the homepage.
export default async function CertificatesPreview({ params }: { params: Promise<{ locale: string }> }) {
  await englishOnly(params);
  if (!previewsAllowed((await headers()).get("host") ?? "")) notFound();
  return <VariantProvider>
    <Header />
    <main id="main" tabIndex={-1} className="pt-28 md:pt-36">
      <Certifications />
    </main>
    <Footer />
  </VariantProvider>;
}
