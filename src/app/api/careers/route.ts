import { NextResponse } from "next/server";
import { RateLimiter, clientIp } from "@/lib/rateLimit";
import { verifyTurnstile } from "@/lib/turnstile";
import { emailTeam } from "@/lib/teamEmail";
import { EMAIL_PATTERN } from "@/lib/contact";
import { INTERNSHIP_ROLES } from "@/lib/catalog";
import { closedRoleIds } from "@/lib/careers-store";
import { APPLICATION_LIMITS, RESUME_MAX_BYTES, hasResumeExtension, type ApplicationErrorCode } from "@/lib/careers";

// Internship applications from the Careers page: the form (with the résumé as a file) arrives here and is emailed to
// the team through Resend, résumé attached. Nothing is kept on the server. The CAPTCHA and the limits below keep
// scripts from filling the team's inbox.

const perHour = new RateLimiter(5, 3_600_000);
const perDay = new RateLimiter(10, 86_400_000);
const siteWide = new RateLimiter(150, 86_400_000);

// How a real PDF, .docx (a zip) or .doc file starts. The file's name alone could be anything.
const SIGNATURES: Record<string, number[]> = {
  ".pdf": [0x25, 0x50, 0x44, 0x46],
  ".docx": [0x50, 0x4b, 0x03, 0x04],
  ".doc": [0xd0, 0xcf, 0x11, 0xe0],
};

function fail(error: ApplicationErrorCode, status: number, retryAfter?: number) {
  return NextResponse.json({ error }, { status, headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined });
}

const oneLine = (value: string) => value.replace(/\s+/g, " ").trim();

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY || !process.env.TURNSTILE_SECRET_KEY) return fail("unavailable", 503);

  // Turn away anything far over the limit before reading it.
  if (Number(request.headers.get("content-length") ?? 0) > RESUME_MAX_BYTES + 100_000) return fail("resume_size", 413);
  const body = await request.formData().catch(() => null);
  if (!body) return fail("invalid", 400);
  const text = (key: string) => {
    const value = body.get(key);
    return typeof value === "string" ? value : "";
  };

  const role = INTERNSHIP_ROLES.find((item) => item.id === text("role"));
  const form = {
    name: oneLine(text("name")),
    email: text("email").trim(),
    phone: oneLine(text("phone")),
    message: text("message").trim(),
  };
  const valid =
    role && form.name && EMAIL_PATTERN.test(form.email) &&
    (Object.keys(APPLICATION_LIMITS) as (keyof typeof APPLICATION_LIMITS)[]).every((key) => form[key].length <= APPLICATION_LIMITS[key]);
  if (!valid) return fail("invalid", 400);
  // Closed in the dashboard (/admin/careers) while the visitor had the page open.
  if ((await closedRoleIds()).includes(role.id)) return fail("closed", 409);

  const resume = body.get("resume");
  if (!(resume instanceof File) || resume.size === 0) return fail("invalid", 400);
  if (resume.size > RESUME_MAX_BYTES) return fail("resume_size", 413);
  if (!hasResumeExtension(resume.name)) return fail("resume_type", 400);
  const bytes = Buffer.from(await resume.arrayBuffer());
  const extension = resume.name.slice(resume.name.lastIndexOf(".")).toLowerCase();
  if (!SIGNATURES[extension].every((byte, i) => bytes[i] === byte)) return fail("resume_type", 400);

  // Bots fill in every field, including one people never see. Tell them it worked and send nothing.
  if (text("website") !== "") return NextResponse.json({ ok: true });

  const ip = clientIp(request);
  const wait = (ip && (perHour.retryAfter(ip) || perDay.retryAfter(ip))) || siteWide.retryAfter("site");
  if (wait) return fail("rate_limited", 429, wait);
  if (!(await verifyTurnstile(text("turnstileToken"), ip))) return fail("captcha", 403);

  // The résumé goes out under the applicant's name, whatever the file was called.
  const filename = `${form.name.replace(/[^\p{L}\p{N} .-]/gu, "").trim() || "Applicant"} - Resume${extension}`;
  const email = [
    "New internship application from the Careers page on chemlifeinnovations.com",
    "",
    `Position: ${role.englishTitle}`,
    `Department: ${role.englishDepartment}`,
    `Name: ${form.name}`,
    `Email: ${form.email}`,
    `Phone: ${form.phone || "not given"}`,
    "",
    "Message:",
    form.message || "(none)",
    "",
    `The résumé is attached. Reply to this email to answer ${form.name} directly.`,
  ].join("\n");
  const sent = await emailTeam(
    {
      subject: `[Website] Internship application: ${role.englishTitle} (${form.name})`,
      text: email,
      replyTo: form.email,
      attachments: [{ filename, content: bytes.toString("base64") }],
    },
    "careers",
  );
  if (!sent) return fail("send_failed", 502);
  if (ip) {
    perHour.consume(ip);
    perDay.consume(ip);
  }
  siteWide.consume("site");
  return NextResponse.json({ ok: true });
}
