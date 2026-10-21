import { NextResponse } from "next/server";
import { RateLimiter, clientIp } from "@/lib/rateLimit";
import {
  CONTACT_EMAIL,
  CONTACT_LIMITS,
  EMAIL_PATTERN,
  INQUIRY_TYPES,
  type ContactErrorCode,
  type ContactMessage,
} from "@/lib/contact";

// Contact form messages are emailed to the team through Resend (resend.com). RESEND_API_KEY turns this on;
// the sender address must be on a domain verified in Resend.
const FROM = process.env.CONTACT_FROM || "ChemLife Website <website@notify.chemlifeinnovations.com>";
const TO = process.env.CONTACT_TO || CONTACT_EMAIL;

// Generous for a person, tight for a script. Without the visitor's address only the site-wide limit applies.
const perHour = new RateLimiter(5, 3_600_000);
const perDay = new RateLimiter(20, 86_400_000);
const siteWide = new RateLimiter(200, 86_400_000);

function fail(error: ContactErrorCode, status: number, retryAfter?: number) {
  return NextResponse.json({ error }, { status, headers: retryAfter ? { "Retry-After": String(retryAfter) } : undefined });
}

const oneLine = (value: string) => value.replace(/\s+/g, " ").trim();

/** The message, cleaned up, or null if it's incomplete or too long. `trap` is the hidden field only bots fill in. */
function parse(body: unknown): (ContactMessage & { trap: boolean }) | null {
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
  return valid ? { ...form, trap: field("website") !== "" } : null;
}

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) return fail("unavailable", 503);

  const form = parse(await request.json().catch(() => null));
  if (!form) return fail("invalid", 400);
  // Bots fill in every field, including one people never see. Tell them it worked and send nothing.
  if (form.trap) return NextResponse.json({ ok: true });

  const ip = clientIp(request);
  const wait = (ip && (perHour.retryAfter(ip) || perDay.retryAfter(ip))) || siteWide.retryAfter("site");
  if (wait) return fail("rate_limited", 429, wait);
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

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: TO,
        reply_to: form.email,
        subject: `[Website] ${form.inquiryType}: ${form.subject}`,
        text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      // Resend's reason (bad key, unverified domain, ...) goes to the server log; the visitor's message doesn't.
      console.error(`[contact] Resend refused the email: ${res.status} ${(await res.text()).slice(0, 300)}`);
      return fail("send_failed", 502);
    }
  } catch (err) {
    console.error(`[contact] Couldn't reach Resend: ${err instanceof Error ? err.message : String(err)}`);
    return fail("send_failed", 502);
  }

  return NextResponse.json({ ok: true });
}
