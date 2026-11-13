import { NextResponse } from "next/server";
import { RateLimiter, clientIp } from "@/lib/rateLimit";
import { verifyTurnstile } from "@/lib/turnstile";
import { emailTeam, emailVisitor } from "@/lib/teamEmail";
import { EMAIL_PATTERN } from "@/lib/contact";
import { DOSSIER_INTERESTS, DOSSIER_LIMITS, type DossierErrorCode, type DossierRequest } from "@/lib/dossier";
import { CODE_MINUTES, checkCode, dossierSecret, issueChallenge, issueDownloadToken, readChallenge } from "@/lib/dossierCode";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

// Technical dossier requests, in three steps sent as `action`:
//   "start"  details + CAPTCHA → a 4-digit code is emailed to the visitor; the browser keeps the signed challenge
//   "resend" challenge → a new code to the same address
//   "verify" challenge + code → the details are emailed to the team (the contact form's inbox) and the browser gets
//            a download pass for /api/dossier/download
// Same protection as /api/contact (CAPTCHA, spam trap, rate limits), plus a cap on codes per address so the form
// can't be used to flood someone's inbox, and on wrong tries per code.

const perHour = new RateLimiter(5, 3_600_000);
const perDay = new RateLimiter(20, 86_400_000);
const siteWide = new RateLimiter(200, 86_400_000);
const codesPerAddress = new RateLimiter(5, 3_600_000);
const verifyPerHour = new RateLimiter(30, 3_600_000);
const MAX_WRONG_TRIES = 5;

// Wrong tries per code, and codes already used, by challenge id. Kept in this process like the rate limits; ids
// expire with their code, so old ones are dropped.
const tries = new Map<string, { wrong: number; used: boolean; expires: number }>();
function triesFor(id: string, expires: number) {
  if (tries.size >= 10_000) {
    const now = Date.now();
    for (const [key, entry] of tries) if (entry.expires < now) tries.delete(key);
  }
  let entry = tries.get(id);
  if (!entry) tries.set(id, (entry = { wrong: 0, used: false, expires }));
  return entry;
}

function fail(error: DossierErrorCode, status: number, extra?: { retryAfter?: number; left?: number }) {
  return NextResponse.json(
    { error, ...(extra?.left !== undefined ? { left: extra.left } : {}) },
    { status, headers: extra?.retryAfter ? { "Retry-After": String(extra.retryAfter) } : undefined },
  );
}

const oneLine = (value: string) => value.replace(/\s+/g, " ").trim();
const text = (body: Record<string, unknown>, key: string) => (typeof body[key] === "string" ? (body[key] as string) : "");

/** The details, cleaned up, or null if they're incomplete or too long. */
function parseDetails(body: Record<string, unknown>): DossierRequest | null {
  const form: DossierRequest = {
    name: oneLine(text(body, "name")),
    email: text(body, "email").trim(),
    company: oneLine(text(body, "company")),
    role: oneLine(text(body, "role")),
    country: oneLine(text(body, "country")),
    interest: text(body, "interest"),
  };
  const valid =
    form.name && form.company && form.country &&
    EMAIL_PATTERN.test(form.email) &&
    (form.interest === "" || (DOSSIER_INTERESTS as readonly string[]).includes(form.interest)) &&
    (Object.keys(DOSSIER_LIMITS) as (keyof typeof DOSSIER_LIMITS)[]).every((key) => form[key].length <= DOSSIER_LIMITS[key]);
  return valid ? form : null;
}

