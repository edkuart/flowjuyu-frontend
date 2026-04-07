"use client";

import Link from "next/link";
import { MapPin, MoveRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import FallbackImg from "@/components/FallbackImg";
import type { Tienda } from "@/hooks/useSellerHighlights";

type FeaturedSellerCardProps = {
  tienda: Tienda;
  ctaLabel: string;
};

function getSellerName(tienda: Tienda) {
  return tienda.nombre_comercio || tienda.nombre || "Artesano";
}

function getSellerLocation(tienda: Tienda) {
  return [tienda.municipio, tienda.departamento].filter(Boolean).join(", ");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function FeaturedSellerCard({
  tienda,
  ctaLabel,
}: FeaturedSellerCardProps) {
  const nombre = getSellerName(tienda);
  const ubicacion = getSellerLocation(tienda);

  return (
    <Link
      href={`/store/${tienda.id}`}
      className="group flex items-center gap-4 rounded-[22px] border border-[#0d2d20]/8 bg-white px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#0d2d20]/15 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[18px] bg-[#ece4d7]">
        {tienda.logo_url ? (
          <FallbackImg
            src={tienda.logo_url}
            fallback="/images/tiendas/default.jpg"
            alt={nombre}
            className="h-full w-full object-cover"
          />
        ) : (
          <Avatar className="h-full w-full rounded-[18px] bg-[#0d2d20]/8">
            <AvatarFallback className="rounded-[18px] bg-[#0d2d20]/8 text-sm font-semibold text-[#0d2d20]">
              {getInitials(nombre)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <p className="truncate font-serif text-[20px] leading-none text-[#11110f] italic">
          {nombre}
        </p>

        {ubicacion && (
          <div className="flex items-center gap-2 text-[11px] tracking-[0.18em] text-[#0d2d20]/45 uppercase">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{ubicacion}</span>
          </div>
        )}

        <p className="text-[11px] tracking-[0.22em] text-[#0d2d20]/55 uppercase">
          {ctaLabel}
        </p>
      </div>

      <MoveRight className="h-4 w-4 shrink-0 text-[#0d2d20]/45 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#0d2d20]" />
    </Link>
  );
}
