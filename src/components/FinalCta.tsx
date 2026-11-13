"use client";

import Link from "next/link";
import DossierRequest from "@/components/DossierRequest";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/contact";
import { useHref, useT } from "@/i18n/LocaleProvider";

const primary =
  "inline-flex items-center justify-center gap-2 min-h-12 lg:min-h-14 px-7 rounded-full sm:whitespace-nowrap bg-white text-brand-orange-aa font-semibold shadow-md hover:bg-brand-navy hover:text-white transition-colors";
const secondary =
  "inline-flex items-center justify-center gap-2 min-h-12 lg:min-h-14 px-7 rounded-full sm:whitespace-nowrap border-2 border-white/80 text-white font-semibold hover:bg-white hover:text-brand-orange-aa transition-colors cursor-pointer";

/** The closing ask, on the brand orange: talk to a nutritionist, or request the technical dossier (a short form, then the PDF), or just call. */
export default function FinalCta() {
  const messages = useT();
  const t = messages.home.cta;
  const href = useHref();

  return (
    <section aria-labelledby="home-cta-title" className="relative overflow-hidden bg-brand-orange-aa text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(48,82,128,0.3),transparent_55%)]" />
      <div className="relative max-w-[1200px] mx-auto px-6 py-16 md:py-24 lg:py-28 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          {/* text-white: headings are navy by default (globals.css), which wouldn't read on the orange. */}
          <h2 id="home-cta-title" className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white">
            {t.title}
          </h2>
          <p className="mt-5 text-lg md:text-xl leading-relaxed max-w-2xl">{t.text}</p>
        </div>
        <div className="lg:col-span-5 flex flex-col gap-5 lg:items-end">
          {/* Each label stays on one line: side by side on tablets, stacked beside the heading on desktop where the column is too narrow for both. */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-col gap-3 w-full lg:w-auto">
            <Link href={href("/contact?type=nutritionist")} className={primary} data-analytics-click="Home CTA: talk to nutritionist">
              {messages.home.talkToNutritionist}
            </Link>
            <DossierRequest className={secondary} analytics="Home CTA: request dossier">
              {messages.home.whoWeAre.requestDossier}
            </DossierRequest>
          </div>
          {/* The phone number and the address each stay on one line; they sit side by side where there's room. */}
          <p className="text-sm leading-relaxed flex flex-wrap gap-x-4 gap-y-1 lg:justify-end">
            <span>{t.direct}:</span>
            <a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`} className="font-semibold underline underline-offset-4 whitespace-nowrap">
              {CONTACT_PHONE}
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold underline underline-offset-4 whitespace-nowrap">
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
