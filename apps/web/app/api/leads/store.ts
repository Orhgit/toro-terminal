import { z } from "zod";

/**
 * In-memory lead store with tenant scoping.
 *
 * Public form submissions create leads with an optional `organization_id`
 * (derived from the property the lead is interested in, or null for
 * platform-level inquiries). Reads MUST filter by the caller's
 * organization_id; super_admin sees all.
 *
 * MVP only — RIN-389 tracks migration to Supabase. The `filterForViewer`
 * function is what we'll move into a SQL `WHERE` clause once that lands;
 * the contract test in store.test.ts protects the invariant.
 */

export type LeadSource = "form" | "whatsapp" | "phone";

export interface StoredLead {
  id: string;
  organization_id: string | null;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  propertyId?: string;
  propertyAddress?: string;
  source: LeadSource;
  createdAt: string;
}

export const LeadInput = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(1).max(40),
  email: z.string().email().max(200).optional(),
  message: z.string().max(500).optional(),
  propertyId: z.string().max(100).optional(),
  propertyAddress: z.string().max(200).optional(),
  source: z.enum(["form", "whatsapp", "phone"]).default("form"),
  organization_id: z.string().uuid().nullable().optional(),
});
export type LeadInput = z.infer<typeof LeadInput>;

const leads: StoredLead[] = [];

export function clearLeadsForTesting(): void {
  leads.length = 0;
}

export function listLeadsForTesting(): readonly StoredLead[] {
  return leads;
}

export function addLead(input: LeadInput): StoredLead {
  const sanitizedPhone = input.phone.replace(/[^\d\-+]/g, "");
  const lead: StoredLead = {
    id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    organization_id: input.organization_id ?? null,
    name: input.name.trim().slice(0, 100),
    phone: sanitizedPhone,
    email: input.email?.trim().slice(0, 100),
    message: input.message?.trim().slice(0, 500),
    propertyId: input.propertyId,
    propertyAddress: input.propertyAddress?.slice(0, 200),
    source: input.source,
    createdAt: new Date().toISOString(),
  };
  leads.push(lead);
  return lead;
}

export interface ViewerContext {
  role: "super_admin" | "org_owner" | "agent" | "viewer";
  organization_id: string | null;
}

/**
 * Tenant-scoped read. The exact same filter must be applied when this
 * store is migrated to Supabase: `WHERE organization_id = :orgId`.
 *
 * - super_admin: sees all leads (audit / oversight).
 * - others: only sees leads with matching organization_id. Platform-level
 *   leads (organization_id IS NULL) are never shown to non-super_admin
 *   viewers, since we cannot prove the caller "owns" them.
 */
export function filterForViewer(
  all: readonly StoredLead[],
  viewer: ViewerContext,
): StoredLead[] {
  if (viewer.role === "super_admin") return [...all];
  if (!viewer.organization_id) return [];
  return all.filter((l) => l.organization_id === viewer.organization_id);
}

export function readLeadsForViewer(viewer: ViewerContext): StoredLead[] {
  return filterForViewer(leads, viewer);
}
