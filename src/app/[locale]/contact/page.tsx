"use client";

import { Fragment, useCallback, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import Turnstile, { type TurnstileHandle } from "@/components/Turnstile";
import { Images } from "@/lib/assets";
import { track } from "@/lib/analytics";
import { useLocale, useT } from "@/i18n/LocaleProvider";
import {
  CONTACT_EMAIL,
  CONTACT_LIMITS,
  CONTACT_PHONE,
  EMAIL_PATTERN,
  INQUIRY_TYPES,
  type ContactErrorCode,
  type ContactMessage,
} from "@/lib/contact";

const easeOut = [0.25, 0.1, 0, 1] as const;

// The CAPTCHA's site key. Without it the form can't be sent and says so.
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

// `website` is a hidden spam trap: people never see it, bots fill it in.
type FormData = ContactMessage & { website: string };

const EMPTY_FORM: FormData = {
  name: "",
  email: "",
  phone: "",
  inquiryType: INQUIRY_TYPES[0],
  subject: "",
  message: "",
  website: "",
};

type SubmitError = ContactErrorCode | "network";
// The message, then the 4-digit code emailed to the visitor, then "sent".
type Step = "form" | "code" | "sent";
const CODE_LENGTH = 4;

/** Posts one step to /api/contact. Returns the response body, or the reason it failed. */
async function post(body: object): Promise<{ data?: Record<string, unknown>; error?: SubmitError; left?: number }> {
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20_000),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data) return { data };
    return { error: typeof data?.error === "string" ? data.error : "send_failed", left: data?.left };
  } catch {
    return { error: "network" };
  }
}

