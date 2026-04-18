"use client";

import Link from "next/link";
import { MapPin, MoveRight, Star } from "lucide-react";
import FallbackImg from "@/components/FallbackImg";
import type { Tienda } from "@/hooks/useSellerHighlights";

type FeaturedSellerProps = {
  tienda: Tienda;
  eyebrow: string;
  ctaLabel: string;
};

function getSellerName(t: Tienda) {
  return t.nombre_comercio || t.nombre || "Artesano";
}

function getSellerLocation(t: Tienda) {
  return [t.municipio, t.departamento].filter(Boolean).join(", ");
}

export default function FeaturedSeller({
  tienda,
  eyebrow,
  ctaLabel,
}: FeaturedSellerProps) {
  const nombre    = getSellerName(tienda);
  const ubicacion = getSellerLocation(tienda);

  return (
    /*
      animate-fade-up: defined in tailwind.config.js — fires on every mount.
      Since parent passes key={featured.id}, this component remounts on each
      seller switch, so the animation replays naturally. No extra state needed.

      overflow-hidden on the Link keeps the banner image inside rounded corners.
      No outer padding (p-0) — the image goes edge-to-edge for a less "caja" feel.
    */
    <Link
      href={`/store/${tienda.id}`}
      className="group block h-full animate-fade-up overflow-hidden rounded-[28px]
                 border border-[#0d2d20]/8
                 shadow-[0_20px_60px_rgba(15,23,42,0.07)]
                 transition-shadow duration-300
                 hover:shadow-[0_28px_80px_rgba(15,23,42,0.11)]"
    >
      <article className="flex h-full min-h-[480px] flex-col bg-[#f8f5ef]">

        {/* ── Banner ────────────────────────────────────────────── */}
        {/*
          overflow-visible on this wrapper lets the avatar hang below.
          The actual image clipping happens on the inner div.
        */}
        <div className="relative h-[260px] shrink-0 overflow-visible sm:h-[300px]">

          {/* Image container — clips the photo, not the avatar */}
          <div className="absolute inset-0 overflow-hidden rounded-t-[28px] bg-[#e7dfd3]">
            <FallbackImg
              src={tienda.banner_url || tienda.logo_url}
              fallback="/images/tiendas/default.jpg"
              alt={`Tienda de ${nombre}`}
              className="h-full w-full object-cover
                         transition-transform duration-500 ease-out
                         group-hover:scale-[1.04]"
            />
            {/* Gradient: stronger at base so avatar always reads over any banner */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"
              aria-hidden="true"
            />
          </div>

          {/*
            Avatar: sits at the banner's bottom edge, half outside.
            The outer halo (blurred white circle) ensures contrast against
            any banner color — the technique Apple/Airbnb use for profile
            photos over dynamic backgrounds.
          */}
          <div className="absolute bottom-0 left-7 z-10 translate-y-1/2">
            {/* Soft halo behind the avatar */}
            <div
              className="absolute -inset-2 rounded-[22px] bg-white/30 blur-xl"
              aria-hidden="true"
            />
            <img
              src={tienda.logo_url || "/images/tiendas/default.jpg"}
              alt={nombre}
              className="relative h-[84px] w-[84px] rounded-xl
                         border-4 border-white object-cover
                         shadow-[0_8px_24px_rgba(0,0,0,0.18)]
                         sm:h-24 sm:w-24"
              loading="lazy"
            />
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────────── */}
        {/*
          pt-14/pt-16: compensates for avatar overflow (h-84px / 2 ≈ 42px + gap)
          flex-1 + justify-between pushes the CTA to the bottom edge.
        */}
        <div className="flex flex-1 flex-col justify-between
                        px-7 pb-7 pt-14
                        sm:px-8 sm:pb-8 sm:pt-16">

          <div className="space-y-4">
            {/* Eyebrow */}
            <p className="text-[10px] font-medium uppercase tracking-[0.30em] text-[#0d2d20]/40">
              {eyebrow}
            </p>

            {/* Name — tighter leading gives it more presence */}
            <h3 className="font-serif italic leading-[1.0] text-[#11110f]
                           text-[30px] sm:text-[36px]">
              {nombre}
            </h3>

            {/* Location pill — slightly more contrast than before */}
            {ubicacion && (
              <div className="inline-flex items-center gap-2 rounded-full
                              border border-[#0d2d20]/10 bg-white/80
                              px-3 py-1.5
                              text-[11px] uppercase tracking-[0.18em] text-[#0d2d20]/70">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{ubicacion}</span>
              </div>
            )}
          </div>

          {/* Rating — shown when available */}
          {(tienda.rating_avg ?? 0) > 0 && (
            <div className="flex items-center gap-4 pt-1">
              <div className="inline-flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-[#d4a853] text-[#d4a853]" aria-hidden />
                <span className="text-[13px] font-medium text-[#0d2d20]">
                  {Number(tienda.rating_avg).toFixed(1)}
                </span>
                {(tienda.total_reviews ?? 0) > 0 && (
                  <span className="text-[11px] text-[#0d2d20]/45 tracking-wide">
                    · {tienda.total_reviews} reseñas
                  </span>
                )}
              </div>
            </div>
          )}

          {/* CTA — real pill button (visually), avoids nested <button> inside <Link>) */}
          <div className="flex items-center justify-between border-t border-[#0d2d20]/8 pt-5">
            <div
              className="inline-flex items-center gap-2.5 rounded-full
                         bg-[#0d2d20] px-5 py-2.5
                         text-[11px] font-medium uppercase tracking-[0.22em] text-white
                         transition-transform duration-200 group-hover:scale-[1.02]"
            >
              {ctaLabel}
              <MoveRight
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </div>
          </div>

        </div>
      </article>
    </Link>
  );
}
