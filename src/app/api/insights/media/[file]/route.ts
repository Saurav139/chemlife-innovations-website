import { readImage, storeConfigured } from "@/lib/insights-store/db";

// Pictures copied into the Insights inbox (Instagram and LinkedIn picture addresses expire). Each address is for
// one picture forever, so browsers may keep it for a year.
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const id = Number((await params).file.match(/^(\d+)\.(jpg|png|webp|gif)$/)?.[1]);
  const image = storeConfigured() && id ? await readImage(id).catch(() => null) : null;
  if (!image) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.mime,
      "Content-Length": String(image.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
