"use client";

// src/components/home/TrendingSection.tsx

import SectionHeader from "@/components/ui/SectionHeader";
import ArtisanCard from "@/components/product/ArtisanCard";
import { TrendingProducto } from "@/types/home";
import type { ArtisanProduct } from "@/types/artisan";

type Props = {
  trendingProducts: TrendingProducto[];
};

// TrendingProducto es compatible con ArtisanProduct — mismos campos
function toArtisanProduct(p: TrendingProducto): ArtisanProduct {
  return {
    id: p.id,
    nombre: p.nombre,
    precio: p.precio,
    imagen_url: p.imagen_url,
    rating_avg: p.rating_avg,
    total_reviews: p.total_reviews,
    trending_score: p.trending_score,
  };
}

export default function TrendingSection({ trendingProducts }: Props) {
  if (!trendingProducts?.length) return null;

  return (
    <section className="bg-[#faf7f2] py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-12 space-y-10">

        <SectionHeader
          eyebrow="Lo que nadie quiere dejar ir"
          title="Piezas que no se olvidan"
          linkHref="/productos"
          linkLabel="Ver el catálogo completo"
        />

        <div className="h-px bg-gradient-to-r from-[#0d2d20]/20 to-transparent" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {trendingProducts.slice(0, 4).map((p) => (
            <ArtisanCard
              key={p.id}
              product={toArtisanProduct(p)}
              signal="trending"
            />
          ))}
        </div>

      </div>
    </section>
  );
}
