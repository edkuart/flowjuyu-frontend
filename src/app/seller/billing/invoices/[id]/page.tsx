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
  FileText, CreditCard, CheckCircle2,
  Loader2, AlertCircle, ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  SellerActionButton,
  SellerPanelHeader,
  SellerSurfaceCard,
} from "@/components/seller/ui/SellerPrimitives"
import { PageBackNav } from "@/components/ui/PageBackNav"
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
      <div className="flex min-h-screen items-center justify-center bg-[#f8f5ef] p-6">
        <SellerSurfaceCard className="max-w-xs space-y-4 p-6 text-center">
          <AlertCircle className="w-8 h-8 text-neutral-300 mx-auto" />
          <p className="text-sm text-neutral-500">{error ?? "Factura no encontrada."}</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/seller/billing">← Volver a facturación</Link>
          </Button>
        </SellerSurfaceCard>
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
    <div className="min-h-screen bg-[#f8f5ef]">
      <div className="mx-auto max-w-2xl space-y-5 px-4 py-6">

        {/* Back */}
        <PageBackNav
          variant="panel"
          onClick={() => (window.location.href = "/seller/billing")}
          label="Facturación"
          meta="Facturación"
          title={<p className="truncate text-[15px] font-semibold text-[var(--seller-ink)]">Factura {invoice.invoiceNumber}</p>}
        />

        {/* Header card */}
        <SellerSurfaceCard className="overflow-hidden">
          <SellerPanelHeader
            icon={<FileText className="w-4 h-4" />}
            eyebrow="Factura"
            title={invoice.invoiceNumber}
            action={<InvoiceStatusBadge status={invoice.status} />}
            className="bg-[var(--seller-panel)]"
          />

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
        </SellerSurfaceCard>

        {/* Line items */}
        {items.length > 0 && (
          <section className="space-y-2">
            <h2 className="px-1 text-xs font-bold uppercase tracking-wide text-[var(--seller-muted)]">
              Detalle
            </h2>
            <SellerSurfaceCard className="divide-y divide-[var(--seller-line)] overflow-hidden rounded-xl">
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
            </SellerSurfaceCard>
          </section>
        )}

        {/* Payment attempts */}
        {payments.length > 0 && (
          <section className="space-y-2">
            <h2 className="px-1 text-xs font-bold uppercase tracking-wide text-[var(--seller-muted)]">
              Intentos de pago
            </h2>
            <SellerSurfaceCard className="divide-y divide-[var(--seller-line)] overflow-hidden rounded-xl">
              {payments.map((pmt) => (
                <PaymentAttemptRow key={pmt.id} payment={pmt} />
              ))}
            </SellerSurfaceCard>
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
              className="seller-button-primary w-full text-sm font-semibold"
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
    <div className="seller-panel-subtle rounded-lg px-3 py-2.5">
      <p className="text-xs text-[var(--seller-soft-text)]">{label}</p>
      <p className="mt-0.5 text-xs font-semibold text-[var(--seller-text)]">{value}</p>
    </div>
  )
}

function PaymentAttemptRow({ payment }: { payment: PaymentSummary }) {
  return (
    <Link
      href={`/seller/billing/payments/${payment.id}`}
      className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-[var(--seller-panel)]"
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
    <div className="min-h-screen bg-[#f8f5ef]">
      <div className="mx-auto max-w-2xl space-y-5 px-4 py-6 animate-pulse">
        <div className="h-4 w-24 bg-neutral-200 rounded-full" />
        <SellerSurfaceCard className="space-y-4 p-5">
          <div className="h-5 w-40 bg-neutral-100 rounded-full" />
          <div className="h-8 w-28 bg-neutral-100 rounded-full" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-neutral-100 rounded-lg" />
            ))}
          </div>
        </SellerSurfaceCard>
      </div>
    </div>
  )
}
