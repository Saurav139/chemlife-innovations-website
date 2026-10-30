import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import { englishOnly } from "@/i18n/server";
import { getInsights } from "@/lib/insights";
import { previewsAllowed } from "@/lib/previews";
import SocialCardsPreview from "./SocialCardsPreview";

export const metadata: Metadata = {
  title: "Insights: full-image cards | ChemLife",
  robots: { index: false, follow: false },
};

export default async function InsightsCardsPreview({ params }: { params: Promise<{ locale: string }> }) {
  await englishOnly(params);
  if (!previewsAllowed((await headers()).get("host") ?? "")) notFound();
  const { blogs } = await getInsights();
  const posts = blogs.filter((post) => {
    if (!post.imageUrl || !post.linkUrl) return false;
    try {
      return /^(?:www\.)?(?:instagram|linkedin)\.com$/i.test(new URL(post.linkUrl).hostname);
    } catch { return false; }
  });
  return <VariantProvider>
    <Header />
    <SocialCardsPreview posts={posts} />
    <Footer />
  </VariantProvider>;
}
