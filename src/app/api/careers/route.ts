import { createHash, createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { RateLimiter, clientIp } from "@/lib/rateLimit";
import { verifyTurnstile } from "@/lib/turnstile";
import { emailTeam, emailVisitor } from "@/lib/teamEmail";
import { EMAIL_PATTERN } from "@/lib/contact";
import { CODE_MINUTES, CodeTries, contactSecret, issueChallenge, readChallenge } from "@/lib/emailCode";
import { saveApplication } from "@/lib/careers-applications";
import { careersState, roleNames } from "@/lib/careers-store";
import { APPLICATION_LIMITS, RESUME_MAX_BYTES, hasResumeExtension, type ApplicationErrorCode } from "@/lib/careers";
import { storeConfigured } from "@/lib/insights-store/db";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

// Internship applications from /careers/apply/<internship>, in three steps sent as `action`. The applicant confirms
// their email address with a code before the application is kept:
//   "start"  the form, the résumé and the CAPTCHA → a 4-digit code is emailed to the applicant; the browser keeps the
//            signed challenge (the form's details and the résumé's fingerprint; how it works: src/lib/emailCode.ts)
//   "resend" challenge → a new code to the same address
//   "verify" challenge + code + the same résumé again → the application is saved for the dashboard (/admin/careers)
// The résumé travels twice because nothing is kept on the server until the code is right. Should the database be
// unreachable at that moment, the application is emailed to the team instead, so it isn't lost.

// Generous for a person, tight for a script.
const perHour = new RateLimiter(5, 3_600_000);
const perDay = new RateLimiter(10, 86_400_000);
const siteWide = new RateLimiter(150, 86_400_000);
// Codes per address, so the form can't be used to flood someone's inbox, and code checks per visitor.
const codesPerAddress = new RateLimiter(5, 3_600_000);
const verifyPerHour = new RateLimiter(30, 3_600_000);
// Wrong tries per code, and codes already used.
const tries = new CodeTries();

// How a real PDF, .docx (a zip) or .doc file starts. The file's name alone could be anything.
const SIGNATURES: Record<string, number[]> = {
  ".pdf": [0x25, 0x50, 0x44, 0x46],
  ".docx": [0x50, 0x4b, 0x03, 0x04],
  ".doc": [0xd0, 0xcf, 0x11, 0xe0],
};

/** What the challenge carries from "start" to "verify". */
interface ApplicationDetails {
  role: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  /** SHA-256 of the résumé that was checked at "start": "verify" must bring the same file. */
  resume: string;
}

function fail(error: ApplicationErrorCode, status: number, extra?: { retryAfter?: number; left?: number }) {
  return NextResponse.json(
    { error, ...(extra?.left !== undefined ? { left: extra.left } : {}) },
    { status, headers: extra?.retryAfter ? { "Retry-After": String(extra.retryAfter) } : undefined },
  );
}

const oneLine = (value: string) => value.replace(/\s+/g, " ").trim();

/** The signing key for application codes, kept apart from the contact form's so a code for one is no use on the other. */
function careersSecret(): Buffer | null {
  const secret = contactSecret();
  return secret && createHmac("sha256", secret).update("chemlife-careers-code-v1").digest();
}

/** The uploaded résumé's bytes and extension, or the reason it can't be accepted. */
async function readResume(file: FormDataEntryValue | null): Promise<{ bytes: Buffer; extension: string } | Response> {
  if (!(file instanceof File) || file.size === 0) return fail("invalid", 400);
  if (file.size > RESUME_MAX_BYTES) return fail("resume_size", 413);
  if (!hasResumeExtension(file.name)) return fail("resume_type", 400);
  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!SIGNATURES[extension].every((byte, i) => bytes[i] === byte)) return fail("resume_type", 400);
  return { bytes, extension };
}

/** Emails a new code to the applicant, in their language. Returns the challenge for the browser, or an error response. */
async function sendCode(details: ApplicationDetails, locale: string, secret: Buffer) {
  const address = details.email.toLowerCase();
  const wait = codesPerAddress.retryAfter(address);
  if (wait) return fail("rate_limited", 429, { retryAfter: wait });

  const { code, challenge } = issueChallenge<ApplicationDetails>(details, locale, secret);
  const t = (await getMessages(isLocale(locale) ? locale : DEFAULT_LOCALE)).careers.codeEmail;
  const fill = (s: string) => s.replaceAll("{name}", details.name).replaceAll("{code}", code).replaceAll("{minutes}", String(CODE_MINUTES));
  // Locally, without a verified Resend domain, codes can't reach a real inbox: the dev server's log shows them instead.
  if (process.env.NODE_ENV === "development") console.info(`[careers] code for ${details.email}: ${code}`);
  const sent = await emailVisitor(
    { to: details.email, subject: fill(t.subject), text: [t.greeting, t.body, t.ignore, "", t.signoff].map(fill).join("\n") },
    "careers",
  );
  if (!sent) return fail("send_failed", 502);
  codesPerAddress.consume(address);
  return NextResponse.json({ ok: true, challenge });
}

