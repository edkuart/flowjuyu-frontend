"use client"

// ── Types ──────────────────────────────────────────────────────────────────────

type Band = "healthy" | "fair" | "at_risk" | "critical"

type FactorRow = {
  label:    string
  severity: "positive" | "warning" | "negative"
}

interface Props {
  sellersPendientes:  number
  ticketsAbiertos:    number
  ticketsCerrados:    number
  productosActivos:   number
  productosInactivos: number
}

// ── Health score ───────────────────────────────────────────────────────────────
//
// score = 100
//   − sellers_pending_penalty  (each pending seller: −5, cap −20)
//   − open_ticket_penalty      (each open ticket:    −3, cap −15)
//   − inactive_product_penalty (>30% inactive: −10)
//   + resolution_bonus         (cerrados ≥ abiertos: +5)
//
// Bands: 80–100 Healthy | 60–79 Fair | 40–59 At Risk | 0–39 Critical

function computeScore(p: Props): {
  score:   number
  band:    Band
  factors: FactorRow[]
} {
  let score = 100
  const factors: FactorRow[] = []

  // Pending sellers
  if (p.sellersPendientes > 0) {
    const d = -Math.min(20, p.sellersPendientes * 5)
    score += d
    factors.push({
      label:    `${p.sellersPendientes} seller${p.sellersPendientes > 1 ? "s" : ""} pending KYC review`,
      severity: p.sellersPendientes >= 3 ? "negative" : "warning",
    })
  }

  // Open tickets
  if (p.ticketsAbiertos > 0) {
    const d = -Math.min(15, p.ticketsAbiertos * 3)
    score += d
    factors.push({
      label:    `${p.ticketsAbiertos} open ticket${p.ticketsAbiertos > 1 ? "s" : ""} unresolved`,
      severity: p.ticketsAbiertos >= 5 ? "negative" : "warning",
    })
  }

  // Inactive product ratio
  const total = p.productosActivos + p.productosInactivos
  const inactivePct = total > 0 ? p.productosInactivos / total : 0
  if (inactivePct > 0.3) {
    score -= 10
    factors.push({
      label:    `${Math.round(inactivePct * 100)}% of products inactive`,
      severity: inactivePct > 0.5 ? "negative" : "warning",
    })
  }

  // Resolution bonus
  if (p.ticketsCerrados > 0 && p.ticketsCerrados >= p.ticketsAbiertos) {
    score += 5
    factors.push({
      label:    `${p.ticketsCerrados} tickets resolved — good response rate`,
      severity: "positive",
    })
  }

  // All clear
  if (factors.length === 0) {
    factors.push({ label: "All indicators within normal parameters", severity: "positive" })
  }

  const clamped = Math.max(0, Math.min(100, Math.round(score)))
  const band: Band =
    clamped >= 80 ? "healthy"  :
    clamped >= 60 ? "fair"     :
    clamped >= 40 ? "at_risk"  : "critical"

  return { score: clamped, band, factors }
}

// ── Band config ────────────────────────────────────────────────────────────────

const BAND: Record<Band, {
  label: string
  card:  string
  bar:   string
  text:  string
  badge: string
}> = {
  healthy:  {
    label: "Healthy",
    card:  "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800",
    bar:   "bg-green-500",
    text:  "text-green-700 dark:text-green-400",
    badge: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
  fair:     {
    label: "Fair",
    card:  "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800",
    bar:   "bg-yellow-400",
    text:  "text-yellow-700 dark:text-yellow-400",
    badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  },
  at_risk:  {
    label: "At Risk",
    card:  "bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800",
    bar:   "bg-orange-400",
    text:  "text-orange-700 dark:text-orange-400",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  },
  critical: {
    label: "Critical",
    card:  "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800",
    bar:   "bg-red-500",
    text:  "text-red-600 dark:text-red-400",
    badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
}

const FACTOR_DOT: Record<FactorRow["severity"], string> = {
  positive: "bg-green-500",
  warning:  "bg-yellow-400",
  negative: "bg-red-500",
}

// ── Component ──────────────────────────────────────────────────────────────────

export function AdminMarketplaceStatus(props: Props) {
  const { score, band, factors } = computeScore(props)
  const cfg = BAND[band]

  return (
    <div className={`border rounded-xl p-5 space-y-4 ${cfg.card}`}>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="space-y-0.5">
          <h2 className="font-semibold text-sm">Marketplace Status</h2>
          <p className="text-xs text-muted-foreground">
            Computed from KYC queue, tickets, and product health
          </p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>

      {/* Score bar */}
      <div className="space-y-1.5">
        <div className="flex items-end justify-between">
          <span className={`text-4xl font-bold tabular-nums ${cfg.text}`}>{score}</span>
          <span className="text-xs text-muted-foreground mb-1">/ 100</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Factor list */}
      <ul className="space-y-1.5">
        {factors.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={`w-2 h-2 rounded-full shrink-0 ${FACTOR_DOT[f.severity]}`} />
            {f.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
