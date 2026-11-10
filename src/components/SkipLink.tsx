"use client";

import { useT } from "@/i18n/LocaleProvider";

/** The first thing a keyboard user reaches: jumps past the header and menu to the page's <main>. Hidden until it
 *  has focus. Moving focus (not just scrolling) means the next Tab continues from the page content. */
export default function SkipLink() {
  const t = useT();
  return (
    <a
      href="#main"
      onClick={(e) => {
        const main = document.getElementById("main") ?? document.querySelector("main");
        if (!main) return;
        e.preventDefault();
        main.setAttribute("tabindex", "-1");
        main.focus({ preventScroll: true });
        main.scrollIntoView();
      }}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand-navy focus:px-5 focus:py-3 focus:font-heading focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
    >
      {t.common.skipToContent}
    </a>
  );
}
