import { requireAdmin } from "@/lib/admin-auth";
import { storeConfigured } from "@/lib/insights-store/db";
import { previewLink } from "@/lib/insights-store/preview";

export const dynamic = "force-dynamic";

/** A filled-in card for a pasted link: { url }. */
export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!storeConfigured()) return Response.json({ error: "The inbox's database isn't set up." }, { status: 503 });
  const { url } = (await request.json().catch(() => ({}))) as { url?: unknown };
  if (typeof url !== "string" || !url.trim()) return Response.json({ error: "Paste a post's link first." }, { status: 400 });
  try {
    return Response.json(await previewLink(url));
  } catch (error) {
    const message = error instanceof TypeError && /URL/i.test(error.message) ? "That isn't a web address." : error instanceof Error ? error.message : "That link couldn't be read.";
    return Response.json({ error: message }, { status: 422 });
  }
}
