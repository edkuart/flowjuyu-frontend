"use client"

import Link from "next/link"
import { safePercentage, safeNumber } from "@/lib/adminHelpers"

// ── Types ──────────────────────────────────────────────────────────────────────

type InsightLevel = "positive" | "neutral" | "warning"

type Insight = {
  id:      string
  icon:    string
  text:    string
  detail?: string
  level:   InsightLevel
  href?:   string
}

// ── Style map ──────────────────────────────────────────────────────────────────

const LEVEL_STYLE: Record<InsightLevel, {
  card:  string
  dot:   string
  text:  string
}> = {
  positive: {
    card:  "border-green-200 bg-green-50/60 dark:border-green-800 dark:bg-green-950/10",
    dot:   "bg-green-500",
    text:  "text-green-800 dark:text-green-300",
  },
  neutral: {
    card:  "border-border bg-card",
    dot:   "bg-blue-400",
    text:  "text-foreground",
  },
  warning: {
    card:  "border-yellow-200 bg-yellow-50/60 dark:border-yellow-800 dark:bg-yellow-950/10",
    dot:   "bg-yellow-400",
    text:  "text-yellow-800 dark:text-yellow-300",
  },
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
  sellersPendientes:  number
  ticketsAbiertos:    number
  ticketsEnProceso:   number
  ticketsCerrados:    number
  productosActivos:   number
  productosInactivos: number
  totalUsers:         number
  ultimosSellers:     { estado_admin: string }[]
  ultimosTickets?:    { tipo: string }[]
}

// ── Insight engine ─────────────────────────────────────────────────────────────

function buildInsights(p: Props): Insight[] {
  const insights: Insight[] = []

  // Ticket resolution rate
  const totalTickets   = safeNumber(p.ticketsAbiertos) + safeNumber(p.ticketsEnProceso) + safeNumber(p.ticketsCerrados)
  const resolutionRate = safePercentage(p.ticketsCerrados, totalTickets, 0)

  if (resolutionRate >= 70) {
    insights.push({
      id:     "high-resolution",
      icon:   "✅",
      text:   "High ticket resolution rate",
      detail: `${resolutionRate}% of tickets resolved — team is responsive`,
      level:  "positive",
      href:   "/admin/tickets",
    })
  } else if (resolutionRate < 40 && totalTickets > 3) {
    insights.push({
      id:     "low-resolution",
      icon:   "⚠️",
      text:   "Low ticket resolution rate",
      detail: `Only ${resolutionRate}% resolved — consider prioritizing support queue`,
      level:  "warning",
      href:   "/admin/tickets",
    })
  }

  // KYC queue
  if (p.sellersPendientes >= 3) {
    insights.push({
      id:     "kyc-backlog",
      icon:   "🔍",
      text:   "KYC queue is building up",
      detail: `${p.sellersPendientes} sellers awaiting validation — delays hurt onboarding`,
      level:  "warning",
      href:   "/admin/sellers?kyc=pendiente",
    })
  } else if (p.sellersPendientes === 0) {
    insights.push({
      id:     "kyc-clear",
      icon:   "🏆",
      text:   "KYC queue is clear",
      detail: "All seller applications processed — onboarding is running smoothly",
      level:  "positive",
    })
  }

  // Product health
  const totalProducts  = safeNumber(p.productosActivos) + safeNumber(p.productosInactivos)
  const inactivePct    = safePercentage(p.productosInactivos, totalProducts, 0)
  const activeRatio    = totalProducts > 0 ? safeNumber(p.productosActivos) / totalProducts : 1

  if (activeRatio < 0.5 && totalProducts > 4) {
    insights.push({
      id:     "product-ratio",
      icon:   "📦",
      text:   "More inactive products than active",
      detail: `${inactivePct}% of catalogue is hidden — review inactive listings`,
      level:  "warning",
      href:   "/admin/products?activo=false",
    })
  } else if (activeRatio >= 0.9 && totalProducts >= 5) {
    insights.push({
      id:     "product-healthy",
      icon:   "🛍️",
      text:   "Product catalogue looks healthy",
      detail: `${p.productosActivos} active listings — good seller engagement`,
      level:  "positive",
    })
  }

  // KYC ticket signal
  const kycTickets = (p.ultimosTickets ?? []).filter((t) => t.tipo === "verificacion").length
  if (kycTickets >= 2) {
    insights.push({
      id:     "kyc-tickets",
      icon:   "📋",
      text:   "KYC support tickets increasing",
      detail: `${kycTickets} recent verification tickets — sellers may need clearer onboarding guidance`,
      level:  "warning",
      href:   "/admin/tickets",
    })
  }

  // Seller activity signal
  const newApprovedSellers = p.ultimosSellers.filter((s) => s.estado_admin === "activo").length
  if (newApprovedSellers >= 3) {
    insights.push({
      id:     "seller-momentum",
      icon:   "📈",
      text:   "Strong seller onboarding momentum",
      detail: `${newApprovedSellers} sellers recently approved — marketplace is growing`,
      level:  "positive",
    })
  }

  // Open tickets with no in-progress
  if (p.ticketsAbiertos > 0 && p.ticketsEnProceso === 0) {
    insights.push({
      id:     "tickets-unhandled",
      icon:   "🚨",
      text:   "Open tickets have no one assigned",
      detail: `${p.ticketsAbiertos} open ticket${p.ticketsAbiertos > 1 ? "s" : ""} with 0 in progress — assign support`,
      level:  "warning",
      href:   "/admin/tickets?estado=abierto",
    })
  }

  // Healthy signal fallback
  if (insights.length === 0) {
    insights.push({
      id:     "all-good",
      icon:   "🟢",
      text:   "All marketplace signals are healthy",
      detail: "No anomalies detected across sellers, tickets, or products.",
      level:  "positive",
    })
  }

  // Sort: warning first, then positive, then neutral
  const order: Record<InsightLevel, number> = { warning: 0, neutral: 1, positive: 2 }
  insights.sort((a, b) => order[a.level] - order[b.level])

  return insights.slice(0, 4) // max 4 insights
}

// ── Component ──────────────────────────────────────────────────────────────────

export function AdminInsights(props: Props) {
  const insights = buildInsights(props)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm">Marketplace Insights</h2>
        <span className="text-xs text-muted-foreground">Auto-generated · live data</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {insights.map((ins) => {
          const s       = LEVEL_STYLE[ins.level]
          const baseCls = `flex items-start gap-3 rounded-xl border p-4 transition-all ${s.card}`
          const inner   = (
            <>
              <span className="text-xl shrink-0">{ins.icon}</span>
              <div className="min-w-0 space-y-0.5">
                <p className={`text-sm font-semibold leading-tight ${s.text}`}>{ins.text}</p>
                {ins.detail && (
                  <p className="text-xs text-muted-foreground leading-relaxed">{ins.detail}</p>
                )}
              </div>
            </>
          )

          return ins.href ? (
            <Link
              key={ins.id}
              href={ins.href}
              className={`${baseCls} hover:shadow-sm cursor-pointer`}
            >
              {inner}
            </Link>
          ) : (
            <div key={ins.id} className={baseCls}>
              {inner}
            </div>
          )
        })}
      </div>
    </div>
  )
}
