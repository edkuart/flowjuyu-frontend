// src/lib/sellerPerformance/kpis.ts
//
// SPIL v2 — Decision Layer: KPI Highlights
// Owns: KpiHighlight, KpiHighlights
// No imports from ./index

import { type PerformanceSummaryInput, type Signals } from "./signals"
import { type ScoreBreakdown, type ScoringResult } from "./scoring"

/* ──────────────────────────────────────────
   OUTPUT TYPES
────────────────────────────────────────── */

export interface KpiHighlight {
  label:       string
  value:       string
  explanation: string
}

export interface KpiHighlights {
  primary:     KpiHighlight
  risk:        KpiHighlight
  opportunity: KpiHighlight
}

/* ──────────────────────────────────────────
   FORMATTERS
────────────────────────────────────────── */

function fmt(n: number): string {
  return n.toLocaleString("es-GT")
}

function pct(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`
}

function growthStr(g: number): string {
  return `${g >= 0 ? "+" : ""}${g}%`
}

/* ──────────────────────────────────────────
   DIMENSION META  (for fallback tiles)
────────────────────────────────────────── */

const DIM_META: Record<keyof ScoreBreakdown, { label: string; explanation: string }> = {
  traffic:    { label: "Tráfico",     explanation: "Aumenta la visibilidad compartiendo tu tienda y mejorando títulos." },
  conversion: { label: "Conversión",  explanation: "Mejora imágenes y descripciones para convertir más visitas en interés." },
  growth:     { label: "Crecimiento", explanation: "Publica nuevos productos regularmente para mantener el crecimiento." },
  catalog:    { label: "Catálogo",    explanation: "Activa más productos para maximizar tu alcance de forma inmediata." },
  contact:    { label: "Contacto",    explanation: "Activa WhatsApp o responde rápido para facilitar el contacto." },
}

/* ──────────────────────────────────────────
   PRIMARY — strongest positive signal
────────────────────────────────────────── */

function derivePrimary(
  s:       Signals,
  scoring: ScoringResult,
  i:       PerformanceSummaryInput
): KpiHighlight {
  if (s.goodConversion && i.totalProductViews > 20) {
    return {
      label:       "Tasa de conversión",
      value:       pct(i.conversionRatio),
      explanation: "Porcentaje de visitas que generan interés comercial real.",
    }
  }
  if (s.highTraffic) {
    return {
      label:       "Vistas de productos",
      value:       `${fmt(i.totalProductViews)} vistas`,
      explanation: "Tu catálogo tiene alta exposición esta temporada.",
    }
  }
  if (s.strongGrowth) {
    return {
      label:       "Crecimiento semanal",
      value:       growthStr(i.growthPercent),
      explanation: "El tráfico subió considerablemente respecto a la semana anterior.",
    }
  }
  if (scoring.breakdown.catalog >= 70 && !s.noProducts) {
    return {
      label:       "Catálogo activo",
      value:       `${i.activeProducts} de ${i.totalProducts} activos`,
      explanation: "La mayoría de tus productos están visibles para los compradores.",
    }
  }
  return {
    label:       "Vistas de productos",
    value:       i.totalProductViews > 0 ? `${fmt(i.totalProductViews)} vistas` : "Sin visitas aún",
    explanation: "El número de veces que tus productos fueron vistos.",
  }
}

/* ──────────────────────────────────────────
   RISK — weakest signal needing attention
────────────────────────────────────────── */

function deriveRisk(
  s:       Signals,
  scoring: ScoringResult,
  i:       PerformanceSummaryInput
): KpiHighlight {
  if (s.noViews || i.totalProductViews === 0) {
    return {
      label:       "Visibilidad",
      value:       "Sin tráfico",
      explanation: "Ningún comprador ha visto tus productos todavía.",
    }
  }
  if (s.lowConversion) {
    return {
      label:       "Conversión",
      value:       pct(i.conversionRatio),
      explanation: "Pocas visitas se convierten en interés real. El catálogo necesita optimización.",
    }
  }
  if (s.negativeGrowth) {
    return {
      label:       "Tendencia semanal",
      value:       growthStr(i.growthPercent),
      explanation: "El tráfico bajó respecto a la semana anterior.",
    }
  }
  if (s.noWhatsapp) {
    return {
      label:       "Contacto directo",
      value:       "Sin clicks en WhatsApp",
      explanation: "Los compradores interesados no están abriendo un canal de contacto.",
    }
  }
  if (i.inactiveProducts > 0) {
    const n = i.inactiveProducts
    return {
      label:       "Catálogo inactivo",
      value:       `${n} producto${n !== 1 ? "s" : ""} pausado${n !== 1 ? "s" : ""}`,
      explanation: "Tienes productos que no están visibles para los compradores.",
    }
  }
  // Fallback: dimension with lowest score
  const entries = Object.entries(scoring.breakdown) as [keyof ScoreBreakdown, number][]
  const minDim  = entries.sort(([, a], [, b]) => a - b)[0]
  const meta    = DIM_META[minDim[0]]
  return {
    label:       meta.label,
    value:       `Puntuación: ${minDim[1]}/100`,
    explanation: meta.explanation,
  }
}

/* ──────────────────────────────────────────
   OPPORTUNITY — positive lever to amplify
────────────────────────────────────────── */

function deriveOpportunity(
  s: Signals,
  i: PerformanceSummaryInput
): KpiHighlight {
  if (s.strongGrowth) {
    return {
      label:       "Impulso de tráfico",
      value:       growthStr(i.growthPercent),
      explanation: "El tráfico está subiendo — aprovecha para publicar más productos.",
    }
  }
  if (s.hasTopProduct) {
    const top = i.topProducts[0]
    return {
      label:       "Producto estrella",
      value:       top.nombre.length > 22 ? top.nombre.slice(0, 22) + "…" : top.nombre,
      explanation: `${fmt(top.total_views)} vistas — tu producto más visitado. Optimiza su descripción.`,
    }
  }
  if (i.totalWhatsappClicks > 0) {
    return {
      label:       "Canal de WhatsApp",
      value:       `${fmt(i.totalWhatsappClicks)} click${i.totalWhatsappClicks !== 1 ? "s" : ""}`,
      explanation: "El contacto directo ya funciona. Responde rápido para cerrar más ventas.",
    }
  }
  if (i.inactiveProducts > 0) {
    const n = i.inactiveProducts
    return {
      label:       "Catálogo sin activar",
      value:       `${n} producto${n !== 1 ? "s" : ""} pausado${n !== 1 ? "s" : ""}`,
      explanation: "Activar más productos amplía tu alcance de forma inmediata.",
    }
  }
  return {
    label:       "Prueba social",
    value:       i.totalReviews > 0 ? `${i.totalReviews} reseña${i.totalReviews !== 1 ? "s" : ""}` : "Sin reseñas aún",
    explanation: "Las reseñas de clientes aumentan la confianza y las conversiones.",
  }
}

/* ──────────────────────────────────────────
   MAIN EXPORT
────────────────────────────────────────── */

export function buildKpiHighlights(
  s:       Signals,
  scoring: ScoringResult,
  i:       PerformanceSummaryInput
): KpiHighlights {
  return {
    primary:     derivePrimary(s, scoring, i),
    risk:        deriveRisk(s, scoring, i),
    opportunity: deriveOpportunity(s, i),
  }
}
