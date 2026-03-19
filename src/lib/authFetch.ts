/**
 * src/lib/authFetch.ts
 *
 * Thin wrapper kept for backward compatibility with the 14 callers that import
 * from this path. All logic — token injection, credentials, 401 handling, and
 * silent refresh — now lives in apiFetch.
 *
 * apiFetch accepts absolute URLs (startsWith "http" → used as-is) so existing
 * callers that pass `${API_URL}/api/…` continue to work without changes.
 */
export { apiFetch as authFetch } from "@/lib/api";
