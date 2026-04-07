// src/components/seller/billing/BillingInvoiceList.tsx
//
// Paginated invoice history list for the seller billing page.
// Shows invoice number, status, amount, and a quick link to detail.
// Mobile: single column, tap-to-open rows.
// Desktop: wider row with all data visible.

"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { FileText, ChevronRight, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/EmptyState"
import { InvoiceStatusBadge, PaymentStatusBadge, providerLabel } from "./BillingStatusBadge"
import { formatQ, formatDate } from "./billingFormatters"
import { fetchInvoices } from "@/services/sellerBilling"
import type { InvoiceListItem } from "@/types/billing"

const PAGE_SIZE = 10

function InvoiceRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3.5 animate-pulse">
      <div className="w-8 h-8 rounded-lg bg-neutral-100 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-32 bg-neutral-100 rounded-full" />
        <div className="h-2.5 w-20 bg-neutral-100 rounded-full" />
      </div>
      <div className="h-3.5 w-16 bg-neutral-100 rounded-full" />
    </div>
  )
}

function InvoiceRow({ invoice }: { invoice: InvoiceListItem }) {
  const isOpen = invoice.status === "open"

  return (
    <Link
      href={`/seller/billing/invoices/${invoice.id}`}
      className="flex items-center gap-4 px-4 py-3.5 hover:bg-neutral-50 transition-colors group"
    >
      {/* Icon */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        isOpen ? "bg-amber-50" : "bg-neutral-100"
      }`}>
        <FileText className={`w-4 h-4 ${isOpen ? "text-amber-600" : "text-neutral-400"}`} />
      </div>

      {/* Left content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-neutral-800 truncate">
            {invoice.invoiceNumber}
          </p>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <p className="text-xs text-neutral-400">
            Vence: {formatDate(invoice.dueDate)}
          </p>
          {invoice.latestPayment && (
            <>
              <span className="text-neutral-200">·</span>
              <PaymentStatusBadge status={invoice.latestPayment.status} />
            </>
          )}
        </div>
      </div>

      {/* Amount + arrow */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <p className="text-sm font-bold text-neutral-800">{formatQ(invoice.totalAmount)}</p>
        <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
      </div>
    </Link>
  )
}

export function BillingInvoiceList() {
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([])
  const [total,    setTotal]    = useState(0)
  const [offset,   setOffset]   = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  const load = useCallback(async (off: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchInvoices({ limit: PAGE_SIZE, offset: off })
      setInvoices(off === 0 ? res.invoices : (prev) => [...prev, ...res.invoices])
      setTotal(res.total)
      setOffset(off)
    } catch {
      setError("No pudimos cargar tus facturas.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(0) }, [load])

  const hasMore = offset + PAGE_SIZE < total

  if (loading && invoices.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden divide-y divide-neutral-100">
        {Array.from({ length: 3 }).map((_, i) => <InvoiceRowSkeleton key={i} />)}
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

  if (invoices.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white">
        <EmptyState
          icon={FileText}
          title="Sin facturas aún"
          description="Tus facturas aparecerán aquí cuando actives tu plan."
        />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
      <div className="divide-y divide-neutral-100">
        {invoices.map((inv) => <InvoiceRow key={inv.id} invoice={inv} />)}
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
              : `Ver más (${total - invoices.length} restantes)`}
          </Button>
        </div>
      )}
    </div>
  )
}
