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
});
export type PropertyInsert = z.infer<typeof PropertyInsert>;

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
});
export type LeadInsert = z.infer<typeof LeadInsert>;
