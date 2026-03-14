// src/components/home/ShopCard.tsx

import Link from "next/link";
import FallbackImg from "@/components/FallbackImg";

type Tienda = {
  id: number;
  nombre?: string | null;
  nombre_comercio?: string | null;
  logo_url?: string | null;
  departamento?: string | null;
  municipio?: string | null;
};

type Props = {
  tienda: Tienda;
  index?: number;
};

export default function ShopCard({ tienda, index = 0 }: Props) {
  const nombre = tienda.nombre_comercio || tienda.nombre || "Tienda";

  const ubicacion = [tienda.municipio, tienda.departamento]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className="
      group
      relative
      bg-[#faf7f2]
      border border-[#0d2d20]/10
      rounded-sm
      p-8 md:p-10
      flex flex-col items-center text-center
      shadow-sm
      transition-all duration-500
      hover:-translate-y-1
      hover:shadow-lg
      overflow-hidden
    "
    >
      {/* subtle hover wash */}
      <div
        className="
        absolute inset-0
        opacity-0
        group-hover:opacity-100
        transition-opacity duration-500
        pointer-events-none
        bg-[radial-gradient(ellipse_at_top,rgba(13,45,32,0.05),transparent_70%)]
      "
      />

      {/* card index */}
      <span
        className="
        absolute top-4 right-4
        text-[10px]
        tracking-widest
        text-[#0d2d20]/30
      "
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* logo */}
      <div
        className="
        w-16 h-16 md:w-20 md:h-20
        rounded-full
        overflow-hidden
        border border-[#0d2d20]/10
        mb-6
        flex-shrink-0
      "
      >
        <FallbackImg
          src={tienda.logo_url}
          fallback="/images/tiendas/default.jpg"
          alt={nombre}
          className="w-full h-full object-cover"
        />
      </div>

      {/* shop name */}
      <h3
        className="
        font-serif italic
        text-lg md:text-xl
        text-[#0d0d0b]
        leading-tight
      "
      >
        {nombre}
      </h3>

      {/* location */}
      {ubicacion && (
        <p
          className="
          mt-2
          text-[11px]
          uppercase
          tracking-[0.20em]
          text-[#0d2d20]/50
        "
        >
          {ubicacion}
        </p>
      )}

      {/* divider */}
      <div
        className="
        h-px
        w-10
        bg-gradient-to-r
        from-[#0d2d20]
        to-[#0d2d20]/20
        my-6
        transition-all duration-500
        group-hover:w-16
      "
      />

      {/* CTA */}
      <Link
        href={`/store/${tienda.id}`}
        className="
        inline-flex items-center gap-2
        text-[11px]
        uppercase
        tracking-[0.25em]
        text-[#0d2d20]
        border-b border-[#0d2d20]/20
        pb-[2px]
        transition
        hover:border-[#0d2d20]/60
      "
      >
        Ver tienda

        <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
          <path
            d="M0 4H12M9 1L12.5 4L9 7"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </div>
  );
}