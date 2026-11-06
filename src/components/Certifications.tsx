"use client";

import Image from "next/image";
import { Images } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";

// Names and descriptions are in the language file (home.certifications.items), in this order.
// A card without a logo shows an icon instead (Pharmexcil, until we have its logo file).
export const certificationCards: { logo?: { src: string; width: number; height: number } }[] = [
  { logo: { src: Images.awards.famiQs, width: 486, height: 210 } },
  {},
  { logo: { src: Images.certifications.startupIndiaKarnataka, width: 736, height: 196 } },
];

export default function Certifications() {
  const t = useT().home.certifications;

  return (
    <section id="certifications" aria-labelledby="certifications-title" className="bg-slate-50 py-16 md:py-24 scroll-mt-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <span className="text-teal-aa text-sm lg:text-base font-semibold tracking-widest uppercase">{t.kicker}</span>
          <h2 id="certifications-title" className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-brand-navy mt-2 mb-4 leading-tight">
            {t.title}
          </h2>
          <p className="text-brand-navy/80 text-base lg:text-lg leading-relaxed">{t.intro}</p>
        </div>

        <ul className="grid gap-6 md:grid-cols-3">
          {certificationCards.map((card, i) => {
            const item = t.items[i];
            return (
              <li key={item.name} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 lg:p-8 shadow-sm">
                {/* The logo repeats the card's heading, so it has no text alternative of its own. */}
                <div className="h-16 lg:h-20 flex items-center mb-6">
                  {card.logo ? (
                    <Image src={card.logo.src} alt="" width={card.logo.width} height={card.logo.height} sizes="240px" className="h-full w-auto max-w-full object-contain object-left" />
                  ) : (
                    <span aria-hidden="true" className="flex h-14 w-14 lg:h-16 lg:w-16 items-center justify-center rounded-full bg-teal-aa/10 text-teal-aa">
                      {/* A globe: export registration */}
                      <svg className="h-7 w-7 lg:h-8 lg:w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
                      </svg>
                    </span>
                  )}
                </div>
                <h3 className="font-heading text-xl lg:text-2xl font-bold text-brand-navy leading-snug">{item.name}</h3>
                <p className="mt-1 text-sm font-semibold text-teal-aa">{item.issuer}</p>
                <p className="mt-4 text-brand-navy/80 leading-relaxed">{item.description}</p>
                {item.reference && (
                  <p className="mt-auto pt-6">
                    <span className="inline-flex items-center gap-2 rounded-full border border-teal-aa/30 bg-teal-aa/5 px-3 py-1.5 text-sm font-semibold text-brand-navy">
                      <svg aria-hidden="true" className="h-4 w-4 text-teal-aa" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l8 3v6c0 5-3.4 8.2-8 9-4.6-.8-8-4-8-9V6zM8.8 12.2l2.2 2.2 4.2-4.4" /></svg>
                      {item.reference}
                    </span>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
