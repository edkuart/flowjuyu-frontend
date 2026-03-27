// src/components/product/ArtisanCard.tsx
//
// COMPONENTE UNIFICADO de card de producto.
// Reemplaza TrendingCard, EditorialCard y las cards internas de ProductRelated.
//
// Reglas de badge (una sola badge a la vez, prioridad availability > discovery):
//   stock === 0  → "Agotado"
//   stock === 1  → "Última pieza"
//   signal=trending|featured → badge de descubrimiento
//   signal=new   → label temporal ("Llegó hoy", "Hace 3 días")
//   disponible sin señal → sin badge (no añadir ruido)
//
// Favorite button: visible en hover (top-right de imagen) — persiste en backend API

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductStatusBadge, DiscoveryBadge } from "@/components/product/ui/StatusBadge";
import { deriveProductStatus } from "@/lib/product-status";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import type { ArtisanProduct, DiscoverySignal } from "@/types/artisan";
import { cardImageUrl } from "@/lib/imageUrl";
import { usePrefetch } from "@/hooks/usePrefetch";

/* ─── Price formatter ─────────────────────────────────────── */

const formatPrice = (n: number) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 0,
  }).format(n);

/* ─── Stars ───────────────────────────────────────────────── */

function Stars({ rating, count }: { rating: number; count: number }) {
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
            className={n <= Math.round(rating) ? "text-[#0d2d20]" : "text-[#0d2d20]/20"}
          >
            <path d="M5 1l1.12 2.27L8.5 3.64l-1.75 1.7.41 2.41L5 6.52 2.84 7.75l.41-2.41L1.5 3.64l2.38-.37L5 1z" />
          </svg>
        ))}
      </div>
      {count > 0 && (
        <span className="text-[11px] text-[#0d0d0b]/55">
          {count} {count === 1 ? "reseña" : "reseñas"}
        </span>
      )}
    </div>
  );
}

/* ─── Props ───────────────────────────────────────────────── */

interface ArtisanCardProps {
  product: ArtisanProduct;
  signal?: DiscoverySignal;
  /** Muestra el nombre del vendedor debajo del precio */
  showSeller?: boolean;
  /** Tamaño del badge y texto. "sm" para grids compactos, "md" para estándar */
  size?: "sm" | "md";
}

/* ─── Component ───────────────────────────────────────────── */

export default function ArtisanCard({
  product,
  signal = "none",
  showSeller = false,
  size = "md",
}: ArtisanCardProps) {
  const [imgError, setImgError] = useState(false);
  const prefetchHandlers = usePrefetch(`/api/products/${product.id}`);

  const rawSrc = !imgError ? (product.imagen_principal || product.imagen_url) : null;
  const src    = rawSrc ? cardImageUrl(rawSrc) : "/images/productos/default.jpg";

  const status = deriveProductStatus(product.stock);
  const isAgotado = status === "agotado";

  const showStatusBadge = status === "pieza_unica" || status === "agotado";
  const showDiscoveryBadge = !showStatusBadge && signal !== "none" && signal !== "related";

  const reviewCount = product.total_reviews ?? product.rating_count ?? 0;
  const hasRating = !!(product.rating_avg && product.rating_avg > 0 && reviewCount > 0);

  const sellerName = product.vendedor?.nombre_comercio;

  return (
    <Link
      href={`/product/${product.id}`}
      className={`group block${isAgotado ? " opacity-60" : ""}`}
      aria-label={product.nombre}
      {...prefetchHandlers}
    >
      <article className="bg-white rounded-sm overflow-hidden border border-[#0d2d20]/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(13,45,32,0.10)]">

        {/* ── Imagen ── */}
        <div className="relative aspect-[3/4] bg-[#ede8e0] overflow-hidden">
          <Image
            src={src}
            alt={product.nombre}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover object-center transition-transform duration-700${
              isAgotado ? "" : " group-hover:scale-[1.04]"
            }`}
            onError={() => setImgError(true)}
          />

          {/* Status / discovery badge (izquierda) */}
          {showStatusBadge && (
            <ProductStatusBadge status={status} variant="overlay" size={size} />
          )}
          {showDiscoveryBadge && (
            <DiscoveryBadge
              signal={signal}
              createdAt={product.created_at}
              variant="overlay"
              size={size}
            />
          )}

          {/* Favorite button — aparece en hover, top-right */}
          {!isAgotado && (
            <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <FavoriteButton productId={product.id} size="sm" />
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div className={`${size === "sm" ? "p-3 space-y-2" : "p-4 space-y-[10px]"}`}>

          {/* Rating — solo cuando hay datos reales */}
          {hasRating && (
            <Stars rating={product.rating_avg!} count={reviewCount} />
          )}

          {/* Nombre */}
          <p className={`font-serif italic text-[#0d0d0b] leading-snug line-clamp-2${
            size === "sm" ? " text-[13px]" : " text-[15px]"
          }`}>
            {product.nombre}
          </p>

          {/* Precio */}
          <div className="flex items-baseline gap-2">
            <p className={`font-semibold tracking-wide text-[#0d2d20]${
              size === "sm" ? " text-[12px]" : " text-[13px]"
            }`}>
              {formatPrice(product.precio)}
            </p>
            <span className="text-[10px] text-[#0d0d0b]/35 tracking-wide">GTQ</span>
          </div>

          {/* Vendedor — opcional */}
          {showSeller && sellerName && (
            <p className="text-[10px] text-[#0d0d0b]/40 uppercase tracking-[0.18em] truncate">
              {sellerName}
            </p>
          )}

          {/* CTA inline — microcopy específico */}
          {!isAgotado && (
            <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[#0d2d20] border-b border-[#0d2d20]/25 pb-[2px] transition group-hover:border-[#0d2d20]/70">
              Ver esta pieza
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
          )}

          {/* Agotado — sin CTA pero con estado claro */}
          {isAgotado && (
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#0d0d0b]/30">
              No disponible
            </span>
          )}

        </div>
      </article>
    </Link>
  );
}
