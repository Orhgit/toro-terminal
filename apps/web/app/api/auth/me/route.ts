import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, getSessionFromCookieValue } from "../../../lib/auth";

export async function GET(): Promise<Response> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE_NAME)?.value;
  const session = getSessionFromCookieValue(raw);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: session.user_id,
      email: session.email,
      role: session.role,
      organization_id: session.organization_id,
    },
  });
}
