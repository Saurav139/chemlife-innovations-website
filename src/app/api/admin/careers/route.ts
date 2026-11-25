import { requireAdmin } from "@/lib/admin-auth";
import { parseRoleContent } from "@/lib/careers";
import { addRole, deleteRole, setRoleOpen, updateRole, type CareersState } from "@/lib/careers-store";
import { storeConfigured } from "@/lib/insights-store/db";

export const dynamic = "force-dynamic";

// The dashboard at /admin/careers: PUT opens or closes an internship, POST adds one, PATCH rewrites one,
// DELETE removes one. Each answers with the dashboard's whole state.

const refuse = (error: string, status: number) => Response.json({ error }, { status });
const INCOMPLETE = "Give the internship a title, a department and a description, and keep each within its limit.";

async function change(request: Request, act: (body: Record<string, unknown>) => Promise<CareersState | null | Response>) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!storeConfigured()) return refuse("The dashboard's database isn't set up.", 503);
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return refuse("That request wasn't understood.", 400);
  try {
    const result = await act(body as Record<string, unknown>);
    if (result instanceof Response) return result;
    if (!result) return refuse("That internship isn't in the dashboard any more. Reload the page.", 404);
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return refuse("Couldn't save that. Please try again.", 500);
  }
}

export const PUT = (request: Request) =>
  change(request, async (body) => {
    if (typeof body.id !== "string" || typeof body.open !== "boolean") return refuse("Choose an internship and whether it's open.", 400);
    return setRoleOpen(body.id, body.open);
  });

export const POST = (request: Request) =>
  change(request, async (body) => {
    const content = parseRoleContent(body);
    if (!content) return refuse(INCOMPLETE, 400);
    return (await addRole(content)) ?? refuse("The dashboard is full. Delete an internship you no longer need first.", 409);
  });

export const PATCH = (request: Request) =>
  change(request, async (body) => {
    const content = parseRoleContent(body);
    if (typeof body.id !== "string" || !content) return refuse(INCOMPLETE, 400);
    return updateRole(body.id, content);
  });

export const DELETE = (request: Request) =>
  change(request, async (body) => (typeof body.id === "string" ? deleteRole(body.id) : refuse("Choose an internship.", 400)));
