"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "@/context/VariantContext";
import { usePathname } from "next/navigation";
import { Images } from "@/lib/assets";
import { previewsAllowed } from "@/lib/previews";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Research", href: "/research" },
  { label: "Insights", href: "/insights" },
  { label: "Careers", href: "/careers" },
  { label: "Contact Us", href: "/contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme } = useTheme();
  const pathname = usePathname();
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
        <div className="flex items-center justify-between h-32">
          <a href="/" className="flex-shrink-0">
            <Image
              src={Images.branding.logo}
              alt="ChemLife Innovations"
              width={112}
              height={112}
              sizes="112px"
              loading="eager"
              className="h-28 w-auto"
            />
          </a>

          <nav className={`hidden lg:flex items-center ${showPreviews ? "gap-6 xl:gap-10" : "gap-10"}`}>
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (pathname && pathname.startsWith(link.href) && link.href !== "/");

              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`text-[19px] font-semibold transition-colors tracking-wide ${
                    isActive
                      ? "text-brand-orange"
                      : "text-brand-navy hover:text-brand-orange"
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
            {showPreviews && (
              <a
                href="/previews"
                className="shrink-0 whitespace-nowrap rounded-full border-2 border-brand-orange px-4 py-1.5 text-[15px] font-semibold text-brand-orange transition-colors hover:bg-brand-orange hover:text-white"
              >
                Design previews
              </a>
            )}
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex flex-col gap-1.5 p-2"
            aria-label="Toggle menu"
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
            <div className="px-6 py-4 space-y-3">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (pathname && pathname.startsWith(link.href) && link.href !== "/");

                return (
                  <a
                    key={link.label}
                    href={link.href}
                    className={`block text-sm font-medium ${
                      isActive
                        ? "text-brand-orange"
                        : "text-brand-navy hover:text-brand-orange"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                );
              })}
              {showPreviews && (
                <a href="/previews" className="block text-sm font-semibold text-brand-orange" onClick={() => setMobileOpen(false)}>
                  Design previews
                </a>
              )}
            </div>
          </div>
        )}
    </header>
  );
}
