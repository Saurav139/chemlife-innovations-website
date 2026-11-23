"use client";

import { usePathname } from "next/navigation";
import ChatOverlay from "@/components/ChatOverlay";
import { useLocale } from "@/i18n/LocaleProvider";

/** The AI experts' chat bubble on every page, except the chat pages themselves (/chat, /chat/<bot>, in any language).
 *  Laptops only: phones and tablets get the header's Ask AI button instead, so nothing floats over the page. */
export default function SiteChat() {
  const pathname = usePathname() ?? "";
  // Tamil keeps the menu button (and so the header's Ask AI button) up to 1280px.
  const wide = useLocale() === "ta" ? "max-xl:hidden" : "max-lg:hidden";
  if (/^(\/(en|hi|kn))?\/chat(\/|$)/.test(pathname)) return null;
  return (
    <div className={wide}>
      <ChatOverlay />
    </div>
  );
}
