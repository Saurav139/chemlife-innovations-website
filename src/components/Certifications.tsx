"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Images } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";
import type { Messages } from "@/i18n/messages/en";
import { REVEAL_VIEWPORT } from "@/lib/reveal";

type Picture = { src: string; width: number; height: number };
type Card = { badge: Picture; certificate: Picture; marks: (Picture & { size: string })[] };
type Text = Messages["home"]["certifications"];

// Each card's text is in the language file (home.certifications.items), in this order. The badges and marks are
// cut from the certificates themselves, each mark at a height that suits its shape; `marks` pairs with the item's
// `marks` names by position.
export const certificateCards: Card[] = [
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

/** The designs of the section: every detail on two cards, a short strip, or one at a time like Awards & Recognition. */
export const CERTIFICATION_VARIANTS = ["detailed", "compact", "plaque"] as const;
export type CertificationsVariant = (typeof CERTIFICATION_VARIANTS)[number];

const easeOut = [0.25, 0.1, 0, 1] as const;

const Arrow = ({ className }: { className: string }) => (
  <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

type BodyProps = { t: Text; open: (i: number) => void; reduceMotion: boolean };

export default function Certifications({ variant = "detailed" }: { variant?: CertificationsVariant }) {
  const t = useT().home.certifications;
  const reduceMotion = !!useReducedMotion();
  const dialog = useRef<HTMLDialogElement>(null);
  const [viewing, setViewing] = useState(0);

  const open = (i: number) => {
    setViewing(i);
    dialog.current?.showModal();
  };
  const compact = variant === "compact";
  const Body = variant === "compact" ? Compact : variant === "plaque" ? Plaque : Detailed;

  return (
    <section
      id="certifications"
      aria-labelledby="certifications-title"
      className={`scroll-mt-20 ${variant === "plaque" ? "bg-white overflow-hidden" : "bg-[#faf8f5]"} ${compact ? "py-10 md:py-14" : "py-16 md:py-24"}`}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className={`text-center max-w-2xl mx-auto ${compact ? "mb-6 md:mb-8" : "mb-10 md:mb-14"}`}>
          <span className={`text-teal-aa font-semibold tracking-widest uppercase ${compact ? "text-xs lg:text-sm" : "text-sm lg:text-base"}`}>{t.kicker}</span>
          <h2
            id="certifications-title"
            className={`font-heading font-bold text-brand-navy leading-tight ${compact ? "text-2xl md:text-3xl mt-1" : "text-3xl md:text-4xl lg:text-5xl mt-2 mb-4"}`}
          >
            {t.title}
          </h2>
          {variant === "detailed" && <p className="text-brand-navy/80 text-base lg:text-lg leading-relaxed">{t.intro}</p>}
        </div>

        <Body t={t} open={open} reduceMotion={reduceMotion} />
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

/** Two cards with everything on the certificate: scope, standard, numbers, dates, site and the marks. */
function Detailed({ t, open, reduceMotion }: BodyProps) {
  return (
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
                <Arrow className="ml-auto mr-2 h-5 w-5 shrink-0 text-teal-aa transition-transform duration-200 group-hover/view:translate-x-1" />
              </button>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}

/** A short strip: badge, name, one line, the number and validity, and a link to the certificate. */
function Compact({ t, open, reduceMotion }: BodyProps) {
  return (
    <ul className="mx-auto grid max-w-[1000px] gap-4 md:grid-cols-2">
      {certificateCards.map((card, i) => {
        const item = t.items[i];
        return (
          <motion.li
            key={item.name}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={REVEAL_VIEWPORT}
            transition={{ duration: 0.5, delay: i * 0.1, ease: easeOut }}
            className="flex gap-4 rounded-2xl border border-brand-navy/10 bg-white p-5"
          >
            <div className="flex h-14 w-16 shrink-0 items-center justify-center sm:w-20">
              <Image src={card.badge.src} alt="" width={card.badge.width} height={card.badge.height} sizes="80px" className="max-h-full w-auto max-w-full object-contain" />
            </div>
            <div className="min-w-0">
              <h3 className="font-heading text-lg font-bold text-brand-navy leading-snug">{item.name}</h3>
              <p className="mt-1 text-sm text-brand-navy/80 leading-relaxed">{item.brief}</p>
              <p className="mt-2 text-sm font-semibold text-brand-navy/70">{item.keyFacts.join(" · ")}</p>
              <button
                type="button"
                onClick={() => open(i)}
                aria-haspopup="dialog"
                className="group/view mt-1 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-teal-aa hover:underline"
              >
                {t.view}
                <span className="sr-only">: {item.name}</span>
                <Arrow className="h-4 w-4 transition-transform duration-200 group-hover/view:translate-x-1" />
              </button>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}

/** One certificate at a time on an orange-framed plaque with numbered stops, like Awards & Recognition. */
function Plaque({ t, open, reduceMotion }: BodyProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = certificateCards.length;
  const card = certificateCards[active];
  const item = t.items[active];

  // Moves on by itself every 8 seconds, except for visitors who asked for less motion or while it is being used.
  useEffect(() => {
    if (reduceMotion || paused) return;
    const timer = setInterval(() => setActive((prev) => (prev + 1) % count), 8000);
    return () => clearInterval(timer);
  }, [active, count, paused, reduceMotion]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative max-w-[900px] mx-auto">
        <div className="bg-brand-orange rounded-2xl p-[3px] shadow-2xl">
          <div className="bg-white rounded-xl p-6 lg:p-8 min-h-[340px] flex items-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={reduceMotion ? false : { opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -40 }}
                transition={{ duration: 0.4, ease: easeOut }}
                className="flex flex-col sm:flex-row items-center gap-8 lg:gap-10 w-full"
              >
                {/* The badge on a light orange plaque */}
                <div className="relative w-full max-w-80 sm:w-72 lg:w-[340px] aspect-[4/3] shrink-0">
                  <div className="absolute inset-0 bg-orange-200 rounded-2xl shadow-2xl border-4 border-orange-300 p-4">
                    <div className="flex h-full w-full items-center justify-center rounded-lg bg-white p-6 shadow-inner">
                      <Image src={card.badge.src} alt="" width={card.badge.width} height={card.badge.height} sizes="300px" className="max-h-full w-auto max-w-full object-contain" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <span className="text-teal-aa text-sm font-semibold tracking-widest uppercase">{item.issuer}</span>
                  <h3 className="font-heading text-2xl lg:text-3xl font-bold text-brand-navy mt-2 mb-3 leading-tight">{item.name}</h3>
                  <p className="text-brand-navy/85 text-base lg:text-lg leading-relaxed">{item.brief}</p>
                  <p className="mt-3 text-sm font-semibold text-brand-navy/70">{item.keyFacts.join(" · ")}</p>
                  <button
                    type="button"
                    onClick={() => open(active)}
                    aria-haspopup="dialog"
                    className="group/view mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg border border-brand-navy px-5 font-semibold text-brand-navy transition-colors duration-200 hover:bg-brand-navy hover:text-white"
                  >
                    {t.view}
                    <Arrow className="h-4 w-4 transition-transform duration-200 group-hover/view:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Top decorative ribbon */}
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex gap-1" aria-hidden="true">
          <div className="w-6 h-3 bg-brand-orange rounded-b-sm skew-x-[20deg]" />
          <div className="w-6 h-3 bg-brand-orange rounded-b-sm -skew-x-[20deg]" />
        </div>
      </div>

      {/* Numbered stops between two rails */}
      <div className="relative mx-auto mt-10 h-20" style={{ width: `min(100%, ${count * 110}px)` }}>
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-teal-400/30 rounded-full" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-teal-400/30 rounded-full" />
        <div className="relative flex justify-between h-full">
          {certificateCards.map((_, i) => {
            const isActive = i === active;
            const tie = `w-[2px] h-5 transition-colors duration-500 ${isActive ? "bg-teal-400" : i < active ? "bg-teal-400/70" : "bg-teal-400/20"}`;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className="relative flex flex-col items-center justify-between h-full cursor-pointer"
                style={{ width: `${100 / count}%` }}
                // Starts with the number on the button ("01"), so voice control users can say what they see
                aria-label={`0${i + 1}: ${t.items[i].name}`}
                aria-current={isActive ? "true" : undefined}
              >
                <div className={tie} />
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-md border-2 transition-all duration-500 ${
                    isActive
                      ? "bg-teal-aa-light border-teal-aa-light text-brand-navy scale-110 shadow-lg shadow-teal-400/30"
                      : i < active
                        ? "bg-teal-400/20 border-teal-400/40 text-teal-700"
                        : "bg-transparent border-teal-400/30 text-slate-aa"
                  }`}
                >
                  <span className="text-xs sm:text-sm font-bold">{`0${i + 1}`}</span>
                </div>
                <div className={tie} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
