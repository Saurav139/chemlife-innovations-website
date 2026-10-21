import type { Metadata } from "next";
import { translatedMetadata } from "@/i18n/server";

export const generateMetadata = ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> =>
  translatedMetadata(params, "products", "/products");

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
