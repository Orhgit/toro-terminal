/**
 * In-memory sliding-window rate limiter.
 *
 * Used to throttle abuse on auth-sensitive endpoints (`/api/auth/login`)
 * before we have a real distributed cache (Redis/Upstash). Per-process
 * only — multiple Next.js workers share nothing — but for the current
 * traffic level this is good enough. RIN-389 tracks the move to a shared
 * store once the platform scales beyond a single replica.
 *
 * Returns `{ allowed, retryAfterMs }`. Callers should respond with HTTP
 * 429 + `Retry-After` header when `allowed === false`.
 */

type Bucket = {
  /** Timestamps (ms) of recent hits within the window. */
  hits: number[];
};

const buckets = new Map<string, Bucket>();

/**
 * Used by tests only.
 */
export function clearRateLimitForTesting(): void {
  buckets.clear();
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
  remaining: number;
}

export interface RateLimitOptions {
  /** Identifier for the bucket. Typically `${endpoint}:${ip}` or `:${email}`. */
  key: string;
  /** Maximum hits within the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Override the clock for tests. */
  now?: () => number;
}

export function checkRateLimit(opts: RateLimitOptions): RateLimitResult {
  const now = opts.now?.() ?? Date.now();
  const cutoff = now - opts.windowMs;

  let bucket = buckets.get(opts.key);
  if (!bucket) {
    bucket = { hits: [] };
    buckets.set(opts.key, bucket);
  }

  // Drop hits that fell out of the window.
  bucket.hits = bucket.hits.filter((t) => t > cutoff);

  if (bucket.hits.length >= opts.limit) {
    const oldest = bucket.hits[0]!;
    const retryAfterMs = Math.max(0, oldest + opts.windowMs - now);
    return { allowed: false, retryAfterMs, remaining: 0 };
  }

  bucket.hits.push(now);
  return {
    allowed: true,
    retryAfterMs: 0,
    remaining: opts.limit - bucket.hits.length,
  };
}

/**
 * Best-effort client IP extraction from request headers. Falls back to
 * `unknown` so we never throw — the limiter still applies, just under
 * a shared bucket (which is conservative).
 */
export function clientIpFromHeaders(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip") ?? "unknown";
}
