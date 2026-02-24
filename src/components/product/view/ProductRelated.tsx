//src/components/product/view/ProductRelated.tsx

"use client";

import Link from "next/link";
import Image from "next/image";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8800";

type RelatedProduct = {
  id: string;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
};

export default function ProductRelated({ productos }: { productos: RelatedProduct[] }) {
  if (!productos || productos.length === 0) return null;

  // 🔥 Normalizador de URL
  function normalizeURL(url: string | null | undefined) {
    if (!url) return "/placeholder.jpg";
    if (url.startsWith("http")) return url; // Supabase o remoto
    return `${BACKEND}${url}`;             // Local backend
  }

  return (
    <div className="mt-16">
      <h2 className="text-xl font-semibold mb-4">Productos relacionados</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {productos.map((p) => (
          <Link href={`/product/${p.id}`} key={p.id}>
            <div className="border rounded-lg p-3 shadow-sm hover:shadow-lg transition cursor-pointer bg-white">
              <div className="relative w-full aspect-square rounded overflow-hidden bg-neutral-100">
                <Image
                  src={normalizeURL(p.imagen_url)}
                  alt={p.nombre}
                  fill
                  className="object-cover"
                  onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                />
              </div>

              <p className="font-medium mt-2 text-sm">{p.nombre}</p>
              <p className="text-neutral-700 font-semibold text-sm">
                Q{Number(p.precio).toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
