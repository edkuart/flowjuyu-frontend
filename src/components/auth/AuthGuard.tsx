"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { getDefaultDestination } from "@/lib/authRoutes";
import { buildConsentReviewPath } from "@/lib/consentNavigation";
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
 *   - Not authenticated          → /login
 *   - Needs consent              → /consent/review
 *   - Authenticated, wrong role  → role's own dashboard
 */
export default function AuthGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: Role[];
}) {
  const { user, ready, consentReady, needsConsent } = useAuth();
  const didRedirect = useRef(false);

  const isAuthorized =
    ready &&
    consentReady &&
    !!user &&
    allowedRoles.includes(user.role) &&
    !needsConsent;

  useEffect(() => {
    if (!ready || !consentReady || isAuthorized || didRedirect.current) return;

    didRedirect.current = true;

    if (user) {
      if (needsConsent) {
        window.location.replace(
          buildConsentReviewPath(
            window.location.pathname + window.location.search,
          ),
        );
        return;
      }

      window.location.replace(getDefaultDestination(user.role));
      return;
    }

    const loginUrl = new URL("/login", window.location.origin);
    loginUrl.searchParams.set(
      "redirectTo",
      window.location.pathname + window.location.search,
    );
    window.location.replace(loginUrl.toString());
  }, [ready, consentReady, isAuthorized, user, needsConsent]);

  if (!ready || !consentReady || !isAuthorized) return null;

  return <>{children}</>;
}
