// src/lib/performance.ts
// Phase 1 — measurement only. No optimizations.

import { addPerfEntry } from "@/lib/perfStore";

declare global {
  interface Window {
    __navStart?: number
  }
}

const PERF_LOGS_ENABLED =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_ENABLE_PERF_LOGS === "true"

/** Call immediately before router.push() or a navigation Link click. */
export function trackNavigationStart(): void {
  if (typeof window === "undefined") return
  window.__navStart = performance.now()
}

/**
 * Call inside useEffect on the destination page.
 * Logs the time from the last trackNavigationStart() call.
 */
export function trackNavigationEnd(pageName: string): void {
  if (typeof window === "undefined" || window.__navStart === undefined) return
  const duration = performance.now() - window.__navStart
  if (PERF_LOGS_ENABLED) console.log(`⏱️  [PAGE] ${pageName} - ${duration.toFixed(2)}ms`)
  window.__navStart = undefined
  addPerfEntry({ type: "navigation", name: pageName, duration, timestamp: Date.now() })
}

/** Called by the api.ts wrapper after every fetch completes. */
export function trackApiCall(method: string, url: string, ms: number): void {
  // Strip the base URL so logs and store names are readable
  const label = url.replace(/^https?:\/\/[^/]+/, "") || url
  if (PERF_LOGS_ENABLED) console.log(`🌐 [${method.toUpperCase()}] ${label} - ${ms.toFixed(2)}ms`)
  addPerfEntry({ type: "api", name: `[${method.toUpperCase()}] ${label}`, duration: ms, timestamp: Date.now() })
}
