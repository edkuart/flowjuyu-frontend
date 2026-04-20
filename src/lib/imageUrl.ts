// src/lib/imageUrl.ts
//
// Returns Supabase Storage public URLs as-is so Next.js image optimization
// can fetch and resize them server-side via /_next/image.
// Non-Supabase URLs are returned unchanged.

export type ImageOptOptions = {
  width?:   number;
  quality?: number;
};

export function getOptimizedImageUrl(
  url: string | null | undefined,
  _options: ImageOptOptions = {},
): string {
  if (!url) return "";
  return url;
}

// ── Preset helpers ────────────────────────────────────────────────────────────

export const cardImageUrl = (url: string | null | undefined) =>
  getOptimizedImageUrl(url);

export const galleryMainUrl = (url: string | null | undefined) =>
  getOptimizedImageUrl(url);

export const galleryFullscreenUrl = (url: string | null | undefined) =>
  getOptimizedImageUrl(url);

export const thumbnailUrl = (url: string | null | undefined) =>
  getOptimizedImageUrl(url);
