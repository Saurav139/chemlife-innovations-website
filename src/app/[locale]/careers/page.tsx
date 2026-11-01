"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import Icon, { type IconName } from "@/components/site/Icon";
import { Button, PageHero, Reveal, Section, SectionTitle } from "@/components/site/ui";
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

const LIFE_ICONS: IconName[] = ["flask", "users", "globe", "heart"];
const FIELD = "w-full bg-page-alt border border-line rounded-xl px-4 py-3 text-base text-ink placeholder:text-copy-dim focus:outline-none focus:border-flame focus:ring-1 focus:ring-flame transition-colors";
const LABEL = "block text-xs font-bold text-copy uppercase tracking-wider mb-2";

export default function CareersPage() {
  const all = useT();
  const t = all.careers;
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

      <main id="main" tabIndex={-1} className="site-ui bg-page min-h-screen">
        <PageHero eyebrow={t.kicker} title={`${t.titleStart} *${t.titleAccent}* ${t.titleEnd}`} lead={t.intro}
          actions={<Button href="#positions" arrow>{t.openTitle}</Button>} />

        {/* The programme, and what to know before applying */}
        <Section tone="raised" labelledBy="program-title">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <Reveal>
              <h2 id="program-title" className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-ink">{t.aboutTitle}</h2>
              <p className="text-copy text-lg leading-relaxed mt-5">{t.aboutText}</p>
              <ul className="mt-8 space-y-5">
                {[{ icon: "briefcase" as const, title: t.duration, text: t.durationText }, { icon: "award" as const, title: t.stipend, text: t.stipendText }, { icon: "heart" as const, title: t.lunch, text: t.lunchText }].map((perk) =>
                  <li key={perk.title} className="flex gap-4">
                    <span className="grid place-items-center w-11 h-11 rounded-xl bg-mint/12 text-mint shrink-0"><Icon name={perk.icon} className="w-5 h-5" /></span>
                    <div><h3 className="font-bold text-ink">{perk.title}</h3><p className="text-copy mt-0.5">{perk.text}</p></div>
                  </li>)}
              </ul>
            </Reveal>
            <Reveal delay={0.1} className="rounded-3xl border border-line bg-gradient-to-b from-card-hi to-card p-7 md:p-9">
              <h3 className="font-heading text-2xl font-bold text-ink">{t.considerations}</h3>
              <ul className="mt-6 space-y-5">
                {[{ icon: "warehouse" as const, strong: t.accommodation, text: t.accommodationText }, { icon: "truck" as const, strong: t.travel, text: t.travelText }, { icon: "target" as const, strong: t.opportunity, text: t.opportunityText }].map((item) =>
                  <li key={item.strong} className="flex gap-4">
                    <span className="grid place-items-center w-10 h-10 rounded-xl bg-flame/12 text-flame shrink-0"><Icon name={item.icon} className="w-5 h-5" /></span>
                    <p className="text-copy leading-relaxed"><strong className="text-ink">{item.strong}</strong> {item.text}</p>
                  </li>)}
              </ul>
            </Reveal>
          </div>
        </Section>

        {/* Life at ChemLife */}
        <Section labelledBy="life-title" tight>
          <SectionTitle id="life-title" title={`*${all.home.life.title}*`} />
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {all.home.life.points.map((point, i) => <Reveal as="li" key={point} delay={i * 0.05} className="rounded-2xl border border-line bg-card/70 p-6">
              <span className="grid place-items-center w-12 h-12 rounded-xl bg-flame/12 text-flame"><Icon name={LIFE_ICONS[i]} className="w-6 h-6" /></span>
              <p className="text-ink font-semibold leading-snug mt-5">{point}</p>
            </Reveal>)}
          </ul>
        </Section>

        {/* Open positions: every internship as a tab, with its details below */}
        <Section id="positions" tone="raised" labelledBy="positions-title">
          <SectionTitle id="positions-title" title={`*${t.openTitle}*`} lead={t.openText} />
          <p id="positions-label" className="sr-only">{t.selectPosition}</p>
          <div role="tablist" aria-labelledby="positions-label" className="grid gap-3 sm:grid-cols-3 max-w-5xl mx-auto"
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
            }}>
            {internshipRoles.map((role) => {
              const active = role.id === selectedRoleId;
              return <button key={role.id} id={`role-tab-${role.id}`} type="button" role="tab" aria-selected={active} aria-controls="role-panel" tabIndex={active ? 0 : -1}
                onClick={() => setSelectedRoleId(role.id)}
                className={`text-left rounded-2xl border px-5 py-4 transition-colors cursor-pointer ${active ? "border-flame/60 bg-card-hi" : "border-line bg-card/60 hover:border-flame/30"}`}>
                <span className="block text-xs font-bold uppercase tracking-wider text-mint">{role.department}</span>
                <span className="block mt-1 font-heading font-bold text-ink leading-snug">{role.title}</span>
              </button>;
            })}
          </div>

          <div id="role-panel" role="tabpanel" aria-labelledby={`role-tab-${selectedRole.id}`} className="scroll-mt-28 mt-8 rounded-3xl border border-line bg-card/70 overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-7/12 p-6 sm:p-8 lg:p-12">
                <span className="text-mint text-sm font-bold uppercase tracking-wider">{selectedRole.department}</span>
                <h3 className="font-heading text-3xl font-bold text-ink mt-2">{selectedRole.title}</h3>
                <p className="text-copy text-lg leading-relaxed mt-5">{selectedRole.roleScope}</p>
                <h4 className="text-xs font-bold uppercase tracking-wider text-flame mt-8 mb-3">{t.qualifications}</h4>
                <ul className="space-y-2.5">
                  {selectedRole.qualifications.map((qual, idx) => <li key={idx} className="flex items-start gap-3 text-ink/90"><Icon name="check" className="w-5 h-5 text-flame shrink-0 mt-0.5" strokeWidth={2.2} />{qual}</li>)}
                </ul>
                <h4 className="text-xs font-bold uppercase tracking-wider text-flame mt-8 mb-3">{t.eligible}</h4>
                <ul className="flex flex-wrap gap-2">
                  {selectedRole.requirements.map((req, idx) => <li key={idx} className="rounded-full border border-line px-3.5 py-1.5 text-sm text-ink/90">{req}</li>)}
                </ul>
                <button onClick={() => setActiveJob(selectedRole)}
                  className="mt-10 inline-flex items-center justify-center gap-2 w-full sm:w-auto min-h-12 px-8 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold transition-colors cursor-pointer">
                  {t.apply}<Icon name="arrow" className="w-4 h-4" />
                </button>
              </div>
              <div className="lg:w-5/12 relative min-h-[300px] w-full">
                <Image src={selectedRole.bgImage} alt={selectedRole.title} fill sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-card via-card/10 to-transparent" />
              </div>
            </div>
          </div>
        </Section>

        {/* Application form */}
        <AnimatePresence>
          {activeJob && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
              <motion.div role="dialog" aria-modal="true" aria-labelledby="apply-title" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} transition={{ duration: 0.3 }}
                className="site-ui bg-card rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden relative border border-line my-8">
                <div className="bg-gradient-to-r from-card-hi to-card border-b border-line p-6 relative">
                  <button type="button" onClick={() => setActiveJob(null)} aria-label="Close"
                    className="absolute right-3 top-3 w-11 h-11 rounded-full grid place-items-center text-ink/70 hover:text-ink hover:bg-ink/10 cursor-pointer"><Icon name="close" className="w-5 h-5" /></button>
                  <span className="text-mint text-xs font-bold uppercase tracking-wider block mb-1">{t.modalTitle}</span>
                  <h3 id="apply-title" className="font-heading text-xl lg:text-2xl font-bold text-ink pr-10">{activeJob.title}</h3>
                  <p className="text-copy text-sm mt-1">{activeJob.department} • {t.location}</p>
                </div>
                <form onSubmit={handleApplySubmit} className="p-6 space-y-5">
                  <div>
                    <label htmlFor="apply-name" className={LABEL}>{t.fullName}</label>
                    <input type="text" required id="apply-name" value={applicantName} onChange={(e) => setApplicantName(e.target.value)} placeholder={t.namePlaceholder} className={FIELD} />
                  </div>
                  <div>
                    <label htmlFor="apply-email" className={LABEL}>{t.email}</label>
                    <input type="email" required id="apply-email" value={applicantEmail} onChange={(e) => setApplicantEmail(e.target.value)} placeholder={t.emailPlaceholder} className={FIELD} />
                  </div>
                  <div>
                    <label htmlFor="apply-subject" className={LABEL}>{t.emailSubject}</label>
                    <input type="text" required id="apply-subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className={FIELD} />
                  </div>
                  <div>
                    <label htmlFor="apply-body" className={LABEL}>{t.emailBody}</label>
                    {locale !== "en" && <p className="text-xs text-copy-dim -mt-1 mb-2">{t.emailNote}</p>}
                    <textarea required rows={5} id="apply-body" value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className={`${FIELD} leading-relaxed`} />
                  </div>
                  <button type="submit" className="w-full min-h-12 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold transition-colors cursor-pointer">{t.draft}</button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reminder to attach the CV */}
        <AnimatePresence>
          {showAttachReminder && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
              <motion.div role="alertdialog" aria-modal="true" aria-labelledby="reminder-title" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="site-ui bg-card rounded-3xl w-full max-w-md shadow-2xl p-8 border border-line text-center">
                <span className="grid place-items-center w-14 h-14 rounded-full bg-flame/15 text-flame mx-auto mb-4"><Icon name="doc" className="w-6 h-6" /></span>
                <h3 id="reminder-title" className="font-heading text-xl font-bold text-ink mb-2">{t.reminderTitle}</h3>
                <p className="text-copy leading-relaxed mb-6">{t.reminderStart} <strong className="text-ink">{t.reminderStrong}</strong> {t.reminderEnd}</p>
                <button onClick={() => { setShowAttachReminder(false); setActiveJob(null); }}
                  className="w-full min-h-12 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold transition-colors cursor-pointer">{t.gotIt}</button>
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
