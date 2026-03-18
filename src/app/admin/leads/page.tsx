"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { authFetch } from "@/lib/authFetch"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

// ── Types ──────────────────────────────────────────────────────────────────────

interface WebTicket {
  id: number
  asunto: string
  mensaje?: string
  estado: string
  prioridad: string
  asignado_a: number | null
  user_id: number
  createdAt: string
}

interface PurchaseIntention {
  id: string
  product_id: string | null
  seller_id: number
  user_id: number | null
  source: string
  created_at: string
}

interface SellerLead {
  id: number
  user_id: number
  nombre_comercio: string
  estado_validacion: string
  estado_admin: string
  createdAt: string
}

interface LeadsData {
  tickets:    WebTicket[]
  intentions: PurchaseIntention[]
  sellers:    SellerLead[]
}

// ── Unified lead ───────────────────────────────────────────────────────────────

type LeadStatus = "cold" | "warm" | "hot"
type LeadSource = "intention" | "web_contact" | "seller"

interface UnifiedLead {
  id:            string
  name:          string
  source:        LeadSource
  status:        LeadStatus
  date:          string
  extra?:        string
  needsFollowUp: boolean
  raw:           WebTicket | PurchaseIntention | SellerLead
}

// ── Style config ───────────────────────────────────────────────────────────────

const STATUS_CFG: Record<LeadStatus, { label: string; badge: string; dot: string; bar: string }> = {
  cold: {
    label: "Frío",
    badge: "bg-gray-100 text-gray-600 border-0",
    dot:   "bg-gray-400",
    bar:   "bg-gray-400",
  },
  warm: {
    label: "Cálido",
    badge: "bg-yellow-100 text-yellow-700 border-0",
    dot:   "bg-yellow-500",
    bar:   "bg-yellow-400",
  },
  hot: {
    label: "Caliente",
    badge: "bg-green-100 text-green-700 border-0",
    dot:   "bg-green-500",
    bar:   "bg-green-500",
  },
}

const SOURCE_CFG: Record<LeadSource, { label: string; badge: string }> = {
  intention:   { label: "Intención",    badge: "bg-blue-100 text-blue-700 border-0"       },
  web_contact: { label: "Contacto Web", badge: "bg-purple-100 text-purple-700 border-0"   },
  seller:      { label: "Registro",     badge: "bg-emerald-100 text-emerald-700 border-0" },
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function timeAgo(date: string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60)          return "justo ahora"
  const m = Math.floor(s / 60)
  if (m < 60)          return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)          return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function hoursAgo(date: string): number {
  return (Date.now() - new Date(date).getTime()) / 3_600_000
}

