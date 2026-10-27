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
import ResearchArticle from "../[topic]/ResearchArticle";
import "./animations.css";

export const metadata: Metadata = { title: "Research animations | Research", robots: { index: false, follow: false } };

// Ten more figures for the research platforms, two each, drawn like the research pages' own (content in
// src/previews/research/animations.html). Staging only, English only.
export default async function ResearchAnimationsPreview({ params }: { params: Promise<{ locale: string }> }) {
  await englishOnly(params);
  if (!previewsAllowed((await headers()).get("host") ?? "")) notFound();
  const html = await readFile(path.join(process.cwd(), "src/previews/research/animations.html"), "utf8");

  return (
    <VariantProvider>
      <Header />
      <main className="min-h-screen bg-white">
        <ResearchArticle html={html} />
      </main>
      <Footer />
    </VariantProvider>
  );
}
