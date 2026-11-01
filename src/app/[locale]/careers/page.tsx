"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import Icon from "@/components/site/Icon";
import Life from "@/components/home/Life";
import { Button, Kicker, PageHero, Reveal, SectionHead, accentLast, easeOut } from "@/components/site/ui";
import { INTERNSHIP_ROLES, roleAnchor } from "@/lib/catalog";
import { revealElement, useHashTarget } from "@/lib/deepLink";
import { useLocale, useT } from "@/i18n/LocaleProvider";


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

const FIELD = "w-full bg-card border border-copy-dim/50 rounded-2xl px-4 py-3 text-base text-ink placeholder:text-copy-dim focus:outline-none focus:border-flame focus:ring-1 focus:ring-flame transition-colors";
const LABEL = "block label-mono text-copy-dim mb-2";

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
        <PageHero trail={t.kicker} title={`${t.titleStart} *${t.titleAccent}* ${t.titleEnd}`} lead={t.intro}
          actions={<Button href="#positions" arrow>{t.openTitle}</Button>} />

        {/* The programme, and what to know before applying */}
        <section aria-labelledby="program-title" className="paper relative bg-page pb-20 md:pb-28 lg:pb-36">
          <div className="container-site grid lg:grid-cols-12 gap-12 lg:gap-12">
            <Reveal className="lg:col-span-5">
              <Kicker index="01">{t.kicker}</Kicker>
              <h2 id="program-title" className="font-display text-4xl md:text-5xl tracking-[-0.02em] leading-[1.05] text-ink mt-8">{t.aboutTitle}</h2>
              <p className="text-copy text-lg leading-relaxed mt-6">{t.aboutText}</p>
            </Reveal>
            <div className="lg:col-span-7">
              <Reveal as="div" delay={0.05}>
                <ul className="grid sm:grid-cols-3 border-t border-ink">
                  {[{ icon: "briefcase" as const, title: t.duration, text: t.durationText }, { icon: "award" as const, title: t.stipend, text: t.stipendText }, { icon: "heart" as const, title: t.lunch, text: t.lunchText }].map((perk, i) =>
                    <li key={perk.title} className={`py-7 sm:pr-5 border-b sm:border-b-0 border-line ${i ? "sm:pl-5 sm:border-l" : ""}`}>
                      <Icon name={perk.icon} className="w-6 h-6 text-flame" />
                      <h3 className="font-display text-2xl text-ink mt-5">{perk.title}</h3>
                      <p className="text-copy leading-relaxed mt-2">{perk.text}</p>
                    </li>)}
                </ul>
              </Reveal>
              <Reveal delay={0.1} className="mt-10 rounded-[2rem] bg-page-alt p-7 md:p-9">
                <h3 className="label-mono text-flame">{t.considerations}</h3>
                <ul className="mt-5 space-y-5">
                  {[{ icon: "warehouse" as const, strong: t.accommodation, text: t.accommodationText }, { icon: "truck" as const, strong: t.travel, text: t.travelText }, { icon: "target" as const, strong: t.opportunity, text: t.opportunityText }].map((item) =>
                    <li key={item.strong} className="flex gap-4">
                      <Icon name={item.icon} className="w-5 h-5 text-mint shrink-0 mt-1" />
                      <p className="text-copy leading-relaxed"><strong className="text-ink">{item.strong}</strong> {item.text}</p>
                    </li>)}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>

        <Life index="02" join={false} />

        {/* Open positions: every internship as a tab, with its details below */}
        <section id="positions" aria-labelledby="positions-title" className="paper relative bg-page py-20 md:py-28 lg:py-36 scroll-mt-16">
          <div className="container-site">
            <SectionHead id="positions-title" index="03" kicker={t.selectPosition} title={accentLast(t.openTitle)} lead={t.openText} />
            <p id="positions-label" className="sr-only">{t.selectPosition}</p>
            <div role="tablist" aria-labelledby="positions-label" className="grid sm:grid-cols-3 border-t border-ink"
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
              {internshipRoles.map((role, i) => {
                const active = role.id === selectedRoleId;
                return <button key={role.id} id={`role-tab-${role.id}`} type="button" role="tab" aria-selected={active} aria-controls="role-panel" tabIndex={active ? 0 : -1}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`relative text-left py-6 sm:px-5 first:sm:pl-0 border-b border-line ${i ? "sm:border-l" : ""} transition-colors cursor-pointer group`}>
                  <span className={`absolute left-0 right-0 -top-px h-[3px] origin-left transition-transform duration-500 bg-flame ${active ? "scale-x-100" : "scale-x-0"}`} />
                  <span className="block label-mono text-copy-dim">{String(i + 1).padStart(2, "0")} — {role.department}</span>
                  <span className={`block mt-2 font-display text-2xl leading-snug transition-colors ${active ? "text-flame" : "text-ink group-hover:text-flame"}`}>{role.title}</span>
                </button>;
              })}
            </div>

            <div id="role-panel" role="tabpanel" aria-labelledby={`role-tab-${selectedRole.id}`} className="scroll-mt-28 mt-12 grid lg:grid-cols-12 gap-10 lg:gap-12">
              <div className="lg:col-span-5">
                <div className="relative aspect-[4/5] rounded-t-full overflow-hidden bg-card-hi">
                  <Image key={selectedRole.id} src={selectedRole.bgImage} alt={selectedRole.title} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                </div>
              </div>
              <div className="lg:col-span-7">
                <p className="label-mono text-mint">{selectedRole.department} · {t.location}</p>
                <h3 className="font-display text-4xl md:text-5xl text-ink tracking-tight mt-4">{selectedRole.title}</h3>
                <p className="text-copy text-lg leading-relaxed mt-6">{selectedRole.roleScope}</p>
                <h4 className="label-mono text-flame mt-10">{t.qualifications}</h4>
                <ul className="mt-4 border-t border-line">
                  {selectedRole.qualifications.map((qual, idx) => <li key={idx} className="flex items-baseline gap-4 border-b border-line py-4 text-ink">
                    <span className="label-mono text-copy-dim">{String(idx + 1).padStart(2, "0")}</span>{qual}
                  </li>)}
                </ul>
                <h4 className="label-mono text-flame mt-10">{t.eligible}</h4>
                <ul className="flex flex-wrap gap-2 mt-4">
                  {selectedRole.requirements.map((req, idx) => <li key={idx} className="rounded-full border border-line bg-card px-4 py-2 text-sm text-ink">{req}</li>)}
                </ul>
                <Button onClick={() => setActiveJob(selectedRole)} arrow className="mt-10 w-full sm:w-auto">{t.apply}</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Application form */}
        <AnimatePresence>
          {activeJob && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0b1626]/70 backdrop-blur-sm p-4 overflow-y-auto">
              <motion.div role="dialog" aria-modal="true" aria-labelledby="apply-title" initial={{ scale: 0.96, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 20 }} transition={{ duration: 0.4, ease: easeOut }}
                className="site-ui paper bg-page rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden relative my-8">
                <div className="border-b border-line p-6 md:p-8 relative">
                  <button type="button" onClick={() => setActiveJob(null)} aria-label="Close"
                    className="absolute right-4 top-4 w-11 h-11 rounded-full grid place-items-center border border-line text-ink hover:bg-ink hover:text-page cursor-pointer"><Icon name="close" className="w-5 h-5" /></button>
                  <p className="label-mono text-mint">{t.modalTitle}</p>
                  <h3 id="apply-title" className="font-display text-3xl text-ink pr-12 mt-2">{activeJob.title}</h3>
                  <p className="text-copy text-sm mt-1">{activeJob.department} · {t.location}</p>
                </div>
                <form onSubmit={handleApplySubmit} className="p-6 md:p-8 space-y-5">
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
                  <Button type="submit" className="w-full">{t.draft}</Button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reminder to attach the CV */}
        <AnimatePresence>
          {showAttachReminder && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0b1626]/70 backdrop-blur-sm p-4">
              <motion.div role="alertdialog" aria-modal="true" aria-labelledby="reminder-title" initial={{ scale: 0.96, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 20 }}
                className="site-ui paper bg-page rounded-[2rem] w-full max-w-md shadow-2xl p-8 text-center">
                <span className="grid place-items-center w-16 h-16 rounded-full border border-flame text-flame mx-auto mb-5"><Icon name="doc" className="w-6 h-6" /></span>
                <h3 id="reminder-title" className="font-display text-2xl text-ink mb-3">{t.reminderTitle}</h3>
                <p className="text-copy leading-relaxed mb-7">{t.reminderStart} <strong className="text-ink">{t.reminderStrong}</strong> {t.reminderEnd}</p>
                <Button onClick={() => { setShowAttachReminder(false); setActiveJob(null); }} className="w-full">{t.gotIt}</Button>
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
