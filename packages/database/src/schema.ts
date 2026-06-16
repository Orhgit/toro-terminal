import { z } from "zod";

// ============================================================
// Enums
// ============================================================

export const PropertyStatus = z.enum([
  "draft",
  "active",
  "under_contract",
  "sold",
  "archived",
]);
export type PropertyStatus = z.infer<typeof PropertyStatus>;

// ============================================================
// Properties
// ============================================================

export const Property = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  created_by: z.string().uuid().nullable(),
  owner_phone: z.string().max(20),
  price_asked: z.number(),
  status: PropertyStatus,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Property = z.infer<typeof Property>;

export const PropertyInsert = Property.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  status: PropertyStatus.default("draft"),
  created_by: z.string().uuid().nullable().default(null),
});
export type PropertyInsert = z.infer<typeof PropertyInsert>;

/**
 * AI-extracted property shape — what the LLM emits before we know the tenant.
 * The WhatsApp handler combines a Draft with `organization_id` to form a
 * full PropertyInsert at the moment of writing to the DB.
 */
export const PropertyDraft = PropertyInsert.omit({
  organization_id: true,
  created_by: true,
});
export type PropertyDraft = z.infer<typeof PropertyDraft>;

// ============================================================
// Geo Location
// ============================================================

export const GeoLocation = z.object({
  id: z.string().uuid(),
  property_id: z.string().uuid(),
  full_address: z.string(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  poi_data: z.record(z.string(), z.unknown()).nullable(),
});
export type GeoLocation = z.infer<typeof GeoLocation>;

export const GeoLocationInsert = GeoLocation.omit({
  id: true,
});
export type GeoLocationInsert = z.infer<typeof GeoLocationInsert>;

// ============================================================
// AI Metadata
// ============================================================

export const AiMetadata = z.object({
  id: z.string().uuid(),
  property_id: z.string().uuid(),
  marketing_copy: z.string().nullable(),
  embedding_vector: z.array(z.number()).length(1536).nullable(),
});
export type AiMetadata = z.infer<typeof AiMetadata>;

export const AiMetadataInsert = AiMetadata.omit({
  id: true,
});
export type AiMetadataInsert = z.infer<typeof AiMetadataInsert>;

// ============================================================
// Leads
// ============================================================

export const Lead = z.object({
  id: z.string().uuid(),
  // Nullable: public form submissions may not be tied to a specific org.
  // Reads must filter by caller's org_id; super_admin sees all.
  organization_id: z.string().uuid().nullable(),
  assigned_to: z.string().uuid().nullable(),
  name: z.string().max(100),
  phone: z.string().max(20),
  budget_max: z.number(),
  city_preferred: z.string().max(100),
  min_rooms: z.number().int(),
  specific_needs: z.string().nullable(),
  created_at: z.string().datetime(),
});
export type Lead = z.infer<typeof Lead>;

export const LeadInsert = Lead.omit({
  id: true,
  created_at: true,
}).extend({
  min_rooms: z.number().int().default(1),
  organization_id: z.string().uuid().nullable().default(null),
  assigned_to: z.string().uuid().nullable().default(null),
});
export type LeadInsert = z.infer<typeof LeadInsert>;

// ============================================================
// User Roles
// ============================================================

export const UserRole = z.enum([
  "super_admin",
  "org_owner",
  "agent",
  "viewer",
]);
export type UserRole = z.infer<typeof UserRole>;

// ============================================================
// Subscription Plans
// ============================================================

export const PlanSlug = z.enum(["free", "starter", "pro", "enterprise"]);
export type PlanSlug = z.infer<typeof PlanSlug>;

export const SubscriptionPlan = z.object({
  id: z.string().uuid(),
  name: z.string().max(50),
  slug: PlanSlug,
  max_listings: z.number().int(),
  max_agents: z.number().int(),
  price_monthly: z.number(),
  features: z.array(z.string()),
  is_active: z.boolean(),
  created_at: z.string().datetime(),
});
export type SubscriptionPlan = z.infer<typeof SubscriptionPlan>;

// ============================================================
// Organizations (Tenants)
// ============================================================

export const Organization = z.object({
  id: z.string().uuid(),
  name: z.string().max(200),
  slug: z.string().max(100),
  logo_url: z.string().nullable(),
  phone: z.string().max(20).nullable(),
  email: z.string().email().nullable(),
  plan: PlanSlug,
  max_listings: z.number().int(),
  is_active: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type Organization = z.infer<typeof Organization>;

export const OrganizationInsert = Organization.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  plan: PlanSlug.default("free"),
  max_listings: z.number().int().default(5),
  is_active: z.boolean().default(true),
});
export type OrganizationInsert = z.infer<typeof OrganizationInsert>;

// ============================================================
// Users
// ============================================================

export const User = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid().nullable(),
  email: z.string().email(),
  full_name: z.string().max(200),
  phone: z.string().max(20).nullable(),
  role: UserRole,
  avatar_url: z.string().nullable(),
  is_active: z.boolean(),
  last_login_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
export type User = z.infer<typeof User>;

export const UserInsert = User.omit({
  id: true,
  created_at: true,
  updated_at: true,
  last_login_at: true,
}).extend({
  role: UserRole.default("agent"),
  is_active: z.boolean().default(true),
});
export type UserInsert = z.infer<typeof UserInsert>;

// ============================================================
// Audit Log
// ============================================================

export const AuditLog = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  organization_id: z.string().uuid().nullable(),
  action: z.string().max(100),
  entity_type: z.string().max(50).nullable(),
  entity_id: z.string().uuid().nullable(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  created_at: z.string().datetime(),
});
export type AuditLog = z.infer<typeof AuditLog>;
