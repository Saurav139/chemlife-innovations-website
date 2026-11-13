import { requireAdmin } from "@/lib/admin-auth";
import { databaseProblem, storeConfigured } from "@/lib/insights-store/db";
import { LEAD_KINDS, parseLeadChanges, type LeadKind } from "@/lib/leads";
import { changeLead, deleteLead } from "@/lib/leads-store";

export const dynamic = "force-dynamic";

// One contact message or dossier download on the leads dashboard: /api/admin/leads/contact/12 or /dossier/12.

type Params = { params: Promise<{ kind: string; id: string }> };

async function target(request: Request, { params }: Params): Promise<{ kind: LeadKind; id: number } | Response> {
  // Visitors' details: always behind the password, even on a staging site in demo mode.
  const denied = requireAdmin(request, { allowDemo: false });
  if (denied) return denied;
  if (!storeConfigured()) return Response.json({ error: "The database isn't set up." }, { status: 503 });
  const { kind, id } = await params;
  const number = Number(id);
  if (!(LEAD_KINDS as readonly string[]).includes(kind) || !Number.isInteger(number) || number < 1) {
    return Response.json({ error: "There's no such entry." }, { status: 404 });
  }
  return { kind: kind as LeadKind, id: number };
}

function failed(error: unknown) {
  console.error("Leads dashboard: database error", error);
  return Response.json({ error: `The database couldn't be used. ${databaseProblem(error).hint}` }, { status: 503 });
}

/** Ticks or unticks "Handled", or changes the note: { handled?, note? }. */
export async function PATCH(request: Request, context: Params) {
  const lead = await target(request, context);
  if (lead instanceof Response) return lead;
  const changes = parseLeadChanges((await request.json().catch(() => ({}))) as Record<string, unknown>);
  if (typeof changes === "string") return Response.json({ error: changes }, { status: 400 });
  try {
    const changed = await changeLead(lead.kind, lead.id, changes);
    if (!changed) return Response.json({ error: "That entry has been deleted." }, { status: 404 });
    return Response.json({ lead: changed });
  } catch (error) {
    return failed(error);
  }
}

/** Deletes the entry for good. */
export async function DELETE(request: Request, context: Params) {
  const lead = await target(request, context);
  if (lead instanceof Response) return lead;
  try {
    await deleteLead(lead.kind, lead.id);
    return Response.json({ ok: true });
  } catch (error) {
    return failed(error);
  }
}
