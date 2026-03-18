// src/components/seller/SellerAlertsPanel.tsx
//
// Phase 14 — Seller Performance Intelligence Layer
// Renders up to 4 performance alerts, sorted by priority.

"use client"

import Link from "next/link"
import type { PerformanceAlert } from "@/lib/sellerPerformance"

/* ──────────────────────────────────────────
   TYPE CONFIG
────────────────────────────────────────── */

const TYPE_CONFIG = {
  warning: {
    dot:       "bg-amber-400",
    titleCls:  "text-amber-900",
    bg:        "bg-amber-50/60",
    border:    "border-amber-200",
    btnBg:     "bg-amber-500 hover:bg-amber-600 text-white",
  },
  info: {
    dot:       "bg-sky-400",
    titleCls:  "text-sky-900",
    bg:        "bg-sky-50/60",
    border:    "border-sky-200",
    btnBg:     "bg-sky-600 hover:bg-sky-700 text-white",
  },
  success: {
    dot:       "bg-emerald-400",
    titleCls:  "text-emerald-900",
    bg:        "bg-emerald-50/60",
    border:    "border-emerald-200",
    btnBg:     "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
} as const

const PRIORITY_LABEL: Record<PerformanceAlert["priority"], string> = {
  high:   "Alta prioridad",
  medium: "Prioridad media",
  low:    "Baja prioridad",
}

/* ──────────────────────────────────────────
   SINGLE ALERT ROW
────────────────────────────────────────── */

function AlertRow({ alert }: { alert: PerformanceAlert }) {
  const cfg = TYPE_CONFIG[alert.type]

  return (
    <div
      className={`
        rounded-xl border px-4 py-3 flex items-start gap-3
        ${cfg.bg} ${cfg.border}
      `}
    >
      {/* Dot */}
      <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm font-semibold leading-snug ${cfg.titleCls}`}>
            {alert.title}
          </p>
          <span className="text-[10px] font-medium text-neutral-400">
            {PRIORITY_LABEL[alert.priority]}
          </span>
        </div>

        <p className="text-xs text-neutral-500 leading-snug">
          {alert.description}
        </p>

        {alert.actionLabel && alert.actionHref && (
          <Link href={alert.actionHref}>
            <span
              className={`
                inline-flex items-center mt-0.5 px-3 py-1.5 rounded-lg
                text-xs font-semibold transition-colors
                ${cfg.btnBg}
              `}
            >
              {alert.actionLabel} →
            </span>
          </Link>
        )}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────── */

interface Props {
  alerts: PerformanceAlert[]
}

export function SellerAlertsPanel({ alerts }: Props) {
  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm px-6 py-5 flex flex-col gap-3">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
          Alertas
        </p>
        <p className="text-sm text-neutral-400 italic">
          Sin alertas activas — tu tienda no tiene problemas detectados.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm px-6 py-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
          Alertas
        </p>
        <span className="text-xs text-neutral-400">
          {alerts.length} activa{alerts.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {alerts.map((alert) => (
          <AlertRow key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  )
}
