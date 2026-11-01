"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Images } from "@/lib/assets";
import { previewsAllowed } from "@/lib/previews";
import { useHref, useT } from "@/i18n/LocaleProvider";
import { splitLocale } from "@/i18n/config";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/contact";
import Icon from "@/components/site/Icon";
import { easeOut } from "@/components/site/ui";
import LanguageSwitcher from "./LanguageSwitcher";

const NAV = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "products", href: "/products" },
  { key: "research", href: "/research" },
  { key: "insights", href: "/insights" },
  { key: "careers", href: "/careers" },
  { key: "contact", href: "/contact" },
] as const;

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useT();
  const href = useHref();
  // The page's address without its language prefix, to highlight the current page.
  const pathname = splitLocale(usePathname() ?? "/").path;
  const navLinks = NAV.map((link) => ({
    label: t.nav[link.key],
    href: href(link.href),
    active: pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href)),
  }));
  // Staging only: a button to the design mock-ups awaiting approval.
  const [showPreviews, setShowPreviews] = useState(false);
  useEffect(() => setShowPreviews(previewsAllowed(location.host)), []);

  // While the phone menu is open it covers the page: the page underneath stops scrolling, and Escape or
  // widening the window to the desktop nav closes it.
  useEffect(() => {
    if (!mobileOpen) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    const desktop = matchMedia("(min-width: 1024px)");
    const onWide = () => desktop.matches && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onWide);
    return () => {
      root.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onWide);
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const contactHref = href("/contact?type=nutritionist");

  return (
    <header className={`site-ui fixed top-0 inset-x-0 ${mobileOpen ? "z-[55]" : "z-50"}`}>
      <div className={`transition-[background-color,box-shadow,backdrop-filter] duration-500 ${scrolled || mobileOpen ? "bg-page/85 backdrop-blur-xl shadow-[0_1px_0_var(--color-line)]" : "bg-transparent"}`}>
        <div className="container-site flex items-center justify-between gap-4 xl:gap-6 h-18 md:h-20">
          <Link href={href("/")} className="shrink-0 -ml-1" onClick={() => setMobileOpen(false)}>
            <Image src={Images.branding.logoHorizontal} alt="ChemLife Innovations" width={653} height={240} loading="eager"
              sizes="(min-width: 768px) 150px, 131px" className="h-12 md:h-[3.4rem] w-auto" />
          </Link>

          <nav aria-label="Main" className="hidden lg:flex items-center gap-0.5 xl:gap-2 rounded-full border border-line bg-card/60 backdrop-blur px-2 py-1.5">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} aria-current={link.active ? "page" : undefined}
                className={`relative whitespace-nowrap rounded-full px-2.5 xl:px-4 py-2 text-[14px] xl:text-[14.5px] font-semibold transition-colors ${link.active ? "bg-ink text-page" : "text-ink/80 hover:text-ink hover:bg-ink/5"}`}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2 xl:gap-3">
            {showPreviews && (
              <a href="/previews" title="Design previews" className="hidden xl:inline-flex label-mono rounded-full border border-dashed border-flame/60 px-3 py-2 text-flame hover:bg-flame hover:text-white transition-colors">Previews</a>
            )}
            <LanguageSwitcher />
            <Link href={contactHref} className="group hidden 2xl:inline-flex items-center gap-2 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white pl-5 pr-1.5 py-1.5 text-[14.5px] font-semibold transition-colors whitespace-nowrap">
              {t.home.talkToNutritionist}
              <span aria-hidden="true" className="grid place-items-center w-8 h-8 rounded-full bg-white/15"><Icon name="arrowUpRight" className="w-4 h-4 transition-transform group-hover:rotate-45" /></span>
            </Link>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} aria-expanded={mobileOpen} aria-controls="mobile-menu" aria-label={t.nav.menu}
            className="lg:hidden grid place-items-center w-12 h-12 -mr-1.5 rounded-full border border-line bg-card/70 text-ink cursor-pointer">
            <span className="relative block w-5 h-3">
              <span className={`absolute left-0 w-5 h-[1.5px] bg-current transition-all duration-300 ${mobileOpen ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 w-5 h-[1.5px] bg-current transition-all duration-300 ${mobileOpen ? "top-1.5 -rotate-45" : "top-3"}`} />
            </span>
          </button>
        </div>
      </div>

      {/* Phones and tablets: the menu fills the screen below the bar, with large numbered links. */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div id="mobile-menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="theme-dark paper lg:hidden bg-page h-[calc(100dvh-4.5rem)] md:h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain">
            <nav aria-label="Main" className="container-site pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col min-h-full">
              <ul>
                {navLinks.map((link, i) => (
                  <motion.li key={link.href} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.04 * i, ease: easeOut }} className="border-b border-line">
                    <Link href={link.href} onClick={() => setMobileOpen(false)} aria-current={link.active ? "page" : undefined}
                      className="flex items-baseline gap-4 py-3.5">
                      <span className="label-mono text-copy-dim w-6">{String(i + 1).padStart(2, "0")}</span>
                      <span className={`font-display text-[2rem] leading-tight ${link.active ? "italic text-flame" : "text-ink"}`}>{link.label}</span>
                    </Link>
                  </motion.li>
                ))}
                {showPreviews && (
                  <li className="border-b border-line">
                    <a href="/previews" onClick={() => setMobileOpen(false)} className="flex items-baseline gap-4 py-3.5">
                      <span className="label-mono text-copy-dim w-6">—</span>
                      <span className="font-display text-[2rem] leading-tight text-flame">Design previews</span>
                    </a>
                  </li>
                )}
              </ul>
              <LanguageSwitcher inline />
              <div className="mt-auto pt-8 space-y-4">
                <Link href={contactHref} onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 min-h-12 rounded-full bg-brand-orange-aa text-white font-semibold">
                  {t.home.talkToNutritionist}<Icon name="arrow" className="w-4 h-4" />
                </Link>
                <p className="label-mono text-copy-dim flex flex-wrap gap-x-5 gap-y-2">
                  <a href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`} className="inline-flex items-center min-h-11">{CONTACT_PHONE}</a>
                  <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center min-h-11 normal-case tracking-normal break-all">{CONTACT_EMAIL}</a>
                </p>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
