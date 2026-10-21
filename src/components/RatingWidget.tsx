"use client";

import { usePathname } from "next/navigation";
import { useT } from "@/i18n/LocaleProvider";

export default function RatingWidget() {
  const pathname = usePathname();
  const t = useT();

  // Don't render the rating widget on the launch game page itself
  if (pathname === "/launch") {
    return null;
  }

  const googleReviewUrl = process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || "https://search.google.com/local/writereview?placeid=ChIJMfNToTvfsTsRSBmfTmn1DCI";

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-start select-none font-sans">
      {/* Floating Tab Link */}
      <a
        href={googleReviewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-brand-orange hover:bg-brand-orange/95 text-white py-3.5 px-3 rounded-l-2xl shadow-lg border border-r-0 border-white/20 flex flex-col items-center gap-2 cursor-pointer transition-all duration-300 translate-x-0 hover:-translate-x-1"
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
