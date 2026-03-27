// src/components/home/SellerHighlightSection.tsx
//
// Reemplaza ShopsSection — mucho más humano.
//
// Layout:
//   Desktop: artesano destacado (2/3 ancho) + 3 tiendas secundarias (1/3)
//   Mobile:  artesano destacado full-width + 3 tarjetas compactas debajo
//
// El artesano destacado es el primero de la lista.
// Las secundarias son los siguientes 3.
//
// No se usa "comprar" ni "tienda" — se usa "trabajo", "piezas", "artesano".

"use client";

import Link from "next/link";
import FallbackImg from "@/components/FallbackImg";
import { useSellerHighlights, type Tienda } from "@/hooks/useSellerHighlights";

export type { Tienda };

function SellerHighlightSkeleton() {
  return (
    <section className="bg-[#f6f2ea] py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-12 space-y-10">
        <div className="space-y-3">
          <div className="h-3 w-40 bg-[#0d2d20]/8 rounded animate-pulse" />
          <div className="h-7 w-56 bg-[#0d2d20]/8 rounded animate-pulse" />
        </div>
        <div className="h-px bg-gradient-to-r from-[#0d2d20]/20 to-transparent" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 min-h-[440px] md:min-h-[520px] rounded-sm bg-[#0d2d20]/8 animate-pulse" />
          <div className="rounded-sm bg-[#0d2d20]/8 animate-pulse" />
        </div>
      </div>
    </section>
  );
}

/* ─── Featured artisan card ───────────────────────────────── */

function FeaturedArtisan({ tienda }: { tienda: Tienda }) {
  const nombre = tienda.nombre_comercio || tienda.nombre || "Artesano";
  const ubicacion = [tienda.municipio, tienda.departamento]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={`/store/${tienda.id}`}
      className="group relative flex flex-col justify-end overflow-hidden rounded-sm bg-[#0d2d20] min-h-[440px] md:min-h-[520px]"
    >
      {/* Background — logo como imagen de atmósfera si existe */}
      {tienda.logo_url && (
        <div className="absolute inset-0">
          <FallbackImg
            src={tienda.logo_url}
            fallback=""
            alt=""
            className="w-full h-full object-cover opacity-20 transition-transform duration-1000 group-hover:scale-[1.04]"
          />
        </div>
      )}

      {/* Gradiente siempre presente */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a2219] via-[#0d2d20]/60 to-transparent" />

      {/* Contenido */}
      <div className="relative z-10 p-8 md:p-10 space-y-5">

        {/* Avatar */}
        <div className="w-14 h-14 rounded-full border border-white/15 overflow-hidden bg-white/10">
          <FallbackImg
            src={tienda.logo_url}
            fallback="/images/tiendas/default.jpg"
            alt={nombre}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Eyebrow */}
        <p className="text-[9px] uppercase tracking-[0.30em] text-white/35">
          Artesano destacado
        </p>

        {/* Nombre */}
        <h3 className="font-serif italic text-white text-[28px] md:text-[34px] leading-[1.1]">
          {nombre}
        </h3>

        {/* Ubicación */}
        {ubicacion && (
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
            {ubicacion} · Guatemala
          </p>
        )}

        {/* Separador */}
        <div className="h-px w-10 bg-white/20 group-hover:w-20 transition-all duration-500" />

        {/* CTA */}
        <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/65 group-hover:text-white transition-colors duration-300">
          Conocer su trabajo
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none" aria-hidden>
            <path
              d="M0 4H12M9 1L12.5 4L9 7"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

      </div>
    </Link>
  );
}

/* ─── Secondary artisan card ──────────────────────────────── */

function SecondaryArtisan({ tienda }: { tienda: Tienda }) {
  const nombre = tienda.nombre_comercio || tienda.nombre || "Artesano";
  const ubicacion = [tienda.municipio, tienda.departamento]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={`/store/${tienda.id}`}
      className="group flex items-center gap-4 py-5 border-b border-[#0d2d20]/8 last:border-0 hover:opacity-80 transition-opacity"
    >
      {/* Logo */}
      <div className="w-11 h-11 rounded-full border border-[#0d2d20]/10 overflow-hidden flex-shrink-0 bg-[#ede8e0]">
        <FallbackImg
          src={tienda.logo_url}
          fallback="/images/tiendas/default.jpg"
          alt={nombre}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="font-serif italic text-[15px] text-[#0d0d0b] leading-tight truncate">
          {nombre}
        </p>
        {ubicacion && (
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#0d0d0b]/35 mt-[3px] truncate">
            {ubicacion}
          </p>
        )}
      </div>

      {/* Arrow */}
      <svg
        width="12"
        height="8"
        viewBox="0 0 12 8"
        fill="none"
        className="flex-shrink-0 text-[#0d2d20]/25 group-hover:text-[#0d2d20]/60 transition-colors"
        aria-hidden
      >
        <path
          d="M0 4H10M7 1L10.5 4L7 7"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}

/* ─── Section ─────────────────────────────────────────────── */

export default function SellerHighlightSection() {
  const { data: tiendas, loading } = useSellerHighlights();

  if (loading) return <SellerHighlightSkeleton />;
  if (!tiendas.length) return <SellerHighlightSkeleton />;

  const [featured, ...rest] = tiendas;
  const secondary = rest.slice(0, 3);

  return (
    <section className="bg-[#f6f2ea] py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-12 space-y-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#0d2d20]/50">
              Las manos detrás de cada pieza
            </p>
            <h2 className="font-serif italic text-[28px] md:text-[34px] text-[#0d0d0b] leading-tight">
              Conoce a quien las hace
            </h2>
          </div>
          <Link
            href="/categorias"
            className="text-[10px] uppercase tracking-[0.22em] text-[#0d0d0b]/40 hover:text-[#0d2d20] transition"
          >
            Ver todos los artesanos →
          </Link>
        </div>

        <div className="h-px bg-gradient-to-r from-[#0d2d20]/20 to-transparent" />

        {/* Grid: featured + secondary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Featured — ocupa 2 columnas en desktop */}
          <div className="md:col-span-2">
            <FeaturedArtisan tienda={featured} />
          </div>

          {/* Secondary — columna derecha */}
          {secondary.length > 0 && (
            <div className="bg-white rounded-sm border border-[#0d2d20]/8 px-6 py-2 flex flex-col justify-center">
              <p className="text-[9px] uppercase tracking-[0.28em] text-[#0d0d0b]/30 py-4 border-b border-[#0d2d20]/6">
                También en Flowjuyu
              </p>
              {secondary.map((tienda) => (
                <SecondaryArtisan key={tienda.id} tienda={tienda} />
              ))}
            </div>
          )}

        </div>

        {/* Ambient label */}
        <div className="flex items-center gap-3 pt-2">
          <div className="w-6 h-px bg-[#0d2d20]/15" />
          <span className="text-[9px] uppercase tracking-[0.28em] text-[#0d2d20]/30">
            Artesanos verificados · 22 departamentos de Guatemala
          </span>
        </div>

      </div>
    </section>
  );
}
