// src/components/seller/billing/BillingStatusBadge.tsx
//
// Plain-language status badges for subscriptions, invoices, payments,
// and manual payment reports. No technical jargon shown to the seller.

import { cn } from "@/lib/utils"
import type { SubscriptionStatus, InvoiceStatus, PaymentStatus, ReportStatus } from "@/types/billing"

// ─── Subscription ─────────────────────────────────────────────────────────────

const SUB_LABELS: Record<SubscriptionStatus, string> = {
  active:    "Activo",
  past_due:  "Vencido",
  expired:   "Expirado",
  draft:     "Sin activar",
  paused:    "Pausado",
  cancelled: "Cancelado",
}

const SUB_STYLES: Record<SubscriptionStatus, string> = {
  active:    "border-emerald-200 bg-emerald-50 text-emerald-700",
  past_due:  "border-amber-200 bg-amber-50 text-amber-700",
  expired:   "border-red-200 bg-red-50 text-red-700",
  draft:     "border-blue-200 bg-blue-50 text-blue-700",
  paused:    "border-[var(--seller-line)] bg-[var(--seller-panel-soft)] text-[var(--seller-muted)]",
  cancelled: "border-[var(--seller-line)] bg-[var(--seller-panel-soft)] text-[var(--seller-muted)]",
}

export function SubscriptionStatusBadge({
  status,
  className,
}: {
  status: SubscriptionStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border",
        SUB_STYLES[status],
        className,
      )}
    >
      {SUB_LABELS[status]}
    </span>
  )
}

// ─── Invoice ──────────────────────────────────────────────────────────────────

const INV_LABELS: Record<InvoiceStatus, string> = {
  draft:          "Borrador",
  open:           "Pendiente de pago",
  paid:           "Pagada",
  void:           "Anulada",
  uncollectible:  "Irrecuperable",
}

const INV_STYLES: Record<InvoiceStatus, string> = {
  draft:          "border-[var(--seller-line)] bg-[var(--seller-panel-soft)] text-[var(--seller-muted)]",
  open:           "border-amber-200 bg-amber-50 text-amber-700",
  paid:           "border-emerald-200 bg-emerald-50 text-emerald-700",
  void:           "border-[var(--seller-line)] bg-[var(--seller-panel-soft)] text-[var(--seller-soft-text)]",
  uncollectible:  "border-red-200 bg-red-50 text-red-600",
}

export function InvoiceStatusBadge({
  status,
  className,
}: {
  status: InvoiceStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border",
        INV_STYLES[status],
        className,
      )}
    >
      {INV_LABELS[status]}
    </span>
  )
}

// ─── Payment ──────────────────────────────────────────────────────────────────

const PMT_LABELS: Record<PaymentStatus, string> = {
  pending:        "Esperando pago",
  processing:     "Procesando",
  confirmed:      "Confirmado",
  failed:         "Rechazado",
  cancelled:      "Cancelado",
  expired:        "Expirado",
  manual_pending: "En revisión",
}

const PMT_STYLES: Record<PaymentStatus, string> = {
  pending:        "border-blue-200 bg-blue-50 text-blue-700",
  processing:     "border-blue-200 bg-blue-50 text-blue-700",
  confirmed:      "border-emerald-200 bg-emerald-50 text-emerald-700",
  failed:         "border-red-200 bg-red-50 text-red-700",
  cancelled:      "border-[var(--seller-line)] bg-[var(--seller-panel-soft)] text-[var(--seller-soft-text)]",
  expired:        "border-[var(--seller-line)] bg-[var(--seller-panel-soft)] text-[var(--seller-muted)]",
  manual_pending: "border-amber-200 bg-amber-50 text-amber-700",
}

export function PaymentStatusBadge({
  status,
  className,
}: {
  status: PaymentStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border",
        PMT_STYLES[status],
        className,
      )}
    >
      {PMT_LABELS[status]}
    </span>
  )
}

// ─── Manual payment report ────────────────────────────────────────────────────

const RPT_LABELS: Record<ReportStatus, string> = {
  submitted:    "Enviado",
  under_review: "En revisión",
  approved:     "Aprobado",
  rejected:     "Rechazado",
}

const RPT_STYLES: Record<ReportStatus, string> = {
  submitted:    "border-blue-200 bg-blue-50 text-blue-700",
  under_review: "border-amber-200 bg-amber-50 text-amber-700",
  approved:     "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected:     "border-red-200 bg-red-50 text-red-700",
}

export function ReportStatusBadge({
  status,
  className,
}: {
  status: ReportStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border",
        RPT_STYLES[status],
        className,
      )}
    >
      {RPT_LABELS[status]}
    </span>
  )
}

// ─── Provider label ───────────────────────────────────────────────────────────

const PROVIDER_LABELS: Record<string, string> = {
  bac:     "BAC Credomatic",
  paypal:  "PayPal",
  manual:  "Depósito bancario",
}

export function providerLabel(provider: string): string {
  return PROVIDER_LABELS[provider] ?? provider
}
