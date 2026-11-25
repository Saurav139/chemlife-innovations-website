import { createHash, createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/admin-auth";
import { RateLimiter, clientIp } from "@/lib/rateLimit";
import { verifyTurnstile } from "@/lib/turnstile";
import { emailTeam, emailVisitor } from "@/lib/teamEmail";
import { CODE_MINUTES, CodeTries, contactSecret, issueChallenge, readChallenge } from "@/lib/emailCode";
import { saveApplication, storageFull } from "@/lib/careers-applications";
import { careersState, roleNames } from "@/lib/careers-store";
import { APPLICATION_EMAIL_PATTERN, APPLICATION_LIMITS, RESUME_MAX_BYTES, hasResumeExtension, type ApplicationErrorCode } from "@/lib/careers";
import { storeConfigured } from "@/lib/insights-store/db";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

// Internship applications from /careers/apply/<internship>, in three steps sent as `action`. The applicant confirms
// their email address with a code before the application is kept:
//   "start"  the form, the résumé and the CAPTCHA → a 4-digit code is emailed to the applicant; the browser keeps the
//            signed challenge (the form's details and the résumé's fingerprint; how it works: src/lib/emailCode.ts)
//   "resend" challenge → a new code to the same address, for half an hour after "start"
//   "verify" challenge + code + the same résumé again → the application is saved for the dashboard (/admin/careers)
// The résumé travels twice because nothing is kept on the server until the code is right. Should the database be
// unreachable at that moment, the application is emailed to the team instead, so it isn't lost.
//
// What one pass of the CAPTCHA buys: four code emails to one address at most (the first and three more, within half
// an hour) and at most one application, saved or emailed (every code sent for a form carries that form's
// fingerprint; the database keeps one row per fingerprint, and the email path remembers what it has sent).
// Requests must come from this site's own pages.

// Generous for a person, tight for a script. Reserved before a code email is sent and given back if it doesn't go.
const perHour = new RateLimiter(5, 3_600_000);
const perDay = new RateLimiter(10, 86_400_000);
// New applications across the whole site in a day. Each one needed its own pass of the CAPTCHA.
const siteWide = new RateLimiter(150, 86_400_000);
// "Send a new code" has its own allowances, so that asking for new codes (which needs no CAPTCHA) can never use up
// the room for new applications: three per filled-in form, and a day's total across the site.
const resendsPerForm = new RateLimiter(3, 3_600_000);
const resendsSiteWide = new RateLimiter(300, 86_400_000);
// Forms already emailed to the team by the fallback path, which has no database to tell it.
const emailedForms = new RateLimiter(1, 6 * 3_600_000);
// Visitors whose address can't be told apart from the proxy's share one allowance, roomier than a single person's so
// that a hosting change which hides addresses doesn't shut real applicants out.
const unknownPerHour = new RateLimiter(30, 3_600_000);
const unknownPerDay = new RateLimiter(100, 86_400_000);
// Codes per address, so the form can't be used to flood someone's inbox, and code checks per visitor.
const codesPerAddress = new RateLimiter(5, 3_600_000);
const verifyPerHour = new RateLimiter(30, 3_600_000);
// Every request, counted before its body (up to a 5 MB file) is read.
const requestsPerHour = new RateLimiter(60, 3_600_000);
// Wrong tries per code, and codes already used.
const tries = new CodeTries();
// Codes being checked right now: a second request with the same one waits its turn by being refused.
const inFlight = new Set<string>();

/** How long after "start" a new code can still be asked for. */
const RESEND_MINUTES = 30;

/** What the challenge carries from "start" to "verify". */
interface ApplicationDetails {
  role: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  /** SHA-256 of the résumé that was checked at "start": "verify" must bring the same file. */
  resume: string;
  /** When the form was sent, in milliseconds since 1970. Stays the same through every new code. */
  started: number;
}

function fail(error: ApplicationErrorCode, status: number, extra?: { retryAfter?: number; left?: number }) {
  return NextResponse.json(
    { error, ...(extra?.left !== undefined ? { left: extra.left } : {}) },
    { status, headers: extra?.retryAfter ? { "Retry-After": String(extra.retryAfter) } : undefined },
  );
}

const oneLine = (value: string) => value.replace(/\s+/g, " ").trim();
const sha256 = (value: Buffer | string) => createHash("sha256").update(value).digest("hex");
/** The same for every code sent for one filled-in form. */
const fingerprintOf = (form: ApplicationDetails) => sha256(`${form.started}|${form.role}|${form.email.toLowerCase()}|${form.resume}`);

/** The signing key for application codes, kept apart from the contact form's so a code for one is no use on the other. */
function careersSecret(): Buffer | null {
  const secret = contactSecret();
  return secret && createHmac("sha256", secret).update("chemlife-careers-code-v1").digest();
}

/**
 * The uploaded résumé's bytes and extension, or the reason it can't be accepted. The file's name alone could be
 * anything, so the contents must look the part: a PDF starts "%PDF"; a .docx is a zip holding word/document.xml,
 * and one that carries macros (vbaProject.bin) is turned away, since the hiring team will open it.
 */
async function readResume(file: FormDataEntryValue | null): Promise<{ bytes: Buffer; extension: string } | Response> {
  if (!(file instanceof File) || file.size === 0) return fail("invalid", 400);
  if (file.size > RESUME_MAX_BYTES) return fail("resume_size", 413);
  if (!hasResumeExtension(file.name)) return fail("resume_type", 400);
  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const starts = (signature: number[]) => signature.every((byte, i) => bytes[i] === byte);
  const genuine =
    extension === ".pdf"
      ? starts([0x25, 0x50, 0x44, 0x46])
      : starts([0x50, 0x4b, 0x03, 0x04]) && bytes.includes("word/document.xml") && !bytes.includes("vbaProject.bin");
  return genuine ? { bytes, extension } : fail("resume_type", 400);
}

/** Emails a new code to the applicant, in their language. Returns the challenge for the browser, or an error response. */
async function sendCode(details: ApplicationDetails, locale: string, secret: Buffer, ip: string | null, again: boolean) {
  const address = details.email.toLowerCase();
  const visitor = ip ?? "unknown";
  const form = fingerprintOf(details);
  // Every allowance this email counts against. A new code for a form already sent counts against the resend
  // allowances instead of the site's room for new applications.
  const allowances: [RateLimiter, string][] = [
    ...(ip ? [[perHour, visitor], [perDay, visitor]] : [[unknownPerHour, visitor], [unknownPerDay, visitor]]) as [RateLimiter, string][],
    [codesPerAddress, address],
    ...(again ? [[resendsPerForm, form], [resendsSiteWide, "site"]] : [[siteWide, "site"]]) as [RateLimiter, string][],
  ];
  const wait = allowances.map(([limiter, key]) => limiter.retryAfter(key)).find(Boolean);
  if (wait) return fail("rate_limited", 429, { retryAfter: wait });
  // Reserved before the email is sent (sending takes a moment, and requests arriving together must not all slip
  // under the limit), and given back if it doesn't go, so a failed send costs nobody anything.
  for (const [limiter, key] of allowances) limiter.consume(key);
  const giveBack = () => allowances.forEach(([limiter, key]) => limiter.refund(key));

  const { code, challenge } = issueChallenge<ApplicationDetails>(details, locale, secret);
  const t = (await getMessages(isLocale(locale) ? locale : DEFAULT_LOCALE)).careers.codeEmail;
  const fill = (s: string) => s.replaceAll("{code}", code).replaceAll("{minutes}", String(CODE_MINUTES));
  // Locally, without a verified Resend domain, codes can't reach a real inbox: the dev server's log shows them instead.
  if (process.env.NODE_ENV === "development") console.info(`[careers] code for ${details.email}: ${code}`);
  // No greeting by name: until the code is entered the address isn't known to be the applicant's, and the name is
  // whatever was typed into the form.
  const sent = await emailVisitor({ to: details.email, subject: fill(t.subject), text: [t.body, t.ignore, "", t.signoff].map(fill).join("\n") }, "careers");
  if (!sent) {
    giveBack();
    return fail("send_failed", 502);
  }
  return NextResponse.json({ ok: true, challenge });
}

export async function POST(request: Request) {
  const secret = careersSecret();
  if (!process.env.RESEND_API_KEY || !process.env.TURNSTILE_SECRET_KEY || !secret) return fail("unavailable", 503);
  // Only this site's own pages may post here: another site can't make a visitor's browser send requests for it.
  if (!sameOrigin(request)) return fail("invalid", 403);

  const ip = clientIp(request);
  const visitor = ip ?? "unknown";
  const tooMany = requestsPerHour.retryAfter(visitor);
  if (tooMany) return fail("rate_limited", 429, { retryAfter: tooMany });
  requestsPerHour.consume(visitor);
  // Turn away anything far over the limit, or that won't say how big it is, before reading it.
  const length = Number(request.headers.get("content-length"));
  if (!Number.isFinite(length) || length <= 0) return fail("invalid", 411);
  if (length > RESUME_MAX_BYTES + 100_000) return fail("resume_size", 413);
  const body = await request.formData().catch(() => null);
  if (!body) return fail("invalid", 400);
  const text = (key: string) => {
    const value = body.get(key);
    return typeof value === "string" ? value : "";
  };
  const action = text("action") || "start";

  if (action === "verify") {
    const wait = verifyPerHour.retryAfter(visitor);
    if (wait) return fail("rate_limited", 429, { retryAfter: wait });
    verifyPerHour.consume(visitor);
    const check = tries.check<ApplicationDetails>(text("challenge"), text("code").trim(), secret);
    if (!check.ok) return fail(check.error, check.status, { left: check.left });
    // From here to the end only one request per code is let through; a twin sent at the same moment is refused.
    const id = check.data.id;
    if (inFlight.has(id)) return fail("rate_limited", 429, { retryAfter: 5 });
    inFlight.add(id);
    try {
      const form = check.data.details;
      const resume = await readResume(body.get("resume"));
      if (resume instanceof Response) return resume;
      if (sha256(resume.bytes) !== form.resume) return fail("invalid", 400);
      const careers = await careersState();
      const role = roleNames(careers).find((item) => item.id === form.role);
      // Closed or deleted in the dashboard while the applicant was getting their code.
      if (!role || careers.closed.includes(role.id)) return fail("closed", 409);

      // The résumé is kept under the applicant's name, whatever the file was called.
      const resumeName = `${form.name.replace(/[^\p{L}\p{N} .-]/gu, "").trim() || "Applicant"} - Resume${resume.extension}`;
      const fingerprint = fingerprintOf(form);
      let saved = false;
      let isNew = true;
      if (storeConfigured()) {
        // The dashboard has all it can hold (see storageFull): nothing more is taken, by either route.
        if (await storageFull()) return fail("unavailable", 503);
        try {
          isNew = await saveApplication({
            roleId: role.id, roleTitle: role.title, department: role.department,
            name: form.name, email: form.email, phone: form.phone, message: form.message,
            resumeName, resume: resume.bytes,
            fingerprint,
          });
          saved = true;
        } catch (error) {
          console.error("[careers] Couldn't save an application; emailing it instead:", error instanceof Error ? error.message : error);
        }
      }
      if (!saved && emailedForms.retryAfter(fingerprint)) {
        // This form has already gone to the team by email; a second code for it changes nothing.
        check.use();
        return NextResponse.json({ ok: true });
      }
      if (!saved) {
        const email = [
          "New internship application from the Careers page on chemlifeinnovations.com",
          "It came by email because the dashboard's database couldn't be used; it is not in the dashboard.",
          "The applicant confirmed their email address with a code.",
          "",
          `Position: ${role.title}`,
          `Department: ${role.department}`,
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
            subject: `[Website] Internship application: ${role.title} (${form.name})`,
            text: email,
            replyTo: form.email,
            attachments: [{ filename: resumeName, content: resume.bytes.toString("base64") }],
          },
          "careers",
        );
        if (!sent) return fail("send_failed", 502);
        emailedForms.consume(fingerprint);
      }
      check.use();
      // The same form confirmed a second time: it's already kept, and the applicant has already been told.
      if (!isNew) return NextResponse.json({ ok: true });
      // A short note to the applicant that it arrived, in their language. The application stands whether or not it sends.
      const t = (await getMessages(isLocale(check.data.locale) ? check.data.locale : DEFAULT_LOCALE)).careers;
      const mine = (s: string) => s.replaceAll("{name}", form.name).replaceAll("{role}", role.title);
      await emailVisitor(
        { to: form.email, subject: mine(t.confirmEmail.subject), text: [t.codeEmail.greeting, t.confirmEmail.body, "", t.codeEmail.signoff].map(mine).join("\n") },
        "careers",
      );
      return NextResponse.json({ ok: true });
    } finally {
      inFlight.delete(id);
    }
  }

  if (action === "resend") {
    const data = readChallenge<ApplicationDetails>(text("challenge"), secret);
    // A challenge is only good for new codes for a while: an old one can't be kept to send codes for ever.
    if (!data || typeof data.details.started !== "number" || Date.now() - data.details.started > RESEND_MINUTES * 60_000) {
      return fail("code_expired", 410);
    }
    return sendCode(data.details, data.locale, secret, ip, true);
  }

  // "start"
  const careers = await careersState();
  const role = roleNames(careers).find((item) => item.id === text("role"));
  const form = {
    name: oneLine(text("name")),
    email: text("email").trim(),
    phone: oneLine(text("phone")),
    message: text("message").trim(),
  };
  const valid =
    role && form.name && APPLICATION_EMAIL_PATTERN.test(form.email) &&
    (Object.keys(APPLICATION_LIMITS) as (keyof typeof APPLICATION_LIMITS)[]).every((key) => form[key].length <= APPLICATION_LIMITS[key]);
  if (!valid) return fail("invalid", 400);
  // Closed in the dashboard (/admin/careers) while the visitor had the page open.
  if (careers.closed.includes(role.id)) return fail("closed", 409);
  const resume = await readResume(body.get("resume"));
  if (resume instanceof Response) return resume;
  // The dashboard has all it can hold: say so now rather than after the applicant has fetched a code.
  if (storeConfigured() && (await storageFull())) return fail("unavailable", 503);

  // Bots fill in every field, including one people never see. Tell them it worked and send nothing.
  if (text("reference") !== "") return NextResponse.json({ ok: true, challenge: "" });

  // The CAPTCHA: no code is sent unless Cloudflare confirms the token came from this visitor's widget.
  if (!(await verifyTurnstile(text("turnstileToken"), ip))) return fail("captcha", 403);
  return sendCode({ role: role.id, ...form, resume: sha256(resume.bytes), started: Date.now() }, text("locale"), secret, ip, false);
}
