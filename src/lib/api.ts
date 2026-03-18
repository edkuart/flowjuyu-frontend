/**
 * src/lib/api.ts
 *
 * Universal fetch wrapper — safe for both Server Components and Client Components.
 *
 * Design decisions:
 *  - BASE_URL is read INSIDE the function (lazy), not at module scope.
 *    Module-scope evaluation happens when webpack bundles the file, which is
 *    BEFORE .env.* files are guaranteed to be applied to process.env.
 *
 *  - signOut is imported DYNAMICALLY (only when needed) to avoid pulling
 *    the next-auth/react client bundle into server-side code paths.
 *
 *  - Token read is guarded with typeof window !== "undefined" so it is safe
 *    to call from Server Components (token will simply be null there).
 */

import { getApiUrl } from "@/lib/config"

export async function apiFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const BASE_URL = getApiUrl()

  // Resolve full URL — input may be a path ("/api/…") or already absolute
  const url = input.startsWith("http") ? input : `${BASE_URL}${input}`

  // Token is only available in the browser
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  // 401 handler — dynamic import keeps next-auth out of server bundles
  if (res.status === 401 && typeof window !== "undefined") {
    const data = await res.clone().json().catch(() => null)
    if (data?.code === "TOKEN_EXPIRED") {
      localStorage.removeItem("token")
      // Dynamic import: only resolves in browser, never imported on the server
      const { signOut } = await import("next-auth/react")
      await signOut({ callbackUrl: "/login" })
      throw new Error("TOKEN_EXPIRED")
    }
  }

  return res
}
