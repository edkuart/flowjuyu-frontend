// src/app/seller/billing/page.tsx
//
// Main seller billing hub.
//
// Layout (mobile-first, single column):
//   1. Page header
//   2. BillingSubscriptionCard  ← hero, always visible
//   3. Tabs: "Facturas" | "Pagos"
//   4. Tab content (list components)

"use client"

import { useEffect, useState } from "react"
import { CreditCard, Receipt } from "lucide-react"
import { BillingSubscriptionCard } from "@/components/seller/billing/BillingSubscriptionCard"
import { BillingInvoiceList } from "@/components/seller/billing/BillingInvoiceList"
import { BillingPaymentList } from "@/components/seller/billing/BillingPaymentList"
import { SellerSurfaceCard } from "@/components/seller/ui/SellerPrimitives"
import { fetchCurrentSubscription } from "@/services/sellerBilling"
import type { CurrentSubscription } from "@/types/billing"

type Tab = "invoices" | "payments"

export default function SellerBillingPage() {
  const [subscription, setSubscription] = useState<CurrentSubscription | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [activeTab,    setActiveTab]    = useState<Tab>("invoices")

  useEffect(() => {
    fetchCurrentSubscription()
      .then(setSubscription)
      .catch(() => setSubscription(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#f8f5ef]">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-[var(--seller-accent)] uppercase">
            Facturación · Flowjuyu Seller
          </p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--seller-ink)] sm:text-[28px] sm:leading-[1.05]">
            Mi suscripción
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--seller-muted)]">
            Gestiona tu plan, facturas y pagos desde una misma vista.
          </p>
        </div>

        <BillingSubscriptionCard subscription={subscription} loading={loading} />

        <SellerSurfaceCard className="overflow-hidden">
          <div className="flex gap-1 border-b border-[var(--seller-line)] px-3 pt-3">
            <TabButton
              active={activeTab === "invoices"}
              onClick={() => setActiveTab("invoices")}
              icon={<Receipt className="w-3.5 h-3.5" />}
              label="Facturas"
            />
            <TabButton
              active={activeTab === "payments"}
              onClick={() => setActiveTab("payments")}
              icon={<CreditCard className="w-3.5 h-3.5" />}
              label="Pagos"
            />
          </div>

          <div className="p-4 sm:p-5">
            {activeTab === "invoices" && <BillingInvoiceList />}
            {activeTab === "payments" && <BillingPaymentList />}
          </div>
        </SellerSurfaceCard>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active:  boolean
  onClick: () => void
  icon:    React.ReactNode
  label:   string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-t-[var(--seller-radius-md)] border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "border-[var(--seller-accent)] bg-[color:color-mix(in_srgb,var(--seller-accent)_6%,white)] text-[var(--seller-accent)]"
          : "border-transparent text-[var(--seller-muted)] hover:text-[var(--seller-ink)]"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
