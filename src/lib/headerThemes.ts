/**
 * src/lib/headerThemes.ts
 *
 * High-level visual identity themes for the seller header.
 * Each theme is a named preset that applies a base HeaderStyle.
 *
 * Themes sit one abstraction level above modes:
 *   Flowjuyu  → gradient (brand identity)
 *   Artesanal → image + warm overlay (texture + warmth)
 *   Minimal   → image only (clean, photo-forward)
 */
import type { HeaderStyle } from "./headerStyle"

export type ThemeKey = "flowjuyu" | "artesanal" | "minimal"

export type Theme = {
  key: ThemeKey
  name: string
  description: string
  emoji: string
  /** Merges over the current headerStyle when applied */
  style: Partial<HeaderStyle>
}

export const THEMES: Record<ThemeKey, Theme> = {
  flowjuyu: {
    key: "flowjuyu",
    name: "Flowjuyu",
    description: "Identidad de marca",
    emoji: "✦",
    style: {
      mode: "gradient",
      gradient_variant: undefined,
    },
  },
  artesanal: {
    key: "artesanal",
    name: "Artesanal",
    description: "Calidez y textura",
    emoji: "◈",
    style: {
      mode: "image+overlay",
      overlay_color: "#5a3e2b",
      overlay_opacity: 0.7,
    },
  },
  minimal: {
    key: "minimal",
    name: "Minimal",
    description: "Limpio y moderno",
    emoji: "○",
    style: {
      mode: "image",
    },
  },
}

export const THEME_KEYS: ThemeKey[] = ["flowjuyu", "artesanal", "minimal"]

/**
 * Heuristically detects which theme the current style matches.
 * Returns null if no clear match.
 */
export function detectTheme(hs: HeaderStyle): ThemeKey | null {
  if (hs.mode === "gradient") return "flowjuyu"
  if (hs.mode === "image") return "minimal"
  if (hs.mode === "image+overlay") {
    const warmColors = ["#5a3e2b", "#3a2b18"]
    if (warmColors.includes(hs.overlay_color ?? "")) return "artesanal"
  }
  return null
}
