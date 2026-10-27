import { requireAdmin } from "@/lib/admin-auth";
import { addItems, findItem, listItems, storeConfigured } from "@/lib/insights-store/db";
import { inboxStatus, refreshInsightsPage, startInbox } from "@/lib/insights-store/sync";
import { parseNewItem } from "./validate";

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
