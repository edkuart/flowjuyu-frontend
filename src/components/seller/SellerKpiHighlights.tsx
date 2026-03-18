// src/components/seller/SellerKpiHighlights.tsx
//
// Phase 14 — Seller Performance Intelligence Layer
// Three KPI tiles: primary (green accent), risk (red accent), opportunity (blue accent).

import type { KpiHighlights } from "@/lib/sellerPerformance"

/* ──────────────────────────────────────────
   TILE CONFIG
────────────────────────────────────────── */

const TILE_CONFIG = {
  primary: {
    label:   "Punto fuerte",
    accent:  "border-l-emerald-400",
    valueCls: "text-emerald-700",
  },
  risk: {
    label:   "Área de riesgo",
    accent:  "border-l-red-400",
    valueCls: "text-red-600",
  },
  opportunity: {
    label:   "Oportunidad",
    accent:  "border-l-sky-400",
    valueCls: "text-sky-700",
  },
} as const

/* ──────────────────────────────────────────
   SUB-COMPONENT: KpiTile
────────────────────────────────────────── */

interface TileProps {
  kind:        keyof typeof TILE_CONFIG
  label:       string
  value:       string
  explanation: string
}

function KpiTile({ kind, label, value, explanation }: TileProps) {
  const cfg = TILE_CONFIG[kind]

  return (
    <div
      className={`
        bg-white rounded-xl border border-neutral-100 border-l-4
        ${cfg.accent}
        px-4 py-3 flex flex-col gap-1
      `}
    >
      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">
        {cfg.label}
      </p>
      <p className="text-xs font-semibold text-neutral-600">
        {label}
      </p>
      <p className={`text-lg font-bold leading-tight ${cfg.valueCls}`}>
        {value}
      </p>
      <p className="text-xs text-neutral-400 leading-snug">
        {explanation}
      </p>
    </div>
  )
}

/* ──────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────── */

interface Props {
  highlights: KpiHighlights
}

export function SellerKpiHighlights({ highlights }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm px-6 py-5 flex flex-col gap-4">
      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
        Indicadores clave
      </p>

      <div className="flex flex-col gap-3">
        <KpiTile
          kind="primary"
          label={highlights.primary.label}
          value={highlights.primary.value}
          explanation={highlights.primary.explanation}
        />
        <KpiTile
          kind="risk"
          label={highlights.risk.label}
          value={highlights.risk.value}
          explanation={highlights.risk.explanation}
        />
        <KpiTile
          kind="opportunity"
          label={highlights.opportunity.label}
          value={highlights.opportunity.value}
          explanation={highlights.opportunity.explanation}
        />
      </div>
    </div>
  )
}
