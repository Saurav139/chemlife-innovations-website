"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Images } from "@/lib/assets";
import { OPEN_CONSENT_EVENT } from "@/lib/analytics";
import { useAnalyticsEnabled } from "@/lib/useAnalyticsEnabled";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/contact";
import { splitLocale } from "@/i18n/config";
import { useHref, useLocale, useT } from "@/i18n/LocaleProvider";
import Icon from "@/components/site/Icon";
import { Accented, Button, Reveal } from "@/components/site/ui";

const SOCIALS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/chemlifeinnovations", d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" },
  { label: "YouTube", href: "https://www.youtube.com/@chemlifeinnovations2739", d: "M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.5 12 3.5 12 3.5s-7.518 0-9.388.553a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.553 9.388.553 9.388.553s7.518 0 9.388-.553a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
  { label: "Facebook", href: "https://www.facebook.com/people/Chemlife-Innovations/100063821717542/", d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
];

const ADDRESS = "Plot no 18, KIADB Industrial Area, 3rd Phase, Obadenahalli, Doddaballapura, Greater Bengaluru - 561 203, Karnataka, India.";

export default function Footer() {
  const analyticsEnabled = useAnalyticsEnabled();
  const t = useT();
  const href = useHref();
  // Links to pages that are only in English say so on translated pages.
  const english = useLocale() === "en" ? "" : ` ${t.footer.englishOnly}`;
  // The contact page already is the call to action.
  const onContact = splitLocale(usePathname() ?? "/").path.startsWith("/contact");
  const c = t.contact;

  const columns = [
    { title: t.footer.company, links: [
      { label: t.footer.home, href: href("/") },
      { label: t.footer.about, href: href("/about") },
      { label: t.footer.careers, href: href("/careers") },
      { label: t.footer.contact, href: href("/contact") },
    ] },
    { title: t.footer.solutions, links: [
      { label: t.footer.additives, href: href("/products") },
      { label: t.footer.research, href: href("/research") },
      { label: t.footer.aiHub + english, href: "/chat" },
      { label: t.footer.articles + english, href: "/insights" },
    ] },
  ];

  return (
    <footer id="footer" className="site-ui theme-dark paper relative bg-page text-copy overflow-hidden">
      {!onContact && (
        <div className="container-site pt-20 md:pt-28">
          <Reveal className="grid lg:grid-cols-12 gap-8 items-end pb-16 md:pb-20 border-b border-line">
            <div className="lg:col-span-8">
              <p className="label-mono text-copy-dim flex items-center gap-3"><span aria-hidden="true" className="h-px w-8 bg-current opacity-50" />{c.kicker}</p>
              <h2 className="font-display text-5xl sm:text-6xl lg:text-[6.5rem] leading-[0.95] tracking-[-0.03em] text-ink mt-6">
                <Accented text={`${c.titleStart} *${c.titleAccent}* ${c.titleEnd}`} />
              </h2>
            </div>
            <div className="lg:col-span-4">
              <p className="text-copy text-lg leading-relaxed">{c.intro}</p>
              <div className="flex flex-wrap gap-3 mt-7">
                <Button href={href("/contact?type=nutritionist")} arrow>{t.home.talkToNutritionist}</Button>
                <Button href={href("/contact")} variant="outline">{c.formTitle}</Button>
              </div>
            </div>
          </Reveal>
        </div>
      )}

      <div className="container-site py-14 md:py-16 grid grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-12">
        <div className="col-span-2 lg:col-span-4">
          <Link href={href("/")} className="inline-block">
            <Image src={Images.branding.logoHorizontalLight} alt="ChemLife Innovations" width={653} height={240} sizes="160px" className="h-14 w-auto" />
          </Link>
          <p className="text-copy-dim leading-relaxed mt-5 max-w-sm">{t.footer.bio}</p>
          <ul className="flex gap-2 mt-6">
            {SOCIALS.map((social) => <li key={social.label}>
              <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}
                className="grid place-items-center w-11 h-11 rounded-full border border-line text-ink hover:bg-flame hover:border-flame hover:text-[#13233a] transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d={social.d} /></svg>
              </a>
            </li>)}
          </ul>
        </div>

        {columns.map((column) => <div key={column.title} className="lg:col-span-2">
          <h2 className="label-mono text-copy-dim">{column.title}</h2>
          <ul className="mt-4 md:space-y-1">
            {column.links.map((link) => <li key={link.label}>
              <Link href={link.href} className="inline-flex items-center min-h-11 md:min-h-9 text-ink/90 hover:text-flame transition-colors">{link.label}</Link>
            </li>)}
          </ul>
        </div>)}

        <div className="col-span-2 lg:col-span-4">
          <h2 className="label-mono text-copy-dim">{t.footer.contactHeading}</h2>
          <ul className="mt-5 space-y-4">
            <li className="flex gap-3 text-copy leading-relaxed"><Icon name="pin" className="w-5 h-5 mt-0.5 text-flame shrink-0" />{ADDRESS}</li>
            <li><a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`} className="flex items-center gap-3 min-h-11 -my-2 text-ink hover:text-flame transition-colors"><Icon name="phone" className="w-5 h-5 text-flame" />{CONTACT_PHONE}</a></li>
            <li><a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-3 min-h-11 -my-2 text-ink hover:text-flame transition-colors break-all"><Icon name="mail" className="w-5 h-5 text-flame shrink-0" />{CONTACT_EMAIL}</a></li>
          </ul>
        </div>
      </div>

      {/* The name, set very large across the bottom. Decorative: the logo above says it already. */}
      <div aria-hidden="true" className="container-site select-none">
        <svg viewBox="0 0 1000 190" className="w-full h-auto">
          <text x="500" y="160" textAnchor="middle" textLength="990" lengthAdjust="spacingAndGlyphs"
            className="font-display" style={{ fontSize: 210, letterSpacing: "-0.03em" }} fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1.2">ChemLife</text>
        </svg>
      </div>

      {/* Phones: extra room at the bottom so the chat and search buttons don't cover the last line. */}
      <div className="border-t border-line">
        <div className="container-site pt-6 pb-24 md:pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="label-mono text-copy-dim normal-case tracking-normal text-[13px]">&copy; {new Date().getFullYear()} ChemLife Innovations Pvt Ltd. {t.footer.rights}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
            <Link href="/privacy" className="inline-flex items-center min-h-11 text-copy-dim hover:text-ink">{t.footer.privacy + english}</Link>
            <Link href="/terms" className="inline-flex items-center min-h-11 text-copy-dim hover:text-ink">{t.footer.terms + english}</Link>
            {analyticsEnabled && (
              <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))} className="inline-flex items-center min-h-11 text-copy-dim hover:text-ink cursor-pointer">{t.footer.cookies}</button>
            )}
            <a href="#main" className="inline-flex items-center gap-2 min-h-11 text-ink hover:text-flame">{t.ui.backToTop}<Icon name="arrow" className="w-4 h-4 -rotate-90" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
