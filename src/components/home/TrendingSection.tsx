// src/components/home/TrendingSection.tsx

import Link from "next/link";
import { TrendingProducto } from "@/types/home";
import ProductCard from "@/components/ui/ProductCard";
import SectionHeader from "@/components/ui/SectionHeader";

type Props = {
  trendingProducts: TrendingProducto[];
};

export default function TrendingSection({ trendingProducts }: Props) {

  if (!trendingProducts || trendingProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto space-y-12">

        <SectionHeader
          eyebrow="Selección Flowjuyu"
          title="Piezas destacadas"
          linkHref="/productos"
          linkLabel="Explorar más"
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