"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { getDefaultDestination } from "@/lib/authRoutes";
import type { Role } from "@/context/AuthContext";

/**
 * Client-side secondary auth guard.
 *
 * Middleware (server) is the primary gate — it blocks unauthenticated and
 * wrong-role users before the page renders. AuthGuard exists as a fallback
 * for cases where middleware cannot act (e.g. stale cookie, race on token
 * rotation) and as an explicit signal in the layout tree that a route
 * requires specific roles.
 *
 * Redirect behavior mirrors middleware:
 *   - Not authenticated       → /login
 *   - Authenticated, wrong role → role's own dashboard (not /login)
 *
 * WHY window.location.replace instead of router.replace:
 *   router.replace() uses React.startTransition internally and can be silently
 *   cancelled by concurrent re-renders (e.g. from AuthContext state updates
 *   arriving at the same time). window.location.replace() is a synchronous
 *   browser API and cannot be cancelled by React's scheduler.
 *
 * WHY router is NOT imported:
 *   Including router in the useEffect dep array caused spurious re-runs because
 *   useRouter() returns a new object reference during hydration and prefetches.
 *
 * WHY redirect only when ready === true:
 *   Redirecting while ready=false would fire before /api/session settles,
 *   incorrectly booting authenticated users who just haven't been confirmed yet.
 */
export default function AuthGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: Role[];
}) {
  const { user, ready } = useAuth();
  const didRedirect = useRef(false);

  const isAuthorized =
    ready && !!user && allowedRoles.includes(user.role);

  useEffect(() => {
    // Wait for session to settle. Redirecting during loading would boot
    // authenticated users who haven't been confirmed by /api/session yet.
    if (!ready || isAuthorized || didRedirect.current) return;

    didRedirect.current = true;

    if (user) {
      // Authenticated but wrong role — send to their own dashboard.
      window.location.replace(getDefaultDestination(user.role));
    } else {
      // No confirmed session — send to login.
      window.location.replace("/login");
    }
  }, [ready, isAuthorized, user]);

  if (!ready || !isAuthorized) return null;

  return <>{children}</>;
}
