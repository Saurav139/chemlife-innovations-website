import { readFile } from "node:fs/promises";
import path from "node:path";
import { PREVIEWS, previewsAllowed } from "@/lib/previews";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const preview = PREVIEWS.find((p) => p.slug === slug);
  if (!preview || !previewsAllowed(request.headers.get("host") ?? "")) {
    return new Response("Not found", { status: 404 });
  }
  const html = await readFile(path.join(process.cwd(), "src/previews", preview.file), "utf8");
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}
