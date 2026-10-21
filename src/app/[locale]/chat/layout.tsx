import type { Metadata } from "next";
import { englishOnly } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "AI Animal Nutrition Experts",
  description:
    "Chat with our AI experts: Dr. Kukku for poultry nutrition and Dr. Mikku for dairy and ruminants. Ask about feed, animal health and ChemLife products.",
  path: "/chat",
});

// English only for now.
export default async function ChatLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  await englishOnly(params);
  return children;
}
