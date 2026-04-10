// src/types/productCard.ts
//
// Single import point for all product card types.
//
// DESIGN RULE:
//   ArtisanProduct in types/artisan.ts is the canonical marketplace product type.
//   We do NOT redefine it here — we re-export it under the card-system name so
//   that consumers of the card system have one import location.
//
//   import type { ProductCardProduct, ProductCardV2Props } from "@/types/productCard";
//
// Adding fields to the product shape? Edit ArtisanProduct in types/artisan.ts,
// not this file.

import type { ProductStatus } from "@/types/artisan";

export type { ArtisanProduct as ProductCardProduct } from "@/types/artisan";
export type { DiscoverySignal } from "@/types/artisan";

// ─── Variant ──────────────────────────────────────────────────────────────────
//
// "default"  — full card: rating, seller, view-piece cue.
//              Use in all primary grids (home, store, catalog).
// "minimal"  — compact: title + price only. No favorite button.
//              Use in related products, sliders, tight secondary grids.

export type ProductCardVariant = "default" | "minimal";

// ─── Computed product state ───────────────────────────────────────────────────
//
// Returned by getProductState() in productCard.behavior.ts.
// Contains all booleans derived from the product at render time.
// Kept as a named type so callers can annotate without re-deriving.

export interface ProductCardState {
  /** Availability status derived from stock field */
  status: ProductStatus;
  /** stock === 0 → product cannot be purchased */
  isAgotado: boolean;
  /**
   * True when a status badge (pieza_unica / agotado) should render.
   * Status badges take visual priority over discovery badges.
   */
  showStatusBadge: boolean;
  /** True when rating_avg > 0 and at least one review exists */
  hasRating: boolean;
  /** Coalesced review count: total_reviews ?? rating_count ?? 0 */
  reviewCount: number;
}

// ─── Component props ──────────────────────────────────────────────────────────

export interface ProductCardV2Props {
  /** Canonical product. Accepts any structural subtype of ArtisanProduct. */
  product: import("@/types/artisan").ArtisanProduct;

  /**
   * Visual layout variant. Default: "default"
   */
  variant?: ProductCardVariant;

  /**
   * Discovery badge shown in the top-left corner of the image.
   * Status badges (pieza_unica / agotado) take priority.
   * Default: "none"
   */
  signal?: import("@/types/artisan").DiscoverySignal;

  /**
   * Show the seller name row below the price.
   * Requires product.vendedor.nombre_comercio to be set.
   * Default: false
   */
  showSeller?: boolean;

  /**
   * Override the card link destination.
   * Default: derived by getProductHref() — prefers /p/{internal_code}, falls back to /product/{id}
   */
  href?: string;

  /**
   * Forwarded to Next/Image `sizes` attribute.
   * Default: per-variant value from CARD_TOKENS.imageSizes
   */
  imageSizes?: string;

  // className is intentionally absent.
  // External style injection breaks visual consistency guarantees.
  // To change card appearance, edit productCard.tokens.ts.
}
