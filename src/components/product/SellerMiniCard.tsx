// src/components/product/SellerMiniCard.tsx
// Server Component — no interactivity needed
import Image from "next/image"
import Link from "next/link"
import { ShieldCheck } from "lucide-react"

/* ──────────────────────────────────────────
   TYPES
────────────────────────────────────────── */

export interface SellerMiniCardProps {
  sellerId?: number | string | null
  sellerNombre?: string | null
  sellerLogo?: string | null
  /** If false (e.g. estado_validacion !== "aprobado"), hides the verified badge */
  verified?: boolean
  /** href to the seller store page — defaults to /store/{sellerId} */
  storeHref?: string
}

/* ──────────────────────────────────────────
   COMPONENT
────────────────────────────────────────── */

export function SellerMiniCard({
  sellerId,
  sellerNombre,
  sellerLogo,
  verified = true,
  storeHref,
}: SellerMiniCardProps) {
  if (!sellerNombre && !sellerId) return null

  const logoSrc =
    sellerLogo && sellerLogo.startsWith("http")
      ? sellerLogo
      : "/images/tiendas/default.jpg"

  const href = storeHref ?? (sellerId ? `/store/${sellerId}` : null)

  return (
    <div className="flex items-center gap-3 py-3 px-4 bg-[#f6f2ea] border border-[#0d2d20]/10 rounded-sm">

      {/* Avatar */}
      <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-[#0d2d20]/10 bg-[#0d2d20]/10 flex items-center justify-center">
        {sellerLogo ? (
          <Image
            src={logoSrc}
            alt={sellerNombre ?? "Artesano"}
            fill
            className="object-cover"
          />
        ) : (
          <span className="text-[11px] font-bold text-[#0d2d20] uppercase leading-none">
            {(sellerNombre ?? "A").charAt(0)}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-[#0d0d0b] leading-tight truncate">
          {sellerNombre ?? "Tienda artesanal"}
        </p>
        {verified && (
          <div className="flex items-center gap-1 mt-[2px]">
            <ShieldCheck className="w-3 h-3 text-[#0d2d20]" />
            <span className="text-[10px] text-[#0d2d20] uppercase tracking-[0.18em]">
              Verificado por Flowjuyu
            </span>
          </div>
        )}
      </div>

      {/* Store link */}
      {href && (
        <Link
          href={href}
          className="text-[10px] uppercase tracking-[0.20em] text-[#0d0d0b]/40 hover:text-[#0d2d20] transition flex-shrink-0"
        >
          Ver tienda →
        </Link>
      )}
    </div>
  )
}
