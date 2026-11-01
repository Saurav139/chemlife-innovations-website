"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_COOKIE, LOCALE_NAMES, isTranslatedPath, localizePath, splitLocale, type Locale } from "@/i18n/config";
import { useLocale, useT } from "@/i18n/LocaleProvider";

/** The same page in another language, or that language's homepage when the page is English only. */
function addressIn(target: Locale, pathname: string) {
  const { path } = splitLocale(pathname);
  if (isTranslatedPath(path) || target === "en") return localizePath(path, target);
  return localizePath("/", target);
}

function Globe() {
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
    </svg>
  );
}

/** Remember the choice for a year, so it overrides the browser's language on later visits (src/proxy.ts). */
function remember(l: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
}

/** English · ಕನ್ನಡ · हिन्दी. A drop-down in the desktop header, a row of links in the mobile menu (`inline`). */
export default function LanguageSwitcher({ inline = false }: { inline?: boolean }) {
  const locale = useLocale();
  const t = useT();
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const links = LOCALES.map((l) => (
    <a
      key={l}
      href={addressIn(l, pathname)}
      lang={l}
      hrefLang={l}
      onClick={() => remember(l)}
      aria-current={l === locale ? "true" : undefined}
      className={
        inline
          ? `tap-target rounded-full border px-3.5 py-1.5 text-sm font-semibold ${l === locale ? "border-flame text-flame" : "border-line text-ink"}`
          : `block whitespace-nowrap px-4 py-2.5 text-[15px] font-semibold hover:bg-ink/5 ${l === locale ? "text-flame" : "text-ink"}`
      }
    >
      {LOCALE_NAMES[l]}
    </a>
  ));

  if (inline) {
    return (
      <div className="flex items-center gap-2 pt-6 pb-1" role="group" aria-label={t.nav.language}>
        <span className="text-copy-dim"><Globe /></span>
        {links}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`${t.nav.language}: ${LOCALE_NAMES[locale]}`}
        className="flex items-center gap-1.5 rounded-full border border-line bg-card/60 px-3.5 py-2.5 text-[14.5px] font-semibold text-ink transition-colors hover:border-ink cursor-pointer"
      >
        <Globe />
        <span className="whitespace-nowrap">{LOCALE_NAMES[locale]}</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 min-w-36 overflow-hidden rounded-2xl border border-line bg-card py-1.5 shadow-xl shadow-ink/10">
          {links}
        </div>
      )}
    </div>
  );
}
