import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { PRODUCTS, productPath, slugify } from "@/lib/catalog";
import { pageMetadata } from "@/lib/seo";
import ProductView from "./ProductView";

type Params = Promise<{ locale: string; slug: string }>;

// One page per product, in every language: /products/maxdmold, /kn/products/maxdmold, /hi/products/maxdmold.
export const dynamicParams = false;

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: slugify(product.name) }));
}

const productIndex = (slug: string) => PRODUCTS.findIndex((product) => slugify(product.name) === slug);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const lang = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const index = productIndex(slug);
  if (index < 0) return {};
  const product = PRODUCTS[index];
  const text = (await getMessages(lang)).products.items[index];
  const description = `${text.tagline ? `${text.tagline}. ` : ""}${text.about}`;
  return pageMetadata({
    title: product.name,
    description: description.length > 160 ? `${description.slice(0, 157).trimEnd()}…` : description,
    path: productPath(product.name),
    locale: lang,
  });
}

export default async function ProductPage({ params }: { params: Params }) {
  const index = productIndex((await params).slug);
  if (index < 0) notFound();
  return <ProductView index={index} />;
}
