import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { englishOnly } from "@/i18n/server";
import { previewsAllowed } from "@/lib/previews";
import { PRODUCT_DATA } from "@/lib/productData";
import TechnicalData from "../../products/[slug]/TechnicalData";
import type { IconName } from "../../products/[slug]/icons";
import IconStyleSwitcher from "./IconStyleSwitcher";
import { ICON_STYLES } from "./marks";

export const metadata: Metadata = { title: "Product page icons | ChemLife", robots: { index: false, follow: false } };

// The product shown under the icon sheet: it has every section, trial results included.
const PRODUCT = "MaxDmold";

// The icons in the order of the sheet, and what each stands for.
const ON_LIGHT: [IconName, string][] = [
  ["form", "form"],
  ["active", "active content"],
  ["shelfLife", "shelf life"],
  ["feed", "used in feed"],
  ["water", "in drinking water"],
  ["spray", "sprayed on"],
  ["specs", "specifications"],
  ["storage", "storage"],
  ["apply", "how to apply"],
  ["compatibility", "compatibility"],
  ["inVitro", "in-vitro results"],
  ["limits", "purity limits"],
  ["safety", "safety and handling"],
];
const ON_NAVY: [IconName, string][] = [
  ["facility", "manufacturing"],
  ["shield", "hazard classification"],
  ["transport", "transport"],
];

// Four styles for the icons in a product page's technical sections, before one is settled on.
export default async function ProductIconsPreview({ params }: { params: Promise<{ locale: string }> }) {
  await englishOnly(params);
  if (!previewsAllowed((await headers()).get("host") ?? "")) notFound();
  const labels = (await getMessages(DEFAULT_LOCALE)).products.data;

  const options = ICON_STYLES.map(({ id, label, note, Mark }) => ({
    id,
    label,
    note,
    sheet: (
      <span className="flex flex-wrap items-center gap-2">
        {ON_LIGHT.map(([name]) => (
          <Mark key={name} name={name} on="light" />
        ))}
        <span className="flex items-center gap-2 rounded-2xl bg-brand-navy p-2">
          {ON_NAVY.map(([name]) => (
            <Mark key={name} name={name} on="navy" />
          ))}
        </span>
      </span>
    ),
    sections: <TechnicalData name={PRODUCT} data={PRODUCT_DATA[PRODUCT]} t={labels} translated={false} Mark={Mark} />,
  }));
  const legend = `Left to right: ${ON_LIGHT.map(([, meaning]) => meaning).join(", ")}; then on navy: ${ON_NAVY.map(([, meaning]) => meaning).join(", ")}.`;

  return <VariantProvider>
    <Header />
    <IconStyleSwitcher product={PRODUCT} options={options} legend={legend} />
    <Footer />
  </VariantProvider>;
}
