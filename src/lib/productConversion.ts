// src/lib/productConversion.ts
//
// Product Experience Layer (PEL) — Phase 9
// Pure function. No side effects. No fetching.
// Returns a live conversion score and actionable tips for sellers.

/* ──────────────────────────────────────────
   TYPES
────────────────────────────────────────── */

export type ConversionLevel = "low" | "medium" | "high"

export interface ConversionTip {
  type: "improvement" | "good"
  message: string
}

export interface ProductConversionInsights {
  score: number        // 0–100
  level: ConversionLevel
  tips: ConversionTip[]
}

/* ──────────────────────────────────────────
   SCORING WEIGHTS
   Total = 100
────────────────────────────────────────── */

const W = {
  nombre:      20,
  descripcion: 20,
  precio:      20,
  imagenes:    20,
  categoria:   10,
  location:    10,
} as const

const MAX_TIPS = 3

/* ──────────────────────────────────────────
   MAIN FUNCTION
────────────────────────────────────────── */

export function getProductConversionInsights({
  nombre,
  descripcion,
  precio,
  imagesCount,
  categoria,
  location,
}: {
  nombre: string
  descripcion: string
  precio: number
  imagesCount: number
  categoria: string
  location: string
}): ProductConversionInsights {
  /* ── Score ── */
  let score = 0
  if (nombre.trim().length >= 5)    score += W.nombre
  if (descripcion.trim().length > 0) score += W.descripcion
  if (precio > 0)                    score += W.precio
  if (imagesCount > 0)               score += W.imagenes
  if (categoria.trim())              score += W.categoria
  if (location.trim())               score += W.location

  /* ── Level ── */
  const level: ConversionLevel =
    score < 40 ? "low" :
    score < 80 ? "medium" :
                 "high"

  /* ── Tips (collect all candidates, slice to max) ── */
  const tips: ConversionTip[] = []

  if (imagesCount === 0) {
    tips.push({
      type: "improvement",
      message: "Los productos con fotos reciben 3× más atención",
    })
  }

  if (descripcion.trim().length < 30) {
    tips.push({
      type: "improvement",
      message: "Agrega más detalle para aumentar la confianza del comprador",
    })
  }

  if (!location.trim()) {
    tips.push({
      type: "improvement",
      message: "Los compradores confían más en productos con origen claro",
    })
  }

  if (!categoria.trim()) {
    tips.push({
      type: "improvement",
      message: "Categoriza tu producto para aparecer en más búsquedas",
    })
  }

  if (nombre.trim().length > 0 && nombre.trim().length < 5) {
    tips.push({
      type: "improvement",
      message: "Un nombre más descriptivo ayuda a que te encuentren",
    })
  }

  /* Good-news tip — only when score is high */
  if (score >= 80) {
    tips.unshift({
      type: "good",
      message: "¡Excelente! Tu producto está optimizado para vender",
    })
  }

  return {
    score,
    level,
    tips: tips.slice(0, MAX_TIPS),
  }
}