/** Emails a new code to the visitor, in their language. Returns the challenge for the browser, or an error response. */
async function sendCode(details: DossierRequest, locale: string, secret: Buffer) {
  const address = details.email.toLowerCase();
  const wait = codesPerAddress.retryAfter(address);
  if (wait) return fail("rate_limited", 429, { retryAfter: wait });

  const { code, challenge } = issueChallenge(details, locale, secret);
  const t = (await getMessages(isLocale(locale) ? locale : DEFAULT_LOCALE)).dossier.codeEmail;
  const fill = (s: string) => s.replaceAll("{name}", details.name).replaceAll("{code}", code).replaceAll("{minutes}", String(CODE_MINUTES));
  // Locally, without a verified Resend domain, codes can't reach a real inbox: the dev server's log shows them instead.
  if (process.env.NODE_ENV === "development") console.info(`[dossier] code for ${details.email}: ${code}`);
  const sent = await emailVisitor(
    { to: details.email, subject: fill(t.subject), text: [t.greeting, t.body, t.ignore, "", t.signoff].map(fill).join("\n") },
    "dossier",
  );
  if (!sent) return fail("send_failed", 502);
  codesPerAddress.consume(address);
  return NextResponse.json({ ok: true, challenge });
}

export async function POST(request: Request) {
  const secret = dossierSecret();
  if (!process.env.RESEND_API_KEY || !process.env.TURNSTILE_SECRET_KEY || !secret) return fail("unavailable", 503);

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("invalid", 400);
  const action = text(body, "action") || "start";
  const ip = clientIp(request);

  if (action === "verify") {
    if (ip && verifyPerHour.retryAfter(ip)) return fail("rate_limited", 429, { retryAfter: verifyPerHour.retryAfter(ip) });
    if (ip) verifyPerHour.consume(ip);
    const check = checkCode(text(body, "challenge"), text(body, "code").trim(), secret);
    if (!check.ok && check.reason === "invalid") return fail("invalid", 400);
    if (!check.ok && check.reason === "expired") return fail("code_expired", 410);

    const data = readChallenge(text(body, "challenge"), secret)!;
    const entry = triesFor(data.id, data.expires);
    if (entry.used || entry.wrong >= MAX_WRONG_TRIES) return fail("code_attempts", 429);
    if (!check.ok) {
      entry.wrong++;
      const left = MAX_WRONG_TRIES - entry.wrong;
      return left > 0 ? fail("code_wrong", 400, { left }) : fail("code_attempts", 429);
    }

    const d = check.data.details;
    const lead = [
      "New technical dossier request from chemlifeinnovations.com",
      "The visitor confirmed their email address with a code and was given the dossier PDF.",
      "",
      `Name: ${d.name}`,
      `Email: ${d.email}`,
      `Company: ${d.company}`,
      `Role: ${d.role || "not given"}`,
      `Country: ${d.country}`,
      `Interested in: ${d.interest || "not given"}`,
      "",
      `Reply to this email to answer ${d.name} directly.`,
    ].join("\n");
    const sent = await emailTeam({ subject: `[Website] Technical dossier request: ${d.name}, ${d.company}`, text: lead, replyTo: d.email }, "dossier");
    if (!sent) return fail("send_failed", 502);
    entry.used = true;
    return NextResponse.json({ ok: true, download: `/api/dossier/download?token=${issueDownloadToken(secret)}` });
  }

  if (action === "resend") {
    const data = readChallenge(text(body, "challenge"), secret);
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
  const details = parseDetails(body);
  if (!details) return fail("invalid", 400);
  // Bots fill in every field, including one people never see. Tell them it worked and send nothing.
  if (text(body, "website") !== "") return NextResponse.json({ ok: true, challenge: "" });

  const wait = (ip && (perHour.retryAfter(ip) || perDay.retryAfter(ip))) || siteWide.retryAfter("site");
  if (wait) return fail("rate_limited", 429, { retryAfter: wait });
  // The CAPTCHA: nothing is sent unless Cloudflare confirms the token came from this visitor's widget.
  if (!(await verifyTurnstile(text(body, "turnstileToken"), ip))) return fail("captcha", 403);
  if (ip) {
    perHour.consume(ip);
    perDay.consume(ip);
  }
  siteWide.consume("site");
  return sendCode(details, text(body, "locale"), secret);
}
