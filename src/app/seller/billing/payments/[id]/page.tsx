// src/app/seller/billing/payments/[id]/page.tsx
//
// Payment detail page.
//
// This page is the key action surface for manual payments:
//   1. Seller arrives here after creating a manual payment link.
//   2. Sees bank transfer instructions (from backend).
//   3. Fills out the deposit confirmation form.
//   4. After submitting: sees read-only status with review timeline.
//
// Also handles non-manual payments (BAC / PayPal) with redirect.

"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  CreditCard, CheckCircle2, AlertCircle,
  ExternalLink, Building2, Clock, ChevronLeft,
} from "lucide-react"
import {
  SellerSurfaceCard,
} from "@/components/seller/ui/SellerPrimitives"
import { PaymentStatusBadge, providerLabel } from "@/components/seller/billing/BillingStatusBadge"
import { BillingManualPaymentForm } from "@/components/seller/billing/BillingManualPaymentForm"
import { formatQ, formatDate, formatDateTime } from "@/components/seller/billing/billingFormatters"
import { fetchPaymentDetail } from "@/services/sellerBilling"
import type { PaymentDetailFull, ManualReport } from "@/types/billing"

export default function PaymentDetailPage() {
  const { id }    = useParams<{ id: string }>()
  const paymentId = Number(id)

  const [detail,  setDetail]  = useState<PaymentDetailFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [report,  setReport]  = useState<ManualReport | null>(null)

  useEffect(() => {
    if (!paymentId) return
    fetchPaymentDetail(paymentId)
      .then((d) => {
        setDetail(d)
        setReport(d.manualReport)
      })
      .catch(() => setError("No pudimos cargar este pago."))
      .finally(() => setLoading(false))
  }, [paymentId])

  if (loading) return <PageSkeleton />

  if (error || !detail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f5ef] p-6">
        <SellerSurfaceCard className="max-w-xs space-y-4 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-[var(--seller-line-strong)]" />
          <p className="text-sm text-[var(--seller-muted)]">{error ?? "Pago no encontrado."}</p>
          <Link
            href="/seller/billing"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--seller-line-strong)] px-3 py-2 text-xs font-medium text-[var(--seller-ink)] transition hover:bg-[var(--seller-panel)]"
          >
            ← Volver a facturación
          </Link>
        </SellerSurfaceCard>
      </div>
    )
  }

  const { payment, invoice } = detail
  const isConfirmed = payment.status === "confirmed"
  const isFailed    = ["failed", "cancelled", "expired"].includes(payment.status)
  const isManual    = payment.provider === "manual"
  const hasLink     = !!payment.paymentLink
  const linkExpired = payment.linkExpiresAt
    ? new Date(payment.linkExpiresAt) < new Date()
    : false

  return (
    <div className="min-h-screen bg-[#f8f5ef]">
      <div className="mx-auto max-w-2xl space-y-5 px-4 py-6">

        {/* Back */}
        <button
          onClick={() => (window.location.href = `/seller/billing/invoices/${invoice.id}`)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--seller-muted)] transition hover:text-[var(--seller-ink)]"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Factura {invoice.invoiceNumber}
        </button>

        {/* Payment status card */}
        <SellerSurfaceCard className="overflow-hidden">
          <div className={`flex items-center justify-between border-b border-[var(--seller-line)] px-5 py-4 ${
            isConfirmed ? "bg-emerald-50"
            : isFailed  ? "bg-red-50"
            : isManual  ? "bg-amber-50"
            : "bg-[var(--seller-panel)]"
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/60 text-[var(--seller-accent)]">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--seller-ink)]">{providerLabel(payment.provider)}</p>
                <p className="text-xs text-[var(--seller-muted)]">{invoice.invoiceNumber}</p>
              </div>
            </div>
            <PaymentStatusBadge status={payment.status} />
          </div>

          <div className="space-y-4 px-5 py-4">
            {/* Amount */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--seller-muted)]">Monto</p>
                <p className="text-2xl font-bold text-[var(--seller-ink)]">{formatQ(payment.amount)}</p>
              </div>
              {isConfirmed && (
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs font-semibold">{formatDateTime(payment.confirmedAt)}</span>
                </div>
              )}
            </div>

            {/* Provider reference */}
            {payment.providerReference && (
              <div className="seller-panel-subtle rounded-[var(--seller-radius-lg)] px-4 py-2.5">
                <p className="text-xs text-[var(--seller-soft-text)]">Referencia del proveedor</p>
                <p className="mt-0.5 break-all font-mono text-xs font-semibold text-[var(--seller-text)]">
                  {payment.providerReference}
                </p>
              </div>
            )}

            {/* Failure reason */}
            {isFailed && payment.failureReason && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                <div>
                  <p className="text-xs font-semibold text-red-700">Pago no procesado</p>
                  <p className="mt-0.5 text-xs text-red-600">{payment.failureReason}</p>
                </div>
              </div>
            )}

            {/* Payment link (non-manual, not expired) */}
            {hasLink && !isManual && !linkExpired && !isConfirmed && (
              <a
                href={payment.paymentLink!}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[var(--seller-accent)] px-5 py-3 text-sm font-semibold text-white transition"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Ir al portal de pago
                </span>
                <span className="absolute inset-0 translate-x-[-100%] bg-white/10 transition-transform duration-300 group-hover:translate-x-full" />
              </a>
            )}

            {/* Expired link warning */}
            {hasLink && !isManual && linkExpired && !isConfirmed && (
              <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center">
                <Clock className="mx-auto h-4 w-4 text-amber-500" />
                <p className="text-xs font-semibold text-amber-700">El enlace de pago expiró</p>
                <p className="text-xs text-amber-600">
                  Regresa a la factura y genera un nuevo intento de pago.
                </p>
                <Link
                  href={`/seller/billing/invoices/${invoice.id}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--seller-line-strong)] px-3 py-2 text-xs font-medium text-[var(--seller-ink)] transition hover:bg-[var(--seller-panel)]"
                >
                  Ver factura
                </Link>
              </div>
            )}
          </div>
        </SellerSurfaceCard>

        {/* Bank transfer instructions + deposit form (manual payments only) */}
        {isManual && !isConfirmed && (
          <>
            <BankInstructions />
            <BillingManualPaymentForm
              paymentId={payment.id}
              amount={payment.amount}
              currency={payment.currency}
              existingReport={report}
              onSuccess={(r) => setReport(r)}
            />
          </>
        )}

        {/* Confirmed manual payment — show report status */}
        {isManual && isConfirmed && report && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-bold text-emerald-800">¡Tu depósito fue aprobado!</p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-700">
                Tu suscripción está activa. Gracias por tu pago.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ─── Bank transfer instructions card ─────────────────────────────────────────

function BankInstructions() {
  return (
    <SellerSurfaceCard className="overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-[var(--seller-line)] bg-[var(--seller-panel)] px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[color:color-mix(in_srgb,var(--seller-accent)_8%,white)] text-[var(--seller-accent)]">
          <Building2 className="h-4 w-4" />
        </div>
        <p className="text-sm font-semibold text-[var(--seller-ink)]">Instrucciones de depósito</p>
      </div>
      <div className="space-y-3 px-5 py-4">
        <BankRow label="Banco"            value="Banco Industrial" />
        <BankRow label="Tipo de cuenta"   value="Monetaria" />
        <BankRow label="Número de cuenta" value="021-000-0000" />
        <BankRow label="Nombre"           value="Flowjuyu, S.A." />
        <BankRow label="NIT"              value="12345678-9" />
        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs leading-relaxed text-amber-700">
            <span className="font-semibold">Importante:</span> Deposita exactamente{" "}
            el monto de la factura. Después de depositar, completa el formulario abajo
            para que podamos verificar tu pago.
          </p>
        </div>
      </div>
    </SellerSurfaceCard>
  )
}

function BankRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-xs text-[var(--seller-muted)]">{label}</span>
      <span className="font-semibold text-[var(--seller-ink)]">{value}</span>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8f5ef]">
      <div className="mx-auto max-w-2xl animate-pulse space-y-5 px-4 py-6">
        <div className="h-4 w-28 rounded-full bg-neutral-200" />
        <SellerSurfaceCard className="space-y-4 p-5">
          <div className="h-5 w-36 rounded-full bg-neutral-100" />
          <div className="h-8 w-24 rounded-full bg-neutral-100" />
        </SellerSurfaceCard>
        <SellerSurfaceCard className="space-y-4 p-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-neutral-100" />
          ))}
        </SellerSurfaceCard>
      </div>
    </div>
  )
}
