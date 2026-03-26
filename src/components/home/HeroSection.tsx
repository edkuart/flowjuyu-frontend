// src/components/home/HeroSection.tsx
//
// Server Component — zero client JS.
//
// Layout: editorial split
//
//   LEFT (62%): cinematic image panel
//     — large textile photo as full background
//     — dual gradient overlay (vertical + right-edge fade)
//     — text content anchored at bottom-left
//     — fj-grain texture overlay (CSS only)
//
//   RIGHT (38%): product gallery panel
//     — warm off-white background (#f3f1eb)
//     — asymmetric 2×2 grid: 1 tall + 2 stacked
//     — each image is a direct link to the product
//     — subtle hover scale
//
//   MOBILE: right panel hidden, cinematic panel full width (exact current look)

import Image from "next/image";
import Link from "next/link";
import CodeSearchInput from "@/components/home/CodeSearchInput";
import { getProductImage } from "@/lib/getProductImage";

// ── Tipos ─────────────────────────────────────────────────────────────────────

type TrendingProducto = {
  id: string;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
  imagenes?: { url: string }[];
};

type Props = {
  trendingProducts: TrendingProducto[];
};

// ── Componente ────────────────────────────────────────────────────────────────

// Fixed hero image — editorial identity, independent of product catalogue.
// Combined gradient+url() in one CSS layer: no z-index stacking, no layout shift.
const HERO_BG = `
  linear-gradient(to top,  rgba(0,0,0,0.84) 0%, rgba(0,0,0,0.28) 55%, rgba(0,0,0,0.05) 100%),
  linear-gradient(to right, transparent 55%, rgba(0,0,0,0.48) 100%),
  url("/Femme maya dansant dans le village.png")
`.trim();

