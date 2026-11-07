"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Images } from "@/lib/assets";
import { useHref, useT } from "@/i18n/LocaleProvider";
import { REVEAL_VIEWPORT } from "@/lib/reveal";

const easeOut = [0.25, 0.1, 0, 1] as const;

// The four proof points, in the order of the language file (home.why.items): where each one's evidence is, and the
// logos that vouch for it.
const proofs = [
  { href: "/research", logos: [] as { src: string; alt: string }[], photo: Images.research.anbiot },
  { href: "/who-we-are", logos: [{ src: Images.awards.famiQs, alt: "FAMI-QS" }] },
  {
    href: "#awards",
    logos: [
      { src: Images.awards.birac, alt: "BIRAC" },
      { src: Images.awards.ccamp, alt: "C-CAMP" },
      { src: Images.awards.naarm, alt: "a-IDEA, ICAR-NAARM" },
    ],
  },
  {
    href: "#testimonials",
    logos: [
      { src: Images.testimonials.quadragen, alt: "Quadragen VetHealth" },
      { src: Images.testimonials.huve, alt: "Huvepharma" },
      { src: Images.partnerLogos.path("ew_nutr.png"), alt: "EW Nutrition" },
    ],
  },
] as const;

/**
 * Why ChemLife: the evidence a buyer weighs before a first order (technology, certification, institutional backing,
 * partners who stayed), each with its logos and a link to the proof itself.
 */
export default function WhyChemLife() {
  const messages = useT();
  const t = messages.home.why;
  const href = useHref();

  return (
    <section aria-labelledby="why-title" className="bg-white py-16 md:py-24 lg:py-32">
      <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <span className="text-teal-aa text-sm lg:text-base font-semibold tracking-widest uppercase block mb-3">{t.kicker}</span>
            <h2 id="why-title" className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-brand-navy">
              {messages.home.whoWeAre.tagline}
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed mt-5 max-w-lg">{t.intro}</p>
            <Link
              href={href("/contact?type=dossier")}
              data-analytics-click="Home why: request dossier"
              className="inline-flex items-center gap-2 min-h-12 px-6 mt-8 rounded-full bg-brand-navy hover:bg-brand-navy/90 text-white font-semibold transition-colors"
            >
              {messages.home.whoWeAre.requestDossier}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

        <ol className="lg:col-span-7 border-t border-slate-200">
          {t.items.map((item, i) => {
            const proof = proofs[i];
            return (
              <motion.li
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={REVEAL_VIEWPORT}
                transition={{ duration: 0.5, delay: i * 0.08, ease: easeOut }}
                className="grid grid-cols-[2.5rem_1fr] md:grid-cols-[3.5rem_1fr] gap-x-2 md:gap-x-4 py-8 md:py-10 border-b border-slate-200"
              >
                <span className="font-heading text-sm md:text-base font-bold text-teal-aa pt-1.5 tabular-nums" aria-hidden="true">
                  0{i + 1}
                </span>
                <div>
                  <h3 className="font-heading text-xl md:text-2xl font-bold text-brand-navy leading-snug">{item.title}</h3>
                  <p className="mt-2 text-slate-700 leading-relaxed max-w-prose">{item.text}</p>

                  {"photo" in proof ? (
                    <div className="relative mt-5 h-20 w-36 rounded-xl overflow-hidden border border-slate-200">
                      <Image src={proof.photo} alt="" fill sizes="144px" className="object-cover" />
                    </div>
                  ) : (
                    <ul className="flex flex-wrap gap-3 mt-5">
                      {proof.logos.map((logo) => (
                        <li key={logo.alt} className="relative h-14 w-28 rounded-xl border border-slate-200 bg-white">
                          <Image src={logo.src} alt={logo.alt} fill sizes="112px" className="object-contain p-2" />
                        </li>
                      ))}
                    </ul>
                  )}

                  <Link
                    href={href(proof.href)}
                    className="mt-5 inline-flex items-center gap-2 font-semibold text-brand-orange-aa hover:text-brand-orange-aa-hover underline-offset-4 hover:underline"
                  >
                    {item.link}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
