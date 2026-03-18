// src/lib/metricInterpreter.ts
//
// Metrics UX Layer (MUL) — Phase 13
// Pure function. No side effects.
// Translates raw numbers into human-readable context.

/* ──────────────────────────────────────────
   TYPES
────────────────────────────────────────── */

export type MetricType   = "views" | "conversion" | "growth" | "intentions"
export type MetricColor  = "red" | "amber" | "green"

export interface MetricInterpretation {
  label:    string
  color:    MetricColor
  /** Optional one-line guidance shown below the label */
  message?: string
}

/* ──────────────────────────────────────────
   MAIN FUNCTION
────────────────────────────────────────── */

export function interpretMetric(
  type:  MetricType,
  value: number
): MetricInterpretation {
  switch (type) {

    /* ── VIEWS ──────────────────────────────
       0          → red   · Sin tráfico
       1–30       → amber · Bajo tráfico
       31–100     → green · Tráfico medio
       101+       → green · Alto tráfico
    ──────────────────────────────────────── */
    case "views":
      if (value === 0)   return { label: "Sin tráfico",   color: "red",   message: "Comparte tu tienda para atraer compradores" }
      if (value <= 30)   return { label: "Bajo tráfico",  color: "amber", message: "Mejora títulos e imágenes para ganar visibilidad" }
      if (value <= 100)  return { label: "Tráfico medio", color: "green" }
      return               { label: "Alto tráfico",  color: "green", message: "Buen alcance — sigue publicando regularmente" }

    /* ── CONVERSION (value = percent, e.g. 4.5) ──
       < 3%   → red   · Baja conversión
       3–7%   → amber · Aceptable
       > 7%   → green · Excelente
    ──────────────────────────────────────── */
    case "conversion":
      if (value < 3)  return { label: "Baja conversión", color: "red",   message: "Revisa precios, fotos y descripciones" }
      if (value < 7)  return { label: "Aceptable",       color: "amber", message: "Puedes mejorar con mejores imágenes" }
      return            { label: "Excelente",         color: "green", message: "Tu catálogo convierte muy bien" }

    /* ── GROWTH (value = signed percent) ──
       < -5   → red   · En descenso
       -5–5   → amber · Estable
       > 5    → green · En crecimiento
    ──────────────────────────────────────── */
    case "growth":
      if (value < -5) return { label: "En descenso",    color: "red",   message: "Revisa qué ha cambiado en tu catálogo" }
      if (value <= 5) return { label: "Estable",         color: "amber", message: "Consistente — sigue publicando para crecer" }
      return            { label: "En crecimiento",   color: "green", message: "El tráfico está subiendo esta semana" }

    /* ── INTENTIONS ─────────────────────────
       0       → red   · Sin interés aún
       1–10    → amber · Interés inicial
       10+     → green · Buen interés
    ──────────────────────────────────────── */
    case "intentions":
      if (value === 0)  return { label: "Sin interés aún",  color: "red",   message: "Comparte productos en redes para generar interés" }
      if (value <= 10)  return { label: "Interés inicial",  color: "amber", message: "Hay compradores mirando — optimiza tus CTAs" }
      return              { label: "Buen interés",       color: "green", message: "Los compradores están interactuando activamente" }
  }
}
