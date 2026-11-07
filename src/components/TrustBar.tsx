"use client";

import Image from "next/image";
import { Images } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";

const { frontRow, backRow } = Images.partnerLogos;
// Every partner once (the flip cards repeated one logo to fill their grid).
const logos = [...frontRow, ...backRow.filter((file) => !(frontRow as readonly string[]).includes(file))];

/**
 * The partner and customer logos in one slow strip, right under the hero: the first thing a buyer looks for is who
 * else already buys. Pauses on hover; with "reduce motion" the logos wrap in a still grid instead.
 */
export default function TrustBar() {
  const t = useT().home.trust;

  return (
    <section aria-label={t.title} className="bg-white border-b border-slate-200/80 py-8 md:py-10">
      <div className="max-w-[1200px] mx-auto px-6">
        <p className="text-center text-slate-aa text-xs md:text-sm font-semibold tracking-[0.2em] uppercase">{t.title}</p>
      </div>
      <div
        className="mt-6 md:mt-8 overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        {/* Two copies, so the strip loops without a gap: the animation slides it exactly one copy's width. The copies
            use margins (not gap) so the second half is exactly as wide as the first. */}
        <ul className="flex w-max items-center animate-marquee motion-reduce:animate-none motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:px-6">
          {[0, 1].map((copy) =>
            logos.map((file) => (
              <li
                key={`${copy}-${file}`}
                aria-hidden={copy === 1 || undefined}
                className={`relative h-10 w-32 md:h-12 md:w-44 shrink-0 mx-6 md:mx-9 my-2 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition duration-300 ${copy === 1 ? "motion-reduce:hidden" : ""}`}
              >
                <Image
                  src={Images.partnerLogos.path(file)}
                  alt={copy === 0 ? (Images.partnerLogos.names[file] ?? "") : ""}
                  fill
                  sizes="176px"
                  className="object-contain"
                />
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
