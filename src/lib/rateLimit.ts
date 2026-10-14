// Fixed-window request counters kept in this server process. They reset when the app restarts,
// so the OpenAI budget cap is the real backstop; these stop one visitor or script running up the bill.

export class RateLimiter {
  private windows = new Map<string, { start: number; count: number }>();

  constructor(private readonly limit: number, private readonly windowMs: number) {}

  /** Seconds until `key` may make another request, or 0 if it can now. */
  retryAfter(key: string, now = Date.now()): number {
    const w = this.windows.get(key);
    if (!w || now - w.start >= this.windowMs || w.count < this.limit) return 0;
    return Math.max(1, Math.ceil((w.start + this.windowMs - now) / 1000));
  }

  consume(key: string, now = Date.now()): void {
    const w = this.windows.get(key);
    if (w && now - w.start < this.windowMs) {
      w.count++;
      return;
    }
    if (this.windows.size >= 10_000) this.prune(now);
    this.windows.set(key, { start: now, count: 1 });
  }

  private prune(now: number) {
    for (const [key, w] of this.windows) {
      if (now - w.start >= this.windowMs) this.windows.delete(key);
    }
  }
}

function isInternalIp(ip: string): boolean {
  const v4 = ip.replace(/^::ffff:/i, "");
  return (
    /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.)/.test(v4) ||
    ip === "::1" ||
    /^(f[cd][0-9a-f]{2}|fe80):/i.test(ip)
  );
}

/**
 * The visitor's IP address, or null if it can't be told apart from the proxy's.
 * Hostinger's web server appends the real address to X-Forwarded-For, so this reads from the right
 * and skips internal hops; addresses a visitor adds on the left are never reached.
 */
export function clientIp(request: Request): string | null {
  const forwarded = (request.headers.get("x-forwarded-for") ?? "").split(",").map((s) => s.trim());
  for (const ip of forwarded.reverse()) {
    if (ip && !isInternalIp(ip)) return ip;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp && !isInternalIp(realIp) ? realIp : null;
}
