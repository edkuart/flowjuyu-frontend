/**
 * src/lib/api.ts
 *
 * Universal authenticated fetch wrapper.
 * Safe for both Server Components and Client Components.
 *
 * credentials: "include" is set on every request so the browser sends and
 * receives the HttpOnly refresh-token cookie (fj_rt) transparently.
 *
 * On any browser-side 401 (except /api/refresh), we attempt a single
 * refresh-token renewal and then retry the original request once.
 */

import { getApiUrl }      from "@/lib/config";
import { refreshSession } from "@/lib/refreshSession";
import { trackApiCall }   from "@/lib/performance";

// ── In-memory response cache ─────────────────────────────────────────────────
//
// Caches GET responses for public, non-personalised endpoints for up to
// CACHE_TTL_MS milliseconds. Lives only in the browser's JS heap —
// cleared on full page reload, never persisted to disk.
//
// Stale-while-revalidate: when a cached entry is still valid we return it
// immediately and kick off a silent background refresh so the next call
// within the same TTL window always gets fresh data.

const CACHE_TTL_MS = 60_000; // 60 s — balances freshness vs redundant requests

// Personalised or auth-gated paths that must never be served from cache.
const SKIP_CACHE_PATHS: string[] = [
  "/api/session",
  "/api/consent/preferences",
  "/api/consent/prompts",
  "/api/products/recommended",
  "/api/seller/profile",
  "/api/seller/products",
  "/api/seller/whatsapp-link",
  "/api/collections",
  "/api/collections/templates",
  "/api/seller/video-projects",
  "/api/seller/video-generations",
  "/api/seller/video-templates",
];

type CacheEntry = { json: unknown; ts: number };
const _cache = new Map<string, CacheEntry>();

function _isCacheable(url: string, method: string): boolean {
  if (method !== "GET") return false;
  return !SKIP_CACHE_PATHS.some((p) => url.includes(p));
}

function _cacheGet(url: string): unknown | null {
  const entry = _cache.get(url);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) { _cache.delete(url); return null; }
  return entry.json;
}

function _cacheSet(url: string, json: unknown): void {
  _cache.set(url, { json, ts: Date.now() });
}

function _syntheticResponse(json: unknown): Response {
  return new Response(JSON.stringify(json), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// Exported so callers (e.g. after logout) can wipe personalised entries
export function invalidateCache(pathIncludes?: string): void {
  if (!pathIncludes) { _cache.clear(); return; }
  for (const key of _cache.keys()) {
    if (key.includes(pathIncludes)) _cache.delete(key);
  }
}

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

  // Don't force Content-Type when sending FormData — the browser must set
  // the multipart boundary automatically. Forcing application/json here
  // corrupts multipart requests and causes ERR_HTTP2_PROTOCOL_ERROR.
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;

  const method = (init.method ?? "GET").toUpperCase();

  // ── Cache lookup (browser-only, GET, public endpoints) ───────────────────
  if (typeof window !== "undefined" && _isCacheable(url, method)) {
    const cached = _cacheGet(url);
    if (cached !== null) {
      // Stale-while-revalidate: serve cache immediately, refresh in background.
      // Uses plain fetch() to avoid recursion; auth header kept for consistency.
      const bgToken = localStorage.getItem("token");
      void fetch(url, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(bgToken ? { Authorization: `Bearer ${bgToken}` } : {}),
        },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((json) => { if (json !== null) _cacheSet(url, json); })
        .catch(() => {});
      return _syntheticResponse(cached);
    }
  }

  const _t0 = typeof performance !== "undefined" ? performance.now() : 0;

  const res = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(init.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // ── 429 — rate limited ──────────────────────────────────────────────────
  // Return immediately. Never retry, never call refreshSession — that would
  // add more requests and deepen the flood.
  if (res.status === 429) {
    if (typeof performance !== "undefined")
      trackApiCall(method, url, performance.now() - _t0);
    return res;
  }

  // ── 401 handling — browser only ─────────────────────────────────────────
  // Any protected API 401 is treated as an auth desync candidate:
  // try to refresh once, then retry the original request once.
  if (
    res.status === 401 &&
    typeof window !== "undefined" &&
    !url.includes("/api/refresh")
  ) {
    const refreshedSession = await refreshSession();
    const refreshedToken = localStorage.getItem("token");

    if (refreshedSession && refreshedToken) {
      const _tr = performance.now();
      const retryRes = await fetch(url, {
        ...init,
        credentials: "include",
        headers: {
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
          ...(init.headers ?? {}),
          ...(refreshedToken ? { Authorization: `Bearer ${refreshedToken}` } : {}),
        },
      });
      trackApiCall(method, url, performance.now() - _tr);
      return retryRes;
    }

    return res;
  }

  if (typeof performance !== "undefined")
    trackApiCall(method, url, performance.now() - _t0);

  // ── Populate cache on successful public GET ──────────────────────────────
  if (typeof window !== "undefined" && _isCacheable(url, method) && res.ok) {
    res.clone().json().then((json) => _cacheSet(url, json)).catch(() => {});
  }

  return res;
}
