// src/app/seller/dashboard/page.tsx

"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import {
  Eye,
  Star,
  Package,
  TrendingUp,
  MessageCircle,
  ArrowRight,
  BarChart3,
  ShieldCheck,
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

import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"

import { fetchSellerDashboard } from "@/services/sellerDashboard"
import { fetchSellerAnalytics } from "@/services/sellerAnalytics"
import { getSellerInsights } from "@/lib/sellerInsights"
import { SellerInsightsCard } from "@/components/seller/SellerInsightsCard"
import { interpretMetric, type MetricInterpretation } from "@/lib/metricInterpreter"
import { getSellerPerformanceSummary, type NextAction } from "@/lib/sellerPerformance"
import { SellerExecutiveSummaryCard } from "@/components/seller/SellerExecutiveSummaryCard"
import { SellerHealthScoreCard } from "@/components/seller/SellerHealthScoreCard"
import { SellerKpiHighlights } from "@/components/seller/SellerKpiHighlights"
import { SellerAlertsPanel } from "@/components/seller/SellerAlertsPanel"
import { SellerProductAnalyticsSection } from "@/components/seller/SellerProductAnalyticsSection"
import { SellerAutoInsightsSection } from "@/components/seller/SellerAutoInsightsSection"
import { SellerGrowthSection } from "@/components/seller/SellerGrowthSection"
import { BaseCard } from "@/components/ui/BaseCard"
import { BaseSection } from "@/components/ui/BaseSection"
import { BaseSectionHeading } from "@/components/ui/BaseSectionHeading"
import { BaseExpandableCard } from "@/components/ui/BaseExpandableCard"

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

