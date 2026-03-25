/**
 * src/lib/headerStyle.ts
 *
 * Single source of truth for all header-style logic.
 * Used by: StoreClient, StoreHeaderPreview, seller/profile, seller/my-business
 */
import type { CSSProperties } from "react";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */

export type HeaderStyle = {
  mode: "gradient" | "image" | "image+overlay";
  overlay_color?: string;        // "#rrggbb" — used in image+overlay mode
  overlay_opacity?: number;      // 0–1      — used in image+overlay mode
  gradient_variant?: "suave" | "calido" | "oscuro"; // gradient sub-variant
};

export const DEFAULT_HEADER_STYLE: HeaderStyle = {
  mode: "image+overlay",
  overlay_color: "#0f2e22",
  overlay_opacity: 0.7,
};

/* ─────────────────────────────────────────────
   GRADIENT VARIANTS
   Three artisan-inspired sub-themes for gradient mode.
   Each transitions from a deep base to a warm sandy tone
   so the header feels breathable, not heavy.
───────────────────────────────────────────── */

export const GRADIENT_VARIANTS = {
  /** Default — forest green to warm sand. Balanced, premium. */
  default: {
    name: "Clásico",
    backgroundImage:
      "linear-gradient(135deg, rgba(31,77,58,0.95) 0%, rgba(47,111,86,0.85) 40%, rgba(214,195,163,0.65) 100%)",
    backgroundColor: "#1a3d2a",
  },
  /** Suave — lighter opacity, more breathable. */
  suave: {
    name: "Clásico suave",
    backgroundImage:
      "linear-gradient(135deg, rgba(31,77,58,0.82) 0%, rgba(79,140,107,0.70) 52%, rgba(214,195,163,0.48) 100%)",
    backgroundColor: "#1a3d2a",
  },
  /** Cálido — earth tones, textile-inspired warmth. */
  calido: {
    name: "Clásico cálido",
    backgroundImage:
      "linear-gradient(135deg, rgba(58,43,24,0.95) 0%, rgba(90,62,43,0.85) 40%, rgba(214,178,120,0.65) 100%)",
    backgroundColor: "#3a2b18",
  },
  /** Oscuro — deeper, more dramatic, strong contrast. */
  oscuro: {
    name: "Clásico oscuro",
    backgroundImage:
      "linear-gradient(135deg, rgba(12,31,23,0.98) 0%, rgba(15,61,42,0.93) 40%, rgba(160,140,110,0.55) 100%)",
    backgroundColor: "#0c1f17",
  },
} as const;

export type GradientVariantKey = keyof typeof GRADIENT_VARIANTS;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

export function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

/**
 * Computes the CSS background style for a seller header.
 *
 * gradient mode  → artisan gradient (with optional sub-variant)
 * image mode     → banner + subtle bottom readability fade
 * image+overlay  → single combined background-image layer (gradient + url)
 *
 * All consumers should call this instead of inlining the logic.
 */
export function buildHeaderStyle(
  hs: HeaderStyle,
  bannerUrl?: string | null
): CSSProperties {
  // gradient mode (or no banner — fall back to gradient regardless of mode)
  if (!bannerUrl || hs.mode === "gradient") {
    const key = hs.gradient_variant ?? "default";
    const g = GRADIENT_VARIANTS[key] ?? GRADIENT_VARIANTS.default;
    return {
      backgroundImage: g.backgroundImage,
      backgroundColor: g.backgroundColor,
    };
  }

  if (hs.mode === "image") {
    return {
      backgroundImage: [
        "linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.45) 100%)",
        `url(${bannerUrl})`,
      ].join(", "),
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }

  // image+overlay — single combined layer, no separate div needed
  const color = hs.overlay_color ?? "#0f2e22";
  const opacity = Math.min(Math.max(hs.overlay_opacity ?? 0.7, 0), 1);
  const [r, g, b] = hexToRgb(color);
  return {
    backgroundImage: [
      `linear-gradient(rgba(${r},${g},${b},${opacity}), rgba(${r},${g},${b},${opacity}))`,
      `url(${bannerUrl})`,
    ].join(", "),
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}

/* ─────────────────────────────────────────────
   CONTROLLED FLEXIBILITY
───────────────────────────────────────────── */

/**
 * Enforces safe bounds on a HeaderStyle before saving or previewing.
 * - overlay_opacity clamped to [0.4, 0.9]
 */
export function sanitizeHeaderStyle(hs: HeaderStyle): HeaderStyle {
  if (hs.overlay_opacity === undefined) return hs
  const clamped = Math.min(Math.max(hs.overlay_opacity, 0.4), 0.9)
  if (clamped === hs.overlay_opacity) return hs
  return { ...hs, overlay_opacity: clamped }
}

/* ─────────────────────────────────────────────
   IMAGE BRIGHTNESS ANALYSIS
───────────────────────────────────────────── */

/**
 * Loads an image into an off-screen 50×50 canvas and computes
 * average perceived brightness (0.299R + 0.587G + 0.114B).
 * Returns "light" (avg > 128) or "dark" (avg ≤ 128).
 *
 * CORS: works reliably with blob: URLs. For CDN URLs the server
 * must send CORS headers; otherwise falls back to "dark".
 */
export function analyzeImageBrightness(
  imageUrl: string
): Promise<"dark" | "light"> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const SIZE = 50;
        const canvas = document.createElement("canvas");
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve("dark"); return; }

        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

        let total = 0;
        const pixels = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
          total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        }

        resolve(total / pixels > 128 ? "light" : "dark");
      } catch {
        resolve("dark");
      }
    };

    img.onerror = () => resolve("dark");
    img.src = imageUrl;
  });
}
