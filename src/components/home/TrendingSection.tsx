"use client";

import SectionHeader from "@/components/ui/SectionHeader";
import ArtisanCard from "@/components/product/ArtisanCard";
import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";
import type { ArtisanProduct } from "@/types/artisan";

type TrendingProducto = {
  id: string;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
  rating_avg?: number;
  total_reviews?: number;
  trending_score?: number;
};

type Props = {
  trendingProducts: TrendingProducto[];
};

function toArtisanProduct(p: TrendingProducto): ArtisanProduct {
  return {
    id: p.id,
    nombre: p.nombre,
    precio: p.precio,
    imagen_url: p.imagen_url,
    rating_avg: p.rating_avg ?? 0,
    total_reviews: p.total_reviews ?? 0,
    trending_score: p.trending_score ?? 0,
  };
}

function TrendingSkeleton() {
  return (
    <section className="bg-[#faf7f2] py-16 md:py-20">
      <div className="mx-auto max-w-7xl space-y-10 px-4 md:px-12">
        <div className="space-y-3">
          <div className="h-3 w-44 rounded bg-[#0d2d20]/8" />
          <div className="h-7 w-60 rounded bg-[#0d2d20]/8" />
        </div>
        <div className="h-px bg-gradient-to-r from-[#0d2d20]/20 to-transparent" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-sm bg-[#0d2d20]/6" />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function TrendingSection({ trendingProducts }: Props) {
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  if (!trendingProducts?.length) return <TrendingSkeleton />;

  return (
    <section className="bg-[#faf7f2] py-16 md:py-20">
      <div className="mx-auto max-w-7xl space-y-10 px-4 md:px-12">
        <SectionHeader
          eyebrow={tr("home.trendingEyebrow")}
          title={tr("home.trendingTitle")}
          linkHref="/productos"
          linkLabel={tr("home.trendingLink")}
        />

        <div className="h-px bg-gradient-to-r from-[#0d2d20]/20 to-transparent" />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
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
