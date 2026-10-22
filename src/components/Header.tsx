"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "@/context/VariantContext";
import { usePathname } from "next/navigation";
import { Images } from "@/lib/assets";
import { previewsAllowed } from "@/lib/previews";
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
  // Staging only: a button to the design mock-ups awaiting approval.
  const [showPreviews, setShowPreviews] = useState(false);
  useEffect(() => setShowPreviews(previewsAllowed(location.host)), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-white ${
        scrolled ? "shadow-lg shadow-black/10" : ""
      }`}
    >
      <div className="max-w-[1200px] mx-auto pr-6 pl-2">
        <div className="flex items-center justify-between gap-6 h-18 md:h-20 lg:h-24">
          <a href={href("/")} className="flex-shrink-0">
            <Image
              src={Images.branding.logoHorizontal}
              alt="ChemLife Innovations"
              width={653}
              height={240}
              sizes="174px"
              loading="eager"
              className="h-12 md:h-14 xl:h-16 w-auto"
            />
          </a>

          <nav className={`hidden lg:flex items-center ${showPreviews ? "gap-3 xl:gap-7" : "gap-7 xl:gap-10"}`}>
            {navLinks.map((link) => {
              const isActive =
                pathname === link.path || (pathname.startsWith(link.path) && link.path !== "/");

              return (
                <a
                  key={link.path}
                  href={link.href}
                  className={`${locale === "en" ? "text-[17px] xl:text-[19px]" : "text-[16px] xl:text-[17px]"} whitespace-nowrap font-semibold transition-colors tracking-wide ${
                    isActive
                      ? "text-brand-orange-dark"
                      : "text-brand-navy hover:text-brand-orange-dark"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
            {showPreviews && (
              <a
                href="/previews"
                title="Design previews"
                className="shrink-0 whitespace-nowrap rounded-full border-2 border-brand-orange-dark px-3 py-1 text-[14px] font-semibold text-brand-orange-dark transition-colors hover:bg-brand-orange-dark hover:text-white"
              >
                Previews
              </a>
            )}
            <LanguageSwitcher />
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex flex-col gap-1.5 p-2"
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
          <div className="lg:hidden bg-white border-t border-brand-navy/10 shadow-xl">
            <div className="px-6 py-4 space-y-2 max-h-[calc(100dvh-4.5rem)] md:max-h-[calc(100dvh-5rem)] overflow-y-auto">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.path || (pathname.startsWith(link.path) && link.path !== "/");

                return (
                  <a
                    key={link.path}
                    href={link.href}
                    className={`block py-1 text-base font-medium ${
                      isActive
                        ? "text-brand-orange-dark"
                        : "text-brand-navy hover:text-brand-orange-dark"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                );
              })}
              {showPreviews && (
                <a href="/previews" className="block py-1 text-base font-semibold text-brand-orange-dark" onClick={() => setMobileOpen(false)}>
                  Design previews
                </a>
              )}
              <LanguageSwitcher inline />
            </div>
          </div>
        )}
    </header>
  );
}
