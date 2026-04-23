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
  ExternalLink, Building2, Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  SellerActionButton,
  SellerPanelHeader,
  SellerSurfaceCard,
} from "@/components/seller/ui/SellerPrimitives"
import { PageBackNav } from "@/components/ui/PageBackNav"
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
          <AlertCircle className="w-8 h-8 text-neutral-300 mx-auto" />
          <p className="text-sm text-neutral-500">{error ?? "Pago no encontrado."}</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/seller/billing">← Volver a facturación</Link>
          </Button>
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
        <PageBackNav
          variant="panel"
          onClick={() => (window.location.href = `/seller/billing/invoices/${invoice.id}`)}
          label={`Factura ${invoice.invoiceNumber}`}
          meta="Facturación"
          title={<p className="truncate text-[15px] font-semibold text-[var(--seller-ink)]">Detalle de pago</p>}
        />

        {/* Payment status card */}
        <SellerSurfaceCard className="overflow-hidden">
          <div className={`border-b border-[var(--seller-line)] ${
            isConfirmed ? "bg-emerald-50"
            : isFailed  ? "bg-red-50"
            : isManual  ? "bg-amber-50"
            : "bg-[var(--seller-panel)]"
          }`}>
            <SellerPanelHeader
              icon={<CreditCard className="w-4 h-4" />}
              title={providerLabel(payment.provider)}
              description={invoice.invoiceNumber}
              action={<PaymentStatusBadge status={payment.status} />}
            />
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* Amount */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400">Monto</p>
                <p className="text-2xl font-bold text-neutral-900">{formatQ(payment.amount)}</p>
              </div>
              {isConfirmed && (
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-semibold">{formatDateTime(payment.confirmedAt)}</span>
                </div>
              )}
            </div>

            {/* Provider reference */}
            {payment.providerReference && (
              <div className="seller-panel-subtle rounded-[var(--seller-radius-lg)] px-4 py-2.5">
                <p className="text-xs text-[var(--seller-soft-text)]">Referencia del proveedor</p>
                <p className="mt-0.5 break-all text-xs font-mono font-semibold text-[var(--seller-text)]">
                  {payment.providerReference}
                </p>
              </div>
            )}

            {/* Failure reason */}
            {isFailed && payment.failureReason && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-red-700">Pago no procesado</p>
                  <p className="text-xs text-red-600 mt-0.5">{payment.failureReason}</p>
                </div>
              </div>
            )}

            {/* Payment link (non-manual, not expired) */}
            {hasLink && !isManual && !linkExpired && !isConfirmed && (
              <Button asChild className="seller-button-primary w-full text-sm font-semibold">
                <a href={payment.paymentLink!} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ir al portal de pago
                </a>
              </Button>
            )}

            {/* Expired link warning */}
            {hasLink && !isManual && linkExpired && !isConfirmed && (
              <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center">
                <Clock className="w-4 h-4 text-amber-500 mx-auto" />
                <p className="text-xs text-amber-700 font-semibold">El enlace de pago expiró</p>
                <p className="text-xs text-amber-600">
                  Regresa a la factura y genera un nuevo intento de pago.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/seller/billing/invoices/${invoice.id}`}>Ver factura</Link>
                </Button>
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
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-800">¡Tu depósito fue aprobado!</p>
              <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
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
// Static display of where to deposit. In production these details
// come from BILLING_CONFIG / admin settings — shown here as UI shell.

function BankInstructions() {
  return (
    <SellerSurfaceCard className="overflow-hidden">
      <SellerPanelHeader
        icon={<Building2 className="w-4 h-4" />}
        title="Instrucciones de depósito"
        className="bg-[var(--seller-panel)]"
      />
      <div className="px-5 py-4 space-y-3">
        <BankRow label="Banco"          value="Banco Industrial" />
        <BankRow label="Tipo de cuenta" value="Monetaria" />
        <BankRow label="Número de cuenta" value="021-000-0000" />
        <BankRow label="Nombre"         value="Flowjuyu, S.A." />
        <BankRow label="NIT"            value="12345678-9" />
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 mt-2">
          <p className="text-xs text-amber-700 leading-relaxed">
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
      <div className="mx-auto max-w-2xl space-y-5 px-4 py-6 animate-pulse">
        <div className="h-4 w-28 bg-neutral-200 rounded-full" />
        <SellerSurfaceCard className="space-y-4 p-5">
          <div className="h-5 w-36 bg-neutral-100 rounded-full" />
          <div className="h-8 w-24 bg-neutral-100 rounded-full" />
        </SellerSurfaceCard>
        <SellerSurfaceCard className="space-y-4 p-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-neutral-100 rounded-lg" />
          ))}
        </SellerSurfaceCard>
      </div>
    </div>
  )
}
