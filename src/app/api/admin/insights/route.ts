import { requireAdmin } from "@/lib/admin-auth";
import { addItems, changeStatuses, findItem, getItems, listItems, storeConfigured } from "@/lib/insights-store/db";
import { inboxStatus, refreshInsightsPage, startInbox } from "@/lib/insights-store/sync";
import { parseBulk, parseNewItem } from "./validate";

export const dynamic = "force-dynamic";

const notSetUp = () => Response.json({ error: "The inbox's database isn't set up: DATABASE_URL is missing." }, { status: 503 });

/** Every post in the inbox, and how each channel is connected. */
export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!storeConfigured()) return notSetUp();
  await startInbox();
  const [items, status] = await Promise.all([listItems(), inboxStatus()]);
  return Response.json({ items, ...status }, { headers: { "Cache-Control": "no-store" } });
}

/** Adds a pasted post, as checked in the dashboard: { ...post, status: "approved" | "pending" }. */
export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!storeConfigured()) return notSetUp();
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const item = parseNewItem(body);
  if (typeof item === "string") return Response.json({ error: item }, { status: 400 });
  const status = body.status === "approved" ? "approved" : "pending";
  await startInbox();
  const existing = await findItem(item.source, item.externalId);
  if (existing) return Response.json({ error: "That post is already in the inbox.", item: existing }, { status: 409 });
  await addItems([item], status);
  if (status === "approved") refreshInsightsPage();
  return Response.json({ item: await findItem(item.source, item.externalId) });
}

/** A decision for several posts at once: { ids, status }. Returns the posts as they are now. */
export async function PATCH(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!storeConfigured()) return notSetUp();
  const bulk = parseBulk((await request.json().catch(() => ({}))) as Record<string, unknown>);
  if (typeof bulk === "string") return Response.json({ error: bulk }, { status: 400 });
  const before = await getItems(bulk.ids);
  if (before.length !== bulk.ids.length) return Response.json({ error: "Some of those posts aren't in the inbox any more. Reload the page." }, { status: 404 });
  const items = await changeStatuses(bulk.ids, bulk.status);
  if (bulk.status === "approved" || before.some((item) => item.status === "approved")) refreshInsightsPage();
  return Response.json({ items });
}
