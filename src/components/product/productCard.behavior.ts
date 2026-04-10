// src/components/product/productCard.behavior.ts
//
// All logic for the ProductCardV2 system.
//
// RULES:
//   - No JSX. No React imports. Pure functions only.
//   - Every function is independently testable.
//   - The component imports from here — never the reverse.
//
// FUNCTIONS:
//   resolveProductImage  — best available image URL, Supabase-optimized
//   formatGTQ            — locale-aware GTQ price format
//   getProductHref       — canonical product URL
//   getProductState      — derives all display booleans from a product

import { getPrimaryImage } from "@/types/artisan";
import { cardImageUrl } from "@/lib/imageUrl";
import { deriveProductStatus } from "@/lib/product-status";
import type { ArtisanProduct } from "@/types/artisan";
import type { ProductCardState } from "@/types/productCard";

// ─── Image ────────────────────────────────────────────────────────────────────

/**
 * Returns the best available image URL for a product card.
 *
 * Resolution order (from getPrimaryImage in types/artisan.ts):
 *   imagen_principal → imagen_url → imagenes[0] → static fallback
 *
 * The resolved URL is then passed through cardImageUrl() which applies
 * the Supabase image transform (640px wide, q75) for Supabase Storage URLs.
 * Non-Supabase URLs and the local fallback path are returned unchanged.
 */
export function resolveProductImage(product: ArtisanProduct): string {
  return cardImageUrl(getPrimaryImage(product));
}

// ─── Price ────────────────────────────────────────────────────────────────────

/**
 * Formats a number as a Guatemalan Quetzal price string.
 *
 * Uses Intl.NumberFormat with the es-GT locale so separators and
 * the currency symbol match Guatemalan convention.
 *
 * @example
 *   formatGTQ(450)    → "Q450"
 *   formatGTQ(1250.5) → "Q1,250"
 *   formatGTQ(0)      → "Q0"
 */
export function formatGTQ(price: number): string {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 0,
  }).format(price);
}

// ─── Routing ──────────────────────────────────────────────────────────────────

/**
 * Returns the canonical URL for a product detail page.
 *
 * Priority:
 *   1. /p/{internal_code}  — SEO-friendly slug route when code exists
 *   2. /product/{id}       — UUID fallback when no internal code
 *
 * The href prop on ProductCardV2 overrides this function entirely —
 * pass href only when you need a non-standard destination.
 */
export function getProductHref(
  product: Pick<ArtisanProduct, "id" | "internal_code">,
): string {
  if (product.internal_code) return `/p/${product.internal_code}`;
  return `/product/${product.id}`;
}

// ─── State derivation ─────────────────────────────────────────────────────────

/**
 * Derives all boolean display state from a product's data fields.
 *
 * This is the single place where product data is translated into
 * rendering decisions. The component reads state from here — it does
 * NOT contain any if/else logic about products.
 *
 * `showDiscoveryBadge` is intentionally NOT included here because it
 * also depends on the `signal` prop (a component concern). Compute it
 * in the component as:
 *   const showDiscoveryBadge = !state.showStatusBadge && signal !== "none" && signal !== "related"
 */
export function getProductState(product: ArtisanProduct): ProductCardState {
  const status = deriveProductStatus(product.stock);
  const isAgotado = status === "agotado";
  const showStatusBadge = status === "pieza_unica" || status === "agotado";

  const reviewCount = product.total_reviews ?? product.rating_count ?? 0;
  const hasRating =
    typeof product.rating_avg === "number" &&
    product.rating_avg > 0 &&
    reviewCount > 0;

  return {
    status,
    isAgotado,
    showStatusBadge,
    hasRating,
    reviewCount,
  };
}
