"use client";

import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import ProductCardV2 from "@/components/product/ProductCardV2";
import { PRODUCT_GRID } from "@/components/product/productGrid.config";
import {
  useNewProducts,
  type NewProducto as Producto,
} from "@/hooks/useNewProducts";
import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";

function NewProductsSkeleton() {
  return (
    <section className="bg-[#0f2e22] py-16 md:py-20">
      <div className="mx-auto max-w-7xl space-y-10 px-4 md:px-12">
        <div className="space-y-3">
          <div className="h-3 w-40 animate-pulse rounded bg-white/10" />
          <div className="h-7 w-56 animate-pulse rounded bg-white/10" />
        </div>
        <div className={PRODUCT_GRID.new}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] animate-pulse rounded-sm bg-white/5"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function NewProductsSection({
  initialProducts = [],
}: {
  initialProducts?: Producto[];
}) {
  const { data: nuevosProductos, loading } = useNewProducts();
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);
  const products = initialProducts.length ? initialProducts : nuevosProductos;

  if (loading && !initialProducts.length) return <NewProductsSkeleton />;
  if (!products.length) return <NewProductsSkeleton />;

  const items = products.slice(0, 3);

  return (
    <section className="bg-[#0f2e22] py-16 text-white md:py-20">
      <div className="mx-auto max-w-7xl space-y-10 px-4 md:px-12">
        <SectionHeader
          eyebrow={tr("home.newEyebrow")}
          title={tr("home.newTitle")}
          linkHref="/productos?sort=new"
          linkLabel={tr("home.newLink")}
          dark
        />

        <div className={PRODUCT_GRID.new}>
          {items.map((product) => (
            <ProductCardV2
              key={product.id}
              product={product}
              variant="default"
              signal="new"
            />
          ))}
        </div>

        <div className="flex items-center gap-4 pt-2">
          <div className="h-px flex-1 bg-white/10" />
          <Link
            href="/productos?sort=new"
            className="text-[11px] tracking-[0.28em] whitespace-nowrap text-white/50 uppercase transition hover:text-white/90"
          >
            {tr("home.newLink")} →
          </Link>
        </div>
      </div>
    </section>
  );
}
