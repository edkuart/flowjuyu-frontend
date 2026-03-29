"use client"

// src/components/product/ProductStickyBar.tsx
//
// Mobile-only sticky bottom CTA bar.
// Always visible while the user scrolls the PDP.
// Hidden on md+ screens — desktop layout is unchanged.
//
// Reuses ProductContactCTA (compact mode) so all business logic
// (phone parsing, message building, analytics, WhatsApp URL) lives
// in exactly one place.

import { ProductContactCTA, type ProductContactCTAProps } from "./ProductContactCTA"

const formatPrice = (n: number) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 0,
  }).format(n)

type Props = Omit<ProductContactCTAProps, "compact"> & {
  precio: number
}

export function ProductStickyBar({
  precio,
  ...ctaProps
}: Props) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-sm border-t border-neutral-200 px-4 py-3 flex items-center gap-3"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      {/* Price */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-neutral-400 uppercase tracking-wide leading-none mb-0.5">
          Precio
        </p>
        <p className="text-lg font-bold text-[#0d2d20] leading-none tabular-nums truncate">
          {formatPrice(precio)}
        </p>
      </div>

      {/* CTA — reuses all logic from ProductContactCTA */}
      <div className="flex-shrink-0 w-[180px]">
        <ProductContactCTA {...ctaProps} compact />
      </div>
    </div>
  )
}
