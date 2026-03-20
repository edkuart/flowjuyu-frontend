"use client"

// src/components/seller/SellerGrowthSection.tsx
// Compares last 7 days vs previous 7 days to show sellers their progress.

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, Minus, QrCode, Eye } from "lucide-react"
import { fetchSellerGrowth, type SellerGrowthResponse } from "@/services/sellerGrowthAnalytics"

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

type Direction = "up" | "down" | "flat"

function direction(pct: number): Direction {
  if (pct > 0)  return "up"
  if (pct < 0)  return "down"
  return "flat"
}

function fmt(pct: number): string {
  if (pct > 0) return `+${pct}%`
  if (pct < 0) return `${pct}%`
  return "0%"
}

// ─────────────────────────────────────────────────────────────────────────────
// Single metric row
// ─────────────────────────────────────────────────────────────────────────────

const ROW_STYLES: Record<Direction, { badge: string; text: string; icon: string }> = {
  up:   { badge: "bg-emerald-100 text-emerald-700", text: "text-emerald-700", icon: "text-emerald-600" },
  down: { badge: "bg-red-100 text-red-600",         text: "text-red-600",     icon: "text-red-500"    },
  flat: { badge: "bg-neutral-100 text-neutral-500", text: "text-neutral-500", icon: "text-neutral-400" },
}

function GrowthRow({
  label,
  last7,
  pct,
  icon,
  successMessage,
}: {
  label:          string
  last7:          number
  pct:            number
  icon:           React.ReactNode
  successMessage?: string
}) {
  const dir    = direction(pct)
  const styles = ROW_STYLES[dir]

  const TrendIcon =
    dir === "up"   ? TrendingUp   :
    dir === "down" ? TrendingDown :
    Minus

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-neutral-100 last:border-0">
      <div className="flex items-center gap-2.5 text-sm text-neutral-600 min-w-0">
        <span className="text-neutral-400 flex-shrink-0">{icon}</span>
        <div className="min-w-0">
          <p className="font-medium text-neutral-700 leading-snug">{label}</p>
          {dir === "up" && successMessage && (
            <p className="text-xs text-emerald-600 mt-0.5">{successMessage}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-sm tabular-nums text-neutral-500">{last7} vistas</span>
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${styles.badge}`}>
          <TrendIcon className={`w-3 h-3 ${styles.icon}`} />
          {fmt(pct)}
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export function SellerGrowthSection() {
  const [data,    setData]    = useState<SellerGrowthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    fetchSellerGrowth()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="space-y-3">
        <div className="h-5 w-36 bg-neutral-200 rounded animate-pulse" />
        <div className="bg-white border rounded-xl divide-y divide-neutral-100 overflow-hidden">
          {[0, 1].map(i => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <div className="h-4 w-40 bg-neutral-100 rounded animate-pulse" />
              <div className="h-5 w-16 bg-neutral-100 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  // No data or both windows are zero — nothing meaningful to show
  if (error || !data || (data.views_last7 === 0 && data.views_prev7 === 0)) return null

  const viewsDir = direction(data.views_change_percent)
  const qrDir    = direction(data.qr_change_percent)

  // Section header reinforcement message
  const headline =
    viewsDir === "up"
      ? "Vas por buen camino esta semana"
      : viewsDir === "down"
      ? "El tráfico bajó esta semana"
      : "Tu tráfico se mantuvo estable"

  return (
    <section className="space-y-3">
      <div className="space-y-0.5">
        <h2 className="text-lg font-semibold text-neutral-800">Tu crecimiento</h2>
        <p className={`text-sm ${viewsDir === "up" ? "text-emerald-600 font-medium" : "text-neutral-400"}`}>
          {headline}
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4">
          <GrowthRow
            label="Vistas de productos"
            last7={data.views_last7}
            pct={data.views_change_percent}
            icon={<Eye className="w-4 h-4" />}
            successMessage={
              viewsDir === "up"
                ? `Tus visitas crecieron ${fmt(data.views_change_percent)} esta semana`
                : undefined
            }
          />

          {/* Only show QR row when there's QR data worth displaying */}
          {(data.qr_last7 > 0 || data.qr_prev7 > 0) && (
            <GrowthRow
              label="Tráfico vía QR"
              last7={data.qr_last7}
              pct={data.qr_change_percent}
              icon={<QrCode className="w-4 h-4" />}
              successMessage={
                qrDir === "up"
                  ? `Tu tráfico QR aumentó ${fmt(data.qr_change_percent)} — ¡sigue compartiendo!`
                  : undefined
              }
            />
          )}
        </div>

        <div className="px-4 py-2.5 bg-neutral-50 border-t border-neutral-100">
          <p className="text-xs text-neutral-400">
            Comparado con los 7 días anteriores
          </p>
        </div>
      </div>
    </section>
  )
}
