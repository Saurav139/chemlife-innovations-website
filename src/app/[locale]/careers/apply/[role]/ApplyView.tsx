"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import Turnstile, { type TurnstileHandle } from "@/components/Turnstile";
import { APPLICATION_LIMITS, RESUME_ACCEPT, RESUME_MAX_BYTES, hasResumeExtension, type ApplicationErrorCode } from "@/lib/careers";
import { CONTACT_EMAIL, EMAIL_PATTERN } from "@/lib/contact";
import { useHref, useLocale, useT } from "@/i18n/LocaleProvider";
import { fill, useOpenRoles, type CareersProps } from "../../roles";

// The application form for one internship. It goes to /api/careers, which emails it to the team with the résumé
// attached; nothing opens on the visitor's side.

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type SubmitError = ApplicationErrorCode | "network";
interface FieldErrors {
  name?: string;
  email?: string;
  resume?: string;
}

const fieldLabel = "block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2";
const fieldBox = (invalid?: string) =>
  `w-full bg-white border ${invalid ? "border-red-600" : "border-gray-250"} rounded-xl px-4 py-3 text-base text-brand-navy placeholder:text-gray-400 focus:outline-none focus:border-teal-aa transition-colors`;
const fieldError = "text-red-600 text-xs mt-1.5 font-medium";
const optional = "font-medium normal-case tracking-normal text-gray-500";

export default function ApplyView({ roleId, ...careers }: CareersProps & { roleId: string }) {
  const messages = useT();
  const t = messages.careers;
  const shared = messages.contact;
  const locale = useLocale();
  const href = useHref();
  // Undefined when the internship is closed: the page then says so instead of showing the form.
  const role = useOpenRoles(careers).find((item) => item.id === roleId);
  const backToRoles = `${href("/careers")}#open-internships`;

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
  // The application that went through, for the thank-you.
  const [sent, setSent] = useState<{ name: string; email: string } | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captcha = useRef<TurnstileHandle>(null);
  const form = useRef<HTMLFormElement>(null);

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
    body.set("role", roleId);
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
    setSent({ name: name.trim(), email: email.trim() });
    setMessage("");
    setResume(null);
    setPickerKey((key) => key + 1);
    window.scrollTo({ top: 0 });
  };

  const errorText: Record<SubmitError, string> = {
    invalid: shared.submitErrors.invalid,
    closed: t.submitErrors.closed,
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

  const backLink = (className: string) => (
    <Link href={backToRoles} className={className}>
      <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      {t.openTitle}
    </Link>
  );
  const card = "max-w-2xl mx-auto bg-white border border-gray-200 rounded-3xl shadow-sm p-6 sm:p-8 md:p-10";

  return (
    <VariantProvider>
      <Header />

      <main id="main" tabIndex={-1} className="bg-gray-50 min-h-screen text-brand-navy">
        <section className="bg-brand-navy text-white pt-36 md:pt-40 pb-24 md:pb-28">
          <div className="max-w-2xl mx-auto px-6">
            {backLink("inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white mb-5")}
            {role ? (
              <>
                <span className="text-teal-aa-light text-sm font-semibold tracking-widest uppercase block mb-2">{t.apply}</span>
                <h1 className="font-heading text-3xl md:text-4xl font-bold leading-tight text-white">{role.title}</h1>
                <p className="text-white/75 text-sm md:text-base mt-2">{role.department} • {t.location}</p>
              </>
            ) : (
              <h1 className="font-heading text-2xl md:text-3xl font-bold leading-tight text-white">{t.submitErrors.closed}</h1>
            )}
          </div>
        </section>

        <div className="px-6 -mt-14 md:-mt-16 pb-16 md:pb-24">
          {!role ? (
            <div className={`${card} text-center`}>
              {backLink("inline-flex items-center gap-2 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover px-7 py-3.5 text-sm font-bold text-white shadow transition-colors")}
            </div>
          ) : sent ? (
            <div role="status" className={`${card} text-center`}>
              <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-aa flex items-center justify-center mx-auto mb-4">
                <svg aria-hidden="true" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 className="font-heading text-2xl font-bold text-brand-navy mb-2">{t.sentTitle}</h2>
              <p className="text-gray-600 text-base leading-relaxed">
                {fill(t.sentText, {
                  name: sent.name,
                  role: <strong className="font-semibold text-brand-navy">{role.title}</strong>,
                  email: <strong className="font-semibold text-brand-navy break-all">{sent.email}</strong>,
                })}
              </p>
              <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-4">
                {backLink("inline-flex items-center gap-2 rounded-full bg-brand-navy hover:bg-teal-aa px-7 py-3.5 text-sm font-bold text-white transition-colors")}
                <button
                  type="button"
                  onClick={() => setSent(null)}
                  className="font-semibold text-sm text-teal-aa underline underline-offset-4 hover:text-brand-navy cursor-pointer"
                >
                  {t.applyAgain}
                </button>
              </div>
            </div>
          ) : (
            <form ref={form} onSubmit={submit} noValidate className={`${card} space-y-5`}>
              <div className="grid gap-5 sm:grid-cols-2">
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
              </div>

              <div>
                <label htmlFor="apply-phone" className={fieldLabel}>
                  {shared.phone} <span className={optional}>{shared.optional}</span>
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
                  {shared.message} <span className={optional}>{shared.optional}</span>
                </label>
                <textarea
                  id="apply-message"
                  rows={4}
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

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-5 pt-1">
                <button
                  type="submit"
                  disabled={busy || !captchaToken}
                  className="w-full md:w-auto shrink-0 px-10 py-3.5 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-bold text-base shadow-sm transition-colors cursor-pointer flex items-center justify-center disabled:bg-slate-400 disabled:cursor-default"
                >
                  {busy && (
                    <svg aria-hidden="true" className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {busy ? t.sending : t.send}
                </button>
                <p className="text-xs text-gray-500" aria-live="polite">
                  {TURNSTILE_SITE_KEY && !captchaToken && !busy ? shared.captchaPending : t.privacy}
                </p>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
