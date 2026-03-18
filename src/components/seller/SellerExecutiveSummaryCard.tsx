// src/components/seller/SellerExecutiveSummaryCard.tsx
//
// Phase 14 — Seller Performance Intelligence Layer
// Full-width card showing the executive summary tone + message.

import type { ExecutiveSummary } from "@/lib/sellerPerformance"

/* ──────────────────────────────────────────
   TONE CONFIG
────────────────────────────────────────── */

const TONE_CONFIG = {
  success: {
    bar:    "bg-emerald-500",
    title:  "text-emerald-900",
    badge:  "bg-emerald-100 text-emerald-700",
    label:  "Buen desempeño",
  },
  warning: {
    bar:    "bg-amber-400",
    title:  "text-amber-900",
    badge:  "bg-amber-100 text-amber-700",
    label:  "Área de mejora",
  },
  info: {
    bar:    "bg-neutral-400",
    title:  "text-neutral-800",
    badge:  "bg-neutral-100 text-neutral-600",
    label:  "Información",
  },
} as const

/* ──────────────────────────────────────────
   COMPONENT
────────────────────────────────────────── */

interface Props {
  summary: ExecutiveSummary
}

export function SellerExecutiveSummaryCard({ summary }: Props) {
  const cfg = TONE_CONFIG[summary.tone]

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
      {/* Accent bar */}
      <div className={`h-1 w-full ${cfg.bar}`} />

      <div className="px-6 py-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-6">
        {/* Badge */}
        <span
          className={`
            self-start text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap
            ${cfg.badge}
          `}
        >
          {cfg.label}
        </span>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className={`text-base font-bold leading-snug ${cfg.title}`}>
            {summary.title}
          </p>
          <p className="mt-1 text-sm text-neutral-500 leading-relaxed">
            {summary.message}
          </p>
        </div>
      </div>
    </div>
  )
}
