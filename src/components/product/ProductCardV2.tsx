// src/components/product/ProductCardV2.tsx
//
// Unified product card for the Flowjuyu marketplace.
//
// ARCHITECTURE
//   Types    → src/types/productCard.ts
//   Tokens   → src/components/product/productCard.tokens.ts
//   Behavior → src/components/product/productCard.behavior.ts
//   Grids    → src/components/product/productGrid.config.ts
//
// This file is ONLY responsible for JSX structure.
// It contains NO business logic and NO inline style values.
//
// VARIANTS
//   "default"  Full card: rating, seller name, view-piece cue.
//              Used in home sections, store grid, catalog.
//   "minimal"  Compact: title + price only. No favorite button.
//              Used in related products, sliders, tight secondary grids.
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import FallbackImg from "@/components/FallbackImg";
import {
  ProductStatusBadge,
  DiscoveryBadge,
} from "@/components/product/ui/StatusBadge";
import { usePrefetch } from "@/hooks/usePrefetch";
import { useLanguage } from "@/i18n/context/useLanguage";
import { createT } from "@/i18n/utils/t";
import esDictionary from "@/i18n/dictionaries/es";
import { getLocalizedField } from "@/lib/getLocalizedField";

import { CARD_TOKENS as T } from "./productCard.tokens";
import {
  resolveProductImage,
  formatGTQ,
  getProductHref,
  getProductState,
} from "./productCard.behavior";

import type { ProductCardV2Props } from "@/types/productCard";

// ─── Re-exports ───────────────────────────────────────────────────────────────
// Convenience: consumers who previously imported utilities from this file
// can keep doing so without updating their imports.

export { resolveProductImage, formatGTQ } from "./productCard.behavior";
export type { ProductCardV2Props } from "@/types/productCard";

// ─── Subcomponent: ProductFavorite ────────────────────────────────────────────

interface ProductFavoriteProps {
  productId: string;
}

function ProductFavorite({ productId }: ProductFavoriteProps) {
  return (
    <div className={T.badge.favoriteSlot}>
      <FavoriteButton productId={productId} size="sm" />
    </div>
  );
}

// ─── Subcomponent: ProductBadge ───────────────────────────────────────────────
// Renders whichever badge has priority: status > discovery > nothing.
// Positioning is handled by StatusBadge/DiscoveryBadge (variant="overlay").

interface ProductBadgeProps {
  showStatusBadge: boolean;
  showDiscoveryBadge: boolean;
  status: import("@/types/artisan").ProductStatus;
  signal: import("@/types/artisan").DiscoverySignal;
  createdAt: string | null | undefined;
  size: "sm" | "md";
}

function ProductBadge({
  showStatusBadge,
  showDiscoveryBadge,
  status,
  signal,
  createdAt,
  size,
}: ProductBadgeProps) {
  if (showStatusBadge) {
    return <ProductStatusBadge status={status} variant="overlay" size={size} />;
  }
  if (showDiscoveryBadge) {
    return (
      <DiscoveryBadge
        signal={signal}
        createdAt={createdAt}
        variant="overlay"
        size={size}
      />
    );
  }
  return null;
}

// ─── Subcomponent: ProductImage ───────────────────────────────────────────────

interface ProductImageProps {
  src: string;
  alt: string;
  isAgotado: boolean;
  showStatusBadge: boolean;
  showDiscoveryBadge: boolean;
  status: import("@/types/artisan").ProductStatus;
  signal: import("@/types/artisan").DiscoverySignal;
  createdAt: string | null | undefined;
  productId: string;
  showFavorite: boolean;
}

function ProductImage({
  src,
  alt,
  isAgotado,
  showStatusBadge,
  showDiscoveryBadge,
  status,
  signal,
  createdAt,
  productId,
  showFavorite,
}: ProductImageProps) {
  return (
    <div className={T.image.wrapper}>
      <FallbackImg
        src={src}
        fallback={T.image.fallback}
        alt={alt}
        className={cn(
          "h-full w-full",
          T.image.base,
          T.image.transition,
          !isAgotado && T.image.hoverScale,
        )}
      />

      <ProductBadge
        showStatusBadge={showStatusBadge}
        showDiscoveryBadge={showDiscoveryBadge}
        status={status}
        signal={signal}
        createdAt={createdAt}
        size="md"
      />

      {showFavorite && <ProductFavorite productId={productId} />}
    </div>
  );
}

// ─── Subcomponent: Stars ─────────────────────────────────────────────────────

