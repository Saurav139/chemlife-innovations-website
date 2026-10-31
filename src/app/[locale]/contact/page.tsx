"use client";

import { Fragment, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import { Images } from "@/lib/assets";
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
  const all = useT();
  const t = all.contact;
  const plantAlts = all.home.howWeDo.steps;
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

  return (
    <VariantProvider>
      <Header />

      <main id="main" tabIndex={-1}>
        <PageHero
          title={`${t.titleStart} ${t.titleAccent} ${t.titleEnd}`}
          intro={t.intro}
          image={Images.process.manufacturingImage}
          imageAlt={t.plantTitle}
        />

        {/* Main Content: Form & Location Details */}
        <section className="section-y">
          <div className="frame">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-16">

              {/* Left Column: Form Card */}
              <Reveal className="lg:col-start-6 lg:col-span-7 lg:row-start-1">
                <div className="bg-surface p-6 md:p-10 relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    {!isSubmitted ? (
                      <motion.div
                        key="contact-form"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h2 className="text-title mb-3">
                          {t.formTitle}
                        </h2>
                        <p className="mb-8">
                          {t.formText}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div>
                              <label htmlFor="name" className="block font-semibold mb-2">
                                {t.name} <span aria-hidden="true">*</span>
                              </label>
                              <input
                                type="text"
                                id="name"
                                name="name"
                                maxLength={CONTACT_LIMITS.name}
                                autoComplete="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`w-full bg-white border ${errors.name ? "border-red-600" : "border-gray-300"
                                  } rounded-xl px-4 py-3.5 text-base text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all`}
                                placeholder={t.namePlaceholder}
                              />
                              {errors.name && (
                                <p className="text-red-700 text-small mt-1.5 font-medium">{errors.name}</p>
                              )}
                            </div>

                            {/* Email Address */}
                            <div>
                              <label htmlFor="email" className="block font-semibold mb-2">
                                {t.email} <span aria-hidden="true">*</span>
                              </label>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                maxLength={CONTACT_LIMITS.email}
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`w-full bg-white border ${errors.email ? "border-red-600" : "border-gray-300"
                                  } rounded-xl px-4 py-3.5 text-base text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all`}
                                placeholder={t.emailPlaceholder}
                              />
                              {errors.email && (
                                <p className="text-red-700 text-small mt-1.5 font-medium">{errors.email}</p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Phone Number */}
                            <div>
                              <label htmlFor="phone" className="block font-semibold mb-2">
                                {t.phone} <span className="text-ink-soft font-normal">{t.optional}</span>
                              </label>
                              <input
                                type="tel"
                                id="phone"
                                name="phone"
                                maxLength={CONTACT_LIMITS.phone}
                                autoComplete="tel"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-base text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all"
                                placeholder="+91 98765 43210"
                              />
                            </div>

                            {/* Inquiry Type */}
                            <div>
                              <label htmlFor="inquiryType" className="block font-semibold mb-2">
                                {t.inquiryType}
                              </label>
                              <div className="relative">
                                <select
                                  id="inquiryType"
                                  name="inquiryType"
                                  value={formData.inquiryType}
                                  onChange={handleInputChange}
                                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-base text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all appearance-none cursor-pointer"
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
                            <label htmlFor="subject" className="block font-semibold mb-2">
                              {t.subject} <span aria-hidden="true">*</span>
                            </label>
                            <input
                              type="text"
                              id="subject"
                              name="subject"
                              maxLength={CONTACT_LIMITS.subject}
                              value={formData.subject}
                              onChange={handleInputChange}
                              className={`w-full bg-white border ${errors.subject ? "border-red-600" : "border-gray-300"
                                } rounded-xl px-4 py-3.5 text-base text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all`}
                              placeholder={t.subjectPlaceholder}
                            />
                            {errors.subject && (
                              <p className="text-red-700 text-small mt-1.5 font-medium">{errors.subject}</p>
                            )}
                          </div>

                          {/* Message */}
                          <div>
                            <label htmlFor="message" className="block font-semibold mb-2">
                              {t.message} <span aria-hidden="true">*</span>
                            </label>
                            <textarea
                              id="message"
                              name="message"
                              maxLength={CONTACT_LIMITS.message}
                              rows={5}
                              value={formData.message}
                              onChange={handleInputChange}
                              className={`w-full bg-white border ${errors.message ? "border-red-600" : "border-gray-300"
                                } rounded-xl px-4 py-3.5 text-base text-ink focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all resize-none`}
                              placeholder={t.messagePlaceholder}
                            />
                            {errors.message && (
                              <p className="text-red-700 text-small mt-1.5 font-medium">{errors.message}</p>
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

                          {submitError && (
                            <div role="alert" className="bg-red-50 px-4 py-3 text-red-800">
                              <p className="font-semibold">{SUBMIT_ERRORS[submitError]}</p>
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
                            </div>
                          )}

                          {/* Submit Button */}
                          <div className="pt-2">
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="btn btn-primary w-full md:w-auto"
                            >
                              {isSubmitting ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  {t.sending}
                                </>
                              ) : (
                                t.send
                              )}
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="contact-success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, ease: easeOut }}
                        className="py-12 text-center flex flex-col items-center"
                      >
                        {/* Animated Checkmark */}
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-ink mb-6">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h2 className="text-title mb-4">
                          {t.sentTitle}
                        </h2>
                        <p className="max-w-md mx-auto mb-8">
                          {t.sentText}
                        </p>
                        <button
                          onClick={() => {
                            setFormData(EMPTY_FORM);
                            setIsSubmitted(false);
                          }}
                          className="btn btn-ink"
                        >
                          {t.sendAnother}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>

              {/* Right Column: Address & Map Details */}
              <Reveal order={1} className="lg:col-span-4 lg:row-start-1 flex flex-col gap-8">

                {/* Office Info Card */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lead font-bold mb-3">
                      {t.officeTitle}
                    </h2>
                    <address className="not-italic mb-3">
                      Plot no 18, KIADB Industrial Area, 3rd Phase, Obadenahalli, Doddaballapura, Greater Bengaluru - 561 203, Karnataka, India.
                    </address>
                    <div>
                      <div className="flex items-center gap-3">
                        <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a href="tel:+919535862570" className="inline-flex items-center min-h-11 -my-1.5 link">+91 95358 62570</a>
                      </div>
                      <div className="flex items-center gap-3">
                        <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <a href="mailto:innovate@chemlifeinnovations.com" className="inline-flex items-center min-h-11 -my-1.5 link break-all">innovate@chemlifeinnovations.com</a>
                      </div>
                    </div>
                  </div>

                  {/* Manufacturing & R&D Highlight */}
                  <div>
                    <h2 className="text-lead font-bold mb-2">
                      {t.plantTitle}
                    </h2>
                    <p>
                      {t.plantText}
                    </p>
                  </div>
                </div>

                {/* Google Maps Embed Container. The pin underneath shows while the map loads (it waits until it's near
                    the screen), so the box is never blank. */}
                <div className="relative w-full aspect-[4/3] md:aspect-[16/9] lg:aspect-[4/5] overflow-hidden bg-surface select-none">
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
                  className="-mt-5 inline-flex items-center gap-1.5 min-h-11 link self-start"
                >
                  {t.openInMaps}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5h5v5M19 5l-8 8M10 6H6a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4" />
                  </svg>
                </a>

              </Reveal>

            </div>
            {/* The plant: its laboratory, production floor and warehouse, butted together */}
            <div className="grid grid-cols-3 mt-16 md:mt-24">
              {[Images.process.researchImage, Images.process.manufacturingImage, Images.process.delivery].map((src, i) => (
                <Reveal key={src} order={i} className="relative aspect-[4/3] overflow-hidden bg-surface">
                  <Image src={src} alt={plantAlts[[0, 2, 3][i]].alt} fill sizes="(min-width: 1200px) 384px, 33vw" className="object-cover" />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
