import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ApplyView from "./ApplyView";
import { INTERNSHIP_ROLES } from "@/lib/catalog";
import { careersState, roleNames } from "@/lib/careers-store";
import { pageMetadata } from "@/lib/seo";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

type Params = Promise<{ locale: string; role: string }>;

// An internship's application form, e.g. /careers/apply/research-intern, reached from "Apply for this Internship"
// on the Careers page. Rendered for each visit, like the Careers page, so an internship closed in the dashboard
// stops taking applications at once.
export const dynamic = "force-dynamic";

/** "Apply: Research Intern", in the page's language. Kept out of search results: the Careers page is the one to find. */
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, role } = await params;
  const lang = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const state = await careersState();
  const found = roleNames(state).find((item) => item.id === role);
  if (!found) return {};
  const t = (await getMessages(lang)).careers;
  // A closed internship's name stays out of the page, title included.
  if (state.closed.includes(role)) return pageMetadata({ title: t.closedTitle, description: t.closedText, path: `/careers/apply/${role}`, locale: lang, noIndex: true });
  // A built-in internship is in the page's language until it's rewritten in the dashboard.
  const builtIn = INTERNSHIP_ROLES.findIndex((item) => item.id === role);
  const rewritten = state.custom.some((item) => item.id === role);
  const title = builtIn >= 0 && !rewritten ? t.roles[builtIn].title : found.title;
  return pageMetadata({ title: t.applyTitle.replace("{role}", title), description: t.openText, path: `/careers/apply/${role}`, locale: lang, noIndex: true });
}

export default async function ApplyPage({ params }: { params: Params }) {
  const { role } = await params;
  const state = await careersState();
  if (!roleNames(state).some((item) => item.id === role)) notFound();
  // Only this internship goes to the browser, and not even that if it's closed.
  const mine = state.custom.filter((item) => item.id === role && !state.closed.includes(role));
  return <ApplyView roleId={role} closedRoles={state.closed.filter((id) => id === role)} customRoles={mine} removedRoles={state.removed} />;
}
