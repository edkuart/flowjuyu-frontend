// src/components/seller/billing/BillingSubscriptionCard.tsx
//
// The hero card at the top of the seller billing page.
// Adapts its layout, color, and CTA to every subscription state.
//
// States handled:
//   loading  → skeleton
//   null     → no plan (upgrade prompt)
//   draft    → plan selected, first payment pending
//   active   → healthy (+ expiring-soon variant)
//   past_due → grace period warning
//   expired  → plan lapsed, re-activation prompt
//   paused   → admin-paused, contact support

"use client"

import Link from "next/link"
import { CheckCircle2, AlertTriangle, Clock, Zap, XCircle, PauseCircle, ArrowRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SellerSurfaceCard } from "@/components/seller/ui/SellerPrimitives"
import { SubscriptionStatusBadge } from "./BillingStatusBadge"
import { formatQ, formatDate, cycleLabelShort, daysLabel } from "./billingFormatters"
import type { CurrentSubscription } from "@/types/billing"

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  subscription: CurrentSubscription | null
  loading:      boolean
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <SellerSurfaceCard className="space-y-4 p-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-neutral-100" />
        <div className="space-y-1.5">
          <div className="h-4 w-28 bg-neutral-100 rounded-full" />
          <div className="h-3 w-16 bg-neutral-100 rounded-full" />
        </div>
      </div>
      <div className="h-2 w-full bg-neutral-100 rounded-full" />
      <div className="h-9 w-full bg-neutral-100 rounded-xl" />
    </SellerSurfaceCard>
  )
}

// ─── No subscription ──────────────────────────────────────────────────────────

function NoPlanCard() {
  return (
    <SellerSurfaceCard className="space-y-4 border-2 border-dashed border-[color:color-mix(in_srgb,var(--seller-accent)_18%,transparent)] p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:color-mix(in_srgb,var(--seller-accent)_5%,white)]">
        <Zap className="h-5 w-5 text-[var(--seller-accent)]" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold text-[var(--seller-ink)]">Tu tienda aún no tiene un plan</p>
        <p className="mx-auto max-w-[26ch] text-xs leading-relaxed text-[var(--seller-muted)]">
          Elige un plan para publicar tus productos y comenzar a vender.
        </p>
      </div>
      <Button asChild className="seller-button-primary w-full text-sm font-semibold">
        <Link href="/seller/billing/planes">
          Ver planes disponibles
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </Button>
    </SellerSurfaceCard>
  )
}

// ─── Expiry progress bar ──────────────────────────────────────────────────────

