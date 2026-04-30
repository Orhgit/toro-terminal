"use client";

/**
 * Global error boundary — catches unhandled errors in all routes.
 */

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to whatever error tracker is wired up at runtime. We log to
    // console as a fallback so dev mode keeps working without setup;
    // production should ship Sentry/PostHog and replace this body.
    // TODO(RIN-389): integrate Sentry SDK and call Sentry.captureException.
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("App error:", error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6" dir="rtl">
      <div className="text-center max-w-md mx-auto">
        <div className="bg-red-50 text-red-500 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-black text-slate-800 mb-2">משהו השתבש</h1>
        <p className="text-sm text-slate-500 mb-6">
          אירעה שגיאה לא צפויה. נסה לרענן את הדף או לחזור לדף הבית.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" /> נסה שוב
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 transition"
          >
            <Home className="h-4 w-4" /> דף הבית
          </Link>
        </div>
        {error.digest && (
          <p className="text-[10px] text-slate-300 mt-6 font-mono">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
