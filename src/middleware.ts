/**
 * src/middleware.ts — Phase 7: role-aware route protection
 *
 * Runs on the Next.js Edge Runtime before any page renders.
 *
 * Strategy:
 *   1. Cookie absence → definitely no session → redirect to /login (fast path).
 *   2. Cookie present → call GET /api/session (3 s timeout) to validate the
 *      refresh token and retrieve the user's role.
 *   3. Three-state result drives routing:
 *        valid      → enforce role-based access; redirect wrong-role users.
 *        invalid    → token is expired / tampered → redirect to /login.
 *        unavailable → backend unreachable → fail open (let the page load;
 *                      AuthGuard acts as the second layer).
 *
 * Route classification delegates entirely to authRoutes.ts so the logic
 * stays in one place.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  isProtectedRoute,
  isAuthRoute,
  canRoleAccessPath,
  getDefaultDestination,
  type Role,
} from "@/lib/authRoutes";

// ─── Constants ────────────────────────────────────────────────────────────────

const REFRESH_COOKIE = "fj_rt";
const SESSION_TIMEOUT_MS = 3_000;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8800";

// ─── Session resolution ───────────────────────────────────────────────────────

type SessionResult =
  | { status: "valid"; role: Role }
  | { status: "invalid" }
  | { status: "unavailable" };

/**
 * Calls GET /api/session, forwarding the fj_rt cookie.
 * Returns one of three states so callers can act appropriately on each.
 *
 * Fails open on network errors / timeouts so a momentary backend blip
 * does not log every user out simultaneously.
 */
async function resolveSession(req: NextRequest): Promise<SessionResult> {
  const cookieHeader = req.headers.get("cookie") ?? "";

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SESSION_TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch(`${API_URL}/api/session`, {
        method: "GET",
        headers: { cookie: cookieHeader },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (res.status === 401 || res.status === 403) {
      return { status: "invalid" };
    }

    if (!res.ok) {
      // 5xx or unexpected → treat as unavailable
      return { status: "unavailable" };
    }

    const json = await res.json();
    const role = json?.user?.role as Role | undefined;

    if (!role) return { status: "invalid" };

    return { status: "valid", role };
  } catch {
    // Network error, timeout (AbortError), JSON parse failure
    return { status: "unavailable" };
  }
}

// ─── Redirect helpers ─────────────────────────────────────────────────────────

function buildLoginRedirect(
  req: NextRequest,
  destination: string,
): NextResponse {
  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("redirectTo", destination);
  return NextResponse.redirect(loginUrl);
}

function buildRoleRedirect(req: NextRequest, role: Role): NextResponse {
  return NextResponse.redirect(new URL(getDefaultDestination(role), req.url));
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const allowAccountSwitch = req.nextUrl.searchParams.get("switch") === "1";

  // ── Fast path: no cookie → no session possible ────────────────────────────
  const hasCookie = !!req.cookies.get(REFRESH_COOKIE)?.value;

  if (isProtectedRoute(pathname) && !hasCookie) {
    return buildLoginRedirect(req, pathname);
  }

  if (isAuthRoute(pathname) && !hasCookie) {
    return NextResponse.next();
  }

  // ── Slow path: cookie present → validate with backend ────────────────────
  if (!hasCookie) {
    // Public route, no cookie — nothing to do.
    return NextResponse.next();
  }

  const session = await resolveSession(req);

  // ── Auth route (login / register / …) ────────────────────────────────────
  if (isAuthRoute(pathname)) {
    if (session.status === "valid" && !allowAccountSwitch) {
      // Consent enforcement stays client-side because the backend route
      // requires a Bearer token and the Edge runtime only has the refresh cookie.
      return buildRoleRedirect(req, session.role);
    }
    // invalid or unavailable — let them see the auth page.
    return NextResponse.next();
  }

  // ── Protected route ───────────────────────────────────────────────────────
  if (isProtectedRoute(pathname)) {
    switch (session.status) {
      case "invalid":
        return buildLoginRedirect(req, pathname);

      case "unavailable":
        // Backend down — fail open; AuthGuard remains active client-side.
        return NextResponse.next();

      case "valid":
        if (!canRoleAccessPath(session.role, pathname)) {
          // Authenticated but wrong role → send to their own dashboard.
          return buildRoleRedirect(req, session.role);
        }
        return NextResponse.next();
    }
  }

  // ── Everything else (public routes) ──────────────────────────────────────
  return NextResponse.next();
}

// ─── Matcher ──────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    // Protected route groups
    "/buyer/:path*",
    "/seller/:path*", // isProtectedRoute() carves out /seller/:numericId
    "/admin/:path*",
    "/support/:path*",

    // Auth routes (redirect-if-authenticated)
    "/login",
    "/register/:path*",
    "/recuperar-password",
    "/restablecer-password",
  ],
};
