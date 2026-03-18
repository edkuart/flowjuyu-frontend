"use client"

import Link from "next/link"
import { AlertTriangle, CheckCircle2, Info, ChevronRight, Sparkles } from "lucide-react"
import {
  getSellerGrowthInsights,
  type GrowthInsight,
  type GrowthProducto,
  type GrowthAnalytics,
  type GrowthPerfil,
  type InsightType,
} from "@/lib/sellerGrowth"

/* ──────────────────────────────────────────
   TYPES
────────────────────────────────────────── */

export interface SellerGrowthCardProps {
  productos: GrowthProducto[]
  analytics: GrowthAnalytics | null
  perfil: GrowthPerfil | null
}

/* ──────────────────────────────────────────
   DESIGN TOKENS per insight type
────────────────────────────────────────── */

const TOKENS: Record<
  InsightType,
  {
    icon: React.ReactNode
    border: string
    bg: string
    iconBg: string
    titleColor: string
    descColor: string
    btnClass: string
  }
> = {
  warning: {
    icon:       <AlertTriangle className="w-4 h-4" />,
    border:     "border-amber-200",
    bg:         "bg-amber-50/60",
    iconBg:     "bg-amber-100 text-amber-600",
    titleColor: "text-amber-900",
    descColor:  "text-amber-800",
    btnClass:   "bg-amber-600 hover:bg-amber-700 text-white",
  },
  success: {
    icon:       <CheckCircle2 className="w-4 h-4" />,
    border:     "border-emerald-200",
    bg:         "bg-emerald-50/60",
    iconBg:     "bg-emerald-100 text-emerald-600",
    titleColor: "text-emerald-900",
    descColor:  "text-emerald-800",
    btnClass:   "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  info: {
    icon:       <Info className="w-4 h-4" />,
    border:     "border-neutral-200",
    bg:         "bg-neutral-50/60",
    iconBg:     "bg-[#0F3D3A]/10 text-[#0F3D3A]",
    titleColor: "text-neutral-800",
    descColor:  "text-neutral-600",
    btnClass:   "bg-[#0F3D3A] hover:bg-[#0C2F2C] text-white",
  },
}

/* ──────────────────────────────────────────
   INSIGHT ROW
────────────────────────────────────────── */

function InsightRow({ insight }: { insight: GrowthInsight }) {
  const t = TOKENS[insight.type]

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-4 transition-all ${t.border} ${t.bg}`}
    >
      {/* Icon */}
      <span
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${t.iconBg}`}
      >
        {t.icon}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className={`text-sm font-semibold leading-snug ${t.titleColor}`}>
          {insight.title}
        </p>
        <p className={`text-xs leading-relaxed ${t.descColor}`}>
          {insight.description}
        </p>
      </div>

      {/* CTA */}
      {insight.actionLabel && insight.actionHref && (
        <Link
          href={insight.actionHref}
          className={`flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${t.btnClass}`}
        >
          {insight.actionLabel}
          <ChevronRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────── */

export function SellerGrowthCard({
  productos,
  analytics,
  perfil,
}: SellerGrowthCardProps) {
  const { insights } = getSellerGrowthInsights({ productos, analytics, perfil })

  if (insights.length === 0) return null

  const warningCount = insights.filter(i => i.type === "warning").length
  const successCount = insights.filter(i => i.type === "success").length

  const headerLabel =
    warningCount > 0
      ? `${warningCount} acción${warningCount !== 1 ? "es" : ""} recomendada${warningCount !== 1 ? "s" : ""}`
      : successCount > 0
      ? "Tu tienda está creciendo"
      : `${insights.length} sugerencia${insights.length !== 1 ? "s" : ""}`

  const headerColor =
    warningCount > 0 ? "text-amber-600" :
    successCount > 0 ? "text-emerald-600" :
                       "text-[#0F3D3A]"

  return (
    <div className="bg-white border border-neutral-100 rounded-xl shadow-sm overflow-hidden">

      {/* Top accent */}
      <div
        className={`h-1 ${
          warningCount > 0 ? "bg-amber-400" :
          successCount > 0 ? "bg-emerald-400" :
                             "bg-[#0F3D3A]/30"
        }`}
      />

      <div className="p-5 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0F3D3A]/60" />
            <h2 className="text-base font-bold text-neutral-800">
              Asistente de crecimiento
            </h2>
          </div>
          <span className={`text-xs font-semibold ${headerColor}`}>
            {headerLabel}
          </span>
        </div>

        {/* Insight list */}
        <div className="space-y-2.5">
          {insights.map((insight, i) => (
            <InsightRow key={i} insight={insight} />
          ))}
        </div>

      </div>
    </div>
  )
}
