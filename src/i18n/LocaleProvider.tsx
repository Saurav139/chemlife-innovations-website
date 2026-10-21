"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";
import { DEFAULT_LOCALE, localizePath, type Locale } from "./config";
import type { Messages } from "./messages/en";

const LocaleContext = createContext<{ locale: Locale; messages: Messages } | null>(null);

export function LocaleProvider({ locale, messages, children }: { locale: Locale; messages: Messages; children: ReactNode }) {
  return <LocaleContext.Provider value={{ locale, messages }}>{children}</LocaleContext.Provider>;
}

function useLocaleContext() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("LocaleProvider is missing");
  return value;
}

/** The current page's language. */
export function useLocale(): Locale {
  return useContext(LocaleContext)?.locale ?? DEFAULT_LOCALE;
}

/** All the text for the current language, e.g. `t.nav.products`. */
export function useT(): Messages {
  return useLocaleContext().messages;
}

/** Turns an English path into the current language's address: href("/products") → "/kn/products" on Kannada pages. */
export function useHref() {
  const locale = useLocale();
  return useCallback((path: string) => localizePath(path, locale), [locale]);
}
