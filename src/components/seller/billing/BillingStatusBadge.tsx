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
  active:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  past_due:  "bg-amber-50  text-amber-700  border-amber-200",
  expired:   "bg-red-50    text-red-700    border-red-200",
  draft:     "bg-blue-50   text-blue-700   border-blue-200",
  paused:    "bg-neutral-100 text-neutral-500 border-neutral-200",
  cancelled: "bg-neutral-100 text-neutral-500 border-neutral-200",
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
  draft:          "bg-neutral-100 text-neutral-500 border-neutral-200",
  open:           "bg-amber-50    text-amber-700   border-amber-200",
  paid:           "bg-emerald-50  text-emerald-700 border-emerald-200",
  void:           "bg-neutral-100 text-neutral-400 border-neutral-200",
  uncollectible:  "bg-red-50      text-red-600     border-red-200",
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
  pending:        "bg-blue-50    text-blue-700   border-blue-200",
  processing:     "bg-blue-50    text-blue-700   border-blue-200",
  confirmed:      "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed:         "bg-red-50     text-red-700    border-red-200",
  cancelled:      "bg-neutral-100 text-neutral-400 border-neutral-200",
  expired:        "bg-neutral-100 text-neutral-500 border-neutral-200",
  manual_pending: "bg-amber-50   text-amber-700  border-amber-200",
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
  submitted:    "bg-blue-50    text-blue-700    border-blue-200",
  under_review: "bg-amber-50   text-amber-700   border-amber-200",
  approved:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected:     "bg-red-50     text-red-700     border-red-200",
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
