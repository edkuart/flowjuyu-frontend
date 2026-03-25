/**
 * src/lib/headerScore.ts
 *
 * Visual quality scoring, smart recommendations, and suggested style
 * for the seller header editor.
 *
 * All functions are pure — no React dependencies.
 */
import type { HeaderStyle } from "./headerStyle"

/* ─────────────────────────────────────────────
   SCORE
───────────────────────────────────────────── */

export type ScoreBreakdown = {
  total: number
  hasBanner: number       // 0–20
  contrast: number        // 0–25
  modeUsage: number       // 0–15
  overlayBalance: number  // 0–20
  gradientVariant: number // 0–10
  completeness: number    // 0–10
}

/**
 * Evaluates the visual quality of a seller header configuration.
 * Returns a breakdown and total (0–100).
 */
export function computeHeaderScore(
  hs: HeaderStyle,
  bannerUrl: string | null | undefined,
  brightness: "dark" | "light" | null,
): ScoreBreakdown {
  // +20 — has banner image
  const hasBanner = bannerUrl ? 20 : 0

  // +25 — good contrast between text and background
  let contrast = 0
  if (hs.mode === "gradient") {
    contrast = 25 // gradient always provides readable contrast by design
  } else if (bannerUrl && brightness !== null) {
    const opacity = hs.overlay_opacity ?? 0.7
    if (hs.mode === "image+overlay") {
      if (brightness === "light") {
        contrast = opacity >= 0.6 ? 25 : opacity >= 0.4 ? 15 : 8
      } else {
        // dark image — less overlay needed
        contrast = opacity <= 0.65 ? 25 : opacity <= 0.8 ? 18 : 10
      }
    } else {
      // image-only mode — no overlay protection
      contrast = brightness === "dark" ? 20 : 10
    }
  }

  // +15 — valid mode usage
  let modeUsage: number
  if (hs.mode === "gradient") {
    modeUsage = 15
  } else if (bannerUrl) {
    modeUsage = 15
  } else {
    // image-based mode but no banner
    modeUsage = 5
  }

  // +20 — balanced overlay_opacity (ideal: 0.5–0.85)
  let overlayBalance: number
  if (hs.mode === "gradient") {
    overlayBalance = 20
  } else if (hs.mode === "image+overlay") {
    const op = hs.overlay_opacity ?? 0.7
    if (op >= 0.5 && op <= 0.85) overlayBalance = 20
    else if (op >= 0.4 && op <= 0.9) overlayBalance = 12
    else overlayBalance = 5
  } else {
    // image mode — no overlay concern
    overlayBalance = 10
  }

  // +10 — gradient variant explicitly chosen
  let gradientVariant = 0
  if (hs.mode === "gradient") {
    gradientVariant = hs.gradient_variant ? 10 : 5
  }

  // +10 — overall completeness
  const checks = [
    hs.mode === "gradient" ? true : Boolean(bannerUrl),
    hs.mode !== "image+overlay" || Boolean(hs.overlay_color),
    true, // mode always set
  ]
  const completeness = Math.round((checks.filter(Boolean).length / checks.length) * 10)

  const total = Math.min(
    hasBanner + contrast + modeUsage + overlayBalance + gradientVariant + completeness,
    100,
  )

  return { total, hasBanner, contrast, modeUsage, overlayBalance, gradientVariant, completeness }
}

/** Human-readable quality label for a score value */
export function scoreLabel(score: number): { label: string; color: string } {
  if (score >= 85) return { label: "Excelente",  color: "text-green-700 bg-green-100" }
  if (score >= 65) return { label: "Bueno",       color: "text-amber-700 bg-amber-100" }
  if (score >= 45) return { label: "Mejorable",   color: "text-orange-700 bg-orange-100" }
  return             { label: "Incompleto",  color: "text-red-600  bg-red-100"  }
}

/** Bar color class for a score value */
export function scoreBarColor(score: number): string {
  if (score >= 85) return "bg-green-500"
  if (score >= 65) return "bg-amber-400"
  if (score >= 45) return "bg-orange-400"
  return "bg-red-400"
}

/* ─────────────────────────────────────────────
   SUGGESTIONS
───────────────────────────────────────────── */

export type Suggestion = {
  key: string
  message: string
  priority: "high" | "medium" | "low"
}

/**
 * Returns contextual suggestions to improve the header style.
 * Ordered from highest to lowest priority.
 */
export function generateHeaderSuggestions({
  headerStyle,
  brightness,
  bannerUrl,
}: {
  headerStyle: HeaderStyle
  brightness: "dark" | "light" | null
  bannerUrl?: string | null
}): Suggestion[] {
  const s: Suggestion[] = []

  if (!bannerUrl && headerStyle.mode !== "gradient") {
    s.push({
      key: "no-image",
      message: "Agrega una imagen para mejorar la presentación de tu tienda.",
      priority: "high",
    })
  }

  if (brightness === "light" && headerStyle.mode === "image+overlay") {
    const op = headerStyle.overlay_opacity ?? 0.7
    if (op < 0.6) {
      s.push({
        key: "light-low-opacity",
        message: "Tu imagen es clara. Sube la intensidad del overlay para mejorar la legibilidad.",
        priority: "high",
      })
    }
  }

  if (brightness === "light" && headerStyle.mode === "image") {
    s.push({
      key: "light-no-overlay",
      message: "Tu imagen es muy clara. Considera 'Imagen + overlay' para proteger la legibilidad del texto.",
      priority: "medium",
    })
  }

  if (brightness === "dark" && headerStyle.mode === "image+overlay") {
    const op = headerStyle.overlay_opacity ?? 0.7
    if (op > 0.75) {
      s.push({
        key: "dark-high-opacity",
        message: "Tu imagen es oscura. Reduce el overlay para que el fondo se vea más.",
        priority: "medium",
      })
    }
  }

  if (headerStyle.mode === "gradient" && !headerStyle.gradient_variant) {
    s.push({
      key: "no-variant",
      message: "Selecciona una variante de gradiente para personalizar tu identidad visual.",
      priority: "low",
    })
  }

  return s
}

/* ─────────────────────────────────────────────
   RECOMMENDED STYLE
───────────────────────────────────────────── */

/**
 * Derives an improved HeaderStyle from the current one and image brightness.
 * Used for the "Ver sugerencia" comparison preview.
 */
export function getRecommendedStyle(
  hs: HeaderStyle,
  brightness: "dark" | "light" | null,
): HeaderStyle {
  if (!brightness || hs.mode === "gradient") return hs

  if (brightness === "light") {
    return {
      ...hs,
      mode: "image+overlay",
      overlay_color: hs.overlay_color ?? "#0f2e22",
      overlay_opacity: 0.78,
    }
  }

  // dark image — let the background breathe
  return {
    ...hs,
    mode: "image+overlay",
    overlay_opacity: Math.min(hs.overlay_opacity ?? 0.7, 0.42),
  }
}
