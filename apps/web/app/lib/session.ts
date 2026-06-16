import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Compact HMAC-signed session cookie.
 *
 * Format: `<base64url(payload-json)>.<base64url(hmac-sha256)>`
 *
 * The cookie is httpOnly, so the browser cannot read it from JS. Even if a
 * client tampers with the payload, the HMAC will not match the new payload
 * and verifySession will reject it. This blocks the privilege-escalation
 * attack from RIN-378 (editing the role cookie in DevTools).
 */

export type SessionPayload = {
  user_id: string;
  email: string;
  role: "super_admin" | "org_owner" | "agent" | "viewer";
  organization_id: string | null;
  exp: number; // unix seconds
};

const COOKIE_NAME = "toro-session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set to a string of at least 32 chars",
    );
  }
  return secret;
}

function base64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64url(s: string): Buffer {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  return Buffer.from(padded, "base64");
}

export function signSession(
  payload: Omit<SessionPayload, "exp"> & { exp?: number },
  secret: string = getSessionSecret(),
): string {
  const exp = payload.exp ?? Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const full: SessionPayload = { ...payload, exp };
  const body = base64url(JSON.stringify(full));
  const sig = base64url(createHmac("sha256", secret).update(body).digest());
  return `${body}.${sig}`;
}

export function verifySession(
  token: string | undefined,
  secret: string = getSessionSecret(),
): SessionPayload | null {
  if (!token) return null;

  const dot = token.indexOf(".");
  if (dot < 0) return null;

  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const expected = base64url(createHmac("sha256", secret).update(body).digest());

  if (sig.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(fromBase64url(body).toString("utf8"));
  } catch {
    return null;
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as { user_id?: unknown }).user_id !== "string" ||
    typeof (parsed as { exp?: unknown }).exp !== "number"
  ) {
    return null;
  }

  const payload = parsed as SessionPayload;

  if (payload.exp < Math.floor(Date.now() / 1000)) return null;

  return payload;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_TTL_SECONDS_EXPORT = SESSION_TTL_SECONDS;
