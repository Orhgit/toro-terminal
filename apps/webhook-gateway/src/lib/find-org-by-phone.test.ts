import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@repo/database/client";
import { findOrgByPhone } from "./find-org-by-phone";

function fakeSupabase(rows: Array<{ id: string; phone: string | null }> | null): SupabaseClient {
  return {
    from: () => ({
      select: () => ({
        not: () =>
          Promise.resolve({
            data: rows,
            error: rows === null ? new Error("db error") : null,
          }),
      }),
    }),
  } as unknown as SupabaseClient;
}

describe("findOrgByPhone", () => {
  it("matches when digits-only phones are equal", async () => {
    const sb = fakeSupabase([
      { id: "org-a", phone: "+972-50-123-4567" },
      { id: "org-b", phone: "(972) 4 555 1111" },
    ]);
    const result = await findOrgByPhone(sb, "972501234567");
    expect(result).toEqual({ id: "org-a" });
  });

  it("matches when org phone has formatting and webhook is digits-only", async () => {
    const sb = fakeSupabase([{ id: "org-c", phone: "972-3-555-9999" }]);
    const result = await findOrgByPhone(sb, "97235559999");
    expect(result).toEqual({ id: "org-c" });
  });

  it("returns null when no org matches", async () => {
    const sb = fakeSupabase([{ id: "org-a", phone: "972501234567" }]);
    const result = await findOrgByPhone(sb, "972999999999");
    expect(result).toBeNull();
  });

  it("returns null on null/undefined phone", async () => {
    const sb = fakeSupabase([]);
    expect(await findOrgByPhone(sb, null)).toBeNull();
    expect(await findOrgByPhone(sb, undefined)).toBeNull();
  });

  it("returns null on too-short phone", async () => {
    const sb = fakeSupabase([{ id: "org-a", phone: "12345" }]);
    const result = await findOrgByPhone(sb, "12345");
    expect(result).toBeNull();
  });

  it("returns null on DB error", async () => {
    const sb = fakeSupabase(null);
    const result = await findOrgByPhone(sb, "972501234567");
    expect(result).toBeNull();
  });

  it("ignores orgs with empty phone field", async () => {
    const sb = fakeSupabase([
      { id: "org-empty", phone: "" },
      { id: "org-real", phone: "972501234567" },
    ]);
    const result = await findOrgByPhone(sb, "972501234567");
    expect(result).toEqual({ id: "org-real" });
  });
});
