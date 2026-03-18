// src/lib/sellerPerformance/index.ts
//
// Seller Performance Intelligence Layer (SPIL) v2 — Phase 14
// Architecture: Signal → Score → Decision
// Pure function. No side effects. No external dependencies.

import { deriveSignals }         from "./signals"
import { computeScores }         from "./scoring"
import { buildExecutiveSummary } from "./summary"
import { buildKpiHighlights }    from "./kpis"
import { buildAlerts }           from "./alerts"
import { buildNextActions }      from "./actions"

// Re-export all types from sub-modules so consumers import from one place
export type { PerformanceSummaryInput, Signals }      from "./signals"
export type { ScoreBreakdown, ScoringResult }          from "./scoring"
export type { ExecutiveSummary }                       from "./summary"
export type { KpiHighlight, KpiHighlights }            from "./kpis"
export type { PerformanceAlert }                       from "./alerts"
export type { NextAction }                             from "./actions"

import type { ScoreBreakdown }  from "./scoring"

/* ──────────────────────────────────────────
   AGGREGATE OUTPUT TYPES
   (defined here — reference sub-module types)
────────────────────────────────────────── */

export interface HealthScore {
  score:     number           // 0–100
  label:     "low" | "medium" | "high"
  message:   string
  breakdown: ScoreBreakdown   // per-dimension scores for explainability
}

export interface SellerPerformanceSummary {
  executiveSummary: import("./summary").ExecutiveSummary
  healthScore:      HealthScore
  kpiHighlights:    import("./kpis").KpiHighlights
  alerts:           import("./alerts").PerformanceAlert[]
  nextActions:      import("./actions").NextAction[]
}

/* ──────────────────────────────────────────
   HEALTH SCORE MESSAGE
────────────────────────────────────────── */

function healthMessage(label: "low" | "medium" | "high"): string {
  switch (label) {
    case "low":    return "Tu tienda necesita atención. Activa productos y mejora la visibilidad."
    case "medium": return "Tu tienda funciona, pero hay áreas clave por mejorar para crecer más."
    case "high":   return "Tu tienda está bien optimizada y muestra indicadores saludables."
  }
}

/* ──────────────────────────────────────────
   MAIN EXPORT
────────────────────────────────────────── */

export function getSellerPerformanceSummary(
  input: import("./signals").PerformanceSummaryInput
): SellerPerformanceSummary {
  const signals = deriveSignals(input)
  const scoring = computeScores(input, signals)
  const alerts  = buildAlerts(signals, scoring, input)

  const healthScore: HealthScore = {
    score:     scoring.overallScore,
    label:     scoring.label,
    message:   healthMessage(scoring.label),
    breakdown: scoring.breakdown,
  }

  return {
    executiveSummary: buildExecutiveSummary(signals, scoring, input.growthPercent),
    healthScore,
    kpiHighlights:    buildKpiHighlights(signals, scoring, input),
    alerts,
    nextActions:      buildNextActions(alerts),
  }
}
