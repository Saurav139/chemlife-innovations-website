"use client";

import { Fragment, useRef, useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import Turnstile, { type TurnstileHandle } from "@/components/Turnstile";
import { Images } from "@/lib/assets";
import { INTERNSHIP_ROLES, roleAnchor } from "@/lib/catalog";
import { APPLICATION_LIMITS, RESUME_ACCEPT, RESUME_MAX_BYTES, hasResumeExtension, type ApplicationErrorCode } from "@/lib/careers";
import { CONTACT_EMAIL, EMAIL_PATTERN } from "@/lib/contact";
import { revealElement, useHashTarget } from "@/lib/deepLink";
import { useLocale, useT } from "@/i18n/LocaleProvider";

// The page: the open internships (pick one, read about it, apply beside it), then the programme's terms.
// The internships are listed in src/lib/catalog.ts; their titles, departments and descriptions are in the language
// file (careers.roles), in the same order. Applications go to /api/careers, which emails them to the team.

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type SubmitError = ApplicationErrorCode | "network";
interface FieldErrors {
  name?: string;
  email?: string;
  resume?: string;
}

/** Fills {name} placeholders in a translated sentence with links or other elements. */
function fill(template: string, parts: Record<string, React.ReactNode>) {
  return template.split(/\{(\w+)\}/).map((piece, i) => (i % 2 ? <Fragment key={i}>{parts[piece]}</Fragment> : piece));
}

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

const fieldLabel = "block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2";
const fieldBox = (invalid?: string) =>
  `w-full bg-white border ${invalid ? "border-red-600" : "border-gray-250"} rounded-xl px-4 py-3 text-base text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-teal-aa transition-colors`;
const fieldError = "text-red-600 text-xs mt-1.5 font-medium";

export default function CareersPage() {
  const messages = useT();
  const t = messages.careers;
  const shared = messages.contact;
  const locale = useLocale();
  const roles = INTERNSHIP_ROLES.map((role, i) => ({ ...role, ...t.roles[i] }));
  const [selectedRoleId, setSelectedRoleId] = useState(roles[0].id);
  const selectedRole = roles.find((role) => role.id === selectedRoleId) || roles[0];

  // The application form. It keeps what the visitor typed when they look at another internship.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  // Goes up after each application that's sent, which gives the form a new, empty file picker.
  const [pickerKey, setPickerKey] = useState(0);
  const [website, setWebsite] = useState(""); // Spam trap: people never see it, bots fill it in.
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<SubmitError | null>(null);
  // The application that went through, so the thank-you names the right internship and address.
  const [sent, setSent] = useState<{ roleId: string; name: string; email: string } | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captcha = useRef<TurnstileHandle>(null);
  const form = useRef<HTMLFormElement>(null);

  // Opens at one internship from a link such as /careers#role-research-intern (the site search): selects its tab and
  // scrolls to its details.
  useHashTarget((target) => {
    const role = roles.find((item) => roleAnchor(item.id) === target);
    if (!role) return;
    setSelectedRoleId(role.id);
    revealElement("role-panel");
  });

  const resumeProblem = (file: File | null) =>
    !file ? t.errors.resume
    : !hasResumeExtension(file.name) ? t.errors.resumeType
    : file.size > RESUME_MAX_BYTES ? t.errors.resumeSize
    : undefined;

  const chooseResume = (file: File | null) => {
    setResume(file);
    setErrors((prev) => ({ ...prev, resume: file ? resumeProblem(file) : undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const found: FieldErrors = {
      name: name.trim() ? undefined : shared.errors.name,
      email: !email.trim() ? shared.errors.email : EMAIL_PATTERN.test(email.trim()) ? undefined : shared.errors.emailInvalid,
      resume: resumeProblem(resume),
    };
    setErrors(found);
    const firstWrong = (["name", "email", "resume"] as const).find((key) => found[key]);
    if (firstWrong) {
      form.current?.querySelector<HTMLElement>(`#apply-${firstWrong}`)?.focus();
      return;
    }
    if (!captchaToken || !resume) return;

    setBusy(true);
    setSubmitError(null);
    const body = new FormData();
    body.set("role", selectedRole.id);
    body.set("name", name);
    body.set("email", email);
    body.set("phone", phone);
    body.set("message", message);
    body.set("website", website);
    body.set("turnstileToken", captchaToken);
    body.set("resume", resume);
    let error: SubmitError | null = null;
    try {
      const res = await fetch("/api/careers", { method: "POST", body, signal: AbortSignal.timeout(60_000) });
      const data = await res.json().catch(() => null);
      // A server in front of the site may refuse a large file before the site sees it.
      if (!res.ok || !data) error = typeof data?.error === "string" ? data.error : res.status === 413 ? "resume_size" : "send_failed";
    } catch {
      error = "network";
    }
    setBusy(false);
    // CAPTCHA tokens work once, so ask for a new one whatever happened.
    captcha.current?.reset();
    if (error) {
      setSubmitError(error);
      return;
    }
    setSent({ roleId: selectedRole.id, name: name.trim(), email: email.trim() });
    setMessage("");
    setResume(null);
    setPickerKey((key) => key + 1);
  };

  const errorText: Record<SubmitError, string> = {
    invalid: shared.submitErrors.invalid,
    resume_type: t.errors.resumeType,
    resume_size: t.errors.resumeSize,
    captcha: shared.submitErrors.captcha,
    rate_limited: t.submitErrors.rate_limited,
    unavailable: t.submitErrors.unavailable,
    send_failed: t.submitErrors.send_failed,
    network: shared.submitErrors.network,
  };
  // When the form itself can't help, the visitor can still email their résumé.
  const emailInstead = fill(t.fallback, {
    address: <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold underline underline-offset-2 break-all">{CONTACT_EMAIL}</a>,
  });
  const shownError: SubmitError | null = submitError ?? (TURNSTILE_SITE_KEY ? null : "unavailable");
  const showSent = sent?.roleId === selectedRole.id;

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

        {/* The open internships: pick one, read about it, and apply beside it. */}
        <SectionWrapper id="open-internships" className="scroll-mt-24 py-12 md:py-16 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="font-heading text-3xl lg:text-4xl font-bold text-brand-navy">{t.openTitle}</h2>
              <p id="positions-label" className="text-gray-500 text-base mt-2">{t.openText}</p>
            </div>

            {/* Every position as a tab, so visitors see all the openings at a glance.
                Arrow keys move between tabs, as screen readers expect. */}
            <div
              role="tablist"
              aria-labelledby="positions-label"
              className="grid gap-3 sm:grid-cols-3 mb-6"
              onKeyDown={(e) => {
                const ids = roles.map((role) => role.id);
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
              {roles.map((role) => {
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
                      active ? "border-teal-aa bg-teal-50" : "border-gray-200 bg-white hover:border-teal-aa/50"
                    }`}
                  >
                    <span className="block text-xs font-bold uppercase tracking-wider text-teal-aa">{role.department}</span>
                    <span className="block mt-1 font-heading font-bold text-brand-navy leading-snug">{role.title}</span>
                  </button>
                );
              })}
            </div>

            <div
              id="role-panel"
              role="tabpanel"
              aria-labelledby={`role-tab-${selectedRole.id}`}
              className="scroll-mt-28 grid lg:grid-cols-[minmax(0,1fr)_420px] bg-gray-55 border border-gray-200 rounded-3xl overflow-hidden"
            >
              {/* The internship */}
              <div className="p-6 sm:p-8 lg:p-10 flex flex-col">
                <h3 className="font-heading text-2xl md:text-3xl font-bold text-brand-navy">{selectedRole.title}</h3>
                <p className="mt-2 text-sm text-gray-600 flex items-center gap-1.5">
                  <svg aria-hidden="true" className="w-4 h-4 text-teal-aa flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {selectedRole.department} • {t.location}
                </p>
                <p className="text-gray-650 text-base leading-relaxed mt-5">{selectedRole.roleScope}</p>

                <div className="mt-7 grid gap-7 sm:grid-cols-2">
                  {[
                    { title: t.qualifications, items: selectedRole.qualifications },
                    { title: t.eligible, items: selectedRole.requirements },
                  ].map((list) => (
                    <div key={list.title}>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-brand-navy/78 mb-3">{list.title}</h4>
                      <ul className="space-y-2">
                        {list.items.map((item) => (
                          <li key={item} className="text-gray-600 text-sm flex items-start gap-2">
                            <span aria-hidden="true" className="text-brand-orange text-xs mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* A picture of the work fills the room beside the form on wide screens. */}
                <div className="hidden lg:block relative flex-1 min-h-44 mt-8 rounded-2xl overflow-hidden">
                  <Image src={selectedRole.bgImage} alt="" fill sizes="(min-width: 1024px) 700px, 0px" className="object-cover" />
                </div>
              </div>

              {/* The application */}
              <div className="bg-white border-t lg:border-t-0 lg:border-l border-gray-200 p-6 sm:p-8">
                {showSent ? (
                  <div role="status" className="h-full flex flex-col items-center justify-center text-center py-6">
                    <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-aa flex items-center justify-center mb-4">
                      <svg aria-hidden="true" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    <h4 className="font-heading text-xl font-bold text-brand-navy mb-2">{t.sentTitle}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {fill(t.sentText, {
                        name: sent.name,
                        role: <strong className="font-semibold text-brand-navy">{selectedRole.title}</strong>,
                        email: <strong className="font-semibold text-brand-navy break-all">{sent.email}</strong>,
                      })}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSent(null)}
                      className="mt-6 font-semibold text-sm text-teal-aa underline underline-offset-4 hover:text-brand-navy cursor-pointer"
                    >
                      {t.applyAgain}
                    </button>
                  </div>
                ) : (
                  <form ref={form} onSubmit={submit} noValidate className="space-y-4">
                    <h4 className="font-heading text-xl font-bold text-brand-navy">{t.apply}</h4>

                    <div>
                      <label htmlFor="apply-name" className={fieldLabel}>{t.fullName}</label>
                      <input
                        type="text"
                        id="apply-name"
                        autoComplete="name"
                        maxLength={APPLICATION_LIMITS.name}
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        placeholder={t.namePlaceholder}
                        aria-invalid={errors.name ? true : undefined}
                        aria-describedby={errors.name ? "apply-name-error" : undefined}
                        className={fieldBox(errors.name)}
                      />
                      {errors.name && <p id="apply-name-error" className={fieldError}>{errors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="apply-email" className={fieldLabel}>{t.email}</label>
                      <input
                        type="email"
                        id="apply-email"
                        autoComplete="email"
                        maxLength={APPLICATION_LIMITS.email}
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        placeholder={t.emailPlaceholder}
                        aria-invalid={errors.email ? true : undefined}
                        aria-describedby={errors.email ? "apply-email-error" : undefined}
                        className={fieldBox(errors.email)}
                      />
                      {errors.email && <p id="apply-email-error" className={fieldError}>{errors.email}</p>}
                    </div>

                    <div>
                      <label htmlFor="apply-phone" className={fieldLabel}>
                        {shared.phone} <span className="font-medium normal-case tracking-normal text-gray-500">{shared.optional}</span>
                      </label>
                      <input
                        type="tel"
                        id="apply-phone"
                        autoComplete="tel"
                        maxLength={APPLICATION_LIMITS.phone}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={fieldBox()}
                      />
                    </div>

                    <div>
                      <label htmlFor="apply-resume" className={fieldLabel}>{t.resume}</label>
                      <input
                        key={pickerKey}
                        type="file"
                        id="apply-resume"
                        accept={RESUME_ACCEPT}
                        onChange={(e) => chooseResume(e.target.files?.[0] ?? null)}
                        aria-invalid={errors.resume ? true : undefined}
                        aria-describedby={errors.resume ? "apply-resume-error" : "apply-resume-hint"}
                        className={`block w-full rounded-xl border ${errors.resume ? "border-red-600" : "border-gray-250"} bg-white p-2 text-sm text-gray-600 cursor-pointer focus:outline-none focus:border-teal-aa file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-navy`}
                      />
                      {errors.resume
                        ? <p id="apply-resume-error" className={fieldError}>{errors.resume}</p>
                        : <p id="apply-resume-hint" className="text-xs text-gray-500 mt-1.5">{t.resumeHint}</p>}
                    </div>

                    <div>
                      <label htmlFor="apply-message" className={fieldLabel}>
                        {shared.message} <span className="font-medium normal-case tracking-normal text-gray-500">{shared.optional}</span>
                      </label>
                      <textarea
                        id="apply-message"
                        rows={3}
                        maxLength={APPLICATION_LIMITS.message}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className={`block ${fieldBox()}`}
                      />
                    </div>

                    {/* Spam trap: hidden from people and screen readers, so only bots fill it in. */}
                    <div aria-hidden="true" className="absolute -left-[10000px] top-auto w-px h-px overflow-hidden">
                      <label htmlFor="apply-website">Website</label>
                      <input type="text" id="apply-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
                    </div>

                    {/* CAPTCHA (Cloudflare Turnstile): takes up no room unless Cloudflare asks the visitor to tick a box. */}
                    {TURNSTILE_SITE_KEY && <Turnstile ref={captcha} siteKey={TURNSTILE_SITE_KEY} language={locale} onToken={setCaptchaToken} />}

                    {shownError && (
                      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        <p className="font-semibold">{errorText[shownError]}</p>
                        {(["rate_limited", "unavailable", "send_failed", "network"] as SubmitError[]).includes(shownError) && (
                          <p className="mt-1">{emailInstead}</p>
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={busy || !captchaToken}
                      className="w-full py-3.5 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-bold text-base shadow-sm transition-colors cursor-pointer flex items-center justify-center disabled:bg-slate-400 disabled:cursor-default"
                    >
                      {busy && (
                        <svg aria-hidden="true" className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      )}
                      {busy ? shared.codeSending : t.send}
                    </button>
                    <p className="text-xs text-gray-500 text-center" aria-live="polite">
                      {TURNSTILE_SITE_KEY && !captchaToken && !busy ? shared.captchaPending : t.privacy}
                    </p>
                  </form>
                )}
              </div>
            </div>
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
