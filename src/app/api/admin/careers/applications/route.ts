import { requireAdmin } from "@/lib/admin-auth";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/careers";
import { deleteApplication, listApplications, setApplicationStatus } from "@/lib/careers-applications";
import { storeConfigured } from "@/lib/insights-store/db";

export const dynamic = "force-dynamic";

// The dashboard's applications (/admin/careers): GET lists them, PATCH moves one to another status, DELETE removes
// one with its résumé. Each answers with the whole list.

const refuse = (error: string, status: number) => Response.json({ error }, { status });

async function answer(request: Request, act?: (body: Record<string, unknown>) => Promise<boolean | Response>) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!storeConfigured()) return refuse("The dashboard's database isn't set up.", 503);
  try {
    if (act) {
      const body = await request.json().catch(() => null);
      if (!body || typeof body !== "object" || !Number.isInteger(body.id)) return refuse("Choose an application.", 400);
      const done = await act(body as Record<string, unknown>);
      if (done instanceof Response) return done;
      if (!done) return refuse("That application isn't in the dashboard any more. Reload the page.", 404);
    }
    return Response.json({ applications: await listApplications() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return refuse("Couldn't reach the database. Please try again.", 500);
  }
}

export const GET = (request: Request) => answer(request);

export const PATCH = (request: Request) =>
  answer(request, async (body) =>
    (APPLICATION_STATUSES as readonly unknown[]).includes(body.status)
      ? setApplicationStatus(body.id as number, body.status as ApplicationStatus)
      : refuse("Choose a status.", 400),
  );

export const DELETE = (request: Request) => answer(request, (body) => deleteApplication(body.id as number));
