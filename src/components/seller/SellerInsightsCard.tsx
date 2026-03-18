"use client"

// src/components/seller/SellerInsightsCard.tsx
import Link from "next/link"
import { CheckCircle2, AlertTriangle, Info } from "lucide-react"
import type { SellerInsight, InsightType } from "@/lib/sellerInsights"

/* ──────────────────────────────────────────
   DESIGN TOKENS per type
────────────────────────────────────────── */

const TYPE_CONFIG: Record<
  InsightType,
  {
    Icon:        React.ElementType
    iconColor:   string
    accent:      string   // left border
    bg:          string
    titleColor:  string
    btnBg:       string
    btnText:     string
    btnHover:    string
  }
> = {
  success: {
    Icon:       CheckCircle2,
    iconColor:  "text-emerald-500",
    accent:     "border-l-emerald-400",
    bg:         "bg-emerald-50/50",
    titleColor: "text-emerald-900",
    btnBg:      "bg-emerald-600",
    btnText:    "text-white",
    btnHover:   "hover:bg-emerald-700",
  },
  warning: {
    Icon:       AlertTriangle,
    iconColor:  "text-amber-500",
    accent:     "border-l-amber-400",
    bg:         "bg-amber-50/50",
    titleColor: "text-amber-900",
    btnBg:      "bg-amber-500",
    btnText:    "text-white",
    btnHover:   "hover:bg-amber-600",
  },
  info: {
    Icon:       Info,
    iconColor:  "text-neutral-400",
    accent:     "border-l-neutral-300",
    bg:         "bg-neutral-50",
    titleColor: "text-neutral-800",
    btnBg:      "bg-neutral-800",
    btnText:    "text-white",
    btnHover:   "hover:bg-neutral-900",
  },
}

/* ──────────────────────────────────────────
   COMPONENT
────────────────────────────────────────── */

export interface SellerInsightsCardProps {
  insight: SellerInsight
}

export function SellerInsightsCard({ insight }: SellerInsightsCardProps) {
  const { title, message, type, actions } = insight
  const cfg = TYPE_CONFIG[type]
  const { Icon } = cfg

  return (
    <div
      className={`
        rounded-2xl border border-neutral-100 shadow-sm
        border-l-4 ${cfg.accent} ${cfg.bg}
        px-5 py-4
      `}
    >
      <div className="flex items-start gap-3">

        {/* Icon */}
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${cfg.iconColor}`} />

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">

          <div>
            <p className={`text-sm font-bold leading-snug ${cfg.titleColor}`}>
              {title}
            </p>
            <p className="text-xs text-neutral-500 mt-0.5 leading-snug">
              {message}
            </p>
          </div>

          {/* CTA buttons */}
          {actions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {actions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <span
                    className={`
                      inline-flex items-center px-3 py-1.5 rounded-lg
                      text-xs font-semibold transition-colors
                      ${cfg.btnBg} ${cfg.btnText} ${cfg.btnHover}
                    `}
                  >
                    {action.label} →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
