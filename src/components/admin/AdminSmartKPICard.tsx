"use client"

import { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

// ── Types ──────────────────────────────────────────────────────────────────────

type Trend    = "up" | "down" | "neutral"
type Severity = "default" | "green" | "yellow" | "red"

interface Props {
  title:       string
  value:       number | string
  icon:        ReactNode
  description?: string
  /** e.g. "↑ +12 esta semana" — prefix arrow handled by `trend` */
  delta?:      string
  /** Contextual subtitle shown below delta */
  subtitle?:   string
  trend?:      Trend
  severity?:   Severity
  href?:       string
}

// ── Style maps ─────────────────────────────────────────────────────────────────

const TREND_ARROW: Record<Trend, string> = { up: "↑", down: "↓", neutral: "→" }
const TREND_COLOR: Record<Trend, string> = {
  up:      "text-green-600 dark:text-green-400",
  down:    "text-red-500 dark:text-red-400",
  neutral: "text-muted-foreground",
}

const SEV_CARD: Record<Severity, string> = {
  default: "bg-card border-border",
  green:   "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800",
  yellow:  "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800",
  red:     "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800",
}
const SEV_VALUE: Record<Severity, string> = {
  default: "text-foreground",
  green:   "text-green-700 dark:text-green-300",
  yellow:  "text-yellow-700 dark:text-yellow-300",
  red:     "text-red-600 dark:text-red-400",
}
const SEV_ICON: Record<Severity, string> = {
  default: "text-muted-foreground",
  green:   "text-green-500",
  yellow:  "text-yellow-500",
  red:     "text-red-500",
}

// ── Component ──────────────────────────────────────────────────────────────────

export function AdminSmartKPICard({
  title,
  value,
  icon,
  description,
  delta,
  subtitle,
  trend,
  severity = "default",
  href,
}: Props) {
  const router = useRouter()

  return (
    <div
      role={href ? "button" : undefined}
      tabIndex={href ? 0 : undefined}
      onClick={() => href && router.push(href)}
      onKeyDown={(e) => e.key === "Enter" && href && router.push(href)}
      className={cn(
        "rounded-xl border p-5 shadow-sm transition-all duration-200 space-y-3",
        SEV_CARD[severity],
        href && "cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99]",
      )}
    >
      {/* Title row */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </span>
        <span className={cn("opacity-70", SEV_ICON[severity])}>{icon}</span>
      </div>

      {/* Value + trend */}
      <div className="space-y-1">
        <div className={cn("text-3xl font-bold tabular-nums tracking-tight", SEV_VALUE[severity])}>
          {value}
        </div>

        {(trend || delta) && (
          <div className="flex items-center gap-1 text-xs font-medium">
            {trend && (
              <span className={TREND_COLOR[trend]}>{TREND_ARROW[trend]}</span>
            )}
            {delta && (
              <span className={trend ? TREND_COLOR[trend] : "text-muted-foreground"}>
                {delta}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Subtitles */}
      {(description || subtitle) && (
        <div className="space-y-0.5 border-t pt-2.5">
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {subtitle && (
            <p className="text-xs font-medium text-muted-foreground/80">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  )
}
