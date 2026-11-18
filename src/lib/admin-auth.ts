import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { RateLimiter, clientIp } from "@/lib/rateLimit";
import { isLiveHost } from "@/lib/seo";

// The Insights inbox's single moderator signs in with ADMIN_PASSWORD. Signing in sets a cookie holding an expiry
// time signed with a key made from the password, so changing the password signs everyone out.

export const ADMIN_COOKIE = "chemlife_admin";
const SESSION_DAYS = 7;

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

/** Demo mode: INSIGHTS_DEMO=true opens the inbox without signing in, for showing it on staging. Never on the live
 *  site's address, and only when switched on, so the live site can't open up even when reached another way. */
export function demoMode(host: string): boolean {
  return process.env.INSIGHTS_DEMO === "true" && !isLiveHost(host);
}

function key(): Buffer {
  return createHash("sha256").update(`chemlife-insights-admin:${process.env.ADMIN_PASSWORD ?? ""}`).digest();
}

function sign(value: string): string {
  return createHmac("sha256", key()).update(value).digest("base64url");
}

function same(a: string, b: string): boolean {
  const x = createHash("sha256").update(a).digest();
  const y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y);
}

export function passwordMatches(given: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  return Boolean(password) && same(given, password!);
}

export function newSession(): { value: string; maxAge: number } {
  const expires = Date.now() + SESSION_DAYS * 24 * 3600 * 1000;
  return { value: `${expires}.${sign(String(expires))}`, maxAge: SESSION_DAYS * 24 * 3600 };
}

export function validSession(value: string | undefined): boolean {
  if (!value || !adminConfigured()) return false;
  const [expires, signature] = value.split(".");
  return Boolean(signature) && Number(expires) > Date.now() && same(signature, sign(expires));
}

function cookieFrom(request: Request): string | undefined {
  const header = request.headers.get("cookie") ?? "";
  return header.split(/;\s*/).find((part) => part.startsWith(`${ADMIN_COOKIE}=`))?.slice(ADMIN_COOKIE.length + 1);
}

/** For the inbox's API routes: null when the moderator is signed in, otherwise the response to send. Changes must
 *  also come from this site's own pages (the Origin header), so another site can't make them. */
export function requireAdmin(request: Request): Response | null {
  if (request.method !== "GET" && !sameOrigin(request)) return Response.json({ error: "Not allowed." }, { status: 403 });
  if (demoMode(request.headers.get("host") ?? "")) return null;
  if (!validSession(cookieFrom(request))) return Response.json({ error: "Please sign in again." }, { status: 401 });
  return null;
}

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const host = new URL(origin).host;
    // A proxy in front of the site may pass the visitor's address as X-Forwarded-Host instead of Host.
    const forwarded = request.headers.get("x-forwarded-host")?.split(",")[0].trim();
    return host === request.headers.get("host") || (Boolean(forwarded) && host === forwarded);
  } catch {
    return false;
  }
}

// ---------- Too many wrong passwords ----------

// Five wrong passwords from one address locks that address out for 15 minutes. The address is the one the web
// server saw (clientIp), never one the visitor wrote into a header, so sending a different header each time
// doesn't get more tries. A second, site-wide count stops guessing spread across many addresses.
const WINDOW = 15 * 60 * 1000;
const perAddress = new RateLimiter(5, WINDOW);
const siteWide = new RateLimiter(200, WINDOW);
const EVERYONE = "everyone";

export function clientAddress(request: Request): string {
  return clientIp(request) ?? "unknown";
}

/** Whether this address may try a password now. */
export function mayTry(address: string): boolean {
  return perAddress.retryAfter(address) === 0 && siteWide.retryAfter(EVERYONE) === 0;
}

export function recordFailure(address: string): void {
  perAddress.consume(address);
  siteWide.consume(EVERYONE);
}

export function clearFailures(address: string): void {
  perAddress.reset(address);
}
