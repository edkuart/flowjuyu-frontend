// src/app/seller/dashboard/page.tsx

"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import {
  Eye,
  Store,
  Star,
  Package,
  TrendingUp,
  MessageCircle,
} from "lucide-react"

import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"

import { fetchSellerDashboard } from "@/services/sellerDashboard"
import { fetchSellerAnalytics } from "@/services/sellerAnalytics"
import { getSellerInsights } from "@/lib/sellerInsights"
import { SellerInsightsCard } from "@/components/seller/SellerInsightsCard"
import { interpretMetric, type MetricInterpretation } from "@/lib/metricInterpreter"
import { getSellerPerformanceSummary } from "@/lib/sellerPerformance"
import { SellerExecutiveSummaryCard } from "@/components/seller/SellerExecutiveSummaryCard"
import { SellerHealthScoreCard } from "@/components/seller/SellerHealthScoreCard"
import { SellerKpiHighlights } from "@/components/seller/SellerKpiHighlights"
import { SellerAlertsPanel } from "@/components/seller/SellerAlertsPanel"
import { SellerNextActionsCard } from "@/components/seller/SellerNextActionsCard"
import { SellerProductAnalyticsSection } from "@/components/seller/SellerProductAnalyticsSection"
import { SellerAutoInsightsSection } from "@/components/seller/SellerAutoInsightsSection"
import { SellerGrowthSection } from "@/components/seller/SellerGrowthSection"

type Analytics = {
  totalProductViews: number
  totalProfileViews: number
  totalIntentions: number
  conversionRatio: number
  topProducts: {
    id: string
    nombre: string
    total_views: number
  }[]
  topIntentedProducts: {
    id: string
    nombre: string
    total_intentions: number
  }[]
  last30Days: {
    date: string
    product_views: number
    profile_views: number
  }[]
  // Phase 2
  totalWhatsappClicks:  number
  last30WhatsappClicks: number
  totalReviews:         number
  avgRating:            number | null
}

type DashboardView = "general" | "ventas" | "contactos" | "reputacion"

type ReviewInsights = {
  rating_avg: number
  rating_distribution: Record<string, number>
  total_reviews: number
  recent_reviews_count: number
  low_rating_count: number
  top_products_by_reviews: {
    product_id: string
    producto_nombre: string
    review_count: number
    rating_avg: number
  }[]
  frequent_terms: {
    term: string
    count: number
  }[]
}

const VIEWS: { id: DashboardView; label: string }[] = [
  { id: "general",    label: "Resumen"    },
  { id: "ventas",     label: "Ventas"     },
  { id: "contactos",  label: "Contactos"  },
  { id: "reputacion", label: "Reputación" },
]

/* ── Metric pill inside the hero strip ── */
function MetricPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
}) {
  return (
    <div className="flex items-center gap-1.5 text-white/90">
      <span className="text-emerald-300">{icon}</span>
      <span className="text-sm font-bold">{value}</span>
      <span className="text-xs text-emerald-200">{label}</span>
    </div>
  )
}

/* ── Flat metric — no card, just text ── */
function FlatMetric({
  label,
  value,
  interp,
  emptyText,
}: {
  label: string
  value: number
  interp?: MetricInterpretation
  emptyText?: string
}) {
  const color = interp
    ? interp.color === "red"   ? "text-red-500"
    : interp.color === "amber" ? "text-amber-600"
    : "text-neutral-900"
    : "text-neutral-900"

  return (
    <div className="space-y-0.5">
      <p className="text-xs text-neutral-400">{label}</p>
      {value === 0 && emptyText ? (
        <p className="text-sm text-neutral-400 animate-fade-in">{emptyText}</p>
      ) : (
        <p className={`text-2xl font-bold animate-number-pop ${color}`}>{value}</p>
      )}
      {interp && <InterpBadge interp={interp} />}
    </div>
  )
}

