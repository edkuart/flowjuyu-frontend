"use client";

import Image from "next/image";
import Link from "next/link";

type Seller = {
  id: number;
  nombre_comercio: string;
  logo: string | null;
};

type Props = {
  vendedor: Seller;
  departamento?: string | null;
  municipio?: string | null;
  rating_avg?: number;
  rating_count?: number;
};

export default function ProductSeller({
  vendedor,
  departamento,
  municipio,
  rating_avg,
  rating_count,
}: Props) {
  if (!vendedor) return null;

  const logoSrc =
    vendedor.logo && vendedor.logo.startsWith("http")
      ? vendedor.logo
      : "/images/tiendas/default.jpg";

  return (
    <div className="border rounded-2xl p-5 bg-white shadow-lg shadow-neutral-100 space-y-4 sticky top-6">
      {/* HEADER */}
      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">
        Vendedor
      </p>

      {/* SELLER INFO */}
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-neutral-100 ring-2 ring-amber-100 flex-shrink-0">
          <Image
            src={logoSrc}
            alt={vendedor.nombre_comercio}
            fill
            className="object-cover"
          />
        </div>

        <div className="min-w-0">
          <p className="font-bold text-neutral-900 truncate">
            {vendedor.nombre_comercio}
          </p>

          {rating_count && rating_count > 0 ? (
            <p className="text-sm text-neutral-500">
              ⭐ {rating_avg?.toFixed(1)}{" "}
              <span className="text-neutral-400">
                ({rating_count} reseñas)
              </span>
            </p>
          ) : (
            <p className="text-sm text-neutral-400">Sin reseñas todavía</p>
          )}

          {(municipio || departamento) && (
            <p className="text-xs text-neutral-400 mt-0.5">
              📍 {[municipio, departamento].filter(Boolean).join(", ")}
            </p>
          )}
        </div>
      </div>

      {/* VERIFIED BADGE */}
      <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
        <span className="text-green-500 text-sm font-bold">✔</span>
        <p className="text-sm text-green-700 font-medium">
          Tienda verificada por Flowjuyu
        </p>
      </div>

      {/* CTA */}
      <Link href={`/store/${vendedor.id}`} className="block">
        <button className="w-full bg-neutral-900 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-neutral-700 transition-colors">
          Ver tienda completa →
        </button>
      </Link>
    </div>
  );
}
