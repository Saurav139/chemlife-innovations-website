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

const easeOut = [0.25, 0.1, 0, 1] as const;

interface FormData {
  name: string;
  email: string;
  phone: string;
  inquiryType: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    inquiryType: "General Inquiry",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const inquiryOptions = [
    "General Inquiry",
    "Talk to a Nutritionist",
    "Product Sales & Distribution",
    "Technical & R&D Partnership",
    "Advisory Services & Careers",
  ];

  // Pre-fill the form when a call to action links here, e.g. /contact?type=nutritionist from the homepage hero
  useEffect(() => {
    const type = new URLSearchParams(window.location.search).get("type");
    if (type === "nutritionist") {
      setFormData((prev) => ({
        ...prev,
        inquiryType: "Talk to a Nutritionist",
        subject: prev.subject || "I'd like to talk to a nutritionist",
      }));
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message content is required.";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <VariantProvider>
      <Header />

      <main className="bg-white min-h-screen text-brand-navy">
        {/* Contact Hero Section */}
        <SectionWrapper className="pt-32 pb-24 lg:pt-40 lg:pb-32 text-white relative overflow-hidden bg-brand-navy flex items-center">
          <div className="absolute inset-0 z-0">
            <Image
              src={Images.heroes.contact}
              alt="Scientific consulting and support contact background"
              fill
              className="object-cover opacity-65"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/60 to-brand-navy/35" />
            <div className="absolute inset-0 bg-black/10" />
          </div>

          <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full text-left">
            <span className="text-teal-400 text-sm font-semibold tracking-widest uppercase block mb-3">
              Contact Us
            </span>
            <h1 className="font-heading text-4xl lg:text-6xl font-bold leading-tight mb-4 text-white max-w-4xl">
              Let&apos;s <span className="text-teal-400">innovate</span> together
            </h1>
            <p className="text-white/85 text-lg lg:text-xl leading-relaxed max-w-3xl font-light">
              Have questions about our nature-driven functional feed additives or looking for a distribution partnership? Reach out to our team of experts.
            </p>
          </div>
        </SectionWrapper>

        {/* Main Content: Form & Location Details */}
        <SectionWrapper className="py-24 bg-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

              {/* Left Column: Form Card */}
              <div className="lg:col-span-7">
                <div className="bg-gray-55 border border-gray-250 rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    {!isSubmitted ? (
                      <motion.div
                        key="contact-form"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-navy mb-2">
                          Send a Message
                        </h2>
                        <p className="text-gray-500 text-sm mb-8">
                          Fill out the form below and a ChemLife representative will get back to you shortly.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div>
                              <label htmlFor="name" className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
                                Full Name <span className="text-teal-600">*</span>
                              </label>
                              <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`w-full bg-white border ${errors.name ? "border-red-500" : "border-gray-250"
                                  } rounded-xl px-4 py-3.5 text-sm text-brand-navy focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all`}
                                placeholder="Your full name"
                              />
                              {errors.name && (
                                <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</p>
                              )}
                            </div>

                            {/* Email Address */}
                            <div>
                              <label htmlFor="email" className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
                                Email Address <span className="text-teal-600">*</span>
                              </label>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`w-full bg-white border ${errors.email ? "border-red-500" : "border-gray-250"
                                  } rounded-xl px-4 py-3.5 text-sm text-brand-navy focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all`}
                                placeholder="name@company.com"
                              />
                              {errors.email && (
                                <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email}</p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Phone Number */}
                            <div>
                              <label htmlFor="phone" className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
                                Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
                              </label>
                              <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full bg-white border border-gray-250 rounded-xl px-4 py-3.5 text-sm text-brand-navy focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                                placeholder="+91 98765 43210"
                              />
                            </div>

                            {/* Inquiry Type */}
                            <div>
                              <label htmlFor="inquiryType" className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
                                Inquiry Type
                              </label>
                              <div className="relative">
                                <select
                                  id="inquiryType"
                                  name="inquiryType"
                                  value={formData.inquiryType}
                                  onChange={handleInputChange}
                                  className="w-full bg-white border border-gray-250 rounded-xl px-4 py-3.5 text-sm text-brand-navy focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all appearance-none cursor-pointer"
                                >
                                  {inquiryOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
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
                              Subject <span className="text-teal-600">*</span>
                            </label>
                            <input
                              type="text"
                              id="subject"
                              name="subject"
                              value={formData.subject}
                              onChange={handleInputChange}
                              className={`w-full bg-white border ${errors.subject ? "border-red-500" : "border-gray-250"
                                } rounded-xl px-4 py-3.5 text-sm text-brand-navy focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all`}
                              placeholder="What is this regarding?"
                            />
                            {errors.subject && (
                              <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.subject}</p>
                            )}
                          </div>

                          {/* Message */}
                          <div>
                            <label htmlFor="message" className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-2">
                              Message <span className="text-teal-600">*</span>
                            </label>
                            <textarea
                              id="message"
                              name="message"
                              rows={5}
                              value={formData.message}
                              onChange={handleInputChange}
                              className={`w-full bg-white border ${errors.message ? "border-red-500" : "border-gray-250"
                                } rounded-xl px-4 py-3.5 text-sm text-brand-navy focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all resize-none`}
                              placeholder="Tell us details about your request..."
                            />
                            {errors.message && (
                              <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.message}</p>
                            )}
                          </div>

