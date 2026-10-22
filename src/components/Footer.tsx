"use client";

import Image from "next/image";
import Link from "next/link";
import { Images } from "@/lib/assets";
import { OPEN_CONSENT_EVENT } from "@/lib/analytics";
import { useAnalyticsEnabled } from "@/lib/useAnalyticsEnabled";
import { useHref, useLocale, useT } from "@/i18n/LocaleProvider";

export default function Footer() {
  const analyticsEnabled = useAnalyticsEnabled();
  const t = useT();
  const href = useHref();
  // Links to pages that are only in English say so on translated pages.
  const english = useLocale() === "en" ? "" : ` ${t.footer.englishOnly}`;

  return (
    <footer id="footer" className="relative bg-[#15273F] text-white border-t-2 border-teal-500/20 overflow-hidden">
      {/* Absolute Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Gradient Border Line */}
      <div className="h-1 w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-brand-orange" />

      <div className="max-w-[1200px] mx-auto px-6 py-12 md:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-10 md:gap-12 lg:gap-8">
          
          {/* Brand Bio Column */}
          <div className="col-span-2 md:col-span-1 lg:col-span-4 space-y-6">
            <Link href={href("/")} className="inline-block">
              <Image
                src={Images.branding.logo}
                alt="ChemLife Innovations Logo"
                width={120}
                height={80}
                className="h-16 w-auto rounded-lg shadow-md hover:scale-[1.02] transition-transform duration-350"
              />
            </Link>
            <p className="text-slate-350 text-sm leading-relaxed max-w-sm">
              {t.footer.bio}
            </p>
            {/* Social Media Links */}
            <div className="flex items-center gap-3.5 pt-2">
              <a
                href="https://www.facebook.com/people/Chemlife-Innovations/100063821717542/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 md:w-10 md:h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 hover:bg-brand-orange hover:border-brand-orange hover:scale-105 transition-all duration-350"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/chemlifeinnovations"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 md:w-10 md:h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 hover:bg-brand-orange hover:border-brand-orange hover:scale-105 transition-all duration-350"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@chemlifeinnovations2739"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 md:w-10 md:h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10 hover:bg-brand-orange hover:border-brand-orange hover:scale-105 transition-all duration-350"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.5 12 3.5 12 3.5s-7.518 0-9.388.553a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.553 9.388.553 9.388.553s7.518 0 9.388-.553a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Company Navigation */}
          <div className="lg:col-span-2 space-y-5">
            <h4 className="font-heading text-white text-[15px] font-bold uppercase tracking-wider">
              {t.footer.company}
            </h4>
            <ul className="md:space-y-3">
              {[
                { label: t.footer.home, href: href("/") },
                { label: t.footer.about, href: href("/about") },
                { label: t.footer.careers, href: href("/careers") },
                { label: t.footer.contact, href: href("/contact") },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-350 text-sm hover:text-teal-400 hover:translate-x-1 tap-target inline-block py-3 md:py-0 transition-all duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Solutions & Technology */}
          <div className="lg:col-span-2 space-y-5">
            <h4 className="font-heading text-white text-[15px] font-bold uppercase tracking-wider">
              {t.footer.solutions}
            </h4>
            <ul className="md:space-y-3">
              {[
                { label: t.footer.additives, href: href("/products") },
                { label: t.footer.research, href: href("/research") },
                { label: t.footer.aiHub + english, href: "/chat" },
                { label: t.footer.articles + english, href: "/insights" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-350 text-sm hover:text-teal-400 hover:translate-x-1 tap-target inline-block py-3 md:py-0 transition-all duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Facilities */}
          <div className="col-span-2 md:col-span-1 lg:col-span-4 space-y-5">
            <h4 className="font-heading text-white text-[15px] font-bold uppercase tracking-wider">
              {t.footer.contactHeading}
            </h4>
            <ul className="space-y-4 text-slate-350 text-sm">
              <li className="flex items-start gap-3">
                <svg className="w-4 h-4 mt-1 flex-shrink-0 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span>
                  Plot no 18, KIADB Industrial Area, 3rd Phase, Obadenahalli, Doddaballapura, Greater Bengaluru - 561 203, Karnataka, India.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-4 h-4 flex-shrink-0 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <a href="tel:+919535862570" className="inline-flex items-center min-h-11 -my-2 hover:text-brand-orange transition-colors">+91 95358 62570</a>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-4 h-4 flex-shrink-0 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <a href="mailto:innovate@chemlifeinnovations.com" className="inline-flex items-center min-h-11 -my-2 hover:text-brand-orange transition-colors break-all">
                  innovate@chemlifeinnovations.com
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/5 bg-[#0F1C2E] relative z-10">
        <div className="max-w-[1200px] mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Image
              src={Images.branding.logo}
              alt="ChemLife Innovations Logo"
              width={50}
              height={33}
              className="h-7 w-auto rounded-sm object-contain"
            />
            <p className="text-slate-450 text-xs text-center sm:text-left">
              &copy; {new Date().getFullYear()} ChemLife Innovations Pvt Ltd. {t.footer.rights}
            </p>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="tap-target text-slate-450 text-xs hover:text-brand-orange transition-colors">{t.footer.privacy + english}</Link>
            <Link href="/terms" className="tap-target text-slate-450 text-xs hover:text-brand-orange transition-colors">{t.footer.terms + english}</Link>
            {analyticsEnabled && (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
                className="tap-target text-slate-450 text-xs hover:text-brand-orange transition-colors cursor-pointer"
              >
                {t.footer.cookies}
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
