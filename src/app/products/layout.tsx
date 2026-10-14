import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Feed Additives & Products",
  description:
    "Nature-derived feed additives for poultry and dairy: mycotoxin binders, mold inhibitors, gut and liver support, chelated trace minerals and bypass choline.",
  path: "/products",
});

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
