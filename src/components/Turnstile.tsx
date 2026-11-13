"use client";

import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";

// Cloudflare Turnstile: the CAPTCHA on the contact form. Most visitors only see a short "verifying" state;
// the widget hands back a token that /api/contact checks with Cloudflare before sending the email.
// The site key comes from NEXT_PUBLIC_TURNSTILE_SITE_KEY (the dashboard's test key 1x00000000000000000000AA always passes).

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      language?: string;
      theme?: "light" | "dark" | "auto";
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/** Loads Cloudflare's script once, however many widgets ask for it. */
function loadTurnstile(): Promise<TurnstileApi> {
  return new Promise((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_URL}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = SCRIPT_URL;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile missing"))));
    script.addEventListener("error", () => reject(new Error("Turnstile failed to load")));
  });
}

export interface TurnstileHandle {
  /** Asks for a fresh token: tokens are single-use, so call this after every submit. */
  reset: () => void;
}

interface Props {
  siteKey: string;
  /** Two-letter language code for the widget's own text. */
  language?: string;
  /** Called with a token when the check passes, and with null when it expires or fails. */
  onToken: (token: string | null) => void;
}

const Turnstile = forwardRef<TurnstileHandle, Props>(function Turnstile({ siteKey, language, onToken }, ref) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
      onTokenRef.current(null);
    },
  }));

  useEffect(() => {
    let cancelled = false;
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !container.current) return;
        widgetId.current = turnstile.render(container.current, {
          sitekey: siteKey,
          language,
          theme: "light",
          callback: (token) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => onTokenRef.current(null),
        });
      })
      .catch(() => onTokenRef.current(null));
    return () => {
      cancelled = true;
      if (widgetId.current) {
        window.turnstile?.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [siteKey, language]);

  return <div ref={container} />;
});

export default Turnstile;
