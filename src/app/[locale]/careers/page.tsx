"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import { VideoPosters } from "@/lib/assets";
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
  const all = useT();
  const t = all.careers;
  const lifeTitle = all.home.life.title;
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

      <main id="main" tabIndex={-1}>
        <PageHero
          title={`${t.titleStart} ${t.titleAccent} ${t.titleEnd}`}
          intro={t.intro}
          image={VideoPosters.trip1}
          imageAlt={lifeTitle}
          imagePosition="50% 40%"
        >
          <a href="#role-panel" className="btn btn-primary">{t.openTitle}</a>
        </PageHero>

        {/* The programme: what it gives on the left, what to plan for on the axis */}
        <section className="section-y">
          <div className="frame">
            <SectionHead title={t.aboutTitle} lead={t.aboutText} />
            <div className="grid lg:grid-cols-12 gap-x-8 gap-y-12">
              <Reveal className="lg:col-span-4">
                <dl className="space-y-6">
                  {[
                    [t.duration, t.durationText],
                    [t.stipend, t.stipendText],
                    [t.lunch, t.lunchText],
                  ].map(([term, text]) => (
                    <div key={term}>
                      <dt className="font-bold">{term}</dt>
                      <dd className="mt-1">{text}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
              <Reveal order={1} className="lg:col-start-6 lg:col-span-7 bg-surface p-6 md:p-10">
                <h3 className="text-lead font-bold">{t.considerations}</h3>
                <ul className="mt-6 space-y-5">
                  <li><strong>{t.accommodation}</strong> {t.accommodationText}</li>
                  <li><strong>{t.travel}</strong> {t.travelText}</li>
                  <li><strong>{t.opportunity}</strong> {t.opportunityText}</li>
                </ul>
              </Reveal>
            </div>
            {/* The team away from the lab: stills from the annual trips, butted together */}
            <Reveal order={2} className="grid grid-cols-3 mt-16 md:mt-24">
              {[VideoPosters.trip1, VideoPosters.trip2, VideoPosters.trip3].map((poster) => (
                <div key={poster} className="relative aspect-[4/3] overflow-hidden bg-surface">
                  <Image src={poster} alt={lifeTitle} fill sizes="(min-width: 1200px) 384px, 33vw" className="object-cover" />
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* Internship Dropdown and Details Container */}
        <section className="section-y bg-surface">
          <div className="frame">
            <SectionHead title={t.openTitle} lead={t.openText} />

            {/* Every position as a tab, so visitors see all the openings at a glance (a drop-down hid all but one).
                Arrow keys move between tabs, as screen readers expect. */}
            <div className="mb-8 md:mb-12">
              <p id="positions-label" className="text-small text-ink-soft mb-3">
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
                      className={`text-left px-5 py-4 transition-colors cursor-pointer active:scale-[0.99] ${
                        active ? "bg-ink text-white" : "bg-white hover:bg-white/70"
                      }`}
                    >
                      <span className="block text-small">{role.department}</span>
                      <span className="block mt-1 font-bold leading-snug">{role.title}</span>
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
              className="scroll-mt-28 bg-white overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row min-h-[550px]">

                {/* Left Side: Text Details */}
                <div className="lg:w-7/12 p-5 sm:p-8 lg:p-12 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="text-title">
                      {selectedRole.title}
                    </h3>
                    <p className="text-small text-ink-soft mt-2 mb-6">
                      {selectedRole.department}
                    </p>

                    <p className="mb-8">
                      {selectedRole.roleScope}
                    </p>

                    {/* Point-wise Required Qualifications */}
                    <div className="mb-8">
                      <h4 className="font-bold mb-3">
                        {t.qualifications}
                      </h4>
                      <ul className="space-y-2">
                        {selectedRole.qualifications.map((qual, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span aria-hidden="true">•</span>
                            <span>{qual}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Eligible Fields */}
                    <div className="mb-8">
                      <h4 className="font-bold mb-3">
                        {t.eligible}
                      </h4>
                      <ul className="space-y-2">
                        {selectedRole.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span aria-hidden="true">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveJob(selectedRole)}
                    className="btn btn-primary w-full lg:w-auto lg:self-start"
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
                </div>

              </div>
            </div>

          </div>
        </section>

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
                className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden relative border border-gray-200 my-8"
              >
                {/* Modal Header */}
                <div className="bg-brand-navy text-white p-6 relative">
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
                  <span className="text-small block mb-1">
                    {t.modalTitle}
                  </span>
                  <h3 className="text-lead font-bold text-white pr-10">
                    {activeJob.title}
                  </h3>
                  <p className="text-small mt-1">
                    {activeJob.department} • {t.location}
                  </p>
                </div>

                {/* Modal Body Form */}
                <form onSubmit={handleApplySubmit} className="p-6 space-y-5">
                  {/* Name field */}
                  <div>
                    <label htmlFor="apply-name" className="block font-semibold mb-2">
                      {t.fullName}
                    </label>
                    <input
                      type="text"
                      required
                      id="apply-name"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder={t.namePlaceholder}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-base text-brand-navy focus:outline-none focus:border-ink transition-colors"
                    />
                  </div>

                  {/* Email field */}
                  <div>
                    <label htmlFor="apply-email" className="block font-semibold mb-2">
                      {t.email}
                    </label>
                    <input
                      type="email"
                      required
                      id="apply-email"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-base text-brand-navy focus:outline-none focus:border-ink transition-colors"
                    />
                  </div>



                  {/* Editable Email Subject preview */}
                  <div>
                    <label htmlFor="apply-subject" className="block font-semibold mb-2">
                      {t.emailSubject}
                    </label>
                    <input
                      type="text"
                      required
                      id="apply-subject"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-base text-brand-navy focus:outline-none focus:border-ink transition-colors"
                    />
                  </div>

                  {/* Editable Email Body preview */}
                  <div>
                    <label htmlFor="apply-body" className="block font-semibold mb-2">
                      {t.emailBody}
                    </label>
                    {locale !== "en" && <p className="text-small text-ink-soft -mt-1 mb-2">{t.emailNote}</p>}
                    <textarea
                      required
                      rows={5}
                      id="apply-body"
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl p-4 text-base leading-relaxed text-brand-navy focus:outline-none focus:border-ink transition-colors"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="btn btn-primary w-full"
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
                className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 border border-gray-200 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center text-ink mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                  </svg>
                </div>
                <h3 className="text-lead font-bold mb-2">
                  {t.reminderTitle}
                </h3>
                <p className="mb-6">
                  {t.reminderStart} <strong>{t.reminderStrong}</strong> {t.reminderEnd}
                </p>
                <button
                  onClick={() => {
                    setShowAttachReminder(false);
                    setActiveJob(null);
                  }}
                  className="btn btn-ink w-full"
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
