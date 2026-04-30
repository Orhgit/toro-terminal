import { NextResponse } from "next/server";
import { z } from "zod";
import {
  loginUser,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS_EXPORT,
} from "../../../lib/auth";
import { checkRateLimit, clientIpFromHeaders } from "../../../lib/rate-limit";

const Body = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
});

// Slow brute-force / credential-stuffing: 5 attempts per minute per IP.
// Tight enough to deter scripts; loose enough that a forgetful human
// can still try a few times.
const LOGIN_RATE_LIMIT = 5;
const LOGIN_RATE_WINDOW_MS = 60_000;

export async function POST(request: Request): Promise<Response> {
  const ip = clientIpFromHeaders(request.headers);
  const rate = checkRateLimit({
    key: `login:${ip}`,
    limit: LOGIN_RATE_LIMIT,
    windowMs: LOGIN_RATE_WINDOW_MS,
  });
  if (!rate.allowed) {
    return new NextResponse(
      JSON.stringify({ error: "יותר מדי ניסיונות, נסה שוב בעוד רגע" }),
      {
        status: 429,
        headers: {
          "content-type": "application/json",
          "retry-after": String(Math.ceil(rate.retryAfterMs / 1000)),
        },
      },
    );
  }

  let parsed;
  try {
    parsed = Body.safeParse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;

  const result = await loginUser(email, password);

  if (!result.ok) {
    if (result.reason === "config_error") {
      return NextResponse.json(
        { error: "Server is not configured for auth" },
        { status: 503 },
      );
    }
    if (result.reason === "user_inactive") {
      return NextResponse.json(
        { error: "Account is inactive" },
        { status: 403 },
      );
    }
    // Generic failure for invalid_credentials — never leak user existence.
    return NextResponse.json(
      { error: "Email or password is incorrect" },
      { status: 401 },
    );
  }

  const redirectTo =
    result.user.role === "super_admin" ? "/admin/super" : "/manage";

  const res = NextResponse.json({
    ok: true,
    role: result.user.role,
    email: result.user.email,
    redirectTo,
  });

  res.cookies.set(SESSION_COOKIE_NAME, result.cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS_EXPORT,
  });

  return res;
}
