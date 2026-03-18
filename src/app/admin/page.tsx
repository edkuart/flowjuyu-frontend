"use client"

import { useEffect, useState, useCallback } from "react"
import { authFetch } from "@/lib/authFetch"
import {
  Users,
  Store,
  Package,
  Ticket,
  TrendingUp,
  RefreshCw,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  safeNumber,
  computeMarketplaceStatus,
  STATUS_BADGE,
} from "@/lib/adminHelpers"
import { AdminSmartKPICard }         from "@/components/admin/AdminSmartKPICard"
import { AdminAlerts }               from "@/components/admin/AdminAlerts"
import { AdminMarketplaceStatus }    from "@/components/admin/AdminMarketplaceStatus"
import { AdminQuickActions }         from "@/components/admin/AdminQuickActions"
import {
  AdminProductAttentionPanel,
  AdminSellerRiskPanel,
}                                    from "@/components/admin/AdminRiskPanels"
import { AdminActivityStream }       from "@/components/admin/AdminActivityStream"
import { AdminInsights }             from "@/components/admin/AdminInsights"

// ── API ────────────────────────────────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

// ── Types ──────────────────────────────────────────────────────────────────────

interface DashboardData {
  usuarios:  { total: number }
  sellers:   { pendientes: number }
  productos: { activos: number; inactivos: number }
  tickets: {
    abiertos:   number
    en_proceso: number
    cerrados:   number
  }
  ultimosProductos: {
    id:              string
    nombre:          string
    precio:          number
    activo:          boolean
    vendedor_nombre: string
    createdAt?:      string
  }[]
  ultimosSellers: {
    id:                number
    user_id:           number
    nombre_comercio:   string
    estado_validacion: string
    estado_admin:      string
    createdAt?:        string
  }[]
  ultimosTickets?: {
    id:        number
    asunto:    string
    estado:    string
    prioridad: string
    tipo:      string
    createdAt: string
  }[]
}

// ── Skeleton loader ────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-28 rounded-xl" />
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  )
}

// ── KPI trend helper ───────────────────────────────────────────────────────────

