import { requireAdmin } from "@/lib/admin-auth";
import { changeItem, getItem, storeConfigured } from "@/lib/insights-store/db";
import { refreshInsightsPage } from "@/lib/insights-store/sync";
import { parseChanges, withTextDecision } from "../validate";

export const dynamic = "force-dynamic";

/** The moderator's decision or edit: { status?, featured?, kind?, title?, summary?, content?, meta?, imageId? }. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!storeConfigured()) return Response.json({ error: "The inbox's database isn't set up." }, { status: 503 });
  const id = Number((await params).id);
  const before = Number.isInteger(id) ? await getItem(id) : null;
  if (!before) return Response.json({ error: "That post isn't in the inbox." }, { status: 404 });
  const parsed = parseChanges((await request.json().catch(() => ({}))) as Record<string, unknown>);
  if (typeof parsed === "string") return Response.json({ error: parsed }, { status: 400 });
  const changes = withTextDecision(parsed, before.content);
  if (changes.kind && changes.kind !== "Blog" && !before.youtubeId) {
    return Response.json({ error: "Only YouTube videos can be shown as a video or podcast." }, { status: 400 });
  }
  const after = await changeItem(id, changes);
  // The page changes when a post joins it, leaves it, or changes while on it.
  if (before.status === "approved" || after?.status === "approved") refreshInsightsPage();
  return Response.json({ item: after });
}
