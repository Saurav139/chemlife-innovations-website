"use client";

import { useEffect, useState } from "react";
import { useT } from "@/i18n/LocaleProvider";
import { DARK_QUERY, THEME_EVENT, THEME_KEY, applyTheme, readChoice, saveChoice, type ThemeChoice } from "@/lib/theme";

/** Keeps the page in step with the device while the visitor hasn't picked a theme (dark mode switching on at sunset),
 *  and with picks made in another tab. Rendered once, in the layout. */
export function ThemeWatcher() {
  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const follow = () => applyTheme(readChoice());
    // Error pages (the 404) are re-rendered from a fresh <html> once React loads, losing what THEME_SCRIPT set.
    follow();
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_KEY) {
        follow();
        window.dispatchEvent(new Event(THEME_EVENT));
      }
    };
    media.addEventListener("change", follow);
    window.addEventListener("storage", onStorage);
    return () => {
      media.removeEventListener("change", follow);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return null;
}

const ICONS: Record<ThemeChoice, React.ReactNode> = {
  system: <path d="M4 5h16v11H4zM9 20h6M12 16v4" />,
  light: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  dark: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />,
};

/** The footer's theme switch: follow the device, or always light, or always dark. */
export default function ThemeToggle() {
  const t = useT();
  // Unknown until the page has loaded (the server can't read the visitor's pick), so nothing shows as picked at first.
  const [choice, setChoice] = useState<ThemeChoice | null>(null);

  useEffect(() => {
    const sync = () => setChoice(readChoice());
    sync();
    window.addEventListener(THEME_EVENT, sync);
    return () => window.removeEventListener(THEME_EVENT, sync);
  }, []);

  const labels: Record<ThemeChoice, string> = { system: t.footer.themeSystem, light: t.footer.themeLight, dark: t.footer.themeDark };

  return (
    <div role="group" aria-label={t.footer.theme} className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
      {(["system", "light", "dark"] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={choice === option}
          aria-label={labels[option]}
          title={labels[option]}
          onClick={() => saveChoice(option)}
          className={`flex h-11 w-11 md:h-9 md:w-9 items-center justify-center rounded-full transition-colors cursor-pointer ${
            choice === option ? "bg-white/15 text-white" : "text-slate-450 hover:text-white"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {ICONS[option]}
          </svg>
        </button>
      ))}
    </div>
  );
}
