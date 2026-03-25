// src/lib/sellerRevenue.ts
//
// Revenue Engine (RE) — Phase 7
// Pure function. No side effects. No fetching.
// Returns contextual upgrade/opportunity signals for sellers.

/* ──────────────────────────────────────────
   TYPES
────────────────────────────────────────── */

export type SignalType = "upgrade" | "opportunity"

export interface RevenueSignal {
  type: SignalType
  title: string
  description: string
  actionLabel: string
  actionHref: string
}

export interface SellerRevenueResult {
  signals: RevenueSignal[]
}

export interface RevenueProducto {
  activo?: boolean
}

export interface RevenueAnalytics {
  totalProductViews: number
}

import { hasPhone } from "@/lib/phone"
import type { PhoneNumber } from "@/lib/phone"

export interface RevenuePerfil {
  plan?: string | null
  plan_activo?: boolean | null
  whatsapp_numero?: PhoneNumber | null
}

/* ──────────────────────────────────────────
   CONSTANTS
────────────────────────────────────────── */

const MAX_SIGNALS = 2
const LOW_VIEWS_THRESHOLD  = 20
const HIGH_VIEWS_THRESHOLD = 50

/* ──────────────────────────────────────────
   MAIN FUNCTION
────────────────────────────────────────── */

export function getSellerRevenueSignals({
  productos,
  analytics,
  perfil,
}: {
  productos: RevenueProducto[]
  analytics: RevenueAnalytics | null
  perfil: RevenuePerfil | null
}): SellerRevenueResult {
  const candidates: RevenueSignal[] = []

  const isFounder      = perfil?.plan === "founder" && perfil?.plan_activo === true
  const hasWhatsapp    = hasPhone(perfil?.whatsapp_numero)
  const hasProducts    = productos.length > 0
  const hasActive      = productos.some(p => p.activo === true)
  const productViews   = analytics?.totalProductViews ?? 0

  /* ── Rule 1: Not on Founder plan ── */
  if (!isFounder) {
    candidates.push({
      type: "upgrade",
      title: "Desbloquea WhatsApp y funciones premium",
      description:
        "Recibe pedidos directos de compradores, aparece primero en el catálogo y accede a estadísticas avanzadas.",
      actionLabel: "Ver plan Founder",
      actionHref: "/seller/account",
    })
  }

  /* ── Rule 2: Has products but low visibility ── */
  if (hasProducts && analytics !== null && productViews < LOW_VIEWS_THRESHOLD) {
    candidates.push({
      type: "opportunity",
      title: "Aumenta tu visibilidad",
      description:
        "Los productos destacados aparecen primero en búsquedas y reciben significativamente más visitas.",
      actionLabel: "Mejorar mi tienda",
      actionHref: "/seller/profile",
    })
  }

  /* ── Rule 3: Founder or has products, no WhatsApp ── */
  if (hasProducts && !hasWhatsapp) {
    candidates.push({
      type: "upgrade",
      title: "Activa WhatsApp para recibir pedidos",
      description:
        "Los compradores prefieren contactar directamente. Agrega tu número y aumenta tus conversiones.",
      actionLabel: "Activar WhatsApp",
      actionHref: "/seller/profile",
    })
  }

  /* ── Rule 4: Active products with good traction — scale nudge ── */
  if (hasActive && analytics !== null && productViews > HIGH_VIEWS_THRESHOLD) {
    candidates.push({
      type: "upgrade",
      title: "Tu tienda está creciendo — escala más",
      description:
        "Con el plan Founder obtienes mayor exposición, herramientas de análisis y contacto directo con compradores.",
      actionLabel: "Escalar mi negocio",
      actionHref: "/seller/account",
    })
  }

  // Cap at MAX_SIGNALS — highest-priority rules appear first
  return { signals: candidates.slice(0, MAX_SIGNALS) }
}
