/**
 * /api/leads
 *
 * POST: public — accept lead-form submissions. Validates input with zod;
 *   when a `propertyId` is provided we'd ideally derive `organization_id`
 *   from the property's owning org, but since the in-memory mock lacks
 *   that lookup, the caller may pass `organization_id` directly (e.g. a
 *   property page that already knows its own org). MVP only.
 *
 * GET: requires a session (enforced by apps/web/middleware.ts) and returns
 *   only leads scoped to the caller's organization_id. Super-admin sees
 *   all leads. The middleware already returns 401 to unauthenticated
 *   callers, so we just read the validated session here.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  getSessionFromCookieValue,
} from "../../lib/auth";
import {
  LeadInput,
  addLead,
  readLeadsForViewer,
} from "./store";

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = LeadInput.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "שם וטלפון הם שדות חובה", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const lead = addLead(parsed.data);

  return NextResponse.json(
    { success: true, id: lead.id, message: "הפנייה נשלחה בהצלחה" },
    { status: 201 },
  );
}

export async function GET(): Promise<Response> {
  const store = await cookies();
  const session = getSessionFromCookieValue(
    store.get(SESSION_COOKIE_NAME)?.value,
  );

  // Defence-in-depth: middleware should have rejected unauthenticated GETs,
  // but if it ever misses (bug, route reordering) we still fail closed here.
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leads = readLeadsForViewer({
    role: session.role,
    organization_id: session.organization_id,
  });

  return NextResponse.json({ leads, total: leads.length });
}
