"use client";

import { useT } from "@/i18n/LocaleProvider";

/**
 * Pause / play for content that moves on its own, so a visitor can stop it (WCAG 2.2.2). The state comes from
 * usePausable. `tone` is the colour of what's behind it.
 */
export default function PauseButton({
  paused,
  onToggle,
  tone = "light",
  className = "",
}: {
  paused: boolean;
  onToggle: () => void;
  tone?: "light" | "dark";
  className?: string;
}) {
  const t = useT().common;
  const label = paused ? t.playMotion : t.pauseMotion;
  const colours =
    tone === "dark"
      ? "text-white/80 hover:text-white border-white/40 hover:border-white/70 bg-black/20 focus-visible:outline-white"
      : "text-slate-600 hover:text-brand-navy border-slate-300 hover:border-brand-navy/50 bg-white";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className={`tap-target w-8 h-8 shrink-0 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${colours} ${className}`}
    >
      <svg className="w-3 h-3 fill-current" viewBox="0 0 12 12" aria-hidden="true">
        {paused ? <path d="M3 1.5v9l7.5-4.5z" /> : <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" />}
      </svg>
    </button>
  );
}
