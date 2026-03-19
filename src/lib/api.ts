/**
 * src/lib/api.ts
 *
 * Universal authenticated fetch wrapper.
 * Safe for both Server Components and Client Components.
 *
 * On 401 TOKEN_EXPIRED in the browser:
 *   1. Calls refreshSession() — collapses concurrent failures into one request.
 *   2. If refresh succeeds → retries the original request once with the new token.
 *   3. If refresh fails    → redirects to /login. The retry uses a raw fetch()
 *      (not apiFetch) to prevent any possibility of infinite recursion.
 *
 * credentials: "include" is set on every request so the browser sends and
 * receives the HttpOnly refresh-token cookie (fj_rt) transparently.
 */

import { getApiUrl }      from "@/lib/config";
import { refreshSession } from "@/lib/refreshSession";

export async function apiFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const BASE_URL = getApiUrl();

  // Resolve full URL — input may be a path ("/api/…") or already absolute
  const url = input.startsWith("http") ? input : `${BASE_URL}${input}`;

  // Token is only available in the browser — server-side calls skip auth header
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // ── 401 handling — browser only ─────────────────────────────────────────
  // Server-side calls have no refresh cookie, so we only attempt renewal
  // in the browser where the HttpOnly cookie is available.
  if (res.status === 401 && typeof window !== "undefined") {
    const data = await res.clone().json().catch(() => null);

    const isExpired =
      data?.code    === "TOKEN_EXPIRED" ||
      data?.message === "Token expirado";

    if (isExpired) {
      const refreshed = await refreshSession();

      if (refreshed) {
        // ── Retry once with the fresh token ────────────────────────────────
        // Using plain fetch() — NOT apiFetch() — to guarantee no recursion.
        const newToken = localStorage.getItem("token");
        return fetch(url, {
          ...init,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(init.headers ?? {}),
            ...(newToken ? { Authorization: `Bearer ${newToken}` } : {}),
          },
        });
      } else {
        // ── Refresh failed — session is definitively over ───────────────────
        // refreshSession() already cleared localStorage and dispatched
        // "auth:changed", so AuthContext will clear its state on next event
        // loop tick. We redirect immediately.
        window.location.replace("/login");
        throw new Error("SESSION_EXPIRED");
      }
    }
  }

  return res;
}
