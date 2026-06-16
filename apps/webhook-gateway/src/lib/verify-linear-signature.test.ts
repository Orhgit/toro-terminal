import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import { verifyLinearSignature } from "./verify-linear-signature";

const SECRET = "linear-webhook-secret-32-chars-aa";

function sign(body: string, secret: string = SECRET): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

describe("verifyLinearSignature", () => {
  it("accepts a correctly signed body", () => {
    const body = Buffer.from('{"action":"create"}');
    expect(verifyLinearSignature(body, sign(body.toString()), SECRET)).toBe(true);
  });

  it("rejects a tampered body", () => {
    const body = Buffer.from('{"action":"create"}');
    const sig = sign(body.toString());
    const tampered = Buffer.from('{"action":"delete"}');
    expect(verifyLinearSignature(tampered, sig, SECRET)).toBe(false);
  });

  it("rejects a different secret", () => {
    const body = Buffer.from('{}');
    expect(
      verifyLinearSignature(body, sign(body.toString(), "other"), SECRET),
    ).toBe(false);
  });

  it("rejects a missing or empty signature/secret", () => {
    const body = Buffer.from('{}');
    expect(verifyLinearSignature(body, undefined, SECRET)).toBe(false);
    expect(verifyLinearSignature(body, "", SECRET)).toBe(false);
    expect(verifyLinearSignature(body, sign(body.toString()), "")).toBe(false);
  });

  it("rejects truncated signature", () => {
    const body = Buffer.from('{}');
    const sig = sign(body.toString());
    expect(verifyLinearSignature(body, sig.slice(0, -2), SECRET)).toBe(false);
  });
});
