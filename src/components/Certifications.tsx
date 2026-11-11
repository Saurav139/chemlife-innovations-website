"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Images } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";
import { REVEAL_VIEWPORT } from "@/lib/reveal";

type Picture = { src: string; width: number; height: number };

// Each card's text is in the language file (home.certifications.items), in this order. The badges and marks are
// cut from the certificates themselves, each mark at a height that suits its shape; `marks` pairs with the item's `marks` names by position.
export const certificateCards: { badge: Picture; certificate: Picture; marks: (Picture & { size: string })[] }[] = [
  {
    badge: { src: Images.awards.famiQs, width: 486, height: 210 },
    certificate: { src: Images.certifications.famiQsCertificate, width: 1240, height: 1753 },
    marks: [{ src: Images.certifications.swissCert, width: 423, height: 147, size: "h-12 md:h-14" }],
  },
  {
    badge: { src: Images.certifications.juhtHalal, width: 259, height: 260 },
    certificate: { src: Images.certifications.halalCertificate, width: 1240, height: 1754 },
    marks: [
      { src: Images.certifications.eiac, width: 368, height: 200, size: "h-14 md:h-16" },
      { src: Images.certifications.gacHalal, width: 189, height: 240, size: "h-16 md:h-20" },
      { src: Images.certifications.saudiHalalCenter, width: 487, height: 120, size: "h-9 md:h-10" },
    ],
  },
];

const easeOut = [0.25, 0.1, 0, 1] as const;

export default function Certifications() {
  const t = useT().home.certifications;
  const reduceMotion = useReducedMotion();
  const dialog = useRef<HTMLDialogElement>(null);
  const [viewing, setViewing] = useState(0);

  const open = (i: number) => {
    setViewing(i);
    dialog.current?.showModal();
  };

  return (
    <section id="certifications" aria-labelledby="certifications-title" className="bg-[#faf8f5] py-16 md:py-24 scroll-mt-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <span className="text-teal-aa text-sm lg:text-base font-semibold tracking-widest uppercase">{t.kicker}</span>
          <h2 id="certifications-title" className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-brand-navy mt-2 mb-4 leading-tight">
            {t.title}
          </h2>
          <p className="text-brand-navy/80 text-base lg:text-lg leading-relaxed">{t.intro}</p>
        </div>

        <ul className="grid gap-6 lg:gap-8 lg:grid-cols-2">
          {certificateCards.map((card, i) => {
            const item = t.items[i];
            return (
              <motion.li
                key={item.name}
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={REVEAL_VIEWPORT}
                transition={{ duration: 0.6, delay: i * 0.12, ease: easeOut }}
                className="flex flex-col rounded-2xl border border-brand-navy/10 bg-white p-6 md:p-8"
              >
                <div className="flex items-center gap-5">
                  {/* The badge repeats the card's heading, so it has no text alternative of its own. */}
                  <div className="flex h-16 w-24 shrink-0 items-center md:h-20 md:w-28">
                    <Image src={card.badge.src} alt="" width={card.badge.width} height={card.badge.height} sizes="112px" className="max-h-full w-auto max-w-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl md:text-2xl font-bold text-brand-navy leading-snug">{item.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-teal-aa">{item.issuer}</p>
                  </div>
                </div>

                <p className="mt-5 text-base text-brand-navy/80 leading-relaxed">{item.summary}</p>

                <dl className="mt-5 border-t border-brand-navy/10">
                  {item.facts.map((fact) => (
                    <div key={fact.label} className="grid gap-x-4 gap-y-0.5 border-b border-brand-navy/10 py-2.5 sm:grid-cols-[11rem_1fr]">
                      <dt className="text-sm font-semibold text-brand-navy/70">{fact.label}</dt>
                      <dd className="text-sm md:text-[15px] text-brand-navy leading-relaxed break-words">{fact.value}</dd>
                    </div>
                  ))}
                </dl>

                {item.list.length > 0 && (
                  <details className="group border-b border-brand-navy/10">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-2.5 text-sm font-semibold text-brand-navy [&::-webkit-details-marker]:hidden">
                      {item.listTitle}
                      <svg aria-hidden="true" className="h-4 w-4 shrink-0 text-teal-aa transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                    </summary>
                    <ul className="grid gap-x-6 gap-y-1.5 pb-4 text-sm text-brand-navy/80 sm:grid-cols-2">
                      {item.list.map((entry) => (
                        <li key={entry} className="leading-snug">{entry}</li>
                      ))}
                    </ul>
                  </details>
                )}

                <p className="mt-4 text-sm text-brand-navy/70 leading-relaxed">{item.note}</p>

                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-navy/60">{item.marksLabel}</p>
                  <ul className="mt-3 flex flex-wrap items-center gap-x-7 gap-y-4">
                    {card.marks.map((mark, m) => (
                      <li key={mark.src}>
                        <Image src={mark.src} alt={item.marks[m]} width={mark.width} height={mark.height} sizes="200px" className={`w-auto ${mark.size}`} />
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-7">
                  <button
                    type="button"
                    onClick={() => open(i)}
                    aria-haspopup="dialog"
                    className="group/view flex w-full items-center gap-4 rounded-xl border border-brand-navy/15 p-3 text-left transition-colors duration-200 hover:border-teal-aa"
                  >
                    <Image
                      src={card.certificate.src}
                      alt=""
                      width={card.certificate.width}
                      height={card.certificate.height}
                      sizes="64px"
                      className="h-20 w-14 shrink-0 rounded border border-brand-navy/10 object-cover object-top"
                    />
                    <span className="font-semibold text-brand-navy">
                      {t.view}
                      <span className="sr-only">: {item.name}</span>
                    </span>
                    <svg aria-hidden="true" className="ml-auto mr-2 h-5 w-5 shrink-0 text-teal-aa transition-transform duration-200 group-hover/view:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </button>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>

      {/* The certificate itself, full size. A click on the dimmed surround closes it, as does Escape. */}
      <dialog
        ref={dialog}
        aria-label={t.items[viewing].name}
        onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}
        className="m-auto max-h-[92dvh] w-[min(92vw,820px)] overflow-y-auto rounded-xl bg-white p-0 shadow-2xl backdrop:bg-brand-navy/70"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-brand-navy/10 bg-white px-4 py-2">
          <p className="font-heading font-bold text-brand-navy">{t.items[viewing].name}</p>
          <button type="button" onClick={() => dialog.current?.close()} className="min-h-11 rounded-lg px-3 font-semibold text-brand-navy hover:text-teal-aa">
            {t.close}
          </button>
        </div>
        <Image
          src={certificateCards[viewing].certificate.src}
          alt={t.items[viewing].imageAlt}
          width={certificateCards[viewing].certificate.width}
          height={certificateCards[viewing].certificate.height}
          sizes="(min-width: 900px) 820px, 92vw"
          className="h-auto w-full"
        />
      </dialog>
    </section>
  );
}
