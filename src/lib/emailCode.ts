// The email code that confirms a visitor's address before the contact form sends their message, and before the
// technical dossier downloads. Nothing is stored on the server: the visitor's browser keeps a signed "challenge"
// holding their details, and only the 4-digit code emailed to them makes its signature check out.
// For the dossier, the right code also gets the browser a signed download pass for /api/dossier/download.

import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import type { DossierRequest } from "@/lib/dossier";

export const CODE_LENGTH = 4;
/** How long an emailed code works. */
export const CODE_MINUTES = 10;
/** How long the download pass (and the "download it here" link) works once the code is right. */
export const DOWNLOAD_MINUTES = 30;

/** Wrong tries a code allows before a new one must be sent. */
export const MAX_WRONG_TRIES = 5;

export interface ChallengeData<T = DossierRequest> {
  details: T;
  /** The language the code email was written in, reused when a new code is sent. */
  locale: string;
  /** Unique per code, so wrong tries can be counted and a used code can't be used again. */
  id: string;
  /** Expiry, in milliseconds since 1970. */
  expires: number;
}

export type CodeCheck<T = DossierRequest> = { ok: true; data: ChallengeData<T> } | { ok: false; reason: "invalid" | "expired" | "wrong" };

const b64 = (value: Buffer | string) => Buffer.from(value).toString("base64url");
const sign = (secret: Buffer, label: string, value: string) => b64(createHmac("sha256", secret).update(`${label}.${value}`).digest());

function same(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * The signing key: DOSSIER_SECRET when set, otherwise one derived from RESEND_API_KEY, so the form works without an
 * extra setting. Null when neither is set.
 */
export function dossierSecret(): Buffer | null {
  if (process.env.DOSSIER_SECRET) return Buffer.from(process.env.DOSSIER_SECRET);
  if (process.env.RESEND_API_KEY) return createHmac("sha256", process.env.RESEND_API_KEY).update("chemlife-dossier-code-v1").digest();
  return null;
}

/** The contact form's signing key, kept apart from the dossier's so a code for one form is no use on the other. */
export function contactSecret(): Buffer | null {
  const secret = dossierSecret();
  return secret && createHmac("sha256", secret).update("chemlife-contact-code-v1").digest();
}

/** A new random code and the challenge the browser keeps. The challenge is three parts: details, their
 * signature (lets "send a new code" trust them) and a signature that only checks out with the right code. */
export function issueChallenge<T = DossierRequest>(details: T, locale: string, secret: Buffer, now = Date.now()) {
  const code = String(randomInt(0, 10 ** CODE_LENGTH)).padStart(CODE_LENGTH, "0");
  const data: ChallengeData<T> = { details, locale, id: b64(randomBytes(12)), expires: now + CODE_MINUTES * 60_000 };
  const payload = b64(JSON.stringify(data));
  const challenge = [payload, sign(secret, "details", payload), sign(secret, "code", `${payload}.${code}`)].join(".");
  return { code, challenge, data };
}

function readPayload<T>(payload: string): ChallengeData<T> | null {
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data && typeof data === "object" && data.details && typeof data.id === "string" && typeof data.expires === "number" ? data : null;
  } catch {
    return null;
  }
}

/** The challenge's details, if they were signed by this server (whatever the code). For "send a new code". */
export function readChallenge<T = DossierRequest>(challenge: string, secret: Buffer): ChallengeData<T> | null {
  const [payload, detailsSig] = challenge.split(".");
  if (!payload || !detailsSig || !same(detailsSig, sign(secret, "details", payload))) return null;
  return readPayload<T>(payload);
}

/** Whether `code` is the one emailed for this challenge, and still in time. */
export function checkCode<T = DossierRequest>(challenge: string, code: string, secret: Buffer, now = Date.now()): CodeCheck<T> {
  const [payload, , codeSig] = challenge.split(".");
  const data = readChallenge<T>(challenge, secret);
  if (!data || !codeSig) return { ok: false, reason: "invalid" };
  if (now > data.expires) return { ok: false, reason: "expired" };
  if (!new RegExp(`^\\d{${CODE_LENGTH}}$`).test(code) || !same(codeSig, sign(secret, "code", `${payload}.${code}`))) {
    return { ok: false, reason: "wrong" };
  }
  return { ok: true, data };
}

export type CodeTry<T = DossierRequest> =
  | { ok: true; data: ChallengeData<T>; /** Call once the code has done its job, so it can't be used again. */ use: () => void }
  | { ok: false; error: "invalid" | "code_expired" | "code_wrong" | "code_attempts"; status: number; left?: number };

/**
 * Checks codes for one form, counting wrong tries per code (MAX_WRONG_TRIES) and refusing codes already used.
 * Counts are kept in this server process, like the rate limits; they expire with their code, so old ones are dropped.
 */
export class CodeTries {
  private entries = new Map<string, { wrong: number; used: boolean; expires: number }>();

  check<T = DossierRequest>(challenge: string, code: string, secret: Buffer, now = Date.now()): CodeTry<T> {
    const result = checkCode<T>(challenge, code, secret, now);
    if (!result.ok && result.reason === "invalid") return { ok: false, error: "invalid", status: 400 };
    if (!result.ok && result.reason === "expired") return { ok: false, error: "code_expired", status: 410 };

    const { id, expires } = readChallenge<T>(challenge, secret)!;
    if (this.entries.size >= 10_000) {
      for (const [key, old] of this.entries) if (old.expires < now) this.entries.delete(key);
    }
    let entry = this.entries.get(id);
    if (!entry) this.entries.set(id, (entry = { wrong: 0, used: false, expires }));
    const counted = entry;
    if (counted.used || counted.wrong >= MAX_WRONG_TRIES) return { ok: false, error: "code_attempts", status: 429 };
    if (!result.ok) {
      const left = MAX_WRONG_TRIES - ++counted.wrong;
      return left > 0 ? { ok: false, error: "code_wrong", status: 400, left } : { ok: false, error: "code_attempts", status: 429 };
    }
    return { ok: true, data: result.data, use: () => void (counted.used = true) };
  }
}

/** A pass for /api/dossier/download, good for DOWNLOAD_MINUTES. */
export function issueDownloadToken(secret: Buffer, now = Date.now()): string {
  const payload = b64(JSON.stringify({ expires: now + DOWNLOAD_MINUTES * 60_000 }));
  return `${payload}.${sign(secret, "download", payload)}`;
}

export function checkDownloadToken(token: string, secret: Buffer, now = Date.now()): boolean {
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !same(sig, sign(secret, "download", payload))) return false;
  try {
    const { expires } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof expires === "number" && now <= expires;
  } catch {
    return false;
  }
}
