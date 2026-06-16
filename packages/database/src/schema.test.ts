import { describe, it, expect } from "vitest";
import { Property, PropertyStatus, GeoLocation } from "./schema";

describe("Property schema", () => {
  const baseProperty = {
    id: "11111111-1111-1111-1111-111111111111",
    organization_id: "22222222-2222-2222-2222-222222222222",
    created_by: null,
    owner_phone: "+972501234567",
    price_asked: 1850000,
    status: "active" as const,
    created_at: "2026-04-30T00:00:00.000Z",
    updated_at: "2026-04-30T00:00:00.000Z",
  };

  it("accepts a valid Property", () => {
    expect(() => Property.parse(baseProperty)).not.toThrow();
  });

  it("rejects an unknown status", () => {
    const result = PropertyStatus.safeParse("listed");
    expect(result.success).toBe(false);
  });

  it("rejects a non-UUID id", () => {
    expect(() => Property.parse({ ...baseProperty, id: "not-a-uuid" })).toThrow();
  });

  it("rejects a Property without organization_id (multi-tenancy invariant)", () => {
    const { organization_id: _, ...withoutOrg } = baseProperty;
    expect(() => Property.parse(withoutOrg)).toThrow();
  });

  it("rejects a Property with non-UUID organization_id", () => {
    expect(() =>
      Property.parse({ ...baseProperty, organization_id: "not-a-uuid" }),
    ).toThrow();
  });
});

describe("GeoLocation schema", () => {
  it("rejects out-of-range latitude", () => {
    const result = GeoLocation.safeParse({
      id: "11111111-1111-1111-1111-111111111111",
      property_id: "22222222-2222-2222-2222-222222222222",
      full_address: "רחוב הרצל 1, נתניה",
      lat: 200,
      lng: 34.85,
      poi_data: null,
    });
    expect(result.success).toBe(false);
  });
});