function kpiTrend(value: number, warnAt: number): "up" | "down" | "neutral" {
  if (value === 0)          return "up"
  if (value >= warnAt * 2)  return "down"
  if (value >= warnAt)      return "neutral"
  return "up"
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [data,        setData]        = useState<DashboardData | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(false)
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null)
  const [refreshing,  setRefreshing]  = useState(false)

  const fetchDashboard = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true)
    else          setLoading(true)
    setError(false)
    try {
      const res = await authFetch(`${API_URL}/api/admin/dashboard`)
      if (!res.ok) { setError(true); return }
      const json = await res.json()
      setData(json.data ?? json)
      setRefreshedAt(new Date())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  if (loading) {
    return (
      <div className="space-y-4 p-1">
        <p className="text-xs text-muted-foreground animate-pulse">Loading dashboard insights…</p>
        <DashboardSkeleton />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[40vh] text-center">
        <p className="text-sm text-muted-foreground">
          Could not load dashboard data. The API may be unavailable.
        </p>
        <button
          onClick={() => fetchDashboard()}
          className="text-xs px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  const { usuarios, sellers, productos, tickets, ultimosProductos, ultimosSellers, ultimosTickets } = data
  const inactiveProducts = ultimosProductos.filter((p: DashboardData["ultimosProductos"][number]) => !p.activo).length

  const status    = computeMarketplaceStatus({
    sellersPendientes: safeNumber(sellers.pendientes),
    ticketsAbiertos:   safeNumber(tickets.abiertos),
  })
  const statusCfg = STATUS_BADGE[status]

  return (
    <div className="space-y-10">

      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">Atlas Control Center</h1>
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
              {statusCfg.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Executive overview of marketplace health and operations.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Last refreshed</p>
            <p className="text-xs font-medium tabular-nums">
              {refreshedAt ? refreshedAt.toLocaleTimeString() : "—"}
            </p>
          </div>
          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border bg-card hover:bg-muted transition-colors disabled:opacity-50"
            title="Refresh dashboard"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── MARKETPLACE STATUS ───────────────────────────────────────────────── */}
      <AdminMarketplaceStatus
        sellersPendientes={sellers.pendientes}
        ticketsAbiertos={tickets.abiertos}
        ticketsCerrados={tickets.cerrados}
        productosActivos={productos.activos}
        productosInactivos={productos.inactivos}
      />

      {/* ── SMART KPI GRID ───────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">

        <AdminSmartKPICard
          title="Total Users"
          value={usuarios.total.toLocaleString()}
          icon={<Users size={16} />}
          description="Registered accounts"
          trend="up"
          delta="Growing"
          subtitle="Cumulative total"
          severity="default"
        />

        <AdminSmartKPICard
          title="Pending Sellers"
          value={sellers.pendientes}
          icon={<Store size={16} />}
          description="Awaiting KYC review"
          trend={sellers.pendientes > 0 ? "down" : "up"}
          delta={sellers.pendientes > 0 ? `${sellers.pendientes} need review` : "Queue clear"}
          subtitle={
            sellers.pendientes >= 3 ? "Immediate attention needed"
            : sellers.pendientes > 0 ? "Review soon"
            : "All sellers validated"
          }
          severity={sellers.pendientes >= 3 ? "red" : sellers.pendientes > 0 ? "yellow" : "green"}
          href="/admin/sellers?kyc=pendiente"
        />

        <AdminSmartKPICard
          title="Active Products"
          value={productos.activos.toLocaleString()}
          icon={<Package size={16} />}
          description={`${productos.inactivos} inactive`}
          trend={productos.inactivos > productos.activos ? "down" : "up"}
          delta={`${productos.activos + productos.inactivos} total`}
          subtitle={
            productos.inactivos > productos.activos
              ? "More inactive than active — review needed"
              : "Healthy product catalogue"
          }
          severity={productos.inactivos > productos.activos ? "yellow" : "green"}
          href="/admin/products"
        />

        <AdminSmartKPICard
          title="Open Tickets"
          value={tickets.abiertos}
          icon={<Ticket size={16} />}
          description="Awaiting response"
          trend={kpiTrend(tickets.abiertos, 3)}
          delta={tickets.abiertos > 0 ? `↑ needs attention` : "Inbox clear"}
          subtitle={
            tickets.abiertos >= 5 ? "High volume — escalate if needed"
            : tickets.abiertos > 0 ? "Review open cases"
            : "All tickets resolved"
          }
          severity={tickets.abiertos >= 5 ? "red" : tickets.abiertos > 0 ? "yellow" : "green"}
          href="/admin/tickets?estado=abierto"
        />

        <AdminSmartKPICard
          title="In Progress"
          value={tickets.en_proceso}
          icon={<TrendingUp size={16} />}
          description="Currently being handled"
          trend="neutral"
          delta={`${tickets.cerrados} resolved`}
          subtitle="Active ticket resolution"
          severity="default"
          href="/admin/tickets?estado=en_proceso"
        />

      </div>

      {/* ── ALERTS ───────────────────────────────────────────────────────────── */}
      <AdminAlerts
        sellersPendientes={sellers.pendientes}
        ticketsAbiertos={tickets.abiertos}
        ticketsEnProceso={tickets.en_proceso}
      />

      {/* ── INSIGHTS + ACTIVITY (2-col) ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <AdminInsights
          sellersPendientes={sellers.pendientes}
          ticketsAbiertos={tickets.abiertos}
          ticketsEnProceso={tickets.en_proceso}
          ticketsCerrados={tickets.cerrados}
          productosActivos={productos.activos}
          productosInactivos={productos.inactivos}
          totalUsers={usuarios.total}
          ultimosSellers={ultimosSellers ?? []}
          ultimosTickets={ultimosTickets ?? []}
        />

        <AdminActivityStream
          ultimosSellers={ultimosSellers ?? []}
          ultimosProductos={ultimosProductos ?? []}
          ultimosTickets={ultimosTickets ?? []}
        />

      </div>

      {/* ── QUICK ACTIONS ────────────────────────────────────────────────────── */}
      <AdminQuickActions
        sellersPendientes={sellers.pendientes}
        ticketsAbiertos={tickets.abiertos}
        productosInactivos={inactiveProducts}
      />

      {/* ── RISK PANELS ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminProductAttentionPanel products={ultimosProductos ?? []} />
        <AdminSellerRiskPanel       sellers={ultimosSellers    ?? []} />
      </div>

    </div>
  )
}
