"use client"

// src/components/seller/SellerProductAnalyticsSection.tsx
// Displays per-product view analytics: total, QR, and web traffic.

import { useEffect, useState } from "react"
import Link from "next/link"
import { QrCode, Globe, Eye, Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  fetchSellerProductAnalytics,
  type ProductAnalyticsRow,
} from "@/services/sellerProductAnalytics"

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function pct(part: number, total: number): number {
  if (!total) return 0
  return Math.round((part / total) * 100)
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const width = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// A) Top Products
// ─────────────────────────────────────────────────────────────────────────────

function TopProductsCard({ rows }: { rows: ProductAnalyticsRow[] }) {
  const top5 = rows.slice(0, 5)
  const maxViews = top5[0]?.views_total ?? 1

  return (
    <Card className="bg-white border shadow-sm">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-neutral-400" />
          <h3 className="font-semibold text-neutral-800">Productos más vistos</h3>
        </div>

        {top5.length === 0 ? (
          <p className="text-sm text-neutral-400 py-4 text-center">
            Aún sin vistas registradas
          </p>
        ) : (
          <ol className="space-y-4">
            {top5.map((p, i) => (
              <li key={p.product_id} className="space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-neutral-300 w-4 flex-shrink-0">
                      {i + 1}
                    </span>
                    <Link
                      href={`/product/${p.product_id}`}
                      className="text-sm text-neutral-700 hover:text-orange-600 hover:underline truncate leading-snug"
                    >
                      {p.nombre}
                    </Link>
                  </div>
                  <span className="text-sm font-semibold text-neutral-900 flex-shrink-0 tabular-nums">
                    {p.views_total}
                  </span>
                </div>
                <MiniBar
                  value={p.views_total}
                  max={maxViews}
                  color={i === 0 ? "bg-orange-400" : "bg-neutral-300"}
                />
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// B) Traffic Distribution
// ─────────────────────────────────────────────────────────────────────────────

function TrafficDistributionCard({ rows }: { rows: ProductAnalyticsRow[] }) {
  const totalViews = rows.reduce((s, r) => s + r.views_total, 0)
  const totalQr    = rows.reduce((s, r) => s + r.views_qr,    0)
  const totalWeb   = rows.reduce((s, r) => s + r.views_web,   0)
  // untagged = views that arrived before source tracking existed
  const totalOther = totalViews - totalQr - totalWeb

  const qrPct    = pct(totalQr,    totalViews)
  const webPct   = pct(totalWeb,   totalViews)
  const otherPct = pct(totalOther, totalViews)

  return (
    <Card className="bg-white border shadow-sm">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-neutral-400" />
          <h3 className="font-semibold text-neutral-800">Distribución de tráfico</h3>
        </div>

        {totalViews === 0 ? (
          <p className="text-sm text-neutral-400 py-4 text-center">
            Aún sin datos de tráfico
          </p>
        ) : (
          <div className="space-y-4">

            {/* Stacked bar */}
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
              {qrPct   > 0 && <div className="bg-orange-400 transition-all" style={{ width: `${qrPct}%` }} title={`QR ${qrPct}%`} />}
              {webPct  > 0 && <div className="bg-blue-400  transition-all" style={{ width: `${webPct}%` }}  title={`Web ${webPct}%`} />}
              {otherPct > 0 && <div className="bg-neutral-200 transition-all" style={{ width: `${otherPct}%` }} title={`Otros ${otherPct}%`} />}
            </div>

            {/* Legend rows */}
            <div className="space-y-2.5">
              <TrafficRow
                icon={<QrCode className="w-3.5 h-3.5 text-orange-500" />}
                label="Vía QR"
                count={totalQr}
                percent={qrPct}
                barColor="bg-orange-400"
              />
              <TrafficRow
                icon={<Globe className="w-3.5 h-3.5 text-blue-500" />}
                label="Vía Web"
                count={totalWeb}
                percent={webPct}
                barColor="bg-blue-400"
              />
              {totalOther > 0 && (
                <TrafficRow
                  icon={<Eye className="w-3.5 h-3.5 text-neutral-400" />}
                  label="Sin clasificar"
                  count={totalOther}
                  percent={otherPct}
                  barColor="bg-neutral-300"
                />
              )}
            </div>

            <p className="text-xs text-neutral-400 pt-1">
              Total: {totalViews.toLocaleString()} vistas
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TrafficRow({
  icon, label, count, percent, barColor,
}: {
  icon: React.ReactNode
  label: string
  count: number
  percent: number
  barColor: string
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-neutral-600">
          {icon}
          {label}
        </span>
        <span className="tabular-nums font-medium text-neutral-800">
          {count.toLocaleString()} <span className="text-neutral-400">({percent}%)</span>
        </span>
      </div>
      <div className="h-1 w-full rounded-full bg-neutral-100 overflow-hidden">
        <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// C) Featured Product
// ─────────────────────────────────────────────────────────────────────────────

function FeaturedProductCard({ product }: { product: ProductAnalyticsRow }) {
  const qrShare = pct(product.views_qr, product.views_total)

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 shadow-sm">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-orange-500" />
          <h3 className="font-semibold text-neutral-800">Producto destacado</h3>
          <span className="ml-auto text-[10px] uppercase tracking-widest font-bold text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full">
            #1
          </span>
        </div>

        <div className="space-y-1">
          <Link
            href={`/product/${product.product_id}`}
            className="text-base font-semibold text-neutral-900 hover:text-orange-600 hover:underline leading-snug block"
          >
            {product.nombre}
          </Link>
          {product.internal_code && (
            <p className="text-xs font-mono text-neutral-400">{product.internal_code}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 pt-1">
          <Metric label="Total" value={product.views_total} color="text-neutral-900" />
          <Metric label="Via QR" value={product.views_qr}  color="text-orange-600" />
          <Metric label="Via Web" value={product.views_web} color="text-blue-600"  />
        </div>

        {product.views_qr > 0 && (
          <p className="text-xs text-neutral-500">
            <span className="font-semibold text-orange-600">{qrShare}%</span> de las vistas llegan vía QR
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center space-y-0.5">
      <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
      <p className="text-[10px] text-neutral-400 uppercase tracking-wide">{label}</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export function SellerProductAnalyticsSection() {
  const [rows, setRows]       = useState<ProductAnalyticsRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  useEffect(() => {
    fetchSellerProductAnalytics()
      .then(res => setRows(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="h-6 w-48 bg-neutral-200 rounded animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-48 bg-neutral-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  if (error) return null

  // No products at all — nothing useful to show
  const hasViews = rows.some(r => r.views_total > 0)
  if (!rows.length || !hasViews) return null

  const featured = rows[0]

  return (
    <section className="space-y-4">
      <div className="space-y-0.5">
        <h2 className="text-lg font-semibold text-neutral-800">
          Analytics de Productos
        </h2>
        <p className="text-sm text-neutral-400">
          Vistas por producto — tráfico web vs QR
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <TopProductsCard rows={rows} />
        <TrafficDistributionCard rows={rows} />
        <FeaturedProductCard product={featured} />
      </div>
    </section>
  )
}
