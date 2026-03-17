/**
 * adminHelpers.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared utilities for the Admin Control Center.
 * Import from "@/lib/adminHelpers" in any admin component.
 */

// ── Numeric safety ─────────────────────────────────────────────────────────────

/**
 * Returns a safe finite number. Falls back to `fallback` (default 0) when
 * the input is null, undefined, NaN, or Infinity.
 */
export function safeNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

// ── Percentage ─────────────────────────────────────────────────────────────────

/**
 * Computes (numerator / denominator) * 100 clamped to [0, 100].
 * Never returns NaN, Infinity, or a value above 100.
 *
 * @param decimals  Number of decimal places in the returned string (default 1)
 */
export function safePercentage(
  numerator:   number,
  denominator: number,
  decimals     = 1,
): number {
  if (!Number.isFinite(denominator) || denominator === 0) return 0
  const raw = (safeNumber(numerator) / safeNumber(denominator)) * 100
  return Math.min(100, Math.max(0, parseFloat(raw.toFixed(decimals))))
}

/**
 * Formats a percentage as a string, e.g. "42.3%".
 */
export function formatPercentage(
  numerator:   number,
  denominator: number,
  decimals     = 1,
): string {
  return `${safePercentage(numerator, denominator, decimals).toFixed(decimals)}%`
}

// ── ID normalisation ───────────────────────────────────────────────────────────

/**
 * Always returns the `user_id` field for a VendedorPerfil-shaped object.
 * Admin routes expect `user_id` as the `:id` param — never the profile PK.
 *
 * Accepts any object that may have both `id` (profile PK) and `user_id` (FK).
 */
export function normalizeId(
  entity: { user_id?: number | null; id?: number | null },
): number {
  const uid = safeNumber(entity.user_id, 0)
  if (uid > 0) return uid
  // Fallback: warn in dev so it's caught early
  if (process.env.NODE_ENV !== "production") {
    console.warn("[adminHelpers] normalizeId: user_id is missing, falling back to id", entity)
  }
  return safeNumber(entity.id, 0)
}

// ── Time helpers ───────────────────────────────────────────────────────────────

/**
 * Returns a human-readable relative time string in English.
 * e.g. "just now", "5m ago", "3h ago", "2d ago"
 */
export function timeAgo(date: string | Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60)                  return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60)                  return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)                    return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30)                     return `${days}d ago`
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// ── Marketplace status ─────────────────────────────────────────────────────────

export type MarketplaceStatusLevel = "healthy" | "attention" | "critical"

/**
 * Derives a top-level marketplace status from key counters.
 * Used by the dashboard header status badge and sidebar future signals.
 */
export function computeMarketplaceStatus(params: {
  sellersPendientes:  number
  ticketsAbiertos:    number
  highRiskSellers?:   number
  criticalTickets?:   number
}): MarketplaceStatusLevel {
  const { sellersPendientes, ticketsAbiertos, highRiskSellers = 0, criticalTickets = 0 } = params

  if (highRiskSellers > 0 || criticalTickets > 0) return "critical"
  if (sellersPendientes > 0 || ticketsAbiertos > 5) return "attention"
  return "healthy"
}

export const STATUS_BADGE: Record<MarketplaceStatusLevel, {
  dot:   string
  label: string
  badge: string
}> = {
  healthy:   { dot: "bg-green-500",  label: "Healthy",           badge: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  attention: { dot: "bg-yellow-400", label: "Attention Needed",  badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  critical:  { dot: "bg-red-500",    label: "Critical",          badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
}
