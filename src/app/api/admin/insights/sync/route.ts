import { createHash, timingSafeEqual } from "node:crypto";
import { requireAdmin } from "@/lib/admin-auth";
import { listItems, storeConfigured } from "@/lib/insights-store/db";
import { inboxStatus, syncInbox } from "@/lib/insights-store/sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** "Check for new posts" in the dashboard. */
export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!storeConfigured()) return Response.json({ error: "The inbox's database isn't set up." }, { status: 503 });
  await syncInbox();
  const [items, status] = await Promise.all([listItems(), inboxStatus()]);
  return Response.json({ items, ...status }, { headers: { "Cache-Control": "no-store" } });
}

/** For a scheduled job (e.g. an hPanel cron job running curl every hour): /api/admin/insights/sync?key=… with the
 *  key in INSIGHTS_SYNC_KEY. */
export async function GET(request: Request) {
  const expected = process.env.INSIGHTS_SYNC_KEY;
  const given = new URL(request.url).searchParams.get("key") ?? "";
  const digest = (value: string) => createHash("sha256").update(value).digest();
  if (!expected || !timingSafeEqual(digest(given), digest(expected))) return Response.json({ error: "Not allowed." }, { status: 403 });
  if (!storeConfigured()) return Response.json({ error: "The inbox's database isn't set up." }, { status: 503 });
  const results = await syncInbox();
  return Response.json({ results }, { headers: { "Cache-Control": "no-store" } });
}
