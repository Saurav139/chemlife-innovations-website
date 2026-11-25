"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { TrialResult } from "./evidence";

// The two figures in the Evidence section, both drawn from the data sheet's own numbers: the in-vitro zones
// of inhibition against a millimetre ruler, beside the photographs of the plates they were measured on, and
// the in-vivo results as control against product.

type Row = readonly [string, string];

/**
 * The server draws every bar at full length. Bars still below the screen when the script runs start empty and
 * grow as they scroll into view; ones already on screen, and all of them for visitors who prefer less motion,
 * stay as they are.
 */
function useGrow<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [empty, setEmpty] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setEmpty(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setEmpty(false);
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, empty] as const;
}

const grow = "transition-[width] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]";

/** Zones of inhibition against a ruler marked every 10 mm, with each organism's test plate beside it. */
export function ZoneChart({ rows, plates = {} }: { rows: readonly Row[]; plates?: Record<string, string> }) {
  const [ref, empty] = useGrow<HTMLDivElement>();
  // Pointing at a plate or its bar picks out the pair.
  const [hot, setHot] = useState<string | null>(null);
  const end = Math.ceil(Math.max(...rows.map(([, mm]) => Number(mm))) / 10) * 10;
  const ticks = Array.from({ length: end / 10 + 1 }, (_, i) => i * 10);
  const every10mm = (colour: string) => `repeating-linear-gradient(to right, ${colour} 0, ${colour} 1px, transparent 1px, transparent ${1000 / end}%)`;
  const photographed = rows.filter(([organism]) => plates[organism]);
  const columns = "grid grid-cols-[minmax(0,6.5rem)_1fr_3.25rem] sm:grid-cols-[8rem_1fr_3.75rem] items-center gap-x-4";

  return (
    <div ref={ref} className="grid lg:grid-cols-12 gap-x-14 gap-y-10 items-center">
      {photographed.length > 0 && (
        <ul className={`lg:col-span-5 grid gap-x-5 gap-y-6 ${photographed.length > 2 ? "grid-cols-3" : "grid-cols-2 max-w-md"}`}>
          {photographed.map(([organism, mm]) => (
            <li key={organism} onMouseEnter={() => setHot(organism)} onMouseLeave={() => setHot(null)} className={`transition-opacity duration-300 ${hot && hot !== organism ? "opacity-35" : ""}`}>
              <figure>
                <div className={`relative aspect-square rounded-full overflow-hidden ring-2 transition-shadow duration-300 ${hot === organism ? "ring-brand-gold" : "ring-white/20"}`}>
                  <Image src={plates[organism]} alt={`Test plate for ${organism}, with clear zones around the wells`} fill sizes="(min-width: 1024px) 200px, 33vw" className="object-cover scale-[1.03]" />
                </div>
                <figcaption className="mt-3 text-center leading-tight">
                  <i className="text-sm sm:text-base whitespace-nowrap text-white/85">{organism}</i>
                  <span className="block mt-1 font-bold text-brand-gold tabular-nums">{mm} mm</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      )}

      <div className={photographed.length > 0 ? "lg:col-span-7" : "lg:col-span-12 max-w-3xl"}>
        <ul role="list">
          {rows.map(([organism, mm], i) => (
            <li
              key={organism}
              onMouseEnter={() => setHot(organism)}
              onMouseLeave={() => setHot(null)}
              className={`${columns} py-2.5 transition-opacity duration-300 ${hot && hot !== organism ? "opacity-35" : ""}`}
            >
              <i className="text-white/90">{organism}</i>
              <div className="relative h-4 rounded-[3px] bg-white/10 overflow-hidden" style={{ backgroundImage: every10mm("rgb(255 255 255 / 0.3)") }}>
                <div className={`absolute inset-y-0 left-0 bg-brand-gold ${grow}`} style={{ width: empty ? 0 : `${(Number(mm) / end) * 100}%`, transitionDelay: `${i * 70}ms` }} />
                <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: every10mm("rgb(21 39 63 / 0.4)") }} />
              </div>
              <span className="text-right font-bold tabular-nums">
                {mm}
                <span className="font-medium text-white/65 text-sm"> mm</span>
              </span>
            </li>
          ))}
        </ul>
        {/* The ruler's numbers, under the bars */}
        <div aria-hidden="true" className={`${columns} mt-1 text-xs text-white/65 tabular-nums`}>
          <span />
          <div className="relative h-4">
            {ticks.map((tick) => (
              <span key={tick} className={`absolute top-0 ${tick === 0 ? "" : tick === end ? "-translate-x-full" : "-translate-x-1/2"}`} style={{ left: `${(tick / end) * 100}%` }}>
                {tick}
              </span>
            ))}
          </div>
          <span className="text-right">mm</span>
        </div>
      </div>
    </div>
  );
}

const number = (value: number) => value.toLocaleString("en-US", { maximumFractionDigits: 2 });

/** Control against product for each measure, as bars drawn from zero. */
export function TrialCharts({ results, name }: { results: TrialResult[]; name: string }) {
  const [ref, empty] = useGrow<HTMLDivElement>();
  return (
    <div ref={ref}>
      <ul className="grid md:grid-cols-3 gap-5">
        {results.map((result, i) => {
          const top = Math.max(result.control, result.treated);
          return (
            <li key={result.measure} className="rounded-2xl bg-white/[0.06] ring-1 ring-white/10 p-6 flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-semibold text-white leading-snug">
                  {result.measure} <span className="font-normal text-white/65">({result.unit})</span>
                </h4>
                <span className="flex-shrink-0 rounded-full bg-brand-gold px-3 py-0.5 text-sm font-bold text-[#15273F] tabular-nums">{result.change}</span>
              </div>
              <dl className="mt-6 space-y-3">
                {(
                  [
                    ["Control", result.control, "bg-white/45"],
                    [name, result.treated, "bg-brand-gold"],
                  ] as const
                ).map(([label, value, colour]) => (
                  <div key={label} className="grid grid-cols-[5.25rem_1fr_3.5rem] items-center gap-x-3">
                    <dt className="text-sm text-white/85">{label}</dt>
                    <dd className="contents">
                      <span aria-hidden="true" className="h-3 rounded-[3px] bg-white/10 overflow-hidden">
                        <span className={`block h-full ${colour} ${grow}`} style={{ width: empty ? 0 : `${(value / top) * 100}%`, transitionDelay: `${i * 120}ms` }} />
                      </span>
                      <span className="text-right font-bold tabular-nums">{number(value)}</span>
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-auto pt-5 text-sm text-white/65 tabular-nums">{result.p ?? " "}</p>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-sm text-white/65">Bars are drawn from zero.</p>
    </div>
  );
}
