"use client"

import Link from "next/link"
import { Zap, TrendingUp, ArrowRight } from "lucide-react"
import {
  getSellerRevenueSignals,
  type RevenueSignal,
  type RevenueProducto,
  type RevenueAnalytics,
  type RevenuePerfil,
  type SignalType,
} from "@/lib/sellerRevenue"

/* ──────────────────────────────────────────
   TYPES
────────────────────────────────────────── */

export interface SellerUpgradeCardProps {
  productos: RevenueProducto[]
  analytics: RevenueAnalytics | null
  perfil: RevenuePerfil | null
}

/* ──────────────────────────────────────────
   DESIGN TOKENS per signal type
────────────────────────────────────────── */

const TOKENS: Record<
  SignalType,
  {
    icon: React.ReactNode
    iconBg: string
    border: string
    titleColor: string
    descColor: string
    btnClass: string
    accentLine: string
  }
> = {
  upgrade: {
    icon:        <Zap className="w-4 h-4" />,
    iconBg:      "bg-[#0F3D3A] text-white",
    border:      "border-[#0F3D3A]/20",
    titleColor:  "text-neutral-900",
    descColor:   "text-neutral-600",
    btnClass:    "bg-[#0F3D3A] hover:bg-[#0C2F2C] text-white shadow-sm",
    accentLine:  "bg-[#0F3D3A]",
  },
  opportunity: {
    icon:        <TrendingUp className="w-4 h-4" />,
    iconBg:      "bg-neutral-100 text-neutral-600",
    border:      "border-neutral-200",
    titleColor:  "text-neutral-800",
    descColor:   "text-neutral-500",
    btnClass:    "bg-neutral-800 hover:bg-neutral-900 text-white shadow-sm",
    accentLine:  "bg-neutral-300",
  },
}

/* ──────────────────────────────────────────
   SIGNAL ROW
────────────────────────────────────────── */

function SignalRow({ signal }: { signal: RevenueSignal }) {
  const t = TOKENS[signal.type]

  return (
    <div
      className={`relative flex items-start gap-4 rounded-xl border px-5 py-4 bg-white overflow-hidden transition-shadow hover:shadow-md ${t.border}`}
    >
      {/* Left accent stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${t.accentLine}`} />

      {/* Icon */}
      <span
        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${t.iconBg}`}
      >
        {t.icon}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className={`text-sm font-bold leading-snug ${t.titleColor}`}>
          {signal.title}
        </p>
        <p className={`text-xs leading-relaxed ${t.descColor}`}>
          {signal.description}
        </p>
      </div>

      {/* CTA */}
      <Link
        href={signal.actionHref}
        className={`flex-shrink-0 self-center inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${t.btnClass}`}
      >
        {signal.actionLabel}
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  )
}

/* ──────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────── */

export function SellerUpgradeCard({
  productos,
  analytics,
  perfil,
}: SellerUpgradeCardProps) {
  const { signals } = getSellerRevenueSignals({ productos, analytics, perfil })

  if (signals.length === 0) return null

  const isFounder = perfil?.plan === "founder" && perfil?.plan_activo === true

  return (
    <div className="rounded-xl overflow-hidden border border-[#0F3D3A]/15 shadow-sm bg-gradient-to-br from-[#0F3D3A]/[0.03] to-white">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#0F3D3A]/10">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#0F3D3A]" />
          <h2 className="text-sm font-bold text-neutral-800">
            {isFounder ? "Oportunidades de crecimiento" : "Potencia tu tienda"}
          </h2>
        </div>
        {!isFounder && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#0F3D3A] text-white">
            <Zap className="w-2.5 h-2.5" />
            Founder
          </span>
        )}
      </div>

      {/* Signal list */}
      <div className="p-4 space-y-3">
        {signals.map((signal, i) => (
          <SignalRow key={i} signal={signal} />
        ))}
      </div>

    </div>
  )
}
