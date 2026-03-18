// Server Component — no "use client" needed
import { ShieldCheck, Package, MapPin, Store } from "lucide-react"
import {
  getSellerTrustSignals,
  type TrustBadgeType,
  type TrustPerfil,
  type TrustEstado,
} from "@/lib/sellerTrust"

/* ──────────────────────────────────────────
   TYPES
────────────────────────────────────────── */

export interface SellerTrustBarProps {
  perfil: TrustPerfil | null
  productos: unknown[]
  estadoValidacion: TrustEstado
}

/* ──────────────────────────────────────────
   BADGE CONFIG
────────────────────────────────────────── */

const BADGE_CONFIG: Record<
  TrustBadgeType,
  { icon: React.ReactNode; classes: string }
> = {
  verified: {
    icon:    <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />,
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  products: {
    icon:    <Package className="w-3.5 h-3.5 flex-shrink-0" />,
    classes: "bg-sky-50 text-sky-700 border-sky-200",
  },
  location: {
    icon:    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />,
    classes: "bg-amber-50 text-amber-700 border-amber-200",
  },
  active: {
    icon:    <Store className="w-3.5 h-3.5 flex-shrink-0" />,
    classes: "bg-neutral-50 text-neutral-600 border-neutral-200",
  },
}

/* ──────────────────────────────────────────
   COMPONENT
────────────────────────────────────────── */

export function SellerTrustBar({
  perfil,
  productos,
  estadoValidacion,
}: SellerTrustBarProps) {
  const { badges } = getSellerTrustSignals({ perfil, productos, estadoValidacion })

  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => {
        const { icon, classes } = BADGE_CONFIG[badge.type]
        return (
          <span
            key={badge.type}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${classes}`}
          >
            {icon}
            {badge.label}
          </span>
        )
      })}
    </div>
  )
}