export default function SellerDashboardPage() {
  const [loading, setLoading] = useState(true)

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
  const [analyticsExpanded, setAnalyticsExpanded] = useState(false)
  const [growthExpanded, setGrowthExpanded] = useState(false)
  const [autoInsightsExpanded, setAutoInsightsExpanded] = useState(false)

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

  const reviewAverage = analytics.avgRating ?? reviewInsights.rating_avg ?? 0
  const reviewValue = analytics.totalReviews > 0 && reviewAverage > 0
    ? reviewAverage.toFixed(1)
    : analytics.totalReviews

  const stats = [
    {
      title: "Vistas de productos",
      value: analytics.totalProductViews,
      context: analytics.totalProductViews === 0
        ? "Todavía no hay visitas. Comparte tu tienda para empezar a atraer tráfico."
        : `${analytics.totalProfileViews} visitas al perfil registradas.`,
      icon: <Eye className="h-5 w-5 text-emerald-700" />,
      interpretation: interpretMetric("views", analytics.totalProductViews),
    },
    {
      title: "Productos activos",
      value: catalogo.activos,
      context: catalogo.total === 0
        ? "Aún no tienes catálogo publicado."
        : `${catalogo.total} productos en total${catalogo.inactivos > 0 ? ` · ${catalogo.inactivos} inactivos` : ""}.`,
      icon: <Package className="h-5 w-5 text-sky-700" />,
      interpretation: undefined,
    },
    {
      title: "Clicks en WhatsApp",
      value: analytics.totalWhatsappClicks,
      context: analytics.totalWhatsappClicks === 0
        ? "Todavía no hay contactos directos desde tu tienda."
        : `${analytics.last30WhatsappClicks} clicks en los últimos 30 días.`,
      icon: <MessageCircle className="h-5 w-5 text-green-700" />,
      interpretation: undefined,
    },
    {
      title: "Conversión / confianza",
      value: analytics.totalReviews > 0 ? reviewValue : `${conversionPercent}%`,
      context: analytics.totalReviews > 0
        ? `${analytics.totalReviews} reseña${analytics.totalReviews !== 1 ? "s" : ""} publicadas.`
        : conversionPercent === 0
        ? "Aún no hay conversión registrada."
        : "Porcentaje de visitas que se transforman en interés.",
      icon: analytics.totalReviews > 0
        ? <Star className="h-5 w-5 text-amber-600" />
        : <TrendingUp className="h-5 w-5 text-amber-700" />,
      interpretation: analytics.totalReviews > 0
        ? undefined
        : interpretMetric("conversion", conversionPercent),
    },
  ]

  const actions = performance.nextActions.length > 0
    ? performance.nextActions
    : [{
        label: "Agrega nuevos productos para crecer",
        href: "/seller/products/new",
        priority: "low",
        impact: "medium",
        effort: "low",
      } satisfies NextAction]

  return (
    <main className="min-h-screen max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 bg-[#f8f5ef]">

      {loading ? (
        <div className="space-y-5">
          <div className="h-36 rounded-3xl bg-white/70 animate-pulse" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-white/70 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-white/70 animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <BaseSection>
            <BaseSectionHeading
              eyebrow="Vista general"
              title="Tu dashboard de seller"
              description="Una lectura rápida de tus métricas, prioridades y oportunidades de crecimiento."
            />
            <PriorityInsightBanner insight={priorityInsight} />
          </BaseSection>

          <BaseSection>
            <BaseSectionHeading
              eyebrow="Stats Grid"
              title="Métricas clave"
              description="Las cuatro señales que te ayudan a entender tu tienda en menos de tres segundos."
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              {stats.map((stat) => (
                <DashboardStatCard
                  key={stat.title}
                  title={stat.title}
                  value={stat.value}
                  context={stat.context}
                  icon={stat.icon}
                  interpretation={stat.interpretation}
                />
              ))}
            </div>
          </BaseSection>

          <BaseSection>
            <BaseSectionHeading
              eyebrow="Next Actions"
              title="Próximos pasos"
              description="Una acción por card para que el dashboard sea fácil de escanear y actuar desde mobile."
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {actions.map((action) => (
                <DashboardActionCard key={`${action.href}-${action.label}`} action={action} />
              ))}
            </div>
          </BaseSection>

          <BaseSection>
            <BaseSectionHeading
              eyebrow="Secondary Insights"
              title="Insights secundarios"
              description="Contexto ampliado, salud general y tendencias para seguir optimizando tu tienda."
            />

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="space-y-5">
                <InsightsSubsection
                  eyebrow="Resumen"
                  title="Señales principales"
                  description="Una vista más tranquila del estado general de tu tienda, reputación y alertas."
                />
                <SellerExecutiveSummaryCard summary={performance.executiveSummary} />
                <SellerInsightsCard insight={insight} />
                <SellerAlertsPanel alerts={performance.alerts} />
              </div>

              <div className="space-y-5">
                <InsightsSubsection
                  eyebrow="Rendimiento"
                  title="Lectura operativa"
                  description="Salud, tendencia y reputación para entender el comportamiento reciente sin saturarte."
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SellerHealthScoreCard health={performance.healthScore} />
                  <SellerKpiHighlights highlights={performance.kpiHighlights} />
                </div>
                <TrendChartCard
                  totalTrend={totalTrend}
                  growthPercent={growthPercent}
                  bestDay={bestDay?.date ?? null}
                  data={analytics.last30Days}
                  isMobile={isMobile}
                />
                <ReviewSnapshotCard reviewInsights={reviewInsights} totalReviews={analytics.totalReviews} />

                <InsightsSubsection
                  eyebrow="Análisis"
                  title="Explorar más detalles"
                  description="Expande solo lo que necesites revisar para mantener la lectura ligera en mobile."
                />
                <BaseExpandableCard
                  title="Productos con más interés"
                  summary="Revisa qué productos concentran vistas, intención y oportunidad comercial."
                  expanded={analyticsExpanded}
                  onToggle={() => setAnalyticsExpanded((prev) => !prev)}
                >
                  <SellerProductAnalyticsSection />
                </BaseExpandableCard>
                <BaseExpandableCard
                  title="Crecimiento y momentum"
                  summary="Abre esta vista si quieres profundizar en señales de tracción y evolución reciente."
                  expanded={growthExpanded}
                  onToggle={() => setGrowthExpanded((prev) => !prev)}
                >
                  <SellerGrowthSection />
                </BaseExpandableCard>
                <BaseExpandableCard
                  title="Insights automáticos"
                  summary="Muestra recomendaciones y lecturas generadas automáticamente a partir de tu actividad."
                  expanded={autoInsightsExpanded}
                  onToggle={() => setAutoInsightsExpanded((prev) => !prev)}
                >
                  <SellerAutoInsightsSection />
                </BaseExpandableCard>
              </div>
            </div>
          </BaseSection>
        </>
      )}

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
    <BaseCard
      hover
      className={styles.border}
      contentClassName="space-y-3"
    >
      <div className="space-y-3">
        <span className={`inline-flex items-center self-start px-2.5 py-1 rounded-full text-[11px] font-semibold ${styles.badge}`}>
          {SEVERITY_LABELS[insight.severity]}
        </span>
        <div className="min-w-0 space-y-2">
          <h2 className="text-lg font-semibold leading-snug text-neutral-900 sm:text-xl">
            {insight.title}
          </h2>
          <p className="text-sm leading-relaxed text-neutral-600">
            {insight.description}
          </p>
        </div>
      </div>

      {insight.cta.href !== "#" && (
        <Link href={insight.cta.href} className="inline-flex">
          <Button size="sm" className="min-h-10 px-4">
            {insight.cta.label}
          </Button>
        </Link>
      )}
    </BaseCard>
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

function InsightsSubsection({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <BaseCard tone="subtle">
      <BaseSectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        titleClassName="text-base sm:text-base"
        descriptionClassName="max-w-none"
      />
    </BaseCard>
  )
}

function DashboardStatCard({
  title,
  value,
  context,
  icon,
  interpretation,
}: {
  title: string
  value: number | string
  context: string
  icon: React.ReactNode
  interpretation?: MetricInterpretation
}) {
  const valueColor = interpretation
    ? interpretation.color === "red"   ? "text-red-500"
    : interpretation.color === "amber" ? "text-amber-600"
    : "text-emerald-700"
    : "text-neutral-900"

  return (
    <BaseCard
      hover
      className="h-full hover:-translate-y-0.5"
      contentClassName="flex h-full flex-col gap-4"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-50 md:h-11 md:w-11">
        {icon}
      </div>
      <div className="min-w-0 space-y-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
          {title}
        </p>
        <p className={`text-3xl font-bold leading-none sm:text-[2rem] ${valueColor}`}>
          {value}
        </p>
      </div>
      {interpretation && <InterpBadge interp={interpretation} />}
      <p className="min-w-0 text-sm leading-relaxed text-neutral-600 line-clamp-3">
        {context}
      </p>
    </BaseCard>
  )
}

function actionDescription(action: NextAction): string {
  const priority =
    action.priority === "high" ? "Alta prioridad" :
    action.priority === "medium" ? "Prioridad media" :
    "Baja prioridad"

  const impact =
    action.impact === "high" ? "alto impacto" :
    action.impact === "medium" ? "impacto medio" :
    "impacto gradual"

  const effort =
    action.effort === "low" ? "esfuerzo bajo" :
    action.effort === "medium" ? "esfuerzo moderado" :
    "más trabajo"

  return `${priority}. Acción de ${impact} con ${effort}.`
}

function DashboardActionCard({ action }: { action: NextAction }) {
  const badgeClass =
    action.priority === "high" ? "bg-red-50 text-red-600 border-red-100" :
    action.priority === "medium" ? "bg-amber-50 text-amber-700 border-amber-100" :
    "bg-neutral-50 text-neutral-600 border-neutral-200"

  return (
    <BaseCard
      hover
      className="h-full hover:-translate-y-0.5"
      contentClassName="flex h-full flex-col gap-4"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0F3D3A]/6 md:h-11 md:w-11">
        <ArrowRight className="h-4 w-4 text-[#0F3D3A] md:h-5 md:w-5" />
      </div>
      <div className="min-w-0 space-y-2.5">
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badgeClass}`}>
          {action.priority === "high" ? "Alta prioridad" : action.priority === "medium" ? "Siguiente paso" : "Acción recomendada"}
        </span>
        <h3 className="text-base font-semibold text-neutral-900 leading-snug line-clamp-2">
          {action.label}
        </h3>
        <p className="text-sm leading-relaxed text-neutral-600">
          {actionDescription(action)}
        </p>
      </div>
      <div className="pt-1">
        <Link href={action.href} className="inline-flex">
          <Button variant="outline" className="min-h-10 px-4">
            Ir ahora
          </Button>
        </Link>
      </div>
    </BaseCard>
  )
}

function TrendChartCard({
  totalTrend,
  growthPercent,
  bestDay,
  data,
  isMobile,
}: {
  totalTrend: number
  growthPercent: number
  bestDay: string | null
  data: Analytics["last30Days"]
  isMobile: boolean
}) {
  return (
    <BaseCard hover contentClassName="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
              Tendencia 30 días
            </p>
            <h3 className="text-lg font-semibold text-neutral-900 leading-snug">
              Evolución de visibilidad
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {bestDay
                ? `Mejor día: ${formatChartDate(bestDay, "long")}.`
                : "Todavía no hay un pico claro en el periodo."}
            </p>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl bg-neutral-50 px-4 py-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
              Acumulado
            </span>
            <span className="text-2xl font-bold text-neutral-900">{totalTrend}</span>
            <InterpBadge interp={interpretMetric("growth", growthPercent)} />
          </div>
        </div>

        {data.length > 0 ? (
          <div className="h-[260px] sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 12, left: -16, bottom: 18 }}>
                <defs>
                  <linearGradient id="productGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  interval={isMobile ? 5 : 0}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => formatChartDate(value, isMobile ? "day" : "short")}
                />
                <YAxis tick={{ fontSize: 11 }} width={35} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "13px" }}
                  labelFormatter={(label) => formatChartDate(label, "long")}
                  formatter={(value, name) => [`${value}`, String(name)]}
                />
                <Area type="natural" dataKey="product_views" stroke="none" fill="url(#productGradient)" legendType="none" />
                <Line type="natural" dataKey="product_views" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} name="Vistas productos" animationDuration={800} />
                <Line type="natural" dataKey="profile_views" stroke="#6b7280" strokeWidth={1.5} opacity={0.5} dot={false} name="Visitas perfil" />
                {!isMobile && <Legend wrapperStyle={{ fontSize: 12 }} />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="rounded-2xl bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-400">
            Aún no hay datos suficientes para mostrar tendencia.
          </p>
        )}
    </BaseCard>
  )
}

function ReviewSnapshotCard({
  reviewInsights,
  totalReviews,
}: {
  reviewInsights: ReviewInsights
  totalReviews: number
}) {
  return (
    <BaseCard hover contentClassName="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
              Reputación
            </p>
            <h3 className="text-lg font-semibold text-neutral-900 leading-snug">
              Snapshot de confianza
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              {totalReviews === 0
                ? "Aún no tienes reseñas. Cuando empiecen a llegar, esta card te ayudará a detectar señales de confianza y riesgo."
                : `${reviewInsights.recent_reviews_count} reseñas en los últimos 30 días.`}
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3">
            <Star className="h-5 w-5 text-amber-500" />
            <div className="min-w-0">
              <p className="text-2xl font-bold text-neutral-900">
                {reviewInsights.rating_avg ? reviewInsights.rating_avg.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-neutral-500">
                {totalReviews} reseña{totalReviews !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InfoTile
            icon={<Star className="h-4 w-4 text-amber-500" />}
            label="Calificación promedio"
            value={reviewInsights.rating_avg ? `${reviewInsights.rating_avg.toFixed(1)} / 5` : "Sin datos"}
            detail="Se actualiza a partir del feedback real de tus clientes."
          />
          <InfoTile
            icon={<ShieldCheck className="h-4 w-4 text-emerald-600" />}
            label="Feedback reciente"
            value={`${reviewInsights.recent_reviews_count}`}
            detail="Reseñas publicadas durante los últimos 30 días."
          />
          <InfoTile
            icon={<BarChart3 className="h-4 w-4 text-red-500" />}
            label="Reseñas negativas"
            value={`${reviewInsights.low_rating_count}`}
            detail={reviewInsights.low_rating_count > 0 ? "Hay señales que vale la pena revisar pronto." : "No se detectan alertas recientes."}
          />
        </div>

        {reviewInsights.top_products_by_reviews.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-neutral-800">Productos con más feedback</p>
            <div className="space-y-2">
              {reviewInsights.top_products_by_reviews.slice(0, 3).map((product) => (
                <div key={product.product_id} className="rounded-2xl bg-neutral-50 px-4 py-3">
                  <p className="text-sm font-medium text-neutral-900 leading-snug line-clamp-2">
                    {product.producto_nombre}
                  </p>
                  <p className="mt-1 text-xs text-neutral-600">
                    {product.review_count} reseñas · {product.rating_avg.toFixed(1)} / 5
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
    </BaseCard>
  )
}

function InfoTile({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-2xl bg-neutral-50 px-4 py-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white">
        {icon}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-neutral-900 leading-snug">
        {value}
      </p>
      <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
        {detail}
      </p>
    </div>
  )
}

