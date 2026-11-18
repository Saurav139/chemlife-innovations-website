import { after } from "next/server";
import InsightsView from "./InsightsView";
import { getInsights } from "@/lib/insights";
import { parseFilters } from "@/lib/insight-filters";
import { INSIGHT_TOPICS } from "@/lib/insight-topics";
import { syncIfDue } from "@/lib/insights-store/auto-sync";

// Rendered for each visit, so a decision in the Insights inbox shows at once on every server process and isn't
// held back by a cache in front of the site. Without the inbox, the YouTube lookups are still cached for an hour.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const TOPIC_SLUGS = INSIGHT_TOPICS.map((topic) => topic.slug);

export default async function InsightsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  // After the page is sent: bring in new posts if automatic adding is on and a check is due.
  after(() => syncIfDue());
  // /insights?topic=mycotoxins&type=blogs opens with those filters on (a tag on an article's page links here).
  const [insights, params] = await Promise.all([getInsights(), searchParams]);
  return <InsightsView {...insights} initialFilters={parseFilters(params, TOPIC_SLUGS)} />;
}
