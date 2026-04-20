"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";

import FallbackImg from "@/components/FallbackImg";
import { useNewProducts } from "@/hooks/useNewProducts";
import { useCategorias } from "@/hooks/useCategorias";
import { getProductImage } from "@/lib/getProductImage";
import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";

/* ─── Extended type ───────────────────────────────────────────────────────────
   The backend /api/productos/nuevos returns these extra fields that the shared
   NewProducto hook type doesn't declare. We cast to this richer type locally.
──────────────────────────────────────────────────────────────────────────────*/
type Producto = {
  id: string;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
  imagenes?: { url: string }[];
  created_at?: string | null;
  departamento?: string | null;
  municipio?: string | null;
  categoria?: { id: number | null; nombre: string | null } | null;
  rating_avg?: number | null;
};

const SORT_OPTIONS = [
  { value: "newest",     label: "Más recientes" },
  { value: "priceAsc",   label: "Precio: bajo a alto" },
  { value: "priceDesc",  label: "Precio: alto a bajo" },
  { value: "name",       label: "Nombre A–Z" },
] as const;

type SortValue = typeof SORT_OPTIONS[number]["value"];

/* ─── Noise overlay (reusable) ───────────────────────────────────────────────*/
const NOISE_STYLE = {
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
} as React.CSSProperties;

