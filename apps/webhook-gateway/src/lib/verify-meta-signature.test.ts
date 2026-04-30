import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import { verifyMetaSignature } from "./verify-meta-signature";

const SECRET = "test-app-secret-123";

function sign(body: string, secret: string = SECRET): string {
  return "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
}

describe("verifyMetaSignature", () => {
  it("accepts a correctly signed body", () => {
    const body = Buffer.from('{"object":"whatsapp_business_account"}');
    const sig = sign(body.toString());
    expect(verifyMetaSignature(body, sig, SECRET)).toBe(true);
  });

  it("rejects a body with a tampered signature", () => {
    const body = Buffer.from('{"object":"whatsapp_business_account"}');
    const sig = sign(body.toString());
    const tampered = sig.slice(0, -1) + "0";
    expect(verifyMetaSignature(body, tampered, SECRET)).toBe(false);
  });

  it("rejects when signature was made with a different secret", () => {
    const body = Buffer.from('{"foo":"bar"}');
    const sig = sign(body.toString(), "wrong-secret");
    expect(verifyMetaSignature(body, sig, SECRET)).toBe(false);
  });

  it("rejects when body has been modified after signing", () => {
    const body = Buffer.from('{"foo":"bar"}');
    const sig = sign(body.toString());
    const modified = Buffer.from('{"foo":"baz"}');
    expect(verifyMetaSignature(modified, sig, SECRET)).toBe(false);
  });

  it("rejects a missing signature header", () => {
    const body = Buffer.from('{}');
    expect(verifyMetaSignature(body, undefined, SECRET)).toBe(false);
  });

  it("rejects a header without the sha256= prefix", () => {
    const body = Buffer.from('{}');
    const hex = createHmac("sha256", SECRET).update(body).digest("hex");
    expect(verifyMetaSignature(body, hex, SECRET)).toBe(false);
  });

  it("rejects an empty app secret", () => {
    const body = Buffer.from('{}');
    const sig = sign(body.toString());
    expect(verifyMetaSignature(body, sig, "")).toBe(false);
  });
});
