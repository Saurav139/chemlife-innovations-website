import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import { PREVIEWS, previewsAllowed } from "@/lib/previews";

export const metadata: Metadata = { title: "Design previews", robots: { index: false, follow: false } };

export default async function PreviewsPage() {
  if (!previewsAllowed((await headers()).get("host") ?? "")) notFound();

  return (
    <VariantProvider>
      <Header />
      <main className="min-h-screen bg-white pt-40 pb-24">
        <div className="max-w-[1000px] mx-auto px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-orange">Staging only</p>
          <h1 className="font-heading text-4xl font-bold text-brand-navy mt-2">Design previews</h1>
          <p className="text-brand-navy/70 mt-3 max-w-2xl">
            Proposed designs for review. They open as standalone pages and aren&apos;t part of the live site.
          </p>
          <ul className="mt-10 grid gap-5 md:grid-cols-2">
            {PREVIEWS.map((p) => (
              <li key={p.slug}>
                <a
                  href={`/previews/${p.slug}`}
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
