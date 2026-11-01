"use client";

import Image from "next/image";
import Link from "next/link";
import { Images } from "@/lib/assets";
import { OPEN_CONSENT_EVENT } from "@/lib/analytics";
import { productPath } from "@/lib/catalog";
import { useAnalyticsEnabled } from "@/lib/useAnalyticsEnabled";
import { useHref, useLocale, useT } from "@/i18n/LocaleProvider";
import Icon from "./site/Icon";

const SOCIAL = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/chemlifeinnovations", d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
  { label: "YouTube", href: "https://www.youtube.com/@chemlifeinnovations2739", d: "M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.5 12 3.5 12 3.5s-7.518 0-9.388.553a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.553 9.388.553 9.388.553s7.518 0 9.388-.553a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
  { label: "Facebook", href: "https://www.facebook.com/people/Chemlife-Innovations/100063821717542/", d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
];
const FLAGSHIP = ["MaxDmold", "FeedGenie Prime", "MinBioZen", "MethioWiz", "CholiWiz", "GroGenie (12% & 60%)"];

function Column({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return <div>
    <h2 className="text-xs font-bold tracking-widest uppercase text-copy-dim">{title}</h2>
    <ul className="mt-4 space-y-1">
      {links.map((link) => <li key={link.label}>
        <Link href={link.href} className="inline-flex items-center min-h-10 md:min-h-0 md:py-1.5 text-[15px] text-ink/90 hover:text-flame transition-colors">{link.label}</Link>
      </li>)}
    </ul>
  </div>;
}

export default function Footer() {
  const analyticsEnabled = useAnalyticsEnabled();
  const t = useT();
  const href = useHref();
  // Links to pages that are only in English say so on translated pages.
  const english = useLocale() === "en" ? "" : ` ${t.footer.englishOnly}`;

  return (
    <footer id="footer" className="site-ui theme-dark relative bg-page text-ink border-t border-line overflow-hidden">
      <div aria-hidden="true" className="absolute -top-40 right-0 w-[600px] h-[400px] rounded-full bg-brand-orange/8 blur-[120px] pointer-events-none" />
      <div className="relative container-site pt-16 md:pt-20 pb-10">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href={href("/")} className="inline-block -ml-1">
              <Image src={Images.branding.logoHorizontalLight} alt="ChemLife Innovations" width={653} height={240} sizes="170px" className="h-14 w-auto" />
            </Link>
            <p className="text-copy text-[15px] leading-relaxed mt-5 max-w-sm">{t.footer.bio}</p>
            <ul className="flex items-center gap-2.5 mt-6">
              {SOCIAL.map((s) => <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="grid place-items-center w-11 h-11 rounded-full border border-line text-ink/90 hover:text-ink hover:border-flame/60 hover:bg-flame/10 transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d={s.d} /></svg>
                </a>
              </li>)}
            </ul>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            <Column title={t.footer.company} links={[
              { label: t.footer.home, href: href("/") },
              { label: t.footer.about, href: href("/about") },
              { label: t.footer.careers, href: href("/careers") },
              { label: t.footer.contact, href: href("/contact") },
            ]} />
            <Column title={t.nav.products} links={[
              ...FLAGSHIP.map((name) => ({ label: name.replace(" (12% & 60%)", ""), href: href(productPath(name)) })),
              { label: t.site.allProducts, href: href("/products") },
            ]} />
            <Column title={t.footer.solutions} links={[
              { label: t.footer.research, href: href("/research") },
              { label: t.footer.aiHub + english, href: "/chat" },
              { label: t.footer.articles + english, href: "/insights" },
            ]} />
            <div className="col-span-2 md:col-span-1">
              <h2 className="text-xs font-bold tracking-widest uppercase text-copy-dim">{t.footer.contactHeading}</h2>
              <ul className="mt-4 space-y-4 text-[15px] text-ink/90">
                <li className="flex gap-3"><Icon name="pin" className="w-5 h-5 shrink-0 text-flame mt-0.5" />
                  <span>Plot no 18, KIADB Industrial Area, 3rd Phase, Obadenahalli, Doddaballapura, Greater Bengaluru - 561 203, Karnataka, India.</span></li>
                <li className="flex gap-3 items-center"><Icon name="phone" className="w-5 h-5 shrink-0 text-flame" />
                  <a href="tel:+919535862570" className="inline-flex items-center min-h-11 -my-2 hover:text-flame">+91 95358 62570</a></li>
                <li className="flex gap-3 items-center"><Icon name="mail" className="w-5 h-5 shrink-0 text-flame" />
                  <a href="mailto:innovate@chemlifeinnovations.com" className="inline-flex items-center min-h-11 -my-2 hover:text-flame break-all">innovate@chemlifeinnovations.com</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Phones: extra room at the bottom so the chat and search buttons don't cover the last line. */}
        <div className="mt-14 pt-6 pb-16 md:pb-0 border-t border-line flex flex-col md:flex-row gap-4 md:items-center justify-between text-sm text-copy-dim">
          <p>&copy; {new Date().getFullYear()} ChemLife Innovations Pvt Ltd. {t.footer.rights}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/privacy" className="tap-target hover:text-ink">{t.footer.privacy + english}</Link>
            <Link href="/terms" className="tap-target hover:text-ink">{t.footer.terms + english}</Link>
            {analyticsEnabled && <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))} className="tap-target hover:text-ink cursor-pointer">{t.footer.cookies}</button>}
          </div>
        </div>
      </div>
    </footer>
  );
}
