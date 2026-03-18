// src/lib/sellerPerformance/alerts.ts
//
// SPIL v2 — Decision Layer: Alert Engine
// Owns: PerformanceAlert
// No imports from ./index

import { type PerformanceSummaryInput, type Signals } from "./signals"
import { type ScoringResult } from "./scoring"

/* ──────────────────────────────────────────
   OUTPUT TYPE
────────────────────────────────────────── */

export interface PerformanceAlert {
  id:           string
  type:         "warning" | "info" | "success"
  title:        string
  description:  string
  priority:     "high" | "medium" | "low"
  impact:       "high" | "medium" | "low"
  effort:       "low" | "medium" | "high"
  actionLabel?: string
  actionHref?:  string
}

/* ──────────────────────────────────────────
   SORT HELPERS
────────────────────────────────────────── */

const PRIORITY_RANK: Record<PerformanceAlert["priority"], number> = { high: 0, medium: 1, low: 2 }
const IMPACT_RANK:   Record<PerformanceAlert["impact"],   number> = { high: 0, medium: 1, low: 2 }

/* ──────────────────────────────────────────
   FORMATTERS
────────────────────────────────────────── */

function fmt(n: number): string {
  return n.toLocaleString("es-GT")
}

function growthStr(g: number): string {
  return `${g >= 0 ? "+" : ""}${g}%`
}

/* ──────────────────────────────────────────
   INDIVIDUAL ALERT BUILDERS
   Each returns PerformanceAlert | null.
   Conditions use signals + scores only.
────────────────────────────────────────── */

function alertNoTraffic(s: Signals): PerformanceAlert | null {
  if (!s.noViews) return null
  return {
    id: "no-traffic", type: "warning",
    title:       "Sin visitas en tus productos",
    description: "Ningún comprador ha visto tu catálogo. Comparte tu tienda en redes y mejora tus títulos.",
    priority: "high", impact: "high", effort: "low",
    actionLabel: "Mejorar catálogo", actionHref: "/seller/products",
  }
}

function alertLowTraffic(s: Signals, i: PerformanceSummaryInput): PerformanceAlert | null {
  if (!s.lowTraffic) return null
  return {
    id: "low-traffic", type: "warning",
    title:       "Tráfico bajo",
    description: `Solo ${i.totalProductViews} vista${i.totalProductViews !== 1 ? "s" : ""} en tus productos. Mejora imágenes y comparte tu tienda.`,
    priority: "high", impact: "high", effort: "low",
    actionLabel: "Ver productos", actionHref: "/seller/products",
  }
}

function alertLowConversion(s: Signals): PerformanceAlert | null {
  if (!s.lowConversion) return null
  return {
    id: "low-conversion", type: "warning",
    title:       "Tasa de conversión baja",
    description: "Tienes visitas pero pocas generan interés. Revisa precios, fotos y descripciones de tus productos.",
    priority: "high", impact: "high", effort: "medium",
    actionLabel: "Optimizar catálogo", actionHref: "/seller/products",
  }
}

function alertInactiveCatalog(s: Signals, i: PerformanceSummaryInput): PerformanceAlert | null {
  if (!s.inactiveCatalog) return null
  const n = i.totalProducts
  return {
    id: "no-active-products", type: "warning",
    title:       "Ningún producto activo",
    description: `Tienes ${n} producto${n !== 1 ? "s" : ""} en tu catálogo, pero ninguno está visible para los compradores.`,
    priority: "high", impact: "high", effort: "low",
    actionLabel: "Activar productos", actionHref: "/seller/products",
  }
}

function alertNoWaContact(s: Signals): PerformanceAlert | null {
  if (!s.noWhatsapp) return null
  return {
    id: "no-wa-engagement", type: "info",
    title:       "Clientes sin canal de contacto",
    description: "Los compradores muestran interés pero no están contactándote. Activa tu WhatsApp para cerrar más ventas.",
    priority: "high", impact: "high", effort: "low",
    actionLabel: "Configurar perfil", actionHref: "/seller/profile",
  }
}

function alertNoReviews(s: Signals, i: PerformanceSummaryInput): PerformanceAlert | null {
  if (i.totalReviews > 0 || !s.hasIntentions) return null
  return {
    id: "no-reviews", type: "info",
    title:       "Sin reseñas de clientes",
    description: "Las reseñas aumentan la confianza de nuevos compradores. Cuando cierres ventas, pide a tus clientes que dejen su opinión.",
    priority: "medium", impact: "medium", effort: "low",
  }
}

function alertPositiveGrowth(s: Signals, i: PerformanceSummaryInput): PerformanceAlert | null {
  if (!s.strongGrowth) return null
  return {
    id: "positive-growth", type: "success",
    title:       `Tu tráfico creció ${growthStr(i.growthPercent)} esta semana`,
    description: "Aprovecha este impulso publicando nuevos productos y compartiendo tu tienda.",
    priority: "medium", impact: "high", effort: "medium",
    actionLabel: "Agregar producto", actionHref: "/seller/products/new",
  }
}

function alertStrongTopProduct(s: Signals, i: PerformanceSummaryInput): PerformanceAlert | null {
  if (!s.strongTopProduct) return null
  const top  = i.topProducts[0]
  const name = top.nombre.length > 30 ? top.nombre.slice(0, 30) + "…" : top.nombre
  return {
    id: "strong-top-product", type: "success",
    title:       `"${name}" destaca en tu catálogo`,
    description: `Con ${fmt(top.total_views)} vistas, es tu producto estrella. Asegúrate de que su descripción y precio estén optimizados.`,
    priority: "low", impact: "medium", effort: "low",
  }
}

/* ──────────────────────────────────────────
   MAIN EXPORT
────────────────────────────────────────── */

export function buildAlerts(
  s:       Signals,
  scoring: ScoringResult,
  i:       PerformanceSummaryInput
): PerformanceAlert[] {
  // Traffic alerts are mutually exclusive
  const trafficAlert = alertNoTraffic(s) ?? alertLowTraffic(s, i)

  const candidates = [
    trafficAlert,
    alertLowConversion(s),
    alertInactiveCatalog(s, i),
    alertNoWaContact(s),
    alertNoReviews(s, i),
    alertPositiveGrowth(s, i),
    alertStrongTopProduct(s, i),
  ].filter((a): a is PerformanceAlert => a !== null)

  return candidates
    .sort((a, b) => {
      const byPriority = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
      if (byPriority !== 0) return byPriority
      return IMPACT_RANK[a.impact] - IMPACT_RANK[b.impact]
    })
    .slice(0, 5)
}
