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
} from "lucide-react"

import {
  LineChart,
  Line,
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
  topProducts: {
    id: string
    nombre: string
    total_views: number
  }[]
  last30Days: {
    date: string
    product_views: number
    profile_views: number
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
    topProducts: [],
    last30Days: [],
  })

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
          topProducts: analyticsData.topProducts ?? [],
          last30Days: analyticsData.last30Days ?? [],
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
     📊 MÉTRICAS DERIVADAS
  =============================== */

  const topProduct = analytics.topProducts[0]

  const totalTrend = useMemo(() => {
    return analytics.last30Days.reduce(
      (acc, d) => acc + d.product_views + d.profile_views,
      0
    )
  }, [analytics.last30Days])

  // Crecimiento semanal inteligente
  const { growth, bestDay } = useMemo(() => {
    const last7 = analytics.last30Days.slice(-7)
    const prev7 = analytics.last30Days.slice(-14, -7)

    const totalLast7 = last7.reduce(
      (acc, d) => acc + d.product_views + d.profile_views,
      0
    )

    const totalPrev7 = prev7.reduce(
      (acc, d) => acc + d.product_views + d.profile_views,
      0
    )

    const growth =
      totalPrev7 > 0
        ? Math.round(((totalLast7 - totalPrev7) / totalPrev7) * 100)
        : totalLast7 > 0
        ? 100
        : 0

    const best = [...last7].sort(
      (a, b) =>
        b.product_views + b.profile_views -
        (a.product_views + a.profile_views)
    )[0]

    return { growth, bestDay: best }
  }, [analytics.last30Days])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f8f5ef]">
        <p className="text-muted-foreground">Cargando métricas…</p>
      </main>
    )
  }

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
            {growth >= 0 ? "+" : ""}
            {growth}%
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
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.last30Days}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="product_views"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={false}
                      name="Vistas productos"
                    />

                    <Line
                      type="monotone"
                      dataKey="profile_views"
                      stroke="#111827"
                      strokeWidth={2}
                      dot={false}
                      name="Visitas perfil"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-sm text-neutral-500 text-center">
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
