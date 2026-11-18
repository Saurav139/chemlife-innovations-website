import { NextResponse, after } from "next/server";
import { RateLimiter, clientIp } from "@/lib/rateLimit";
import { verifyTurnstile } from "@/lib/turnstile";
import { emailTeam, emailVisitor } from "@/lib/teamEmail";
import { saveContactMessage } from "@/lib/leads-store";
import {
  CONTACT_LIMITS,
  EMAIL_PATTERN,
  INQUIRY_TYPES,
  type ContactErrorCode,
  type ContactMessage,
} from "@/lib/contact";
import { CODE_MINUTES, CodeTries, contactSecret, issueChallenge, readChallenge } from "@/lib/emailCode";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

// Contact form messages, in three steps sent as `action`. The visitor confirms their email address with a code
// before anything reaches the team:
//   "start"  message + CAPTCHA → a 4-digit code is emailed to the visitor; the browser keeps the signed challenge
//   "resend" challenge → a new code to the same address
//   "verify" challenge + code → the message is emailed to the team through Resend (see src/lib/teamEmail.ts), then
//            kept for the leads dashboard (/admin/leads) when the site has a database
// The code works the same way as the technical dossier's (see src/lib/emailCode.ts).

// Generous for a person, tight for a script. Without the visitor's address only the site-wide limit applies.
const perHour = new RateLimiter(5, 3_600_000);
const perDay = new RateLimiter(20, 86_400_000);
const siteWide = new RateLimiter(200, 86_400_000);
// Codes per address, so the form can't be used to flood someone's inbox, and code checks per visitor.
const codesPerAddress = new RateLimiter(5, 3_600_000);
const verifyPerHour = new RateLimiter(30, 3_600_000);
// Wrong tries per code, and codes already used.
const tries = new CodeTries();

function fail(error: ContactErrorCode, status: number, extra?: { retryAfter?: number; left?: number }) {
  return NextResponse.json(
    { error, ...(extra?.left !== undefined ? { left: extra.left } : {}) },
    { status, headers: extra?.retryAfter ? { "Retry-After": String(extra.retryAfter) } : undefined },
  );
}

const oneLine = (value: string) => value.replace(/\s+/g, " ").trim();
const text = (body: Record<string, unknown>, key: string) => (typeof body[key] === "string" ? (body[key] as string) : "");

/** The message, cleaned up, or null if it's incomplete or too long. */
function parseMessage(body: Record<string, unknown>): ContactMessage | null {
  const form: ContactMessage = {
    name: oneLine(text(body, "name")),
    email: text(body, "email").trim(),
    phone: oneLine(text(body, "phone")),
    inquiryType: text(body, "inquiryType") || INQUIRY_TYPES[0],
    subject: oneLine(text(body, "subject")),
    message: text(body, "message").trim(),
  };
  const valid =
    form.name && form.subject && form.message &&
    EMAIL_PATTERN.test(form.email) &&
    (INQUIRY_TYPES as readonly string[]).includes(form.inquiryType) &&
    (Object.keys(CONTACT_LIMITS) as (keyof typeof CONTACT_LIMITS)[]).every((key) => form[key].length <= CONTACT_LIMITS[key]);
  return valid ? form : null;
}

/** Emails a new code to the visitor, in their language. Returns the challenge for the browser, or an error response. */
async function sendCode(form: ContactMessage, locale: string, secret: Buffer) {
  const address = form.email.toLowerCase();
  const wait = codesPerAddress.retryAfter(address);
  if (wait) return fail("rate_limited", 429, { retryAfter: wait });

  const { code, challenge } = issueChallenge(form, locale, secret);
  const messages = await getMessages(isLocale(locale) ? locale : DEFAULT_LOCALE);
  const t = messages.contact.codeEmail;
  const { greeting, signoff } = messages.dossier.codeEmail;
  const fill = (s: string) => s.replaceAll("{name}", form.name).replaceAll("{code}", code).replaceAll("{minutes}", String(CODE_MINUTES));
  // Locally, without a verified Resend domain, codes can't reach a real inbox: the dev server's log shows them instead.
  if (process.env.NODE_ENV === "development") console.info(`[contact] code for ${form.email}: ${code}`);
  const sent = await emailVisitor(
    { to: form.email, subject: fill(t.subject), text: [greeting, t.body, t.ignore, "", signoff].map(fill).join("\n") },
    "contact",
  );
  if (!sent) return fail("send_failed", 502);
  codesPerAddress.consume(address);
  return NextResponse.json({ ok: true, challenge });
}

export async function POST(request: Request) {
  const secret = contactSecret();
  if (!process.env.RESEND_API_KEY || !process.env.TURNSTILE_SECRET_KEY || !secret) return fail("unavailable", 503);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("invalid", 400);
  const action = text(body, "action") || "start";
  const ip = clientIp(request);

  if (action === "verify") {
    if (ip && verifyPerHour.retryAfter(ip)) return fail("rate_limited", 429, { retryAfter: verifyPerHour.retryAfter(ip) });
    if (ip) verifyPerHour.consume(ip);
    const check = tries.check<ContactMessage>(text(body, "challenge"), text(body, "code").trim(), secret);
    if (!check.ok) return fail(check.error, check.status, { left: check.left });

    const form = check.data.details;
    const email = [
      "New message from the contact form on chemlifeinnovations.com",
      "The visitor confirmed their email address with a code.",
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
      { subject: `[Website] ${form.inquiryType}: ${form.subject}`, text: email, replyTo: form.email },
      "contact",
    );
    if (!sent) return fail("send_failed", 502);
    check.use();
    // After answering, so a slow or missing database never holds up or breaks the form.
    after(() => saveContactMessage(form));
    return NextResponse.json({ ok: true });
  }

  if (action === "resend") {
    const data = readChallenge<ContactMessage>(text(body, "challenge"), secret);
    if (!data) return fail("invalid", 400);
    const wait = (ip && (perHour.retryAfter(ip) || perDay.retryAfter(ip))) || siteWide.retryAfter("site");
    if (wait) return fail("rate_limited", 429, { retryAfter: wait });
    if (ip) {
      perHour.consume(ip);
      perDay.consume(ip);
    }
    siteWide.consume("site");
    return sendCode(data.details, data.locale, secret);
  }

  // "start"
  const form = parseMessage(body);
  if (!form) return fail("invalid", 400);
  // Bots fill in every field, including one people never see. Tell them it worked and send nothing.
  if (text(body, "website") !== "") return NextResponse.json({ ok: true, challenge: "" });

  const wait = (ip && (perHour.retryAfter(ip) || perDay.retryAfter(ip))) || siteWide.retryAfter("site");
  if (wait) return fail("rate_limited", 429, { retryAfter: wait });
  // The CAPTCHA: no code is sent unless Cloudflare confirms the token came from this visitor's widget.
  if (!(await verifyTurnstile(text(body, "turnstileToken"), ip))) return fail("captcha", 403);
  if (ip) {
    perHour.consume(ip);
    perDay.consume(ip);
  }
  siteWide.consume("site");
  return sendCode(form, text(body, "locale"), secret);
}
