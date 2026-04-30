"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "super_admin" | "org_owner" | "agent" | "viewer";

interface AuthState {
  role: UserRole | null;
  email: string | null;
  isLoading: boolean;
}

/**
 * Client-side auth hook — fetches the current user from /api/auth/me.
 *
 * The session itself lives in an httpOnly cookie that the browser cannot read
 * directly. Server-side route protection is enforced by `apps/web/middleware.ts`;
 * this hook is for display-only reads of the authenticated user. If the session
 * is missing or invalid, the middleware redirects to /login before this hook
 * even runs on a protected page.
 */
export function useAuth(requiredRole?: UserRole): AuthState {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ role: null, email: null, isLoading: true });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) {
            router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
          }
          return;
        }
        const data = await res.json();
        const role: UserRole | null = data?.user?.role ?? null;
        const email: string | null = data?.user?.email ?? null;

        if (requiredRole && role !== requiredRole) {
          if (!cancelled) router.replace("/");
          return;
        }

        if (!cancelled) setState({ role, email, isLoading: false });
      } catch {
        if (!cancelled) {
          router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [requiredRole, router]);

  return state;
}
