import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verify a Linear webhook HMAC signature.
 *
 * Linear sends `Linear-Signature: <hex>` (no prefix) on POST events.
 * The HMAC key is the per-webhook signing secret, configured in Linear
 * (Settings → API → Webhooks). Returns true if the signature matches the
 * raw body under the secret. Constant-time comparison.
 */
export function verifyLinearSignature(
  rawBody: Buffer,
  signatureHeader: string | undefined,
  webhookSecret: string,
): boolean {
  if (!signatureHeader || !webhookSecret) return false;

  const expected = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");

  if (signatureHeader.length !== expected.length) return false;

  return timingSafeEqual(
    Buffer.from(signatureHeader, "hex"),
    Buffer.from(expected, "hex"),
  );
}
