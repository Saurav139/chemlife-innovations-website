import type { Metadata } from "next";
import { translatedMetadata } from "@/i18n/server";

export const generateMetadata = ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> =>
  translatedMetadata(params, "careers", "/careers");

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
