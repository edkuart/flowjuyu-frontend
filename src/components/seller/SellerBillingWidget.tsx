// src/components/seller/SellerBillingWidget.tsx
//
// Compact billing status card for the seller dashboard.
// Shows the most important billing signal: plan state + days left + CTA.
//
// States:
//   loading          → skeleton
//   null             → no plan, "Activa tu tienda" prompt
//   active (healthy) → plan name + days left (no CTA unless expiring soon)
//   active (soon)    → amber warning + "Renovar"
//   past_due         → orange alert + "Pagar ahora"
//   expired          → red alert + "Reactivar"
//   draft            → blue prompt + "Completar pago"

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Zap, AlertTriangle, CheckCircle2, Clock, ArrowRight, XCircle } from "lucide-react"
import { fetchCurrentSubscription } from "@/services/sellerBilling"
import { formatQ, formatDate, daysLabel, cycleLabelShort } from "@/components/seller/billing/billingFormatters"
import type { CurrentSubscription } from "@/types/billing"

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-5 py-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-100" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-24 bg-neutral-100 rounded-full" />
            <div className="h-2.5 w-16 bg-neutral-100 rounded-full" />
          </div>
        </div>
        <div className="h-7 w-20 bg-neutral-100 rounded-lg" />
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SellerBillingWidget() {
  const [sub,     setSub]     = useState<CurrentSubscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentSubscription()
      .then(setSub)
      .catch(() => setSub(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Skeleton />

  // ─── No subscription ────────────────────────────────────────────────────────
  if (!sub) {
    return (
      <WidgetShell
        icon={<Zap className="w-4 h-4 text-[#0F3D3A]" />}
        iconBg="bg-[#0F3D3A]/10"
        title="Sin plan activo"
        subtitle="Elige un plan para publicar tus productos"
        band={null}
        cta={{ label: "Ver planes", href: "/seller/billing/planes" }}
      />
    )
  }

  // ─── Active — expiring soon ─────────────────────────────────────────────────
  if (sub.status === "active" && sub.isExpiringSoon) {
    return (
      <WidgetShell
        icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
        iconBg="bg-amber-50"
        title={`Renueva pronto — ${daysLabel(sub.daysUntilRenewal)}`}
        subtitle={`${sub.plan.name} · ${formatQ(sub.priceAtSignup)}/${cycleLabelShort(sub.billingCycle)}`}
        band="amber"
        cta={{ label: "Renovar", href: "/seller/billing" }}
      />
    )
  }

  // ─── Active — healthy ───────────────────────────────────────────────────────
  if (sub.status === "active") {
    return (
      <WidgetShell
        icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        iconBg="bg-emerald-50"
        title={`Plan ${sub.plan.name}`}
        subtitle={
          sub.daysUntilRenewal !== null
            ? `Vigente · renueva en ${daysLabel(sub.daysUntilRenewal)}`
            : `Activo · vence ${formatDate(sub.currentPeriodEnd)}`
        }
        band={null}
        cta={null}
        href="/seller/billing"
      />
    )
  }

  // ─── Past due ───────────────────────────────────────────────────────────────
  if (sub.status === "past_due") {
    return (
      <WidgetShell
        icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
        iconBg="bg-amber-50"
        title="Suscripción vencida"
        subtitle={
          sub.gracePeriodEnd
            ? `Renueva antes del ${formatDate(sub.gracePeriodEnd)}`
            : "Renueva para evitar la suspensión"
        }
        band="amber"
        cta={{ label: "Pagar ahora", href: "/seller/billing" }}
      />
    )
  }

  // ─── Expired ────────────────────────────────────────────────────────────────
  if (sub.status === "expired") {
    return (
      <WidgetShell
        icon={<XCircle className="w-4 h-4 text-red-500" />}
        iconBg="bg-red-50"
        title="Plan expirado"
        subtitle="Tu tienda está inactiva"
        band="red"
        cta={{ label: "Reactivar", href: "/seller/billing/planes" }}
      />
    )
  }

  // ─── Draft ──────────────────────────────────────────────────────────────────
  if (sub.status === "draft") {
    return (
      <WidgetShell
        icon={<Clock className="w-4 h-4 text-blue-500" />}
        iconBg="bg-blue-50"
        title={`Plan ${sub.plan.name} seleccionado`}
        subtitle="Completa tu pago para activar tu tienda"
        band="blue"
        cta={{ label: "Completar pago", href: "/seller/billing" }}
      />
    )
  }

  // ─── Paused / fallback ──────────────────────────────────────────────────────
  return (
    <WidgetShell
      icon={<Zap className="w-4 h-4 text-neutral-400" />}
      iconBg="bg-neutral-100"
      title="Suscripción"
      subtitle={sub.plan.name}
      band={null}
      cta={null}
      href="/seller/billing"
    />
  )
}

// ─── Shell component ──────────────────────────────────────────────────────────

type Band = "amber" | "red" | "blue" | null

interface ShellProps {
  icon:    React.ReactNode
  iconBg:  string
  title:   string
  subtitle: string
  band:    Band
  cta:     { label: string; href: string } | null
  href?:   string
}

const BAND_STYLES: Record<NonNullable<Band>, string> = {
  amber: "border-l-amber-400",
  red:   "border-l-red-400",
  blue:  "border-l-blue-400",
}

function WidgetShell({ icon, iconBg, title, subtitle, band, cta, href }: ShellProps) {
  const borderClass = band ? `border-l-[3px] ${BAND_STYLES[band]}` : ""

  const inner = (
    <div className={`rounded-xl border border-neutral-200 bg-white px-5 py-4 flex items-center justify-between gap-4 ${borderClass} transition-shadow hover:shadow-sm`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-800 leading-snug truncate">{title}</p>
          <p className="text-xs text-neutral-500 mt-0.5 truncate">{subtitle}</p>
        </div>
      </div>

      {cta ? (
        <Link
          href={cta.href}
          className={`flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            band === "red"   ? "bg-red-600 hover:bg-red-700 text-white"
            : band === "amber" ? "bg-amber-500 hover:bg-amber-600 text-white"
            : band === "blue"  ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-[#0F3D3A] hover:bg-[#0C2F2C] text-white"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {cta.label}
          <ArrowRight className="w-3 h-3" />
        </Link>
      ) : href ? (
        <ArrowRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
      ) : null}
    </div>
  )

  if (href && !cta) {
    return <Link href={href} className="block">{inner}</Link>
  }

  return inner
}
