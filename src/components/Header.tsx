"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "@/context/VariantContext";
import { usePathname } from "next/navigation";
import { Images } from "@/lib/assets";
import { useHref, useLocale, useT } from "@/i18n/LocaleProvider";
import { splitLocale } from "@/i18n/config";
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
  const { theme } = useTheme();
  const t = useT();
  const href = useHref();
  const locale = useLocale();
  // The page's address without its language prefix, to highlight the current page.
  const pathname = splitLocale(usePathname() ?? "/").path;
  const navLinks = NAV.map((link) => ({ label: t.nav[link.key], path: link.href, href: href(link.href) }));
  // Tamil's menu words are the longest: its desktop row is set smaller and closer, and starts at 1280px wide
  // rather than 1024px, where it can't fit beside the logo.
  const compact = locale === "ta";

  // While the phone menu is open it covers the page: the page underneath stops scrolling, and Escape or
  // widening the window to the desktop nav closes it.
  useEffect(() => {
    if (!mobileOpen) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    const desktop = matchMedia(`(min-width: ${compact ? 1280 : 1024}px)`);
    const onWide = () => desktop.matches && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onWide);
    return () => {
      root.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onWide);
    };
  }, [mobileOpen, compact]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full ${mobileOpen ? "z-[55]" : "z-50"} transition-all duration-300 bg-white ${
        scrolled ? "shadow-lg shadow-black/10" : ""
      }`}
    >
      <div className="max-w-[1200px] mx-auto pr-6 pl-2">
        <div className="flex items-center justify-between gap-6 h-20 md:h-24 lg:h-32">
          <a href={href("/")} className="flex-shrink-0">
            <Image
              src={Images.branding.logo}
              alt="ChemLife Innovations"
              width={1021}
              height={1024}
              sizes="(min-width: 1024px) 112px, (min-width: 768px) 80px, 64px"
              loading="eager"
              className="h-16 md:h-20 lg:h-28 w-auto mix-blend-multiply"
            />
          </a>

          <nav className={`hidden items-center ${compact ? "xl:flex gap-3.5" : "lg:flex gap-7 xl:gap-10"}`}>
            {navLinks.map((link) => {
              const isActive =
                pathname === link.path || (pathname.startsWith(link.path) && link.path !== "/");

              return (
                <a
                  key={link.path}
                  href={link.href}
                  className={`${locale === "en" ? "text-[17px] xl:text-[19px]" : compact ? "text-[14px]" : "text-[16px] xl:text-[17px]"} whitespace-nowrap font-semibold transition-colors ${compact ? "" : "tracking-wide"} ${
                    isActive
                      ? "text-brand-orange-aa"
                      : "text-brand-navy hover:text-brand-orange-aa"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
            <LanguageSwitcher />
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            className={`${compact ? "xl:hidden" : "lg:hidden"} flex flex-col items-center justify-center gap-1.5 w-11 h-11 -mr-2.5`}
            aria-label={t.nav.menu}
          >
            <span
              className={`block w-6 h-0.5 transition-all bg-brand-navy ${mobileOpen ? "rotate-45 translate-y-2" : ""}`}
            />
            <span
              className={`block w-6 h-0.5 transition-all bg-brand-navy ${mobileOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-6 h-0.5 transition-all bg-brand-navy ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`}
            />
          </button>
        </div>
      </div>

       {mobileOpen && (
          // Fills the screen below the header (above the chat and search buttons), and scrolls itself if it's taller.
          <div id="mobile-menu" className={`${compact ? "xl:hidden lg:h-[calc(100dvh-8rem)]" : "lg:hidden"} bg-white border-t border-brand-navy/10 h-[calc(100dvh-5rem)] md:h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain`}>
            <div className="max-w-[1200px] mx-auto px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.path || (pathname.startsWith(link.path) && link.path !== "/");

                return (
                  <a
                    key={link.path}
                    href={link.href}
                    className={`flex items-center min-h-11 text-base font-medium ${
                      isActive
                        ? "text-brand-orange-aa"
                        : "text-brand-navy hover:text-brand-orange-aa"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                );
              })}
              <LanguageSwitcher inline />
            </div>
          </div>
        )}
    </header>
  );
}
