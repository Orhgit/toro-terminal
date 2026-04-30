import { NextResponse, type NextRequest } from "next/server";
import { verifySession } from "./app/lib/session";

/**
 * Server-side route protection.
 *
 * Routes under /admin, /dashboard, /manage and protected /api endpoints
 * require a valid signed session. /admin/super/** additionally requires
 * the super_admin role. The role is read from the HMAC-signed cookie set
 * by /api/auth/login — clients cannot forge it.
 *
 * Public routes (/, /property/*, /properties/*, /agent/*, /login, /api/auth/*,
 * /api/leads POST, /privacy, /terms, /robots.txt, /sitemap.xml) bypass.
 */

const PROTECTED_PREFIXES = ["/admin", "/dashboard", "/manage"];
const SUPER_ADMIN_PREFIX = "/admin/super";

// API endpoints that require a session (anything not explicitly listed is public).
const PROTECTED_API_PREFIXES = ["/api/leads"]; // GET — handled per-method below

export const config = {
  // Match all routes except _next/static, _next/image, favicon, public files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;

  const needsSession =
    PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) ||
    (PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p)) &&
      req.method === "GET");

  if (!needsSession) return NextResponse.next();

  const cookie = req.cookies.get("toro-session")?.value;

  let session;
  try {
    session = verifySession(cookie);
  } catch {
    // Bad config (e.g. SESSION_SECRET missing) — fail closed.
    session = null;
  }

  if (!session) {
    // For HTML pages, redirect to /login with the original path. For API
    // calls return 401 JSON so the client can handle gracefully.
    if (pathname.startsWith("/api/")) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith(SUPER_ADMIN_PREFIX) && session.role !== "super_admin") {
    // Authenticated but wrong role.
    if (pathname.startsWith("/api/")) {
      return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "content-type": "application/json" },
      });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
