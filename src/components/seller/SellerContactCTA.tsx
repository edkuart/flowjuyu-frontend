// src/components/seller/SellerContactCTA.tsx
// Server Component — renders anchor/button, no client state needed
import { MessageCircle, Send } from "lucide-react"

/* ──────────────────────────────────────────
   TYPES
────────────────────────────────────────── */

export interface SellerContactCTAProps {
  whatsapp?: string | null
  nombreComercio?: string | null
}

/* ──────────────────────────────────────────
   HELPERS
────────────────────────────────────────── */

function buildWaHref(raw: string): string {
  return `https://wa.me/${raw.replace(/[\s\-().]/g, "")}`
}

/* ──────────────────────────────────────────
   COMPONENT
────────────────────────────────────────── */

export function SellerContactCTA({ whatsapp, nombreComercio }: SellerContactCTAProps) {
  const hasWhatsapp = Boolean(whatsapp?.trim())

  return (
    <div className="space-y-2">
      {hasWhatsapp ? (
        <a
          href={buildWaHref(whatsapp!)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 w-full px-6 py-3.5 rounded-xl bg-[#0F3D3A] hover:bg-[#0C2F2C] active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-sm"
        >
          <MessageCircle className="w-4 h-4 flex-shrink-0" />
          Contactar por WhatsApp
        </a>
      ) : (
        <div className="flex items-center justify-center gap-2.5 w-full px-6 py-3.5 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-400 font-semibold text-sm cursor-not-allowed select-none">
          <Send className="w-4 h-4 flex-shrink-0" />
          Contactar vendedor
        </div>
      )}
      <p className="text-center text-xs text-neutral-400">
        {hasWhatsapp
          ? "Responde directamente el vendedor"
          : nombreComercio
          ? `${nombreComercio} aún no tiene WhatsApp activo`
          : "El vendedor no tiene WhatsApp activo"}
      </p>
    </div>
  )
}
