"use client";

import { usePathname } from "next/navigation";
import ChatOverlay from "@/components/ChatOverlay";

/** The AI experts' chat bubble on every page, except the chat pages themselves (/chat, /chat/<bot>, in any language). */
export default function SiteChat() {
  const pathname = usePathname() ?? "";
  if (/^(\/(en|hi|kn))?\/chat(\/|$)/.test(pathname)) return null;
  return <ChatOverlay />;
}
