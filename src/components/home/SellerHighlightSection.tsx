// src/components/home/SellerHighlightSection.tsx
//
// Layout:
//   Desktop: featured hero (left ~65%) + interactive sidebar (right ~35%)
//   Mobile:  hero full-width → sidebar cards → dot nav
//
// Interaction: clicking any sidebar card or dot sets it as the featured hero.
// Navigation to the store happens only via the CTA inside the hero.

"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, MoveRight } from "lucide-react";
import FeaturedSeller from "@/components/home/FeaturedSeller";
import { useSellerHighlights, type Tienda } from "@/hooks/useSellerHighlights";
import { useLanguage } from "@/i18n/context/useLanguage";
import { createT } from "@/i18n/utils/t";
import esDictionary from "@/i18n/dictionaries/es";
import FallbackImg from "@/components/FallbackImg";

export type { Tienda };

/* ─── Skeleton ───────────────────────────────────────────────── */

function SellerHighlightSkeleton() {
  return (
    <section className="relative bg-[#f6f2ea] py-20 md:py-24">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#0d2d20]/12 to-transparent" />
      <div className="mx-auto max-w-7xl space-y-10 px-4 md:px-12">
        <div className="space-y-3">
          <div className="h-3 w-40 animate-pulse rounded bg-[#0d2d20]/8" />
          <div className="h-7 w-56 animate-pulse rounded bg-[#0d2d20]/8" />
        </div>
        <div className="h-px bg-gradient-to-r from-[#0d2d20]/20 to-transparent" />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
          <div className="min-h-[520px] animate-pulse rounded-[28px] bg-[#0d2d20]/8" />
          <div className="space-y-4">
            <div className="h-28 animate-pulse rounded-[24px] bg-[#0d2d20]/8" />
            <div className="h-28 animate-pulse rounded-[24px] bg-[#0d2d20]/8" />
            <div className="h-28 animate-pulse rounded-[24px] bg-[#0d2d20]/8" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Sidebar mini-card (button, not link — sets active hero) ── */

function SidebarCard({
  tienda,
  active,
  onClick,
}: {
  tienda: Tienda;
  active: boolean;
  onClick: () => void;
}) {
  const nombre = tienda.nombre_comercio || tienda.nombre || "Artesano";
  const ubicacion = [tienda.municipio, tienda.departamento]
    .filter(Boolean)
    .join(", ");

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={[
        "group flex w-full items-center gap-4 rounded-[22px] border px-4 py-4 text-left",
        "transition-all duration-200",
        active
          ? "border-[#0d2d20]/20 bg-[#f0ece3] shadow-[0_4px_20px_rgba(13,45,32,0.08)]"
          : "border-[#0d2d20]/8 bg-white hover:-translate-y-0.5 hover:border-[#0d2d20]/15 hover:bg-[#faf8f4] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]",
      ].join(" ")}
    >
      {/* Avatar — logo_url is always the avatar, never the background */}
      <div className={[
        "relative h-16 w-16 shrink-0 overflow-hidden rounded-[18px] bg-[#ece4d7]",
        "transition-transform duration-200",
        active ? "scale-[1.04]" : "group-hover:scale-[1.02]",
      ].join(" ")}>
        <FallbackImg
          src={tienda.logo_url}
          fallback="/images/tiendas/default.jpg"
          alt={nombre}
          className="h-full w-full object-cover"
        />
        {active && (
          <span
            className="absolute inset-0 rounded-[18px] ring-2 ring-[#0d2d20]/30 ring-inset"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="truncate font-serif italic text-[20px] leading-none text-[#11110f]">
          {nombre}
        </p>
        {ubicacion && (
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-[#0d2d20]/45">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{ubicacion}</span>
          </div>
        )}
        <Link
          href={`/store/${tienda.id}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-block text-[11px] uppercase tracking-[0.22em] text-[#0d2d20]/55 hover:text-[#0d2d20] transition-colors"
        >
          Ver tienda →
        </Link>
      </div>

      <MoveRight
        className="h-4 w-4 shrink-0 text-[#0d2d20]/30 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#0d2d20]/60"
        aria-hidden="true"
      />
    </button>
  );
}

/* ─── Section ────────────────────────────────────────────────── */

export default function SellerHighlightSection() {
  const { data: tiendas, loading } = useSellerHighlights();
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  // Active index drives which tienda is shown in the hero
  const [activeIndex, setActiveIndex] = useState(0);

  if (loading) return <SellerHighlightSkeleton />;
  if (!tiendas.length) return <SellerHighlightSkeleton />;

  // Clamp: safe against stale index if data length changes
  const safeIndex = activeIndex < tiendas.length ? activeIndex : 0;
  const featured = tiendas[safeIndex];
  const sidebar = tiendas.filter((_, i) => i !== safeIndex).slice(0, 3);

  return (
    <section className="relative bg-[#f6f2ea] py-20 md:py-24">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#0d2d20]/12 to-transparent" />
      <div className="mx-auto max-w-7xl space-y-10 px-4 md:px-12">

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#0d2d20]/50">
              {tr("home.artisanEyebrow")}
            </p>
            <h2 className="font-serif italic text-[28px] leading-tight text-[#0d0d0b] md:text-[34px]">
              {tr("home.artisanSectionTitle")}
            </h2>
          </div>
          <Link
            href="/artesanos"
            className="text-[10px] uppercase tracking-[0.22em] text-[#0d0d0b]/40 transition hover:text-[#0d2d20]"
          >
            {tr("home.artisanViewAll")}
          </Link>
        </div>

        <div className="h-px bg-gradient-to-r from-[#0d2d20]/20 to-transparent" />

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px] xl:items-stretch">

          {/* Hero — key=id forces full remount on seller change,
               guaranteeing no stale image/state from previous seller */}
          <div className="min-w-0">
            <FeaturedSeller
              key={featured.id}
              tienda={featured}
              eyebrow={tr("home.artisanFeaturedLabel")}
              ctaLabel={tr("home.artisanViewWork")}
            />
          </div>

          {/* Sidebar — interactive: click sets featured */}
          {sidebar.length > 0 && (
            <aside
              className="flex h-full flex-col rounded-[28px] border border-[#0d2d20]/8 bg-[#fbfaf7] p-4 sm:p-5"
              aria-label="Otros artesanos"
            >
              <p className="border-b border-[#0d2d20]/6 px-2 pb-4 text-[10px] uppercase tracking-[0.24em] text-[#0d0d0b]/35">
                {tr("home.artisanAlsoOn")}
              </p>
              <div className="mt-4 flex flex-1 flex-col gap-3">
                {sidebar.map((tienda) => {
                  const realIndex = tiendas.findIndex((t) => t.id === tienda.id);
                  return (
                    <SidebarCard
                      key={tienda.id}
                      tienda={tienda}
                      active={realIndex === safeIndex}
                      onClick={() => setActiveIndex(realIndex)}
                    />
                  );
                })}
              </div>
            </aside>
          )}
        </div>

        {/* Dot navigation — shows if more than 1 seller */}
        {tiendas.length > 1 && (
          <div
            className="flex items-center gap-2.5"
            role="tablist"
            aria-label="Navegar artesanos"
          >
            {tiendas.map((tienda, index) => (
              <button
                key={tienda.id}
                type="button"
                role="tab"
                aria-selected={index === safeIndex}
                aria-label={`Ver ${tienda.nombre_comercio || tienda.nombre || "artesano"}`}
                onClick={() => setActiveIndex(index)}
                className={[
                  "h-2 rounded-full transition-all duration-300",
                  index === safeIndex
                    ? "w-8 bg-[#0d2d20]"
                    : "w-2 bg-[#0d2d20]/25 hover:bg-[#0d2d20]/45",
                ].join(" ")}
              />
            ))}
          </div>
        )}

        {/* Ambient footer */}
        <div className="flex items-center gap-3 pt-2">
          <div className="h-px w-6 bg-[#0d2d20]/15" />
          <span className="text-[9px] uppercase tracking-[0.28em] text-[#0d2d20]/30">
            {tr("home.artisanVerifiedLabel")}
          </span>
        </div>

      </div>
    </section>
  );
}
