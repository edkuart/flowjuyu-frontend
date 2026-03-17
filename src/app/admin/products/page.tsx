"use client"

import { useEffect, useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { authFetch } from "@/lib/authFetch"
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8800"

// ── Types ──────────────────────────────────────────────────────────────────────

interface Product {
  id: string
  nombre: string
  precio: number | string
  activo: boolean
  created_at: string
  vendedor_email: string | null
  estado_marketplace: string
  total_views?: number
  views_7d?: number
  images_count?: number
  risk?: {
    score: number
    level: "low" | "medium" | "high"
  }
}

type SmartFilter =
  | "all"
  | "high_risk"
  | "no_images"
  | "no_views"
  | "inactive"
  | "blocked"
  | "high_potential"

// ── Score system ───────────────────────────────────────────────────────────────

function computeProductScore(p: Product): number {
  let s = 100
  if (p.risk?.level === "high")   s -= 30
  if (p.risk?.level === "medium") s -= 15
  switch (p.estado_marketplace) {
    case "bloqueado_seller": s -= 30; break
    case "sin_vendedor":     s -= 20; break
    case "desactivado":      s -= 15; break
    case "pendiente_kyc":    s -= 10; break
  }
  if (!p.activo) s -= 20
  if (p.total_views !== undefined && p.total_views === 0) s -= 10
  if (p.images_count !== undefined && p.images_count === 0) s -= 10
  return Math.max(0, Math.min(100, s))
}

function scoreBand(score: number): "critical" | "at_risk" | "healthy" {
  if (score < 40) return "critical"
  if (score < 70) return "at_risk"
  return "healthy"
}

// ── Insight tags ───────────────────────────────────────────────────────────────

type Insight = { icon: string; label: string; color: string }

function getInsights(p: Product): Insight[] {
  const tags: Insight[] = []
  if (p.risk?.level === "high")                          tags.push({ icon: "🚨", label: "High risk",    color: "text-red-600" })
  if (p.estado_marketplace === "bloqueado_seller")       tags.push({ icon: "⛔", label: "Blocked",      color: "text-red-600" })
  if (p.estado_marketplace === "pendiente_kyc")          tags.push({ icon: "⏳", label: "KYC pending",  color: "text-yellow-600" })
  if (!p.activo)                                         tags.push({ icon: "⏸", label: "Inactive",     color: "text-gray-500" })
  if (p.images_count !== undefined && p.images_count === 0) tags.push({ icon: "🖼", label: "No images",   color: "text-orange-500" })
  if (p.total_views !== undefined && p.total_views === 0)   tags.push({ icon: "👁", label: "No views",    color: "text-gray-400" })
  if (tags.length === 0 && (p.views_7d ?? 0) > 10)      tags.push({ icon: "🔥", label: "Trending",     color: "text-green-600" })
  if (tags.length === 0)                                 tags.push({ icon: "✅", label: "Healthy",      color: "text-green-600" })
  return tags
}

// ── Smart filter logic ─────────────────────────────────────────────────────────

function applyFilter(products: Product[], filter: SmartFilter): Product[] {
  switch (filter) {
    case "high_risk":      return products.filter(p => p.risk?.level === "high")
    case "no_images":      return products.filter(p => p.images_count !== undefined && p.images_count === 0)
    case "no_views":       return products.filter(p => p.total_views !== undefined && p.total_views === 0)
    case "inactive":       return products.filter(p => !p.activo)
    case "blocked":        return products.filter(p => p.estado_marketplace === "bloqueado_seller")
    case "high_potential": return products.filter(p => {
      const score = computeProductScore(p)
      return score >= 60 && !p.activo
    })
    default:               return products
  }
}

// ── Label helpers ──────────────────────────────────────────────────────────────

function estadoLabel(estado: string) {
  switch (estado) {
    case "visible":          return "Visible"
    case "bloqueado_seller": return "Blocked"
    case "pendiente_kyc":    return "Pending KYC"
    case "sin_vendedor":     return "No seller"
    case "desactivado":      return "Deactivated"
    default:                 return estado
  }
}

function estadoColor(estado: string) {
  switch (estado) {
    case "visible":          return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0"
    case "bloqueado_seller": return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0"
    case "pendiente_kyc":    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-0"
    case "sin_vendedor":     return "bg-gray-100 text-gray-600 border-0"
    case "desactivado":      return "bg-gray-100 text-gray-600 border-0"
    default:                 return "bg-gray-100 text-gray-600 border-0"
  }
}

// ── Score bar ──────────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const band = scoreBand(score)
  const color =
    band === "critical" ? "bg-red-500" :
    band === "at_risk"  ? "bg-yellow-400" :
                          "bg-green-500"
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{score}</span>
    </div>
  )
}

// ── Priority overview ──────────────────────────────────────────────────────────

