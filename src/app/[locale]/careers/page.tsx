"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import { Images } from "@/lib/assets";
import { INTERNSHIP_ROLES, roleAnchor } from "@/lib/catalog";
import { revealElement, useHashTarget } from "@/lib/deepLink";
import { useLocale, useT } from "@/i18n/LocaleProvider";

const easeOut = [0.25, 0.1, 0, 1] as const;

interface InternshipPosition {
  id: string;
  title: string;
  department: string;
  bgImage: string;
  requirements: string[];
  roleScope: string;
  qualifications: string[];
}

// The internships are listed in src/lib/catalog.ts; their titles, departments and descriptions are in the language
// file (careers.roles), in the same order.

export default function CareersPage() {
  const t = useT().careers;
  const locale = useLocale();
  const internshipRoles = INTERNSHIP_ROLES.map((role, i) => ({ ...role, ...t.roles[i] }));
  const [selectedRoleId, setSelectedRoleId] = useState("research-intern");
  const [activeJob, setActiveJob] = useState<(typeof internshipRoles)[number] | null>(null);
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [showAttachReminder, setShowAttachReminder] = useState(false);

  // Escape closes the application form or the reminder, and the page behind doesn't scroll while one is open.
  const overlayOpen = !!activeJob || showAttachReminder;
  useEffect(() => {
    if (!overlayOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setActiveJob(null);
      setShowAttachReminder(false);
    };
    const root = document.documentElement;
    root.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [overlayOpen]);

  const selectedRole = internshipRoles.find((role) => role.id === selectedRoleId) || internshipRoles[0];

  // Opens at one internship from a link such as /careers#role-research-intern (the site search): selects its tab and
  // scrolls to its details.
  useHashTarget((target) => {
    const role = internshipRoles.find((item) => roleAnchor(item.id) === target);
    if (!role) return;
    setSelectedRoleId(role.id);
    revealElement("role-panel");
  });

  // Sync email subject and body template when active job changes
  useEffect(() => {
    if (activeJob) {
      const formattedName = applicantName ? applicantName : "[Your Name]";
      setEmailSubject(`Application for Internship - ${activeJob.englishTitle} (${formattedName})`);
      setEmailBody(
        `Dear Hiring Team at ChemLife Innovations,\n\nI am writing to apply for the ${activeJob.englishTitle} position in the ${activeJob.englishDepartment}.\n\nMy name is ${formattedName} and my email is ${applicantEmail || "[Your Email]"}.\n\n[PLEASE MANUALLY ATTACH YOUR RESUME/CV FILE TO THIS EMAIL DRAFT]\n\nI look forward to hearing from you.\n\nSincerely,\n${formattedName}`
      );
    } else {
      setEmailSubject("");
      setEmailBody("");
      setShowAttachReminder(false);
    }
  }, [activeJob, applicantName, applicantEmail]);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJob) return;

    // Construct mailto link
    const to = "innovate@chemlifeinnovations.com";
    const subject = encodeURIComponent(emailSubject);
    const body = encodeURIComponent(emailBody);
    const mailtoUrl = `mailto:${to}?subject=${subject}&body=${body}`;

    // Open mail client
    window.location.href = mailtoUrl;

    // Show resume attachment reminder popup
    setShowAttachReminder(true);
  };

  return (
    <VariantProvider>
      <Header />

      <main className="bg-white dark:bg-night-800 min-h-screen text-brand-navy dark:text-night-text">
        {/* Careers Hero Section */}
        <SectionWrapper className="pt-26 md:pt-32 pb-10 md:pb-24 lg:pt-36 lg:pb-32 text-white relative overflow-hidden bg-brand-navy dark:bg-night-band flex items-center">
          <div className="absolute inset-0 z-0">
            <Image
              src={Images.heroes.careers}
              alt={t.heroAlt}
              fill
              sizes="100vw"
              className="object-cover opacity-50"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 dark:from-night-band/95 via-brand-navy/80 dark:via-night-band/80 to-brand-navy/60 dark:to-night-band/60" />
            <div className="absolute inset-0 bg-black/10" />
          </div>

          <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full text-center lg:text-left">
            <span className="text-teal-aa-light text-sm font-semibold tracking-widest uppercase block mb-3">
              {t.kicker}
            </span>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-6xl font-bold leading-tight mb-3 md:mb-4 text-white max-w-4xl">
              {t.titleStart} <span className="text-teal-400">{t.titleAccent}</span> {t.titleEnd}
            </h1>
            <p className="text-white/85 text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl font-light">
              {t.intro}
            </p>
          </div>
        </SectionWrapper>

        {/* About & Internship Considerations Section */}
        <SectionWrapper className="py-12 md:py-20 bg-gray-50 dark:bg-night-900 border-b border-gray-150 dark:border-night-600">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* Program Overview */}
              <div>
                <h2 className="font-heading text-3xl font-bold text-brand-navy dark:text-night-text mb-6">
                  {t.aboutTitle}
                </h2>
                <p className="text-gray-600 dark:text-night-soft text-base leading-relaxed mb-6">
                  {t.aboutText}
                </p>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-400/10 text-teal-700 dark:text-teal-aa-light flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-teal-650 dark:text-teal-aa-light" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-navy dark:text-night-text text-base">{t.duration}</h3>
                      <p className="text-gray-500 dark:text-night-muted text-sm mt-0.5">{t.durationText}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-400/10 text-teal-700 dark:text-teal-aa-light flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-teal-650 dark:text-teal-aa-light" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-navy dark:text-night-text text-base">{t.stipend}</h3>
                      <p className="text-gray-500 dark:text-night-muted text-sm mt-0.5">{t.stipendText}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-400/10 text-teal-700 dark:text-teal-aa-light flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-teal-650 dark:text-teal-aa-light" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                        <line x1="6" y1="1" x2="6" y2="4"></line>
                        <line x1="10" y1="1" x2="10" y2="4"></line>
                        <line x1="14" y1="1" x2="14" y2="4"></line>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-navy dark:text-night-text text-base">{t.lunch}</h3>
                      <p className="text-gray-500 dark:text-night-muted text-sm mt-0.5">{t.lunchText}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Considerations & Requirements Card */}
              <div className="bg-white dark:bg-night-800 border border-gray-255 dark:border-night-600 rounded-3xl p-5 sm:p-8 lg:p-10 shadow-sm">
                <h3 className="font-heading text-2xl font-bold text-brand-navy dark:text-night-text mb-6 flex items-center gap-3">
                  <svg className="w-6 h-6 text-teal-aa dark:text-teal-aa-light flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5.5 5.5 0 0 0 12.5 2.5a5.5 5.5 0 0 0-5.5 5.5c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"></path>
                    <line x1="9" y1="18" x2="15" y2="18"></line>
                    <line x1="10" y1="22" x2="14" y2="22"></line>
                  </svg>
                  <span>{t.considerations}</span>
                </h3>
                <ul className="space-y-5 text-base text-gray-650 dark:text-night-soft">
                  <li className="flex gap-3 items-start">
                    <svg className="w-5 h-5 text-brand-orange mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span><strong>{t.accommodation}</strong> {t.accommodationText}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <svg className="w-5 h-5 text-brand-orange mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
                      <circle cx="7" cy="17" r="2"></circle>
                      <path d="M9 17h6"></path>
                      <circle cx="17" cy="17" r="2"></circle>
                    </svg>
                    <span><strong>{t.travel}</strong> {t.travelText}</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <svg className="w-5 h-5 text-brand-orange mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path>
                    </svg>
                    <span><strong>{t.opportunity}</strong> {t.opportunityText}</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </SectionWrapper>

        {/* Internship Dropdown and Details Container */}
        <SectionWrapper className="py-16 md:py-24 bg-white dark:bg-night-800">
          <div className="max-w-[1200px] mx-auto px-6">

            <div className="text-center mb-8 md:mb-12">
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-brand-navy dark:text-night-text">
                {t.openTitle}
              </h2>
              <p className="text-gray-500 dark:text-night-muted text-base mt-2 max-w-xl mx-auto">
                {t.openText}
              </p>
            </div>

            {/* Every position as a tab, so visitors see all the openings at a glance (a drop-down hid all but one).
                Arrow keys move between tabs, as screen readers expect. */}
            <div className="max-w-4xl mx-auto mb-8 md:mb-12">
              <p id="positions-label" className="text-xs font-bold text-gray-aa dark:text-night-muted uppercase tracking-wider mb-3 text-center">
                {t.selectPosition}
              </p>
              <div
                role="tablist"
                aria-labelledby="positions-label"
                className="grid gap-3 sm:grid-cols-3"
                onKeyDown={(e) => {
                  const ids = internshipRoles.map((role) => role.id);
                  const i = ids.indexOf(selectedRoleId);
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
                {internshipRoles.map((role) => {
                  const active = role.id === selectedRoleId;
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
                        active ? "border-teal-aa bg-teal-50 dark:bg-teal-400/10" : "border-gray-200 dark:border-night-600 bg-white dark:bg-night-800 hover:border-teal-aa/50"
                      }`}
                    >
                      <span className="block text-xs font-bold uppercase tracking-wider text-teal-aa dark:text-teal-aa-light">{role.department}</span>
                      <span className="block mt-1 font-heading font-bold text-brand-navy dark:text-night-text leading-snug">{role.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Split Details Container */}
            <div
              id="role-panel"
              role="tabpanel"
              aria-labelledby={`role-tab-${selectedRole.id}`}
              className="scroll-mt-28 bg-gray-55 dark:bg-night-900 border border-gray-200 dark:border-night-600 rounded-3xl overflow-hidden shadow-sm"
            >
              <div className="flex flex-col lg:flex-row min-h-[550px]">

                {/* Left Side: Text Details */}
                <div className="lg:w-7/12 p-5 sm:p-8 lg:p-12 flex flex-col justify-between flex-grow">
                  <div>
                    <span className="text-teal-aa dark:text-teal-aa-light text-sm font-bold uppercase tracking-wider block mb-2">
                      {selectedRole.department}
                    </span>
                    <h3 className="font-heading text-3xl font-bold text-brand-navy dark:text-night-text mb-6">
                      {selectedRole.title}
                    </h3>

                    <p className="text-gray-650 dark:text-night-soft text-base leading-relaxed mb-8">
                      {selectedRole.roleScope}
                    </p>

                    {/* Point-wise Required Qualifications */}
                    <div className="mb-8">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy/78 dark:text-night-text/78 block mb-3">
                        {t.qualifications}
                      </h4>
                      <ul className="space-y-2">
                        {selectedRole.qualifications.map((qual, idx) => (
                          <li key={idx} className="text-gray-600 dark:text-night-soft text-sm flex items-start gap-2">
                            <span className="text-brand-orange text-xs mt-1.5">•</span>
                            <span>{qual}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Eligible Fields */}
                    <div className="border-t border-gray-200/60 dark:border-night-600/60 pt-6 mb-8">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy/78 dark:text-night-text/78 block mb-3">
                        {t.eligible}
                      </h4>
                      <ul className="space-y-2">
                        {selectedRole.requirements.map((req, idx) => (
                          <li key={idx} className="text-gray-600 dark:text-night-soft text-sm flex items-center gap-2">
                            <span className="text-brand-orange text-xs">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveJob(selectedRole)}
                    className="w-full py-4 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-bold text-base shadow transition-all duration-300 cursor-pointer text-center lg:max-w-xs"
                  >
                    {t.apply}
                  </button>
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

          </div>
        </SectionWrapper>

        {/* Application Modal Overlay */}
        <AnimatePresence>
          {activeJob && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-night-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden relative border border-gray-200 dark:border-night-600 my-8"
              >
                {/* Modal Header */}
                <div className="bg-brand-navy dark:bg-night-band text-white p-6 relative">
                  <button
                    type="button"
                    onClick={() => setActiveJob(null)}
                    aria-label="Close"
                    className="absolute right-3 top-3 w-11 h-11 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <span className="text-teal-aa-light text-xs font-bold uppercase tracking-wider block mb-1">
                    {t.modalTitle}
                  </span>
                  <h3 className="font-heading text-xl lg:text-2xl font-bold text-white pr-10">
                    {activeJob.title}
                  </h3>
                  <p className="text-white/70 text-sm mt-1">
                    {activeJob.department} • {t.location}
                  </p>
                </div>

                {/* Modal Body Form */}
                <form onSubmit={handleApplySubmit} className="p-6 space-y-5">
                  {/* Name field */}
                  <div>
                    <label htmlFor="apply-name" className="block text-sm font-bold text-gray-550 dark:text-night-muted uppercase tracking-wider mb-2">
                      {t.fullName}
                    </label>
                    <input
                      type="text"
                      required
                      id="apply-name"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder={t.namePlaceholder}
                      className="w-full bg-gray-55 dark:bg-night-900 border border-gray-200 dark:border-night-600 rounded-xl px-4 py-3 text-base text-brand-navy dark:text-night-text focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>

                  {/* Email field */}
                  <div>
                    <label htmlFor="apply-email" className="block text-sm font-bold text-gray-555 dark:text-night-muted uppercase tracking-wider mb-2">
                      {t.email}
                    </label>
                    <input
                      type="email"
                      required
                      id="apply-email"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      className="w-full bg-gray-55 dark:bg-night-900 border border-gray-200 dark:border-night-600 rounded-xl px-4 py-3 text-base text-brand-navy dark:text-night-text focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>



                  {/* Editable Email Subject preview */}
                  <div>
                    <label htmlFor="apply-subject" className="block text-sm font-bold text-gray-555 dark:text-night-muted uppercase tracking-wider mb-2">
                      {t.emailSubject}
                    </label>
                    <input
                      type="text"
                      required
                      id="apply-subject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full bg-gray-55 dark:bg-night-900 border border-gray-200 dark:border-night-600 rounded-xl px-4 py-3 text-base text-brand-navy dark:text-night-text focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>

                  {/* Editable Email Body preview */}
                  <div>
                    <label htmlFor="apply-body" className="block text-sm font-bold text-gray-555 dark:text-night-muted uppercase tracking-wider mb-2">
                      {t.emailBody}
                    </label>
                    {locale !== "en" && <p className="text-xs text-gray-500 dark:text-night-muted -mt-1 mb-2">{t.emailNote}</p>}
                    <textarea
                      required
                      rows={5}
                      id="apply-body"
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full bg-gray-55 dark:bg-night-900 border border-gray-200 dark:border-night-600 rounded-xl p-4 text-base md:text-sm leading-relaxed text-brand-navy dark:text-night-text focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-bold text-base shadow-sm transition-colors duration-300 cursor-pointer text-center"
                    >
                      {t.draft}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attachment Reminder Popup Alert */}
        <AnimatePresence>
          {showAttachReminder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white dark:bg-night-800 rounded-3xl w-full max-w-md shadow-2xl p-8 border border-gray-200 dark:border-night-600 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange mx-auto mb-4">
                  <svg className="w-6 h-6 text-brand-orange" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                  </svg>
                </div>
                <h3 className="font-heading text-xl font-bold text-brand-navy dark:text-night-text mb-2">
                  {t.reminderTitle}
                </h3>
                <p className="text-gray-500 dark:text-night-muted text-sm leading-relaxed mb-6">
                  {t.reminderStart} <strong>{t.reminderStrong}</strong> {t.reminderEnd}
                </p>
                <button
                  onClick={() => {
                    setShowAttachReminder(false);
                    setActiveJob(null);
                  }}
                  className="w-full py-3 rounded-full bg-brand-navy hover:bg-teal-aa text-white text-sm font-bold transition-all duration-300 cursor-pointer"
                >
                  {t.gotIt}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
