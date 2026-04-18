"use client";

import SectionHeader from "@/components/ui/SectionHeader";
import ProductCardV2 from "@/components/product/ProductCardV2";
import { PRODUCT_GRID } from "@/components/product/productGrid.config";
import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";

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

function TrendingSkeleton() {
  return (
    <section className="relative overflow-hidden bg-[#f3f0e8] py-20 md:py-24">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#0d2d20]/12 to-transparent" />
      <div className="mx-auto max-w-7xl space-y-10 px-4 md:px-12">
        <div className="space-y-3">
          <div className="h-3 w-44 rounded bg-[#0d2d20]/8" />
          <div className="h-7 w-60 rounded bg-[#0d2d20]/8" />
        </div>
        <div className="h-px bg-gradient-to-r from-[#0d2d20]/20 to-transparent" />
        <div className={PRODUCT_GRID.home}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] rounded-sm bg-[#0d2d20]/6" />
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
    <section className="relative overflow-hidden bg-[#f3f0e8] py-20 md:py-24">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#0d2d20]/12 to-transparent" />
      <div className="mx-auto max-w-7xl space-y-10 px-4 md:px-12">
        <SectionHeader
          eyebrow={tr("home.trendingEyebrow")}
          title={tr("home.trendingTitle")}
          linkHref="/productos"
          linkLabel={tr("home.trendingLink")}
        />

        <div className="h-px bg-gradient-to-r from-[#0d2d20]/20 to-transparent" />

        <div className={PRODUCT_GRID.home}>
          {trendingProducts.slice(0, 4).map((p) => (
            <ProductCardV2
              key={p.id}
              product={p}
              signal="trending"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
