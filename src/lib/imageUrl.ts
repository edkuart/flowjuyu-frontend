// src/lib/imageUrl.ts
//
// Converts Supabase Storage public URLs to Supabase Image Transform URLs.
// Non-Supabase URLs are returned unchanged so external images are never broken.
//
// Supabase transform endpoint:
//   /storage/v1/render/image/public/<bucket>/<path>?width=W&quality=Q&format=origin
//
//   width    — downscale to this pixel width (height scales proportionally)
//   quality  — JPEG/WebP quality 0–100
//   format=origin — Supabase auto-negotiates WebP when the browser supports it
//
// This reduces the data transferred between Supabase and the Next.js image
// optimizer on every cache-miss — the optimizer still handles client delivery.

const OBJECT_SEGMENT = "/storage/v1/object/public/";
const RENDER_SEGMENT = "/storage/v1/render/image/public/";

export type ImageOptOptions = {
  width?:   number; // px — output will not exceed this width
  quality?: number; // 1–100
};

/**
 * Returns an optimized Supabase image URL, or the original URL for
 * anything that isn't a Supabase Storage object URL.
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  { width = 800, quality = 75 }: ImageOptOptions = {},
): string {
  if (!url) return "";

  const idx = url.indexOf(OBJECT_SEGMENT);
  if (idx === -1) return url; // not a Supabase storage URL — pass through

  const transformed =
    url.slice(0, idx) + RENDER_SEGMENT + url.slice(idx + OBJECT_SEGMENT.length);

  const sep = transformed.includes("?") ? "&" : "?";
  return `${transformed}${sep}width=${width}&quality=${quality}&format=origin`;
}

// ── Preset helpers ────────────────────────────────────────────────────────────
// Sized for the actual render contexts in the app (mobile-first, 2× DPR).

/** Product grid card — max ~50 vw on mobile, ~25 vw on desktop */
export const cardImageUrl = (url: string | null | undefined) =>
  getOptimizedImageUrl(url, { width: 640, quality: 75 });

/** Main product gallery — max 100 vw on mobile, ~500 px on desktop */
export const galleryMainUrl = (url: string | null | undefined) =>
  getOptimizedImageUrl(url, { width: 1000, quality: 80 });

/** Gallery fullscreen viewer */
export const galleryFullscreenUrl = (url: string | null | undefined) =>
  getOptimizedImageUrl(url, { width: 1400, quality: 85 });

/** Thumbnail strip — rendered at 64 px, 2× DPR = 128 px */
export const thumbnailUrl = (url: string | null | undefined) =>
  getOptimizedImageUrl(url, { width: 128, quality: 70 });
