/**
 * src/lib/authRoutes.ts
 *
 * Single source of truth for route-to-role access rules.
 *
 * Imported by:
 *   - src/middleware.ts          (Edge Runtime — MUST stay free of React/browser APIs)
 *   - src/components/auth/AuthGuard.tsx
 *   - src/lib/safeRedirect.ts
 *   - src/components/auth/LoginForm.tsx
 *
 * Rules: no "use client", no React imports, no Node.js APIs.
 * Pure TypeScript — safe for the Edge Runtime.
 */

// ─── Canonical role type ──────────────────────────────────────────────────────
// Duplicated intentionally: AuthContext.tsx exports its own Role for React code;
// this one exists so middleware and pure helpers never import from a "use client"
// module. Both resolve to the same string union so they are structurally compatible.

export type Role = "buyer" | "seller" | "admin" | "support";

// ─── Route → allowed roles ────────────────────────────────────────────────────
//
// Access matrix for all protected route groups.
// "admin" is included in every group so operators can reach any section.
//
// Evaluated in order — first matching prefix wins.

export const ROUTE_ACCESS: ReadonlyArray<{
  readonly prefix: string;
  readonly roles: ReadonlyArray<Role>;
}> = [
  { prefix: "/buyer", roles: ["buyer", "seller", "admin"] },
  { prefix: "/seller", roles: ["seller", "admin"] },
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/support", roles: ["support", "admin"] },
] as const;

// ─── Auth-page prefixes ───────────────────────────────────────────────────────
// Authenticated users who land on these pages are redirected to their dashboard.

export const AUTH_PREFIXES = [
  "/login",
  "/register",
  "/recuperar-password",
  "/restablecer-password",
] as const;

export const CONSENT_PREFIXES = ["/consent/review"] as const;

// ─── Default destination by role ──────────────────────────────────────────────

/**
 * The home dashboard for each role.
 * Used for: post-login redirects, wrong-role redirects, auth-page redirects.
 * Must stay in sync with ROUTE_ACCESS.
 */
export function getDefaultDestination(role: Role): string {
  switch (role) {
    case "buyer":
      return "/";
    case "seller":
      return "/seller/dashboard";
    case "admin":
      return "/admin/dashboard";
    case "support":
      return "/support/dashboard";
  }
}

// ─── Route classification ─────────────────────────────────────────────────────

/**
 * /seller/:numericId  and  /seller/:numericId/*
 * are public store profile pages — accessible without auth.
 */
export function isPublicSellerProfile(pathname: string): boolean {
  return /^\/seller\/\d+(?:\/.*)?$/.test(pathname);
}

/**
 * Returns true for any route that requires an authenticated session.
 * Public seller profiles are carved out explicitly.
 */
export function isProtectedRoute(pathname: string): boolean {
  if (isPublicSellerProfile(pathname)) return false;

  return ROUTE_ACCESS.some(
    ({ prefix }) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );
}

/**
 * Returns true for login / registration / password-reset pages.
 * Authenticated users should be redirected away from these.
 */
export function isAuthRoute(pathname: string): boolean {
  return AUTH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );
}

export function isConsentRoute(pathname: string): boolean {
  return CONSENT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );
}

// ─── Role-based access check ──────────────────────────────────────────────────

/**
 * Returns true if `role` is permitted to access `pathname`.
 *
 * For non-protected (public) routes always returns true.
 * For protected routes, checks against ROUTE_ACCESS.
 *
 * @example
 *   canRoleAccessPath("buyer", "/buyer/orders")   // → true
 *   canRoleAccessPath("buyer", "/admin/sellers")  // → false
 *   canRoleAccessPath("admin", "/seller/products")// → true  (admin everywhere)
 *   canRoleAccessPath("buyer", "/productos")      // → true  (public)
 */
export function canRoleAccessPath(role: Role, pathname: string): boolean {
  if (!isProtectedRoute(pathname)) return true;

  for (const { prefix, roles } of ROUTE_ACCESS) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return (roles as ReadonlyArray<string>).includes(role);
    }
  }
  return true; // not a protected route
}

/**
 * Returns the allowed roles for the route group that contains `pathname`,
 * or an empty array if the route is not protected.
 * Useful for populating AuthGuard's `allowedRoles` prop dynamically.
 */
export function allowedRolesForPath(pathname: string): Role[] {
  for (const { prefix, roles } of ROUTE_ACCESS) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      return [...roles];
    }
  }
  return [];
}
