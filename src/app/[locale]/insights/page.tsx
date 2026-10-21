import InsightsView from "./InsightsView";
import { getInsights } from "@/lib/insights";

// Built on the server so the first HTML already lists the latest videos. Rebuilt at most once an hour.
export const revalidate = 3600;

export default async function InsightsPage() {
  return <InsightsView {...await getInsights()} />;
}
