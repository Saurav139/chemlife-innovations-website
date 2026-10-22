import type { Metadata } from "next";
import { englishOnly } from "@/i18n/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import { PREVIEWS, previewsAllowed } from "@/lib/previews";
import AnbiotFigure from "./AnbiotFigure";

// Phone layouts of the Products category filter. The ?filter= address only switches on staging.
const PRODUCT_FILTERS = [
  { href: "/products", title: "Scrolling chips (current)", description: "One row of chips that scrolls sideways, running to the screen edges." },
  { href: "/products?filter=select", title: "Drop-down", description: "A full-width field that opens the phone's own picker." },
  { href: "/products?filter=grid", title: "2 × 2 buttons", description: "Four equal buttons, all visible, in two rows." },
];

export const metadata: Metadata = { title: "Design previews", robots: { index: false, follow: false } };

// English only for now.
export default async function PreviewsPage({ params }: { params: Promise<{ locale: string }> }) {
  await englishOnly(params);
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
          <div className="mt-10">
            <AnbiotFigure />
          </div>
          <h2 className="font-heading text-2xl font-bold text-brand-navy mt-16">Product filter on phones</h2>
          <p className="text-brand-navy/70 mt-2 max-w-2xl">
            Three layouts for the species filter on the Products page. Open them on a phone, or in a narrow window:
            desktop always shows the drop-down inside the search bar.
          </p>
          <ul className="mt-6 grid gap-5 md:grid-cols-3">
            {PRODUCT_FILTERS.map((f) => (
              <li key={f.href}>
                <a
                  href={f.href}
                  target="_blank"
                  rel="noopener"
                  className="block h-full rounded-2xl border border-brand-navy/15 p-6 transition-colors hover:border-brand-orange"
                >
                  <h3 className="font-heading text-lg font-bold text-brand-navy">{f.title}</h3>
                  <p className="text-brand-navy/70 mt-2 text-[15px] leading-relaxed">{f.description}</p>
                  <span className="inline-block mt-4 font-semibold text-brand-orange">Open Products →</span>
                </a>
              </li>
            ))}
          </ul>
          <h2 className="font-heading text-2xl font-bold text-brand-navy mt-16">Full-page designs</h2>
          <ul className="mt-6 grid gap-5 md:grid-cols-2">
            {PREVIEWS.map((p) => (
              <li key={p.slug}>
                <a
                  href={`/previews/${p.slug}${"anchor" in p ? p.anchor : ""}`}
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
