import { requireAdmin } from "@/lib/admin-auth";
import { readResume } from "@/lib/careers-applications";
import { storeConfigured } from "@/lib/insights-store/db";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

/** An applicant's résumé, for the signed-in dashboard only. Always a download, never opened inside the site. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!storeConfigured()) return Response.json({ error: "The dashboard's database isn't set up." }, { status: 503 });
  const id = Number((await params).id);
  const resume = Number.isInteger(id) ? await readResume(id).catch(() => null) : null;
  if (!resume) return Response.json({ error: "That résumé isn't in the dashboard." }, { status: 404 });
  const plainName = resume.name.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "");
  return new Response(new Uint8Array(resume.data), {
    headers: {
      "Content-Type": TYPES[resume.name.split(".").pop()?.toLowerCase() ?? ""] ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${plainName}"; filename*=UTF-8''${encodeURIComponent(resume.name)}`,
      "Content-Length": String(resume.data.length),
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
