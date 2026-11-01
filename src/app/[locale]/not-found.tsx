"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
      <main id="main" tabIndex={-1} className="site-ui min-h-[70vh] bg-page pt-36 md:pt-44 pb-20 md:pb-28 text-center px-6">
        <p className="font-heading text-7xl md:text-8xl font-bold text-flame/15 leading-none text-[8rem]! md:text-[11rem]! select-none" aria-hidden="true">
          404
        </p>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-ink mt-2">{t.notFound.title}</h1>
        <p className="text-copy text-lg mt-4 max-w-md mx-auto">{t.notFound.text}</p>
        <a
          href={href("/")}
          className="inline-flex items-center justify-center min-h-12 mt-8 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover px-7 text-sm font-semibold text-white transition-colors"
        >
          {t.notFound.home}
        </a>
        <nav aria-label={t.notFound.popular} className="mt-10">
          <p className="text-sm text-copy-dim">{t.notFound.popular}</p>
          <ul className="mt-2 flex flex-wrap justify-center gap-x-6">
            {SUGGESTED.map((page) => (
              <li key={page.path}>
                <a
                  href={href(page.path)}
                  className="inline-flex items-center min-h-11 font-semibold text-flame hover:text-ink underline-offset-4 hover:underline"
                >
                  {t.nav[page.key]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </main>
      <Footer />
    </VariantProvider>
  );
}
