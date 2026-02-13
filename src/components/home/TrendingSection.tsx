// src/components/home/TrendingSection.tsx

import Link from "next/link";
import FallbackImg from "@/components/FallbackImg";
import { TrendingProducto } from "@/types/home";
import ProductCard from "@/components/ui/ProductCard";
import SectionHeader from "@/components/ui/SectionHeader";

type Props = {
  trendingProducts: TrendingProducto[];
};

export default function TrendingSection({ trendingProducts }: Props) {

  const renderStars = (rating: number) => {
    const full = Math.round(Math.max(0, Math.min(5, rating)));
    return (
      <span className="text-sm text-yellow-600">
        {"★".repeat(full)}
        <span className="text-gray-300">
          {"★".repeat(5 - full)}
        </span>
      </span>
    );
  };

  return (
    <section className="px-4 md:px-12 fade-delay-2">
      <div className="max-w-7xl mx-auto space-y-10">

        <SectionHeader
        eyebrow="Lo más visto"
        title="🔥 Tendencia esta semana"
        linkHref="/productos?sort=trending"
        linkLabel="Ver más"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        {trendingProducts.slice(0, 5).map((p) => (
            <ProductCard
            key={p.id}
            product={p}
            showRating
            />
        ))}
        </div>

      </div>
    </section>
    );
}