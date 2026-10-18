// Google Analytics 4. It loads only after the visitor accepts the cookie banner (src/components/Analytics.tsx).

// GA4 Measurement ID, e.g. "G-XXXXXXXXXX". It's public (it appears in every page), so it's safe to commit.
// Empty turns analytics and the cookie banner off. NEXT_PUBLIC_GA_ID overrides it, e.g. to test with another property.
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-KND2KMT8PC";

export type Consent = "granted" | "denied";

const CONSENT_KEY = "chemlife-analytics-consent";

// The footer's "Cookie settings" link dispatches this on window to show the banner again.
export const OPEN_CONSENT_EVENT = "chemlife:open-consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// Browser storage can be blocked (private windows, disabled site data). That counts as "not chosen yet".
export function readConsent(): Consent | null {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function saveConsent(value: Consent) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {}
}

/** Sends a GA event. Does nothing unless the visitor has accepted analytics. */
export function track(event: string, params: Record<string, string | number | boolean | undefined> = {}) {
  window.gtag?.("event", event, params);
}
