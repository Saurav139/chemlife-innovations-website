"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useReportWebVitals } from "next/web-vitals";
import { useT } from "@/i18n/LocaleProvider";
import { GA_ID, OPEN_CONSENT_EVENT, readConsent, saveConsent, track, type Consent } from "@/lib/analytics";

type Metric = Parameters<Parameters<typeof useReportWebVitals>[0]>[0];

const VITALS = new Set(["TTFB", "FCP", "LCP", "CLS", "INP"]);

// Real visitors' Core Web Vitals, one event per metric (named LCP, INP, CLS, ...).
function sendMetric(metric: Metric) {
  track(metric.name, {
    // GA needs whole numbers. CLS is a small decimal, so it's sent ×1000.
    value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
    metric_rating: metric.rating, // good, needs-improvement or poor
    metric_id: metric.id, // ties together the reports from one page load
    non_interaction: true,
  });
}

// Every link and button click as ui_click, and email, phone and WhatsApp links as contact_click.
// Clickable cards that aren't links or buttons carry data-analytics-click (their label), and cards carry
// data-analytics-item (the product or article name) so "Learn More" says which one.
function trackClick(event: MouseEvent) {
  const el = (event.target as Element | null)?.closest?.("a, button, [data-analytics-click]");
  if (!el) return;
  const label = el.getAttribute("aria-label") || el.getAttribute("data-analytics-click") || el.textContent || "";
  const text = label.replace(/\s+/g, " ").trim().slice(0, 100);
  const item = el.closest("[data-analytics-item]")?.getAttribute("data-analytics-item")?.slice(0, 100);
  const href = el.getAttribute("href") ?? "";
  const method = href.startsWith("mailto:") ? "email"
    : href.startsWith("tel:") ? "phone"
    : /wa\.me|whatsapp\.com/.test(href) ? "whatsapp"
    : null;
  if (method) track("contact_click", { method, click_text: text, item });
  else track("ui_click", { click_text: text, link_url: href.slice(0, 100) || undefined, item });
}

// GA sets _ga and _ga_<id> cookies on the site's domain. Clearing them is part of withdrawing consent.
function deleteGaCookies() {
  const domain = location.hostname.replace(/^www\./, "");
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0].trim();
    if (!name.startsWith("_ga")) continue;
    for (const d of ["", `; domain=${domain}`, `; domain=.${domain}`]) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d}`;
    }
  }
}

// Rendered by AnalyticsLoader only when GA_ID is set.
export default function Analytics() {
  const t = useT();
  // undefined until the stored choice is read after hydration, so the server HTML never contains the banner.
  const [consent, setConsent] = useState<Consent | null | undefined>(undefined);
  const pendingVitals = useRef<Metric[]>([]);

  useEffect(() => {
    const stored = readConsent();
    // GA rewrites its cookies as a page unloads, so after a withdrawal they're cleared again here.
    if (stored === "denied") deleteGaCookies();
    setConsent(stored);
    const reopen = () => setConsent(null);
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  // Vitals measured before the visitor accepts stay in this tab and are sent only after Accept.
  const reportVitals = useCallback((metric: Metric) => {
    if (!VITALS.has(metric.name)) return;
    if (window.gtag) sendMetric(metric);
    else if (pendingVitals.current.length < 20) pendingVitals.current.push(metric);
  }, []);
  useReportWebVitals(reportVitals);

  useEffect(() => {
    if (consent !== "granted") return;
    if (!window.gtag) {
      // gtag.js reads this queue when it loads, so calls made before then aren't lost.
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        // gtag.js expects the arguments object itself, not an array.
        window.dataLayer!.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", GA_ID);
      pendingVitals.current.splice(0).forEach(sendMetric);
    }
    // Capture phase, so clicks are seen even where a handler stops propagation.
    document.addEventListener("click", trackClick, true);
    return () => document.removeEventListener("click", trackClick, true);
  }, [consent]);

  const choose = (value: Consent) => {
    const wasGranted = readConsent() === "granted";
    saveConsent(value);
    if (value === "denied" && wasGranted) {
      // gtag.js is already running in this tab. Clearing its cookies and reloading stops it cleanly.
      deleteGaCookies();
      window.location.reload();
      return;
    }
    setConsent(value);
  };

  return (
    <>
      {consent === "granted" && (
        // lazyOnload: fetched once the page has finished loading, so it doesn't compete with the page itself.
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
      )}
      {consent === null && (
        <div
          role="region"
          aria-label={t.common.cookieRegion}
          className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-xl rounded-2xl border border-white/10 bg-brand-navy p-4 text-white shadow-2xl sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5"
        >
          <p className="text-xs leading-relaxed text-white/85 sm:text-sm">
            {t.common.cookieText}{" "}
            <Link href="/privacy" className="underline hover:text-teal-300">
              {t.common.cookiePrivacy}
            </Link>
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => choose("denied")}
              className="min-h-11 flex-1 cursor-pointer rounded-full border border-white/40 px-5 text-sm font-semibold transition-colors hover:bg-white/10 sm:flex-none"
            >
              {t.common.cookieDecline}
            </button>
            <button
              type="button"
              onClick={() => choose("granted")}
              className="min-h-11 flex-1 cursor-pointer rounded-full bg-brand-orange px-5 text-sm font-semibold transition-colors hover:bg-orange-600 sm:flex-none"
            >
              {t.common.cookieAccept}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
