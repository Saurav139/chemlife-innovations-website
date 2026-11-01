"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Images } from "@/lib/assets";
import { PRODUCTS, productPath } from "@/lib/catalog";
import { previewsAllowed } from "@/lib/previews";
import { useHref, useLocale, useT } from "@/i18n/LocaleProvider";
import { splitLocale } from "@/i18n/config";
import LanguageSwitcher from "./LanguageSwitcher";
import Icon from "./site/Icon";

// Home is the logo; Products opens a menu of every product by species.
const NAV = [
  { key: "products", href: "/products" },
  { key: "research", href: "/research" },
  { key: "about", href: "/about" },
  { key: "insights", href: "/insights" },
  { key: "careers", href: "/careers" },
  { key: "contact", href: "/contact" },
] as const;

const CATEGORY_ICON = { "Mono-gastric": "chick", Ruminants: "cow", "Value Addition": "layers" } as const;

/** The products menu: every product, grouped by the animals it's for. */
function ProductsMenu({ onNavigate }: { onNavigate: () => void }) {
  const t = useT();
  const href = useHref();
  const categories = Object.keys(t.products.categories) as (keyof typeof t.products.categories)[];
  return <div className="grid grid-cols-[17rem_1fr] gap-0 overflow-hidden rounded-2xl border border-line bg-page-alt/95 backdrop-blur-xl shadow-2xl shadow-ink/10">
    <div className="bg-card p-6 flex flex-col">
      <p className="font-heading text-lg font-bold text-ink leading-snug">{t.site.menuProducts}</p>
      <p className="text-sm text-copy mt-2">{t.products.intro}</p>
      <a href={href("/products")} onClick={onNavigate} className="mt-auto pt-6 inline-flex items-center gap-2 text-sm font-semibold text-flame hover:text-ink">
        {t.site.allProducts} <Icon name="arrow" className="w-4 h-4" />
      </a>
    </div>
    <div className="grid grid-cols-3 gap-6 p-6">
      {categories.map((category) => <div key={category}>
        <p className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-copy-dim mb-3">
          <Icon name={CATEGORY_ICON[category]} className="w-4 h-4 text-mint" />{t.products.categories[category]}
        </p>
        <ul className="space-y-0.5">
          {PRODUCTS.filter((p) => p.category === category).map((p) => <li key={p.id}>
            <a href={href(productPath(p.name))} onClick={onNavigate} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 -mx-2 text-[15px] text-ink/90 hover:bg-ink/5 hover:text-flame transition-colors">
              <Image src={p.icon} alt="" width={22} height={22} className="rounded-full bg-white" />{p.name}
            </a>
          </li>)}
        </ul>
      </div>)}
    </div>
  </div>;
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useT();
  const href = useHref();
  const locale = useLocale();
  const menuRef = useRef<HTMLLIElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  // The page's address without its language prefix, to highlight the current page.
  const pathname = splitLocale(usePathname() ?? "/").path;
  const navLinks = NAV.map((link) => ({ key: link.key, label: t.nav[link.key], path: link.href, href: href(link.href) }));
  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);
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

  // The products menu closes on Escape or a click elsewhere.
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hovering opens the menu on desktop; a short delay stops it closing while the pointer crosses the gap.
  const hoverOpen = () => { window.clearTimeout(closeTimer.current); setMenuOpen(true); };
  const hoverClose = () => { closeTimer.current = window.setTimeout(() => setMenuOpen(false), 150); };
  const linkSize = locale === "en" ? "text-[15px] xl:text-base" : "text-[14px] xl:text-[15px]";

  return (
    <header className={`site-ui fixed top-0 left-0 w-full ${mobileOpen ? "z-[55]" : "z-50"}`}>
      {/* Desktop: the announcement bar; with the nav below it, the header is 6rem tall, as before. */}
      <div className="theme-dark hidden lg:block h-9 bg-gradient-to-r from-brand-navy via-[#22406a] to-brand-navy text-[13px]">
        <div className="container-site h-full flex items-center justify-center gap-3 text-ink/85">
          <span>{t.site.bar}</span>
          <a href={href("/products")} className="inline-flex items-center gap-1 font-semibold text-ink hover:text-flame">
            {t.site.barLink} <Icon name="arrow" className="w-3.5 h-3.5" strokeWidth={2.2} />
          </a>
        </div>
      </div>

      <div className={`transition-colors duration-300 ${scrolled || mobileOpen ? "bg-page/95 backdrop-blur-xl border-b border-line shadow-sm shadow-ink/5" : "bg-page/80 backdrop-blur-md border-b border-transparent"}`}>
        <div className="container-site flex items-center justify-between gap-6 h-18 md:h-20 lg:h-15">
          <a href={href("/")} className="flex-shrink-0 -ml-1" aria-label="ChemLife Innovations, home">
            <Image src={Images.branding.logoHorizontal} alt="ChemLife Innovations" width={653} height={240} sizes="150px" loading="eager" className="h-11 md:h-12 lg:h-11 w-auto" />
          </a>

          <nav aria-label={t.nav.menu} className="hidden lg:block">
            <ul className={`flex items-center ${showPreviews ? "gap-4 xl:gap-6" : "gap-6 xl:gap-8"}`}>
              {navLinks.map((link) => link.key === "products"
                ? <li key={link.key} ref={menuRef} className="relative" onMouseEnter={hoverOpen} onMouseLeave={hoverClose}>
                  <button type="button" aria-expanded={menuOpen} aria-controls="products-menu" onClick={() => setMenuOpen((o) => !o)}
                    className={`flex items-center gap-1 ${linkSize} font-semibold whitespace-nowrap transition-colors cursor-pointer ${isActive(link.path) || menuOpen ? "text-ink" : "text-ink/90 hover:text-ink"}`}>
                    {link.label}<Icon name="chevron" className={`w-4 h-4 transition-transform ${menuOpen ? "rotate-180" : ""}`} strokeWidth={2.2} />
                  </button>
                  {menuOpen && <div id="products-menu" className="absolute left-1/2 -translate-x-[38%] top-full pt-4 w-[860px]">
                    <ProductsMenu onNavigate={() => setMenuOpen(false)} />
                  </div>}
                </li>
                : <li key={link.key}>
                  <a href={link.href} aria-current={isActive(link.path) ? "page" : undefined}
                    className={`${linkSize} font-semibold whitespace-nowrap transition-colors ${isActive(link.path) ? "text-flame" : "text-ink/90 hover:text-ink"}`}>{link.label}</a>
                </li>)}
            </ul>
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            {showPreviews && <a href="/previews" title="Design previews" className="whitespace-nowrap rounded-full border border-flame/60 px-3 py-1 text-[13px] font-semibold text-flame hover:bg-flame/10">Previews</a>}
            <LanguageSwitcher />
            <a href={href("/contact")} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover px-5 py-2.5 text-[15px] font-semibold text-white transition-colors">
              {t.site.talk}<Icon name="arrow" className="w-4 h-4" strokeWidth={2.2} />
            </a>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} aria-expanded={mobileOpen} aria-controls="mobile-menu" aria-label={t.nav.menu}
            className="lg:hidden grid place-items-center w-11 h-11 -mr-2 rounded-full text-ink hover:bg-ink/10">
            <Icon name={mobileOpen ? "close" : "menu"} className="w-6 h-6" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        // Fills the screen below the header, and scrolls itself if it's taller.
        <div id="mobile-menu" className="lg:hidden bg-page h-[calc(100dvh-4.5rem)] md:h-[calc(100dvh-5rem)] overflow-y-auto overscroll-contain">
          <div className="container-site py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <ul className="divide-y divide-line">
              {[{ key: "home", label: t.nav.home, path: "/", href: href("/") }, ...navLinks].map((link) => <li key={link.key}>
                <a href={link.href} onClick={() => setMobileOpen(false)} aria-current={(link.path === "/" ? pathname === "/" : isActive(link.path)) ? "page" : undefined}
                  className={`flex items-center justify-between min-h-14 font-heading text-xl font-semibold ${(link.path === "/" ? pathname === "/" : isActive(link.path)) ? "text-flame" : "text-ink"}`}>
                  {link.label}<Icon name="arrow" className="w-5 h-5 text-copy-dim" />
                </a>
              </li>)}
              {showPreviews && <li><a href="/previews" onClick={() => setMobileOpen(false)} className="flex items-center min-h-14 font-heading text-xl font-semibold text-flame">Design previews</a></li>}
            </ul>
            <a href={href("/contact")} onClick={() => setMobileOpen(false)} className="mt-6 flex items-center justify-center gap-2 min-h-12 rounded-full bg-brand-orange-aa font-semibold text-white">
              {t.site.talk}<Icon name="arrow" className="w-4 h-4" />
            </a>
            <LanguageSwitcher inline />
          </div>
        </div>
      )}
    </header>
  );
}
