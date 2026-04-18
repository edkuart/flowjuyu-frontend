"use client";

import Link from "next/link";
import SectionHeader from "@/components/ui/SectionHeader";
import FallbackImg from "@/components/FallbackImg";
import {
  useNewProducts,
  type NewProducto as Producto,
} from "@/hooks/useNewProducts";
import { getProductImage } from "@/lib/getProductImage";
import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";

/* ─── Skeleton ───────────────────────────────────────────────────────── */

function NewProductsSkeleton() {
  return (
    <section className="relative overflow-hidden bg-[#0f2e22] py-20 md:py-24">
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />
      <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-black/25 to-transparent pointer-events-none" />
      <div className="relative mx-auto max-w-7xl space-y-10 px-4 md:px-12">
        <div className="space-y-3">
          <div className="h-3 w-40 animate-pulse rounded bg-white/10" />
          <div className="h-7 w-56 animate-pulse rounded bg-white/10" />
        </div>
        {/* Skeleton mosaic track */}
        <div className="flex gap-3 overflow-x-hidden pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex shrink-0 gap-3">
              <div className="h-[380px] w-[240px] animate-pulse rounded-sm bg-white/5 md:h-[440px] md:w-[280px]" />
              <div className="flex w-[160px] flex-col gap-3 md:w-[185px]">
                <div className="flex-1 animate-pulse rounded-sm bg-white/5" />
                <div className="flex-1 animate-pulse rounded-sm bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Mosaic group: 1 tall card + 2 stacked small cards ─────────────── */

type MosaicGroupProps = {
  tall: Producto;
  small1: Producto;
  small2?: Producto;
  groupIndex: number;
};

function MosaicGroup({ tall, small1, small2, groupIndex }: MosaicGroupProps) {
  const tallSrc  = getProductImage(tall,   "/images/productos/default.jpg");
  const s1Src    = getProductImage(small1, "/images/productos/default.jpg");
  const s2Src    = small2 ? getProductImage(small2, "/images/productos/default.jpg") : s1Src;
  const isFirst  = groupIndex === 0;

  return (
    <div className="flex shrink-0 gap-3">
      {/* ── Tall card ── */}
      <Link
        href={`/product/${tall.id}`}
        className="group relative block h-[380px] w-[240px] overflow-hidden rounded-sm bg-[#1a3d2e] ring-1 ring-white/8 md:h-[440px] md:w-[280px]"
        aria-label={`Ver ${tall.nombre}`}
      >
        <FallbackImg
          src={tallSrc}
          fallback="/images/productos/default.jpg"
          alt={tall.nombre}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />

        {/* Counter */}
        <span className="absolute top-4 left-4 font-mono text-[9.5px] tracking-[0.22em] text-white/45">
          {String(groupIndex * 3 + 1).padStart(2, "0")}
        </span>

        {/* "Nuevo" badge — first group only */}
        {isFirst && (
          <span className="absolute top-4 right-4 rounded-full bg-white/90 px-2.5 py-1 text-[9.5px] font-medium uppercase tracking-[0.22em] text-[#0d2d20]">
            Nuevo
          </span>
        )}

        {/* Info overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="font-serif italic text-white text-[16px] leading-tight line-clamp-2">
            {tall.nombre}
          </p>
          <p className="mt-1.5 text-[11px] tracking-[0.18em] text-white/65 uppercase">
            Q {Number(tall.precio).toFixed(2)}
          </p>
          <p className="mt-3 text-[9.5px] tracking-[0.26em] uppercase text-white/50 inline-flex items-center gap-1.5">
            Ver esta pieza
            <svg width="10" height="6" viewBox="0 0 14 8" fill="none" aria-hidden>
              <path d="M0 4H12M9 1L12.5 4L9 7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </p>
        </div>
      </Link>

      {/* ── Two stacked small cards ── */}
      <div className="flex w-[160px] flex-col gap-3 md:w-[185px]">
        {/* Small card 1 */}
        <Link
          href={`/product/${small1.id}`}
          className="group relative flex-1 overflow-hidden rounded-sm bg-[#1a3d2e] ring-1 ring-white/8"
          aria-label={`Ver ${small1.nombre}`}
        >
          <FallbackImg
            src={s1Src}
            fallback="/images/productos/default.jpg"
            alt={small1.nombre}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <span className="absolute top-2.5 left-2.5 font-mono text-[9px] tracking-[0.2em] text-white/40">
            {String(groupIndex * 3 + 2).padStart(2, "0")}
          </span>
          <div className="absolute inset-x-0 bottom-0 p-3">
            <p className="font-serif italic text-white text-[13px] leading-tight line-clamp-2">
              {small1.nombre}
            </p>
            <p className="mt-1 text-[10px] tracking-[0.16em] text-white/60 uppercase">
              Q {Number(small1.precio).toFixed(2)}
            </p>
          </div>
        </Link>

        {/* Small card 2 */}
        <Link
          href={`/product/${(small2 ?? small1).id}`}
          className="group relative flex-1 overflow-hidden rounded-sm bg-[#1a3d2e] ring-1 ring-white/8"
          aria-label={`Ver ${(small2 ?? small1).nombre}`}
        >
          <FallbackImg
            src={s2Src}
            fallback="/images/productos/default.jpg"
            alt={(small2 ?? small1).nombre}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <span className="absolute top-2.5 left-2.5 font-mono text-[9px] tracking-[0.2em] text-white/40">
            {String(groupIndex * 3 + 3).padStart(2, "0")}
          </span>
          <div className="absolute inset-x-0 bottom-0 p-3">
            <p className="font-serif italic text-white text-[13px] leading-tight line-clamp-2">
              {(small2 ?? small1).nombre}
            </p>
            <p className="mt-1 text-[10px] tracking-[0.16em] text-white/60 uppercase">
              Q {Number((small2 ?? small1).precio).toFixed(2)}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

/* ─── Main section ───────────────────────────────────────────────────── */

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

  // Group products into chunks of 3: [tall, small1, small2]
  const groups: Array<[Producto, Producto, Producto | undefined]> = [];
  for (let i = 0; i < products.length; i += 3) {
    groups.push([products[i], products[i + 1] ?? products[i], products[i + 2]]);
  }

  return (
    <section className="relative overflow-hidden bg-[#0f2e22] py-20 text-white md:py-24">
      {/* Noise texture for depth */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />
      {/* Top shadow fade */}
      <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-black/25 to-transparent pointer-events-none" />

      <div className="relative space-y-10">
        {/* Header — inside max-width container */}
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          <SectionHeader
            eyebrow={tr("home.newEyebrow")}
            title={tr("home.newTitle")}
            linkHref="/productos?sort=new"
            linkLabel={tr("home.newLink")}
            dark
          />
        </div>

        {/* Mosaic carousel — full bleed, scrolls horizontally */}
        <div
          className="overflow-x-auto scroll-smooth pb-4"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          <div
            className="flex gap-3 px-4 md:px-12"
            style={{ width: "max-content" }}
          >
            {groups.map(([tall, small1, small2], i) => (
              <MosaicGroup
                key={tall.id}
                tall={tall}
                small1={small1}
                small2={small2}
                groupIndex={i}
              />
            ))}

            {/* End CTA card */}
            <div className="flex shrink-0 w-[160px] md:w-[200px] items-center justify-center">
              <Link
                href="/productos?sort=new"
                className="group flex flex-col items-center gap-4 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 text-white/50 transition-all group-hover:border-[#d4a853] group-hover:text-[#d4a853]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6"/>
                  </svg>
                </div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/45 group-hover:text-white/80 transition-colors">
                  Ver todo
                  <br />lo nuevo
                </p>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mx-auto max-w-7xl px-4 md:px-12">
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
      </div>
    </section>
  );
}
