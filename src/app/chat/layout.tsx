import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "AI Animal Nutrition Experts",
  description:
    "Chat with our AI experts: Dr. Kukku for poultry nutrition and Dr. Mikku for dairy and ruminants. Ask about feed, animal health and ChemLife products.",
  path: "/chat",
});

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
