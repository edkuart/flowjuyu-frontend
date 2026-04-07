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
import { Receipt, CreditCard } from "lucide-react"
import { BillingSubscriptionCard } from "@/components/seller/billing/BillingSubscriptionCard"
import { BillingInvoiceList }      from "@/components/seller/billing/BillingInvoiceList"
import { BillingPaymentList }      from "@/components/seller/billing/BillingPaymentList"
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
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Page header */}
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Mi suscripción</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            Gestiona tu plan, facturas y pagos.
          </p>
        </div>

        {/* Subscription hero card */}
        <BillingSubscriptionCard subscription={subscription} loading={loading} />

        {/* Tabs */}
        <div>
          <div className="flex border-b border-neutral-200 gap-1">
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

          <div className="mt-4">
            {activeTab === "invoices" && <BillingInvoiceList />}
            {activeTab === "payments" && <BillingPaymentList />}
          </div>
        </div>

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
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
        active
          ? "border-[#0F3D3A] text-[#0F3D3A]"
          : "border-transparent text-neutral-500 hover:text-neutral-700"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
