import { describe, it, expect, beforeEach } from "vitest";
import {
  checkRateLimit,
  clearRateLimitForTesting,
  clientIpFromHeaders,
} from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => clearRateLimitForTesting());

  it("allows requests up to the limit", () => {
    for (let i = 0; i < 5; i++) {
      const r = checkRateLimit({ key: "k", limit: 5, windowMs: 60_000 });
      expect(r.allowed).toBe(true);
    }
  });

  it("rejects the (limit + 1)th request within the window", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit({ key: "k", limit: 5, windowMs: 60_000 });
    }
    const r = checkRateLimit({ key: "k", limit: 5, windowMs: 60_000 });
    expect(r.allowed).toBe(false);
    expect(r.retryAfterMs).toBeGreaterThan(0);
  });

  it("isolates buckets by key", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit({ key: "a", limit: 5, windowMs: 60_000 });
    }
    const r = checkRateLimit({ key: "b", limit: 5, windowMs: 60_000 });
    expect(r.allowed).toBe(true);
  });

  it("recovers after the window slides past old hits", () => {
    let now = 1_000_000;
    for (let i = 0; i < 5; i++) {
      checkRateLimit({ key: "k", limit: 5, windowMs: 60_000, now: () => now });
    }
    expect(
      checkRateLimit({ key: "k", limit: 5, windowMs: 60_000, now: () => now }).allowed,
    ).toBe(false);

    now += 60_001;
    expect(
      checkRateLimit({ key: "k", limit: 5, windowMs: 60_000, now: () => now }).allowed,
    ).toBe(true);
  });

  it("retryAfterMs counts down toward zero", () => {
    let now = 1_000_000;
    for (let i = 0; i < 5; i++) {
      checkRateLimit({ key: "k", limit: 5, windowMs: 60_000, now: () => now });
    }
    const a = checkRateLimit({ key: "k", limit: 5, windowMs: 60_000, now: () => now });
    expect(a.retryAfterMs).toBe(60_000);

    now += 30_000;
    const b = checkRateLimit({ key: "k", limit: 5, windowMs: 60_000, now: () => now });
    expect(b.retryAfterMs).toBe(30_000);
  });
});

describe("clientIpFromHeaders", () => {
  it("uses first hop in X-Forwarded-For", () => {
    const h = new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" });
    expect(clientIpFromHeaders(h)).toBe("203.0.113.5");
  });

  it("falls back to X-Real-IP", () => {
    const h = new Headers({ "x-real-ip": "192.0.2.7" });
    expect(clientIpFromHeaders(h)).toBe("192.0.2.7");
  });

  it("returns unknown when no header is set", () => {
    const h = new Headers();
    expect(clientIpFromHeaders(h)).toBe("unknown");
  });
});
