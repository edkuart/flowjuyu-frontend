//src/components/product/view/ProductRelated.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8800";

type RelatedProduct = {
  id: string;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
};

type Props = {
  productos: RelatedProduct[];
  sellerName?: string;
  sellerId?: number;
};

function normalizeURL(url: string | null | undefined) {
  if (!url) return "/placeholder.jpg";
  if (url.startsWith("http")) return url;
  return `${BACKEND}${url}`;
}

export default function ProductRelated({ productos, sellerName, sellerId }: Props) {
  if (!productos || productos.length === 0) return null;

  // Show max 4
  const visible = productos.slice(0, 4);

  const title = sellerName
    ? `Más de ${sellerName}`
    : "Más de esta tienda";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-1">
            También te puede interesar
          </p>
          <h2 className="text-2xl font-bold text-neutral-900">
            {title}
          </h2>
        </div>
        {sellerId && (
          <Link
            href={`/store/${sellerId}`}
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#0F3D3A] hover:opacity-70 transition-opacity flex-shrink-0"
          >
            Ver tienda completa
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {visible.map((p) => (
          <Link href={`/product/${p.id}`} key={p.id} className="group block">
            <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">

              {/* Image */}
              <div className="relative w-full aspect-[3/4] bg-neutral-50 overflow-hidden">
                <Image
                  src={normalizeURL(p.imagen_url)}
                  alt={p.nombre}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
                />
                {/* Artesanal badge */}
                <div className="absolute top-2 left-2">
                  <span className="bg-white/90 backdrop-blur-sm text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                    Artesanal
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 space-y-1">
                <p className="font-semibold text-neutral-800 text-sm leading-snug line-clamp-2 group-hover:text-[#0F3D3A] transition-colors">
                  {p.nombre}
                </p>
                <p className="text-neutral-700 font-bold text-sm">
                  Q{Number(p.precio).toFixed(2)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile "Ver tienda" CTA */}
      {sellerId && (
        <div className="sm:hidden text-center pt-2">
          <Link
            href={`/store/${sellerId}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F3D3A] border border-[#0F3D3A] rounded-xl px-5 py-2.5 hover:bg-[#0F3D3A] hover:text-white transition-colors"
          >
            Ver tienda completa
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
