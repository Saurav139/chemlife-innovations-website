import { requireAdmin } from "@/lib/admin-auth";
import { imagePath, saveImage, storeConfigured } from "@/lib/insights-store/db";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5_000_000;

// The first bytes of each picture type, so a file can't pretend to be a picture.
const SIGNATURES: [string, (b: Buffer) => boolean][] = [
  ["image/jpeg", (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff],
  ["image/png", (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))],
  ["image/gif", (b) => b.subarray(0, 4).toString("latin1") === "GIF8"],
  ["image/webp", (b) => b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP"],
];

/** A picture the moderator uploads for a post (form field "file"). */
export async function POST(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  if (!storeConfigured()) return Response.json({ error: "The inbox's database isn't set up." }, { status: 503 });
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Choose a picture to upload." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "That picture is over 5 MB. Please use a smaller one." }, { status: 413 });
  const bytes = Buffer.from(await file.arrayBuffer());
  const mime = SIGNATURES.find(([, matches]) => matches(bytes))?.[0];
  if (!mime) return Response.json({ error: "Use a JPEG, PNG, WebP or GIF picture." }, { status: 415 });
  const id = await saveImage(mime, bytes);
  return Response.json({ imageId: id, image: imagePath(id, mime) });
}
