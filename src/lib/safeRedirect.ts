/**
 * src/lib/safeRedirect.ts
 *
 * Validates that a post-login redirect target is safe.
 * Prevents open-redirect attacks where an attacker crafts a URL such as:
 *   /login?redirectTo=https://evil.com
 *   /login?redirectTo=//evil.com
 *   /login?redirectTo=/\evil.com
 *
 * A safe path must:
 *   1. Be a non-empty string
 *   2. Start with exactly one "/"
 *   3. Not start with "//"          (protocol-relative: //evil.com)
 *   4. Not contain a colon in the   first segment (rules out javascript:,
 *      http:, data:, etc. smuggled as a leading path segment)
 *   5. Match one of the declared internal prefixes
 *
 * Returns the validated path, or null if it is unsafe/unrecognised.
 * Callers should fall back to a role-based default when null is returned.
 */

import {
  canRoleAccessPath,
  isAuthRoute,
  isConsentRoute,
  type Role,
} from "@/lib/authRoutes";

// Only paths under these prefixes are accepted as redirectTo targets.
// This list matches the protected route prefixes in middleware.ts.
const ALLOWED_PREFIXES = [
  "/buyer",
  "/seller",
  "/admin",
  "/support",
] as const;

/**
 * Validates `raw` as a safe internal redirect path.
 *
 * @param raw - The raw value of the `redirectTo` query parameter.
 * @returns The original path string if safe, or `null` otherwise.
 *
 * @example
 *   safeRedirectPath("/buyer/dashboard")  // → "/buyer/dashboard"
 *   safeRedirectPath("//evil.com")        // → null
 *   safeRedirectPath("https://evil.com")  // → null
 *   safeRedirectPath("/productos")        // → null  (not a protected route)
 *   safeRedirectPath(undefined)           // → null
 */
export function safeRedirectPath(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;

  // Must start with exactly one slash
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;

  // Reject anything that looks like /scheme: in the first path segment
  // e.g. /javascript:alert(1) or /http:foo  (unlikely but belt-and-braces)
  if (/^\/[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(raw)) return null;

  // Must match a known internal prefix — not /productos, /store/:id, etc.
  const isAllowed = ALLOWED_PREFIXES.some(
    (prefix) => raw === prefix || raw.startsWith(prefix + "/")
  );

  return isAllowed ? raw : null;
}

/**
 * Like safeRedirectPath, but also verifies that `role` is allowed to
 * access the path. Prevents a buyer from being redirected to /admin/…
 * even if the path is structurally valid.
 *
 * @example
 *   safeRedirectForRole("/buyer/orders", "buyer")  // → "/buyer/orders"
 *   safeRedirectForRole("/admin/users",  "buyer")  // → null
 *   safeRedirectForRole("//evil.com",    "admin")  // → null
 */
export function safeRedirectForRole(
  raw: string | null | undefined,
  role: Role,
): string | null {
  const path = safeRedirectPath(raw);
  if (!path) return null;
  return canRoleAccessPath(role, path) ? path : null;
}

export function safeInternalPath(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  if (/^\/[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(raw)) return null;
  return raw;
}

export function safeAppRedirectForRole(
  raw: string | null | undefined,
  role: Role,
): string | null {
  const path = safeInternalPath(raw);
  if (!path || isAuthRoute(path) || isConsentRoute(path)) return null;
  return canRoleAccessPath(role, path) ? path : null;
}
