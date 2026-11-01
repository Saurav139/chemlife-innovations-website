"use client";

import { Fragment, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import Icon from "@/components/site/Icon";
import { PageHero, Reveal } from "@/components/site/ui";
import { track } from "@/lib/analytics";
import { useT } from "@/i18n/LocaleProvider";
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
const FIELD = "w-full bg-page-alt border rounded-xl px-4 py-3.5 text-base text-ink placeholder:text-copy-dim focus:outline-none focus:border-flame focus:ring-1 focus:ring-flame transition-colors";
const LABEL = "block text-xs font-bold text-copy uppercase tracking-wider mb-2";

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
  const t = useT().contact;
  // What to tell the visitor when the message couldn't be sent. All of them also offer to email it instead.
  const SUBMIT_ERRORS: Record<SubmitError, string> = t.submitErrors;
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<SubmitError | null>(null);

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
      // From the homepage's "Request a technical dossier"
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
    return Object.keys(newErrors).length === 0;
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

  // Emails the message to the team through /api/contact. "Sent" is only shown once the email has gone.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    let error: SubmitError | null = null;
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) {
        const code = (await res.json().catch(() => null))?.error;
        error = code && code in SUBMIT_ERRORS ? code : "send_failed";
      }
    } catch {
      error = "network";
    }
    setIsSubmitting(false);
    if (error) {
      setSubmitError(error);
      return;
    }
    track("contact_form_submit", { inquiry_type: formData.inquiryType });
    setIsSubmitted(true);
  };

  // The same message as a pre-filled email, for when the form can't send it.
  const fallbackEmail = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    formData.subject || "Website enquiry"
  )}&body=${encodeURIComponent(
    `${formData.message}\n\n${formData.name}${formData.phone ? `\n${formData.phone}` : ""}`
  )}`;

  const fieldClass = (bad?: string) => `${FIELD} ${bad ? "border-red-400" : "border-line"}`;
  const quick = [
    { icon: "phone" as const, label: t.phone, value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE.replace(/\s/g, "")}` },
    { icon: "mail" as const, label: t.email, value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
    { icon: "pin" as const, label: t.plantTitle, value: "Doddaballapura, Bengaluru", href: "https://www.google.com/maps/search/?api=1&query=13.273301,77.576311" },
  ];

  return (
    <VariantProvider>
      <Header />

      <main id="main" tabIndex={-1} className="site-ui bg-page min-h-screen">
        <PageHero eyebrow={t.kicker} title={`${t.titleStart} *${t.titleAccent}* ${t.titleEnd}`} lead={t.intro}>
          <ul className="grid sm:grid-cols-3 gap-3 mt-12 text-left">
            {quick.map((item, i) => <Reveal as="li" key={item.icon} delay={0.2 + i * 0.05}>
              <a href={item.href} {...(item.icon === "pin" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group flex items-center gap-4 h-full rounded-2xl border border-line bg-card/70 p-5 hover:border-flame/40 transition-colors">
                <span className="grid place-items-center w-12 h-12 rounded-xl bg-flame/12 text-flame shrink-0"><Icon name={item.icon} className="w-6 h-6" /></span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold tracking-widest uppercase text-copy-dim">{item.label}</span>
                  <span className="block font-semibold text-ink group-hover:text-flame transition-colors break-all">{item.value}</span>
                </span>
              </a>
            </Reveal>)}
          </ul>
        </PageHero>

        <section className="bg-page pb-20 md:pb-28">
          <div className="container-site grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* The form */}
            <div className="lg:col-span-7">
              <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-card to-page-alt p-6 sm:p-8 md:p-10">
                <AnimatePresence mode="wait">
                  {!isSubmitted ? (
                    <motion.div key="contact-form" initial={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                      <h2 className="font-heading text-2xl md:text-3xl font-bold text-ink">{t.formTitle}</h2>
                      <p className="text-copy mt-2 mb-8">{t.formText}</p>

                      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="name" className={LABEL}>{t.name} <span className="text-flame">*</span></label>
                            <input type="text" id="name" name="name" maxLength={CONTACT_LIMITS.name} autoComplete="name" value={formData.name} onChange={handleInputChange}
                              aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} className={fieldClass(errors.name)} placeholder={t.namePlaceholder} />
                            {errors.name && <p id="name-error" className="text-red-300 text-sm mt-1.5">{errors.name}</p>}
                          </div>
                          <div>
                            <label htmlFor="email" className={LABEL}>{t.email} <span className="text-flame">*</span></label>
                            <input type="email" id="email" name="email" maxLength={CONTACT_LIMITS.email} autoComplete="email" value={formData.email} onChange={handleInputChange}
                              aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} className={fieldClass(errors.email)} placeholder={t.emailPlaceholder} />
                            {errors.email && <p id="email-error" className="text-red-300 text-sm mt-1.5">{errors.email}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="phone" className={LABEL}>{t.phone} <span className="text-copy-dim font-normal normal-case tracking-normal">{t.optional}</span></label>
                            <input type="tel" id="phone" name="phone" maxLength={CONTACT_LIMITS.phone} autoComplete="tel" value={formData.phone} onChange={handleInputChange}
                              className={fieldClass()} placeholder="+91 98765 43210" />
                          </div>
                          <div>
                            <label htmlFor="inquiryType" className={LABEL}>{t.inquiryType}</label>
                            <div className="relative">
                              <select id="inquiryType" name="inquiryType" value={formData.inquiryType} onChange={handleInputChange} className={`${fieldClass()} appearance-none cursor-pointer pr-10`}>
                                {INQUIRY_TYPES.map((opt) => <option key={opt} value={opt} className="bg-page-alt">{t.inquiryTypes[opt]}</option>)}
                              </select>
                              <Icon name="chevron" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-copy" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="subject" className={LABEL}>{t.subject} <span className="text-flame">*</span></label>
                          <input type="text" id="subject" name="subject" maxLength={CONTACT_LIMITS.subject} value={formData.subject} onChange={handleInputChange}
                            aria-invalid={!!errors.subject} aria-describedby={errors.subject ? "subject-error" : undefined} className={fieldClass(errors.subject)} placeholder={t.subjectPlaceholder} />
                          {errors.subject && <p id="subject-error" className="text-red-300 text-sm mt-1.5">{errors.subject}</p>}
                        </div>

                        <div>
                          <label htmlFor="message" className={LABEL}>{t.message} <span className="text-flame">*</span></label>
                          <textarea id="message" name="message" maxLength={CONTACT_LIMITS.message} rows={5} value={formData.message} onChange={handleInputChange}
                            aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined} className={`${fieldClass(errors.message)} resize-none`} placeholder={t.messagePlaceholder} />
                          {errors.message && <p id="message-error" className="text-red-300 text-sm mt-1.5">{errors.message}</p>}
                        </div>

                        {/* Spam trap: hidden from people and screen readers, so only bots fill it in. */}
                        <div aria-hidden="true" className="absolute -left-[10000px] top-auto w-px h-px overflow-hidden">
                          <label htmlFor="website">Website</label>
                          <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" value={formData.website} onChange={handleInputChange} />
                        </div>

                        {submitError && (
                          <div role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                            <p className="font-semibold">{SUBMIT_ERRORS[submitError]}</p>
                            <p className="mt-1">
                              {fill(t.fallback, {
                                email: <a href={fallbackEmail} className="underline font-semibold hover:text-ink">{t.fallbackEmail}</a>,
                                address: CONTACT_EMAIL,
                                phone: <a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`} className="underline whitespace-nowrap hover:text-ink">{CONTACT_PHONE}</a>,
                              })}
                            </p>
                          </div>
                        )}

                        <button type="submit" disabled={isSubmitting}
                          className="w-full md:w-auto inline-flex items-center justify-center gap-2 min-h-12 px-8 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold transition-colors cursor-pointer disabled:opacity-60">
                          {isSubmitting ? <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            {t.sending}
                          </> : <>{t.send}<Icon name="arrow" className="w-4 h-4" /></>}
                        </button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div key="contact-success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: easeOut }}
                      className="py-12 text-center flex flex-col items-center" role="status">
                      <span className="grid place-items-center w-16 h-16 rounded-full bg-mint/15 text-mint mb-6"><Icon name="check" className="w-8 h-8" strokeWidth={2.5} /></span>
                      <h2 className="font-heading text-2xl md:text-3xl font-bold text-ink mb-4">{t.sentTitle}</h2>
                      <p className="text-copy max-w-md mx-auto leading-relaxed mb-8">{t.sentText}</p>
                      <button onClick={() => { setFormData(EMPTY_FORM); setIsSubmitted(false); }}
                        className="min-h-11 px-6 rounded-full border border-line text-ink font-semibold hover:border-flame/50 cursor-pointer">{t.sendAnother}</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Where we are */}
            <div className="lg:col-span-5 space-y-6">
              <Reveal className="rounded-3xl border border-line bg-card/70 p-7">
                <h3 className="font-heading text-xl font-bold text-ink">{t.officeTitle}</h3>
                <p className="text-copy leading-relaxed mt-3">Plot no 18, KIADB Industrial Area, 3rd Phase, Obadenahalli, Doddaballapura, Greater Bengaluru - 561 203, Karnataka, India.</p>
                <div className="mt-6 pt-6 border-t border-line">
                  <h3 className="font-heading text-lg font-bold text-ink">{t.plantTitle}</h3>
                  <p className="text-copy leading-relaxed mt-2">{t.plantText}</p>
                </div>
              </Reveal>
              {/* The map. The pin underneath shows while it loads (it waits until it's near the screen), so the box is never blank. */}
              <Reveal delay={0.08}>
                <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-line bg-card select-none">
                  <div className="absolute inset-0 grid place-items-center text-copy-dim" aria-hidden="true"><Icon name="pin" className="w-12 h-12" /></div>
                  <iframe src="https://maps.google.com/maps?q=13.273301,77.576311+(Chemlife%20Innovations%20Pvt%20Ltd)&z=16&output=embed" width="100%" height="100%" style={{ border: 0 }}
                    allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={t.mapTitle} className="relative w-full h-full" />
                </div>
                <a href="https://www.google.com/maps/search/?api=1&query=13.273301,77.576311" target="_blank" rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 min-h-11 font-semibold text-flame hover:text-ink">
                  {t.openInMaps}<Icon name="arrowUpRight" className="w-4 h-4" />
                </a>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
