import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verify a Meta-style HMAC-SHA256 signature on a raw request body.
 *
 * Meta sends `X-Hub-Signature-256: sha256=<hex>` on POST webhook events.
 * The HMAC key is the app secret (NOT the verify token, which is GET-only).
 *
 * Returns true if the signature matches the body under the secret.
 * Constant-time comparison to avoid timing oracles.
 */
export function verifyMetaSignature(
  rawBody: Buffer,
  signatureHeader: string | undefined,
  appSecret: string,
): boolean {
  if (!signatureHeader || !appSecret) return false;

  const prefix = "sha256=";
  if (!signatureHeader.startsWith(prefix)) return false;

  const provided = signatureHeader.slice(prefix.length);
  const expected = createHmac("sha256", appSecret).update(rawBody).digest("hex");

  if (provided.length !== expected.length) return false;

  return timingSafeEqual(Buffer.from(provided, "hex"), Buffer.from(expected, "hex"));
}
