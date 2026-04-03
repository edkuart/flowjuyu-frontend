"use client";

import {
  ProductContactCTA,
  type ProductContactCTAProps,
} from "./ProductContactCTA";
import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";

const formatPrice = (n: number) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 0,
  }).format(n);

type Props = Omit<ProductContactCTAProps, "compact"> & {
  precio: number;
};

export function ProductStickyBar({ precio, ...ctaProps }: Props) {
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  return (
    <div
      className="fixed right-0 bottom-0 left-0 z-50 flex items-center gap-3 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur-sm md:hidden"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-[10px] leading-none tracking-wide text-neutral-400 uppercase">
          {tr("pdp.stickyLabel")}
        </p>
        <p className="truncate text-lg leading-none font-bold text-[#0d2d20] tabular-nums">
          {formatPrice(precio)}
        </p>
      </div>

      <div className="w-[180px] flex-shrink-0">
        <ProductContactCTA {...ctaProps} compact />
      </div>
    </div>
  );
}
