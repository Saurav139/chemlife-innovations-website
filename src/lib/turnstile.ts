// Server-side check of a Cloudflare Turnstile token (the CAPTCHA on the contact form).
// TURNSTILE_SECRET_KEY comes from the Cloudflare dashboard; the matching site key is NEXT_PUBLIC_TURNSTILE_SITE_KEY.

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** True only when Cloudflare confirms the token was issued to this visitor and hasn't been used before. */
export async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error(`[contact] Turnstile verification failed: ${res.status}`);
      return false;
    }
    const result = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!result.success) console.warn(`[contact] Turnstile rejected a token: ${(result["error-codes"] ?? []).join(", ")}`);
    return result.success === true;
  } catch (err) {
    console.error(`[contact] Couldn't reach Turnstile: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}
