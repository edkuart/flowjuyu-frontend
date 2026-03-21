"use client"

// src/components/product/ProductContactCTA.tsx
import { MessageCircle } from "lucide-react"

export interface ProductContactCTAProps {
  productId: string | number
  productNombre: string
  internalCode?: string | null
  productUrl?: string | null
  sellerWhatsapp?: string | null
}

export function ProductContactCTA({
  productId,
  productNombre,
  internalCode,
  productUrl,
  sellerWhatsapp,
}: ProductContactCTAProps) {
  if (!sellerWhatsapp) {
    return (
      <p className="text-[11px] text-[#0d0d0b]/40 text-center py-2">
        Este vendedor aún no tiene WhatsApp disponible
      </p>
    )
  }

  // Strip everything except digits (handles +502-XXXX-XXXX formats)
  const cleanPhone = sellerWhatsapp.replace(/\D/g, "")

  async function handleWhatsappClick() {
    // Fire-and-forget analytics
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"}/api/intentions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: productId,
            source: "product_whatsapp",
          }),
        }
      )
    } catch {}

    const codeLine = internalCode ? `\nCódigo: ${internalCode}` : ""
    const urlLine  = productUrl    ? `\nLink: ${productUrl}`    : ""
    const message  =
      `Hola, estoy interesado en este producto:\n\n` +
      `Producto: ${productNombre}` +
      codeLine +
      urlLine +
      `\n\n¿Sigue disponible?`

    window.open(
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
      "_blank"
    )
  }

  return (
    <div className="space-y-2 pt-1">
      <button
        onClick={handleWhatsappClick}
        className="w-full flex items-center justify-center gap-2 bg-[#0d2d20] text-white text-[11px] uppercase tracking-[0.18em] py-4 hover:bg-[#163a2b] transition-colors duration-200"
      >
        <MessageCircle className="w-4 h-4" />
        Preguntar por esta pieza
      </button>

      <p className="text-[11px] text-[#0d0d0b]/40 text-center tracking-wide">
        Coordina el envío directamente con el artesano
      </p>
    </div>
  )
}
