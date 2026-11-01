"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import { useHref, useT } from "@/i18n/LocaleProvider";
import { Button } from "@/components/site/ui";

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
      <main id="main" tabIndex={-1} className="site-ui paper relative min-h-[80vh] bg-page pt-36 md:pt-44 pb-20 md:pb-28 overflow-hidden">
        <div className="container-site grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <p className="label-mono text-copy-dim"><span className="text-flame">●</span>&nbsp;&nbsp;ChemLife&nbsp;&nbsp;/&nbsp;&nbsp;404</p>
            <h1 className="font-display text-6xl md:text-8xl tracking-[-0.03em] leading-[0.95] text-ink mt-8">{t.notFound.title}</h1>
            <p className="text-copy text-xl mt-6 max-w-lg">{t.notFound.text}</p>
            <Button href={href("/")} arrow className="mt-10">{t.notFound.home}</Button>
          </div>
          <nav aria-label={t.notFound.popular} className="lg:col-span-5">
            <p className="label-mono text-copy-dim pb-4 border-b border-ink">{t.notFound.popular}</p>
            <ul>
              {SUGGESTED.map((page, i) => (
                <li key={page.path} className="border-b border-line">
                  <a href={href(page.path)} className="group flex items-baseline gap-5 py-5">
                    <span className="label-mono text-flame">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-display text-3xl text-ink group-hover:text-flame group-hover:italic transition-colors">{t.nav[page.key]}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p aria-hidden="true" className="pointer-events-none select-none absolute -right-6 -bottom-16 font-display italic text-[16rem] md:text-[24rem] leading-none text-flame/10">404</p>
      </main>
      <Footer />
    </VariantProvider>
  );
}
