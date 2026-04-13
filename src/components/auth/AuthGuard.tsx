"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getDefaultDestination } from "@/lib/authRoutes";
import { buildConsentReviewPath } from "@/lib/consentNavigation";
import type { Role } from "@/context/AuthContext";
import { getApiUrl } from "@/lib/config";
import { parseConsentStatus } from "@/lib/consent";

type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

function isSessionUser(value: unknown): value is SessionUser {
  if (!value || typeof value !== "object") return false;
  const user = value as Record<string, unknown>;
  return (
    typeof user.id === "number" &&
    typeof user.name === "string" &&
    typeof user.email === "string" &&
    typeof user.role === "string" &&
    ["buyer", "seller", "admin", "support"].includes(user.role as string)
  );
}

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
  const { user, ready, consentReady, needsConsent, refreshConsent } = useAuth();
  const [bootstrapDone, setBootstrapDone] = useState(false);
  const [bootstrapUser, setBootstrapUser] = useState<SessionUser | null>(null);
  const [bootstrapConsentReady, setBootstrapConsentReady] = useState(false);
  const [bootstrapNeedsConsent, setBootstrapNeedsConsent] = useState(false);
  const didRedirect = useRef(false);
  const didRequestConsent = useRef(false);
  const didBootstrap = useRef(false);

  const effectiveReady = ready || bootstrapDone;
  const effectiveUser = user ?? bootstrapUser;
  const effectiveConsentReady = consentReady || bootstrapConsentReady;
  const effectiveNeedsConsent = needsConsent || bootstrapNeedsConsent;

  const isAuthorized =
    effectiveReady &&
    effectiveConsentReady &&
    !!effectiveUser &&
    allowedRoles.includes(effectiveUser.role) &&
    !effectiveNeedsConsent;

  useEffect(() => {
    if (didBootstrap.current) return;
    didBootstrap.current = true;

    void (async () => {
      try {
        const sessionRes = await fetch(`${getApiUrl()}/api/session`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }).catch(() => null);

        if (sessionRes?.ok) {
          const sessionJson = (await sessionRes.json().catch(() => null)) as
            | { user?: unknown }
            | null;
          if (isSessionUser(sessionJson?.user)) {
            setBootstrapUser(sessionJson.user);

            const consentRes = await fetch(`${getApiUrl()}/api/consent/status`, {
              method: "GET",
              credentials: "include",
              cache: "no-store",
              headers: {
                Authorization:
                  typeof window !== "undefined" && localStorage.getItem("token")
                    ? `Bearer ${localStorage.getItem("token")}`
                    : "",
              },
            }).catch(() => null);

            if (consentRes?.ok) {
              const consentJson = await consentRes.json().catch(() => null);
              const parsedConsent = parseConsentStatus(consentJson);
              setBootstrapNeedsConsent(parsedConsent?.needsConsent ?? false);
              setBootstrapConsentReady(true);
            }
          }
        }
      } finally {
        setBootstrapDone(true);
      }
    })();
  }, []);

  useEffect(() => {
    console.log("[auth-guard] state", {
      ready: effectiveReady,
      consentReady: effectiveConsentReady,
      needsConsent: effectiveNeedsConsent,
      user: effectiveUser,
      allowedRoles,
      isAuthorized,
      pathname:
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : null,
    });
  }, [
    allowedRoles,
    effectiveConsentReady,
    effectiveNeedsConsent,
    effectiveReady,
    effectiveUser,
    isAuthorized,
  ]);

  useEffect(() => {
    console.log("[auth-guard] redirect-check", {
      ready: effectiveReady,
      consentReady: effectiveConsentReady,
      isAuthorized,
      needsConsent: effectiveNeedsConsent,
      hasUser: Boolean(effectiveUser),
      didRedirect: didRedirect.current,
    });
    if (
      !effectiveReady ||
      !effectiveConsentReady ||
      isAuthorized ||
      didRedirect.current
    ) {
      return;
    }

    didRedirect.current = true;

    if (effectiveUser) {
      if (effectiveNeedsConsent) {
        window.location.replace(
          buildConsentReviewPath(
            window.location.pathname + window.location.search,
          ),
        );
        return;
      }

      window.location.replace(getDefaultDestination(effectiveUser.role));
      return;
    }

    const loginUrl = new URL("/login", window.location.origin);
    loginUrl.searchParams.set(
      "redirectTo",
      window.location.pathname + window.location.search,
    );
    window.location.replace(loginUrl.toString());
  }, [
    effectiveReady,
    effectiveConsentReady,
    isAuthorized,
    effectiveUser,
    effectiveNeedsConsent,
  ]);

  useEffect(() => {
    if (
      !effectiveReady ||
      !effectiveUser ||
      effectiveConsentReady ||
      didRequestConsent.current
    ) {
      return;
    }

    didRequestConsent.current = true;
    console.log("[auth-guard] forcing-refreshConsent");
    void refreshConsent();
  }, [effectiveReady, effectiveUser, effectiveConsentReady, refreshConsent]);

  if (!effectiveReady || (!!effectiveUser && !effectiveConsentReady)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-sm text-neutral-600 shadow-sm">
          Verificando acceso...
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return <>{children}</>;
}