function PriorityOverview({
  critical, atRisk, healthy, total,
}: { critical: number; atRisk: number; healthy: number; total: number }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="border rounded-xl p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 space-y-1">
        <p className="text-xs font-medium text-red-700 dark:text-red-400 uppercase tracking-wide">Critical</p>
        <p className="text-3xl font-bold text-red-700 dark:text-red-400">{critical}</p>
        <p className="text-xs text-muted-foreground">Score &lt; 40 — immediate action</p>
      </div>
      <div className="border rounded-xl p-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 space-y-1">
        <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400 uppercase tracking-wide">At Risk</p>
        <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{atRisk}</p>
        <p className="text-xs text-muted-foreground">Score 40–69 — review soon</p>
      </div>
      <div className="border rounded-xl p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 space-y-1">
        <p className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">Healthy</p>
        <p className="text-3xl font-bold text-green-700 dark:text-green-400">{healthy}</p>
        <p className="text-xs text-muted-foreground">{total > 0 ? `${Math.round((healthy / total) * 100)}% of catalogue` : "No products"}</p>
      </div>
    </div>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[0,1,2].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

// ── Filter bar ─────────────────────────────────────────────────────────────────

const FILTER_LABELS: Record<SmartFilter, string> = {
  all:            "All",
  high_risk:      "🚨 High Risk",
  no_images:      "🖼 No Images",
  no_views:       "👁 No Views",
  inactive:       "⏸ Inactive",
  blocked:        "⛔ Blocked",
  high_potential: "⚡ High Potential",
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(false)
  const [filter,   setFilter]   = useState<SmartFilter>("all")
  const [toggling, setToggling] = useState<string | null>(null)

  async function fetchProducts() {
    setLoading(true)
    setError(false)
    try {
      const res = await authFetch(`${API_URL}/api/admin/products`)
      if (!res.ok) { setError(true); return }
      const json = await res.json()
      setProducts(json.data ?? json ?? [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(product: Product) {
    setToggling(product.id)
    try {
      await authFetch(`${API_URL}/api/admin/products/${product.id}/toggle`, { method: "PATCH" })
      await fetchProducts()
    } finally {
      setToggling(null)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  // Priority counts
  const { critical, atRisk, healthy } = useMemo(() => {
    let critical = 0, atRisk = 0, healthy = 0
    for (const p of products) {
      const band = scoreBand(computeProductScore(p))
      if (band === "critical")  critical++
      else if (band === "at_risk") atRisk++
      else healthy++
    }
    return { critical, atRisk, healthy }
  }, [products])

  // Filter counts for badge
  const filterCounts = useMemo<Partial<Record<SmartFilter, number>>>(() => ({
    high_risk:      products.filter(p => p.risk?.level === "high").length,
    no_images:      products.filter(p => p.images_count !== undefined && p.images_count === 0).length,
    no_views:       products.filter(p => p.total_views !== undefined && p.total_views === 0).length,
    inactive:       products.filter(p => !p.activo).length,
    blocked:        products.filter(p => p.estado_marketplace === "bloqueado_seller").length,
    high_potential: products.filter(p => computeProductScore(p) >= 60 && !p.activo).length,
  }), [products])

  const displayed = useMemo(
    () => applyFilter(products, filter).sort((a, b) => computeProductScore(a) - computeProductScore(b)),
    [products, filter],
  )

  if (loading) return <div className="space-y-4 p-1"><PageSkeleton /></div>

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[40vh] text-center">
        <p className="text-sm text-muted-foreground">Could not load products. The API may be unavailable.</p>
        <button onClick={fetchProducts} className="text-xs px-4 py-2 rounded-lg border hover:bg-muted transition-colors">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Catalogue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Score-based visibility and risk management for {products.length} products.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Last refreshed</p>
          <p className="text-xs font-medium">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      {/* ── PRIORITY OVERVIEW ───────────────────────────────────────────────── */}
      <PriorityOverview
        critical={critical}
        atRisk={atRisk}
        healthy={healthy}
        total={products.length}
      />

      {/* ── SMART FILTER BAR ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(FILTER_LABELS) as SmartFilter[]).map((f) => {
          const count = f === "all" ? products.length : filterCounts[f]
          const active = filter === f
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all
                ${active
                  ? "bg-foreground text-background border-foreground font-semibold"
                  : "bg-background text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
                }`}
            >
              {FILTER_LABELS[f]}
              {count !== undefined && count > 0 && (
                <span className={`text-[10px] font-bold px-1 rounded-full ${active ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── TABLE ───────────────────────────────────────────────────────────── */}
      <div className="border rounded-xl bg-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <p className="text-sm font-semibold">
            {filter === "all" ? "All Products" : FILTER_LABELS[filter]}
          </p>
          <span className="text-xs text-muted-foreground">{displayed.length} result{displayed.length !== 1 ? "s" : ""}</span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Insights</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {displayed.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                  No products match this filter.
                </TableCell>
              </TableRow>
            ) : (
              displayed.map((product) => {
                const score    = computeProductScore(product)
                const insights = getInsights(product)
                const isToggling = toggling === product.id
                return (
                  <TableRow key={product.id} className="hover:bg-muted/30">

                    <TableCell className="font-medium max-w-[200px]">
                      <button
                        onClick={() => router.push(`/admin/products/${product.id}`)}
                        className="text-left hover:underline truncate block w-full"
                      >
                        {product.nombre}
                      </button>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(product.created_at).toLocaleDateString()}
                      </p>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {product.vendedor_email || <span className="italic text-xs">No seller</span>}
                    </TableCell>

                    <TableCell className="text-sm tabular-nums">
                      Q {Number(product.precio).toFixed(2)}
                    </TableCell>

                    <TableCell>
                      <Badge className={`text-xs ${estadoColor(product.estado_marketplace)}`}>
                        {estadoLabel(product.estado_marketplace)}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <ScoreBar score={score} />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1 flex-wrap">
                        {insights.map((ins, i) => (
                          <span key={i} title={ins.label} className={`text-base leading-none ${ins.color}`}>
                            {ins.icon}
                          </span>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleToggle(product)}
                          disabled={isToggling}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-colors disabled:opacity-50
                            ${product.activo
                              ? "border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                              : "border-green-200 text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
                            }`}
                        >
                          {isToggling ? "…" : product.activo ? "Deactivate" : "Activate"}
                        </button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7"
                          onClick={() => router.push(`/admin/products/${product.id}`)}
                        >
                          Detail
                        </Button>
                      </div>
                    </TableCell>

                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

    </div>
  )
}
