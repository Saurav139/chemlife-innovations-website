"use client";

import Image from "next/image";
import Link from "next/link";
import { Images } from "@/lib/assets";
import { OPEN_CONSENT_EVENT } from "@/lib/analytics";
import { useAnalyticsEnabled } from "@/lib/useAnalyticsEnabled";
import { useHref, useLocale, useT } from "@/i18n/LocaleProvider";

const SOCIAL = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/people/Chemlife-Innovations/100063821717542/",
    icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/chemlifeinnovations",
    icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@chemlifeinnovations2739",
    icon: "M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.5 12 3.5 12 3.5s-7.518 0-9.388.553a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.553 9.388.553 9.388.553s7.518 0 9.388-.553a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
];

const linkClass = "tap-target inline-block py-2.5 md:py-1 text-white/80 hover:text-white transition-colors";

// The page's close: four plain columns on the deep navy, then the name across the full width.
export default function Footer() {
  const analyticsEnabled = useAnalyticsEnabled();
  const t = useT();
  const href = useHref();
  // Links to pages that are only in English say so on translated pages.
  const english = useLocale() === "en" ? "" : ` ${t.footer.englishOnly}`;

  return (
    <footer id="footer" className="field-deep">
      <div className="frame pt-20 md:pt-28">
        <div className="grid grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12">
          <div className="col-span-2 lg:col-span-4">
            <Link href={href("/")} className="inline-block">
              <Image src={Images.branding.logo} alt="ChemLife Innovations" width={120} height={80} className="h-16 w-auto" />
            </Link>
            <p className="mt-6 max-w-sm text-white/80">{t.footer.bio}</p>
            <div className="flex items-center gap-3 mt-6">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-11 h-11 rounded-full bg-white/10 hover:bg-accent flex items-center justify-center transition-colors active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={s.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <nav aria-labelledby="footer-company" className="lg:col-start-6 lg:col-span-2">
            <h2 id="footer-company" className="font-semibold text-white">{t.footer.company}</h2>
            <ul className="mt-3 md:space-y-2">
              {[
                { label: t.footer.home, href: href("/") },
                { label: t.footer.about, href: href("/about") },
                { label: t.footer.careers, href: href("/careers") },
                { label: t.footer.contact, href: href("/contact") },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={linkClass}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-solutions" className="lg:col-span-2">
            <h2 id="footer-solutions" className="font-semibold text-white">{t.footer.solutions}</h2>
            <ul className="mt-3 md:space-y-2">
              {[
                { label: t.footer.additives, href: href("/products") },
                { label: t.footer.research, href: href("/research") },
                { label: t.footer.aiHub + english, href: "/chat" },
                { label: t.footer.articles + english, href: "/insights" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={linkClass}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 lg:col-span-3">
            <h2 className="font-semibold text-white">{t.footer.contactHeading}</h2>
            <address className="not-italic mt-3 text-white/80">
              Plot no 18, KIADB Industrial Area, 3rd Phase, Obadenahalli, Doddaballapura, Greater Bengaluru - 561 203, Karnataka, India.
            </address>
            <a href="tel:+919535862570" className={`${linkClass} mt-2`}>+91 95358 62570</a>
            <br />
            <a href="mailto:innovate@chemlifeinnovations.com" className={`${linkClass} break-all`}>
              innovate@chemlifeinnovations.com
            </a>
          </div>
        </div>

        {/* The name, fitted from margin to margin. */}
        <svg viewBox="0 0 1000 200" className="block w-full mt-20 md:mt-32" aria-hidden="true">
          <text x="0" y="168" textLength="1000" lengthAdjust="spacingAndGlyphs" fill="currentColor" fontSize="220" fontWeight="700" letterSpacing="-6">
            ChemLife
          </text>
        </svg>

        {/* Phones: extra room at the bottom so the chat and search buttons don't cover the last line. */}
        <div className="flex flex-col sm:flex-row justify-between gap-x-6 gap-y-2 pt-6 pb-24 md:pb-8 text-small text-white/80">
          <p>&copy; {new Date().getFullYear()} ChemLife Innovations Pvt Ltd. {t.footer.rights}</p>
          <div className="flex flex-wrap gap-x-6">
            <Link href="/privacy" className="tap-target hover:text-white transition-colors">{t.footer.privacy + english}</Link>
            <Link href="/terms" className="tap-target hover:text-white transition-colors">{t.footer.terms + english}</Link>
            {analyticsEnabled && (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}
                className="tap-target hover:text-white transition-colors cursor-pointer"
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
