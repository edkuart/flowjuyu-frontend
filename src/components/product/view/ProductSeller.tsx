"use client";

import Image from "next/image";
import Link from "next/link";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8800";

type SellerProps = {
  vendedor_nombre?: string | null;
  vendedor_logo_url?: string | null;
  departamento?: string | null;
  municipio?: string | null;
  vendedor_id?: string | null;
};

export default function ProductSeller({
  vendedor_nombre,
  vendedor_logo_url,
  departamento,
  municipio,
  vendedor_id,
}: SellerProps) {
  if (!vendedor_nombre && !departamento) return null;

  return (
    <div className="border rounded-lg p-4 bg-white max-w-xs shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Vendedor</h3>

      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-neutral-200">
          <Image
            src={vendedor_logo_url ? BACKEND + vendedor_logo_url : "/placeholder.jpg"}
            alt="logo vendedor"
            fill
            className="object-cover"
          />
        </div>

        <div>
          <p className="font-medium text-neutral-800">{vendedor_nombre}</p>
          <p className="text-sm text-neutral-600">{municipio} {departamento}</p>
        </div>
      </div>

      {vendedor_id && (
        <Link href={`/seller/${vendedor_id}`} className="text-sm underline text-neutral-700">
          Visitar tienda →
        </Link>
      )}
    </div>
  );
}
