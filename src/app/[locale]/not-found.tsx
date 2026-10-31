"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { VariantProvider } from "@/context/VariantContext";
import { useHref, useT } from "@/i18n/LocaleProvider";

// The main pages, offered as a way on when an address doesn't exist.
const SUGGESTED = [
  { key: "products", path: "/products" },
  { key: "research", path: "/research" },
  { key: "insights", path: "/insights" },
  { key: "contact", path: "/contact" },
] as const;

export default function NotFound() {
  const t = useT();
  const href = useHref();
  return (
    <VariantProvider>
      <Header />
      <main id="main" tabIndex={-1}>
        <PageHero title={t.notFound.title} intro={t.notFound.text} note="404">
          <a href={href("/")} className="btn btn-primary">{t.notFound.home}</a>
        </PageHero>
        <nav aria-label={t.notFound.popular} className="frame grid lg:grid-cols-12 gap-x-8 pt-12 pb-20 md:pb-28">
          <div className="lg:col-start-6 lg:col-span-7">
            <p className="text-small text-ink-soft">{t.notFound.popular}</p>
            <ul className="mt-2 flex flex-wrap gap-x-6">
              {SUGGESTED.map((page) => (
                <li key={page.path}>
                  <a href={href(page.path)} className="inline-flex items-center min-h-11 link">
                    {t.nav[page.key]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </main>
      <Footer />
    </VariantProvider>
  );
}
