"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import Turnstile, { type TurnstileHandle } from "@/components/Turnstile";
import { track } from "@/lib/analytics";
import { CONTACT_EMAIL, CONTACT_PHONE, EMAIL_PATTERN, type ContactErrorCode } from "@/lib/contact";
import { DOSSIER_INTERESTS, DOSSIER_LIMITS, DOSSIER_PDF, type DossierRequest as Details } from "@/lib/dossier";
import { useLocale, useT } from "@/i18n/LocaleProvider";

// "Request a technical dossier": a button that opens a short form in a pop-up. The details are emailed to the team
// through /api/dossier, then the PDF downloads straight away, with a link in case the download doesn't start.

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

// `website` is a hidden spam trap: people never see it, bots fill it in.
type FormData = Details & { website: string };
const EMPTY_FORM: FormData = { name: "", email: "", company: "", role: "", country: "", interest: "", website: "" };

type SubmitError = ContactErrorCode | "network";
type Required = "name" | "email" | "company" | "country";

/** Fills {name} placeholders in a translated sentence with links or other elements. */
function fill(template: string, parts: Record<string, ReactNode>) {
  return template.split(/\{(\w+)\}/).map((piece, i) => (i % 2 ? <Fragment key={i}>{parts[piece]}</Fragment> : piece));
}

function startDownload() {
  const link = document.createElement("a");
  link.href = DOSSIER_PDF;
  link.download = "";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

const input =
  "w-full bg-white border rounded-xl px-4 py-3 text-base md:text-sm text-brand-navy focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all";
const label = "block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2";

interface Props {
  className: string;
  /** Name for the click in Google Analytics. */
  analytics: string;
  children: ReactNode;
}

export default function DossierRequest({ className, analytics, children }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  // The form is only built while the pop-up is open, so the CAPTCHA script loads only for visitors who ask.
  const [open, setOpen] = useState(false);

  const show = () => {
    setOpen(true);
    dialog.current?.showModal();
  };

  // Keeps the page behind the pop-up from scrolling.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = before;
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={show} className={className} data-analytics-click={analytics} aria-haspopup="dialog">
        {children}
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="dossier-title"
        onClose={() => setOpen(false)}
        // A click on the dimmed backdrop (the dialog itself, outside its panel) closes it.
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        className="m-auto w-[calc(100%-2rem)] max-w-xl max-h-[calc(100dvh-2rem)] rounded-3xl bg-white p-0 text-brand-navy shadow-2xl backdrop:bg-brand-navy/70 backdrop:backdrop-blur-sm"
      >
        {open && <DossierForm onClose={() => dialog.current?.close()} />}
      </dialog>
    </>
  );
}

