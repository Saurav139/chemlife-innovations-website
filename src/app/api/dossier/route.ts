import { NextResponse } from "next/server";
import { RateLimiter, clientIp } from "@/lib/rateLimit";
import { verifyTurnstile } from "@/lib/turnstile";
import { emailTeam } from "@/lib/teamEmail";
import { EMAIL_PATTERN, type ContactErrorCode } from "@/lib/contact";
import { DOSSIER_INTERESTS, DOSSIER_LIMITS, type DossierRequest } from "@/lib/dossier";

// Technical dossier requests: the visitor's details are emailed to the team (the same inbox as contact messages),
// then the page starts the PDF download. Same protection as /api/contact: CAPTCHA, spam trap and rate limits.

const perHour = new RateLimiter(5, 3_600_000);
const perDay = new RateLimiter(20, 86_400_000);
const siteWide = new RateLimiter(200, 86_400_000);

function fail(error: ContactErrorCode, status: number, retryAfter?: number) {
  return NextResponse.json({ error }, { status, headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined });
}

const oneLine = (value: string) => value.replace(/\s+/g, " ").trim();

/** The request, cleaned up, or null if it's incomplete or too long. `trap` is the hidden field only bots fill in;
 * `token` is the CAPTCHA token from the Turnstile widget. */
function parse(body: unknown): (DossierRequest & { trap: boolean; token: string }) | null {
  if (!body || typeof body !== "object") return null;
  const field = (key: string) => {
    const value = (body as Record<string, unknown>)[key];
    return typeof value === "string" ? value : "";
  };
  const form: DossierRequest = {
    name: oneLine(field("name")),
    email: field("email").trim(),
    company: oneLine(field("company")),
    role: oneLine(field("role")),
    country: oneLine(field("country")),
    interest: field("interest"),
  };
  const valid =
    form.name && form.company && form.country &&
    EMAIL_PATTERN.test(form.email) &&
    (form.interest === "" || (DOSSIER_INTERESTS as readonly string[]).includes(form.interest)) &&
    (Object.keys(DOSSIER_LIMITS) as (keyof typeof DOSSIER_LIMITS)[]).every((key) => form[key].length <= DOSSIER_LIMITS[key]);
  return valid ? { ...form, trap: field("website") !== "", token: field("turnstileToken") } : null;
}

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY || !process.env.TURNSTILE_SECRET_KEY) return fail("unavailable", 503);

  const form = parse(await request.json().catch(() => null));
  if (!form) return fail("invalid", 400);
  // Bots fill in every field, including one people never see. Tell them it worked and send nothing.
  if (form.trap) return NextResponse.json({ ok: true });

  const ip = clientIp(request);
  const wait = (ip && (perHour.retryAfter(ip) || perDay.retryAfter(ip))) || siteWide.retryAfter("site");
  if (wait) return fail("rate_limited", 429, wait);
  // The CAPTCHA: nothing is sent unless Cloudflare confirms the token came from this visitor's widget.
  if (!(await verifyTurnstile(form.token, ip))) return fail("captcha", 403);
  if (ip) {
    perHour.consume(ip);
    perDay.consume(ip);
  }
  siteWide.consume("site");

  const text = [
    "New technical dossier request from chemlifeinnovations.com",
    "The visitor was given the dossier PDF to download.",
    "",
    `Name: ${form.name}`,
    `Email: ${form.email}`,
    `Company: ${form.company}`,
    `Role: ${form.role || "not given"}`,
    `Country: ${form.country}`,
    `Interested in: ${form.interest || "not given"}`,
    "",
    `Reply to this email to answer ${form.name} directly.`,
  ].join("\n");

  const sent = await emailTeam(
    { subject: `[Website] Technical dossier request: ${form.name}, ${form.company}`, text, replyTo: form.email },
    "dossier",
  );
  if (!sent) return fail("send_failed", 502);

  return NextResponse.json({ ok: true });
}
