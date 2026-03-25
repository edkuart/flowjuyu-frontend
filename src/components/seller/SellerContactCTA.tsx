// src/components/seller/SellerContactCTA.tsx
// Server Component — renders anchor/button, no client state needed
import { MessageCircle, ChevronRight, Hand, Leaf, ShieldCheck } from "lucide-react"

/* ──────────────────────────────────────────
   TYPES
────────────────────────────────────────── */

export interface SellerContactCTAProps {
  whatsapp?:      string | null
  nombreComercio?: string | null
  storeUrl?:      string | null
}

/* ──────────────────────────────────────────
   HELPERS
────────────────────────────────────────── */

// Accepts either a full wa.me URL (from phoneToWaUrl) or a raw number string for legacy callers
function buildWaHref(raw: string): string {
  if (raw.startsWith("https://")) return raw
  return `https://wa.me/${raw.replace(/[\s\-().]/g, "")}`
}

/* ──────────────────────────────────────────
   TRUST BADGES
────────────────────────────────────────── */

const TRUST_BADGES = [
  { icon: Hand,        label: "Hecho a mano"       },
  { icon: Leaf,        label: "Producción local"    },
  { icon: ShieldCheck, label: "Artesano verificado" },
] as const

/* ──────────────────────────────────────────
   COMPONENT
────────────────────────────────────────── */

export function SellerContactCTA({ whatsapp, nombreComercio, storeUrl }: SellerContactCTAProps) {
  const hasWhatsapp = Boolean(whatsapp?.trim())

  return (
    <div className="space-y-3">

      {/* ── Primary CTA ── */}
      {hasWhatsapp ? (
        <a
          href={buildWaHref(whatsapp!)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full px-6 py-4 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 text-white font-bold text-base transition-all duration-200 shadow-md hover:shadow-xl"
        >
          <MessageCircle className="w-5 h-5 flex-shrink-0" />
          Hablar con el artesano
        </a>
      ) : (
        <div className="flex items-center justify-center gap-2.5 w-full px-6 py-4 rounded-2xl bg-neutral-100 border border-neutral-200 text-neutral-400 font-semibold text-base cursor-not-allowed select-none">
          <MessageCircle className="w-5 h-5 flex-shrink-0" />
          Hablar con el artesano
        </div>
      )}

      {/* ── Secondary CTA ── */}
      {storeUrl && (
        <a
          href={storeUrl}
          className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-2xl border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 hover:-translate-y-0.5 text-neutral-700 font-semibold text-sm transition-all duration-200"
        >
          Ver catálogo
          <ChevronRight className="w-4 h-4 text-neutral-400" />
        </a>
      )}

      {/* ── Subtitle ── */}
      <p className="text-center text-xs text-neutral-400">
        {hasWhatsapp
          ? "Respuesta rápida · Sin compromiso"
          : nombreComercio
          ? `${nombreComercio} aún no tiene WhatsApp activo`
          : "El artesano no tiene WhatsApp activo"}
      </p>

      {/* ── Trust badges ── */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {TRUST_BADGES.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 bg-neutral-50 border border-neutral-100 rounded-xl px-2 py-3 text-center"
          >
            <Icon className="w-4 h-4 text-[#0F3D3A]" />
            <span className="text-[10px] font-semibold text-neutral-600 leading-tight">{label}</span>
          </div>
        ))}
      </div>

    </div>
  )
}
