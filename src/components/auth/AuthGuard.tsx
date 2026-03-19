"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
 * Uses useRef to prevent double-redirect in React 18 Strict Mode.
 */
export default function AuthGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: Role[];
}) {
  const router = useRouter();
  const { user, token, ready } = useAuth();
  const didRedirect = useRef(false);

  // Derived — no useState needed. Recomputes on every render; React bails out
  // of DOM updates when result is stable.
  const isAuthorized =
    ready && !!user && !!token && allowedRoles.includes(user.role);

  useEffect(() => {
    if (!ready || isAuthorized || didRedirect.current) return;

    didRedirect.current = true;

    if (user && token) {
      // Authenticated but wrong role — send to their own dashboard.
      router.replace(getDefaultDestination(user.role));
    } else {
      // No session at all — send to login.
      router.replace("/login");
    }
  }, [ready, isAuthorized, user, token, router]);

  // Still hydrating from localStorage. Middleware already blocked unauthorized
  // requests, so this null window is always brief for legitimate users.
  if (!ready || !isAuthorized) return null;

  return <>{children}</>;
}
