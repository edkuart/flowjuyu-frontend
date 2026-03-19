/**
 * src/lib/serverSession.ts
 *
 * Server-side session helper for Next.js App Router Server Components.
 *
 * Replaces every call to getServerSession(authOptions) from next-auth.
 * Works by forwarding the fj_rt HttpOnly cookie to the backend /api/session
 * endpoint, which validates it and returns the canonical user DTO.
 *
 * Usage:
 *   import { getServerSessionSafe } from "@/lib/serverSession";
 *
 *   const user = await getServerSessionSafe();
 *   if (!user) redirect("/login");
 *
 * Rules:
 *   - cache: "no-store" — session state is never stale-while-revalidate
 *   - never throws on 401/403 — returns null instead
 *   - compatible with Next.js edge and Node.js runtimes
 */

import { cookies } from "next/headers";
import { getApiUrl } from "@/lib/config";

// Matches the canonical auth DTO returned by all backend auth endpoints.
// Intentionally NOT imported from AuthContext ("use client") — server code
// must never import from client modules.
export interface ServerUser {
  id:    number;
  name:  string;
  email: string;
  role:  "buyer" | "seller" | "admin" | "support";
}

/**
 * Reads the fj_rt cookie from the current request, forwards it to
 * GET /api/session, and returns the authenticated user or null.
 *
 * Returns null on:
 *   - missing cookie (not logged in)
 *   - 401 / 403 (expired or revoked session)
 *   - network errors (fail safe, not fail open — treat as unauthenticated)
 */
export async function getServerSessionSafe(): Promise<ServerUser | null> {
  try {
    const cookieStore = cookies();

    // Forward all cookies so the backend can read fj_rt.
    // We send all of them — building an allowlist would be fragile.
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    if (!cookieHeader) {
      // No cookies at all — definitely no session.
      return null;
    }

    const res = await fetch(`${getApiUrl()}/api/session`, {
      method:  "GET",
      headers: { cookie: cookieHeader },
      cache:   "no-store",
    });

    // 401 / 403 are expected (no session / revoked) — not network errors.
    if (!res.ok) return null;

    const json: unknown = await res.json();

    if (
      !json ||
      typeof json !== "object" ||
      !(json as Record<string, unknown>).ok ||
      !(json as Record<string, unknown>).user
    ) {
      return null;
    }

    return (json as { ok: boolean; user: ServerUser }).user;
  } catch {
    // Network timeout, DNS failure, JSON parse error — treat as no session.
    // Middleware is the real gate; this helper is a secondary check.
    return null;
  }
}
