// src/lib/sellerPerformance/summary.ts
//
// SPIL v2 — Decision Layer: Executive Summary
// Owns: ExecutiveSummary
// No imports from ./index

import { type Signals } from "./signals"
import { type ScoringResult } from "./scoring"

/* ──────────────────────────────────────────
   OUTPUT TYPE
────────────────────────────────────────── */

export interface ExecutiveSummary {
  title:   string
  message: string
  tone:    "success" | "warning" | "info"
}

/* ──────────────────────────────────────────
   HELPERS
────────────────────────────────────────── */

function growthStr(g: number): string {
  return `${g >= 0 ? "+" : ""}${g}%`
}

/* ──────────────────────────────────────────
   MAIN FUNCTION
────────────────────────────────────────── */

export function buildExecutiveSummary(
  s:             Signals,
  scoring:       ScoringResult,
  growthPercent: number
): ExecutiveSummary {

  if (s.noProducts) {
    return {
      tone:    "info",
      title:   "Empieza subiendo productos",
      message: "Tu tienda aún no tiene productos. Publica tu primera pieza para abrirte al público.",
    }
  }

  if (s.noViews) {
    return {
      tone:    "warning",
      title:   "Tu tienda necesita visibilidad",
      message: "Tienes productos, pero nadie los ha visto aún. Comparte el enlace de tu tienda y mejora títulos e imágenes.",
    }
  }

  if (s.inactiveCatalog && scoring.breakdown.traffic === 0) {
    return {
      tone:    "warning",
      title:   "Ningún producto visible para compradores",
      message: "Tienes productos en tu catálogo, pero ninguno está activo. Actívalos para que los compradores puedan verlos.",
    }
  }

  if (s.strongGrowth && s.lowConversion) {
    return {
      tone:    "warning",
      title:   "Crecimiento real, conversión por mejorar",
      message: `Tu tienda está ganando visitas (${growthStr(growthPercent)}), pero pocas se convierten en interés. Es el momento ideal para optimizar precios y fotos.`,
    }
  }

  if ((s.goodTraffic || s.highTraffic) && s.lowConversion) {
    return {
      tone:    "warning",
      title:   "Tráfico sin conversión",
      message: "Tienes visitas considerables, pero pocas generan interés real. Revisa precios, imágenes y descripciones de tus productos.",
    }
  }

  if (s.strongGrowth && s.goodConversion) {
    return {
      tone:    "success",
      title:   "Tu tienda está creciendo fuerte",
      message: `Tu tráfico creció ${growthStr(growthPercent)} esta semana y estás convirtiendo bien. Mantén el ritmo y sigue publicando.`,
    }
  }

  if ((s.positiveGrowth || s.strongGrowth) && s.goodConversion) {
    return {
      tone:    "success",
      title:   "Buen rendimiento general",
      message: "Tu tienda crece y convierte de forma sólida. Sigue publicando nuevas piezas para capitalizar el impulso.",
    }
  }

  if (s.noWhatsapp && s.hasIntentions) {
    return {
      tone:    "info",
      title:   "Hay interés comercial, pero falta contacto",
      message: "Los compradores muestran interés en tus productos, pero ninguno ha abierto un canal directo. Activa tu WhatsApp para cerrar más ventas.",
    }
  }

  if (s.negativeGrowth && scoring.breakdown.contact > 20) {
    return {
      tone:    "warning",
      title:   "Actividad comercial con tráfico a la baja",
      message: "Tu tienda tiene movimiento comercial, pero el tráfico está bajando. Revisa qué ha cambiado y activa nuevos productos.",
    }
  }

  if (scoring.label === "high") {
    return {
      tone:    "success",
      title:   "Tu tienda está en buen estado",
      message: "Todos los indicadores clave se ven saludables. Sigue publicando y optimizando para mantener el crecimiento.",
    }
  }

  if (scoring.label === "low") {
    return {
      tone:    "warning",
      title:   "Tu tienda necesita atención",
      message: "Varios indicadores están por debajo del óptimo. Activa más productos, mejora imágenes y comparte tu tienda.",
    }
  }

  return {
    tone:    "info",
    title:   "Tu tienda está operativa",
    message: "Sigue publicando productos, compartiendo tu catálogo y mejorando tus imágenes para incrementar las ventas.",
  }
}
