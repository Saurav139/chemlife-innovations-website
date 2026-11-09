"use client";

import Image from "next/image";
import { Images } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";

// The partners and the recognition: logos already on the site.
const PARTNER_LOGOS = [
  { src: Images.partnerLogos.path("huve.png"), name: "Huvepharma" },
  { src: Images.partnerLogos.path("ew_nutr.png"), name: "EW Nutrition" },
];
const RECOGNITION_LOGOS = [
  { src: Images.awards.ccamp, name: "C-CAMP" },
  { src: Images.awards.birac, name: "BIRAC" },
  { src: Images.awards.naarm, name: "a-IDEA, ICAR-NAARM" },
  { src: Images.awards.businessSuccess2026, name: "Business Success Awards 2026" },
];

const eyebrow = "text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-slate-500";

/**
 * Industry partners on the left, "recognised and supported by" on the right: the FAMI-QS certification first, then
 * the recognition logos and the Technology Development Board badge. Shared by the About and Who We Are pages.
 */
export default function ProofStrip({ className = "" }: { className?: string }) {
  const t = useT().home.whoWeAre;

  return (
    <section aria-label={`${t.proofPartners}, ${t.proofRecognised}`} className={`bg-white border-b border-slate-200 ${className}`}>
      <div className="max-w-[1200px] mx-auto px-6 py-10 md:py-12 grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        <div className="lg:col-span-4">
          <p className={eyebrow}>{t.proofPartners}</p>
          <ul className="flex items-center gap-8 mt-4">
            {PARTNER_LOGOS.map((logo) => (
              <li key={logo.name} className="relative h-10 w-32">
                <Image src={logo.src} alt={logo.name} fill sizes="128px" className="object-contain object-left" />
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-8 lg:border-l lg:border-slate-200 lg:pl-10">
          <p className={eyebrow}>{t.proofRecognised}</p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-4 mt-4">
            {/* FAMI-QS first, as the certification; "FAMI-QS certified" is its text alternative. */}
            <li className="relative h-12 w-24 md:h-14 md:w-28">
              <Image src={Images.awards.famiQs} alt={t.famiQs} fill sizes="112px" className="object-contain" />
            </li>
            {RECOGNITION_LOGOS.map((logo) => (
              <li key={logo.name} className="relative h-12 w-24 md:h-14 md:w-28">
                <Image src={logo.src} alt={logo.name} fill sizes="112px" className="object-contain" />
              </li>
            ))}
            {t.proofBadges.map((badge) => (
              <li key={badge} className="inline-flex items-center gap-2 rounded-full border border-teal-aa/30 bg-teal-aa/5 px-4 py-2 text-sm font-semibold text-brand-navy">
                <svg aria-hidden="true" className="w-4 h-4 text-teal-aa" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l8 3v6c0 5-3.4 8.2-8 9-4.6-.8-8-4-8-9V6zM8.8 12.2l2.2 2.2 4.2-4.4" />
                </svg>
                {badge}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
