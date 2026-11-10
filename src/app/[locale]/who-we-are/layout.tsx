import type { Metadata } from "next";
import { translatedMetadata } from "@/i18n/server";

export const generateMetadata = ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> =>
  translatedMetadata(params, "whoWeAre", "/who-we-are");

export default function WhoWeAreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
