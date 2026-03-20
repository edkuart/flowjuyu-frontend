"use client"

// src/components/seller/SellerAutoInsightsSection.tsx

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2, AlertTriangle, Info, ArrowRight } from "lucide-react"
import { fetchSellerInsights, type Insight, type InsightSeverity } from "@/services/sellerInsightsAnalytics"
import { fetchSellerProductAnalytics } from "@/services/sellerProductAnalytics"

// ─────────────────────────────────────────────────────────────────────────────
// Style maps
// ─────────────────────────────────────────────────────────────────────────────

const CARD: Record<InsightSeverity, string> = {
  positive: "bg-emerald-50  border border-emerald-200",
  warning:  "bg-amber-50    border border-amber-200",
  neutral:  "bg-neutral-50  border border-neutral-200",
}

const TITLE: Record<InsightSeverity, string> = {
  positive: "text-emerald-800",
  warning:  "text-amber-800",
  neutral:  "text-neutral-700",
}

const MSG: Record<InsightSeverity, string> = {
  positive: "text-emerald-700",
  warning:  "text-amber-700",
  neutral:  "text-neutral-500",
}

const BTN: Record<InsightSeverity, string> = {
  positive: "text-emerald-700 border-emerald-300 hover:bg-emerald-100",
  warning:  "text-amber-700   border-amber-300   hover:bg-amber-100",
  neutral:  "text-neutral-600 border-neutral-300 hover:bg-neutral-100",
}

// ─────────────────────────────────────────────────────────────────────────────
// Action resolution
// ─────────────────────────────────────────────────────────────────────────────

type InsightAction = {
  label: string
  href:  string
}

function resolveAction(type: string, topCode: string | null): InsightAction | null {
  switch (type) {
    case "zero_views":
    case "no_views":
      return { label: "Ver productos sin visitas", href: "/seller/products" }

    case "no_qr_traffic":
      return { label: "Ver códigos QR", href: "/seller/products" }

    case "top_product":
      return topCode
        ? { label: "Ver producto", href: `/p/${topCode}` }
        : { label: "Ver producto", href: "/seller/products" }

    case "traffic_concentrated":
      return { label: "Explorar otros productos", href: "/seller/products" }

    default:
      return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

function InsightIcon({ severity }: { severity: InsightSeverity }) {
  const cls = "w-4 h-4 flex-shrink-0 mt-0.5"
  if (severity === "positive") return <CheckCircle2 className={`${cls} text-emerald-600`} />
  if (severity === "warning")  return <AlertTriangle className={`${cls} text-amber-500`} />
  return <Info className={`${cls} text-neutral-400`} />
}

function InsightCard({
  insight,
  action,
}: {
  insight: Insight
  action:  InsightAction | null
}) {
  return (
    <div className={`rounded-xl px-4 py-3.5 flex gap-3 ${CARD[insight.severity]}`}>
      <InsightIcon severity={insight.severity} />

      <div className="flex-1 min-w-0 space-y-2">
        <div className="space-y-0.5">
          <p className={`text-sm font-semibold leading-snug ${TITLE[insight.severity]}`}>
            {insight.title}
          </p>
          <p className={`text-xs leading-relaxed ${MSG[insight.severity]}`}>
            {insight.message}
          </p>
        </div>

        {action && (
          <Link
            href={action.href}
            className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${BTN[insight.severity]}`}
          >
            {action.label}
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export function SellerAutoInsightsSection() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [topCode,  setTopCode]  = useState<string | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(false)

  useEffect(() => {
    Promise.all([
      fetchSellerInsights(),
      fetchSellerProductAnalytics(),
    ])
      .then(([insightsRes, productsRes]) => {
        setInsights(insightsRes.insights)
        // internal_code of the top-viewed product, used for top_product action
        const first = productsRes.data[0]
        setTopCode(first?.internal_code ?? null)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="space-y-3">
        <div className="h-5 w-40 bg-neutral-200 rounded animate-pulse" />
        <div className="space-y-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-16 bg-neutral-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  if (error || insights.length === 0) return null

  return (
    <section className="space-y-3">
      <div className="space-y-0.5">
        <h2 className="text-lg font-semibold text-neutral-800">
          Insights automáticos
        </h2>
        <p className="text-sm text-neutral-400">
          Observaciones basadas en el comportamiento de tu catálogo
        </p>
      </div>

      <div className="space-y-2">
        {insights.map((ins, i) => (
          <InsightCard
            key={`${ins.type}-${i}`}
            insight={ins}
            action={resolveAction(ins.type, topCode)}
          />
        ))}
      </div>
    </section>
  )
}
