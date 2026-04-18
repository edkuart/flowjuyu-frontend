"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Star, Search } from "lucide-react";
import FallbackImg from "@/components/FallbackImg";
import { useAllSellers, type Artesano } from "@/hooks/useAllSellers";

/* ── helpers ── */

function getSellerName(a: Artesano) {
  return a.nombre_comercio || a.nombre || "Artesano";
}

function getLocation(a: Artesano) {
  return [a.municipio, a.departamento].filter(Boolean).join(", ");
}

/* ── Skeleton ── */

function SellerCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl bg-white/60 ring-1 ring-[#0d2d20]/8">
      <div className="h-[160px] bg-[#0d2d20]/8" />
      <div className="px-5 pb-5 pt-10">
        <div className="mb-3 h-4 w-2/3 rounded bg-[#0d2d20]/8" />
        <div className="h-3 w-1/2 rounded bg-[#0d2d20]/8" />
        <div className="mt-5 h-8 w-full rounded-full bg-[#0d2d20]/8" />
      </div>
    </div>
  );
}

/* ── Seller card ── */

function SellerCard({ artesano }: { artesano: Artesano }) {
  const nombre   = getSellerName(artesano);
  const ubicacion = getLocation(artesano);
  const hasRating = (artesano.rating_avg ?? 0) > 0;

  return (
    <Link
      href={`/store/${artesano.id}`}
      className="group block overflow-hidden rounded-2xl bg-white/70 ring-1 ring-[#0d2d20]/8 transition-shadow duration-300 hover:shadow-[0_16px_48px_rgba(13,45,32,0.10)]"
    >
      {/* ── Banner ── */}
      <div className="relative h-[160px] overflow-hidden bg-[#e7dfd3]">
        <FallbackImg
          src={artesano.banner_url || artesano.logo_url}
          fallback="/images/tiendas/default.jpg"
          alt={`Tienda de ${nombre}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* ── Avatar (hanging) ── */}
      <div className="relative -mt-8 px-5">
        <div className="relative inline-block">
          <div className="absolute -inset-1.5 rounded-xl bg-white/30 blur-lg" aria-hidden />
          <img
            src={artesano.logo_url || "/images/tiendas/default.jpg"}
            alt={nombre}
            className="relative h-14 w-14 rounded-xl border-[3px] border-white object-cover shadow-[0_4px_16px_rgba(0,0,0,0.14)]"
            loading="lazy"
          />
        </div>
      </div>

      {/* ── Info ── */}
      <div className="space-y-3 px-5 pb-5 pt-3">
        <div className="space-y-1">
          <h3 className="font-serif italic text-[18px] leading-snug text-[#11110f] line-clamp-1">
            {nombre}
          </h3>
          {ubicacion && (
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-[#0d2d20]/45">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden />
              <span className="truncate">{ubicacion}</span>
            </div>
          )}
        </div>

        {/* Rating */}
        {hasRating && (
          <div className="flex items-center gap-1.5">
            <Star className="h-3 w-3 fill-[#d4a853] text-[#d4a853]" aria-hidden />
            <span className="text-[12px] font-medium text-[#0d2d20]">
              {Number(artesano.rating_avg).toFixed(1)}
            </span>
            {(artesano.total_reviews ?? 0) > 0 && (
              <span className="text-[11px] text-[#0d2d20]/40 tracking-wide">
                · {artesano.total_reviews} reseñas
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="border-t border-[#0d2d20]/8 pt-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-[#0d2d20]/50 transition-colors group-hover:text-[#0d2d20]">
            Ver tienda
            <svg width="10" height="6" viewBox="0 0 14 8" fill="none" aria-hidden>
              <path d="M0 4H12M9 1L12.5 4L9 7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Main page ── */

const DEPARTAMENTOS = [
  "Todos",
  "Alta Verapaz",
  "Baja Verapaz",
  "Chimaltenango",
  "Chiquimula",
  "El Progreso",
  "Escuintla",
  "Guatemala",
  "Huehuetenango",
  "Izabal",
  "Jalapa",
  "Jutiapa",
  "Petén",
  "Quetzaltenango",
  "Quiché",
  "Retalhuleu",
  "Sacatepéquez",
  "San Marcos",
  "Santa Rosa",
  "Sololá",
  "Suchitepéquez",
  "Totonicapán",
  "Zacapa",
];

export default function ArtesanosPage() {
  const { data: artesanos, loading } = useAllSellers();
  const [search, setSearch]   = useState("");
  const [depto, setDepto]     = useState("Todos");

  /* Unique departments from actual data — supplement DEPARTAMENTOS list */
  const deptoOptions = useMemo(() => {
    const fromData = artesanos
      .map((a) => a.departamento)
      .filter((d): d is string => Boolean(d));
    const unique = Array.from(new Set(fromData)).sort();
    return ["Todos", ...unique];
  }, [artesanos]);

  const filtered = useMemo(() => {
    return artesanos.filter((a) => {
      const nombre = getSellerName(a).toLowerCase();
      const loc    = getLocation(a).toLowerCase();
      const matchSearch = !search || nombre.includes(search.toLowerCase()) || loc.includes(search.toLowerCase());
      const matchDepto  = depto === "Todos" || a.departamento === depto;
      return matchSearch && matchDepto;
    });
  }, [artesanos, search, depto]);

  return (
    <main className="min-h-screen bg-[#f8f5ef]">
      {/* ── Editorial header ── */}
      <div className="relative overflow-hidden bg-[#0d2d20] pb-20 pt-20 text-white md:pb-28 md:pt-32">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          }}
        />
        {/* Radial gold glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 120%, rgba(212,168,83,0.10) 0%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.36em] text-white/35">
            <span className="mr-2 text-[#d4a853]" aria-hidden>✦</span>
            Las manos detrás de cada pieza
          </p>
          <h1 className="mt-5 font-serif italic text-[2.75rem] leading-[1.05] tracking-[-0.02em] md:text-[4rem]">
            Nuestros artesanos
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-white/50">
            Cada tienda es una historia. Descubre a los artesanos guatemaltecos que tejen,
            bordan y crean las piezas que encuentras en Flowjuyu.
          </p>

          {/* Gold hairline */}
          <div className="mx-auto mt-8 h-px w-16 bg-gradient-to-r from-transparent via-[#d4a853]/60 to-transparent" />

          {/* Stats row */}
          {!loading && artesanos.length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-8">
              <div className="text-center">
                <p className="font-serif italic text-[2rem] text-white leading-none">{artesanos.length}</p>
                <p className="mt-1 text-[9.5px] uppercase tracking-[0.28em] text-white/35">Artesanos activos</p>
              </div>
              <div className="h-8 w-px bg-white/15" />
              <div className="text-center">
                <p className="font-serif italic text-[2rem] text-white leading-none">
                  {Array.from(new Set(artesanos.map((a) => a.departamento).filter(Boolean))).length}
                </p>
                <p className="mt-1 text-[9.5px] uppercase tracking-[0.28em] text-white/35">Departamentos</p>
              </div>
              <div className="h-8 w-px bg-white/15" />
              <div className="text-center">
                <p className="font-serif italic text-[2rem] text-white leading-none">GT</p>
                <p className="mt-1 text-[9.5px] uppercase tracking-[0.28em] text-white/35">Hecho en Guatemala</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Search & filter bar ── */}
      <div className="sticky top-[72px] z-10 border-b border-[#0d2d20]/10 bg-[#f8f5ef]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#0d2d20]/30" aria-hidden />
              <input
                type="search"
                placeholder="Buscar artesano o lugar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-[#0d2d20]/10 bg-white/70 py-2 pl-9 pr-4 text-[13px] text-[#0d2d20] placeholder-[#0d2d20]/30 outline-none transition focus:border-[#0d2d20]/25 focus:bg-white focus:ring-1 focus:ring-[#0d2d20]/15"
              />
            </div>

            {/* Department filter */}
            <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
              {deptoOptions.map((d) => (
                <button
                  key={d}
                  onClick={() => setDepto(d)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] transition-colors ${
                    depto === d
                      ? "bg-[#0d2d20] text-white"
                      : "text-[#0d2d20]/45 hover:text-[#0d2d20]"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="mx-auto max-w-5xl px-6 py-12">

        {/* Result count */}
        {!loading && (
          <p className="mb-8 text-[11px] uppercase tracking-[0.22em] text-[#0d2d20]/40">
            {filtered.length === artesanos.length
              ? `${artesanos.length} artesanos`
              : `${filtered.length} de ${artesanos.length} artesanos`}
          </p>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SellerCardSkeleton key={i} />)
            : filtered.map((artesano) => (
                <SellerCard key={artesano.id} artesano={artesano} />
              ))}
        </div>

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#0d2d20]/40">
              <span className="mr-2 text-[#d4a853]" aria-hidden>✦</span>
              Sin resultados
            </p>
            <p className="mt-4 font-serif italic text-[1.75rem] text-[#0d2d20]">
              No encontramos artesanos
            </p>
            <p className="mt-2 text-[14px] text-[#0d2d20]/45">
              Intenta con otro nombre o departamento.
            </p>
            <button
              onClick={() => { setSearch(""); setDepto("Todos"); }}
              className="mt-6 border-b border-[#0d2d20]/20 pb-0.5 text-[11px] uppercase tracking-[0.26em] text-[#0d2d20]/55 transition hover:border-[#0d2d20]/50 hover:text-[#0d2d20]"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Footer note */}
        {!loading && filtered.length > 0 && (
          <div className="mt-14 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#0d2d20]/10" />
            <span className="text-[9.5px] uppercase tracking-[0.28em] text-[#0d2d20]/30">
              Artesanos verificados · Flowjuyu
            </span>
            <div className="h-px flex-1 bg-[#0d2d20]/10" />
          </div>
        )}
      </div>
    </main>
  );
}
