import { after } from "next/server";
import InsightsView from "./InsightsView";
import { getInsights } from "@/lib/insights";
import { syncIfDue } from "@/lib/insights-store/auto-sync";

// Rendered for each visit, so a decision in the Insights inbox shows at once on every server process and isn't
// held back by a cache in front of the site. Without the inbox, the YouTube lookups are still cached for an hour.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function InsightsPage() {
  // After the page is sent: bring in new posts if automatic adding is on and a check is due.
  after(() => syncIfDue());
  return <InsightsView {...await getInsights()} />;
}
