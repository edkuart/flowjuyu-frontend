"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import FallbackImg from "@/components/FallbackImg";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Product = {
  id: string;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
  rating_avg?: number | null;
  rating_count?: number | null;
  /** Legacy alias — still accepted */
  total_reviews?: number | null;
};

type Props = {
  product: Product;
  showRating?: boolean;
};

// ─── Star row ─────────────────────────────────────────────────────────────────

function StarRow({
  avg,
  count,
}: {
  avg: number;
  count: number;
}) {
  const filled = Math.round(Math.max(0, Math.min(5, avg)));

  if (count === 0) {
    return (
      <span className="inline-block text-[10px] uppercase tracking-[0.18em] text-[#0d0d0b]/35 font-medium">
        Nuevo
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {/* Stars */}
      <div className="flex gap-[2px]">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={cn(
              "w-3 h-3",
              n <= filled
                ? "fill-[#0d2d20] text-[#0d2d20]"
                : "fill-transparent text-[#0d2d20]/20"
            )}
          />
        ))}
      </div>
      {/* Numeric avg */}
      <span className="text-[11px] font-semibold text-[#0d2d20] tabular-nums leading-none">
        {avg.toFixed(1)}
      </span>
      {/* Count */}
      <span className="text-[10px] text-[#0d0d0b]/40 leading-none">
        ({count})
      </span>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export default function ProductCard({ product, showRating = true }: Props) {
  const avg = Number(product.rating_avg ?? 0);
  const count = Number(product.rating_count ?? product.total_reviews ?? 0);

  return (
    <div className="group relative rounded-sm overflow-hidden bg-white border border-[#0d2d20]/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(13,45,32,0.10)]">
      <Link href={`/product/${product.id}`} className="block">

        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[#ede8e0]">
          <FallbackImg
            src={product.imagen_url}
            fallback="/images/productos/default.jpg"
            alt={product.nombre}
            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
          />
        </div>

        {/* Info */}
        <div className="p-3 space-y-1.5">

          {/* Rating row — always shown when showRating is true */}
          {showRating && (
            <StarRow avg={avg} count={count} />
          )}

          {/* Name */}
          <p className="font-serif italic text-[14px] text-[#0d0d0b] leading-snug line-clamp-2">
            {product.nombre}
          </p>

          {/* Price */}
          <p className="text-sm font-semibold text-[#0d2d20] tracking-tight">
            Q{Number(product.precio).toFixed(2)}
          </p>

        </div>
      </Link>

      {/* Favorite button — outside Link so it never triggers navigation */}
      <div className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <FavoriteButton productId={product.id} size="sm" />
      </div>
    </div>
  );
}
