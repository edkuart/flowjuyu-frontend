import { getDefaultDestination, type Role } from "@/lib/authRoutes";
import { safeAppRedirectForRole, safeInternalPath } from "@/lib/safeRedirect";

export function buildConsentReviewPath(next?: string | null): string {
  const url = new URL("/consent/review", "http://flowjuyu.local");
  const safeNext = safeInternalPath(next);

  if (safeNext) {
    url.searchParams.set("next", safeNext);
  }

  return url.pathname + url.search;
}

export function resolvePostConsentDestination(
  rawNext: string | null | undefined,
  role: Role,
): string {
  return safeAppRedirectForRole(rawNext, role) ?? getDefaultDestination(role);
}