function buildLeads(data: LeadsData): UnifiedLead[] {
  const leads: UnifiedLead[] = []

  for (const i of data.intentions) {
    leads.push({
      id:            `intention-${i.id}`,
      name:          i.user_id ? `Comprador #${i.user_id}` : "Visitante anónimo",
      source:        "intention",
      status:        "cold",
      date:          i.created_at,
      extra:         `Fuente: ${i.source ?? "product_page"} · Seller #${i.seller_id}`,
      needsFollowUp: hoursAgo(i.created_at) > 48,
      raw:           i,
    })
  }

  for (const t of data.tickets) {
    const name = t.asunto
      .replace(/^\[WEB\]\s*/i, "")
      .replace(/^Contacto web[:\s]*/i, "")
      .trim() || `Ticket #${t.id}`
    leads.push({
      id:            `ticket-${t.id}`,
      name,
      source:        "web_contact",
      status:        "warm",
      date:          t.createdAt,
      extra:         t.mensaje
        ? t.mensaje.slice(0, 90) + (t.mensaje.length > 90 ? "…" : "")
        : undefined,
      needsFollowUp: !t.asignado_a && hoursAgo(t.createdAt) > 24,
      raw:           t,
    })
  }

  for (const s of data.sellers) {
    leads.push({
      id:            `seller-${s.id}`,
      name:          s.nombre_comercio,
      source:        "seller",
      status:        "hot",
      date:          s.createdAt,
      extra:         `KYC: ${s.estado_validacion} · Admin: ${s.estado_admin ?? "—"}`,
      needsFollowUp: s.estado_validacion === "pendiente",
      raw:           s,
    })
  }

  return leads.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, color,
}: {
  label: string; value: string | number; sub?: string; color: string
}) {
  return (
    <div className="bg-card border rounded-2xl p-5 space-y-1">
      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

function FunnelRow({
  label, count, total, status,
}: {
  label: string; count: number; total: number; status: LeadStatus
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  const cfg = STATUS_CFG[status]
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
          <span className="text-sm">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{pct}%</span>
          <span className="text-sm font-bold w-6 text-right">{count}</span>
        </div>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

type FilterStatus = "all" | LeadStatus
type FilterSource = "all" | LeadSource

export default function AdminLeadsPage() {
  const [raw,          setRaw]          = useState<LeadsData | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")
  const [filterSource, setFilterSource] = useState<FilterSource>("all")

  useEffect(() => {
    authFetch(`${API_URL}/api/admin/leads`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => { if (json) setRaw(json.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const leads   = useMemo(() => (raw ? buildLeads(raw) : []), [raw])
  const metrics = useMemo(() => {
    if (!raw) return null
    const total      = leads.length
    const contacted  = raw.tickets.length
    const converted  = raw.sellers.length
    const base       = raw.tickets.length + raw.intentions.length
    const rawRate    = base > 0 ? (converted / base) * 100 : 0
    const rate       = Math.min(rawRate, 100).toFixed(1)
    const hasOrganic = rawRate > 100
    const followUp   = leads.filter((l: UnifiedLead) => l.needsFollowUp).length
    if (rawRate > 100) {
      console.warn("Conversion rate >100% detected — sellers include organic registrations not tracked as leads")
    }
    return { total, contacted, converted, rate, hasOrganic, followUp }
  }, [leads, raw])

  const filtered = useMemo(() =>
    leads.filter((l: UnifiedLead) => {
      if (filterStatus !== "all" && l.status !== filterStatus) return false
      if (filterSource !== "all" && l.source !== filterSource) return false
      return true
    }),
  [leads, filterStatus, filterSource])

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 rounded-xl bg-muted animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-44 rounded-2xl bg-muted animate-pulse" />
        <div className="h-72 rounded-2xl bg-muted animate-pulse" />
      </div>
    )
  }

  if (!raw || !metrics) {
    return (
      <p className="text-sm text-muted-foreground p-8">
        No se pudo cargar el panel de leads.
      </p>
    )
  }

  const funnelTotal = Math.max(
    raw.intentions.length,
    raw.tickets.length,
    raw.sellers.length,
    1,
  )

  const dropOff =
    raw.intentions.length > 0
      ? (
          ((raw.intentions.length - raw.tickets.length) /
            raw.intentions.length) *
          100
        ).toFixed(0)
      : "0"

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Growth Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pipeline de adquisición · {leads.length} leads en total
          </p>
        </div>
        {metrics.followUp > 0 && (
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-xl px-4 py-2.5">
            <span>⚠️</span>
            <span>
              <strong>{metrics.followUp}</strong>{" "}
              lead{metrics.followUp !== 1 ? "s" : ""}{" "}
              requiere{metrics.followUp === 1 ? "" : "n"} seguimiento
            </span>
          </div>
        )}
      </div>

      {/* ── KPI bar ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total leads"
          value={metrics.total}
          sub="todas las fuentes"
          color="text-foreground"
        />
        <KpiCard
          label="Contactados"
          value={metrics.contacted}
          sub="vía formulario web"
          color="text-purple-600"
        />
        <KpiCard
          label="Convertidos"
          value={metrics.converted}
          sub="registros de vendedor"
          color="text-green-600"
        />
        <KpiCard
          label="Tasa conversión"
          value={`${metrics.rate}%`}
          sub={metrics.hasOrganic ? "↑ Incluye registros orgánicos" : "contacto → registro"}
          color="text-amber-600"
        />
      </div>

      {/* ── Funnel ──────────────────────────────────────────────────────────── */}
      <div className="border rounded-2xl overflow-hidden bg-card">
        <div className="px-5 py-4 border-b bg-muted/30 flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold">Embudo de conversión</p>
            <p className="text-xs text-muted-foreground mt-0.5">Interés → Contacto → Registro</p>
          </div>
          <p className="text-xs text-muted-foreground text-right">
            Drop-off contacto: <strong>{dropOff}%</strong>
          </p>
        </div>
        <div className="p-5 space-y-5">
          <FunnelRow
            label="Interés — visitantes con intención de compra"
            count={raw.intentions.length}
            total={funnelTotal}
            status="cold"
          />
          <FunnelRow
            label="Contacto — formulario web enviado"
            count={raw.tickets.length}
            total={funnelTotal}
            status="warm"
          />
          <FunnelRow
            label="Registro — cuenta de vendedor creada"
            count={raw.sellers.length}
            total={funnelTotal}
            status="hot"
          />
        </div>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-muted-foreground font-medium mr-1">Estado:</span>
        {(["all", "cold", "warm", "hot"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              filterStatus === s
                ? "bg-foreground text-background border-foreground"
                : "bg-background border-border text-muted-foreground hover:bg-muted/60"
            }`}
          >
            {s === "all" ? "Todos" : STATUS_CFG[s].label}
          </button>
        ))}

        <span className="text-xs text-muted-foreground font-medium ml-3 mr-1">Fuente:</span>
        {(["all", "intention", "web_contact", "seller"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterSource(s)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              filterSource === s
                ? "bg-foreground text-background border-foreground"
                : "bg-background border-border text-muted-foreground hover:bg-muted/60"
            }`}
          >
            {s === "all" ? "Todas" : SOURCE_CFG[s].label}
          </button>
        ))}

        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Unified leads table ─────────────────────────────────────────────── */}
      <div className="border rounded-2xl overflow-hidden bg-card">
        <div className="px-5 py-4 border-b bg-muted/30">
          <p className="text-sm font-semibold">Leads unificados</p>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No hay leads con los filtros seleccionados
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map((lead) => {
              const stCfg  = STATUS_CFG[lead.status]
              const srcCfg = SOURCE_CFG[lead.source]

              return (
                <div
                  key={lead.id}
                  className={`flex items-start gap-4 px-5 py-4 hover:bg-muted/20 transition ${
                    lead.needsFollowUp ? "bg-yellow-50/50 dark:bg-yellow-950/10" : ""
                  }`}
                >
                  {/* Status dot */}
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${stCfg.dot}`} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{lead.name}</span>
                      {lead.needsFollowUp && (
                        <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                          ⚠️ Seguimiento
                        </span>
                      )}
                    </div>

                    {lead.extra && (
                      <p className="text-xs text-muted-foreground mt-0.5 max-w-[460px] truncate">
                        {lead.extra}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge className={`text-[10px] ${srcCfg.badge}`}>
                        {srcCfg.label}
                      </Badge>
                      <Badge className={`text-[10px] ${stCfg.badge}`}>
                        {stCfg.label}
                      </Badge>
                      <time
                        className="text-[10px] text-muted-foreground"
                        title={new Date(lead.date).toLocaleString()}
                      >
                        {timeAgo(lead.date)}
                      </time>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="shrink-0">
                    {lead.source === "web_contact" && (
                      <Link href={`/admin/tickets/${(lead.raw as WebTicket).id}`}>
                        <Button size="sm" variant="outline" className="text-xs h-7 px-3">
                          Ver ticket
                        </Button>
                      </Link>
                    )}
                    {lead.source === "seller" && (
                      <Link href={`/admin/sellers/${(lead.raw as SellerLead).user_id}`}>
                        <Button size="sm" variant="outline" className="text-xs h-7 px-3">
                          Ver vendedor
                        </Button>
                      </Link>
                    )}
                    {lead.source === "intention" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-3 opacity-50"
                        disabled
                        title="Próximamente: contactar lead frío"
                      >
                        Contactar
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
