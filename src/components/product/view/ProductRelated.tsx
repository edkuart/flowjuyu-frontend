// src/components/product/view/ProductRelated.tsx

"use client";

import Link from "next/link";
import ProductCardV2 from "@/components/product/ProductCardV2";
import { PRODUCT_GRID } from "@/components/product/productGrid.config";
import type { ArtisanProduct } from "@/types/artisan";
import { useLanguage } from "@/i18n/context/useLanguage";
import { createT } from "@/i18n/utils/t";
import esDictionary from "@/i18n/dictionaries/es";

type Props = {
  productos: ArtisanProduct[];
  sellerName?: string;
  sellerId?: number;
};

export default function ProductRelated({ productos, sellerName, sellerId }: Props) {
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  if (!productos || productos.length === 0) return null;

  const visible = productos.slice(0, 4);
  const title = sellerName
    ? `${tr("pdp.relatedMoreFrom")} ${sellerName}`
    : tr("pdp.relatedMoreFromStore");

  return (
    <div className="space-y-8">

      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#0d0d0b]/40 mb-2">
            {tr("pdp.relatedEyebrow")}
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
            {tr("pdp.viewFullStore")}
          </Link>
        )}
      </div>

      <div className={PRODUCT_GRID.related}>
        {visible.map((p) => (
          <ProductCardV2 key={p.id} product={p} variant="minimal" />
        ))}
      </div>

      {sellerId && (
        <div className="sm:hidden text-center">
          <Link
            href={`/store/${sellerId}`}
            className="inline-block text-[10px] uppercase tracking-[0.20em] text-[#0d2d20] border border-[#0d2d20]/30 px-5 py-3 hover:border-[#0d2d20]/60 transition"
          >
            {tr("pdp.viewFullStore")}
          </Link>
        </div>
      )}

    </div>
  );
}
