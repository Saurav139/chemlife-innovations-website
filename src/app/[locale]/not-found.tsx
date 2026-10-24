"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import { useHref, useT } from "@/i18n/LocaleProvider";

export default function NotFound() {
  const t = useT();
  const href = useHref();
  return (
    <VariantProvider>
      <Header />
      <main className="min-h-[70vh] bg-white pt-40 pb-24 text-center px-6">
        <p className="kicker text-brand-orange-aa">404</p>
        <h1 className="page-title text-brand-navy mt-3">{t.notFound.title}</h1>
        <p className="text-slate-600 mt-4">{t.notFound.text}</p>
        <a href={href("/")} className="inline-block mt-8 rounded-full bg-brand-orange-aa px-7 py-3 text-sm font-semibold text-white">
          {t.notFound.home}
        </a>
      </main>
      <Footer />
    </VariantProvider>
  );
}
