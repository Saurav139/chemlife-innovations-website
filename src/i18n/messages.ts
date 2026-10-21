import type { Locale } from "./config";
import type { Messages } from "./messages/en";

export type { Messages };

const loaders: Record<Locale, () => Promise<{ default: Messages }>> = {
  en: () => import("./messages/en"),
  kn: () => import("./messages/kn"),
  hi: () => import("./messages/hi"),
};

/** All of a language's text. Loaded on the server and passed to the page, so visitors only download one language. */
export async function getMessages(locale: Locale): Promise<Messages> {
  return (await loaders[locale]()).default;
}
