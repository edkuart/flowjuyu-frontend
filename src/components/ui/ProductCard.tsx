"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import FallbackImg from "@/components/FallbackImg";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { cn } from "@/lib/utils";
import { getProductImage } from "@/lib/getProductImage";
import { useLanguage } from "@/i18n/context/useLanguage";
import { getLocalizedField } from "@/lib/getLocalizedField";

type Product = {
  id: string;
  nombre: string;
  nombre_kiche?: string | null;
  nombre_kaqchikel?: string | null;
  nombre_qeqchi?: string | null;
  precio: number;
  imagen_url?: string | null;
  imagenes?: { url: string }[];
  rating_avg?: number | null;
  rating_count?: number | null;
  total_reviews?: number | null;
};

type Props = {
  product: Product;
  showRating?: boolean;
};

function StarRow({ avg, count }: { avg: number; count: number }) {
  const filled = Math.round(Math.max(0, Math.min(5, avg)));

  if (count === 0) {
    return (
      <span className="inline-block text-[10px] font-medium tracking-[0.18em] text-[#0d0d0b]/35 uppercase">
        Nuevo
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-[2px]">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={cn(
              "h-3 w-3",
              n <= filled
                ? "fill-[#0d2d20] text-[#0d2d20]"
                : "fill-transparent text-[#0d2d20]/20",
            )}
          />
        ))}
      </div>
      <span className="text-[11px] leading-none font-semibold text-[#0d2d20] tabular-nums">
        {avg.toFixed(1)}
      </span>
      <span className="text-[10px] leading-none text-[#0d0d0b]/40">
        ({count})
      </span>
    </div>
  );
}

export default function ProductCard({ product, showRating = true }: Props) {
  const { language } = useLanguage();
  const avg = Number(product.rating_avg ?? 0);
  const count = Number(product.rating_count ?? product.total_reviews ?? 0);
  const localizedNombre =
    getLocalizedField(product, "nombre", language) ?? product.nombre;

  return (
    <div className="group relative overflow-hidden rounded-sm border border-[#0d2d20]/10 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(13,45,32,0.10)]">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#ede8e0]">
          <FallbackImg
            src={getProductImage(product)}
            fallback="/images/productos/default.jpg"
            alt={localizedNombre}
            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
          />
        </div>

        <div className="space-y-1.5 p-3">
          {showRating && <StarRow avg={avg} count={count} />}

          <p className="line-clamp-2 font-serif text-[14px] leading-snug text-[#0d0d0b] italic">
            {localizedNombre}
          </p>

          <p className="text-sm font-semibold tracking-tight text-[#0d2d20]">
            Q{Number(product.precio).toFixed(2)}
          </p>
        </div>
      </Link>

      <div className="absolute top-2.5 right-2.5 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <FavoriteButton productId={product.id} size="sm" />
      </div>
    </div>
  );
}
