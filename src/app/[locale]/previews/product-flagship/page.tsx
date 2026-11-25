import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { englishOnly } from "@/i18n/server";
import { PRODUCTS, productPath, slugify } from "@/lib/catalog";
import { previewsAllowed } from "@/lib/previews";
import { PRODUCT_DATA } from "@/lib/productData";
import type { PreviewProduct } from "../product-page/kit";
import Flagship from "./Flagship";

export const metadata: Metadata = { title: "Product page, flagship design | ChemLife", robots: { index: false, follow: false } };

// The flagship product page design, on any product that has approved technical data: ?product=maxdmold-spray.
export default async function ProductFlagshipPreview({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ product?: string | string[] }> }) {
  await englishOnly(params);
  if (!previewsAllowed((await headers()).get("host") ?? "")) notFound();

  const t = (await getMessages(DEFAULT_LOCALE)).products;
  const all = PRODUCTS.map((product, i) => ({ ...product, ...t.items[i] }));
  const products: PreviewProduct[] = all
    .filter((product) => PRODUCT_DATA[product.name])
    .map((product) => ({
      name: product.name,
      path: productPath(product.name),
      category: t.categories[product.category as keyof typeof t.categories],
      tagline: product.tagline ?? "",
      about: product.about,
      features: product.features,
      inclusionRate: product.inclusionRate,
      packSize: product.packSize,
      banner: product.banner,
      icon: product.icon,
      data: PRODUCT_DATA[product.name],
      related: all
        .filter((other) => other.category === product.category && other.id !== product.id)
        .slice(0, 4)
        .map((other) => ({ name: other.name, tagline: other.tagline ?? "", path: productPath(other.name), banner: other.banner, icon: other.icon })),
    }));

  const wanted = (await searchParams).product;
  const product = products.find((item) => slugify(item.name) === wanted) ?? products[0];

  return (
    <VariantProvider>
      <Header />
      {/* Keyed by product, so the calculator and the charts start afresh on each one. */}
      <Flagship key={product.name} product={product} products={products.map((item) => ({ name: item.name, slug: slugify(item.name) }))} />
      <Footer />
    </VariantProvider>
  );
}
