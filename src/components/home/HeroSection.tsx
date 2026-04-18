"use client";

import Link from "next/link";

import CodeSearchInput from "@/components/home/CodeSearchInput";
import FallbackImg from "@/components/FallbackImg";
import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";
import { getProductImage } from "@/lib/getProductImage";

type TrendingProducto = {
  id: string;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
  imagenes?: { url: string }[];
};

type Props = {
  featuredProducts: TrendingProducto[];
};

const HERO_BG = `
  linear-gradient(to top,  rgba(0,0,0,0.84) 0%, rgba(0,0,0,0.28) 55%, rgba(0,0,0,0.05) 100%),
  linear-gradient(to right, transparent 55%, rgba(0,0,0,0.48) 100%),
  url("/Femme maya dansant dans le village.png")
`.trim();

export default function HeroSection({ featuredProducts }: Props) {
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);
  const gridProducts = featuredProducts.slice(0, 3);

  return (
    <section className="h-[100svh] max-h-[960px] min-h-[600px] w-full overflow-hidden">
      <div className="grid h-full grid-cols-1 lg:grid-cols-[62%_38%]">
        <div
          className="fj-grain relative overflow-hidden bg-cover bg-center lg:bg-[position:left_center]"
          style={{ backgroundImage: HERO_BG }}
        >
          <div className="absolute right-0 bottom-0 left-0 z-20 px-6 pb-10 md:px-10 md:pb-14 lg:px-12 lg:pb-16">
            <div className="mb-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-[5px] text-[10px] font-medium tracking-[0.28em] text-white/55 uppercase backdrop-blur-sm">
                <span className="text-[#d4a853]" aria-hidden>
                  ✦
                </span>
                {tr("home.heroBadge")}
              </span>
            </div>

            <h1 className="max-w-[14ch] font-serif text-[2.5rem] leading-[1.04] tracking-[-0.01em] text-white italic sm:text-[3.2rem] md:text-[4rem] lg:text-[4.75rem]">
              {tr("home.heroTitleLine1")}
              <br />
              {tr("home.heroTitleLine2")}
            </h1>

            <p className="mt-4 max-w-[40ch] text-sm leading-relaxed text-white/50 md:text-[15px]">
              {tr("home.heroDescription")}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/productos"
                className="inline-flex items-center justify-center rounded-md bg-white px-6 py-[12px] text-[11px] font-semibold tracking-[0.20em] text-[#0d0d0b] uppercase transition-colors duration-150 hover:bg-white/90"
              >
                {tr("home.heroPrimaryCta")}
              </Link>

              <Link
                href="/sell"
                className="inline-flex items-center justify-center rounded-md border border-white/15 bg-[#0f2e22] px-6 py-[12px] text-[11px] font-medium tracking-[0.20em] text-white uppercase transition-colors duration-150 hover:border-white/25 hover:bg-[#1a4535]"
              >
                {tr("home.heroSecondaryCta")}
              </Link>
            </div>

            <CodeSearchInput />

            <p className="mt-5 text-[9px] tracking-[0.28em] text-white/25 uppercase md:text-[10px]">
              {tr("home.heroTrust")}
            </p>
          </div>
        </div>

        <aside
          className="hidden flex-col bg-[#f3f1eb] p-4 lg:flex xl:p-5"
          aria-label={tr("home.featuredLabel")}
          aria-hidden={false}
        >
          <ProductGallery
            products={gridProducts}
            featuredLabel={tr("home.featuredLabel")}
          />
        </aside>
      </div>
    </section>
  );
}

type ProductGalleryProps = {
  products: TrendingProducto[];
  featuredLabel: string;
};

function ProductGallery({ products, featuredLabel }: ProductGalleryProps) {
  const [a, b, c] = products;
  const total = products.length;

  if (!a) {
    return (
      <div className="relative h-full overflow-hidden rounded-2xl ring-1 ring-black/[0.06]">
        <FallbackImg
          src="/images/hero-cultural.jpg"
          alt={featuredLabel}
          fallback="/images/hero-cultural.jpg"
          className="h-full w-full object-cover object-center"
        />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between px-1">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#0d2d20]/55">
          <span className="text-[#d4a853] mr-1.5" aria-hidden>✦</span>
          {featuredLabel}
        </p>
        <div className="flex items-center gap-1">
          <button
            aria-label="Anterior"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#0d2d20]/15 text-[#0d2d20]/60 hover:border-[#0d2d20]/30 hover:text-[#0d2d20] transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 6l-6 6 6 6"/></svg>
          </button>
          <button
            aria-label="Siguiente"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#0d2d20]/15 text-[#0d2d20]/60 hover:border-[#0d2d20]/30 hover:text-[#0d2d20] transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 6l6 6-6 6"/></svg>
          </button>
        </div>
      </div>

      <ProductCard
        product={a}
        variant="hero"
        className="min-h-0 flex-[3]"
        counter="01"
        total={total}
        badge="Edición limitada"
      />

      <div className="flex min-h-0 flex-[2] gap-4">
        <ProductCard
          product={b ?? a}
          variant="small"
          className="min-h-0 flex-1"
          counter="02"
        />
        <ProductCard
          product={c ?? a}
          variant="small"
          className="min-h-0 flex-1"
          counter="03"
        />
      </div>

      {/* Mini stats footer */}
      <div className="flex items-center justify-between px-1 pt-0.5">
        <span className="text-[9.5px] uppercase tracking-[0.26em] text-[#0d2d20]/40">
          Tejido a mano
        </span>
        <span className="font-mono text-[9.5px] tracking-[0.24em] text-[#0d2d20]/35">
          FJ · 2026
        </span>
      </div>
    </div>
  );
}

type ProductCardProps = {
  product: TrendingProducto;
  variant?: "hero" | "small";
  className?: string;
  counter?: string;
  total?: number;
  badge?: string;
};

function ProductCard({
  product,
  variant = "small",
  className = "",
  counter,
  total,
  badge,
}: ProductCardProps) {
  const src = getProductImage(product, "/images/productos/default.jpg");
  const isHero = variant === "hero";

  return (
    <Link
      href={`/product/${product.id}`}
      className={`group relative block overflow-hidden bg-[#e0d9cf] ring-1 ring-black/[0.06] ${isHero ? "rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.13)]" : "rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.08)]"} ${className}`}
      aria-label={`Ver ${product.nombre}`}
    >
      <FallbackImg
        src={src}
        fallback="/images/productos/default.jpg"
        alt={product.nombre}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />

      {/* Badge — hero card only */}
      {badge && isHero && (
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[9.5px] font-medium uppercase tracking-[0.22em] text-[#0d2d20]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d4a853]" aria-hidden />
            {badge}
          </span>
          {counter && total && (
            <span className="font-mono text-[10px] text-white/60 tracking-wider">
              {counter}/{String(total).padStart(2, "0")}
            </span>
          )}
        </div>
      )}

      {/* Counter — small cards */}
      {counter && !isHero && (
        <span className="absolute top-3 left-3 font-mono text-[10px] text-white/55 tracking-wider">
          {counter}
        </span>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 z-10 ${isHero ? "p-5 xl:p-6" : "p-4"}`}
      >
        <p
          className={`font-serif italic text-white drop-shadow-sm ${isHero ? "text-lg xl:text-[1.35rem]" : "text-[14px] leading-tight"}`}
        >
          {product.nombre}
        </p>
        <p className="mt-1 text-[11px] tracking-[0.18em] text-white/70 uppercase">
          Q {Number(product.precio).toFixed(2)}
        </p>
      </div>
    </Link>
  );
}
