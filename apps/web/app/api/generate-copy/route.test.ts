import { describe, it, expect } from "vitest";
import { POST } from "./route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/generate-copy", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/generate-copy", () => {
  it("returns generated copy on valid input", async () => {
    const res = await POST(
      makeRequest({
        address: "רחוב הרצל 1, נתניה",
        rooms: 4,
        sqm: 120,
        propertyType: "דירה",
        highlights: "מרפסת,חניה,מחסן",
      }),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.copy).toContain("רחוב הרצל 1, נתניה");
    expect(json.copy).toContain("✅ מרפסת");
    expect(json.copy).toContain("✅ חניה");
  });

  it("rejects missing address", async () => {
    const res = await POST(
      makeRequest({ rooms: 4, sqm: 120, propertyType: "דירה" }),
    );
    expect(res.status).toBe(400);
  });

  it("rejects oversized address", async () => {
    const res = await POST(
      makeRequest({
        address: "x".repeat(300),
        rooms: 4,
        sqm: 120,
        propertyType: "דירה",
        highlights: "",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("rejects negative rooms", async () => {
    const res = await POST(
      makeRequest({
        address: "רחוב",
        rooms: -1,
        sqm: 120,
        propertyType: "דירה",
        highlights: "",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("rejects unrealistic sqm", async () => {
    const res = await POST(
      makeRequest({
        address: "רחוב",
        rooms: 4,
        sqm: 1_000_000,
        propertyType: "דירה",
        highlights: "",
      }),
    );
    expect(res.status).toBe(400);
  });

  it("strips angle brackets from input (XSS guard)", async () => {
    const res = await POST(
      makeRequest({
        address: "<script>alert(1)</script>",
        rooms: 4,
        sqm: 120,
        propertyType: "דירה",
        highlights: "",
      }),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.copy).not.toContain("<script>");
    expect(json.copy).not.toContain("</script>");
  });

  it("returns 400 on malformed JSON", async () => {
    const req = new Request("http://localhost/api/generate-copy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("caps highlights bullet count at 20", async () => {
    const many = Array.from({ length: 30 }, (_, i) => `feat${i}`).join(",");
    const res = await POST(
      makeRequest({
        address: "רחוב",
        rooms: 4,
        sqm: 120,
        propertyType: "דירה",
        highlights: many,
      }),
    );
    const json = await res.json();
    const bullets = (json.copy as string).match(/✅/g) ?? [];
    expect(bullets.length).toBeLessThanOrEqual(20);
  });
});
