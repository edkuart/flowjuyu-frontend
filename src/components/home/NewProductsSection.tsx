"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import SectionHeader from "@/components/ui/SectionHeader";
import {
  useNewProducts,
  type NewProducto as Producto,
} from "@/hooks/useNewProducts";
import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";
import { getProductImage } from "@/lib/getProductImage";
import { getLocalizedField } from "@/lib/getLocalizedField";

function NewProductsSkeleton() {
  return (
    <section className="bg-[#0f2e22] py-16 md:py-20">
      <div className="mx-auto max-w-7xl space-y-10 px-4 md:px-12">
        <div className="space-y-3">
          <div className="h-3 w-40 animate-pulse rounded bg-white/10" />
          <div className="h-7 w-56 animate-pulse rounded bg-white/10" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
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

const formatPrice = (precio: number) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 0,
  }).format(precio);

function getDaysAgoLabel(
  dateStr: string | null | undefined,
  tr: ReturnType<typeof createT>,
): string | null {
  if (!dateStr) return null;
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return tr("home.newBadgeArrivedToday");
  if (diff === 1) return tr("home.newBadgeArrivedYesterday");
  if (diff <= 7)
    return tr("home.newBadgeArrivedDays").replace("{days}", String(diff));
  return null;
}

function NewProductCard({ product }: { product: Producto }) {
  const [imgError, setImgError] = useState(false);
  const { dictionary, language } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  const localizedNombre = useMemo(
    () => getLocalizedField(product, "nombre", language) ?? product.nombre,
    [language, product],
  );

  const src = !imgError
    ? getProductImage(product, "/images/productos/default.jpg")
    : "/images/productos/default.jpg";

  const daysAgoLabel = getDaysAgoLabel(product.created_at, tr);

  return (
    <Link
      href={`/product/${product.id}`}
      className="group relative block overflow-hidden bg-[#0a2219]"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={src}
          alt={localizedNombre}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
          onError={() => setImgError(true)}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

        <div className="absolute top-4 left-4 flex flex-col gap-[6px]">
          <span className="border border-white/20 bg-white/15 px-2 py-[4px] text-[9px] tracking-[0.28em] text-white uppercase backdrop-blur-sm">
            {daysAgoLabel ?? tr("home.newBadgeNew")}
          </span>
        </div>

        <div className="absolute top-4 right-4 z-10">
          <FavoriteButton productId={product.id} size="sm" />
        </div>

        <div className="absolute bottom-0 w-full p-5 text-white">
          <div className="mb-3 h-[1px] w-7 bg-white/35 transition-all duration-500 group-hover:w-14" />
          <p className="line-clamp-2 font-serif text-base leading-snug italic md:text-lg">
            {localizedNombre}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[12px] tracking-[0.15em] text-white/60">
              {formatPrice(product.precio)}
            </p>
            <span className="text-[9px] tracking-[0.22em] text-white/40 uppercase transition group-hover:text-white/70">
              {tr("home.viewPiece")} →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function NewProductsSection() {
  const { data: nuevosProductos, loading } = useNewProducts();
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  if (loading) return <NewProductsSkeleton />;
  if (!nuevosProductos.length) return <NewProductsSkeleton />;

  const items = nuevosProductos.slice(0, 3);

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

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {items.map((product) => (
            <NewProductCard key={product.id} product={product} />
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
