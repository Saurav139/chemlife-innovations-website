"use client";

import { useId, useState } from "react";
import type { Dose } from "./evidence";

// How much of the product a batch needs, from the inclusion rate on the page: a feed mill enters its tonnes,
// a farm its birds or litres of water. Set on the orange dosing panel.

const number = (value: number) => value.toLocaleString("en-US", { maximumFractionDigits: 2 });

/** "250 g", "2.5–5 kg": grams and millilitres until the larger figure reaches a thousand. */
function amount(min: number, max: number, unit: Dose["unit"]) {
  const large = max >= 1000;
  const shown = (value: number) => number(large ? value / 1000 : value);
  const label = large ? (unit === "g" ? "kg" : "L") : unit;
  return `${min === max ? shown(min) : `${shown(min)}–${shown(max)}`} ${label}`;
}

export default function DoseCalculator({ dose, name }: { dose: Dose; name: string }) {
  const id = useId();
  const [quantity, setQuantity] = useState(String(dose.start));
  const [chosen, setChosen] = useState(0);
  const rate = dose.rates[chosen];
  const batches = Number(quantity) / dose.per;
  const valid = quantity.trim() !== "" && Number.isFinite(batches) && batches > 0;

  return (
    <div className="mt-7 rounded-2xl bg-[#8f2a17] p-5 md:p-6">
      <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Work out a batch</h4>

      {dose.rates.length > 1 && (
        <div role="group" aria-label="Which animals or conditions" className="mt-4 flex flex-wrap gap-2">
          {dose.rates.map((option, i) => (
            <button
              key={option.label}
              type="button"
              aria-pressed={chosen === i}
              onClick={() => setChosen(i)}
              className={`min-h-9 rounded-full px-3.5 text-sm font-semibold transition-colors ${chosen === i ? "bg-white text-[#8f2a17]" : "bg-white/15 text-white hover:bg-white/25"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          className="w-28 min-h-11 rounded-xl border-0 bg-white px-3.5 text-lg font-bold text-brand-navy tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        />
        <label htmlFor={id} className="font-semibold text-white">{dose.basis}</label>
      </div>

      <p aria-live="polite" className="mt-5 border-t border-white/25 pt-4">
        <span className="block text-sm text-white">needs</span>
        <span className="block text-4xl md:text-[2.75rem] font-bold leading-tight tabular-nums">{valid ? amount(batches * rate.min, batches * rate.max, dose.unit) : "—"}</span>
        <span className="block text-white">
          of {name}
          {dose.suffix ? ` ${dose.suffix}` : ""}
        </span>
      </p>
    </div>
  );
}
