// src/components/home/NewProductsSection.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import SectionHeader from "@/components/ui/SectionHeader";
import { useState } from "react";

type Producto = {
  id: string;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
  created_at?: string | null;
};

type Props = {
  nuevosProductos: Producto[];
};

const formatPrice = (precio: number) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 0,
  }).format(precio);

// Calcula hace cuántos días se publicó el producto
function getDaysAgo(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "hoy";
  if (diff === 1) return "ayer";
  if (diff <= 7) return `hace ${diff} días`;
  return null; // más de una semana → no mostrar urgencia temporal
}

/* ─── Card ─────────────────────────────────────────────── */

function NewProductCard({ product }: { product: Producto }) {
  const [imgError, setImgError] = useState(false);

  const src =
    !imgError && product.imagen_url
      ? product.imagen_url
      : "/images/productos/default.jpg";

  const daysAgo = getDaysAgo(product.created_at);

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block relative overflow-hidden bg-[#0a2219]"
    >
      <div className="relative aspect-[4/5] overflow-hidden">

        <Image
          src={src}
          alt={product.nombre}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
          onError={() => setImgError(true)}
        />

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

        {/* Badge temporal — diferenciador de urgencia real */}
        <div className="absolute top-4 left-4 flex flex-col gap-[6px]">
          <span className="text-[9px] uppercase tracking-[0.28em] text-white bg-white/15 backdrop-blur-sm border border-white/20 px-2 py-[4px]">
            {daysAgo ? `Llegó ${daysAgo}` : "Nuevo"}
          </span>
        </div>

        {/* Info del producto en la imagen */}
        <div className="absolute bottom-0 p-5 text-white w-full">
          <div className="h-[1px] w-7 bg-white/35 mb-3 group-hover:w-14 transition-all duration-500" />
          <p className="font-serif italic text-base md:text-lg leading-snug line-clamp-2">
            {product.nombre}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[12px] tracking-[0.15em] text-white/60">
              {formatPrice(product.precio)}
            </p>
            <span className="text-[9px] uppercase tracking-[0.22em] text-white/40 group-hover:text-white/70 transition">
              Ver →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Section ───────────────────────────────────────────── */

export default function NewProductsSection({ nuevosProductos }: Props) {
  if (!nuevosProductos?.length) return null;

  // Solo 3 productos — foco, no catálogo
  const items = nuevosProductos.slice(0, 3);

  return (
    <section className="py-16 md:py-20 bg-[#0f2e22] text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-12 space-y-10">

        <SectionHeader
          eyebrow="El catálogo crece cada semana"
          title="Recién salido del telar"
          linkHref="/productos?sort=new"
          linkLabel="Ver todas las incorporaciones"
          dark
        />

        {/* Grid de 3 — distinto de trending (que usa 4 columns) */}
        <div className="grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-3">
          {items.map((product) => (
            <NewProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* CTA de fondo — recordatorio de que hay más */}
        <div className="pt-2 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/10" />
          <Link
            href="/productos?sort=new"
            className="text-[11px] uppercase tracking-[0.28em] text-white/50 hover:text-white/90 transition whitespace-nowrap"
          >
            Ver todas las incorporaciones →
          </Link>
        </div>

      </div>
    </section>
  );
}
