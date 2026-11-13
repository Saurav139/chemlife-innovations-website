// The email code that unlocks the technical dossier. Nothing is stored on the server: the visitor's browser keeps a
// signed "challenge" holding their details, and only the 4-digit code emailed to them makes its signature check out.
// After the code is right, the browser gets a signed download pass for /api/dossier/download.

import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import type { DossierRequest } from "@/lib/dossier";

export const CODE_LENGTH = 4;
/** How long an emailed code works. */
export const CODE_MINUTES = 10;
/** How long the download pass (and the "download it here" link) works once the code is right. */
export const DOWNLOAD_MINUTES = 30;

export interface ChallengeData {
  details: DossierRequest;
  /** The language the code email was written in, reused when a new code is sent. */
  locale: string;
  /** Unique per code, so wrong tries can be counted and a used code can't be used again. */
  id: string;
  /** Expiry, in milliseconds since 1970. */
  expires: number;
}

export type CodeCheck = { ok: true; data: ChallengeData } | { ok: false; reason: "invalid" | "expired" | "wrong" };

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

/** A new random code and the challenge the browser keeps. The challenge is three parts: details, their
 * signature (lets "send a new code" trust them) and a signature that only checks out with the right code. */
export function issueChallenge(details: DossierRequest, locale: string, secret: Buffer, now = Date.now()) {
  const code = String(randomInt(0, 10 ** CODE_LENGTH)).padStart(CODE_LENGTH, "0");
  const data: ChallengeData = { details, locale, id: b64(randomBytes(12)), expires: now + CODE_MINUTES * 60_000 };
  const payload = b64(JSON.stringify(data));
  const challenge = [payload, sign(secret, "details", payload), sign(secret, "code", `${payload}.${code}`)].join(".");
  return { code, challenge, data };
}

function readPayload(payload: string): ChallengeData | null {
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data && typeof data === "object" && data.details && typeof data.id === "string" && typeof data.expires === "number" ? data : null;
  } catch {
    return null;
  }
}

/** The challenge's details, if they were signed by this server (whatever the code). For "send a new code". */
export function readChallenge(challenge: string, secret: Buffer): ChallengeData | null {
  const [payload, detailsSig] = challenge.split(".");
  if (!payload || !detailsSig || !same(detailsSig, sign(secret, "details", payload))) return null;
  return readPayload(payload);
}

/** Whether `code` is the one emailed for this challenge, and still in time. */
export function checkCode(challenge: string, code: string, secret: Buffer, now = Date.now()): CodeCheck {
  const [payload, , codeSig] = challenge.split(".");
  const data = readChallenge(challenge, secret);
  if (!data || !codeSig) return { ok: false, reason: "invalid" };
  if (now > data.expires) return { ok: false, reason: "expired" };
  if (!new RegExp(`^\\d{${CODE_LENGTH}}$`).test(code) || !same(codeSig, sign(secret, "code", `${payload}.${code}`))) {
    return { ok: false, reason: "wrong" };
  }
  return { ok: true, data };
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
