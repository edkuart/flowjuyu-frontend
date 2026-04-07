// src/types/billing.ts
//
// TypeScript DTOs matching sellerBilling.controller.ts serializers exactly.
// Only include fields the backend actually returns — never invent fields.

export type SubscriptionStatus = "draft" | "active" | "past_due" | "expired" | "cancelled" | "paused"
export type BillingCycle       = "monthly" | "yearly"
export type InvoiceStatus      = "draft" | "open" | "paid" | "void" | "uncollectible"
export type InvoiceType        = "subscription" | "extra" | "manual"
export type BillingProvider    = "bac" | "paypal" | "manual"
export type PaymentStatus      =
  | "pending"
  | "processing"
  | "confirmed"
  | "failed"
  | "cancelled"
  | "expired"
  | "manual_pending"
export type ReportStatus = "submitted" | "under_review" | "approved" | "rejected"

// ─── Subscription ─────────────────────────────────────────────────────────────

export interface SubscriptionPlan {
  id:                  number
  name:                string
  slug:                string
  maxProducts:         number
  maxPhotosPerProduct: number
}

export interface CurrentSubscription {
  id:                 number
  status:             SubscriptionStatus
  plan:               SubscriptionPlan
  billingCycle:       BillingCycle
  priceAtSignup:      number
  currency:           string
  currentPeriodStart: string | null
  currentPeriodEnd:   string | null
  gracePeriodEnd:     string | null
  autoRenew:          boolean
  daysUntilRenewal:   number | null
  isExpiringSoon:     boolean
  createdAt:          string
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export interface InvoiceLatestPayment {
  id:       number
  provider: BillingProvider
  status:   PaymentStatus
}

export interface InvoiceListItem {
  id:             number
  invoiceNumber:  string
  type:           InvoiceType
  status:         InvoiceStatus
  totalAmount:    number
  currency:       string
  dueDate:        string
  paidAt:         string | null
  createdAt:      string
  latestPayment:  InvoiceLatestPayment | null
}

export interface InvoiceItem {
  id:          number
  description: string
  quantity:    number
  unitAmount:  number
  totalAmount: number
  periodStart: string | null
  periodEnd:   string | null
}

export interface InvoiceDetail {
  id:             number
  invoiceNumber:  string
  subscriptionId: number | null
  type:           InvoiceType
  status:         InvoiceStatus
  subtotalAmount: number
  taxAmount:      number
  totalAmount:    number
  currency:       string
  dueDate:        string
  paidAt:         string | null
  createdAt:      string
}

export interface PaymentSummary {
  id:          number
  provider:    BillingProvider
  status:      PaymentStatus
  amount:      number
  currency:    string
  confirmedAt: string | null
  createdAt:   string
}

export interface InvoiceDetailFull {
  invoice:  InvoiceDetail
  items:    InvoiceItem[]
  payments: PaymentSummary[]
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export interface PaymentListItem {
  id:            number
  invoiceId:     number
  invoiceNumber: string
  provider:      BillingProvider
  status:        PaymentStatus
  amount:        number
  currency:      string
  confirmedAt:   string | null
  createdAt:     string
  reportStatus:  ReportStatus | null
}

export interface ManualReport {
  id:               number
  paymentId:        number
  invoiceId:        number
  bankName:         string
  depositReference: string
  depositorName:    string
  depositDate:      string
  reportedAmount:   number
  currency:         string
  receiptFileUrl:   string | null
  status:           ReportStatus
  rejectionReason:  string | null
  reviewedAt:       string | null
  createdAt:        string
}

export interface PaymentDetail {
  id:                  number
  invoiceId:           number
  provider:            BillingProvider
  status:              PaymentStatus
  amount:              number
  currency:            string
  paymentLink:         string | null
  linkExpiresAt:       string | null
  providerReference:   string | null
  paymentMethodDetail: string | null
  confirmedAt:         string | null
  failureReason:       string | null
  createdAt:           string
}

export interface PaymentDetailFull {
  payment:      PaymentDetail
  invoice:      InvoiceDetail
  manualReport: ManualReport | null
}

// ─── List responses ───────────────────────────────────────────────────────────

export interface InvoiceListResponse {
  ok:       boolean
  total:    number
  limit:    number
  offset:   number
  invoices: InvoiceListItem[]
}

export interface PaymentListResponse {
  ok:       boolean
  total:    number
  limit:    number
  offset:   number
  payments: PaymentListItem[]
}
