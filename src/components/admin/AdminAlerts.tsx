"use client"

import { useRouter } from "next/navigation"

// ── Types ──────────────────────────────────────────────────────────────────────

type AlertSeverity = "critical" | "warning" | "info"

type Alert = {
  id:       string
  severity: AlertSeverity
  count:    number
  title:    string
  detail:   string
  href:     string
  cta:      string
}

// ── Style map ──────────────────────────────────────────────────────────────────

const SEV_STYLES: Record<AlertSeverity, {
  container: string
  dot:       string
  title:     string
  count:     string
  cta:       string
}> = {
  critical: {
    container: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20",
    dot:       "bg-red-500",
    title:     "text-red-800 dark:text-red-300",
    count:     "bg-red-500 text-white",
    cta:       "text-red-700 dark:text-red-400 hover:text-red-900",
  },
  warning: {
    container: "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20",
    dot:       "bg-yellow-400",
    title:     "text-yellow-800 dark:text-yellow-300",
    count:     "bg-yellow-400 text-yellow-900",
    cta:       "text-yellow-700 dark:text-yellow-400 hover:text-yellow-900",
  },
  info: {
    container: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20",
    dot:       "bg-blue-400",
    title:     "text-blue-800 dark:text-blue-300",
    count:     "bg-blue-400 text-white",
    cta:       "text-blue-700 dark:text-blue-400 hover:text-blue-900",
  },
}

const SEV_ORDER: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 }

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props {
  sellersPendientes: number
  ticketsAbiertos:   number
  ticketsEnProceso?: number
}

// ── Component ──────────────────────────────────────────────────────────────────

export function AdminAlerts({ sellersPendientes, ticketsAbiertos, ticketsEnProceso = 0 }: Props) {
  const router = useRouter()

  // Build alert list dynamically
  const alerts: Alert[] = []

  if (ticketsAbiertos > 0) {
    alerts.push({
      id:       "tickets-open",
      severity: ticketsAbiertos >= 5 ? "critical" : "warning",
      count:    ticketsAbiertos,
      title:    "Open tickets require response",
      detail:   `${ticketsAbiertos} support ticket${ticketsAbiertos > 1 ? "s" : ""} are waiting for admin attention.`,
      href:     "/admin/tickets?estado=abierto",
      cta:      "View open tickets →",
    })
  }

  if (sellersPendientes > 0) {
    alerts.push({
      id:       "sellers-pending",
      severity: sellersPendientes >= 3 ? "critical" : "warning",
      count:    sellersPendientes,
      title:    "Seller KYC submissions pending",
      detail:   `${sellersPendientes} seller${sellersPendientes > 1 ? "s" : ""} are waiting for KYC validation.`,
      href:     "/admin/sellers?kyc=pendiente",
      cta:      "Review sellers →",
    })
  }

  if (ticketsEnProceso > 0) {
    alerts.push({
      id:       "tickets-in-progress",
      severity: "info",
      count:    ticketsEnProceso,
      title:    "Tickets in progress",
      detail:   `${ticketsEnProceso} ticket${ticketsEnProceso > 1 ? "s" : ""} are currently being handled.`,
      href:     "/admin/tickets?estado=en_proceso",
      cta:      "Monitor progress →",
    })
  }

  // All clear
  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20 p-4">
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
        <div>
          <p className="text-sm font-medium text-green-800 dark:text-green-300">
            All systems operating normally
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
            No pending sellers, no open tickets.
          </p>
        </div>
      </div>
    )
  }

  // Sort by severity
  alerts.sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity])

  const criticalCount = alerts.filter((a) => a.severity === "critical").length
  const totalItems    = alerts.reduce((s, a) => s + a.count, 0)

  return (
    <div className="space-y-2">
      {/* Summary bar */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          System Alerts
        </p>
        <span className="text-xs text-muted-foreground">
          {totalItems} item{totalItems !== 1 ? "s" : ""} · {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
          {criticalCount > 0 && (
            <span className="ml-1 text-red-500 font-semibold">
              ({criticalCount} critical)
            </span>
          )}
        </span>
      </div>

      {/* Alert cards */}
      {alerts.map((alert) => {
        const s = SEV_STYLES[alert.severity]
        return (
          <div
            key={alert.id}
            onClick={() => router.push(alert.href)}
            className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer hover:shadow-sm transition-shadow ${s.container}`}
          >
            {/* Dot + count */}
            <div className="flex items-center gap-2 shrink-0 pt-0.5">
              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[22px] text-center ${s.count}`}>
                {alert.count}
              </span>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0 space-y-0.5">
              <p className={`text-sm font-semibold ${s.title}`}>{alert.title}</p>
              <p className="text-xs text-muted-foreground">{alert.detail}</p>
            </div>

            {/* CTA */}
            <span className={`text-xs font-medium shrink-0 self-center ${s.cta}`}>
              {alert.cta}
            </span>
          </div>
        )
      })}
    </div>
  )
}
