/**
 * src/lib/config.ts
 *
 * Single source of truth for runtime configuration.
 *
 * Rules enforced here:
 *  - NEVER use  ?? ""   — passes through an explicitly-empty string silently
 *  - NEVER use  !       — TypeScript removes it; undefined survives at runtime
 *  - ALWAYS use ||      — falls through on both undefined AND ""
 *  - Evaluated lazily (inside the function), not at module-load time
 */

const FALLBACK = "http://localhost:8800"

/**
 * Returns the backend base URL, guaranteed non-empty.
 * Safe to call from Server Components, Client Components, and services.
 *
 * @example
 *   fetch(`${getApiUrl()}/api/products`)
 */
export function getApiUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL || FALLBACK).replace(/\/$/, "")
}

/**
 * Asserts that NEXT_PUBLIC_API_URL is configured.
 * Use in services that must never fall back to localhost in production.
 *
 * Throws a clear error during build/prerender instead of an opaque
 * "Invalid URL" crash deep in a compiled chunk.
 */
export function requireApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL || ""
  if (!url) {
    throw new Error(
      "[config] NEXT_PUBLIC_API_URL is not set. " +
      "Add it to .env.production before running next build."
    )
  }
  return url.replace(/\/$/, "")
}