                          {/* Submit Button */}
                          <div className="pt-2">
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="w-full md:w-auto px-8 py-3.5 bg-brand-navy text-white font-bold text-sm rounded-full hover:bg-teal-600 focus:outline-none transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-400"
                            >
                              {isSubmitting ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  Sending Message...
                                </>
                              ) : (
                                "Send Message"
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
                        <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 mb-6 border border-teal-100">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-navy mb-4">
                          Message Sent!
                        </h2>
                        <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed mb-8">
                          Thank you for reaching out to ChemLife Innovations. Our team will review your inquiry and get back to you within 24 to 48 hours.
                        </p>
                        <button
                          onClick={() => {
                            setFormData({
                              name: "",
                              email: "",
                              phone: "",
                              inquiryType: "General Inquiry",
                              subject: "",
                              message: "",
                            });
                            setIsSubmitted(false);
                          }}
                          className="px-6 py-2.5 bg-gray-150 text-gray-700 hover:bg-gray-200 transition-colors font-bold text-xs rounded-full cursor-pointer"
                        >
                          Send Another Message
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
                      Corporate Office
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">
                      Plot no 18, KIADB Industrial Area, 3rd Phase, Obadenahalli, Doddaballapura, Greater Bengaluru - 561 203, Karnataka, India.
                    </p>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3 text-gray-500">
                        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a href="tel:+919535862570" className="hover:text-teal-600 transition-colors">+91 95358 62570</a>
                      </div>
                      <div className="flex items-center gap-3 text-gray-500">
                        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <a href="mailto:innovate@chemlifeinnovations.com" className="hover:text-teal-600 transition-colors break-all">innovate@chemlifeinnovations.com</a>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  {/* Manufacturing & R&D Highlight */}
                  <div>
                    <h3 className="font-heading text-lg font-bold text-brand-navy mb-2">
                      R&D and Production Plant
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Our state-of-the-art facility integrates biological research labs and automated manufacturing systems to safely develop and formulate premium nature-driven feed ingredients.
                    </p>
                  </div>
                </div>

                {/* Google Maps Embed Container */}
                <div className="relative w-full aspect-[4/3] md:aspect-[16/9] lg:aspect-[4/3] rounded-3xl overflow-hidden border border-gray-200 shadow-sm bg-gray-55 select-none">
                  <iframe
                    src="https://maps.google.com/maps?q=13.273301,77.576311+(Chemlife%20Innovations%20Pvt%20Ltd)&z=16&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="ChemLife Corporate Office Location Map"
                    className="w-full h-full opacity-90 hover:opacity-100 transition-opacity duration-300"
                  />
                </div>

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
