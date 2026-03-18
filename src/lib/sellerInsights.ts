// src/lib/sellerInsights.ts
//
// Smart Metrics Layer (SML) — Phase 12
// Pure function. No side effects. No fetching.
// Returns the single most actionable insight for the seller.

/* ──────────────────────────────────────────
   TYPES
────────────────────────────────────────── */

export type InsightType = "success" | "warning" | "info"

export interface SellerInsightAction {
  label: string
  href: string
}

export interface SellerInsight {
  title: string
  message: string
  type: InsightType
  actions: SellerInsightAction[]
}

/* ──────────────────────────────────────────
   MAIN FUNCTION
────────────────────────────────────────── */

export function getSellerInsights({
  totalProductViews,
  totalIntentions,
  conversionRatio,
  growthPercent,
  totalWhatsappClicks,
  totalReviews,
}: {
  totalProductViews:   number
  totalIntentions:     number
  conversionRatio:     number
  growthPercent:       number
  totalWhatsappClicks: number
  totalReviews:        number
}): SellerInsight {

  /* ── Rule 1: Low traffic ── */
  if (totalProductViews < 30) {
    return {
      type:    "warning",
      title:   "Tu tienda tiene poca visibilidad",
      message: "Aún pocas personas ven tus productos. Mejora títulos e imágenes para aparecer más en búsquedas.",
      actions: [{ label: "Mejorar productos", href: "/seller/products" }],
    }
  }

  /* ── Rule 2: Low conversion ── */
  if (conversionRatio < 0.03 && totalProductViews > 50) {
    return {
      type:    "warning",
      title:   "Tienes visitas pero pocas conversiones",
      message: "Tus productos se ven, pero no están generando interés de compra. Revisa precios, fotos y descripciones.",
      actions: [{ label: "Optimizar catálogo", href: "/seller/products" }],
    }
  }

  /* ── Rule 3: No WhatsApp usage ── */
  if (totalWhatsappClicks === 0 && totalIntentions > 0) {
    return {
      type:    "info",
      title:   "Activa el contacto directo",
      message: "Los clientes muestran interés en tus productos, pero ninguno ha abierto WhatsApp aún.",
      actions: [{ label: "Configurar perfil", href: "/seller/profile" }],
    }
  }

  /* ── Rule 4: Growth positive ── */
  if (growthPercent > 10) {
    return {
      type:    "success",
      title:   "Tu tienda está creciendo",
      message: "El tráfico aumentó un " + growthPercent + "% esta semana. Sigue optimizando para mantener el impulso.",
      actions: [{ label: "Ver mis productos", href: "/seller/products" }],
    }
  }

  /* ── Rule 5: No reviews ── */
  if (totalReviews === 0 && totalIntentions > 0) {
    return {
      type:    "info",
      title:   "Aún no tienes reseñas",
      message: "Las reseñas aumentan la confianza del comprador. Cuando recibas tu primera compra, anima al cliente a dejar su opinión.",
      actions: [],
    }
  }

  /* ── Default ── */
  return {
    type:    "success",
    title:   "Buen rendimiento",
    message: "Tu tienda está funcionando correctamente. Sigue publicando productos para aumentar la visibilidad.",
    actions: [],
  }
}
