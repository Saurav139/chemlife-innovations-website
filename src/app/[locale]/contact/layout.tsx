import type { Metadata } from "next";
import { translatedMetadata } from "@/i18n/server";

export const generateMetadata = ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> =>
  translatedMetadata(params, "contact", "/contact");

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
