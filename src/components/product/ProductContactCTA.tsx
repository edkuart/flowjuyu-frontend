"use client"

// src/components/product/ProductContactCTA.tsx
import { useCallback, useState } from "react"
import WhatsAppModal from "@/components/product/WhatsAppModal"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://flowjuyu.com"

export interface ProductContactCTAProps {
  productId:      string | number
  productNombre:  string
  productPrecio?: number
  productImagen?: string | null
  internalCode?:  string | null
  productUrl?:    string | null
  sellerWhatsapp?: string | null
  sellerNombre?:  string | null
}

/**
 * Extracts a valid E.164-style phone number from any input:
 * - wa.me/50212345678  → "50212345678"
 * - +502 1234-5678     → "50212345678"
 * - raw digits         → as-is if ≥ 8 digits
 * Returns null when no valid phone can be determined.
 */
function extractPhone(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null
  // If it's already a wa.me URL, pull the phone segment from the path
  const waMatch = raw.match(/wa\.me\/(\d{6,})/)
  if (waMatch) return waMatch[1]
  // Strip everything that isn't a digit
  const digits = raw.replace(/\D/g, "")
  return digits.length >= 8 ? digits : null
}

const WA_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export function ProductContactCTA({
  productId,
  productNombre,
  productPrecio,
  productImagen,
  internalCode,
  productUrl,
  sellerWhatsapp,
  sellerNombre,
}: ProductContactCTAProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const cleanPhone = extractPhone(sellerWhatsapp)
  const hasPhone   = Boolean(cleanPhone)

  // Always use an absolute URL in the message so the link works on any device
  const canonicalUrl = productUrl
    ? productUrl.startsWith("http")
      ? productUrl
      : `${SITE_URL}${productUrl}`
    : undefined

  const buildMessage = useCallback(() => {
    const codeLine = internalCode   ? `\nCódigo: ${internalCode}` : ""
    const urlLine  = canonicalUrl   ? `\nLink: ${canonicalUrl}`   : ""
    return (
      `Hola, estoy interesado en este producto:\n\n` +
      `Producto: ${productNombre}` +
      codeLine +
      urlLine +
      `\n\n¿Sigue disponible?`
    )
  }, [productNombre, internalCode, canonicalUrl])

  async function fireAnalytics() {
    try {
      await fetch(`${API_BASE}/api/intentions`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId, source: "product_whatsapp" }),
      })
    } catch {}
  }

  // Called from the modal after the user optionally edits the message
  function handleConfirm(message: string) {
    setModalOpen(false)
    fireAnalytics()
    // wa.me/<phone>?text=<message> → opens direct chat with the seller, no contact picker
    window.open(
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  // Secondary action: share the product link (not a direct chat)
  async function handleShare() {
    const shareUrl = canonicalUrl ?? (typeof window !== "undefined" ? window.location.href : "")
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: productNombre, url: shareUrl })
        return
      } catch {
        // user cancelled or API unsupported — fall through
      }
    }
    // Fallback: intentional share flow (no phone — user picks contact)
    const text = `${productNombre}${internalCode ? ` (${internalCode})` : ""} — ${shareUrl}`
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  return (
    <>
      <div className="space-y-2 pt-1">

        {/* PRIMARY — direct chat with seller */}
        {hasPhone ? (
          <button
            onClick={() => setModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-[#0d2d20] text-white text-[11px] uppercase tracking-[0.18em] py-4 hover:bg-[#163a2b] transition-colors duration-200"
          >
            {WA_ICON}
            Preguntar por esta pieza
          </button>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 bg-[#0d2d20]/25 text-white/50 text-[11px] uppercase tracking-[0.18em] py-4 cursor-not-allowed select-none">
            {WA_ICON}
            Preguntar por esta pieza
          </div>
        )}

        {/* SECONDARY — share the product link */}
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 border border-[#0d2d20]/20 text-[#0d2d20]/70 text-[11px] uppercase tracking-[0.18em] py-3 hover:bg-[#0d2d20]/5 transition-colors duration-200"
        >
          Compartir
        </button>

        {/* Contextual copy */}
        <p className="text-[11px] text-[#0d0d0b]/40 text-center tracking-wide">
          {hasPhone
            ? "El artesano responde directo"
            : "Este vendedor aún no tiene WhatsApp disponible"}
        </p>

      </div>

      {/* Modal — only rendered when there's a valid phone */}
      {hasPhone && (
        <WhatsAppModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleConfirm}
          product={{
            nombre: productNombre,
            precio: productPrecio ?? 0,
            imagen: productImagen,
          }}
          seller={{ nombre: sellerNombre ?? null }}
          initialMessage={buildMessage()}
        />
      )}
    </>
  )
}
