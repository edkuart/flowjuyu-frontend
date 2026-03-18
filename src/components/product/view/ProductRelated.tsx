// src/components/product/view/ProductRelated.tsx

"use client";

import Link from "next/link";
import ArtisanCard from "@/components/product/ArtisanCard";
import type { ArtisanProduct } from "@/types/artisan";

type Props = {
  productos: ArtisanProduct[];
  sellerName?: string;
  sellerId?: number;
};

export default function ProductRelated({ productos, sellerName, sellerId }: Props) {
  if (!productos || productos.length === 0) return null;

  const visible = productos.slice(0, 4);

  const title = sellerName ? `Más de ${sellerName}` : "Más de esta tienda";

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#0d0d0b]/40 mb-2">
            También te puede interesar
          </p>
          <h2 className="font-serif italic text-[22px] text-[#0d0d0b]">
            {title}
          </h2>
        </div>
        {sellerId && (
          <Link
            href={`/store/${sellerId}`}
            className="hidden sm:block text-[10px] uppercase tracking-[0.20em] text-[#0d0d0b]/40 hover:text-[#0d2d20] transition flex-shrink-0"
          >
            Ver tienda completa →
          </Link>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {visible.map((p) => (
          <ArtisanCard key={p.id} product={p} signal="related" size="sm" />
        ))}
      </div>

      {/* Mobile CTA */}
      {sellerId && (
        <div className="sm:hidden text-center">
          <Link
            href={`/store/${sellerId}`}
            className="inline-block text-[10px] uppercase tracking-[0.20em] text-[#0d2d20] border border-[#0d2d20]/30 px-5 py-3 hover:border-[#0d2d20]/60 transition"
          >
            Ver tienda completa →
          </Link>
        </div>
      )}

    </div>
  );
}
