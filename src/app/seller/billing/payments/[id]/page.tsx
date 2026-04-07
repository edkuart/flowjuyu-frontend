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
  ArrowLeft, CreditCard, CheckCircle2, AlertCircle,
  ExternalLink, Building2, Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-xs">
          <AlertCircle className="w-8 h-8 text-neutral-300 mx-auto" />
          <p className="text-sm text-neutral-500">{error ?? "Pago no encontrado."}</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/seller/billing">← Volver a facturación</Link>
          </Button>
        </div>
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
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Back */}
        <Link
          href={`/seller/billing/invoices/${invoice.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Factura {invoice.invoiceNumber}
        </Link>

        {/* Payment status card */}
        <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
          <div className={`px-5 py-4 border-b border-neutral-100 ${
            isConfirmed ? "bg-emerald-50"
            : isFailed  ? "bg-red-50"
            : isManual  ? "bg-amber-50"
            : "bg-neutral-50"
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white shadow-sm border border-neutral-100 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-neutral-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-800">{providerLabel(payment.provider)}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{invoice.invoiceNumber}</p>
                </div>
              </div>
              <PaymentStatusBadge status={payment.status} />
            </div>
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
              <div className="rounded-lg bg-neutral-50 border border-neutral-100 px-4 py-2.5">
                <p className="text-xs text-neutral-400">Referencia del proveedor</p>
                <p className="text-xs font-mono font-semibold text-neutral-700 mt-0.5 break-all">
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
              <Button asChild className="w-full bg-[#0F3D3A] hover:bg-[#0C2F2C] text-white font-semibold text-sm">
                <a href={payment.paymentLink!} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ir al portal de pago
                </a>
              </Button>
            )}

            {/* Expired link warning */}
            {hasLink && !isManual && linkExpired && !isConfirmed && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-center space-y-2">
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
        </div>

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
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 flex items-start gap-3">
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
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50 flex items-center gap-2">
        <Building2 className="w-4 h-4 text-neutral-500" />
        <h3 className="text-sm font-bold text-neutral-800">Instrucciones de depósito</h3>
      </div>
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
    </div>
  )
}

function BankRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-500 text-xs">{label}</span>
      <span className="font-semibold text-neutral-800">{value}</span>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 animate-pulse">
        <div className="h-4 w-28 bg-neutral-200 rounded-full" />
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4">
          <div className="h-5 w-36 bg-neutral-100 rounded-full" />
          <div className="h-8 w-24 bg-neutral-100 rounded-full" />
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-neutral-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
