// src/app/seller/billing/invoices/[id]/page.tsx
//
// Invoice detail page.
//
// Layout:
//   1. Back navigation
//   2. Invoice header (number, status, amount)
//   3. Line items
//   4. Payment attempts timeline
//   5. "Pagar ahora" CTA (when invoice is open and no active payment)

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, FileText, CreditCard, CheckCircle2,
  Loader2, AlertCircle, ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { InvoiceStatusBadge, PaymentStatusBadge, providerLabel } from "@/components/seller/billing/BillingStatusBadge"
import { formatQ, formatDate, formatDateTime } from "@/components/seller/billing/billingFormatters"
import { fetchInvoiceDetail, createPaymentLink } from "@/services/sellerBilling"
import type { InvoiceDetailFull, PaymentSummary } from "@/types/billing"

export default function InvoiceDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const router   = useRouter()
  const invoiceId = Number(id)

  const [detail,   setDetail]   = useState<InvoiceDetailFull | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)
  const [paying,   setPaying]   = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  useEffect(() => {
    if (!invoiceId) return
    fetchInvoiceDetail(invoiceId)
      .then(setDetail)
      .catch(() => setError("No pudimos cargar la factura."))
      .finally(() => setLoading(false))
  }, [invoiceId])

  // Show loading skeleton
  if (loading) return <PageSkeleton />

  // Error / not found
  if (error || !detail) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-xs">
          <AlertCircle className="w-8 h-8 text-neutral-300 mx-auto" />
          <p className="text-sm text-neutral-500">{error ?? "Factura no encontrada."}</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/seller/billing">← Volver a facturación</Link>
          </Button>
        </div>
      </div>
    )
  }

  const { invoice, items, payments } = detail

  // Can the seller pay now?
  const isOpen = invoice.status === "open"
  const hasActivePayment = payments.some(
    (p) => ["pending", "processing", "manual_pending"].includes(p.status),
  )
  const canPay = isOpen && !hasActivePayment

  // Last confirmed payment
  const confirmedPayment = payments.find((p) => p.status === "confirmed")

  async function handlePay() {
    setPayError(null)
    setPaying(true)
    try {
      // Default to manual (bank transfer) — cleanest flow for Guatemala.
      // Seller can choose a different provider on the payment detail page.
      const result = await createPaymentLink({ invoiceId, provider: "manual" })
      router.push(`/seller/billing/payments/${result.paymentId}`)
    } catch (err: any) {
      setPayError(err.message ?? "Error iniciando el pago.")
      setPaying(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Back */}
        <Link
          href="/seller/billing"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Facturación
        </Link>

        {/* Header card */}
        <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
          <div className="px-5 py-4 bg-neutral-50 border-b border-neutral-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white shadow-sm border border-neutral-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-neutral-500" />
                </div>
                <div>
                  <p className="text-xs text-neutral-400">Factura</p>
                  <p className="text-sm font-bold text-neutral-800">{invoice.invoiceNumber}</p>
                </div>
              </div>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* Amount */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400">Total</p>
                <p className="text-2xl font-bold text-neutral-900">{formatQ(invoice.totalAmount)}</p>
              </div>
              {invoice.status === "paid" && confirmedPayment && (
                <div className="text-right">
                  <p className="text-xs text-neutral-400">Pagado el</p>
                  <p className="text-xs font-semibold text-emerald-700">{formatDateTime(invoice.paidAt)}</p>
                </div>
              )}
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-3">
              <MetaCell label="Vencimiento" value={formatDate(invoice.dueDate)} />
              <MetaCell label="Emitida el"  value={formatDateTime(invoice.createdAt)} />
              {invoice.taxAmount > 0 && (
                <>
                  <MetaCell label="Subtotal" value={formatQ(invoice.subtotalAmount)} />
                  <MetaCell label="Impuesto" value={formatQ(invoice.taxAmount)} />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Line items */}
        {items.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wide px-1">
              Detalle
            </h2>
            <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100">
              {items.map((item) => (
                <div key={item.id} className="px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-800">{item.description}</p>
                      {item.periodStart && item.periodEnd && (
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {formatDate(item.periodStart)} — {formatDate(item.periodEnd)}
                        </p>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-neutral-800 flex-shrink-0">
                      {formatQ(item.totalAmount)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="px-4 py-3 flex items-center justify-between bg-neutral-50">
                <p className="text-xs font-bold text-neutral-500">Total</p>
                <p className="text-sm font-bold text-neutral-900">{formatQ(invoice.totalAmount)}</p>
              </div>
            </div>
          </section>
        )}

        {/* Payment attempts */}
        {payments.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-wide px-1">
              Intentos de pago
            </h2>
            <div className="rounded-xl border border-neutral-200 bg-white divide-y divide-neutral-100">
              {payments.map((pmt) => (
                <PaymentAttemptRow key={pmt.id} payment={pmt} />
              ))}
            </div>
          </section>
        )}

        {/* Pay CTA */}
        {canPay && (
          <div className="space-y-2">
            {payError && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-700">{payError}</p>
              </div>
            )}
            <Button
              onClick={handlePay}
              disabled={paying}
              className="w-full bg-[#0F3D3A] hover:bg-[#0C2F2C] text-white font-semibold text-sm"
            >
              {paying ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Preparando pago…</>
              ) : (
                <><CreditCard className="w-4 h-4 mr-2" /> Pagar ahora — {formatQ(invoice.totalAmount)}</>
              )}
            </Button>
            <p className="text-center text-xs text-neutral-400">
              Podrás elegir el método de pago en el siguiente paso.
            </p>
          </div>
        )}

        {/* Already has active payment */}
        {isOpen && hasActivePayment && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              Ya tienes un pago en proceso para esta factura.
              Puedes ver su estado en la lista de pagos de abajo.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-neutral-50 border border-neutral-100 px-3 py-2.5">
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="text-xs font-semibold text-neutral-700 mt-0.5">{value}</p>
    </div>
  )
}

function PaymentAttemptRow({ payment }: { payment: PaymentSummary }) {
  return (
    <Link
      href={`/seller/billing/payments/${payment.id}`}
      className="flex items-center gap-4 px-4 py-3.5 hover:bg-neutral-50 transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-neutral-700">{providerLabel(payment.provider)}</p>
          <PaymentStatusBadge status={payment.status} />
        </div>
        <p className="text-xs text-neutral-400 mt-0.5">{formatDateTime(payment.createdAt)}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <p className="text-sm font-semibold text-neutral-700">{formatQ(payment.amount)}</p>
        <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
      </div>
    </Link>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 animate-pulse">
        <div className="h-4 w-24 bg-neutral-200 rounded-full" />
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4">
          <div className="h-5 w-40 bg-neutral-100 rounded-full" />
          <div className="h-8 w-28 bg-neutral-100 rounded-full" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-neutral-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
