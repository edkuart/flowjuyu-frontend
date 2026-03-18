// Server Component — no "use client" needed
import { MessageCircle, Send } from "lucide-react"

/* ──────────────────────────────────────────
   TYPES
────────────────────────────────────────── */

export interface ContactCTAProps {
  whatsapp?: string | null
  nombreComercio?: string | null
}

/* ──────────────────────────────────────────
   HELPERS
────────────────────────────────────────── */

/**
 * Normalise a raw phone number to a wa.me-compatible string.
 * Strips spaces, dashes, parentheses; keeps leading + if present.
 */
function buildWhatsappHref(raw: string): string {
  const digits = raw.replace(/[\s\-().]/g, "")
  return `https://wa.me/${digits}`
}

/* ──────────────────────────────────────────
   COMPONENT
────────────────────────────────────────── */

export function ContactCTA({ whatsapp, nombreComercio }: ContactCTAProps) {
  const hasWhatsapp = Boolean(whatsapp?.trim())

  if (hasWhatsapp) {
    const href = buildWhatsappHref(whatsapp!)

    return (
      <div className="space-y-2">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 w-full px-6 py-3.5 rounded-xl bg-[#0F3D3A] hover:bg-[#0C2F2C] active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-sm"
        >
          <MessageCircle className="w-4 h-4 flex-shrink-0" />
          Contactar por WhatsApp
        </a>
        <p className="text-center text-xs text-neutral-400">
          Responde directamente el vendedor
        </p>
      </div>
    )
  }

  /* ── No WhatsApp configured ── */
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-2.5 w-full px-6 py-3.5 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-400 font-semibold text-sm cursor-not-allowed select-none">
        <Send className="w-4 h-4 flex-shrink-0" />
        Enviar mensaje
      </div>
      <p className="text-center text-xs text-neutral-400">
        {nombreComercio
          ? `${nombreComercio} aún no tiene WhatsApp activo`
          : "El vendedor no tiene WhatsApp activo"}
      </p>
    </div>
  )
}