/** Fills {name} placeholders in a translated sentence with links or other elements. */
function fill(template: string, parts: Record<string, React.ReactNode>) {
  return template.split(/\{(\w+)\}/).map((piece, i) => (i % 2 ? <Fragment key={i}>{parts[piece]}</Fragment> : piece));
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function ContactPage() {
  const messages = useT();
  const t = messages.contact;
  // The code step's wording that isn't about the message is shared with the dossier form.
  const d = messages.dossier;
  const locale = useLocale();
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  const [errors, setErrors] = useState<FormErrors>({});
  const [step, setStep] = useState<Step>("form");
  const [busy, setBusy] = useState<"submit" | "resend" | null>(null);
  const [submitError, setSubmitError] = useState<{ code: SubmitError; left?: number } | null>(null);
  // The signed challenge from /api/contact and the code the visitor types.
  const [challenge, setChallenge] = useState("");
  const [code, setCode] = useState("");
  const [codeMissing, setCodeMissing] = useState(false);
  const [resent, setResent] = useState(false);
  const codeField = useRef<HTMLInputElement>(null);
  // The CAPTCHA token from the Turnstile widget. Null until the visitor passes; the form can't be sent without it.
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captcha = useRef<TurnstileHandle>(null);

  // Pre-fill the form when a call to action links here, e.g. /contact?type=nutritionist from the homepage hero
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type");
    // A message carried over from another page, e.g. the mould-loss calculator's figures. Only fills an empty box.
    const message = params.get("message");
    if (message) {
      setFormData((prev) => ({ ...prev, message: prev.message || message.slice(0, CONTACT_LIMITS.message) }));
    }
    if (type === "nutritionist") {
      setFormData((prev) => ({
        ...prev,
        inquiryType: "Talk to a Nutritionist",
        subject: prev.subject || t.nutritionistSubject,
      }));
    } else if (type === "dossier") {
      // From older links: "Request a technical dossier" now opens its own form (components/DossierRequest.tsx)
      setFormData((prev) => ({
        ...prev,
        inquiryType: "Technical & R&D Partnership",
        subject: prev.subject || t.dossierSubject,
      }));
    } else if (type === "research") {
      // From the Research page's closing panel
      setFormData((prev) => ({
        ...prev,
        inquiryType: "Technical & R&D Partnership",
        subject: prev.subject || t.researchSubject,
      }));
    }
  }, []);

  const focusOnMount = useCallback((el: HTMLElement | null) => el?.focus({ preventScroll: true }), []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t.errors.name;
    }

    if (!formData.email.trim()) {
      newErrors.email = t.errors.email;
    } else if (!EMAIL_PATTERN.test(formData.email.trim())) {
      newErrors.email = t.errors.emailInvalid;
    }

    if (!formData.subject.trim()) {
      newErrors.subject = t.errors.subject;
    }

    if (!formData.message.trim()) {
      newErrors.message = t.errors.message;
    }

    setErrors(newErrors);
    // Take the keyboard (and a screen reader) to the first field that needs fixing; its message is read with it.
    const firstInvalid = (["name", "email", "subject", "message"] as const).find((field) => newErrors[field]);
    if (firstInvalid) document.getElementById(firstInvalid)?.focus();
    return !firstInvalid;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on input
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Step 1: the message goes to /api/contact, which emails the visitor a code. Nothing reaches the team yet.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !captchaToken) return;

    setBusy("submit");
    setSubmitError(null);
    const { data, error } = await post({ action: "start", ...formData, locale, turnstileToken: captchaToken });
    setBusy(null);
    // Tokens are single-use: ask the widget for a fresh one before any further attempt.
    captcha.current?.reset();
    if (error) return setSubmitError({ code: error });
    // The widget leaves the page with the form, and makes a new token if the visitor comes back to it.
    setCaptchaToken(null);
    setChallenge(String(data?.challenge ?? ""));
    setCode("");
    setCodeMissing(false);
    setResent(false);
    setStep("code");
  };

  // Step 2: the right code emails the message to the team. "Sent" is only shown once the email has gone.
  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== CODE_LENGTH) {
      setCodeMissing(true);
      return codeField.current?.focus();
    }
    setBusy("submit");
    setSubmitError(null);
    setResent(false);
    const { error, left } = await post({ action: "verify", challenge, code });
    setBusy(null);
    if (error) {
      setSubmitError({ code: error, left });
      return codeField.current?.select();
    }
    track("contact_form_submit", { inquiry_type: formData.inquiryType });
    setStep("sent");
  };

  const resendCode = async () => {
    setBusy("resend");
    setSubmitError(null);
    setResent(false);
    const { data, error } = await post({ action: "resend", challenge });
    setBusy(null);
    if (error) return setSubmitError({ code: error });
    setChallenge(String(data?.challenge ?? ""));
    setCode("");
    setResent(true);
    codeField.current?.focus();
  };

  // The same message as a pre-filled email, for when the form can't send it.
  const fallbackEmail = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    formData.subject || "Website enquiry"
  )}&body=${encodeURIComponent(
    `${formData.message}\n\n${formData.name}${formData.phone ? `\n${formData.phone}` : ""}`
  )}`;

  // Problems with the code itself are told plainly; anything else also offers to email or call instead.
  const errorBox = submitError && (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {submitError.code === "code_wrong" || submitError.code === "code_expired" || submitError.code === "code_attempts" ? (
        <p className="font-semibold">
          {submitError.code === "code_wrong"
            ? fill(d.codeErrors.wrong, { left: submitError.left ?? 1 })
            : submitError.code === "code_expired"
              ? d.codeErrors.expired
              : d.codeErrors.attempts}
        </p>
      ) : (
        <>
          <p className="font-semibold">
            {t.submitErrors[submitError.code in t.submitErrors ? (submitError.code as keyof typeof t.submitErrors) : "send_failed"]}
          </p>
          <p className="mt-1">
            {fill(t.fallback, {
              email: (
                <a href={fallbackEmail} className="underline font-semibold hover:text-red-800">
                  {t.fallbackEmail}
                </a>
              ),
              address: CONTACT_EMAIL,
              phone: (
                <a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`} className="underline whitespace-nowrap hover:text-red-800">
                  {CONTACT_PHONE}
                </a>
              ),
            })}
          </p>
        </>
      )}
    </div>
  );

  const spinner = (
    <svg aria-hidden="true" className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
  const primaryButton =
    "w-full md:w-auto px-8 py-3.5 bg-brand-navy text-white font-bold text-sm rounded-full hover:bg-teal-aa focus:outline-none transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-400";
  const textButton = "font-semibold text-teal-aa underline underline-offset-4 hover:text-brand-navy cursor-pointer disabled:opacity-60";

  return (
    <VariantProvider>
      <Header />

      <main id="main" tabIndex={-1} className="bg-white min-h-screen text-brand-navy">
        {/* A plain section, not a fade-in: it's the first screen, so it shows without waiting for the page's JavaScript. */}
        <section className="pt-40 md:pt-44 pb-10 md:pb-24 lg:pb-32 text-white relative overflow-hidden bg-brand-navy flex items-center">
          <div className="absolute inset-0 z-0">
            <Image
              src={Images.heroes.contact}
              alt={t.heroAlt}
              fill
              sizes="100vw"
              className="object-cover opacity-65"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/60 to-brand-navy/35" />
            <div className="absolute inset-0 bg-black/10" />
          </div>

          <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full text-left">
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
        </section>

        {/* Main Content: Form & Location Details */}
        <SectionWrapper className="py-12 md:py-24 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

              {/* Left Column: Form Card */}
              <div className="lg:col-span-7">
                <div className="bg-gray-55 border border-gray-250 rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    {step === "form" ? (
                      <motion.div
                        key="contact-form"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-navy mb-2">
                          {t.formTitle}
                        </h2>
                        <p className="text-gray-500 text-sm mb-8">
                          {t.formText}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div>
                              <label htmlFor="name" className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
                                {t.name} <span className="text-teal-aa">*</span>
                              </label>
                              <input
                                type="text"
                                id="name"
                                aria-required="true"
                                aria-invalid={errors.name ? true : undefined}
                                aria-describedby={errors.name ? "name-error" : undefined}
                                name="name"
                                maxLength={CONTACT_LIMITS.name}
                                autoComplete="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`w-full bg-white border ${errors.name ? "border-red-600" : "border-gray-250"
                                  } rounded-xl px-4 py-3.5 text-base md:text-sm text-brand-navy focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all`}
                                placeholder={t.namePlaceholder}
                              />
                              {errors.name && (
                                <p id="name-error" className="text-red-600 text-xs mt-1.5 font-medium">{errors.name}</p>
                              )}
                            </div>

                            {/* Email Address */}
                            <div>
                              <label htmlFor="email" className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
                                {t.email} <span className="text-teal-aa">*</span>
                              </label>
                              <input
                                type="email"
                                id="email"
                                aria-required="true"
                                aria-invalid={errors.email ? true : undefined}
                                aria-describedby={errors.email ? "email-error" : undefined}
                                name="email"
                                maxLength={CONTACT_LIMITS.email}
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`w-full bg-white border ${errors.email ? "border-red-600" : "border-gray-250"
                                  } rounded-xl px-4 py-3.5 text-base md:text-sm text-brand-navy focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all`}
                                placeholder={t.emailPlaceholder}
                              />
                              {errors.email && (
                                <p id="email-error" className="text-red-600 text-xs mt-1.5 font-medium">{errors.email}</p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Phone Number */}
                            <div>
                              <label htmlFor="phone" className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
                                {t.phone} <span className="text-gray-aa font-normal">{t.optional}</span>
                              </label>
                              <input
                                type="tel"
                                id="phone"
                                name="phone"
                                maxLength={CONTACT_LIMITS.phone}
                                autoComplete="tel"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-gray-250 rounded-xl px-4 py-3.5 text-base md:text-sm text-brand-navy focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                                placeholder="+91 98765 43210"
                              />
                            </div>

                            {/* Inquiry Type */}
                            <div>
                              <label htmlFor="inquiryType" className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
                                {t.inquiryType}
                              </label>
                              <div className="relative">
                                <select
                                  id="inquiryType"
                                  name="inquiryType"
                                  value={formData.inquiryType}
                                  onChange={handleInputChange}
                                  className="w-full bg-white border border-gray-250 rounded-xl px-4 py-3.5 text-base md:text-sm text-brand-navy focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all appearance-none cursor-pointer"
                                >
                                  {INQUIRY_TYPES.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {t.inquiryTypes[opt]}
                                    </option>
                                  ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-aa">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Subject */}
                          <div>
                            <label htmlFor="subject" className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
                              {t.subject} <span className="text-teal-aa">*</span>
                            </label>
                            <input
                              type="text"
                              id="subject"
                              aria-required="true"
                              aria-invalid={errors.subject ? true : undefined}
                              aria-describedby={errors.subject ? "subject-error" : undefined}
                              name="subject"
                              maxLength={CONTACT_LIMITS.subject}
                              value={formData.subject}
                              onChange={handleInputChange}
                              className={`w-full bg-white border ${errors.subject ? "border-red-600" : "border-gray-250"
                                } rounded-xl px-4 py-3.5 text-base md:text-sm text-brand-navy focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all`}
                              placeholder={t.subjectPlaceholder}
                            />
                            {errors.subject && (
                              <p id="subject-error" className="text-red-600 text-xs mt-1.5 font-medium">{errors.subject}</p>
                            )}
                          </div>

                          {/* Message */}
                          <div>
                            <label htmlFor="message" className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
                              {t.message} <span className="text-teal-aa">*</span>
                            </label>
                            <textarea
                              id="message"
                              aria-required="true"
                              aria-invalid={errors.message ? true : undefined}
                              aria-describedby={errors.message ? "message-error" : undefined}
                              name="message"
                              maxLength={CONTACT_LIMITS.message}
                              rows={5}
                              value={formData.message}
                              onChange={handleInputChange}
                              className={`w-full bg-white border ${errors.message ? "border-red-600" : "border-gray-250"
                                } rounded-xl px-4 py-3.5 text-base md:text-sm text-brand-navy focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all resize-none`}
                              placeholder={t.messagePlaceholder}
                            />
                            {errors.message && (
                              <p id="message-error" className="text-red-600 text-xs mt-1.5 font-medium">{errors.message}</p>
                            )}
                          </div>

                          {/* Spam trap: hidden from people and screen readers, so only bots fill it in. */}
                          <div aria-hidden="true" className="absolute -left-[10000px] top-auto w-px h-px overflow-hidden">
                            <label htmlFor="website">Website</label>
                            <input
                              type="text"
                              id="website"
                              name="website"
                              tabIndex={-1}
                              autoComplete="off"
                              value={formData.website}
                              onChange={handleInputChange}
                            />
                          </div>

                          {/* CAPTCHA (Cloudflare Turnstile). Without a site key the form can't be sent, so say so instead. */}
                          {TURNSTILE_SITE_KEY ? (
                            <Turnstile ref={captcha} siteKey={TURNSTILE_SITE_KEY} language={locale} onToken={setCaptchaToken} />
                          ) : (
                            submitError?.code !== "unavailable" && (
                              <p className="text-sm text-red-700">{t.submitErrors.unavailable}</p>
                            )
                          )}

                          {errorBox}

                          {/* Submit Button */}
                          <div className="pt-2">
                            <button type="submit" disabled={busy !== null || !captchaToken} className={primaryButton}>
                              {busy ? <>{spinner}{d.sending}</> : t.send}
                            </button>
                            {TURNSTILE_SITE_KEY && !captchaToken && !busy ? (
                              <p className="mt-2 text-xs text-slate-500" aria-live="polite">{t.captchaPending}</p>
                            ) : (
                              <p className="mt-2 text-xs text-slate-500">{t.codeHint}</p>
                            )}
                          </div>
                        </form>
                      </motion.div>
                    ) : step === "code" ? (
                      <motion.div
                        key="contact-code"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-navy mb-2">
                          {d.codeTitle}
                        </h2>
                        <p className="text-gray-500 text-sm mb-8">
                          {fill(t.codeText, {
                            email: <strong className="font-semibold text-brand-navy break-all">{formData.email.trim()}</strong>,
                          })}
                        </p>

                        <form onSubmit={submitCode} noValidate className="space-y-6">
                          <div>
                            <label htmlFor="code" className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
                              {d.codeLabel}
                            </label>
                            <input
                              ref={codeField}
                              autoFocus
                              id="code"
                              name="code"
                              type="text"
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              pattern="[0-9]*"
                              maxLength={CODE_LENGTH}
                              value={code}
                              onChange={(e) => {
                                setCode(e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH));
                                setCodeMissing(false);
                              }}
                              aria-invalid={codeMissing || undefined}
                              aria-describedby={codeMissing ? "code-error" : undefined}
                              className={`w-40 bg-white border ${codeMissing ? "border-red-600" : "border-gray-250"
                                } rounded-xl pl-6 pr-4 py-3.5 text-center text-2xl font-bold tracking-[0.5em] text-brand-navy focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all`}
                            />
                            {codeMissing && (
                              <p id="code-error" className="text-red-600 text-xs mt-1.5 font-medium">{d.codeErrors.empty}</p>
                            )}
                          </div>

                          {errorBox}
                          {resent && !submitError && (
                            <p className="text-sm text-teal-aa font-semibold" aria-live="polite">{d.resent}</p>
                          )}

                          <div className="pt-2">
                            <button type="submit" disabled={busy !== null} className={primaryButton}>
                              {busy === "submit" ? <>{spinner}{t.sending}</> : t.verify}
                            </button>
                          </div>
                          <p className="text-sm text-gray-500">
                            {fill(d.resendPrompt, {
                              resend: (
                                <button type="button" onClick={resendCode} disabled={busy !== null} className={textButton}>
                                  {busy === "resend" ? d.sending : d.resendLink}
                                </button>
                              ),
                            })}
                          </p>
                          <p className="text-sm">
                            <button
                              type="button"
                              onClick={() => {
                                setSubmitError(null);
                                setStep("form");
                              }}
                              disabled={busy !== null}
                              className={textButton}
                            >
                              {d.changeEmail}
                            </button>
                          </p>
                        </form>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="contact-success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, ease: easeOut }}
                        role="status"
                        className="py-12 text-center flex flex-col items-center"
                      >
                        {/* Animated Checkmark */}
                        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-teal-aa mb-6 border border-teal-100">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        {/* Focus moves here when the form is replaced, so "sent" is read out and Tab carries on from it. */}
                        <h2 ref={focusOnMount} tabIndex={-1} className="font-heading text-2xl md:text-3xl font-bold text-brand-navy mb-4 focus:outline-none">
                          {t.sentTitle}
                        </h2>
                        <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed mb-8">
                          {t.sentText}
                        </p>
                        <button
                          onClick={() => {
                            setFormData(EMPTY_FORM);
                            setStep("form");
                          }}
                          className="px-6 py-2.5 bg-gray-150 text-gray-700 hover:bg-gray-200 transition-colors font-bold text-xs rounded-full cursor-pointer"
                        >
                          {t.sendAnother}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Column: Address & Map Details */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-8">

                {/* Office Info Card */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-brand-navy mb-3">
                      {t.officeTitle}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4 max-w-prose">
                      Plot no 18, KIADB Industrial Area, 3rd Phase, Obadenahalli, Doddaballapura, Greater Bengaluru - 561 203, Karnataka, India.
                    </p>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3 text-gray-500">
                        <svg className="w-4 h-4 text-teal-aa" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a href="tel:+919535862570" className="inline-flex items-center min-h-11 -my-1.5 hover:text-teal-aa transition-colors">+91 95358 62570</a>
                      </div>
                      <div className="flex items-center gap-3 text-gray-500">
                        <svg className="w-4 h-4 text-teal-aa" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <a href="mailto:innovate@chemlifeinnovations.com" className="inline-flex items-center min-h-11 -my-1.5 hover:text-teal-aa transition-colors break-all">innovate@chemlifeinnovations.com</a>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  {/* Manufacturing & R&D Highlight */}
                  <div>
                    <h3 className="font-heading text-lg font-bold text-brand-navy mb-2">
                      {t.plantTitle}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-prose">
                      {t.plantText}
                    </p>
                  </div>
                </div>

                {/* Google Maps Embed Container. The pin underneath shows while the map loads (it waits until it's near
                    the screen), so the box is never blank. */}
                <div className="relative w-full aspect-[4/3] md:aspect-[16/9] lg:aspect-[4/3] rounded-3xl overflow-hidden border border-gray-200 shadow-sm bg-slate-100 select-none">
                  <div className="absolute inset-0 flex items-center justify-center text-slate-300" aria-hidden="true">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
                    </svg>
                  </div>
                  <iframe
                    src="https://maps.google.com/maps?q=13.273301,77.576311+(Chemlife%20Innovations%20Pvt%20Ltd)&z=16&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={t.mapTitle}
                    className="relative w-full h-full opacity-90 hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=13.273301,77.576311"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 min-h-11 text-sm font-semibold text-teal-aa hover:text-teal-700 transition-colors"
                >
                  {t.openInMaps}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5h5v5M19 5l-8 8M10 6H6a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4" />
                  </svg>
                </a>

              </div>

            </div>
          </div>
        </SectionWrapper>
      </main>

      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
