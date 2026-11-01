"use client";

import { Fragment, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import Icon from "@/components/site/Icon";
import { Button, PageHero, Reveal, easeOut } from "@/components/site/ui";
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

const FIELD = "w-full bg-transparent border-0 border-b-2 rounded-none px-0 py-3 text-lg text-ink placeholder:text-copy-dim focus:outline-none focus:border-flame transition-colors";
const LABEL = "label-mono text-copy-dim flex items-center gap-3 mb-1";

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

  const fieldClass = (bad?: string) => `${FIELD} ${bad ? "border-red-700" : "border-copy-dim/60"}`;
  const quick = [
    { icon: "phone" as const, label: t.phone, value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE.replace(/\s/g, "")}` },
    { icon: "mail" as const, label: t.email, value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  ];
  const error = (id: string, text?: string) => text && <p id={`${id}-error`} className="text-red-700 text-sm mt-2">{text}</p>;

  return (
    <VariantProvider>
      <Header />

      <main id="main" tabIndex={-1} className="site-ui bg-page min-h-screen">
        <PageHero trail={t.kicker} title={`${t.titleStart} *${t.titleAccent}* ${t.titleEnd}`} lead={t.intro} />

        <section className="paper relative bg-page pb-20 md:pb-28">
          <div className="container-site grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* The form, as a sheet of numbered fields */}
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="relative rounded-[2rem] border border-line bg-card p-6 sm:p-8 md:p-12">
                <AnimatePresence mode="wait">
                  {!isSubmitted ? (
                    <motion.div key="contact-form" initial={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                      <h2 className="font-display text-4xl md:text-5xl text-ink tracking-tight">{t.formTitle}</h2>
                      <p className="text-copy mt-3 mb-10">{t.formText}</p>

                      <form onSubmit={handleSubmit} className="space-y-7" noValidate>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                          <div>
                            <label htmlFor="name" className={LABEL}><span className="text-flame">01</span>{t.name} *</label>
                            <input type="text" id="name" name="name" maxLength={CONTACT_LIMITS.name} autoComplete="name" value={formData.name} onChange={handleInputChange}
                              aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} className={fieldClass(errors.name)} placeholder={t.namePlaceholder} />
                            {error("name", errors.name)}
                          </div>
                          <div>
                            <label htmlFor="email" className={LABEL}><span className="text-flame">02</span>{t.email} *</label>
                            <input type="email" id="email" name="email" maxLength={CONTACT_LIMITS.email} autoComplete="email" value={formData.email} onChange={handleInputChange}
                              aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} className={fieldClass(errors.email)} placeholder={t.emailPlaceholder} />
                            {error("email", errors.email)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                          <div>
                            <label htmlFor="phone" className={LABEL}><span className="text-flame">03</span>{t.phone} <span className="normal-case tracking-normal">{t.optional}</span></label>
                            <input type="tel" id="phone" name="phone" maxLength={CONTACT_LIMITS.phone} autoComplete="tel" value={formData.phone} onChange={handleInputChange}
                              className={fieldClass()} placeholder="+91 98765 43210" />
                          </div>
                          <div>
                            <label htmlFor="inquiryType" className={LABEL}><span className="text-flame">04</span>{t.inquiryType}</label>
                            <div className="relative">
                              <select id="inquiryType" name="inquiryType" value={formData.inquiryType} onChange={handleInputChange} className={`${fieldClass()} appearance-none cursor-pointer pr-10`}>
                                {INQUIRY_TYPES.map((opt) => <option key={opt} value={opt}>{t.inquiryTypes[opt]}</option>)}
                              </select>
                              <Icon name="chevron" className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 text-copy" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="subject" className={LABEL}><span className="text-flame">05</span>{t.subject} *</label>
                          <input type="text" id="subject" name="subject" maxLength={CONTACT_LIMITS.subject} value={formData.subject} onChange={handleInputChange}
                            aria-invalid={!!errors.subject} aria-describedby={errors.subject ? "subject-error" : undefined} className={fieldClass(errors.subject)} placeholder={t.subjectPlaceholder} />
                          {error("subject", errors.subject)}
                        </div>

                        <div>
                          <label htmlFor="message" className={LABEL}><span className="text-flame">06</span>{t.message} *</label>
                          <textarea id="message" name="message" maxLength={CONTACT_LIMITS.message} rows={5} value={formData.message} onChange={handleInputChange}
                            aria-invalid={!!errors.message} aria-describedby={errors.message ? "message-error" : undefined} className={`${fieldClass(errors.message)} resize-none`} placeholder={t.messagePlaceholder} />
                          {error("message", errors.message)}
                        </div>

                        {/* Spam trap: hidden from people and screen readers, so only bots fill it in. */}
                        <div aria-hidden="true" className="absolute -left-[10000px] top-auto w-px h-px overflow-hidden">
                          <label htmlFor="website">Website</label>
                          <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" value={formData.website} onChange={handleInputChange} />
                        </div>

                        {submitError && (
                          <div role="alert" className="rounded-2xl border border-red-700/40 bg-red-700/5 px-4 py-3 text-sm text-red-800">
                            <p className="font-semibold">{SUBMIT_ERRORS[submitError]}</p>
                            <p className="mt-1">
                              {fill(t.fallback, {
                                email: <a href={fallbackEmail} className="underline font-semibold">{t.fallbackEmail}</a>,
                                address: CONTACT_EMAIL,
                                phone: <a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`} className="underline whitespace-nowrap">{CONTACT_PHONE}</a>,
                              })}
                            </p>
                          </div>
                        )}

                        <Button type="submit" disabled={isSubmitting} arrow={!isSubmitting} className="w-full md:w-auto">
                          {isSubmitting ? <span className="inline-flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            {t.sending}
                          </span> : t.send}
                        </Button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div key="contact-success" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: easeOut }}
                      className="py-14 text-center flex flex-col items-center" role="status">
                      <span className="grid place-items-center w-20 h-20 rounded-full border border-mint text-mint mb-8"><Icon name="check" className="w-9 h-9" strokeWidth={1.6} /></span>
                      <h2 className="font-display text-4xl md:text-5xl text-ink mb-4">{t.sentTitle}</h2>
                      <p className="text-copy text-lg max-w-md mx-auto leading-relaxed mb-10">{t.sentText}</p>
                      <Button variant="outline" onClick={() => { setFormData(EMPTY_FORM); setIsSubmitted(false); }}>{t.sendAnother}</Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* How else to reach us, and where we are */}
            <div className="lg:col-span-5 order-1 lg:order-2 space-y-10">
              <Reveal>
                <ul className="border-t border-ink">
                  {quick.map((item) => <li key={item.icon} className="border-b border-line">
                    <a href={item.href} className="group flex items-center gap-5 py-6">
                      <span className="grid place-items-center w-12 h-12 rounded-full border border-line text-flame group-hover:bg-flame group-hover:text-white group-hover:border-flame transition-colors"><Icon name={item.icon} className="w-5 h-5" /></span>
                      <span className="min-w-0">
                        <span className="block label-mono text-copy-dim">{item.label}</span>
                        <span className="block font-display text-xl xl:text-2xl text-ink group-hover:text-flame transition-colors [overflow-wrap:anywhere] mt-1">{item.value}</span>
                      </span>
                    </a>
                  </li>)}
                </ul>
              </Reveal>
              <Reveal delay={0.05}>
                <h3 className="label-mono text-flame">{t.officeTitle}</h3>
                <p className="font-display text-2xl text-ink leading-snug mt-3">Plot no 18, KIADB Industrial Area, 3rd Phase, Obadenahalli, Doddaballapura, Greater Bengaluru - 561 203, Karnataka, India.</p>
                <h3 className="label-mono text-flame mt-8">{t.plantTitle}</h3>
                <p className="text-copy leading-relaxed mt-3">{t.plantText}</p>
              </Reveal>
              {/* The map. The pin underneath shows while it loads (it waits until it's near the screen), so the box is never blank. */}
              <Reveal delay={0.1}>
                <div className="relative w-full aspect-[4/3] rounded-t-full overflow-hidden border border-line bg-card-hi select-none">
                  <div className="absolute inset-0 grid place-items-center text-copy-dim" aria-hidden="true"><Icon name="pin" className="w-12 h-12" /></div>
                  <iframe src="https://maps.google.com/maps?q=13.273301,77.576311+(Chemlife%20Innovations%20Pvt%20Ltd)&z=16&output=embed" width="100%" height="100%" style={{ border: 0 }}
                    allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={t.mapTitle} className="relative w-full h-full" />
                </div>
                <a href="https://www.google.com/maps/search/?api=1&query=13.273301,77.576311" target="_blank" rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 min-h-11 font-semibold text-ink hover:text-flame">
                  {t.openInMaps}<Icon name="arrowUpRight" className="w-4 h-4 text-flame" />
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
