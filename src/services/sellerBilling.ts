// src/services/sellerBilling.ts
//
// API service layer for seller billing.
// All functions call authenticated endpoints under /api/seller/billing.
// Throws an Error on non-ok responses so callers can handle it uniformly.

import { apiFetch } from "@/lib/api"
import type {
  CurrentSubscription,
  InvoiceListResponse,
  InvoiceDetailFull,
  PaymentListResponse,
  PaymentDetailFull,
  ManualReport,
  BillingCycle,
  BillingProvider,
} from "@/types/billing"

const BASE = "/api/seller/billing"

// ─── Subscriptions ────────────────────────────────────────────────────────────

export async function fetchCurrentSubscription(): Promise<CurrentSubscription | null> {
  const res = await apiFetch(`${BASE}/subscriptions/current`)
  if (!res.ok) throw new Error("Error cargando tu suscripción")
  const data = await res.json()
  return data.subscription as CurrentSubscription | null
}

export async function createSubscription(body: {
  planId:       number
  billingCycle: BillingCycle
  autoRenew?:   boolean
}): Promise<{ subscriptionId: number; invoiceId: number }> {
  const res = await apiFetch(`${BASE}/subscriptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).message || "Error al seleccionar el plan")
  }
  const data = await res.json()
  return { subscriptionId: data.subscription.id, invoiceId: data.invoice.id }
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export async function fetchInvoices(params?: {
  status?:  string
  limit?:   number
  offset?:  number
}): Promise<InvoiceListResponse> {
  const qs = new URLSearchParams()
  if (params?.status)           qs.set("status",  params.status)
  if (params?.limit  != null)   qs.set("limit",   String(params.limit))
  if (params?.offset != null)   qs.set("offset",  String(params.offset))
  const query = qs.toString()
  const res = await apiFetch(`${BASE}/invoices${query ? `?${query}` : ""}`)
  if (!res.ok) throw new Error("Error cargando facturas")
  return res.json()
}

export async function fetchInvoiceDetail(invoiceId: number): Promise<InvoiceDetailFull> {
  const res = await apiFetch(`${BASE}/invoices/${invoiceId}`)
  if (!res.ok) throw new Error("Factura no encontrada")
  const data = await res.json()
  return { invoice: data.invoice, items: data.items, payments: data.payments }
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export async function fetchPayments(params?: {
  status?:    string
  invoiceId?: number
  limit?:     number
  offset?:    number
}): Promise<PaymentListResponse> {
  const qs = new URLSearchParams()
  if (params?.status)           qs.set("status",    params.status)
  if (params?.invoiceId != null) qs.set("invoiceId", String(params.invoiceId))
  if (params?.limit  != null)   qs.set("limit",     String(params.limit))
  if (params?.offset != null)   qs.set("offset",    String(params.offset))
  const query = qs.toString()
  const res = await apiFetch(`${BASE}/payments${query ? `?${query}` : ""}`)
  if (!res.ok) throw new Error("Error cargando pagos")
  return res.json()
}

export async function fetchPaymentDetail(paymentId: number): Promise<PaymentDetailFull> {
  const res = await apiFetch(`${BASE}/payments/${paymentId}`)
  if (!res.ok) throw new Error("Pago no encontrado")
  const data = await res.json()
  return { payment: data.payment, invoice: data.invoice, manualReport: data.manualReport }
}

export async function createPaymentLink(body: {
  invoiceId: number
  provider:  BillingProvider
}): Promise<{
  paymentId:   number
  paymentLink: string | null
  instructions: Record<string, unknown> | null
}> {
  const res = await apiFetch(`${BASE}/payment-links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).message || "Error generando método de pago")
  }
  const data = await res.json()
  return {
    paymentId:    data.paymentId,
    paymentLink:  data.paymentLink,
    instructions: data.instructions,
  }
}

// ─── Manual payment reports ───────────────────────────────────────────────────

export async function reportManualPayment(body: {
  paymentId:        number
  bankName:         string
  depositReference: string
  depositorName:    string
  depositDate:      string
  reportedAmount:   number
  currency:         string
  receiptFileUrl?:  string | null
}): Promise<ManualReport> {
  const res = await apiFetch(`${BASE}/manual-payment-reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, currency: body.currency || "GTQ" }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).message || "Error enviando reporte de depósito")
  }
  const data = await res.json()
  return data.report as ManualReport
}
