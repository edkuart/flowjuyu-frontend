"use client"

import { TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react"
import type {
  ProductConversionInsights,
  ConversionLevel,
  ConversionTip,
} from "@/lib/productConversion"

/* ──────────────────────────────────────────
   TYPES
────────────────────────────────────────── */

export interface ProductConversionCardProps {
  insights: ProductConversionInsights
}

/* ──────────────────────────────────────────
   DESIGN TOKENS per level
────────────────────────────────────────── */

const LEVEL_CONFIG: Record<
  ConversionLevel,
  { bar: string; label: string; labelColor: string; bg: string }
> = {
  low: {
    bar:        "bg-red-400",
    label:      "Poco atractivo",
    labelColor: "text-red-600",
    bg:         "bg-red-50/60",
  },
  medium: {
    bar:        "bg-amber-400",
    label:      "En progreso",
    labelColor: "text-amber-600",
    bg:         "bg-amber-50/40",
  },
  high: {
    bar:        "bg-emerald-500",
    label:      "Listo para vender",
    labelColor: "text-emerald-600",
    bg:         "bg-emerald-50/40",
  },
}

/* ──────────────────────────────────────────
   TIP ROW
────────────────────────────────────────── */

function TipRow({ tip }: { tip: ConversionTip }) {
  const isGood = tip.type === "good"
  return (
    <div className="flex items-start gap-2">
      {isGood ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
      )}
      <p className={`text-xs leading-snug ${isGood ? "text-emerald-700" : "text-neutral-600"}`}>
        {tip.message}
      </p>
    </div>
  )
}

/* ──────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────── */

export function ProductConversionCard({ insights }: ProductConversionCardProps) {
  const { score, level, tips } = insights
  const cfg = LEVEL_CONFIG[level]

  return (
    <div className={`rounded-xl border border-neutral-100 shadow-sm overflow-hidden ${cfg.bg}`}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-neutral-500" />
          <p className="text-xs font-bold text-neutral-700 uppercase tracking-wide">
            Potencial de venta
          </p>
        </div>
        <span className={`text-xs font-bold ${cfg.labelColor}`}>
          {cfg.label}
        </span>
      </div>

      {/* Score bar */}
      <div className="px-4 pb-3 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex-1 bg-neutral-200 rounded-full h-1.5 overflow-hidden mr-3">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${cfg.bar}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <span className={`text-sm font-black tabular-nums flex-shrink-0 ${cfg.labelColor}`}>
            {score}
          </span>
        </div>
      </div>

      {/* Tips */}
      {tips.length > 0 && (
        <div className="px-4 pb-4 space-y-2 border-t border-neutral-100 pt-3">
          {tips.map((tip, i) => (
            <TipRow key={i} tip={tip} />
          ))}
        </div>
      )}

    </div>
  )
}
