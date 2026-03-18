// src/components/seller/SellerHealthScoreCard.tsx
//
// Phase 14 — Seller Performance Intelligence Layer
// Displays the 0–100 health score with a visual progress arc and label.

import type { HealthScore } from "@/lib/sellerPerformance"

/* ──────────────────────────────────────────
   LABEL CONFIG
────────────────────────────────────────── */

const LABEL_CONFIG = {
  low: {
    color:       "text-red-500",
    trackFill:   "#ef4444",
    badge:       "bg-red-50 text-red-600",
    badgeLabel:  "Necesita atención",
  },
  medium: {
    color:       "text-amber-500",
    trackFill:   "#f59e0b",
    badge:       "bg-amber-50 text-amber-700",
    badgeLabel:  "En desarrollo",
  },
  high: {
    color:       "text-emerald-600",
    trackFill:   "#10b981",
    badge:       "bg-emerald-50 text-emerald-700",
    badgeLabel:  "Saludable",
  },
} as const

/* ──────────────────────────────────────────
   ARC HELPERS
   Uses SVG stroke-dasharray trick for a
   clean half-circle arc gauge.
────────────────────────────────────────── */

const R  = 52          // radius
const CX = 64          // center-x of 128px viewBox
const CY = 70          // center-y (pushes arc toward top half)
const CIRCUMFERENCE = Math.PI * R   // half-circle

function arcOffset(score: number): number {
  const clamped = Math.min(100, Math.max(0, score))
  return CIRCUMFERENCE * (1 - clamped / 100)
}

/* ──────────────────────────────────────────
   COMPONENT
────────────────────────────────────────── */

interface Props {
  health: HealthScore
}

export function SellerHealthScoreCard({ health }: Props) {
  const cfg    = LABEL_CONFIG[health.label]
  const offset = arcOffset(health.score)

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm px-6 py-5 flex flex-col gap-4">

      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
          Salud de la tienda
        </p>
      </div>

      {/* Arc gauge */}
      <div className="flex flex-col items-center gap-1">
        <svg
          viewBox="0 0 128 80"
          className="w-36 h-auto"
          aria-hidden="true"
        >
          {/* Track */}
          <path
            d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Fill */}
          <path
            d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
            fill="none"
            stroke={cfg.trackFill}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
          {/* Score text */}
          <text
            x={CX}
            y={CY + 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="22"
            fontWeight="700"
            fill="#0d0d0b"
          >
            {health.score}
          </text>
          <text
            x={CX}
            y={CY + 18}
            textAnchor="middle"
            fontSize="9"
            fill="#9ca3af"
          >
            / 100
          </text>
        </svg>

        {/* Label badge */}
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.badge}`}>
          {cfg.badgeLabel}
        </span>
      </div>

      {/* Message */}
      <p className="text-xs text-neutral-500 leading-relaxed text-center">
        {health.message}
      </p>
    </div>
  )
}
