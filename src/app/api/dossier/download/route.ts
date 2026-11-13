import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { DOSSIER_PDF_FILE } from "@/lib/dossier";
import { checkDownloadToken, dossierSecret } from "@/lib/dossierCode";

// The technical dossier PDF, only for a visitor holding the download pass /api/dossier gave them after they entered
// the code emailed to them. The pass works for 30 minutes, so the "download it here" link keeps working for a while.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const secret = dossierSecret();
  if (!secret || !checkDownloadToken(token, secret)) {
    return new Response("This download link has expired. Please request the technical dossier again on chemlifeinnovations.com.", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const pdf = await readFile(join(process.cwd(), DOSSIER_PDF_FILE));
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(pdf.length),
      "Content-Disposition": 'attachment; filename="ChemLife-technical-dossier.pdf"',
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
