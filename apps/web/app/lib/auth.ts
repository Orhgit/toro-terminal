import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@repo/database/client";
import {
  signSession,
  verifySession,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS_EXPORT,
  type SessionPayload,
} from "./session";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: SessionPayload["role"];
  organization_id: string | null;
  full_name: string;
};

export type LoginResult =
  | { ok: true; user: AuthenticatedUser; cookie: string }
  | { ok: false; reason: "invalid_credentials" | "user_inactive" | "config_error" };

/**
 * Look up a user by email in Supabase, verify the password against the
 * stored bcrypt hash, and return a signed session cookie value on success.
 *
 * On any failure path (unknown user, wrong password, inactive user) we return
 * the same generic `invalid_credentials` to avoid leaking which emails exist.
 */
export async function loginUser(
  email: string,
  password: string,
): Promise<LoginResult> {
  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return { ok: false, reason: "config_error" };
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, email, role, organization_id, full_name, is_active, password_hash")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (error || !data) {
    return { ok: false, reason: "invalid_credentials" };
  }

  if (!data.is_active) {
    return { ok: false, reason: "user_inactive" };
  }

  if (!data.password_hash) {
    // User exists but has no password set (e.g. invited but never finished signup).
    return { ok: false, reason: "invalid_credentials" };
  }

  const ok = await bcrypt.compare(password, data.password_hash);
  if (!ok) {
    return { ok: false, reason: "invalid_credentials" };
  }

  const user: AuthenticatedUser = {
    id: data.id,
    email: data.email,
    role: data.role,
    organization_id: data.organization_id,
    full_name: data.full_name,
  };

  const cookie = signSession({
    user_id: user.id,
    email: user.email,
    role: user.role,
    organization_id: user.organization_id,
  });

  // Best-effort last_login_at; don't fail the login if this errors.
  void supabase
    .from("users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", user.id);

  return { ok: true, user, cookie };
}

export function getSessionFromCookieValue(
  raw: string | undefined,
): SessionPayload | null {
  return verifySession(raw);
}

export { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS_EXPORT };
