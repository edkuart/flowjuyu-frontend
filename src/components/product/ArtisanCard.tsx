// src/components/product/ArtisanCard.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ProductStatusBadge,
  DiscoveryBadge,
} from "@/components/product/ui/StatusBadge";
import { deriveProductStatus } from "@/lib/product-status";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import type { ArtisanProduct, DiscoverySignal } from "@/types/artisan";
import { cardImageUrl } from "@/lib/imageUrl";
import { usePrefetch } from "@/hooks/usePrefetch";
import { useLanguage } from "@/i18n/context/useLanguage";
import { createT } from "@/i18n/utils/t";
import esDictionary from "@/i18n/dictionaries/es";
import { getLocalizedField } from "@/lib/getLocalizedField";

const formatPrice = (n: number) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 0,
  }).format(n);

function Stars({ rating, count, tr }: { rating: number; count: number; tr: ReturnType<typeof createT> }) {
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
            className={
              n <= Math.round(rating) ? "text-[#0d2d20]" : "text-[#0d2d20]/20"
            }
          >
            <path d="M5 1l1.12 2.27L8.5 3.64l-1.75 1.7.41 2.41L5 6.52 2.84 7.75l.41-2.41L1.5 3.64l2.38-.37L5 1z" />
          </svg>
        ))}
      </div>
      {count > 0 && (
        <span className="text-[11px] text-[#0d0d0b]/55">
          {count} {count === 1 ? tr("pdp.review") : tr("pdp.reviews")}
        </span>
      )}
    </div>
  );
}

interface ArtisanCardProps {
  product: ArtisanProduct;
  signal?: DiscoverySignal;
  showSeller?: boolean;
  size?: "sm" | "md";
}

export default function ArtisanCard({
  product,
  signal = "none",
  showSeller = false,
  size = "md",
}: ArtisanCardProps) {
  const [imgError, setImgError] = useState(false);
  const { language, dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);
  const prefetchHandlers = usePrefetch(`/api/products/${product.id}`);

  const localizedNombre = useMemo(
    () => getLocalizedField(product, "nombre", language) ?? product.nombre,
    [language, product],
  );

  const rawSrc = !imgError
    ? product.imagen_principal || product.imagen_url
    : null;
  const src = rawSrc ? cardImageUrl(rawSrc) : "/images/productos/default.jpg";

  const status = deriveProductStatus(product.stock);
  const isAgotado = status === "agotado";
  const showStatusBadge = status === "pieza_unica" || status === "agotado";
  const showDiscoveryBadge =
    !showStatusBadge && signal !== "none" && signal !== "related";

  const reviewCount = product.total_reviews ?? product.rating_count ?? 0;
  const hasRating = !!(
    product.rating_avg &&
    product.rating_avg > 0 &&
    reviewCount > 0
  );
  const sellerName = product.vendedor?.nombre_comercio;

  return (
    <Link
      href={`/product/${product.id}`}
      className={`group block${isAgotado ? "opacity-60" : ""}`}
      aria-label={localizedNombre}
      {...prefetchHandlers}
    >
      <article className="overflow-hidden rounded-sm border border-[#0d2d20]/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(13,45,32,0.10)]">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#ede8e0]">
          <Image
            src={src}
            alt={localizedNombre}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover object-center transition-transform duration-700${isAgotado ? "" : "group-hover:scale-[1.04]"}`}
            onError={() => setImgError(true)}
          />

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

          {!isAgotado && (
            <div className="absolute top-3 right-3 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <FavoriteButton productId={product.id} size="sm" />
            </div>
          )}
        </div>

        <div
          className={`${size === "sm" ? "space-y-2 p-3" : "space-y-[10px] p-4"}`}
        >
          {hasRating && (
            <Stars rating={product.rating_avg!} count={reviewCount} tr={tr} />
          )}

          <p
            className={`font-serif leading-snug text-[#0d0d0b] italic line-clamp-2${size === "sm" ? "text-[13px]" : "text-[15px]"}`}
          >
            {localizedNombre}
          </p>

          <div className="flex items-baseline gap-2">
            <p
              className={`font-semibold tracking-wide text-[#0d2d20]${size === "sm" ? "text-[12px]" : "text-[13px]"}`}
            >
              {formatPrice(product.precio)}
            </p>
            <span className="text-[10px] tracking-wide text-[#0d0d0b]/35">
              GTQ
            </span>
          </div>

          {showSeller && sellerName && (
            <p className="truncate text-[10px] tracking-[0.18em] text-[#0d0d0b]/40 uppercase">
              {sellerName}
            </p>
          )}

          {!isAgotado && (
            <span className="inline-flex items-center gap-2 border-b border-[#0d2d20]/25 pb-[2px] text-[10px] tracking-[0.22em] text-[#0d2d20] uppercase transition group-hover:border-[#0d2d20]/70">
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

          {isAgotado && (
            <span className="text-[10px] tracking-[0.22em] text-[#0d0d0b]/30 uppercase">
              {tr("pdp.notAvailable")}
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}
