// src/components/product/ProductCardV2.tsx
//
// Unified product card for the Flowjuyu marketplace.
//
// Variants:
//   "default"  — full card with rating, seller cue, and "Ver pieza" link.
//                Used in home sections (trending, recommended, new arrivals).
//   "minimal"  — compact card with title + price only.
//                Used in related products, sliders, and tight grids.
//
// Utilities exported for reuse:
//   resolveProductImage(product) — picks best image + Supabase optimizer
//   formatGTQ(price)             — locale-aware GTQ currency format
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import {
  ProductStatusBadge,
  DiscoveryBadge,
} from "@/components/product/ui/StatusBadge";
import { deriveProductStatus } from "@/lib/product-status";
import { cardImageUrl } from "@/lib/imageUrl";
import { getPrimaryImage } from "@/types/artisan";
import { usePrefetch } from "@/hooks/usePrefetch";
import { useLanguage } from "@/i18n/context/useLanguage";
import { createT } from "@/i18n/utils/t";
import esDictionary from "@/i18n/dictionaries/es";
import { getLocalizedField } from "@/lib/getLocalizedField";
import type { ArtisanProduct, DiscoverySignal } from "@/types/artisan";

// ─── Exported utilities ───────────────────────────────────────────────────────

/**
 * Picks the best available image from a product and runs it through
 * the Supabase card-size optimizer (640 px wide, q75).
 * Non-Supabase URLs and the local fallback path are returned unchanged.
 */
export function resolveProductImage(product: ArtisanProduct): string {
  return cardImageUrl(getPrimaryImage(product));
}

/**
 * Formats a price in Guatemalan Quetzales using locale-aware Intl.
 * Example: 450 → "Q450"   |   1250.5 → "Q1,250"
 */
export function formatGTQ(price: number): string {
  return new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 0,
  }).format(price);
}

// ─── Internal sub-components ──────────────────────────────────────────────────

