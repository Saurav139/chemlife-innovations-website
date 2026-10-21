import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

const BOT_SEO = {
  kukku: {
    title: "Dr. Kukku, AI Poultry Nutritionist",
    description:
      "Ask Dr. Kukku about broiler and layer feed, mycotoxins, gut health and egg quality, and find the right ChemLife product for your flock.",
  },
  mikku: {
    title: "Dr. Mikku, AI Dairy & Ruminant Expert",
    description:
      "Ask Dr. Mikku about cattle and buffalo feed, rumen health, milk yield and fertility, and find the right ChemLife product for your herd.",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ bot: string }> }): Promise<Metadata> {
  const { bot } = await params;
  // Matches the page: any bot other than "mikku" shows Dr. Kukku.
  const botKey = bot === "mikku" ? "mikku" : "kukku";
  return pageMetadata({ ...BOT_SEO[botKey], path: `/chat/${botKey}` });
}

export default function ChatBotLayout({ children }: { children: React.ReactNode }) {
  return children;
}
