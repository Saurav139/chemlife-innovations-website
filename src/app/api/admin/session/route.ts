import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE, adminConfigured, clearFailures, clientAddress, mayTry, newSession, passwordMatches, recordFailure, sameOrigin,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// Secure cookies everywhere except a developer's own machine (plain http).
const secure = (request: Request) => !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(request.headers.get("host") ?? "");

/** Sign in to the Insights inbox. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  if (!adminConfigured()) return NextResponse.json({ error: "The inbox isn't set up yet: ADMIN_PASSWORD is missing." }, { status: 503 });
  const address = clientAddress(request);
  if (!mayTry(address)) return NextResponse.json({ error: "Too many wrong passwords. Try again in 15 minutes." }, { status: 429 });
  const { password } = (await request.json().catch(() => ({}))) as { password?: unknown };
  if (typeof password !== "string" || !passwordMatches(password)) {
    recordFailure(address);
    return NextResponse.json({ error: "That password isn't right." }, { status: 401 });
  }
  clearFailures(address);
  const session = newSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, session.value, { httpOnly: true, sameSite: "strict", secure: secure(request), path: "/", maxAge: session.maxAge });
  return response;
}

/** Sign out. */
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, sameSite: "strict", secure: secure(request), path: "/", maxAge: 0 });
  return response;
}
