import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { englishOnly } from "@/i18n/server";
import { PRODUCTS, productPath } from "@/lib/catalog";
import { previewsAllowed } from "@/lib/previews";
import { PRODUCT_DATA } from "@/lib/productData";
import ProductDesigns from "./ProductDesigns";
import type { PreviewProduct } from "./kit";

export const metadata: Metadata = { title: "Product page designs | ChemLife", robots: { index: false, follow: false } };

// A product page in four corporate designs, for the products that have approved technical data.
export default async function ProductPagePreview({ params }: { params: Promise<{ locale: string }> }) {
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

  return <VariantProvider>
    <Header />
    <ProductDesigns products={products} />
    <Footer />
  </VariantProvider>;
}
