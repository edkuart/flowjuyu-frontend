"use client"

// src/components/product/ProductContactCTA.tsx
// Client Component — fires analytics intention on WhatsApp click
import Link from "next/link"
import { MessageCircle, Store } from "lucide-react"

/* ──────────────────────────────────────────
   TYPES
────────────────────────────────────────── */

export interface ProductContactCTAProps {
  productId: string | number
  productNombre: string
  sellerId?: number | string | null
  sellerWhatsapp?: string | null
  /** Only Founder plan sellers with an active plan show WhatsApp */
  sellerPlan?: "free" | "founder"
  sellerPlanActivo?: boolean
  /** href to the seller store page — defaults to /store/{sellerId} */
  storeHref?: string
}

/* ──────────────────────────────────────────
   COMPONENT
────────────────────────────────────────── */

export function ProductContactCTA({
  productId,
  productNombre,
  sellerId,
  sellerWhatsapp,
  sellerPlan,
  sellerPlanActivo,
  storeHref,
}: ProductContactCTAProps) {
  const showWhatsapp =
    !!sellerWhatsapp && sellerPlan === "founder" && sellerPlanActivo === true

  const href = storeHref ?? (sellerId ? `/store/${sellerId}` : null)

  /* ── Analytics + redirect ── */
  async function handleWhatsappClick() {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"}/api/intentions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: productId,
            seller_id: sellerId,
            source: "product_whatsapp",
          }),
        }
      )
    } catch {}

    const mensaje = `Hola 👋\n\nVi esta pieza en Flowjuyu y me interesa:\n"${productNombre}"\n\n¿Sigue disponible? ¿Cómo coordino el envío?`
    window.open(
      `https://wa.me/${sellerWhatsapp}?text=${encodeURIComponent(mensaje)}`,
      "_blank"
    )
  }

  return (
    <div className="space-y-2 pt-1">

      {/* ── Primary CTA ── */}
      {showWhatsapp ? (
        <button
          onClick={handleWhatsappClick}
          className="w-full flex items-center justify-center gap-2 bg-[#0d2d20] text-white text-[11px] uppercase tracking-[0.18em] py-4 hover:bg-[#163a2b] transition-colors duration-200"
        >
          <MessageCircle className="w-4 h-4" />
          Preguntar por esta pieza
        </button>
      ) : href ? (
        <Link href={href} className="block">
          <span className="w-full flex items-center justify-center gap-2 bg-[#0d2d20] text-white text-[11px] uppercase tracking-[0.18em] py-4 hover:bg-[#163a2b] transition-colors duration-200">
            <Store className="w-4 h-4" />
            Preguntar por esta pieza
          </span>
        </Link>
      ) : null}

      {/* ── Secondary CTA — only when WhatsApp is shown ── */}
      {showWhatsapp && href && (
        <Link href={href} className="block">
          <span className="w-full flex items-center justify-center border border-[#0d2d20]/20 text-[#0d0d0b]/70 text-[10px] uppercase tracking-[0.18em] py-3 hover:border-[#0d2d20]/50 hover:text-[#0d0d0b] transition-colors duration-200">
            Ver tienda completa
          </span>
        </Link>
      )}

      {/* ── Shipping note ── */}
      <p className="text-[11px] text-[#0d0d0b]/40 text-center tracking-wide">
        Coordina el envío directamente con el artesano
      </p>
    </div>
  )
}
