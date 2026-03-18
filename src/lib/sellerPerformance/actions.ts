// src/lib/sellerPerformance/actions.ts
//
// SPIL v2 — Decision Layer: Next Actions
// Owns: NextAction
// Derives ranked actions from alerts. No imports from ./index.

import { type PerformanceAlert } from "./alerts"

/* ──────────────────────────────────────────
   OUTPUT TYPE
────────────────────────────────────────── */

export interface NextAction {
  label:    string
  href:     string
  priority: "high" | "medium" | "low"
  impact:   "high" | "medium" | "low"
  effort:   "low" | "medium" | "high"
}

/* ──────────────────────────────────────────
   RANKING
   Formula: high impact + low effort = lowest score = first
────────────────────────────────────────── */

const IMPACT_RANK:   Record<NextAction["impact"],   number> = { high: 0, medium: 1, low: 2 }
const EFFORT_RANK:   Record<NextAction["effort"],   number> = { low: 0, medium: 1, high: 2 }
const PRIORITY_RANK: Record<NextAction["priority"], number> = { high: 0, medium: 1, low: 2 }

function actionScore(a: NextAction): number {
  return IMPACT_RANK[a.impact] * 10 + EFFORT_RANK[a.effort] * 5 + PRIORITY_RANK[a.priority]
}

const FALLBACK: NextAction = {
  label:    "Agrega nuevos productos para crecer",
  href:     "/seller/products/new",
  priority: "low",
  impact:   "medium",
  effort:   "low",
}

/* ──────────────────────────────────────────
   MAIN EXPORT
────────────────────────────────────────── */

export function buildNextActions(alerts: PerformanceAlert[]): NextAction[] {
  const actionable = alerts.filter(
    (a): a is PerformanceAlert & { actionLabel: string; actionHref: string } =>
      Boolean(a.actionLabel && a.actionHref)
  )

  if (actionable.length === 0) return [FALLBACK]

  const actions: NextAction[] = actionable.map((a) => ({
    label:    a.actionLabel,
    href:     a.actionHref,
    priority: a.priority,
    impact:   a.impact,
    effort:   a.effort,
  }))

  return actions.sort((a, b) => actionScore(a) - actionScore(b)).slice(0, 3)
}
