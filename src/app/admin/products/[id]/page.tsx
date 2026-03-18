"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { authFetch } from "@/lib/authFetch"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

// ── Types ──────────────────────────────────────────────────────────────────────

interface ProductDetail {
  id: string
  nombre: string
  precio: number | string
  activo: boolean
  created_at: string
  descripcion?: string
  vendedor_email?: string
  nombre_comercio?: string
  estado_admin?: string
  estado_validacion?: string
  estado_marketplace: string
  total_views?: number
  views_7d?: number
  views_30d?: number
  last_view?: string | null
  images_count?: number
  imagenes?: { id: string | number; url: string }[]
  flags?: {
    isDeadProduct?: boolean
    isSuspicious?: boolean
  }
  risk?: {
    score: number
    level: "low" | "medium" | "high"
    reasons?: string[]
  }
}

// ── Score system (mirrors list page) ──────────────────────────────────────────

function computeProductScore(p: ProductDetail): number {
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

// ── AI Recommendations ─────────────────────────────────────────────────────────

type Recommendation = { icon: string; priority: "high" | "medium" | "low"; text: string }

function getRecommendations(p: ProductDetail): Recommendation[] {
  const recs: Recommendation[] = []

  if (p.risk?.level === "high") {
    recs.push({ icon: "🚨", priority: "high", text: "High risk score detected. Review product content and seller compliance before promoting." })
  }
  if (p.estado_marketplace === "bloqueado_seller") {
    recs.push({ icon: "⛔", priority: "high", text: "Product blocked due to seller account status. Resolve seller KYC to restore visibility." })
  }
  if (p.estado_marketplace === "pendiente_kyc") {
    recs.push({ icon: "⏳", priority: "high", text: "Product held pending seller KYC validation. Expedite review to unlock listing." })
  }
  if (!p.activo && p.estado_marketplace !== "bloqueado_seller") {
    recs.push({ icon: "⏸", priority: "medium", text: "Product is inactive. Activate it to make it visible in the marketplace." })
  }
  if ((p.images_count ?? (p.imagenes?.length ?? 1)) === 0) {
    recs.push({ icon: "🖼", priority: "medium", text: "No product images found. Adding images significantly improves conversion rates." })
  }
  if (p.total_views !== undefined && p.total_views === 0) {
    recs.push({ icon: "👁", priority: "medium", text: "Zero lifetime views. Consider promoting this product or verifying marketplace visibility." })
  }
  if (p.flags?.isDeadProduct) {
    recs.push({ icon: "💀", priority: "medium", text: "Product flagged as dead (no relevant activity). Consider deactivation or repricing." })
  }
  if (p.flags?.isSuspicious) {
    recs.push({ icon: "⚠️", priority: "high", text: "High traffic with low visibility — possible manipulation or broken status. Investigate." })
  }
  if ((p.views_7d ?? 0) > 20 && p.activo) {
    recs.push({ icon: "🔥", priority: "low", text: "Strong recent traffic. Consider featuring this product on the homepage or in promotions." })
  }
  if (recs.length === 0) {
    recs.push({ icon: "✅", priority: "low", text: "Product appears healthy. No immediate action required." })
  }
  return recs
}

// ── Style helpers ──────────────────────────────────────────────────────────────

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

function riskColor(level?: string) {
  switch (level) {
    case "high":   return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0"
    case "medium": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-0"
    case "low":    return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-0"
    default:       return "bg-gray-100 text-gray-600 border-0"
  }
}

const PRIORITY_STYLE: Record<"high" | "medium" | "low", string> = {
  high:   "border-l-red-500 bg-red-50 dark:bg-red-950/20",
  medium: "border-l-yellow-400 bg-yellow-50 dark:bg-yellow-950/20",
  low:    "border-l-green-400 bg-green-50 dark:bg-green-950/20",
}

// ── Score gauge ────────────────────────────────────────────────────────────────

function ScoreGauge({ score }: { score: number }) {
  const band = scoreBand(score)
  const { barColor, textColor, label } = band === "critical"
    ? { barColor: "bg-red-500",    textColor: "text-red-600 dark:text-red-400",    label: "Critical" }
    : band === "at_risk"
    ? { barColor: "bg-yellow-400", textColor: "text-yellow-600 dark:text-yellow-400", label: "At Risk" }
    : { barColor: "bg-green-500",  textColor: "text-green-600 dark:text-green-400", label: "Healthy" }

  return (
    <div className="border rounded-xl p-5 space-y-4 bg-card">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-sm">Product Score</h2>
          <p className="text-xs text-muted-foreground">Computed from risk, status, activity & content</p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          band === "critical" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" :
          band === "at_risk"  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" :
                                "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
        }`}>{label}</span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-end justify-between">
          <span className={`text-4xl font-bold tabular-nums ${textColor}`}>{score}</span>
          <span className="text-xs text-muted-foreground mb-1">/ 100</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${score}%` }} />
        </div>
      </div>
    </div>
  )
}

