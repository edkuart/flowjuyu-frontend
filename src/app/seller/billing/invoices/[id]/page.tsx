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
  Loader2, AlertCircle, ChevronRight, ChevronLeft,
} from "lucide-react"
import {
  SellerSurfaceCard,
} from "@/components/seller/ui/SellerPrimitives"
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

  if (loading) return <PageSkeleton />

  if (error || !detail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f5ef] p-6">
        <SellerSurfaceCard className="max-w-xs space-y-4 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-[var(--seller-line-strong)]" />
          <p className="text-sm text-[var(--seller-muted)]">{error ?? "Factura no encontrada."}</p>
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

  const { invoice, items, payments } = detail

  const isOpen = invoice.status === "open"
  const hasActivePayment = payments.some(
    (p) => ["pending", "processing", "manual_pending"].includes(p.status),
  )
  const canPay = isOpen && !hasActivePayment
  const confirmedPayment = payments.find((p) => p.status === "confirmed")

  async function handlePay() {
    setPayError(null)
    setPaying(true)
    try {
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
        <button
          onClick={() => (window.location.href = "/seller/billing")}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--seller-muted)] transition hover:text-[var(--seller-ink)]"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Facturación
        </button>

        {/* Header card */}
        <SellerSurfaceCard className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--seller-line)] bg-[var(--seller-panel)] px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[color:color-mix(in_srgb,var(--seller-accent)_8%,white)] text-[var(--seller-accent)]">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--seller-faint-text)]">Factura</p>
                <p className="text-sm font-semibold text-[var(--seller-ink)]">{invoice.invoiceNumber}</p>
              </div>
            </div>
            <InvoiceStatusBadge status={invoice.status} />
          </div>

          <div className="space-y-4 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--seller-muted)]">Total</p>
                <p className="text-2xl font-bold text-[var(--seller-ink)]">{formatQ(invoice.totalAmount)}</p>
              </div>
              {invoice.status === "paid" && confirmedPayment && (
                <div className="text-right">
                  <p className="text-xs text-[var(--seller-muted)]">Pagado el</p>
                  <p className="text-xs font-semibold text-emerald-700">{formatDateTime(invoice.paidAt)}</p>
                </div>
              )}
            </div>

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
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[var(--seller-ink)]">{item.description}</p>
                      {item.periodStart && item.periodEnd && (
                        <p className="mt-0.5 text-xs text-[var(--seller-muted)]">
                          {formatDate(item.periodStart)} — {formatDate(item.periodEnd)}
                        </p>
                      )}
                    </div>
                    <p className="flex-shrink-0 text-sm font-semibold text-[var(--seller-ink)]">
                      {formatQ(item.totalAmount)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between bg-[var(--seller-panel)] px-4 py-3">
                <p className="text-xs font-bold text-[var(--seller-muted)]">Total</p>
                <p className="text-sm font-bold text-[var(--seller-ink)]">{formatQ(invoice.totalAmount)}</p>
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
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                <p className="text-xs text-red-700">{payError}</p>
              </div>
            )}
            <button
              onClick={handlePay}
              disabled={paying}
              className="group relative w-full overflow-hidden rounded-2xl bg-[var(--seller-accent)] px-5 py-3 text-sm font-semibold text-white transition disabled:opacity-60"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {paying ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Preparando pago…</>
                ) : (
                  <><CreditCard className="h-4 w-4" /> Pagar ahora — {formatQ(invoice.totalAmount)}</>
                )}
              </span>
              <span className="absolute inset-0 translate-x-[-100%] bg-white/10 transition-transform duration-300 group-hover:translate-x-full" />
            </button>
            <p className="text-center text-xs text-[var(--seller-muted)]">
              Podrás elegir el método de pago en el siguiente paso.
            </p>
          </div>
        )}

        {/* Already has active payment */}
        {isOpen && hasActivePayment && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
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
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-[var(--seller-ink)]">{providerLabel(payment.provider)}</p>
          <PaymentStatusBadge status={payment.status} />
        </div>
        <p className="mt-0.5 text-xs text-[var(--seller-muted)]">{formatDateTime(payment.createdAt)}</p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        <p className="text-sm font-semibold text-[var(--seller-ink)]">{formatQ(payment.amount)}</p>
        <ChevronRight className="h-4 w-4 text-[var(--seller-line-strong)] transition-colors group-hover:text-[var(--seller-muted)]" />
      </div>
    </Link>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8f5ef]">
      <div className="mx-auto max-w-2xl animate-pulse space-y-5 px-4 py-6">
        <div className="h-4 w-24 rounded-full bg-neutral-200" />
        <SellerSurfaceCard className="space-y-4 p-5">
          <div className="h-5 w-40 rounded-full bg-neutral-100" />
          <div className="h-8 w-28 rounded-full bg-neutral-100" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-neutral-100" />
            ))}
          </div>
        </SellerSurfaceCard>
      </div>
    </div>
  )
}
