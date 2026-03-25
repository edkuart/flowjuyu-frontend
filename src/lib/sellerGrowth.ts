// src/lib/sellerGrowth.ts
//
// Seller Growth Layer (SGL) — Phase 6
// Pure function. No side effects. No fetching.
// Returns actionable insights based on seller data.

/* ──────────────────────────────────────────
   TYPES
────────────────────────────────────────── */

export type InsightType = "warning" | "success" | "info"

export interface GrowthInsight {
  type: InsightType
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

export interface SellerGrowthResult {
  insights: GrowthInsight[]
}

export interface GrowthProducto {
  activo?: boolean
  imagen_url?: string | null
  descripcion?: string | null
}

export interface GrowthAnalytics {
  totalProductViews: number
  totalProfileViews: number
}

import { hasPhone } from "@/lib/phone"
import type { PhoneNumber } from "@/lib/phone"

export interface GrowthPerfil {
  plan?: string | null
  plan_activo?: boolean | null
  whatsapp_numero?: PhoneNumber | null
}

/* ──────────────────────────────────────────
   MAIN FUNCTION
────────────────────────────────────────── */

export function getSellerGrowthInsights({
  productos,
  analytics,
  perfil,
}: {
  productos: GrowthProducto[]
  analytics: GrowthAnalytics | null
  perfil: GrowthPerfil | null
}): SellerGrowthResult {
  const insights: GrowthInsight[] = []

  const hasProducts    = productos.length > 0
  const hasActive      = productos.some(p => p.activo === true)
  const hasImages      = productos.some(p => Boolean(p.imagen_url))
  const totalViews     = (analytics?.totalProductViews ?? 0) + (analytics?.totalProfileViews ?? 0)
  const productViews   = analytics?.totalProductViews ?? 0
  const isFounder      = perfil?.plan === "founder" && perfil?.plan_activo === true
  const hasWhatsapp    = hasPhone(perfil?.whatsapp_numero)

  /* ── 1. No products at all ── */
  if (!hasProducts) {
    insights.push({
      type: "warning",
      title: "Aún no tienes productos",
      description:
        "Crea tu primer producto para que los compradores puedan encontrarte en el catálogo.",
      actionLabel: "Crear producto",
      actionHref: "/seller/products/new",
    })
    // If there are no products, skip product-dependent rules
    return { insights }
  }

  /* ── 2. Products exist but none are active ── */
  if (hasProducts && !hasActive) {
    insights.push({
      type: "warning",
      title: "Tus productos no están publicados",
      description:
        "Activa al menos uno para empezar a recibir visitas y consultas de compradores.",
      actionLabel: "Ir a mis productos",
      actionHref: "/seller/products",
    })
  }

  /* ── 3. Low visibility (only meaningful once analytics are loaded) ── */
  if (analytics !== null && hasActive && totalViews < 10) {
    insights.push({
      type: "info",
      title: "Tu tienda tiene poca visibilidad",
      description:
        "Agrega más productos, mejora las fotos y completa las descripciones para aparecer más en el catálogo.",
      actionLabel: "Mejorar productos",
      actionHref: "/seller/products",
    })
  }

  /* ── 4. Gaining traction ── */
  if (analytics !== null && hasActive && productViews > 50) {
    insights.push({
      type: "success",
      title: "Tu tienda está ganando visibilidad",
      description: `Tu catálogo acumula ${productViews.toLocaleString()} vista${productViews !== 1 ? "s" : ""} en productos. Sigue agregando artículos para aprovechar el impulso.`,
      actionLabel: "Ver estadísticas",
      actionHref: "/seller/my-business",
    })
  }

  /* ── 5. Products lack images ── */
  if (hasProducts && !hasImages) {
    insights.push({
      type: "warning",
      title: "Tus productos no tienen fotos",
      description:
        "Los productos con imágenes reciben hasta 3× más clics. Agrega al menos una foto por producto.",
      actionLabel: "Agregar fotos",
      actionHref: "/seller/products",
    })
  }

  /* ── 6. Founder: missing WhatsApp ── */
  if (isFounder && !hasWhatsapp) {
    insights.push({
      type: "info",
      title: "Activa WhatsApp para convertir más visitas",
      description:
        "Como Founder tienes este canal activo. Agrega tu número para que los compradores puedan contactarte directamente.",
      actionLabel: "Agregar WhatsApp",
      actionHref: "/seller/profile",
    })
  }

  /* ── 7. Not a Founder — upgrade nudge ── */
  if (!isFounder) {
    insights.push({
      type: "info",
      title: "Desbloquea funciones premium",
      description:
        "El plan Founder incluye WhatsApp directo, mayor visibilidad en el catálogo y soporte prioritario.",
      actionLabel: "Conocer plan Founder",
      actionHref: "/seller/account",
    })
  }

  return { insights }
}