export async function POST(request: Request) {
  const secret = careersSecret();
  if (!process.env.RESEND_API_KEY || !process.env.TURNSTILE_SECRET_KEY || !secret) return fail("unavailable", 503);

  // Turn away anything far over the limit before reading it.
  if (Number(request.headers.get("content-length") ?? 0) > RESUME_MAX_BYTES + 100_000) return fail("resume_size", 413);
  const body = await request.formData().catch(() => null);
  if (!body) return fail("invalid", 400);
  const text = (key: string) => {
    const value = body.get(key);
    return typeof value === "string" ? value : "";
  };
  const action = text("action") || "start";
  const ip = clientIp(request);

  if (action === "verify") {
    if (ip && verifyPerHour.retryAfter(ip)) return fail("rate_limited", 429, { retryAfter: verifyPerHour.retryAfter(ip) });
    if (ip) verifyPerHour.consume(ip);
    const check = tries.check<ApplicationDetails>(text("challenge"), text("code").trim(), secret);
    if (!check.ok) return fail(check.error, check.status, { left: check.left });

    const form = check.data.details;
    const resume = await readResume(body.get("resume"));
    if (resume instanceof Response) return resume;
    if (createHash("sha256").update(resume.bytes).digest("hex") !== form.resume) return fail("invalid", 400);
    const careers = await careersState();
    const role = roleNames(careers).find((item) => item.id === form.role);
    // Closed or deleted in the dashboard while the applicant was getting their code.
    if (!role || careers.closed.includes(role.id)) return fail("closed", 409);

    // The résumé is kept under the applicant's name, whatever the file was called.
    const resumeName = `${form.name.replace(/[^\p{L}\p{N} .-]/gu, "").trim() || "Applicant"} - Resume${resume.extension}`;
    let saved = false;
    if (storeConfigured()) {
      try {
        await saveApplication({
          roleId: role.id, roleTitle: role.title, department: role.department,
          name: form.name, email: form.email, phone: form.phone, message: form.message,
          resumeName, resume: resume.bytes,
        });
        saved = true;
      } catch (error) {
        console.error("[careers] Couldn't save an application; emailing it instead:", error instanceof Error ? error.message : error);
      }
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
    }
    check.use();
    // A short note to the applicant that it arrived, in their language. The application stands whether or not it sends.
    const t = (await getMessages(isLocale(check.data.locale) ? check.data.locale : DEFAULT_LOCALE)).careers;
    const mine = (s: string) => s.replaceAll("{name}", form.name).replaceAll("{role}", role.title);
    await emailVisitor(
      { to: form.email, subject: mine(t.confirmEmail.subject), text: [t.codeEmail.greeting, t.confirmEmail.body, "", t.codeEmail.signoff].map(mine).join("\n") },
      "careers",
    );
    return NextResponse.json({ ok: true });
  }

  const limited = () => (ip && (perHour.retryAfter(ip) || perDay.retryAfter(ip))) || siteWide.retryAfter("site");
  const count = () => {
    if (ip) {
      perHour.consume(ip);
      perDay.consume(ip);
    }
    siteWide.consume("site");
  };

  if (action === "resend") {
    const data = readChallenge<ApplicationDetails>(text("challenge"), secret);
    if (!data) return fail("invalid", 400);
    const wait = limited();
    if (wait) return fail("rate_limited", 429, { retryAfter: wait });
    count();
    return sendCode(data.details, data.locale, secret);
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
    role && form.name && EMAIL_PATTERN.test(form.email) &&
    (Object.keys(APPLICATION_LIMITS) as (keyof typeof APPLICATION_LIMITS)[]).every((key) => form[key].length <= APPLICATION_LIMITS[key]);
  if (!valid) return fail("invalid", 400);
  // Closed in the dashboard (/admin/careers) while the visitor had the page open.
  if (careers.closed.includes(role.id)) return fail("closed", 409);
  const resume = await readResume(body.get("resume"));
  if (resume instanceof Response) return resume;

  // Bots fill in every field, including one people never see. Tell them it worked and send nothing.
  if (text("website") !== "") return NextResponse.json({ ok: true, challenge: "" });

  const wait = limited();
  if (wait) return fail("rate_limited", 429, { retryAfter: wait });
  // The CAPTCHA: no code is sent unless Cloudflare confirms the token came from this visitor's widget.
  if (!(await verifyTurnstile(text("turnstileToken"), ip))) return fail("captcha", 403);
  count();
  return sendCode(
    { role: role.id, ...form, resume: createHash("sha256").update(resume.bytes).digest("hex") },
    text("locale"),
    secret,
  );
}
