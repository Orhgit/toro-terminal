/**
 * Seed a single user into the `users` table with a bcrypt-hashed password.
 *
 * Usage (from repo root, with .env loaded):
 *   pnpm tsx scripts/seed-user.ts \
 *     --email "or@toro.co.il" \
 *     --password "changeme-please-12chars" \
 *     --name "אור חזן" \
 *     --role super_admin
 *
 * Optional: --org <organization_id>  (omit for super_admin to leave NULL).
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment.
 * Idempotent: re-running with the same email updates the password_hash and
 * role rather than inserting a duplicate.
 *
 * Part of RIN-416 — closes the loop opened by RIN-377/378 (we have the
 * server-side auth code; this gives us a real user to log in with).
 */

import "dotenv/config";
import { parseArgs } from "node:util";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@repo/database/client";

interface Args {
  email: string;
  password: string;
  name: string;
  role: "super_admin" | "org_owner" | "agent" | "viewer";
  org: string | null;
}

function readArgs(): Args {
  const { values } = parseArgs({
    options: {
      email: { type: "string" },
      password: { type: "string" },
      name: { type: "string" },
      role: { type: "string", default: "super_admin" },
      org: { type: "string" },
    },
  });

  if (!values.email || !values.password || !values.name) {
    console.error(
      "usage: tsx scripts/seed-user.ts --email <e> --password <p> --name <n> [--role <r>] [--org <id>]",
    );
    process.exit(1);
  }

  if (values.password.length < 12) {
    // Higher bar for seeded accounts than the API's 8-char minimum: these
    // are typically admin / ops accounts that live a long time.
    console.error("password must be at least 12 chars for a seeded account");
    process.exit(1);
  }

  const role = values.role as Args["role"];
  if (!["super_admin", "org_owner", "agent", "viewer"].includes(role)) {
    console.error(`invalid role "${role}"`);
    process.exit(1);
  }

  return {
    email: values.email.trim().toLowerCase(),
    password: values.password,
    name: values.name,
    role,
    org: values.org ?? null,
  };
}

async function main(): Promise<void> {
  const args = readArgs();

  const supabase = getSupabaseAdmin();
  const password_hash = await bcrypt.hash(args.password, 12);

  // Try to update first (idempotent re-runs); fall back to insert.
  const { data: existing, error: lookupErr } = await supabase
    .from("users")
    .select("id")
    .eq("email", args.email)
    .maybeSingle();

  if (lookupErr) {
    console.error("lookup failed:", lookupErr.message);
    process.exit(1);
  }

  if (existing) {
    const { error } = await supabase
      .from("users")
      .update({
        password_hash,
        role: args.role,
        full_name: args.name,
        organization_id: args.org,
        is_active: true,
      })
      .eq("id", existing.id);
    if (error) {
      console.error("update failed:", error.message);
      process.exit(1);
    }
    console.log(`updated user ${args.email} (id=${existing.id}, role=${args.role})`);
    return;
  }

  const { data, error } = await supabase
    .from("users")
    .insert({
      email: args.email,
      full_name: args.name,
      role: args.role,
      organization_id: args.org,
      password_hash,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) {
    console.error("insert failed:", error.message);
    process.exit(1);
  }

  console.log(`seeded user ${args.email} (id=${data.id}, role=${args.role})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
