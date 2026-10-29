import { requireAdmin } from "@/lib/admin-auth";
import { listItems, setSocialAutoPublish, storeConfigured } from "@/lib/insights-store/db";
import { inboxStatus, refreshInsightsPage, startInbox } from "@/lib/insights-store/sync";
import { isSocialSource } from "@/lib/insights-store/social-publishing";

export const dynamic = "force-dynamic";

/** A saved moderation preference; the normal admin and same-origin protections apply. */
export async function PUT(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!storeConfigured()) return Response.json({ error: "The inbox's database isn't set up." }, { status: 503 });
  const body = await request.json().catch(() => null);
  if (!body || !isSocialSource(body.source) || typeof body.enabled !== "boolean") {
    return Response.json({ error: "Choose a LinkedIn or Instagram channel and whether its posts should be added automatically." }, { status: 400 });
  }
  try {
    await startInbox();
    const approvedCount = await setSocialAutoPublish(body.source, body.enabled);
    if (approvedCount > 0) refreshInsightsPage();
    const [items, status] = await Promise.all([listItems(), inboxStatus()]);
    return Response.json({ items, ...status, approvedCount }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Couldn't save automatic adding. Please try again." }, { status: 500 });
  }
}
