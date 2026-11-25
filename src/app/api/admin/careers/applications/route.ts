import { requireCareersAdmin } from "@/lib/careers-admin";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/careers";
import { LIST_LIMIT, deleteApplications, listApplications, setApplicationStatus } from "@/lib/careers-applications";
import { storeConfigured } from "@/lib/insights-store/db";

export const dynamic = "force-dynamic";

// The dashboard's applications (/admin/careers): GET lists them, PATCH moves one to another status, DELETE removes
// one ({ id }) or several ({ ids }) with their résumés. Each answers with the list as it now is:
// { applications, total, full }.

const refuse = (error: string, status: number) => Response.json({ error }, { status });

async function answer(request: Request, act?: (body: Record<string, unknown>) => Promise<boolean | Response>) {
  const denied = requireCareersAdmin(request);
  if (denied) return denied;
  if (!storeConfigured()) return refuse("The dashboard's database isn't set up.", 503);
  try {
    if (act) {
      const body = await request.json().catch(() => null);
      if (!body || typeof body !== "object") return refuse("Choose an application.", 400);
      const done = await act(body as Record<string, unknown>);
      if (done instanceof Response) return done;
      if (!done) return refuse("That application isn't in the dashboard any more. Reload the page.", 404);
    }
    return Response.json(await listApplications(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return refuse("Couldn't reach the database. Please try again.", 500);
  }
}

export const GET = (request: Request) => answer(request);

export const PATCH = (request: Request) =>
  answer(request, async (body) => {
    if (!Number.isInteger(body.id)) return refuse("Choose an application.", 400);
    return (APPLICATION_STATUSES as readonly unknown[]).includes(body.status)
      ? setApplicationStatus(body.id as number, body.status as ApplicationStatus)
      : refuse("Choose a status.", 400);
  });

export const DELETE = (request: Request) =>
  answer(request, async (body) => {
    const ids = Array.isArray(body.ids) ? body.ids : [body.id];
    if (ids.length === 0 || ids.length > LIST_LIMIT || !ids.every((id) => Number.isInteger(id))) return refuse("Choose an application.", 400);
    return deleteApplications(ids as number[]);
  });
