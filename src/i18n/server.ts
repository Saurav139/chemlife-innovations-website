import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { DEFAULT_LOCALE, isLocale } from "./config";
import { getMessages, type Messages } from "./messages";

type Params = Promise<{ locale: string }>;

/** A translated page's title and description, in the page's language. */
export async function translatedMetadata(params: Params, page: Exclude<keyof Messages["meta"], "siteTitle">, path: string): Promise<Metadata> {
  const { locale } = await params;
  const lang = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = await getMessages(lang);
  return pageMetadata({ ...t.meta[page], path, locale: lang });
}

/** For pages that only exist in English: /kn/... and /hi/... versions are "not found". */
export async function englishOnly(params: Params) {
  if ((await params).locale !== DEFAULT_LOCALE) notFound();
}