function DossierForm({ onClose }: { onClose: () => void }) {
  const messages = useT();
  const t = messages.dossier;
  const c = messages.contact;
  const locale = useLocale();
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<Required, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<SubmitError | null>(null);
  const [done, setDone] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captcha = useRef<TurnstileHandle>(null);
  const firstField = useRef<HTMLInputElement>(null);

  useEffect(() => firstField.current?.focus(), []);

  const validate = () => {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = c.errors.name;
    if (!form.email.trim()) next.email = c.errors.email;
    else if (!EMAIL_PATTERN.test(form.email.trim())) next.email = c.errors.emailInvalid;
    if (!form.company.trim()) next.company = t.errors.company;
    if (!form.country.trim()) next.country = t.errors.country;
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) document.getElementById(`dossier-${first}`)?.focus();
    return !first;
  };

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as Required]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Sends the details through /api/dossier; the download only starts once the email has gone.
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !captchaToken) return;

    setIsSubmitting(true);
    setSubmitError(null);
    let error: SubmitError | null = null;
    try {
      const res = await fetch("/api/dossier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken: captchaToken }),
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) {
        const code = (await res.json().catch(() => null))?.error;
        error = code && code in t.submitErrors ? code : "send_failed";
      }
    } catch {
      error = "network";
    }
    setIsSubmitting(false);
    // Tokens are single-use: ask the widget for a fresh one before any further attempt.
    captcha.current?.reset();
    if (error) {
      setSubmitError(error);
      return;
    }
    track("dossier_request", { interest: form.interest || "not given" });
    setDone(true);
    startDownload();
  };

  const field = (name: Required | "role", type: string, autoComplete: string, required: boolean, labelText: string, placeholder: string) => (
    <div>
      <label htmlFor={`dossier-${name}`} className={label}>
        {labelText}{" "}
        {required ? <span className="text-teal-aa">*</span> : <span className="text-gray-aa font-normal normal-case tracking-normal">{c.optional}</span>}
      </label>
      <input
        ref={name === "name" ? firstField : undefined}
        id={`dossier-${name}`}
        name={name}
        type={type}
        autoComplete={autoComplete}
        maxLength={DOSSIER_LIMITS[name]}
        value={form[name]}
        onChange={change}
        placeholder={placeholder}
        aria-invalid={name !== "role" && errors[name] ? true : undefined}
        aria-describedby={name !== "role" && errors[name] ? `dossier-${name}-error` : undefined}
        className={`${input} ${name !== "role" && errors[name] ? "border-red-600" : "border-gray-300"}`}
      />
      {name !== "role" && errors[name] && (
        <p id={`dossier-${name}-error`} className="text-red-600 text-xs mt-1.5 font-medium">{errors[name]}</p>
      )}
    </div>
  );

  const closeButton = (
    <button
      type="button"
      onClick={onClose}
      aria-label={t.close}
      className="absolute top-4 right-4 inline-flex items-center justify-center w-11 h-11 rounded-full text-gray-aa hover:text-brand-navy hover:bg-slate-100 transition-colors"
    >
      <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
      </svg>
    </button>
  );

  if (done) {
    return (
      <div className="relative p-6 sm:p-10 text-center" role="status">
        {closeButton}
        <div aria-hidden="true" className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-aa">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v11m0 0l-4-4m4 4l4-4M5 20h14" />
          </svg>
        </div>
        <h2 id="dossier-title" className="font-heading text-2xl font-bold text-brand-navy">{t.startedTitle}</h2>
        <p className="mt-3 text-slate-600 leading-relaxed">{fill(t.startedText, { name: form.name.trim() })}</p>
        <p className="mt-3 text-sm text-slate-600">
          {fill(t.fallbackLink, {
            link: (
              <a href={DOSSIER_PDF} download className="font-semibold text-teal-aa underline underline-offset-4 hover:text-brand-navy">
                {t.fallbackLinkText}
              </a>
            ),
          })}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-8 inline-flex items-center justify-center min-h-12 px-8 rounded-full bg-brand-navy text-white font-bold text-sm hover:bg-teal-aa transition-colors"
        >
          {t.close}
        </button>
      </div>
    );
  }

  const fallbackEmail = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(c.dossierSubject)}&body=${encodeURIComponent(
    [form.name, form.role, form.company, form.country].filter(Boolean).join("\n"),
  )}`;

  return (
    <div className="relative p-6 sm:p-10">
      {closeButton}
      <h2 id="dossier-title" className="font-heading text-2xl md:text-3xl font-bold text-brand-navy pr-10">{t.title}</h2>
      <p className="mt-2 mb-6 text-sm text-slate-600 leading-relaxed">{t.intro}</p>

      <form onSubmit={submit} noValidate className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {field("name", "text", "name", true, c.name, c.namePlaceholder)}
          {field("email", "email", "email", true, c.email, c.emailPlaceholder)}
          {field("company", "text", "organization", true, t.company, t.companyPlaceholder)}
          {field("role", "text", "organization-title", false, t.role, t.rolePlaceholder)}
          {field("country", "text", "country-name", true, t.country, t.countryPlaceholder)}
          <div>
            <label htmlFor="dossier-interest" className={label}>
              {t.interest} <span className="text-gray-aa font-normal normal-case tracking-normal">{c.optional}</span>
            </label>
            <div className="relative">
              <select
                id="dossier-interest"
                name="interest"
                value={form.interest}
                onChange={change}
                className={`${input} border-gray-300 appearance-none cursor-pointer pr-10`}
              >
                <option value="">{t.interestPlaceholder}</option>
                {DOSSIER_INTERESTS.map((option) => (
                  <option key={option} value={option}>{t.interests[option]}</option>
                ))}
              </select>
              <svg aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-aa" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Spam trap: hidden from people and screen readers, so only bots fill it in. */}
        <div aria-hidden="true" className="absolute -left-[10000px] top-auto w-px h-px overflow-hidden">
          <label htmlFor="dossier-website">Website</label>
          <input type="text" id="dossier-website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={change} />
        </div>

        {/* CAPTCHA (Cloudflare Turnstile). Without a site key the form can't be sent, so say so instead. */}
        {TURNSTILE_SITE_KEY ? (
          <Turnstile ref={captcha} siteKey={TURNSTILE_SITE_KEY} language={locale} onToken={setCaptchaToken} />
        ) : (
          submitError !== "unavailable" && <p className="text-sm text-red-700">{t.submitErrors.unavailable}</p>
        )}

        {submitError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p className="font-semibold">{t.submitErrors[submitError]}</p>
            <p className="mt-1">
              {fill(c.fallback, {
                email: (
                  <a href={fallbackEmail} className="underline font-semibold hover:text-red-800">{c.fallbackEmail}</a>
                ),
                address: CONTACT_EMAIL,
                phone: (
                  <a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`} className="underline whitespace-nowrap hover:text-red-800">{CONTACT_PHONE}</a>
                ),
              })}
            </p>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isSubmitting || !captchaToken}
            className="w-full sm:w-auto min-h-12 px-8 bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-bold text-sm rounded-full transition-colors shadow-sm inline-flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg aria-hidden="true" className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t.sending}
              </>
            ) : (
              t.submit
            )}
          </button>
          {TURNSTILE_SITE_KEY && !captchaToken && !isSubmitting && (
            <p className="mt-2 text-xs text-slate-500" aria-live="polite">{c.captchaPending}</p>
          )}
        </div>
      </form>
    </div>
  );
}
