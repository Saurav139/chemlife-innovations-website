import InsightsView from "./InsightsView";
import { getInsights } from "@/lib/insights";

// Rendered for each visit, so a decision in the Insights inbox shows at once on every server process and isn't
// held back by a cache in front of the site. Without the inbox, the YouTube lookups are still cached for an hour.
export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  return <InsightsView {...await getInsights()} />;
}
