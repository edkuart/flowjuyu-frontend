"use client"

import Link from "next/link"
import { ReactNode } from "react"

// ── Types ──────────────────────────────────────────────────────────────────────

type ActionItem = {
  icon:        string
  label:       string
  description: string
  href:        string
  badge?:      number      // shows a red count badge when > 0
  variant:     "default" | "warning" | "danger"
}

// ── Style map ──────────────────────────────────────────────────────────────────

const VARIANT: Record<ActionItem["variant"], { card: string; icon: string; label: string }> = {
  default: {
    card:  "hover:border-primary/50 hover:bg-primary/5",
    icon:  "bg-muted text-foreground",
    label: "text-foreground",
  },
  warning: {
    card:  "hover:border-yellow-400/60 hover:bg-yellow-50/50 dark:hover:bg-yellow-950/10",
    icon:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    label: "text-yellow-800 dark:text-yellow-300",
  },
  danger: {
    card:  "hover:border-red-400/60 hover:bg-red-50/50 dark:hover:bg-red-950/10",
    icon:  "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300",
    label: "text-red-700 dark:text-red-400",
  },
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ActionCard({ action }: { action: ActionItem }) {
  const v = VARIANT[action.variant]

  return (
    <Link
      href={action.href}
      className={`relative block rounded-xl border p-4 space-y-2 transition-all duration-150 hover:shadow-sm ${v.card}`}
    >
      {/* Badge */}
      {action.badge !== undefined && action.badge > 0 && (
        <span className="absolute top-3 right-3 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
          {action.badge > 99 ? "99+" : action.badge}
        </span>
      )}

      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 ${v.icon}`}>
        {action.icon}
      </div>

      <div className="space-y-0.5">
        <p className={`text-sm font-semibold ${v.label}`}>{action.label}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{action.description}</p>
      </div>
    </Link>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────

interface Props {
  sellersPendientes: number
  ticketsAbiertos:   number
  productosInactivos: number
}

export function AdminQuickActions({ sellersPendientes, ticketsAbiertos, productosInactivos }: Props) {
  const actions: ActionItem[] = [
    {
      icon:        "🏪",
      label:       "Review Pending Sellers",
      description: "Validate KYC submissions and approve or reject seller accounts.",
      href:        "/admin/sellers?kyc=pendiente",
      badge:       sellersPendientes,
      variant:     sellersPendientes > 0 ? "warning" : "default",
    },
    {
      icon:        "📦",
      label:       "Fix Inactive Products",
      description: "Review and reactivate products that are hidden from the marketplace.",
      href:        "/admin/products?activo=false",
      badge:       productosInactivos > 0 ? productosInactivos : undefined,
      variant:     productosInactivos > 5 ? "warning" : "default",
    },
    {
      icon:        "🎫",
      label:       "Respond to Open Tickets",
      description: "Address buyer and seller support tickets waiting for a response.",
      href:        "/admin/tickets?estado=abierto",
      badge:       ticketsAbiertos,
      variant:     ticketsAbiertos > 0 ? "danger" : "default",
    },
    {
      icon:        "📊",
      label:       "Run AI Brain",
      description: "Trigger an AI cycle to refresh marketplace intelligence and risk scores.",
      href:        "/admin/ai",
      variant:     "default",
    },
    {
      icon:        "👥",
      label:       "View All Sellers",
      description: "Browse seller accounts, scores, and activity across the marketplace.",
      href:        "/admin/sellers",
      variant:     "default",
    },
    {
      icon:        "📈",
      label:       "Leads Dashboard",
      description: "Review purchase intentions and buyer demand signals.",
      href:        "/admin/leads",
      variant:     "default",
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm">Quick Actions</h2>
        {(sellersPendientes + ticketsAbiertos) > 0 && (
          <span className="text-xs text-red-500 font-medium">
            {sellersPendientes + ticketsAbiertos} item{(sellersPendientes + ticketsAbiertos) > 1 ? "s" : ""} need attention
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((a) => (
          <ActionCard key={a.href} action={a} />
        ))}
      </div>
    </div>
  )
}
