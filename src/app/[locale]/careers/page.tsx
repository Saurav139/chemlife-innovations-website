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

// Titles, departments and descriptions are in the language file (careers.roles), in this order. The English title
// and department go into the application email, which our hiring team reads in English.
const roleBase: (Pick<InternshipPosition, "id" | "bgImage"> & { englishTitle: string; englishDepartment: string })[] = [
  {
    id: "research-intern",
    englishTitle: "Research Intern",
    englishDepartment: "Research & Development Labs",
    bgImage: Images.careers.researchIntern
  },
  {
    id: "animal-nutrition-intern",
    englishTitle: "Animal Nutrition Intern",
    englishDepartment: "Formulation & Product Development",
    bgImage: Images.careers.animalNutrition
  },
  {
    id: "hr-marketing-intern",
    englishTitle: "Operations, Marketing  and Human Resources Intern",
    englishDepartment: "Operations & Business Relations",
    bgImage: Images.careers.hrMarketing
  }
];

export default function CareersPage() {
  const t = useT().careers;
  const locale = useLocale();
  const internshipRoles = roleBase.map((role, i) => ({ ...role, ...t.roles[i] }));
  const [selectedRoleId, setSelectedRoleId] = useState("research-intern");
  const [activeJob, setActiveJob] = useState<(typeof internshipRoles)[number] | null>(null);
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [showAttachReminder, setShowAttachReminder] = useState(false);

  const selectedRole = internshipRoles.find((role) => role.id === selectedRoleId) || internshipRoles[0];

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

      <main className="bg-white min-h-screen text-brand-navy">
        {/* Careers Hero Section */}
        <SectionWrapper className="pt-26 md:pt-32 lg:pt-36 pb-10 md:pb-20 lg:pb-28 text-white relative overflow-hidden bg-brand-navy flex items-center">
          <div className="absolute inset-0 z-0">
            <Image
              src={Images.heroes.careers}
              alt={t.heroAlt}
              fill
              className="object-cover opacity-50"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/80 to-brand-navy/60" />
            <div className="absolute inset-0 bg-black/10" />
          </div>

          <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full">
            <span className="kicker text-teal-aa-light block mb-3">
              {t.kicker}
            </span>
            <h1 className="page-title mb-3 md:mb-4 text-white max-w-4xl">
              {t.titleStart} <span className="text-teal-400">{t.titleAccent}</span> {t.titleEnd}
            </h1>
            <p className="text-white/85 text-base md:text-lg leading-relaxed max-w-3xl font-light">
              {t.intro}
            </p>
          </div>
        </SectionWrapper>

        {/* About & Internship Considerations Section */}
        <SectionWrapper className="section-y-first bg-gray-50 border-b border-gray-150">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* Program Overview */}
              <div>
                <h2 className="section-title text-brand-navy mb-6">
                  {t.aboutTitle}
                </h2>
                <p className="text-gray-600 text-base leading-relaxed mb-6">
                  {t.aboutText}
                </p>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-teal-650" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                    <div>
                      <h3 className="subheading text-brand-navy">{t.duration}</h3>
                      <p className="text-gray-500 text-sm mt-0.5">{t.durationText}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-teal-650" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="subheading text-brand-navy">{t.stipend}</h3>
                      <p className="text-gray-500 text-sm mt-0.5">{t.stipendText}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-teal-650" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                        <line x1="6" y1="1" x2="6" y2="4"></line>
                        <line x1="10" y1="1" x2="10" y2="4"></line>
                        <line x1="14" y1="1" x2="14" y2="4"></line>
                      </svg>
                    </div>
                    <div>
                      <h3 className="subheading text-brand-navy">{t.lunch}</h3>
                      <p className="text-gray-500 text-sm mt-0.5">{t.lunchText}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Considerations & Requirements Card */}
              <div className="bg-white border border-gray-255 rounded-2xl panel-pad shadow-sm">
                <h3 className="card-title text-brand-navy mb-6 flex items-center gap-3">
                  <svg className="w-6 h-6 text-teal-aa flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5.5 5.5 0 0 0 12.5 2.5a5.5 5.5 0 0 0-5.5 5.5c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"></path>
                    <line x1="9" y1="18" x2="15" y2="18"></line>
                    <line x1="10" y1="22" x2="14" y2="22"></line>
                  </svg>
                  <span>{t.considerations}</span>
                </h3>
                <ul className="space-y-5 text-base text-gray-650">
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
        <SectionWrapper className="section-y bg-white">
          <div className="max-w-[1200px] mx-auto px-6">

            <div className="text-center mb-12">
              <h2 className="section-title text-brand-navy">
                {t.openTitle}
              </h2>
              <p className="text-gray-500 text-base mt-2 max-w-xl mx-auto">
                {t.openText}
              </p>
            </div>

            {/* Dropdown Selector */}
            <div className="max-w-md mx-auto mb-16">
              <label className="block badge-text text-gray-aa mb-2 text-center">
                {t.selectPosition}
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full bg-gray-50 border border-gray-250 rounded-xl px-6 py-4 text-base text-brand-navy focus:outline-none focus:border-teal-500 font-semibold cursor-pointer shadow-sm"
              >
                {internshipRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Split Details Container */}
            <div className="bg-gray-55 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex flex-col lg:flex-row min-h-[550px]">

                {/* Left Side: Text Details */}
                <div className="lg:w-7/12 panel-pad flex flex-col justify-between flex-grow">
                  <div>
                    <span className="kicker text-teal-aa block mb-2">
                      {selectedRole.department}
                    </span>
                    <h3 className="card-title text-brand-navy mb-6">
                      {selectedRole.title}
                    </h3>

                    <p className="text-gray-650 text-base leading-relaxed mb-8">
                      {selectedRole.roleScope}
                    </p>

                    {/* Point-wise Required Qualifications */}
                    <div className="mb-8">
                      <h4 className="badge-text text-brand-navy/78 block mb-3">
                        {t.qualifications}
                      </h4>
                      <ul className="space-y-2">
                        {selectedRole.qualifications.map((qual, idx) => (
                          <li key={idx} className="text-gray-600 text-sm flex items-start gap-2">
                            <span className="text-brand-orange text-xs mt-1.5">•</span>
                            <span>{qual}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Eligible Fields */}
                    <div className="border-t border-gray-200/60 pt-6 mb-8">
                      <h4 className="badge-text text-brand-navy/78 block mb-3">
                        {t.eligible}
                      </h4>
                      <ul className="space-y-2">
                        {selectedRole.requirements.map((req, idx) => (
                          <li key={idx} className="text-gray-600 text-sm flex items-center gap-2">
                            <span className="text-brand-orange text-xs">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveJob(selectedRole)}
                    className="w-full py-4 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-bold text-base shadow-sm transition-all duration-300 cursor-pointer text-center lg:max-w-xs"
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
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden relative border border-gray-200 my-8"
              >
                {/* Modal Header */}
                <div className="bg-brand-navy text-white panel-pad relative">
                  <button
                    onClick={() => setActiveJob(null)}
                    className="absolute right-6 top-6 text-white/70 hover:text-white transition-colors cursor-pointer text-lg font-semibold"
                  >
                    ✕
                  </button>
                  <span className="kicker text-teal-aa-light block mb-1">
                    {t.modalTitle}
                  </span>
                  <h3 className="card-title">
                    {activeJob.title}
                  </h3>
                  <p className="text-white/70 text-sm mt-1">
                    {activeJob.department} • {t.location}
                  </p>
                </div>

                {/* Modal Body Form */}
                <form onSubmit={handleApplySubmit} className="panel-pad space-y-5">
                  {/* Name field */}
                  <div>
                    <label className="block badge-text text-brand-navy mb-2">
                      {t.fullName}
                    </label>
                    <input
                      type="text"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder={t.namePlaceholder}
                      className="w-full bg-gray-55 border border-gray-200 rounded-xl px-4 py-3 text-base text-brand-navy focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>

                  {/* Email field */}
                  <div>
                    <label className="block badge-text text-brand-navy mb-2">
                      {t.email}
                    </label>
                    <input
                      type="email"
                      required
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      className="w-full bg-gray-55 border border-gray-200 rounded-xl px-4 py-3 text-base text-brand-navy focus:outline-none focus:border-teal-500 transition-colors"
                    />
                  </div>



                  {/* Editable Email Subject preview */}
                  <div>
                    <label className="block badge-text text-brand-navy mb-2">
                      {t.emailSubject}
                    </label>
                    <input
                      type="text"
                      required
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full bg-gray-55 border border-gray-200 rounded-xl px-4 py-3 text-base text-brand-navy focus:outline-none focus:border-teal-500 transition-colors font-mono md:text-sm"
                    />
                  </div>

                  {/* Editable Email Body preview */}
                  <div>
                    <label className="block badge-text text-brand-navy mb-2">
                      {t.emailBody}
                    </label>
                    {locale !== "en" && <p className="text-xs text-gray-500 -mt-1 mb-2">{t.emailNote}</p>}
                    <textarea
                      required
                      rows={5}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full bg-gray-55 border border-gray-200 rounded-xl p-4 text-base md:text-sm text-brand-navy focus:outline-none focus:border-teal-500 transition-colors font-mono"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-bold text-base shadow-sm transition-all duration-300 cursor-pointer text-center"
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
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl w-full max-w-md shadow-2xl panel-pad border border-gray-200 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange mx-auto mb-4">
                  <svg className="w-6 h-6 text-brand-orange" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                  </svg>
                </div>
                <h3 className="card-title text-brand-navy mb-2">
                  {t.reminderTitle}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
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
