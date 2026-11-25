import { requireAdmin } from "@/lib/admin-auth";
import { INTERNSHIP_ROLES } from "@/lib/catalog";
import { setRoleOpen } from "@/lib/careers-store";
import { storeConfigured } from "@/lib/insights-store/db";

export const dynamic = "force-dynamic";

/** Opens or closes one internship from the dashboard at /admin/careers. */
export async function PUT(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!storeConfigured()) return Response.json({ error: "The dashboard's database isn't set up." }, { status: 503 });
  const body = await request.json().catch(() => null);
  if (!body || !INTERNSHIP_ROLES.some((role) => role.id === body.id) || typeof body.open !== "boolean") {
    return Response.json({ error: "Choose an internship and whether it's open." }, { status: 400 });
  }
  try {
    const closed = await setRoleOpen(body.id, body.open);
    return Response.json({ closed }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Couldn't save that. Please try again." }, { status: 500 });
  }
}
