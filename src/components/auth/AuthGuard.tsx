"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getDefaultDestination } from "@/lib/authRoutes";
import { buildConsentReviewPath } from "@/lib/consentNavigation";
import type { Role } from "@/context/AuthContext";

export default function AuthGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: Role[];
}) {
  const router = useRouter();
  const { user, ready, needsConsent } = useAuth();
  const didRedirect = useRef(false);

  const isAuthorized =
    ready && !!user && allowedRoles.includes(user.role) && !needsConsent;

  useEffect(() => {
    if (!ready) return;
    if (didRedirect.current) return;

    if (!user) {
      didRedirect.current = true;
      const loginUrl = new URL("/login", window.location.origin);
      loginUrl.searchParams.set(
        "redirectTo",
        window.location.pathname + window.location.search,
      );
      router.replace(loginUrl.pathname + loginUrl.search);
      return;
    }

    if (needsConsent) {
      didRedirect.current = true;
      router.replace(
        buildConsentReviewPath(
          window.location.pathname + window.location.search,
        ),
      );
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      didRedirect.current = true;
      router.replace(getDefaultDestination(user.role));
    }
  }, [ready, user, needsConsent, allowedRoles, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4 py-10">
        <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-sm text-neutral-600 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Preparando tu cuenta...
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return <>{children}</>;
}
