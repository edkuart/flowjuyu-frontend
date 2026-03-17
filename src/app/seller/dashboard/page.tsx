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

import { fetchSellerDashboard } from "@/services/sellerDashboard"
import { fetchSellerAnalytics } from "@/services/sellerAnalytics"

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

  const conversionColor =
    conversionPercent < 3
      ? "text-red-600"
      : conversionPercent < 7
      ? "text-amber-600"
      : "text-emerald-600"

  const conversionLabel =
    conversionPercent < 3
      ? "Necesita optimización"
      : conversionPercent < 7
      ? "Rendimiento aceptable"
      : "Excelente conversión"

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

  const { growthPercent, growthStatus, bestDay } = useMemo(() => {
    if (!analytics.last30Days?.length) {
      return {
        growthPercent: 0,
        growthStatus: "neutral",
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

    let growthStatus: "up" | "down" | "neutral" = "neutral"

    if (growth > 5) growthStatus = "up"
    else if (growth < -5) growthStatus = "down"

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
      growthStatus,
      bestDay: best ?? null,
    }
  }, [analytics.last30Days])

  return (
    <main className="min-h-screen px-6 py-12 space-y-14 max-w-6xl mx-auto bg-[#f8f5ef]">

      {/* HEADER */}
      <section className="space-y-2">
        <h1 className="text-3xl font-bold text-neutral-900">
          Métricas de tu tienda
        </h1>
        <p className="text-neutral-600">
          Analiza la visibilidad y crecimiento de tu negocio.
        </p>
      </section>

      {/* CRECIMIENTO SEMANAL */}
      <Card className="bg-white border shadow-sm">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            Crecimiento semanal
          </div>

          <p className="text-3xl font-bold text-neutral-900">
            {growthPercent >= 0 ? "+" : ""}
            {growthPercent}%
          </p>

          <p className="text-sm text-neutral-500">
            Comparado con los 7 días anteriores.
          </p>

          {bestDay && (
            <p className="text-sm text-neutral-600">
              🔥 Mejor día: {bestDay.date}
            </p>
          )}
        </CardContent>
      </Card>

      {/* VISIBILIDAD GENERAL */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-800">
          Visibilidad general
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Stat
            label="Vistas de productos"
            value={analytics.totalProductViews}
            icon={<Eye className="w-4 h-4" />}
          />

          <Stat
            label="Visitas a tu perfil"
            value={analytics.totalProfileViews}
            icon={<Store className="w-4 h-4" />}
          />

          <Stat
            label="Producto más visto"
            value={topProduct?.total_views ?? 0}
            subtitle={topProduct?.nombre ?? "—"}
            icon={<Star className="w-4 h-4" />}
          />
        </div>
      </section>

      {/* ===============================
        📲 PHASE 2 — WA CLICKS + REVIEWS
      =============================== */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-800">
          WhatsApp y reseñas
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Clicks en WhatsApp (total)"
            value={analytics.totalWhatsappClicks}
            icon={<MessageCircle className="w-4 h-4 text-green-600" />}
          />
          <Stat
            label="Clicks en WhatsApp (30 días)"
            value={analytics.last30WhatsappClicks}
            icon={<MessageCircle className="w-4 h-4 text-green-400" />}
          />
          <Stat
            label="Reseñas recibidas"
            value={analytics.totalReviews}
            icon={<Star className="w-4 h-4 text-amber-500" />}
          />
          <Stat
            label="Calificación promedio"
            value={analytics.avgRating ?? 0}
            subtitle={analytics.avgRating ? `${analytics.avgRating.toFixed(1)} / 5.0` : "Sin reseñas aún"}
            icon={<Star className="w-4 h-4 text-amber-400" />}
          />
        </div>
      </section>

      {/* ===============================
        💬 INTERACCIÓN COMERCIAL
      =============================== */}
      <section className="space-y-6">

        <Card className="bg-white border shadow-sm">
          <CardContent className="p-8 space-y-6">

            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-neutral-900">
                Interacción comercial
              </h2>

              <span className="text-xs text-neutral-500">
                Últimos datos disponibles
              </span>
            </div>

            {/* GRID PRINCIPAL */}
            <div className="grid gap-8 sm:grid-cols-3">

              {/* INTENCIONES */}
              <div>
                <p className="text-sm text-muted-foreground">
                  Intenciones comerciales
                </p>
                <p className="text-3xl font-bold text-neutral-900">
                  {analytics.totalIntentions}
                </p>
              </div>

              {/* CONVERSIÓN */}
              {(() => {
                const conversionPercent = Number(
                  (analytics.conversionRatio * 100).toFixed(2)
                )

                const conversionColor =
                  conversionPercent < 3
                    ? "text-red-600"
                    : conversionPercent < 7
                    ? "text-amber-600"
                    : "text-emerald-600"

                return (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Ratio de conversión
                    </p>
                    <p className={`text-3xl font-bold ${conversionColor}`}>
                      {conversionPercent}%
                    </p>

                    <p className="text-xs mt-1 text-neutral-500">
                      {conversionPercent < 3 && "Necesita optimización"}
                      {conversionPercent >= 3 &&
                        conversionPercent < 7 &&
                        "Buen rendimiento"}
                      {conversionPercent >= 7 &&
                        "Excelente conversión"}
                    </p>
                  </div>
                )
              })()}

              {/* TOP PRODUCTO */}
              <div>
                <p className="text-sm text-muted-foreground">
                  Producto con más intención
                </p>
                <p className="text-lg font-semibold text-neutral-900">
                  {analytics.topIntentedProducts[0]?.nombre ?? "—"}
                </p>
                <p className="text-sm text-neutral-500">
                  {analytics.topIntentedProducts[0]?.total_intentions ?? 0} intención
                </p>
              </div>

            </div>

          </CardContent>
        </Card>

      </section>

      {/* ===============================
        🏆 TOP PRODUCTOS CON INTENCIÓN
      =============================== */}
      {analytics.topIntentedProducts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-800">
            Productos con mayor interés
          </h2>

          <Card className="bg-white border shadow-sm">
            <CardContent className="p-6 space-y-4">

              {analytics.topIntentedProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center border-b pb-3 last:border-none last:pb-0"
                >
                  <span className="text-sm text-neutral-700">
                    {p.nombre}
                  </span>

                  <span className="text-sm font-semibold text-neutral-900">
                    {p.total_intentions} intención{p.total_intentions !== 1 && "es"}
                  </span>
                </div>
              ))}

            </CardContent>
          </Card>
        </section>
      )}

      {/* TENDENCIA 30 DÍAS */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-800">
          Tendencia últimos 30 días
        </h2>

        <Card className="bg-white border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-neutral-600">
              Total acumulado: {totalTrend} vistas
            </p>

            {analytics.last30Days.length > 0 ? (
              <div className="h-[240px] md:h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analytics.last30Days}
                    margin={{
                      top: 10,
                      right: 15,
                      left: -10,
                      bottom: 25,
                    }}
                  >
                    {/* 🔥 Gradiente premium */}
                    <defs>
                      <linearGradient id="productGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      interval={isMobile ? 5 : 0}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value: string) => {
                        const date = new Date(value)
                        return isMobile
                          ? String(date.getDate())
                          : date.toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "2-digit",
                            })
                      }}
                    />

                    <YAxis
                      tick={{ fontSize: 11 }}
                      width={35}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        fontSize: "13px",
                      }}
                      labelFormatter={(value: string) => {
                        const date = new Date(value)
                        return date.toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === "Vistas productos") {
                          return [`${value}`, "Vistas productos"]
                        }
                        if (name === "Visitas perfil") {
                          return [`${value}`, "Visitas perfil"]
                        }
                        return [value, name]
                      }}
                    />

                    {/* 🔥 Área suave bajo línea principal */}
                    <Area
                      type="natural"
                      dataKey="product_views"
                      stroke="none"
                      fill="url(#productGradient)"
                      legendType="none"
                    />

                    {/* 🔥 Línea principal */}
                    <Line
                      type="natural"
                      dataKey="product_views"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6 }}
                      name="Vistas productos"
                      isAnimationActive={true}
                      animationDuration={800}
                    />

                    {/* 🔥 Línea secundaria sutil */}
                    <Line
                      type="natural"
                      dataKey="profile_views"
                      stroke="#111827"
                      strokeWidth={1.5}
                      opacity={0.6}
                      dot={false}
                      name="Visitas perfil"
                    />

                    {!isMobile && (
                      <Legend
                        wrapperStyle={{
                          fontSize: 12,
                        }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-sm text-neutral-500 text-center py-10">
                Aún no hay datos suficientes para mostrar tendencia.
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* CATÁLOGO */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-neutral-800">
          Estado del catálogo
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Total productos" value={catalogo.total} icon={<Package className="w-4 h-4" />} />
          <Stat label="Activos" value={catalogo.activos} />
          <Stat label="Inactivos" value={catalogo.inactivos} />
        </div>
      </section>

      {/* ACCIONES */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Action href="/seller/my-business" text="Ir a Mi tienda" />
        <Action href="/seller/products" text="Gestionar productos" />
        <Action href="/seller/products/new" text="Agregar producto" />
      </section>

    </main>
  )
}

/* COMPONENTES */

function Stat({
  label,
  value,
  subtitle,
  icon,
}: {
  label: string
  value: number
  subtitle?: string
  icon?: React.ReactNode
}) {
  return (
    <Card className="bg-white border shadow-sm hover:shadow-md transition">
      <CardContent className="p-5 space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{label}</span>
          {icon}
        </div>

        <p className="text-2xl font-bold text-neutral-900">
          {value}
        </p>

        {subtitle && (
          <p className="text-xs text-neutral-500 truncate">
            {subtitle}
          </p>
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