// ── Activity timeline ──────────────────────────────────────────────────────────

function ActivityTimeline({ data }: { data: ProductDetail }) {
  const items = [
    {
      label: "Last view",
      value: data.last_view
        ? new Date(data.last_view).toLocaleString()
        : "No recent activity",
      dot: data.last_view ? "bg-green-500" : "bg-muted-foreground/30",
    },
    {
      label: "Views last 7 days",
      value: data.views_7d !== undefined ? `${data.views_7d} views` : "No data",
      dot: (data.views_7d ?? 0) > 5 ? "bg-green-500" : (data.views_7d ?? 0) > 0 ? "bg-yellow-400" : "bg-muted-foreground/30",
    },
    {
      label: "Views last 30 days",
      value: data.views_30d !== undefined ? `${data.views_30d} views` : "No data",
      dot: (data.views_30d ?? 0) > 10 ? "bg-green-500" : (data.views_30d ?? 0) > 0 ? "bg-yellow-400" : "bg-muted-foreground/30",
    },
    {
      label: "Lifetime views",
      value: data.total_views !== undefined ? `${data.total_views} total` : "No data",
      dot: (data.total_views ?? 0) > 0 ? "bg-blue-400" : "bg-muted-foreground/30",
    },
    {
      label: "Listed since",
      value: new Date(data.created_at).toLocaleDateString(),
      dot: "bg-muted-foreground/40",
    },
  ]

  return (
    <div className="border rounded-xl overflow-hidden bg-card">
      <div className="px-4 py-3 border-b bg-muted/30">
        <h2 className="font-semibold text-sm">Activity Timeline</h2>
        <p className="text-xs text-muted-foreground">View engagement signals over time</p>
      </div>
      <ul className="divide-y">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-3 px-4 py-3">
            <span className={`w-2 h-2 rounded-full shrink-0 ${item.dot}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-medium">{item.value}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AdminProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [data,     setData]     = useState<ProductDetail | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [toggling, setToggling] = useState(false)

  async function fetchProduct() {
    try {
      const res = await authFetch(`${API_URL}/api/admin/products/${id}`)
      if (!res.ok) return
      const json = await res.json()
      setData(json.data ?? json)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle() {
    if (!data) return
    setToggling(true)
    try {
      await authFetch(`${API_URL}/api/admin/products/${id}/toggle`, { method: "PATCH" })
      await fetchProduct()
    } finally {
      setToggling(false)
    }
  }

  useEffect(() => { fetchProduct() }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 rounded-xl bg-muted animate-pulse" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="h-32 rounded-xl bg-muted animate-pulse" />
          <div className="h-32 rounded-xl bg-muted animate-pulse" />
        </div>
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[40vh] text-center">
        <p className="text-sm text-muted-foreground">Product not found or could not be loaded.</p>
        <Button variant="outline" onClick={() => router.push("/admin/products")}>Back to Products</Button>
      </div>
    )
  }

  const score = computeProductScore(data)
  const recommendations = getRecommendations(data)

  return (
    <div className="space-y-8">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <button
            onClick={() => router.push("/admin/products")}
            className="text-xs text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1"
          >
            ← Back to Products
          </button>
          <h1 className="text-2xl font-bold tracking-tight">{data.nombre}</h1>
          <p className="text-xs text-muted-foreground mt-1">ID: {data.id}</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge className={estadoColor(data.estado_marketplace)}>
            {estadoLabel(data.estado_marketplace)}
          </Badge>
          {data.risk && (
            <Badge className={riskColor(data.risk.level)}>
              Risk: {data.risk.level.toUpperCase()}
            </Badge>
          )}
          <Button
            size="sm"
            variant={data.activo ? "destructive" : "default"}
            onClick={handleToggle}
            disabled={toggling}
          >
            {toggling ? "Saving…" : data.activo ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </div>

      {/* ── SCORE + ACTIVITY ────────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        <ScoreGauge score={score} />
        <ActivityTimeline data={data} />
      </div>

      {/* ── AI RECOMMENDATIONS ──────────────────────────────────────────────── */}
      <div className="border rounded-xl overflow-hidden bg-card">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-sm">AI Recommendations</h2>
            <p className="text-xs text-muted-foreground">Derived from product signals and risk analysis</p>
          </div>
          <span className="text-xs text-muted-foreground">{recommendations.length} insight{recommendations.length !== 1 ? "s" : ""}</span>
        </div>
        <ul className="divide-y">
          {recommendations.map((rec, i) => (
            <li key={i} className={`flex items-start gap-3 px-4 py-3 border-l-4 ${PRIORITY_STYLE[rec.priority]}`}>
              <span className="text-lg leading-none shrink-0 mt-0.5">{rec.icon}</span>
              <p className="text-sm">{rec.text}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* ── INFO GRID ───────────────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">

        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="px-4 py-3 border-b bg-muted/30">
            <h2 className="font-semibold text-sm">Product Info</h2>
          </div>
          <ul className="divide-y">
            {[
              ["Price",       `Q ${Number(data.precio).toFixed(2)}`],
              ["Active",      data.activo ? "Yes" : "No"],
              ["Created",     new Date(data.created_at).toLocaleDateString()],
              ["Description", data.descripcion || "No description"],
            ].map(([label, value]) => (
              <li key={label} className="flex items-start justify-between gap-4 px-4 py-2.5">
                <span className="text-xs text-muted-foreground shrink-0">{label}</span>
                <span className="text-sm text-right">{value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="px-4 py-3 border-b bg-muted/30">
            <h2 className="font-semibold text-sm">Seller Info</h2>
          </div>
          <ul className="divide-y">
            {[
              ["Store",       data.nombre_comercio || "No seller"],
              ["Email",       data.vendedor_email  || "N/A"],
              ["Admin state", data.estado_admin    || "N/A"],
              ["KYC state",   data.estado_validacion || "N/A"],
            ].map(([label, value]) => (
              <li key={label} className="flex items-start justify-between gap-4 px-4 py-2.5">
                <span className="text-xs text-muted-foreground shrink-0">{label}</span>
                <span className="text-sm text-right">{value}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* ── RISK DETAILS ────────────────────────────────────────────────────── */}
      {data.risk && (
        <div className="border rounded-xl overflow-hidden bg-card">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
            <h2 className="font-semibold text-sm">Risk Analysis</h2>
            <Badge className={riskColor(data.risk.level)}>
              {data.risk.level.toUpperCase()} — {data.risk.score}
            </Badge>
          </div>
          {data.risk.reasons && data.risk.reasons.length > 0 ? (
            <ul className="divide-y">
              {data.risk.reasons.map((r, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  <span className="text-sm">{r}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-sm text-muted-foreground">No detailed risk reasons available.</p>
          )}
        </div>
      )}

      {/* ── IMAGES ──────────────────────────────────────────────────────────── */}
      <div className="border rounded-xl overflow-hidden bg-card">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
          <h2 className="font-semibold text-sm">Product Images</h2>
          <span className="text-xs text-muted-foreground">{data.imagenes?.length ?? 0} image{(data.imagenes?.length ?? 0) !== 1 ? "s" : ""}</span>
        </div>
        {!data.imagenes || data.imagenes.length === 0 ? (
          <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
            No images uploaded for this product.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {data.imagenes.map((img) => (
              <img
                key={img.id}
                src={img.url}
                alt="Product image"
                className="rounded-xl border shadow-sm object-cover aspect-square"
              />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
