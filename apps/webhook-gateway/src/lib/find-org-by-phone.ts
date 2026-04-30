import type { SupabaseClient } from "@repo/database/client";

/**
 * Resolve the organization that owns a given WhatsApp business phone number.
 *
 * The webhook payload tells us which BUSINESS phone received the message
 * (the merchant's WhatsApp Business number). We map that back to the
 * tenant via `organizations.phone`. If no org matches, we return null —
 * the caller MUST fail-closed (skip the message) rather than insert an
 * orphan row, otherwise multi-tenancy is broken (RIN-382).
 */
export async function findOrgByPhone(
  supabase: SupabaseClient,
  rawPhone: string | null | undefined,
): Promise<{ id: string } | null> {
  if (!rawPhone) return null;

  // Normalize: Meta sends digits-only, our `organizations.phone` may have
  // formatting (spaces, hyphens, leading +). Compare on digits.
  const digits = rawPhone.replace(/\D+/g, "");
  if (digits.length < 7) return null;

  const { data, error } = await supabase
    .from("organizations")
    .select("id, phone")
    .not("phone", "is", null);

  if (error || !data) return null;

  const match = data.find((org) => {
    const orgDigits = String(org.phone ?? "").replace(/\D+/g, "");
    return orgDigits.length > 0 && orgDigits === digits;
  });

  return match ? { id: match.id } : null;
}