function Stars({ rating, count }: { rating: number; count: number }) {
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-[6px]">
      <div className="flex gap-[2px]">
        {[1, 2, 3, 4, 5].map((n) => (
          <svg
            key={n}
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="currentColor"
            aria-hidden
            className={n <= filled ? "text-[#0d2d20]" : "text-[#0d2d20]/20"}
          >
            <path d="M5 1l1.12 2.27L8.5 3.64l-1.75 1.7.41 2.41L5 6.52 2.84 7.75l.41-2.41L1.5 3.64l2.38-.37L5 1z" />
          </svg>
        ))}
      </div>
      {count > 0 && (
        <span className="text-[11px] leading-none text-[#0d0d0b]/50">
          {count}
        </span>
      )}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ProductCardV2Props {
  product: ArtisanProduct;
  /**
   * Visual layout variant.
   * - "default"  Full card: rating, seller, view-piece cue. Default.
   * - "minimal"  Compact: title + price only. No favorite button.
   */
  variant?: "default" | "minimal";
  /**
   * Discovery badge shown in the top-left corner of the image.
   * Status badges (pieza_unica / agotado) take visual priority over this.
   * Default: "none"
   */
  signal?: DiscoverySignal;
  /** Show the seller name row below the price. Default: false */
  showSeller?: boolean;
  /**
   * Override the card destination URL.
   * Default: /product/{id}
   * Pass /p/{internal_code} when the product has an internal_code.
   */
  href?: string;
  /** Passed to Next/Image `sizes`. Falls back to sensible per-variant defaults. */
  imageSizes?: string;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const DEFAULT_SIZES: Record<"default" | "minimal", string> = {
  default: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  minimal: "(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw",
};

export default function ProductCardV2({
  product,
  variant = "default",
  signal = "none",
  showSeller = false,
  href,
  imageSizes,
  className,
}: ProductCardV2Props) {
  const [imgError, setImgError] = useState(false);
  const { language, dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);
  const prefetchHandlers = usePrefetch(`/api/products/${product.id}`);

  const destination = href ?? `/product/${product.id}`;

  const localizedNombre = useMemo(
    () => getLocalizedField(product, "nombre", language) ?? product.nombre,
    [language, product],
  );

  const src = imgError
    ? "/images/productos/default.jpg"
    : resolveProductImage(product);

  // Stock → status → visual rules
  const status = deriveProductStatus(product.stock);
  const isAgotado = status === "agotado";
  const showStatusBadge = status === "pieza_unica" || status === "agotado";
  const showDiscoveryBadge =
    !showStatusBadge && signal !== "none" && signal !== "related";

  // Rating is shown in "default" only when there are actual reviews
  const reviewCount = product.total_reviews ?? product.rating_count ?? 0;
  const hasRating =
    !!product.rating_avg && product.rating_avg > 0 && reviewCount > 0;

  const isMinimal = variant === "minimal";
  const sizes = imageSizes ?? DEFAULT_SIZES[variant];

  return (
    <Link
      href={destination}
      className={cn("group block", isAgotado && "opacity-60", className)}
      aria-label={localizedNombre}
      {...prefetchHandlers}
    >
      <article className="overflow-hidden rounded-sm border border-[#0d2d20]/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(13,45,32,0.10)]">

        {/* ── Image ──────────────────────────────────────────────────────────── */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[#ede8e0]">
          <Image
            src={src}
            alt={localizedNombre}
            fill
            sizes={sizes}
            className={cn(
              "object-cover object-center transition-transform duration-700",
              !isAgotado && "group-hover:scale-[1.04]",
            )}
            onError={() => setImgError(true)}
          />

          {/* Status badge (pieza_unica / agotado) — top-left */}
          {showStatusBadge && (
            <ProductStatusBadge
              status={status}
              variant="overlay"
              size={isMinimal ? "sm" : "md"}
            />
          )}

          {/* Discovery badge (trending / new / featured) — top-left */}
          {showDiscoveryBadge && (
            <DiscoveryBadge
              signal={signal}
              createdAt={product.created_at}
              variant="overlay"
              size={isMinimal ? "sm" : "md"}
            />
          )}

          {/* Favorite button — top-right, hover-reveal, hidden when agotado */}
          {!isAgotado && !isMinimal && (
            <div className="absolute top-3 right-3 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <FavoriteButton productId={product.id} size="sm" />
            </div>
          )}
        </div>

        {/* ── Content ────────────────────────────────────────────────────────── */}
        <div className={cn(isMinimal ? "space-y-2 p-3" : "space-y-[10px] p-4")}>

          {/* Rating — default variant only */}
          {hasRating && !isMinimal && (
            <Stars rating={product.rating_avg!} count={reviewCount} />
          )}

          {/* Title */}
          <p
            className={cn(
              "line-clamp-2 font-serif italic leading-snug text-[#0d0d0b]",
              isMinimal ? "text-[13px]" : "text-[15px]",
            )}
          >
            {localizedNombre}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                "font-semibold tracking-wide text-[#0d2d20]",
                isMinimal ? "text-[12px]" : "text-[13px]",
              )}
            >
              {formatGTQ(product.precio)}
            </span>
            {!isMinimal && (
              <span className="text-[10px] tracking-wide text-[#0d0d0b]/35">
                GTQ
              </span>
            )}
          </div>

          {/* Seller name — default only, when showSeller=true */}
          {showSeller && !isMinimal && product.vendedor?.nombre_comercio && (
            <p className="truncate text-[10px] tracking-[0.18em] text-[#0d0d0b]/40 uppercase">
              {product.vendedor.nombre_comercio}
            </p>
          )}

          {/* View-piece cue — default only, not when agotado */}
          {!isAgotado && !isMinimal && (
            <span className="inline-flex items-center gap-2 border-b border-[#0d2d20]/25 pb-[2px] text-[10px] tracking-[0.22em] text-[#0d2d20] uppercase transition-colors group-hover:border-[#0d2d20]/70">
              {tr("pdp.viewPiece")}
              <svg
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
                aria-hidden
              >
                <path
                  d="M0 4H10M7 1L10.5 4L7 7"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}

          {/* Agotado label — default only */}
          {isAgotado && !isMinimal && (
            <span className="text-[10px] tracking-[0.22em] text-[#0d0d0b]/30 uppercase">
              {tr("pdp.notAvailable")}
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}
