"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Certifications, { CERTIFICATION_VARIANTS, type CertificationsVariant } from "@/components/Certifications";

// In the order of CERTIFICATION_VARIANTS.
const options: { id: CertificationsVariant; label: string; note: string }[] = [
  { id: "detailed", label: "Detailed", note: "Two cards with everything printed on each certificate: scope, standard, numbers, dates, site and the accreditation marks." },
  { id: "compact", label: "Compact", note: "A short strip: badge, one line on what it covers, the number and the expiry date. The least homepage space." },
  { id: "plaque", label: "Awards style", note: "One certificate at a time on the orange-framed plaque used by Awards & Recognition, with numbered stops. It moves on by itself." },
];

export default function CertificatesSwitcher() {
  const [variant, setVariant] = useState<CertificationsVariant>("detailed");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  // The chosen design is kept in the address (#compact), so a link opens on it.
  useEffect(() => {
    const sync = () => {
      const value = window.location.hash.slice(1) as CertificationsVariant;
      if (CERTIFICATION_VARIANTS.includes(value)) setVariant(value);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const index = options.findIndex((option) => option.id === variant);
  const select = (next: number, focus = false) => {
    const wrapped = (next + options.length) % options.length;
    setVariant(options[wrapped].id);
    window.history.replaceState(null, "", `#${options[wrapped].id}`);
    if (focus) tabs.current[wrapped]?.focus();
  };

  return (
    <main id="main" tabIndex={-1} className="bg-white pt-28 md:pt-36">
      <div className="max-w-[1200px] mx-auto px-6 pb-8">
        <Link href="/previews" className="text-sm font-semibold text-brand-navy/70 hover:text-brand-navy">← Design previews</Link>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-navy mt-3">Certificates section</h1>
        <p className="text-brand-navy/70 mt-2 max-w-2xl">Three designs of the same section, for the homepage. Pick one, or step through them with the arrows.</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => select(index - 1)} aria-label="Previous design" className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-navy/20 text-brand-navy hover:border-brand-navy">
            <span aria-hidden="true">←</span>
          </button>
          <div role="tablist" aria-label="Certificates section designs" className="flex flex-wrap gap-2">
            {options.map((option, i) => (
              <button
                key={option.id}
                ref={(el) => { tabs.current[i] = el; }}
                type="button"
                role="tab"
                id={`tab-${option.id}`}
                aria-selected={variant === option.id}
                aria-controls="design-preview"
                tabIndex={variant === option.id ? 0 : -1}
                onClick={() => select(i)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight") { event.preventDefault(); select(i + 1, true); }
                  if (event.key === "ArrowLeft") { event.preventDefault(); select(i - 1, true); }
                }}
                className={`min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors duration-200 ${
                  variant === option.id ? "border-brand-navy bg-brand-navy text-white" : "border-brand-navy/20 text-brand-navy hover:border-brand-navy"
                }`}
              >
                <span aria-hidden="true" className="mr-2 opacity-70">{String.fromCharCode(65 + i)}</span>
                {option.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => select(index + 1)} aria-label="Next design" className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-navy/20 text-brand-navy hover:border-brand-navy">
            <span aria-hidden="true">→</span>
          </button>
        </div>
        <p className="mt-4 max-w-2xl text-sm text-brand-navy/70" aria-live="polite">{options[index].note}</p>
      </div>

      <div id="design-preview" role="tabpanel" aria-labelledby={`tab-${variant}`} className="border-t border-brand-navy/10">
        {/* Keyed so each design starts fresh, with its scroll-in animation. */}
        <Certifications key={variant} variant={variant} />
      </div>
    </main>
  );
}