export default function SellerDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<DashboardView>("general")

  const [catalogo, setCatalogo] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
  })

  const [analytics, setAnalytics] = useState<Analytics>({
    totalProductViews: 0,
    totalProfileViews: 0,
    totalIntentions: 0,
    conversionRatio: 0,
    topProducts: [],
    topIntentedProducts: [],
    last30Days: [],
    totalWhatsappClicks:  0,
    last30WhatsappClicks: 0,
    totalReviews:         0,
    avgRating:            null,
  })

  const [isMobile, setIsMobile] = useState(false)
  const [reviewInsights, setReviewInsights] = useState<ReviewInsights>({
    rating_avg: 0,
    rating_distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
    total_reviews: 0,
    recent_reviews_count: 0,
    low_rating_count: 0,
    top_products_by_reviews: [],
    frequent_terms: [],
  })

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const dash = await fetchSellerDashboard()
        const analyticsData = await fetchSellerAnalytics()

        setCatalogo({
          total: dash.productoStats?.total ?? 0,
          activos: dash.productoStats?.activos ?? 0,
          inactivos: dash.productoStats?.inactivos ?? 0,
        })

        setAnalytics({
          totalProductViews: analyticsData.totalProductViews ?? 0,
          totalProfileViews: analyticsData.totalProfileViews ?? 0,
          totalIntentions: analyticsData.totalIntentions ?? 0,
          conversionRatio: analyticsData.conversionRatio ?? 0,
          topProducts: analyticsData.topProducts ?? [],
          topIntentedProducts: analyticsData.topIntentedProducts ?? [],
          last30Days: analyticsData.last30Days ?? [],
          totalWhatsappClicks:  analyticsData.totalWhatsappClicks  ?? 0,
          last30WhatsappClicks: analyticsData.last30WhatsappClicks ?? 0,
          totalReviews:         analyticsData.totalReviews         ?? 0,
          avgRating:            analyticsData.avgRating            ?? null,
        })

        const reviewRes = await apiFetch("/api/seller/reviews/insights")
        if (reviewRes.ok) {
          const reviewJson = await reviewRes.json()
          setReviewInsights({
            rating_avg: reviewJson.rating_avg ?? 0,
            rating_distribution: reviewJson.rating_distribution ?? { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
            total_reviews: reviewJson.total_reviews ?? 0,
            recent_reviews_count: reviewJson.recent_reviews_count ?? 0,
            low_rating_count: reviewJson.low_rating_count ?? 0,
            top_products_by_reviews: reviewJson.top_products_by_reviews ?? [],
            frequent_terms: reviewJson.frequent_terms ?? [],
          })
        }
      } catch (e) {
        console.error("Error cargando dashboard:", e)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  /* ===============================
    📊 MÉTRICAS DERIVADAS PRO
  ================================ */

  const topProduct = analytics.topProducts?.[0] ?? null

  /* ===============================
    🎯 CONVERSIÓN
  ================================ */

  const conversionPercent = useMemo(() => {
    if (!analytics.totalProductViews) return 0
    return Number((analytics.conversionRatio * 100).toFixed(2))
  }, [analytics.totalProductViews, analytics.conversionRatio])


  /* ===============================
    📈 TOTAL 30 DÍAS
  ================================ */

  const totalTrend = useMemo(() => {
    if (!analytics.last30Days?.length) return 0

    return analytics.last30Days.reduce(
      (acc, d) => acc + (d.product_views ?? 0) + (d.profile_views ?? 0),
      0
    )
  }, [analytics.last30Days])

  /* ===============================
    🚀 CRECIMIENTO SEMANAL INTELIGENTE
  ================================ */

  const { growthPercent, bestDay } = useMemo(() => {
    if (!analytics.last30Days?.length) {
      return {
        growthPercent: 0,
        bestDay: null,
      }
    }

    const last7 = analytics.last30Days.slice(-7)
    const prev7 = analytics.last30Days.slice(-14, -7)

    const sum = (arr: typeof last7) =>
      arr.reduce(
        (acc, d) => acc + (d.product_views ?? 0) + (d.profile_views ?? 0),
        0
      )

    const totalLast7 = sum(last7)
    const totalPrev7 = sum(prev7)

    let growth = 0

    if (totalPrev7 > 0) {
      growth = Math.round(
        ((totalLast7 - totalPrev7) / totalPrev7) * 100
      )
    } else if (totalLast7 > 0) {
      growth = 100
    }

    const best =
      last7.length > 0
        ? [...last7].sort(
            (a, b) =>
              (b.product_views + b.profile_views) -
              (a.product_views + a.profile_views)
          )[0]
        : null

    return {
      growthPercent: growth,
      bestDay: best ?? null,
    }
  }, [analytics.last30Days])

  const insight = getSellerInsights({
    totalProductViews:   analytics.totalProductViews,
    totalIntentions:     analytics.totalIntentions,
    conversionRatio:     analytics.conversionRatio,
    growthPercent,
    totalWhatsappClicks: analytics.totalWhatsappClicks,
    totalReviews:        analytics.totalReviews,
  })

  const performance = getSellerPerformanceSummary({
    totalProductViews:   analytics.totalProductViews,
    totalProfileViews:   analytics.totalProfileViews,
    totalIntentions:     analytics.totalIntentions,
    conversionRatio:     analytics.conversionRatio,
    growthPercent,
    totalWhatsappClicks: analytics.totalWhatsappClicks,
    totalReviews:        analytics.totalReviews,
    avgRating:           analytics.avgRating,
    totalProducts:       catalogo.total,
    activeProducts:      catalogo.activos,
    inactiveProducts:    catalogo.inactivos,
    topProducts:         analytics.topProducts,
    topIntentedProducts: analytics.topIntentedProducts,
  })

  /* ───────────────────────────────
     🎯 PRIORITY INSIGHT
     Evaluates conditions in order.
     First match wins — only ONE
     issue surfaces at a time.
  ─────────────────────────────── */
  const priorityInsight = useMemo((): PriorityInsight => {
    const convPct = Number((analytics.conversionRatio * 100).toFixed(2))

    // 1. No traffic at all — nothing else matters yet
    if (analytics.totalProductViews === 0) {
      return {
        id:          "no-traffic",
        title:       "Tu tienda aún no tiene visitas",
        description: "Comparte el enlace de tu tienda para empezar a atraer clientes. Sin visitas, ninguna otra métrica puede mejorar.",
        cta:         { label: "Ir a mi tienda", href: "/seller/my-business" },
        severity:    "critical",
      }
    }

    // 2. Poor conversion — visits exist but nothing converts
    if (convPct < 5 && analytics.totalProductViews >= 10) {
      return {
        id:          "low-conversion",
        title:       "Tus visitas no se convierten en interés",
        description: `Solo el ${convPct}% de tus visitas genera interés real. Mejora las fotos, precios o descripciones para captar más atención.`,
        cta:         { label: "Mejorar productos", href: "/seller/products" },
        severity:    "high",
      }
    }

    // 3. No WhatsApp contact despite traffic
    if (analytics.totalWhatsappClicks === 0 && analytics.totalProductViews >= 20) {
      return {
        id:          "no-contact",
        title:       "Nadie te está contactando por WhatsApp",
        description: "Tienes visitas pero ningún cliente ha hecho click en tu WhatsApp. Verifica que tu número esté activo y visible.",
        cta:         { label: "Configurar tienda", href: "/seller/my-business" },
        severity:    "high",
      }
    }

    // 4. No reviews — trust signal missing
    if (analytics.totalReviews === 0 && analytics.totalProductViews >= 15) {
      return {
        id:          "no-reviews",
        title:       "Sin reseñas todavía",
        description: "Las reseñas generan confianza y aumentan la conversión. Pídele a tus clientes que dejen su opinión.",
        cta:         { label: "Ver mi tienda", href: "/seller/my-business" },
        severity:    "medium",
      }
    }

    // 5. Declining traffic
    if (growthPercent < -20) {
      return {
        id:          "traffic-decline",
        title:       "Tu tráfico está cayendo",
        description: `Tus visitas bajaron un ${Math.abs(growthPercent)}% respecto a la semana anterior. Comparte tu tienda o agrega productos nuevos para recuperar el ritmo.`,
        cta:         { label: "Agregar producto", href: "/seller/products/new" },
        severity:    "medium",
      }
    }

    // 6. All good
    return {
      id:          "healthy",
      title:       "Tu tienda está en buen camino",
      description: "No hay problemas críticos detectados. Sigue optimizando para seguir creciendo.",
      cta:         { label: "Ver métricas", href: "#" },
      severity:    "ok",
    }
  }, [
    analytics.totalProductViews,
    analytics.conversionRatio,
    analytics.totalWhatsappClicks,
    analytics.totalReviews,
    growthPercent,
  ])

  return (
    <main className="min-h-screen max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 bg-[#f8f5ef]">

      {/* ══════════════════════════════
          HERO — gradient + priority insight
      ══════════════════════════════ */}
      {!loading && (
        <section className="animate-scale-in relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 px-6 py-8 sm:px-10 sm:py-10 text-white">
          {/* subtle radial glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.08),transparent_60%)]" />

          <div className="relative space-y-5">
            {/* title */}
            <div className="space-y-1 animate-fade-up" style={{ animationDelay: "80ms" }}>
              <p className="text-xs font-medium tracking-widest uppercase text-emerald-200">
                Panel de tu tienda
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                {priorityInsight.severity === "ok"
                  ? "Tu tienda está en buen camino"
                  : priorityInsight.title}
              </h1>
              <p className="text-sm text-emerald-100 max-w-lg leading-relaxed">
                {priorityInsight.description}
              </p>
            </div>

            {/* metrics strip */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1 animate-fade-up" style={{ animationDelay: "160ms" }}>
              <MetricPill icon={<Eye className="w-3.5 h-3.5" />}    label="vistas"     value={analytics.totalProductViews} />
              <MetricPill icon={<MessageCircle className="w-3.5 h-3.5" />} label="contactos" value={analytics.totalWhatsappClicks} />
              <MetricPill icon={<Star className="w-3.5 h-3.5" />}   label="reseñas"    value={analytics.totalReviews} />
              <MetricPill icon={<TrendingUp className="w-3.5 h-3.5" />} label="conversión" value={`${Number((analytics.conversionRatio * 100).toFixed(1))}%`} />
              <MetricPill icon={<Package className="w-3.5 h-3.5" />} label="productos" value={catalogo.activos} />
            </div>

            {/* CTA */}
            {priorityInsight.severity !== "ok" && priorityInsight.cta.href !== "#" && (
              <div className="flex flex-wrap gap-3 pt-1 animate-fade-up" style={{ animationDelay: "240ms" }}>
                <Link href={priorityInsight.cta.href}>
                  <Button size="sm" className="bg-white text-emerald-800 hover:bg-emerald-50 font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150">
                    {priorityInsight.cta.label}
                  </Button>
                </Link>
                <Link href="/seller/products/new">
                  <Button size="sm" variant="ghost" className="text-white border border-white/30 hover:bg-white/10 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150">
                    Agregar producto
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── TAB SWITCHER ── */}
      <div className="overflow-x-auto">
      <div className="flex gap-1 p-1 bg-white/70 backdrop-blur-sm rounded-full w-fit min-w-max border border-neutral-100 shadow-sm animate-fade-in">
        {VIEWS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              view === id
                ? "bg-neutral-900 text-white shadow-sm scale-[1.02]"
                : "text-neutral-500 hover:text-neutral-700 hover:scale-[1.02]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      </div>

      {/* ══════════════════════════════
          VIEW: GENERAL
      ══════════════════════════════ */}
      {view === "general" && (
        <>
          {/* Performance Intelligence — keep existing smart components */}
          {!loading && (
            <section className="space-y-4">
              <SellerExecutiveSummaryCard summary={performance.executiveSummary} />
              <SellerNextActionsCard actions={performance.nextActions} />
              <div className="grid gap-4 sm:grid-cols-2">
                <SellerHealthScoreCard health={performance.healthScore} />
                <SellerKpiHighlights highlights={performance.kpiHighlights} />
              </div>
              <SellerAlertsPanel alerts={performance.alerts} />
            </section>
          )}

          {/* Smart Insight — borderless */}
          {!loading && <SellerInsightsCard insight={insight} />}

          {/* Auto Insights */}
          {!loading && <SellerAutoInsightsSection />}

          {/* Growth */}
          {!loading && <SellerGrowthSection />}

          {/* Weekly growth — flat, no card */}
          <section className="px-1 space-y-1 animate-fade-up">
            <div className="flex items-center gap-2 text-xs text-neutral-400 uppercase tracking-wide">
              <TrendingUp className="w-3.5 h-3.5" />
              Crecimiento semanal
            </div>
            <div className="flex items-baseline gap-3">
              <span className={`text-4xl font-bold animate-number-pop ${
                interpretMetric("growth", growthPercent).color === "red"   ? "text-red-500"
                : interpretMetric("growth", growthPercent).color === "amber" ? "text-amber-600"
                : "text-neutral-900"
              }`}>
                {growthPercent >= 0 ? "+" : ""}{growthPercent}%
              </span>
              <InterpBadge interp={interpretMetric("growth", growthPercent)} />
            </div>
            <p className="text-xs text-neutral-400">
              Vs. los 7 días anteriores{bestDay ? ` · Mejor día: ${formatChartDate(bestDay.date, "long")}` : ""}
            </p>
          </section>

          {/* Divider */}
          <hr className="border-neutral-200" />

          {/* Visibility — flat strip */}
          <section className="space-y-3 animate-fade-up" style={{ animationDelay: "50ms" }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Visibilidad
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              <FlatMetric label="Vistas de productos" value={analytics.totalProductViews} interp={interpretMetric("views", analytics.totalProductViews)} emptyText="Sin vistas aún" />
              <FlatMetric label="Visitas al perfil"   value={analytics.totalProfileViews}  interp={interpretMetric("views", analytics.totalProfileViews)}  emptyText="Sin visitas" />
              {topProduct && (
                <FlatMetric label={`Más visto · ${topProduct.nombre}`} value={topProduct.total_views} emptyText="Sin datos" />
              )}
            </div>
          </section>

          <hr className="border-neutral-200" />

          {/* Catalog — inline */}
          <section className="space-y-3 animate-fade-up" style={{ animationDelay: "100ms" }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Catálogo
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              <FlatMetric label="Total"     value={catalogo.total}    emptyText="—" />
              <FlatMetric label="Activos"   value={catalogo.activos}   emptyText="—" />
              <FlatMetric label="Inactivos" value={catalogo.inactivos} emptyText="—" />
            </div>
          </section>

          <hr className="border-neutral-200" />

          {/* 30-day chart — minimal wrapper */}
          <section className="space-y-3 animate-fade-up" style={{ animationDelay: "150ms" }}>
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Tendencia — 30 días
              </p>
              <p className="text-xs text-neutral-400">{totalTrend} vistas acumuladas</p>
            </div>
            <div className="rounded-xl bg-white/60 backdrop-blur-sm p-4 transition-shadow duration-300 hover:shadow-sm">
              {analytics.last30Days.length > 0 ? (
                <div className="h-[220px] md:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.last30Days} margin={{ top: 10, right: 15, left: -10, bottom: 25 }}>
                      <defs>
                        <linearGradient id="productGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={isMobile ? 5 : 0} axisLine={false} tickLine={false} tickFormatter={(value) => formatChartDate(value, isMobile ? "day" : "short")} />
                      <YAxis tick={{ fontSize: 11 }} width={35} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "13px" }} labelFormatter={(label) => formatChartDate(label, "long")} formatter={(value, name) => [`${value}`, String(name)]} />
                      <Area type="natural" dataKey="product_views" stroke="none" fill="url(#productGradient)" legendType="none" />
                      <Line type="natural" dataKey="product_views" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} name="Vistas productos" isAnimationActive={true} animationDuration={800} />
                      <Line type="natural" dataKey="profile_views" stroke="#6b7280" strokeWidth={1.5} opacity={0.5} dot={false} name="Visitas perfil" />
                      {!isMobile && <Legend wrapperStyle={{ fontSize: 12 }} />}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-neutral-400 text-center py-10">
                  Aún no hay datos suficientes para mostrar tendencia.
                </p>
              )}
            </div>
          </section>

          {/* Product Analytics */}
          {!loading && <SellerProductAnalyticsSection />}

          {/* Actions — prominent grouped buttons */}
          <section className="flex flex-wrap gap-3 pt-2 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <Link href="/seller/my-business">
              <Button size="lg" className="bg-neutral-900 hover:bg-neutral-800 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-150">
                Ir a mi tienda
              </Button>
            </Link>
            <Link href="/seller/products">
              <Button size="lg" variant="outline" className="hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 hover:shadow-sm">
                Gestionar productos
              </Button>
            </Link>
            <Link href="/seller/products/new">
              <Button size="lg" variant="outline" className="hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 hover:shadow-sm">
                Agregar producto
              </Button>
            </Link>
          </section>
        </>
      )}

      {/* ══════════════════════════════
          VIEW: VENTAS
      ══════════════════════════════ */}
      {view === "ventas" && (() => {
        const convPct  = Number((analytics.conversionRatio * 100).toFixed(2))
        const convInterp = interpretMetric("conversion", convPct)
        const hasViews = analytics.totalProductViews > 0

        const narrative =
          analytics.totalIntentions === 0 && !hasViews
            ? { text: "Aún no tienes visitas ni intenciones registradas. Comparte el enlace de tu tienda para empezar a atraer clientes.", cta: { label: "Ir a mi tienda", href: "/seller/my-business" } }
            : convPct < 5 && hasViews
            ? { text: "Tienes visitas, pero pocas se convierten en interés real. Considera mejorar las fotos y descripciones de tus productos.", cta: { label: "Mejorar productos", href: "/seller/products" } }
            : convPct >= 5 && analytics.totalIntentions > 0
            ? { text: `Tu catálogo genera interés real — ${analytics.totalIntentions} intención${analytics.totalIntentions !== 1 ? "es" : ""} registrada${analytics.totalIntentions !== 1 ? "s" : ""}. Mantén el catálogo actualizado para sostener ese ritmo.`, cta: { label: "Gestionar productos", href: "/seller/products" } }
            : { text: "Tus productos están siendo vistos. Este es un buen momento para optimizar conversión.", cta: { label: "Optimizar catálogo", href: "/seller/products" } }

        return (
          <section className="space-y-6 animate-fade-up">
            {/* Narrative header */}
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-neutral-900">Rendimiento de ventas</h2>
              <p className="text-sm text-muted-foreground">Mira cuántos clientes muestran interés en tus productos.</p>
            </div>

            {/* Interpretation card */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <p className="text-sm text-neutral-700 leading-relaxed">{narrative.text}</p>
              <Link href={narrative.cta.href}>
                <Button size="sm" className="hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 hover:shadow-sm">{narrative.cta.label}</Button>
              </Link>
            </div>

            {/* Metrics */}
            <Card className="bg-white border shadow-sm">
              <CardContent className="p-4 sm:p-8 space-y-6">
                <div className="grid gap-4 sm:gap-8 sm:grid-cols-3">
                  {/* Intentions */}
                  {(() => {
                    const interp = interpretMetric("intentions", analytics.totalIntentions)
                    return (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Intenciones comerciales</p>
                        {analytics.totalIntentions === 0 ? (
                          <p className="text-sm text-neutral-400 leading-snug pt-1">Sin interés registrado aún</p>
                        ) : (
                          <p className={`text-3xl font-bold animate-number-pop ${interp.color === "red" ? "text-red-500" : interp.color === "amber" ? "text-amber-600" : "text-neutral-900"}`}>
                            {analytics.totalIntentions}
                          </p>
                        )}
                        <InterpBadge interp={interp} />
                      </div>
                    )
                  })()}

                  {/* Conversion */}
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Ratio de conversión</p>
                    <p className={`text-3xl font-bold animate-number-pop ${convInterp.color === "red" ? "text-red-500" : convInterp.color === "amber" ? "text-amber-600" : "text-emerald-600"}`}>
                      {convPct}%
                    </p>
                    <InterpBadge interp={convInterp} />
                    {convInterp.message && <p className="text-xs text-neutral-400 leading-snug">{convInterp.message}</p>}
                  </div>

                  {/* Top product by intention */}
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Producto con más intención</p>
                    {analytics.topIntentedProducts[0] ? (
                      <>
                        <p className="text-lg font-semibold text-neutral-900 leading-snug">
                          {analytics.topIntentedProducts[0].nombre}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {analytics.topIntentedProducts[0].total_intentions} intención{analytics.topIntentedProducts[0].total_intentions !== 1 ? "es" : ""}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-neutral-400 leading-snug pt-1">Sin datos todavía</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {analytics.topIntentedProducts.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-neutral-800">Productos con mayor interés</h2>
                <Card className="bg-white border shadow-sm">
                  <CardContent className="p-6 space-y-4">
                    {analytics.topIntentedProducts.map((p) => (
                      <div key={p.id} className="flex justify-between items-center border-b pb-3 last:border-none last:pb-0">
                        <span className="text-sm text-neutral-700">{p.nombre}</span>
                        <span className="text-sm font-semibold text-neutral-900">
                          {p.total_intentions} intención{p.total_intentions !== 1 && "es"}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </section>
            )}
          </section>
        )
      })()}

      {/* ══════════════════════════════
          VIEW: CONTACTOS
      ══════════════════════════════ */}
      {view === "contactos" && (() => {
        const convPct    = Number((analytics.conversionRatio * 100).toFixed(2))
        const convInterp = interpretMetric("conversion", convPct)
        const hasViews   = analytics.totalProductViews > 0

        const narrative =
          analytics.totalWhatsappClicks === 0 && !hasViews
            ? { text: "Aún no tienes visitas ni clicks de WhatsApp. Asegúrate de que tu número esté activo y comparte tu tienda.", cta: { label: "Configurar tienda", href: "/seller/my-business" } }
            : analytics.totalWhatsappClicks === 0 && hasViews
            ? { text: "Tus productos se ven, pero pocas personas te escriben. Revisa que tu número de WhatsApp esté visible y activo.", cta: { label: "Revisar mi tienda", href: "/seller/my-business" } }
            : analytics.last30WhatsappClicks === 0 && analytics.totalWhatsappClicks > 0
            ? { text: "Recibiste contactos en el pasado, pero ninguno en los últimos 30 días. Considera publicar nuevos productos o actualizar precios.", cta: { label: "Gestionar productos", href: "/seller/products" } }
            : { text: `Estás recibiendo contactos activamente — ${analytics.last30WhatsappClicks} click${analytics.last30WhatsappClicks !== 1 ? "s" : ""} en los últimos 30 días. Responde rápido para cerrar más ventas.`, cta: { label: "Ver mi tienda", href: "/seller/my-business" } }

        return (
          <section className="space-y-6 animate-fade-up">
            {/* Narrative header */}
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-neutral-900">Interacción con clientes</h2>
              <p className="text-sm text-muted-foreground">Analiza cuántas personas te contactan por WhatsApp.</p>
            </div>

            {/* Interpretation card */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <p className="text-sm text-neutral-700 leading-relaxed">{narrative.text}</p>
              <Link href={narrative.cta.href}>
                <Button size="sm" className="hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 hover:shadow-sm">{narrative.cta.label}</Button>
              </Link>
            </div>

            {/* Metrics */}
            <div className="grid gap-6 sm:grid-cols-2">
              <Stat
                label="Clicks en WhatsApp (total)"
                value={analytics.totalWhatsappClicks}
                icon={<MessageCircle className="w-4 h-4 text-green-600" />}
                emptyText="Ningún click todavía — activa tu número"
              />
              <Stat
                label="Clicks en WhatsApp (30 días)"
                value={analytics.last30WhatsappClicks}
                icon={<MessageCircle className="w-4 h-4 text-green-400" />}
                emptyText="Sin clicks en los últimos 30 días"
              />
            </div>

            <Card className="bg-white border shadow-sm">
              <CardContent className="p-6 space-y-2">
                <p className="text-sm text-muted-foreground">Ratio de conversión (vistas → intención)</p>
                <p className={`text-3xl font-bold ${convInterp.color === "red" ? "text-red-500" : convInterp.color === "amber" ? "text-amber-600" : "text-emerald-600"}`}>
                  {convPct}%
                </p>
                <InterpBadge interp={convInterp} />
                {convInterp.message && <p className="text-xs text-neutral-400 leading-snug">{convInterp.message}</p>}
              </CardContent>
            </Card>
          </section>
        )
      })()}

      {/* ══════════════════════════════
          VIEW: REPUTACIÓN
      ══════════════════════════════ */}
      {view === "reputacion" && (() => {
        const rating = analytics.avgRating

        const narrative =
          analytics.totalReviews === 0
            ? { text: "Aún no tienes reseñas. Las reseñas generan confianza y ayudan a otros compradores a elegirte. Pídele a tus clientes que dejen su opinión.", cta: { label: "Ver mi tienda", href: "/seller/my-business" } }
            : rating !== null && rating >= 4.5
            ? { text: `Excelente reputación — ${analytics.totalReviews} reseña${analytics.totalReviews !== 1 ? "s" : ""} con un promedio de ${rating.toFixed(1)}/5.0. Sigue ofreciendo la misma experiencia para mantenerlo.`, cta: { label: "Ver reseñas", href: "/seller/my-business" } }
            : rating !== null && rating >= 3.5
            ? { text: `Tu calificación promedio es ${rating.toFixed(1)}/5.0 con ${analytics.totalReviews} reseña${analytics.totalReviews !== 1 ? "s" : ""}. Hay margen para mejorar — revisa los comentarios negativos y actúa sobre ellos.`, cta: { label: "Mejorar catálogo", href: "/seller/products" } }
            : { text: `Tu calificación promedio es baja (${rating?.toFixed(1) ?? "—"}/5.0). Revisa los comentarios de tus clientes y mejora la calidad del servicio o los productos.`, cta: { label: "Gestionar productos", href: "/seller/products" } }

        return (
          <section className="space-y-6 animate-fade-up">
            {/* Narrative header */}
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-neutral-900">Reputación de tu tienda</h2>
              <p className="text-sm text-muted-foreground">La confianza que generás en tus compradores.</p>
            </div>

            {/* Interpretation card */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <p className="text-sm text-neutral-700 leading-relaxed">{narrative.text}</p>
              <Link href={narrative.cta.href}>
                <Button size="sm" className="hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 hover:shadow-sm">{narrative.cta.label}</Button>
              </Link>
            </div>

            {/* Metrics */}
            <div className="grid gap-6 sm:grid-cols-2">
              <Stat
                label="Reseñas recibidas"
                value={reviewInsights.total_reviews}
                icon={<Star className="w-4 h-4 text-amber-500" />}
                emptyText="Aún sin reseñas — construye confianza"
              />
              <Stat
                label="Calificación promedio"
                value={reviewInsights.rating_avg ?? 0}
                subtitle={reviewInsights.rating_avg ? `${reviewInsights.rating_avg.toFixed(1)} / 5.0` : undefined}
                icon={<Star className="w-4 h-4 text-amber-400" />}
                emptyText="Sin calificaciones todavía"
              />
            </div>

            <Card className="bg-white border shadow-sm">
              <CardContent className="p-6 space-y-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-400">Últimos 30 días</p>
                    <p className="mt-1 text-2xl font-bold text-neutral-900">{reviewInsights.recent_reviews_count}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-400">Reseñas negativas</p>
                    <p className={`mt-1 text-2xl font-bold ${reviewInsights.low_rating_count > 0 ? "text-red-500" : "text-neutral-900"}`}>
                      {reviewInsights.low_rating_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-neutral-400">Alerta</p>
                    <p className="mt-1 text-sm text-neutral-600">
                      {reviewInsights.low_rating_count > 0
                        ? "Subieron reseñas negativas. Revisa feedback reciente."
                        : reviewInsights.total_reviews > 0
                        ? "Tu reputación se mantiene estable."
                        : "Aún estás construyendo tu reputación."}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-neutral-800">Distribución por estrellas</p>
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = reviewInsights.rating_distribution[String(star)] ?? 0
                      const pct = reviewInsights.total_reviews > 0
                        ? (count / reviewInsights.total_reviews) * 100
                        : 0
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="w-4 text-sm text-neutral-500">{star}</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                            <div className="h-2 rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-6 text-xs text-neutral-400">{count}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-neutral-800">Productos con más feedback</p>
                    {reviewInsights.top_products_by_reviews.length === 0 ? (
                      <p className="text-sm text-neutral-400">Todavía no hay productos con feedback.</p>
                    ) : (
                      reviewInsights.top_products_by_reviews.slice(0, 4).map((product) => (
                        <div key={product.product_id} className="rounded-xl bg-neutral-50 px-3 py-2">
                          <p className="text-sm font-medium text-neutral-900">{product.producto_nombre}</p>
                          <p className="text-xs text-neutral-500">
                            {product.review_count} reseñas · {product.rating_avg.toFixed(1)} / 5
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {reviewInsights.frequent_terms.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-neutral-800">Palabras frecuentes</p>
                    <div className="flex flex-wrap gap-2">
                      {reviewInsights.frequent_terms.slice(0, 8).map((term) => (
                        <span
                          key={term.term}
                          className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-600"
                        >
                          {term.term} · {term.count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )
      })()}

    </main>
  )
}

/* ===============================
  🎯 PRIORITY INSIGHT TYPE + COMPONENT
================================ */

type PriorityInsight = {
  id:          string
  title:       string
  description: string
  cta:         { label: string; href: string }
  severity:    "critical" | "high" | "medium" | "ok"
}

const SEVERITY_STYLES: Record<PriorityInsight["severity"], { border: string; icon: string; badge: string }> = {
  critical: { border: "border-2 border-red-300",    icon: "text-red-500",    badge: "bg-red-50 text-red-600 border border-red-100"    },
  high:     { border: "border-2 border-amber-300",  icon: "text-amber-500",  badge: "bg-amber-50 text-amber-700 border border-amber-100"  },
  medium:   { border: "border-2 border-blue-200",   icon: "text-blue-500",   badge: "bg-blue-50 text-blue-600 border border-blue-100"   },
  ok:       { border: "border border-emerald-200",  icon: "text-emerald-500", badge: "bg-emerald-50 text-emerald-700 border border-emerald-100" },
}

const SEVERITY_LABELS: Record<PriorityInsight["severity"], string> = {
  critical: "Acción urgente",
  high:     "Atención recomendada",
  medium:   "Oportunidad de mejora",
  ok:       "Todo en orden",
}

function PriorityInsightBanner({ insight }: { insight: PriorityInsight }) {
  const styles = SEVERITY_STYLES[insight.severity]

  return (
    <div className={`rounded-2xl bg-white shadow-md p-6 space-y-4 ${styles.border}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 flex-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${styles.badge}`}>
            {SEVERITY_LABELS[insight.severity]}
          </span>
          <h2 className="text-xl font-semibold text-neutral-900 pt-1">
            {insight.title}
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {insight.description}
          </p>
        </div>
      </div>

      {insight.severity !== "ok" && insight.cta.href !== "#" && (
        <Link href={insight.cta.href}>
          <Button size="sm" className="mt-1">
            {insight.cta.label}
          </Button>
        </Link>
      )}
    </div>
  )
}

/* ===============================
  🛠️ HELPERS
================================ */

type DateFormat = "day" | "short" | "long"

function formatChartDate(label: unknown, format: DateFormat = "short"): string {
  const raw = typeof label === "string" ? label : String(label ?? "")
  const date = new Date(raw)

  if (isNaN(date.getTime())) return raw

  if (format === "day") return String(date.getDate())

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    ...(format === "short" ? { month: "2-digit" } : { month: "long", year: "numeric" }),
  })
}

/* COMPONENTES */

/* ── Interpretation badge ── */
const BADGE_CLASSES: Record<"red" | "amber" | "green", string> = {
  red:   "bg-red-50 text-red-600 border border-red-100",
  amber: "bg-amber-50 text-amber-600 border border-amber-100",
  green: "bg-emerald-50 text-emerald-600 border border-emerald-100",
}

function InterpBadge({ interp }: { interp: MetricInterpretation }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${BADGE_CLASSES[interp.color]}`}>
      {interp.label}
    </span>
  )
}

function Stat({
  label,
  value,
  subtitle,
  icon,
  interpretation,
  emptyText,
}: {
  label: string
  value: number
  subtitle?: string
  icon?: React.ReactNode
  interpretation?: MetricInterpretation
  emptyText?: string
}) {
  const valueColor = interpretation
    ? interpretation.color === "red"   ? "text-red-500"
    : interpretation.color === "amber" ? "text-amber-600"
    : "text-neutral-900"
    : "text-neutral-900"

  return (
    <Card className="bg-white border shadow-sm hover:shadow-md transition">
      <CardContent className="p-5 space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{label}</span>
          {icon}
        </div>

        {value === 0 && emptyText ? (
          <p className="text-sm text-neutral-400 leading-snug">{emptyText}</p>
        ) : (
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        )}

        {interpretation && (
          <InterpBadge interp={interpretation} />
        )}

        {subtitle && (
          <p className="text-xs text-neutral-500 truncate">{subtitle}</p>
        )}

        {interpretation?.message && value > 0 && (
          <p className="text-xs text-neutral-400 leading-snug">{interpretation.message}</p>
        )}
      </CardContent>
    </Card>
  )
}

function Action({
  href,
  text,
}: {
  href: string
  text: string
}) {
  return (
    <Link href={href}>
      <Button variant="secondary" className="w-full justify-start">
        {text}
      </Button>
    </Link>
  )
}

