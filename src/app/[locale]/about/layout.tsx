import type { Metadata } from "next";
import { translatedMetadata } from "@/i18n/server";

export const generateMetadata = ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> =>
  translatedMetadata(params, "about", "/about");

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
