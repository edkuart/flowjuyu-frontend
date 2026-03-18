// src/lib/sellerPerformance/scoring.ts
//
// SPIL v2 — Layer 2: Score Computation
// Owns: ScoreBreakdown, ScoringResult
// No imports from ./index — imports only from ./signals

import { type PerformanceSummaryInput, type Signals } from "./signals"

/* ──────────────────────────────────────────
   SCORE TYPES
────────────────────────────────────────── */

export interface ScoreBreakdown {
  traffic:    number  // 0–100
  conversion: number  // 0–100
  growth:     number  // 0–100
  catalog:    number  // 0–100
  contact:    number  // 0–100
}

export interface ScoringResult {
  breakdown:    ScoreBreakdown
  overallScore: number           // 0–100 (weighted)
  label:        "low" | "medium" | "high"
}

/* ──────────────────────────────────────────
   WEIGHTS  (must sum to 1.0)
────────────────────────────────────────── */

const WEIGHTS = {
  traffic:    0.25,
  conversion: 0.25,
  growth:     0.20,
  catalog:    0.20,
  contact:    0.10,
} as const

/* ──────────────────────────────────────────
   DIMENSION SCORERS
────────────────────────────────────────── */

function scoreTraffic(views: number): number {
  if (views === 0)   return 0
  if (views < 10)    return 20
  if (views < 30)    return 40
  if (views < 100)   return 65
  if (views < 300)   return 85
  return                    100
}

function scoreConversion(ratio: number, hasViews: boolean): number {
  if (!hasViews)     return 48   // neutral — no data, not penalized
  if (ratio < 0.01)  return 10
  if (ratio < 0.03)  return 30
  if (ratio < 0.05)  return 55
  if (ratio < 0.07)  return 75
  return                    100
}

function scoreGrowth(pct: number): number {
  if (pct < -10)     return 5
  if (pct < -5)      return 20
  if (pct < 0)       return 40
  if (pct === 0)     return 50
  if (pct <= 5)      return 62
  if (pct <= 10)     return 78
  return                    100
}

function scoreCatalog(total: number, active: number): number {
  if (total === 0)   return 0
  if (active === 0)  return 10
  const ratio = active / total
  if (ratio < 0.5)   return 40
  if (ratio < 0.8)   return 70
  return                    100
}

function scoreContact(intentions: number, waClicks: number): number {
  if (waClicks > 5)   return 100
  if (waClicks > 0)   return 80
  if (intentions > 10) return 55
  if (intentions > 5)  return 42
  if (intentions > 0)  return 25
  return                       0
}

/* ──────────────────────────────────────────
   MAIN FUNCTION
────────────────────────────────────────── */

export function computeScores(
  i:        PerformanceSummaryInput,
  _signals: Signals   // reserved for future signal-aware adjustments
): ScoringResult {
  const breakdown: ScoreBreakdown = {
    traffic:    scoreTraffic(i.totalProductViews),
    conversion: scoreConversion(i.conversionRatio, i.totalProductViews > 0),
    growth:     scoreGrowth(i.growthPercent),
    catalog:    scoreCatalog(i.totalProducts, i.activeProducts),
    contact:    scoreContact(i.totalIntentions, i.totalWhatsappClicks),
  }

  const overallScore = Math.round(
    breakdown.traffic    * WEIGHTS.traffic    +
    breakdown.conversion * WEIGHTS.conversion +
    breakdown.growth     * WEIGHTS.growth     +
    breakdown.catalog    * WEIGHTS.catalog    +
    breakdown.contact    * WEIGHTS.contact
  )

  const label: ScoringResult["label"] =
    overallScore < 40 ? "low"    :
    overallScore < 70 ? "medium" :
                        "high"

  return { breakdown, overallScore, label }
}
