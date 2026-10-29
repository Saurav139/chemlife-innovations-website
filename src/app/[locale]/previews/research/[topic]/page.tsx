import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import { englishOnly } from "@/i18n/server";
import { previewsAllowed } from "@/lib/previews";
import { RESEARCH_PAGES } from "../pages";
import ResearchArticle from "./ResearchArticle";

type Params = Promise<{ locale: string; topic: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { topic } = await params;
  const page = RESEARCH_PAGES.find((p) => p.slug === topic);
  return { title: page ? `${page.title} | Research` : "Research", robots: { index: false, follow: false } };
}

// One research platform's page: the site's header and footer around the platform's content and animated figure.
// Staging only, English only.
export default async function ResearchTopicPreview({ params }: { params: Params }) {
  await englishOnly(params);
  if (!previewsAllowed((await headers()).get("host") ?? "")) notFound();
  const { topic } = await params;
  const page = RESEARCH_PAGES.find((p) => p.slug === topic);
  if (!page) notFound();
  const html = await readFile(path.join(process.cwd(), "src/previews/research", `${page.slug}.html`), "utf8");

  return (
    <VariantProvider>
      <Header />
      <main id="main" tabIndex={-1} className="min-h-screen bg-white">
        <ResearchArticle html={html} />
      </main>
      <Footer />
    </VariantProvider>
  );
}