function PeriodProgress({ sub }: { sub: CurrentSubscription }) {
  if (!sub.currentPeriodStart || !sub.currentPeriodEnd) return null

  const start = new Date(sub.currentPeriodStart + "T00:00:00Z").getTime()
  const end   = new Date(sub.currentPeriodEnd   + "T00:00:00Z").getTime()
  const now   = Date.now()

  const total   = end - start
  const elapsed = Math.max(0, Math.min(now - start, total))
  const pct     = total > 0 ? Math.round((elapsed / total) * 100) : 0

  const barColor = sub.status === "past_due"
    ? "bg-amber-400"
    : pct >= 85
    ? "bg-amber-400"
    : "bg-emerald-500"

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-neutral-500">
        <span>Inicio: {formatDate(sub.currentPeriodStart)}</span>
        <span>Vence: {formatDate(sub.currentPeriodEnd)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── Main card ────────────────────────────────────────────────────────────────

export function BillingSubscriptionCard({ subscription: sub, loading }: Props) {
  if (loading) return <Skeleton />
  if (!sub)    return <NoPlanCard />

  // ─── Config per status ────────────────────────────────────────────────────
  type Config = {
    iconEl:    React.ReactNode
    headerBg:  string
    headline:  string
    subline:   string
    cta?:      { label: string; href: string; variant: "primary" | "warning" | "danger" }
  }

  const config: Config = (() => {
    switch (sub.status) {

      case "active":
        if (sub.isExpiringSoon) return {
          iconEl:   <AlertTriangle className="w-5 h-5 text-amber-500" />,
          headerBg: "bg-amber-50",
          headline: `Renueva pronto — ${daysLabel(sub.daysUntilRenewal)}`,
          subline:  "Tu plan vence pronto. Renueva ahora para no interrumpir tu tienda.",
          cta:      { label: "Renovar ahora", href: "/seller/billing", variant: "warning" },
        }
        return {
          iconEl:   <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          headerBg: "bg-white",
          headline: `Plan ${sub.plan.name} · Activo`,
          subline:  sub.daysUntilRenewal !== null
            ? `${daysLabel(sub.daysUntilRenewal)} para la renovación`
            : "Tu suscripción está al día.",
        }

      case "past_due":
        return {
          iconEl:   <AlertTriangle className="w-5 h-5 text-amber-500" />,
          headerBg: "bg-amber-50",
          headline: "Tu suscripción venció",
          subline:  sub.gracePeriodEnd
            ? `Tienes hasta el ${formatDate(sub.gracePeriodEnd)} para renovar.`
            : "Realiza tu pago para evitar la suspensión.",
          cta:      { label: "Renovar ahora", href: "/seller/billing", variant: "warning" },
        }

      case "expired":
        return {
          iconEl:   <XCircle className="w-5 h-5 text-red-500" />,
          headerBg: "bg-red-50",
          headline: "Plan expirado",
          subline:  "Tu tienda está inactiva. Reactiva tu suscripción para volver a vender.",
          cta:      { label: "Reactivar mi tienda", href: "/seller/billing/planes", variant: "danger" },
        }

      case "draft":
        return {
          iconEl:   <Clock className="w-5 h-5 text-blue-500" />,
          headerBg: "bg-blue-50",
          headline: `Plan ${sub.plan.name} seleccionado`,
          subline:  "Completa tu pago para activar tu tienda.",
          cta:      { label: "Continuar al pago", href: "/seller/billing", variant: "primary" },
        }

      case "paused":
        return {
          iconEl:   <PauseCircle className="w-5 h-5 text-neutral-400" />,
          headerBg: "bg-neutral-50",
          headline: "Suscripción pausada",
          subline:  "Tu plan fue pausado por el administrador. Contacta a soporte para más información.",
        }

      default:
        return {
          iconEl:   <RefreshCw className="w-5 h-5 text-neutral-400" />,
          headerBg: "bg-neutral-50",
          headline: "Estado de plan",
          subline:  "—",
        }
    }
  })()

  const ctaStyle = {
    primary: "seller-button-primary",
    warning: "bg-amber-500 hover:bg-amber-600 text-white",
    danger:  "bg-red-600 hover:bg-red-700 text-white",
  }

  return (
    <SellerSurfaceCard className="overflow-hidden">

      {/* Header band */}
      <div className={`border-b border-[var(--seller-line)] px-5 py-4 ${config.headerBg}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-[var(--seller-line)] bg-white shadow-[var(--seller-shadow-panel)]">
              {config.iconEl}
            </div>
            <div>
              <p className="text-sm font-bold leading-snug text-[var(--seller-ink)]">{config.headline}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-[var(--seller-muted)]">{config.subline}</p>
            </div>
          </div>
          <SubscriptionStatusBadge status={sub.status} className="flex-shrink-0 mt-0.5" />
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4">

        {/* Plan + price */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs text-[var(--seller-muted)]">Plan</p>
            <p className="text-sm font-semibold text-[var(--seller-ink)]">{sub.plan.name}</p>
          </div>
          <div className="text-right space-y-0.5">
            <p className="text-xs text-[var(--seller-muted)]">Precio</p>
            <p className="text-sm font-semibold text-[var(--seller-ink)]">
              {formatQ(sub.priceAtSignup)}
              <span className="ml-1 text-xs font-normal text-[var(--seller-soft-text)]">/ {cycleLabelShort(sub.billingCycle)}</span>
            </p>
          </div>
        </div>

        {/* Period progress bar */}
        {sub.status === "active" || sub.status === "past_due" ? (
          <PeriodProgress sub={sub} />
        ) : null}

        {/* Plan features */}
        <div className="seller-panel-subtle flex items-center justify-between rounded-[var(--seller-radius-lg)] px-4 py-2.5 text-xs">
          <span className="text-[var(--seller-muted)]">Productos publicables</span>
          <span className="font-semibold text-[var(--seller-ink)]">{sub.plan.maxProducts}</span>
        </div>

        {/* CTA */}
        {config.cta && (
          <Button
            asChild
            className={`w-full font-semibold text-sm ${ctaStyle[config.cta.variant]}`}
          >
            <Link href={config.cta.href}>
              {config.cta.label}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        )}

      </div>
    </SellerSurfaceCard>
  )
}
