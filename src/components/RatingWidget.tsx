"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useT } from "@/i18n/LocaleProvider";
import { splitLocale } from "@/i18n/config";

// Set when the visitor hides the tab, so it stays hidden on this device (listed in the privacy policy, section 5).
const HIDDEN_KEY = "chemlife-rate-us-hidden";

export default function RatingWidget() {
  const pathname = usePathname();
  const t = useT();
  // Slides in once the visitor has scrolled past the top of the page, so it doesn't compete with the hero.
  const [shown, setShown] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    try {
      setHidden(localStorage.getItem(HIDDEN_KEY) === "1");
    } catch {
      // Storage blocked (private browsing): the tab just shows as usual.
    }
  }, []);
  const hide = () => {
    setHidden(true);
    try {
      localStorage.setItem(HIDDEN_KEY, "1");
    } catch {
      // Hidden for this page view only.
    }
  };
  useEffect(() => {
    const update = () => setShown(window.scrollY > window.innerHeight * 0.4);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [pathname]);

  // Not shown once the visitor has hidden it, or on the launch game page.
  if (hidden || splitLocale(pathname ?? "/").path === "/launch") {
    return null;
  }

  const googleReviewUrl = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || "https://search.google.com/local/writereview?placeid=ChIJMfNToTvfsTsRSBmfTmn1DCI";

  return (
    // On every screen size it waits until the visitor scrolls. `invisible` while hidden also takes it out of the tab order.
    <div className={`fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-start select-none font-sans transition-all duration-300 ${shown ? "opacity-100 translate-x-0 visible" : "opacity-0 translate-x-full invisible"}`}>
      {/* Hide button: a small × badge on the tab's top-left corner, inside a 44px tap area. */}
      <button
        type="button"
        onClick={hide}
        aria-label={t.common.hideRateUs}
        title={t.common.hideRateUs}
        className="absolute -top-5 -left-5 z-10 w-11 h-11 flex items-center justify-center cursor-pointer group/hide"
      >
        <span className="w-6 h-6 rounded-full bg-white dark:bg-night-800 text-brand-navy dark:text-night-text border border-slate-200 dark:border-night-600 shadow-md flex items-center justify-center group-hover/hide:bg-slate-100 transition-colors">
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M3 3l6 6M9 3l-6 6" />
          </svg>
        </span>
      </button>
      {/* Floating Tab Link */}
      <a
        href={googleReviewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white py-3.5 px-3 rounded-l-2xl shadow-lg border border-r-0 border-white/20 flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 translate-x-0 hover:-translate-x-1"
        aria-label={t.common.rateUsLabel}
      >
        {/* Star Icon */}
        <svg className="w-5 h-5 animate-pulse text-yellow-300 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <span className="text-[11px] font-black uppercase tracking-widest [writing-mode:vertical-lr] rotate-180">
          {t.common.rateUs}
        </span>
      </a>
    </div>
  );
}
