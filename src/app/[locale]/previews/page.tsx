import type { Metadata } from "next";
import { englishOnly } from "@/i18n/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import { PREVIEWS, previewsAllowed } from "@/lib/previews";
import AnbiotFigure from "./AnbiotFigure";

export const metadata: Metadata = { title: "Design previews", robots: { index: false, follow: false } };

// English only for now.
export default async function PreviewsPage({ params }: { params: Promise<{ locale: string }> }) {
  await englishOnly(params);
  if (!previewsAllowed((await headers()).get("host") ?? "")) notFound();

  return (
    <VariantProvider>
      <Header />
      <main id="main" tabIndex={-1} className="min-h-screen bg-white pt-40 pb-24">
        <div className="max-w-[1000px] mx-auto px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-orange">Staging only</p>
          <h1 className="font-heading text-4xl font-bold text-brand-navy mt-2">Design previews</h1>
          <p className="text-brand-navy/70 mt-3 max-w-2xl">
            Proposed designs for review. They open as standalone pages and aren&apos;t part of the live site.
          </p>
          <div className="mt-10">
            <AnbiotFigure />
          </div>
          <h2 className="font-heading text-2xl font-bold text-brand-navy mt-16">Full-page designs</h2>
          <ul className="mt-6 grid gap-5 md:grid-cols-2">
            {PREVIEWS.map((p) => (
              <li key={p.slug}>
                <a
                  href={"href" in p ? p.href : `/previews/${p.slug}${"anchor" in p ? p.anchor : ""}`}
                  target="_blank"
                  rel="noopener"
                  className="block h-full rounded-2xl border border-brand-navy/15 p-6 transition-colors hover:border-brand-orange"
                >
                  <h2 className="font-heading text-xl font-bold text-brand-navy">{p.title}</h2>
                  <p className="text-brand-navy/70 mt-2 text-[15px] leading-relaxed">{p.description}</p>
                  <span className="inline-block mt-4 font-semibold text-brand-orange">Open preview →</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </VariantProvider>
  );
}
