import { describe, it, expect, beforeEach } from "vitest";
import {
  addLead,
  clearLeadsForTesting,
  listLeadsForTesting,
  filterForViewer,
  readLeadsForViewer,
  type StoredLead,
  type ViewerContext,
} from "./store";

const ORG_A = "11111111-1111-1111-1111-111111111111";
const ORG_B = "22222222-2222-2222-2222-222222222222";

describe("lead store — tenant isolation contract", () => {
  beforeEach(() => clearLeadsForTesting());

  it("addLead defaults organization_id to null", () => {
    const lead = addLead({ name: "Anon", phone: "0501234567", source: "form" });
    expect(lead.organization_id).toBeNull();
  });

  it("addLead persists organization_id when provided", () => {
    const lead = addLead({
      name: "Org A user",
      phone: "0501234567",
      source: "form",
      organization_id: ORG_A,
    });
    expect(lead.organization_id).toBe(ORG_A);
    expect(listLeadsForTesting()).toHaveLength(1);
  });

  it("filterForViewer returns only leads matching the viewer's org", () => {
    const a1 = addLead({ name: "A1", phone: "1", source: "form", organization_id: ORG_A });
    addLead({ name: "B1", phone: "2", source: "form", organization_id: ORG_B });
    addLead({ name: "Public", phone: "3", source: "form" });

    const asA: ViewerContext = { role: "org_owner", organization_id: ORG_A };
    const visible = filterForViewer(listLeadsForTesting(), asA);

    expect(visible).toHaveLength(1);
    expect(visible[0]?.id).toBe(a1.id);
  });

  it("filterForViewer hides platform-level (null org) leads from non-super_admin", () => {
    addLead({ name: "Platform", phone: "1", source: "form" });
    const visible = filterForViewer(listLeadsForTesting(), {
      role: "org_owner",
      organization_id: ORG_A,
    });
    expect(visible).toHaveLength(0);
  });

  it("filterForViewer returns ALL leads to super_admin", () => {
    addLead({ name: "A1", phone: "1", source: "form", organization_id: ORG_A });
    addLead({ name: "B1", phone: "2", source: "form", organization_id: ORG_B });
    addLead({ name: "Public", phone: "3", source: "form" });

    const visible = filterForViewer(listLeadsForTesting(), {
      role: "super_admin",
      organization_id: null,
    });

    expect(visible).toHaveLength(3);
  });

  it("filterForViewer returns empty when non-super_admin has no organization_id", () => {
    addLead({ name: "X", phone: "1", source: "form", organization_id: ORG_A });
    const visible = filterForViewer(listLeadsForTesting(), {
      role: "agent",
      organization_id: null,
    });
    expect(visible).toHaveLength(0);
  });

  it("contract: tenant A and tenant B never see each other's leads", () => {
    addLead({ name: "A1", phone: "1", source: "form", organization_id: ORG_A });
    addLead({ name: "A2", phone: "2", source: "form", organization_id: ORG_A });
    addLead({ name: "B1", phone: "3", source: "form", organization_id: ORG_B });

    const asA = readLeadsForViewer({ role: "org_owner", organization_id: ORG_A });
    const asB = readLeadsForViewer({ role: "org_owner", organization_id: ORG_B });

    const aIds = new Set(asA.map((l: StoredLead) => l.id));
    const bIds = new Set(asB.map((l: StoredLead) => l.id));

    // No overlap.
    for (const id of aIds) expect(bIds.has(id)).toBe(false);
    expect(asA).toHaveLength(2);
    expect(asB).toHaveLength(1);
  });
});
