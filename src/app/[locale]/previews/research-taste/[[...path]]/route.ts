import { readFile } from "node:fs/promises";
import path from "node:path";
import { previewsAllowed } from "@/lib/previews";

export const dynamic = "force-dynamic";

const pages = new Set([
  "anbiot", "green-chelation", "microencapsulation",
  "nano-trace-minerals", "nature-identical-molecules",
]);

// An independent design copy. The existing /previews/research routes and sources are untouched.
export async function GET(request: Request, context: {
  params: Promise<{ locale: string; path?: string[] }>;
}) {
  const params = await context.params;
  if (params.locale !== "en" || !previewsAllowed(request.headers.get("host") ?? "")) {
    return new Response("Not found", { status: 404 });
  }
  const parts = params.path ?? [];
  if (parts.length > 1) return new Response("Not found", { status: 404 });
  const slug = parts[0];
  const asset = slug === "style.css" || slug === "interactions.js";
  if (slug && !asset && !pages.has(slug)) return new Response("Not found", { status: 404 });
  const filename = slug ? asset ? slug : `${slug}.html` : "index.html";
  const body = await readFile(path.join(process.cwd(), "src/previews/research-taste", filename), "utf8");
  const contentType = slug === "style.css" ? "text/css" : slug === "interactions.js" ? "text/javascript" : "text/html";
  return new Response(body, { headers: {
    "Content-Type": `${contentType}; charset=utf-8`,
    "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow",
  } });
}