export default function HeroSection({ trendingProducts }: Props) {
  // Products for the right-panel grid — first 3 catalogue items
  const gridProducts = trendingProducts.slice(0, 3);

  return (
    <section className="w-full overflow-hidden h-[100svh] min-h-[600px] max-h-[960px]">
      <div className="h-full grid grid-cols-1 lg:grid-cols-[62%_38%]">

        {/* ── LEFT: cinematic image panel ────────────────────────────────── */}
        {/* Single CSS background layer: dual gradient overlay + static hero image.    */}
        {/* No Next.js Image, no z-index stacking. bg-[center] mobile → bg-left lg+.  */}
        <div
          className="relative overflow-hidden fj-grain bg-cover bg-center lg:bg-[position:left_center]"
          style={{ backgroundImage: HERO_BG }}
        >

          {/* Editorial content — bottom-left anchored */}
          <div className="absolute bottom-0 left-0 right-0 z-20
            px-6 md:px-10 lg:px-12
            pb-10 md:pb-14 lg:pb-16"
          >

            {/* Badge */}
            <div className="mb-5">
              <span className="
                inline-flex items-center gap-2
                rounded-full border border-white/10 bg-white/[0.07]
                backdrop-blur-sm
                px-3.5 py-[5px]
                text-[10px] uppercase tracking-[0.28em] font-medium text-white/55
              ">
                <span className="text-[#d4a853]" aria-hidden>✦</span>
                Artesanía guatemalteca · Directo del productor
              </span>
            </div>

            {/* Headline */}
            <h1 className="
              font-serif italic text-white
              leading-[1.04] tracking-[-0.01em]
              max-w-[14ch]
              text-[2.5rem] sm:text-[3.2rem] md:text-[4rem] lg:text-[4.75rem]
            ">
              Donde el hilo
              <br />
              guarda memoria.
            </h1>

            {/* Value proposition */}
            <p className="mt-4 text-white/50 text-sm md:text-[15px] leading-relaxed max-w-[40ch]">
              Conectamos compradores con artesanas guatemaltecas.
              Cada pieza tiene historia, nombre y origen.
            </p>

            {/* CTAs — solid fills, readable on any image section */}
            <div className="mt-7 flex flex-wrap items-center gap-3">

              <Link
                href="/productos"
                className="
                  inline-flex items-center justify-center
                  bg-white text-[#0d0d0b]
                  text-[11px] uppercase tracking-[0.20em] font-semibold
                  px-6 py-[12px] rounded-md
                  hover:bg-white/90 transition-colors duration-150
                "
              >
                Explorar productos
              </Link>

              <Link
                href="/sell"
                className="
                  inline-flex items-center justify-center
                  bg-[#0f2e22] text-white border border-white/15
                  text-[11px] uppercase tracking-[0.20em] font-medium
                  px-6 py-[12px] rounded-md
                  hover:bg-[#1a4535] hover:border-white/25
                  transition-colors duration-150
                "
              >
                Vender en Flowjuyu
              </Link>

            </div>

            {/* Code lookup */}
            <CodeSearchInput />

            {/* Trust strip */}
            <p className="mt-5 text-[9px] md:text-[10px] uppercase tracking-[0.28em] text-white/25">
              Vendedores verificados · Pago seguro · Hecho en Guatemala
            </p>

          </div>
        </div>

        {/* ── RIGHT: product gallery panel ───────────────────────────────── */}
        {/* Hidden on mobile — cinematic panel fills full width instead.      */}
        {/* On desktop: warm off-white surface, asymmetric product grid.      */}
        <aside
          className="hidden lg:flex flex-col bg-[#f3f1eb] p-4 xl:p-5"
          aria-label="Productos destacados"
        >
          <ProductGallery products={gridProducts} />
        </aside>

      </div>
    </section>
  );
}

// ── Product gallery ───────────────────────────────────────────────────────────
//
// Asymmetric grid: one tall image (left, row-span-2) + two stacked (right).
// This mirrors the rhythm of woven textiles — irregular but balanced.
// Falls back gracefully with fewer than 3 products.

type ProductGalleryProps = {
  products: TrendingProducto[];
};

function ProductGallery({ products }: ProductGalleryProps) {
  const [a, b, c] = products;

  // No products — fill the panel with the cultural image
  if (!a) {
    return (
      <div className="h-full relative overflow-hidden rounded-2xl ring-1 ring-black/[0.06]">
        <Image
          src="/images/hero-cultural.jpg"
          alt="Artesanía guatemalteca"
          fill
          sizes="38vw"
          className="object-cover object-center"
        />
      </div>
    );
  }

  return (
    // flex-col + h-full: the 3:2 dominant/supporting ratio is explicit, not
    // implied by row spans. Each flex child gets a concrete pixel height from
    // the flex algorithm so fill images always have a valid parent dimension.
    // min-h-0 on the container (and each child) prevents flex overflow.
    <div className="h-full flex flex-col gap-4 min-h-0">

      {/* ── Hero product — dominant (≈60% of panel height) ── */}
      {/* flex-[3] = 3 parts. Stronger shadow + larger radius = more weight.  */}
      <ProductCard
        product={a}
        variant="hero"
        className="flex-[3] min-h-0"
        sizes="(max-width: 1280px) 36vw, 38vw"
      />

      {/* ── Supporting products — subordinate (≈40% of panel height) ── */}
      {/* flex-[2] = 2 parts. Lighter shadow + smaller radius = lower weight. */}
      <div className="flex-[2] flex gap-4 min-h-0">
        <ProductCard
          product={b ?? a}
          variant="small"
          className="flex-1 min-h-0"
          sizes="(max-width: 1280px) 18vw, 19vw"
        />
        <ProductCard
          product={c ?? a}
          variant="small"
          className="flex-1 min-h-0"
          sizes="(max-width: 1280px) 18vw, 19vw"
        />
      </div>

    </div>
  );
}

// ── Individual product card ───────────────────────────────────────────────────

type ProductCardProps = {
  product: TrendingProducto;
  variant?: "hero" | "small";
  className?: string;
  sizes?: string;
};

function ProductCard({ product, variant = "small", className = "", sizes }: ProductCardProps) {
  const src = getProductImage(product, "/images/productos/default.jpg");
  const isHero = variant === "hero";

  return (
    // block  — <a> is inline by default; without block it collapses in flex/grid
    // Variant-driven styling signals hierarchy without relying on size alone:
    //   hero  → rounded-2xl, heavier shadow, larger text overlay
    //   small → rounded-xl,  lighter shadow, smaller text overlay
    <Link
      href={`/product/${product.id}`}
      className={`
        group block relative
        overflow-hidden bg-[#e0d9cf]
        ring-1 ring-black/[0.06]
        ${isHero
          ? "rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.13)]"
          : "rounded-xl  shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
        }
        ${className}
      `}
      aria-label={`Ver ${product.nombre}`}
    >
      <Image
        src={src}
        alt={product.nombre}
        fill
        sizes={sizes}
        className={`object-cover object-center transition-[transform,opacity] duration-[450ms] ease-out group-hover:scale-[1.03] ${isHero ? "" : "opacity-[0.88] group-hover:opacity-100"}`}
      />

      {/* Name overlay — fades on hover. Hero variant shows larger text. */}
      <div className={`
        absolute bottom-0 left-0 right-0
        bg-gradient-to-t from-black/75 via-black/30 to-transparent
        opacity-0 group-hover:opacity-100
        transition-opacity duration-[450ms]
        ${isHero ? "px-4 py-4" : "px-3 py-3"}
      `}>
        <p className={`
          text-white font-medium leading-tight line-clamp-1
          ${isHero ? "text-[13px]" : "text-[11px]"}
        `}>
          {product.nombre}
        </p>
      </div>
    </Link>
  );
}
