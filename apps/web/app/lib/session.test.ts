import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { signSession, verifySession } from "./session";

const SECRET_A = "test-secret-padded-to-32-chars-aaaa";
const SECRET_B = "different-secret-padded-32-chars-bb";

const PAYLOAD = {
  user_id: "11111111-1111-1111-1111-111111111111",
  email: "or@toro.co.il",
  role: "super_admin" as const,
  organization_id: null,
};

describe("session sign/verify", () => {
  it("round-trips a valid session", () => {
    const token = signSession(PAYLOAD, SECRET_A);
    const parsed = verifySession(token, SECRET_A);
    expect(parsed?.user_id).toBe(PAYLOAD.user_id);
    expect(parsed?.role).toBe("super_admin");
  });

  it("rejects a token signed with a different secret", () => {
    const token = signSession(PAYLOAD, SECRET_B);
    expect(verifySession(token, SECRET_A)).toBeNull();
  });

  it("rejects a tampered payload", () => {
    const token = signSession(PAYLOAD, SECRET_A);
    const [body, sig] = token.split(".") as [string, string];
    // Replace role=super_admin → role=agent in body without re-signing.
    // Decoding/encoding should produce a different body, so HMAC mismatch.
    const tampered = body.slice(0, -1) + (body.slice(-1) === "A" ? "B" : "A");
    expect(verifySession(`${tampered}.${sig}`, SECRET_A)).toBeNull();
  });

  it("rejects a tampered signature", () => {
    const token = signSession(PAYLOAD, SECRET_A);
    const tampered = token.slice(0, -1) + (token.slice(-1) === "A" ? "B" : "A");
    expect(verifySession(tampered, SECRET_A)).toBeNull();
  });

  it("rejects an expired session", () => {
    const past = Math.floor(Date.now() / 1000) - 60;
    const token = signSession({ ...PAYLOAD, exp: past }, SECRET_A);
    expect(verifySession(token, SECRET_A)).toBeNull();
  });

  it("rejects undefined / empty token", () => {
    expect(verifySession(undefined, SECRET_A)).toBeNull();
    expect(verifySession("", SECRET_A)).toBeNull();
  });

  it("rejects malformed token without a dot", () => {
    expect(verifySession("not-a-valid-token", SECRET_A)).toBeNull();
  });

  it("requires a SESSION_SECRET of at least 32 chars when using default", () => {
    const original = process.env.SESSION_SECRET;
    process.env.SESSION_SECRET = "too-short";
    expect(() => signSession(PAYLOAD)).toThrow(/at least 32/);
    process.env.SESSION_SECRET = original;
  });
});

describe("session env handling", () => {
  let original: string | undefined;
  beforeEach(() => {
    original = process.env.SESSION_SECRET;
  });
  afterEach(() => {
    process.env.SESSION_SECRET = original;
  });

  it("uses process.env.SESSION_SECRET as default", () => {
    process.env.SESSION_SECRET = SECRET_A;
    const token = signSession(PAYLOAD);
    const parsed = verifySession(token);
    expect(parsed?.user_id).toBe(PAYLOAD.user_id);
  });
});
