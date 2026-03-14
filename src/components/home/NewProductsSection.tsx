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

/* ================= CARD ================= */

function EditorialCard({
  product,
  index,
}: {
  product: Producto;
  index: number;
}) {
  const [imgError, setImgError] = useState(false);

  const src =
    !imgError && product?.imagen_url
      ? product.imagen_url
      : "/images/productos/default.jpg";

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block relative overflow-hidden rounded-xl bg-[#e8e0d4]"
    >
      <div className="relative aspect-[4/5] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-2xl">

        <Image
          src={src}
          alt={product.nombre}
          fill
          sizes="(max-width:768px) 100vw, 33vw"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
          onError={() => setImgError(true)}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute top-4 left-4 text-[9px] tracking-[0.28em] uppercase text-white/60 backdrop-blur-sm border border-white/10 px-2 py-1 bg-black/30">
          Nuevo
        </div>

        <div className="absolute top-4 right-4 text-[10px] text-white/30 tracking-widest">
          {String(index + 1).padStart(2, "0")}
        </div>

        <div className="absolute bottom-0 p-5 text-white">

          <div className="h-[1px] w-8 bg-white/40 mb-2 group-hover:w-16 transition-all" />

          <p className="font-serif italic text-lg md:text-xl leading-tight line-clamp-2">
            {product.nombre}
          </p>

          <p className="text-[12px] tracking-widest text-white/60 mt-1">
            {formatPrice(product.precio)}
          </p>

        </div>
      </div>
    </Link>
  );
}

/* ================= SECTION ================= */

export default function NewProductsSection({ nuevosProductos }: Props) {

  if (!nuevosProductos?.length) return null;

  return (
    <section className="py-24 bg-[#0f2e22] text-white">

      <div className="max-w-7xl mx-auto px-4 md:px-12 space-y-12">

        <SectionHeader
          eyebrow="Catálogo en expansión"
          title="Nuevas incorporaciones"
          linkHref="/productos?sort=new"
          linkLabel="Ver todo el catálogo"
          dark
        />

        {/* GRID */}
        <div className="grid gap-6 grid-cols-2 lg:grid-cols-3 justify-center">

          {nuevosProductos.slice(0, 5).map((product, index) => (
            <EditorialCard
              key={product.id}
              product={product}
              index={index}
            />
          ))}

        </div>

      </div>

    </section>
  );
}