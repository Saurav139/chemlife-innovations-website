import { NextResponse } from "next/server";
import { RateLimiter, clientIp } from "@/lib/rateLimit";
import { verifyTurnstile } from "@/lib/turnstile";
import { emailTeam } from "@/lib/teamEmail";
import {
  CONTACT_LIMITS,
  EMAIL_PATTERN,
  INQUIRY_TYPES,
  type ContactErrorCode,
  type ContactMessage,
} from "@/lib/contact";

// Contact form messages are emailed to the team through Resend (see src/lib/teamEmail.ts).

// Generous for a person, tight for a script. Without the visitor's address only the site-wide limit applies.
const perHour = new RateLimiter(5, 3_600_000);
const perDay = new RateLimiter(20, 86_400_000);
const siteWide = new RateLimiter(200, 86_400_000);

function fail(error: ContactErrorCode, status: number, retryAfter?: number) {
  return NextResponse.json({ error }, { status, headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined });
}

const oneLine = (value: string) => value.replace(/\s+/g, " ").trim();

/** The message, cleaned up, or null if it's incomplete or too long. `trap` is the hidden field only bots fill in;
 * `token` is the CAPTCHA token from the Turnstile widget. */
function parse(body: unknown): (ContactMessage & { trap: boolean; token: string }) | null {
  if (!body || typeof body !== "object") return null;
  const field = (key: string) => {
    const value = (body as Record<string, unknown>)[key];
    return typeof value === "string" ? value : "";
  };
  const form = {
    name: oneLine(field("name")),
    email: field("email").trim(),
    phone: oneLine(field("phone")),
    inquiryType: field("inquiryType") || INQUIRY_TYPES[0],
    subject: oneLine(field("subject")),
    message: field("message").trim(),
  };
  const valid =
    form.name && form.subject && form.message &&
    EMAIL_PATTERN.test(form.email) &&
    (INQUIRY_TYPES as readonly string[]).includes(form.inquiryType) &&
    (Object.keys(CONTACT_LIMITS) as (keyof typeof CONTACT_LIMITS)[]).every((key) => form[key].length <= CONTACT_LIMITS[key]);
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
    "New message from the contact form on chemlifeinnovations.com",
    "",
    `Name: ${form.name}`,
    `Email: ${form.email}`,
    `Phone: ${form.phone || "not given"}`,
    `Inquiry type: ${form.inquiryType}`,
    `Subject: ${form.subject}`,
    "",
    "Message:",
    form.message,
    "",
    `Reply to this email to answer ${form.name} directly.`,
  ].join("\n");

  const sent = await emailTeam(
    { subject: `[Website] ${form.inquiryType}: ${form.subject}`, text, replyTo: form.email },
    "contact",
  );
  if (!sent) return fail("send_failed", 502);

  return NextResponse.json({ ok: true });
}