function Stars({ rating, count }: { rating: number; count: number }) {
  const filled = Math.round(rating);
  return (
    <div className={T.rating.wrapper}>
      <div className={T.rating.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <svg
            key={n}
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="currentColor"
            aria-hidden
            className={n <= filled ? T.rating.starFilled : T.rating.starEmpty}
          >
            <path d="M5 1l1.12 2.27L8.5 3.64l-1.75 1.7.41 2.41L5 6.52 2.84 7.75l.41-2.41L1.5 3.64l2.38-.37L5 1z" />
          </svg>
        ))}
      </div>
      {count > 0 && (
        <span className={T.rating.count}>{count}</span>
      )}
    </div>
  );
}

// ─── Subcomponent: ViewPieceCue ───────────────────────────────────────────────

function ViewPieceCue({ label }: { label: string }) {
  return (
    <span className={T.cta.viewPiece}>
      {label}
      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden>
        <path
          d="M0 4H10M7 1L10.5 4L7 7"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

// ─── Subcomponent: ProductInfo ────────────────────────────────────────────────

interface ProductInfoProps {
  nombre: string;
  precio: number;
  isMinimal: boolean;
  isAgotado: boolean;
  hasRating: boolean;
  rating: number | undefined;
  reviewCount: number;
  sellerName: string | undefined;
  showSeller: boolean;
  viewPieceLabel: string;
  notAvailableLabel: string;
}

function ProductInfo({
  nombre,
  precio,
  isMinimal,
  isAgotado,
  hasRating,
  rating,
  reviewCount,
  sellerName,
  showSeller,
  viewPieceLabel,
  notAvailableLabel,
}: ProductInfoProps) {
  const variant = isMinimal ? "minimal" : "default";

  return (
    <div className={T.content[variant]}>

      {hasRating && !isMinimal && rating !== undefined && (
        <Stars rating={rating} count={reviewCount} />
      )}

      <p className={cn(T.title.base, T.title.size[variant])}>
        {nombre}
      </p>

      <div className={T.price.wrapper}>
        <span className={cn(T.price.base, T.price.size[variant])}>
          {formatGTQ(precio)}
        </span>
        {!isMinimal && (
          <span className={T.price.suffix}>GTQ</span>
        )}
      </div>

      {showSeller && !isMinimal && sellerName && (
        <p className={T.seller.name}>{sellerName}</p>
      )}

      {!isAgotado && !isMinimal && (
        <ViewPieceCue label={viewPieceLabel} />
      )}

      {isAgotado && !isMinimal && (
        <span className={T.cta.agotadoLabel}>{notAvailableLabel}</span>
      )}

    </div>
  );
}

// ─── ProductCardV2 ────────────────────────────────────────────────────────────

export default function ProductCardV2({
  product,
  variant = "default",
  signal = "none",
  showSeller = false,
  href,
}: ProductCardV2Props) {
  const { language, dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);
  const prefetchHandlers = usePrefetch(`/api/products/${product.id}`);

  // ── Derived values ──────────────────────────────────────────────────────────
  const state = getProductState(product);
  const destination = href ?? getProductHref(product);
  const isMinimal = variant === "minimal";

  const showDiscoveryBadge =
    !state.showStatusBadge && signal !== "none" && signal !== "related";

  const src = resolveProductImage(product);

  const localizedNombre = useMemo(
    () => getLocalizedField(product, "nombre", language) ?? product.nombre,
    [language, product],
  );

  return (
    <Link
      href={destination}
      className={cn(
        "group block",
        state.isAgotado && T.shell.agotadoOpacity,
      )}
      aria-label={localizedNombre}
      {...prefetchHandlers}
    >
      <article
        className={cn(T.shell.base, T.shell.hover, T.shell.transition)}
      >
        <ProductImage
          src={src}
          alt={localizedNombre}
          isAgotado={state.isAgotado}
          showStatusBadge={state.showStatusBadge}
          showDiscoveryBadge={showDiscoveryBadge}
          status={state.status}
          signal={signal}
          createdAt={product.created_at}
          productId={product.id}
          showFavorite={!state.isAgotado && !isMinimal}
        />

        <ProductInfo
          nombre={localizedNombre}
          precio={product.precio}
          isMinimal={isMinimal}
          isAgotado={state.isAgotado}
          hasRating={state.hasRating}
          rating={product.rating_avg}
          reviewCount={state.reviewCount}
          sellerName={product.vendedor?.nombre_comercio ?? undefined}
          showSeller={showSeller}
          viewPieceLabel={tr("pdp.viewPiece")}
          notAvailableLabel={tr("pdp.notAvailable")}
        />
      </article>
    </Link>
  );
}
