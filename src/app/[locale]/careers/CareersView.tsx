"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import { Images } from "@/lib/assets";
import { roleAnchor } from "@/lib/catalog";
import { CONTACT_EMAIL } from "@/lib/contact";
import { revealElement, useHashTarget } from "@/lib/deepLink";
import { useHref, useT } from "@/i18n/LocaleProvider";
import { applyPath, fill, useOpenRoles, type CareersProps } from "./roles";

// The page: the open internships (pick one, read about it, go on to its application page), then the programme's terms.
// The dashboard (/admin/careers) can close, rewrite, delete and add internships. The site's own internships are
// listed in src/lib/catalog.ts; their titles, departments and descriptions are in the language file (careers.roles),
// in the same order. "Apply for this Internship" opens the form at /careers/apply/<internship>.

/** "Accommodation:" as a heading: without its colon. */
const heading = (label: string) => label.replace(/\s*[:：]\s*$/, "");

const icon = (paths: React.ReactNode) => (
  <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    {paths}
  </svg>
);
const ICONS = {
  duration: icon(<><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>),
  stipend: icon(<path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />),
  lunch: icon(<><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><path d="M6 1v3M10 1v3M14 1v3" /></>),
  opportunity: icon(<><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" /></>),
  accommodation: icon(<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></>),
  travel: icon(<><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" /></>),
};

export default function CareersView(careers: CareersProps) {
  const t = useT().careers;
  const href = useHref();
  const roles = useOpenRoles(careers);
  const [selectedRoleId, setSelectedRoleId] = useState(roles[0]?.id);
  // Undefined only when every internship is closed.
  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? roles[0];

  // Opens at one internship from a link such as /careers#role-research-intern (the site search): selects its tab and
  // scrolls to its details.
  useHashTarget((target) => {
    const role = roles.find((item) => roleAnchor(item.id) === target);
    if (!role) return;
    setSelectedRoleId(role.id);
    revealElement("role-panel");
  });

  const terms = [
    { icon: ICONS.duration, title: t.duration, text: t.durationText },
    { icon: ICONS.stipend, title: t.stipend, text: t.stipendText },
    { icon: ICONS.lunch, title: t.lunch, text: t.lunchText },
    { icon: ICONS.opportunity, title: heading(t.opportunity), text: t.opportunityText },
    { icon: ICONS.accommodation, title: heading(t.accommodation), text: t.accommodationText },
    { icon: ICONS.travel, title: heading(t.travel), text: t.travelText },
  ];

  return (
    <VariantProvider>
      <Header />

      <main id="main" tabIndex={-1} className="bg-white min-h-screen text-brand-navy">
        {/* A plain section, not a fade-in: it's the first screen, so it shows without waiting for the page's JavaScript. */}
        <section className="pt-26 md:pt-32 pb-10 md:pb-16 lg:pt-36 lg:pb-20 text-white relative overflow-hidden bg-brand-navy flex items-center">
          <div className="absolute inset-0 z-0">
            <Image src={Images.heroes.careers} alt={t.heroAlt} fill sizes="100vw" className="object-cover opacity-50" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/80 to-brand-navy/60" />
            <div className="absolute inset-0 bg-black/10" />
          </div>

          <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full text-center lg:text-left">
            <span className="text-teal-aa-light text-sm font-semibold tracking-widest uppercase block mb-3">
              {t.kicker}
            </span>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3 md:mb-4 text-white max-w-4xl">
              {t.titleStart} <span className="text-teal-400">{t.titleAccent}</span> {t.titleEnd}
            </h1>
            <p className="text-white/85 text-base md:text-lg leading-relaxed max-w-3xl font-light">
              {t.intro}
            </p>
            <a
              href="#open-internships"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover px-7 py-3.5 text-sm font-bold text-white shadow transition-colors"
            >
              {t.openTitle}
              <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </a>
          </div>
        </section>

        {/* The open internships: pick one to see its details, then apply on its own page. */}
        <SectionWrapper id="open-internships" className="scroll-mt-24 py-16 md:py-24 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">

            <div className="text-center mb-8 md:mb-12">
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-brand-navy">
                {t.openTitle}
              </h2>
              {selectedRole && (
                <p className="text-gray-500 text-base mt-2 max-w-xl mx-auto">
                  {t.openText}
                </p>
              )}
            </div>

            {!selectedRole && (
              <div className="max-w-3xl mx-auto rounded-3xl bg-gray-55 border border-gray-200 p-8 md:p-10 text-center">
                <h3 className="font-heading text-xl font-bold text-brand-navy">{t.noOpenTitle}</h3>
                <p className="text-gray-600 text-base mt-2">
                  {fill(t.noOpenText, {
                    address: <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold underline underline-offset-2 break-all">{CONTACT_EMAIL}</a>,
                  })}
                </p>
              </div>
            )}

            {/* Every position as a tab, so visitors see all the openings at a glance (a drop-down hid all but one).
                Arrow keys move between tabs, as screen readers expect. */}
            {roles.length > 1 && (
              <div className="max-w-4xl mx-auto mb-8 md:mb-12">
                <p id="positions-label" className="text-xs font-bold text-gray-aa uppercase tracking-wider mb-3 text-center">
                  {t.selectPosition}
                </p>
                <div
                  role="tablist"
                  aria-labelledby="positions-label"
                  className={`grid gap-3 ${roles.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}
                  onKeyDown={(e) => {
                    const ids = roles.map((role) => role.id);
                    const i = ids.indexOf(selectedRole.id);
                    const next =
                      e.key === "ArrowRight" || e.key === "ArrowDown" ? ids[(i + 1) % ids.length]
                      : e.key === "ArrowLeft" || e.key === "ArrowUp" ? ids[(i - 1 + ids.length) % ids.length]
                      : e.key === "Home" ? ids[0]
                      : e.key === "End" ? ids[ids.length - 1]
                      : null;
                    if (!next) return;
                    e.preventDefault();
                    setSelectedRoleId(next);
                    document.getElementById(`role-tab-${next}`)?.focus();
                  }}
                >
                  {roles.map((role) => {
                    const active = role.id === selectedRole.id;
                    return (
                      <button
                        key={role.id}
                        id={`role-tab-${role.id}`}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        aria-controls="role-panel"
                        tabIndex={active ? 0 : -1}
                        onClick={() => setSelectedRoleId(role.id)}
                        className={`text-left rounded-2xl border-2 px-5 py-4 transition-colors cursor-pointer ${
                          active ? "border-teal-aa bg-teal-50" : "border-gray-200 bg-white hover:border-teal-aa/50"
                        }`}
                      >
                        <span className="block text-xs font-bold uppercase tracking-wider text-teal-aa">{role.department}</span>
                        <span className="block mt-1 font-heading font-bold text-brand-navy leading-snug">{role.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Split Details Container */}
            {selectedRole && (
              <div
                id="role-panel"
                role={roles.length > 1 ? "tabpanel" : undefined}
                aria-labelledby={roles.length > 1 ? `role-tab-${selectedRole.id}` : undefined}
                className="scroll-mt-28 bg-gray-55 border border-gray-200 rounded-3xl overflow-hidden shadow-sm"
              >
                <div className="flex flex-col lg:flex-row min-h-[550px]">

                  {/* Left Side: Text Details */}
                  <div className="lg:w-7/12 p-5 sm:p-8 lg:p-12 flex flex-col justify-between flex-grow">
                    <div>
                      <span className="text-teal-aa text-sm font-bold uppercase tracking-wider block mb-2">
                        {selectedRole.department}
                      </span>
                      <h3 className="font-heading text-3xl font-bold text-brand-navy mb-6">
                        {selectedRole.title}
                      </h3>

                      <p className="text-gray-650 text-base leading-relaxed mb-8">
                        {selectedRole.roleScope}
                      </p>

                      {/* Point-wise Required Qualifications */}
                      {selectedRole.qualifications.length > 0 && (
                        <div className="mb-8">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy/78 block mb-3">
                            {t.qualifications}
                          </h4>
                          <ul className="space-y-2">
                            {selectedRole.qualifications.map((qual, idx) => (
                              <li key={idx} className="text-gray-600 text-sm flex items-start gap-2">
                                <span aria-hidden="true" className="text-brand-orange text-xs mt-1.5">•</span>
                                <span>{qual}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Eligible Fields */}
                      {selectedRole.requirements.length > 0 && (
                        <div className="border-t border-gray-200/60 pt-6 mb-8">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy/78 block mb-3">
                            {t.eligible}
                          </h4>
                          <ul className="space-y-2">
                            {selectedRole.requirements.map((req, idx) => (
                              <li key={idx} className="text-gray-600 text-sm flex items-start gap-2">
                                <span aria-hidden="true" className="text-brand-orange text-xs mt-1.5">•</span>
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <Link
                      href={href(applyPath(selectedRole.id))}
                      className="block w-full py-4 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-bold text-base shadow transition-all duration-300 text-center lg:max-w-xs"
                    >
                      {t.apply}
                    </Link>
                  </div>

                  {/* Right Side: Clear Image Column */}
                  <div className="lg:w-5/12 relative min-h-[300px] lg:min-h-auto w-full">
                    <Image
                      src={selectedRole.bgImage}
                      alt={selectedRole.title}
                      fill
                      sizes="(min-width: 1024px) 42vw, 100vw"
                      className="object-cover"
                    />
                    {/* Subtle fade overlay just on the bottom/edges to frame nicely */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent lg:bg-gradient-to-l lg:from-black/10" />
                  </div>

                </div>
              </div>
            )}

          </div>
        </SectionWrapper>

        {/* The programme's terms, in one place */}
        <SectionWrapper className="py-12 md:py-16 bg-gray-50 border-t border-gray-150">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="max-w-3xl mb-8 md:mb-10">
              <h2 className="font-heading text-3xl font-bold text-brand-navy mb-3">{t.aboutTitle}</h2>
              <p className="text-gray-600 text-base leading-relaxed">{t.aboutText}</p>
            </div>
            <ul className="grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
              {terms.map((term) => (
                <li key={term.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-aa flex items-center justify-center flex-shrink-0">
                    {term.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-navy text-base">{term.title}</h3>
                    <p className="text-gray-600 text-sm mt-1 leading-relaxed">{term.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </SectionWrapper>
      </main>

      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
