"use client";

// src/components/home/TrendingSection.tsx

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import { TrendingProducto } from "@/types/home";

type Props = {
  trendingProducts: TrendingProducto[];
};

const formatPrice = (precio: number) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 0,
  }).format(precio);

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-[2px] items-center">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width="9"
          height="9"
          viewBox="0 0 10 10"
          className={n <= Math.round(rating) ? "text-[#0d2d20]" : "text-[#0d2d20]/20"}
          fill="currentColor"
        >
          <path d="M5 1l1.12 2.27L8.5 3.64l-1.75 1.7.41 2.41L5 6.52 2.84 7.75l.41-2.41L1.5 3.64l2.38-.37L5 1z" />
        </svg>
      ))}
    </div>
  );
}

function TrendingCard({
  product,
}: {
  product: TrendingProducto;
}) {
  const [imgError, setImgError] = useState(false);

  const src =
    !imgError && product.imagen_url
      ? product.imagen_url
      : "/images/productos/default.jpg";

  const hasRating =
    product.rating_avg != null && product.rating_avg > 0;

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block"
    >
      <article
        className="
        bg-white
        rounded-sm
        overflow-hidden
        border border-[#0d2d20]/10
        shadow-sm
        transition
        hover:-translate-y-1
        hover:shadow-md
      "
      >
        {/* image */}
        <div className="relative aspect-[3/4] bg-[#ede8e0] overflow-hidden">
          <Image
            src={src}
            alt={product.nombre}
            fill
            sizes="20vw"
            onError={() => setImgError(true)}
            className="
            object-cover
            object-center
            transition-transform duration-700
            group-hover:scale-[1.04]
          "
          />

          <span
            className="
            absolute top-3 left-3
            text-[8px]
            uppercase
            tracking-[0.24em]
            bg-[#0d2d20]/80
            text-white
            px-2 py-[2px]
            rounded-[2px]
          "
          >
            Destacado
          </span>
        </div>

        {/* info */}
        <div className="p-4 space-y-2">

          {hasRating && (
            <div className="flex items-center gap-2">
              <Stars rating={product.rating_avg!} />

              {product.total_reviews != null &&
                product.total_reviews > 0 && (
                  <span className="text-[10px] text-[#0d0d0b]/40 tracking-wide">
                    ({product.total_reviews})
                  </span>
                )}
            </div>
          )}

          <p
            className="
            font-serif italic
            text-[16px]
            text-[#0d0d0b]
            leading-tight
            line-clamp-2
          "
          >
            {product.nombre}
          </p>

          <p
            className="
            text-[11px]
            tracking-[0.12em]
            text-[#0d2d20]/70
          "
          >
            {formatPrice(product.precio)}
          </p>

          <span
            className="
            inline-flex items-center gap-2
            text-[10px]
            uppercase
            tracking-[0.22em]
            text-[#0d2d20]
            border-b border-[#0d2d20]/20
            pb-[2px]
            transition
            group-hover:border-[#0d2d20]/60
          "
          >
            Ver pieza

            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path
                d="M0 4H10M7 1L10.5 4L7 7"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

        </div>
      </article>
    </Link>
  );
}

export default function TrendingSection({ trendingProducts }: Props) {
  if (!trendingProducts?.length) return null;

  return (
    <section className="bg-[#faf7f2] py-24">

      <div className="max-w-7xl mx-auto px-4 md:px-12 space-y-12">

        <SectionHeader
          eyebrow="Selección Flowjuyu"
          title="Piezas destacadas"
          linkHref="/productos"
          linkLabel="Explorar más"
        />

        <div className="h-px bg-gradient-to-r from-[#0d2d20]/20 to-transparent" />

        <div
          className="
          grid
          grid-cols-2 md:grid-cols-4
          gap-6
        "
        >
          {trendingProducts.slice(0, 4).map((p) => (
            <TrendingCard key={p.id} product={p} />
          ))}
        </div>

      </div>

    </section>
  );
}