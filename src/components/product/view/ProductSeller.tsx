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
    <div className="border rounded-lg p-5 bg-white shadow-sm space-y-4">
      <h3 className="text-lg font-semibold">Vendedor</h3>

      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-neutral-200">
          <Image
            src={logoSrc}
            alt={vendedor.nombre_comercio}
            fill
            className="object-cover"
          />
        </div>

        <div>
          <p className="font-semibold text-neutral-900">
            {vendedor.nombre_comercio}
          </p>

          {rating_count && rating_count > 0 ? (
            <p className="text-sm text-neutral-600">
              ⭐ {rating_avg?.toFixed(1)} ({rating_count} reseñas)
            </p>
          ) : (
            <p className="text-sm text-neutral-500">
              Sin reseñas todavía
            </p>
          )}

          {(municipio || departamento) && (
            <p className="text-sm text-neutral-600">
              📍 {municipio}
              {municipio && departamento ? ", " : ""}
              {departamento}
            </p>
          )}

          <p className="text-sm text-green-600 font-medium">
            ● Tienda verificada
          </p>
        </div>
      </div>

      <Link href={`/store/${vendedor.id}`}>
        <button className="w-full bg-black text-white rounded-lg py-2 text-sm hover:opacity-90 transition">
          Ver tienda
        </button>
      </Link>
    </div>
  );
}