/* ─── Skeleton ───────────────────────────────────────────────────────────────*/
function Skeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] rounded-sm bg-[#0d2d20]/8" />
          <div className="mt-3 space-y-2">
            <div className="h-3 w-3/4 rounded bg-[#0d2d20]/8" />
            <div className="h-3 w-1/2 rounded bg-[#0d2d20]/8" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────────────────*/
function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-[32px] text-[#d4a853]" aria-hidden>✦</span>
      <h3 className="mt-5 font-serif italic text-[1.6rem] leading-tight text-[#0d2d20]">
        No hay piezas con ese filtro.
      </h3>
      <p className="mt-3 max-w-[40ch] text-[14px] leading-relaxed text-[#0d2d20]/50">
        Intenta con otra categoría o vuelve pronto — los talleres tejen cada semana.
      </p>
      <button
        onClick={onClear}
        className="mt-8 inline-flex items-center gap-2 border-b border-[#0d2d20]/30 pb-[2px] text-[11px] uppercase tracking-[0.26em] text-[#0d2d20]/60 hover:text-[#0d2d20] hover:border-[#0d2d20] transition-colors"
      >
        Limpiar filtros
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

/* ─── Product card ───────────────────────────────────────────────────────────*/
function ProductCard({ product, index }: { product: Producto; index: number }) {
  const src = getProductImage(product, "/images/productos/default.jpg");
  const region = [product.municipio, product.departamento]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block"
      aria-label={`Ver ${product.nombre}`}
    >
      <article>
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[#e8e0d4] ring-1 ring-[#0d2d20]/6">
          <FallbackImg
            src={src}
            fallback="/images/productos/default.jpg"
            alt={product.nombre}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />

          {/* Gradient overlay — dark base + green tint for brand coherence */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d2d20]/65 via-[#0d2d20]/10 to-transparent" />

          {/* "Nuevo" badge */}
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[9.5px] font-medium uppercase tracking-[0.22em] text-[#0d2d20]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d4a853]" aria-hidden />
            Nuevo
          </span>

          {/* Counter */}
          <span className="absolute top-3 right-3 font-mono text-[9.5px] tracking-[0.2em] text-white/45">
            {String(index + 1).padStart(2, "0")}
          </span>

          {/* Region chip */}
          {region && (
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 backdrop-blur-sm px-2.5 py-1 text-[9.5px] font-medium uppercase tracking-[0.18em] text-[#0d2d20]/75">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M20 10c0 7-8 12-8 12s-8-5-8-12a8 8 0 1 1 16 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {region}
              </span>
            </div>
          )}

          {/* Rating chip */}
          {(product.rating_avg ?? 0) > 0 && (
            <div className="absolute bottom-3 right-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#0d0d0b]/80 backdrop-blur px-2 py-1 text-[9.5px] text-white">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="#d4a853" aria-hidden>
                  <path d="M5 1l1.12 2.27L8.5 3.64l-1.75 1.7.41 2.41L5 6.52 2.84 7.75l.41-2.41L1.5 3.64l2.38-.37L5 1z"/>
                </svg>
                {Number(product.rating_avg).toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Info below image */}
        <div className="mt-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-serif italic text-[16px] leading-[1.2] text-[#0d2d20] line-clamp-2 transition-colors group-hover:text-[#0d2d20]/70">
              {product.nombre}
            </p>
            {product.categoria?.nombre && (
              <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-[#0d2d20]/45 truncate">
                {product.categoria.nombre}
              </p>
            )}
          </div>
          <p className="shrink-0 text-[12.5px] tabular-nums font-medium text-[#0d2d20] tracking-wide">
            Q {Number(product.precio).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* "Ver esta pieza" cue */}
        <p className="mt-2 text-[10px] uppercase tracking-[0.26em] text-[#0d2d20]/40 inline-flex items-center gap-1.5 transition-colors group-hover:text-[#0d2d20]/70">
          Ver esta pieza
          <svg width="10" height="6" viewBox="0 0 14 8" fill="none" aria-hidden>
            <path d="M0 4H12M9 1L12.5 4L9 7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </p>
      </article>
    </Link>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────────*/
export default function NewArrivalsPage() {
  const { data: rawProducts, loading } = useNewProducts();
  const { data: categorias } = useCategorias();
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  const products = rawProducts as unknown as Producto[];

  const [activecat,    setActiveCat]    = useState<string>("todas");
  const [sort,         setSort]         = useState<SortValue>("newest");
  const [filterOpen,   setFilterOpen]   = useState(false);
  const [barStuck,     setBarStuck]     = useState(false);

  const barRef = useRef<HTMLDivElement>(null);

  // Detect when filter bar becomes sticky
  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setBarStuck(!entry.isIntersecting),
      { threshold: 1, rootMargin: "-97px 0px 0px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Filtered + sorted products
  const filtered = useMemo(() => {
    let list = [...products];

    if (activecat !== "todas") {
      list = list.filter(p => String(p.categoria?.id) === activecat);
    }

    list.sort((a, b) => {
      if (sort === "priceAsc")  return a.precio - b.precio;
      if (sort === "priceDesc") return b.precio - a.precio;
      if (sort === "name")      return a.nombre.localeCompare(b.nombre, "es");
      // newest: keep original order (backend returns newest first)
      return 0;
    });

    return list;
  }, [products, activecat, sort]);

  const clearFilters = () => {
    setActiveCat("todas");
    setSort("newest");
  };

  const hasActiveFilters = activecat !== "todas" || sort !== "newest";

  return (
    <main className="min-h-screen bg-[#f8f5ef]">

      {/* ── 1. Editorial Page Header ──────────────────────────────────────────*/}
      <section className="relative overflow-hidden bg-[#0d2d20] py-20 md:py-28">
        {/* Noise */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={NOISE_STYLE} />
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ background: "radial-gradient(55% 50% at 30% 60%, rgba(212,168,83,0.10), transparent 70%)" }}
          aria-hidden
        />
        {/* Gold hairline top */}
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-[#d4a853]/50 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 md:px-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px] lg:items-center">

            {/* Left: Copy */}
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/50">
                <span className="text-[#d4a853] mr-2" aria-hidden>✦</span>
                Recién llegado · Flowjuyu
              </p>

              <h1 className="mt-5 font-serif italic text-[2.8rem] leading-[1.0] tracking-[-0.02em] text-white sm:text-[3.5rem] md:text-[4.5rem]">
                Recién salido<br />
                del <span className="text-[#d4a853]">telar.</span>
              </h1>

              <p className="mt-5 max-w-[44ch] text-[14px] leading-relaxed text-white/50 md:text-[15px]">
                Las piezas más nuevas, directo de los talleres verificados.
                Cada semana llegan tejidos que acaban de terminarse.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                {!loading && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-white/60">
                    {products.length} piezas encontradas
                  </span>
                )}
                <Link
                  href="/productos"
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.26em] text-white/40 hover:text-white/70 border-b border-white/15 hover:border-white/40 pb-[2px] transition-colors"
                >
                  Ver catálogo completo →
                </Link>
              </div>
            </div>

            {/* Right: Featured newest product card (desktop) */}
            {!loading && products[0] && (
              <Link
                href={`/product/${products[0].id}`}
                className="group hidden lg:block relative aspect-[3/4] overflow-hidden rounded-[4px] bg-[#1a3d2e] ring-1 ring-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                aria-label={`Ver ${products[0].nombre}`}
              >
                <FallbackImg
                  src={getProductImage(products[0], "/images/productos/default.jpg")}
                  fallback="/images/productos/default.jpg"
                  alt={products[0].nombre}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                {/* Dark gradient for text legibility */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                {/* Green gradient — blends card into the dark section background */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d2d20]/80 via-[#0d2d20]/20 to-transparent" />
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[9.5px] font-medium uppercase tracking-[0.22em] text-[#0d2d20]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#d4a853]" aria-hidden />
                    Nuevo
                  </span>
                  <span className="font-mono text-[9.5px] text-white/45 tracking-wider">01/{String(products.length).padStart(2, "0")}</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="font-serif italic text-white text-[18px] leading-tight line-clamp-2">
                    {products[0].nombre}
                  </p>
                  <p className="mt-2 text-[11px] tracking-[0.18em] text-white/65 uppercase">
                    Q {Number(products[0].precio).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Sentinel for sticky detection ──────────────────────────────────────*/}
      <div ref={barRef} className="h-px" aria-hidden />

      {/* ── 2. Filter Bar ────────────────────────────────────────────────────── */}
      <div className={[
        "sticky top-[var(--header-height)] z-30 bg-[#f8f5ef]/95 backdrop-blur-md transition-shadow duration-200",
        barStuck ? "shadow-[0_4px_20px_rgba(13,45,32,0.07)]" : "",
      ].join(" ")}>
        <div className="mx-auto max-w-7xl px-4 md:px-12">

          {/* Main filter row */}
          <div className="flex h-14 items-center gap-4">

            {/* Sort — desktop */}
            <div className="hidden md:flex items-center gap-2 ml-auto">
              <SlidersHorizontal className="h-3 w-3 text-[#0d2d20]/40" aria-hidden />
              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortValue)}
                className="bg-transparent text-[11px] uppercase tracking-[0.20em] text-[#0d2d20]/60 outline-none cursor-pointer hover:text-[#0d2d20] transition-colors appearance-none pr-1"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Mobile filter toggle */}
            <button
              className="md:hidden ml-auto flex items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] text-[#0d2d20]/60"
              onClick={() => setFilterOpen(f => !f)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtros
            </button>

            {/* Result count */}
            {!loading && (
              <span className="hidden lg:block text-[10px] uppercase tracking-[0.22em] text-[#0d2d20]/35 whitespace-nowrap">
                {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Mobile sort */}
          {filterOpen && (
            <div className="md:hidden pb-4 flex flex-wrap gap-2">
              {SORT_OPTIONS.map(o => (
                <button
                  key={o.value}
                  onClick={() => { setSort(o.value); setFilterOpen(false); }}
                  className={[
                    "rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-colors",
                    sort === o.value
                      ? "bg-[#0d2d20] text-white"
                      : "border border-[#0d2d20]/15 text-[#0d2d20]/60 hover:border-[#0d2d20]/30",
                  ].join(" ")}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}

          {/* Gold hairline */}
          <div className="h-px bg-gradient-to-r from-[#d4a853]/30 via-[#0d2d20]/10 to-transparent" />
        </div>

        {/* Category pills — horizontally scrollable */}
        <div className="mx-auto max-w-7xl px-4 md:px-12">
          <div
            className="flex gap-2 overflow-x-auto py-3"
            style={{ scrollbarWidth: "none" } as React.CSSProperties}
          >
            {/* "Todas" pill */}
            <button
              onClick={() => setActiveCat("todas")}
              className={[
                "shrink-0 rounded-full px-4 py-1.5 text-[10.5px] uppercase tracking-[0.22em] transition-all duration-200 whitespace-nowrap",
                activecat === "todas"
                  ? "bg-[#0d2d20] text-white shadow-sm"
                  : "border border-[#0d2d20]/15 text-[#0d2d20]/60 hover:border-[#0d2d20]/30 hover:text-[#0d2d20]",
              ].join(" ")}
            >
              Todas
            </button>

            {categorias.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(String(cat.id))}
                className={[
                  "shrink-0 rounded-full px-4 py-1.5 text-[10.5px] uppercase tracking-[0.22em] transition-all duration-200 whitespace-nowrap",
                  activecat === String(cat.id)
                    ? "bg-[#0d2d20] text-white shadow-sm"
                    : "border border-[#0d2d20]/15 text-[#0d2d20]/60 hover:border-[#0d2d20]/30 hover:text-[#0d2d20]",
                ].join(" ")}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. Product Grid ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 md:px-12 py-12 md:py-16">

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="mb-8 flex flex-wrap items-center gap-2">
            {activecat !== "todas" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0d2d20]/8 px-3 py-1.5 text-[10.5px] uppercase tracking-[0.18em] text-[#0d2d20]/70">
                {categorias.find(c => String(c.id) === activecat)?.nombre ?? activecat}
                <button onClick={() => setActiveCat("todas")} className="hover:text-[#0d2d20]"><X className="h-3 w-3" /></button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-[10px] uppercase tracking-[0.22em] text-[#0d2d20]/40 hover:text-[#0d2d20] border-b border-[#0d2d20]/20 pb-[1px] transition-colors"
            >
              Limpiar todo
            </button>
          </div>
        )}

        {loading ? (
          <Skeleton />
        ) : filtered.length === 0 ? (
          <EmptyState onClear={clearFilters} />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>

            {/* Bottom ambient */}
            <div className="mt-16 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-[#0d2d20]/20 to-transparent" />
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.26em] text-[#0d2d20]/45 hover:text-[#0d2d20] transition-colors whitespace-nowrap"
              >
                Ver todo el catálogo →
              </Link>
            </div>
          </>
        )}
      </section>

      {/* ── 4. Section footer — CTA to full catalog ──────────────────────────── */}
      <section className="relative bg-[#0d2d20] py-20 md:py-24">
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={NOISE_STYLE} />
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-[#d4a853]/40 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-12 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/40">
            <span className="text-[#d4a853] mr-2" aria-hidden>✦</span>
            Flowjuyu · Catálogo completo
          </p>
          <h2 className="mt-5 font-serif italic text-[2rem] md:text-[2.75rem] leading-[1.05] tracking-[-0.02em] text-white">
            ¿Buscas algo más específico?
          </h2>
          <p className="mt-4 max-w-[44ch] mx-auto text-[14px] leading-relaxed text-white/45">
            Explora el catálogo completo — filtra por región, técnica, rango de precio o artesana.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2.5 rounded-sm bg-white px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0d2d20] hover:bg-white/90 transition-colors"
            >
              Ver catálogo completo
              <svg width="14" height="8" viewBox="0 0 14 8" fill="none" aria-hidden>
                <path d="M0 4H12M9 1L12.5 4L9 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link
              href="/categorias"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/50 hover:text-white border-b border-white/20 hover:border-white/50 pb-[2px] transition-colors"
            >
              Explorar por categoría
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
