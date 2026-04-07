// src/components/seller/billing/BillingPaymentList.tsx
//
// Paginated payment attempt history for the seller billing page.

"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { CreditCard, ChevronRight, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/EmptyState"
import { PaymentStatusBadge, ReportStatusBadge, providerLabel } from "./BillingStatusBadge"
import { formatQ, formatDateTime } from "./billingFormatters"
import { fetchPayments } from "@/services/sellerBilling"
import type { PaymentListItem } from "@/types/billing"

const PAGE_SIZE = 10

function PaymentRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 animate-pulse">
      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-36 bg-neutral-100 rounded-full" />
        <div className="h-2.5 w-24 bg-neutral-100 rounded-full" />
      </div>
      <div className="h-3.5 w-16 bg-neutral-100 rounded-full" />
    </div>
  )
}

const PROVIDER_ICON: Record<string, string> = {
  bac:    "🏦",
  paypal: "🅿️",
  manual: "💵",
}

function PaymentRow({ payment }: { payment: PaymentListItem }) {
  const isConfirmed = payment.status === "confirmed"
  const needsAction = payment.status === "pending" || payment.status === "manual_pending"

  return (
    <Link
      href={`/seller/billing/payments/${payment.id}`}
      className="flex items-center gap-4 px-4 py-3.5 hover:bg-neutral-50 transition-colors group"
    >
      {/* Provider icon */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base ${
        needsAction ? "bg-amber-50" : "bg-neutral-100"
      }`}>
        {PROVIDER_ICON[payment.provider] ?? "💳"}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-neutral-800 truncate">
            {providerLabel(payment.provider)}
          </p>
          <PaymentStatusBadge status={payment.status} />
          {payment.reportStatus && (
            <ReportStatusBadge status={payment.reportStatus} />
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-400">
          <span>{payment.invoiceNumber}</span>
          <span>·</span>
          <span>{formatDateTime(payment.createdAt)}</span>
        </div>
      </div>

      {/* Amount + arrow */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <p className={`text-sm font-bold ${isConfirmed ? "text-emerald-700" : "text-neutral-800"}`}>
          {formatQ(payment.amount)}
        </p>
        <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
      </div>
    </Link>
  )
}

export function BillingPaymentList() {
  const [payments, setPayments] = useState<PaymentListItem[]>([])
  const [total,    setTotal]    = useState(0)
  const [offset,   setOffset]   = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  const load = useCallback(async (off: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchPayments({ limit: PAGE_SIZE, offset: off })
      setPayments(off === 0 ? res.payments : (prev) => [...prev, ...res.payments])
      setTotal(res.total)
      setOffset(off)
    } catch {
      setError("No pudimos cargar tus pagos.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(0) }, [load])

  const hasMore = offset + PAGE_SIZE < total

  if (loading && payments.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden divide-y divide-neutral-100">
        {Array.from({ length: 3 }).map((_, i) => <PaymentRowSkeleton key={i} />)}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center space-y-3">
        <p className="text-sm text-neutral-500">{error}</p>
        <Button variant="outline" size="sm" onClick={() => load(0)}>
          <RefreshCw className="w-3.5 h-3.5 mr-2" /> Reintentar
        </Button>
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white">
        <EmptyState
          icon={CreditCard}
          title="Sin pagos aún"
          description="Tus intentos de pago aparecerán aquí."
        />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
      <div className="divide-y divide-neutral-100">
        {payments.map((pmt) => <PaymentRow key={pmt.id} payment={pmt} />)}
      </div>

      {hasMore && (
        <div className="px-4 py-3 border-t border-neutral-100 text-center">
          <Button
            variant="ghost"
            size="sm"
            disabled={loading}
            onClick={() => load(offset + PAGE_SIZE)}
            className="text-xs text-neutral-500"
          >
            {loading
              ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Cargando…</>
              : `Ver más (${total - payments.length} restantes)`}
          </Button>
        </div>
      )}
    </div>
  )
}
