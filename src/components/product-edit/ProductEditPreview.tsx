// src/components/product-edit/ProductEditPreview.tsx
//
// Sticky right-panel preview for the product edit page.
// Shows a live snapshot of how the product looks to buyers,
// plus the conversion score card (reused from the create flow).
//
// READ-ONLY — never calls any API.
// All data comes from the in-memory product state via useProductEdit.

"use client"

import Image from "next/image"
import { MapPin, Package } from "lucide-react"
import { ProductConversionCard } from "@/components/product/ProductConversionCard"
import { getProductConversionInsights } from "@/lib/productConversion"
import type { ProductEditData } from "@/types/product-edit"

interface Props {
  product: ProductEditData
}

export function ProductEditPreview({ product }: Props) {
  const location = [product.departamento, product.municipio]
    .filter(Boolean)
    .join(", ")

  const insights = getProductConversionInsights({
    nombre:      product.nombre ?? "",
    descripcion: product.descripcion ?? "",
    precio:      product.precio ?? 0,
    imagesCount: product.imagenes?.length ?? 0,
    categoria:   product.categoria_custom ?? (product.categoria_id ? String(product.categoria_id) : ""),
    location,
  })

  const precioFormatted =
    product.precio > 0
      ? `Q ${product.precio.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : "—"

  return (
    <div className="space-y-3.5">
      {/* Label */}
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest px-1">
        Vista previa
      </p>

      {/* Product card preview */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-shadow duration-200 hover:shadow-md">
        {/* Image — zoom on hover */}
        <div className="aspect-square bg-[#f5f4f2] relative overflow-hidden group">
          {product.imagen_principal ? (
            <Image
              src={product.imagen_principal}
              alt={product.nombre || "Producto"}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              sizes="320px"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2.5">
              <Package className="w-10 h-10 text-gray-300" />
              <p className="text-xs text-gray-300 font-medium">Sin imagen principal</p>
            </div>
          )}

          {/* Status badge — backdrop blur for readability over any image */}
          <div className="absolute top-2.5 left-2.5">
            {product.activo ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/90 text-white backdrop-blur-sm shadow-sm">
                Publicado
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/85 text-gray-600 backdrop-blur-sm border border-white/50 shadow-sm">
                Borrador
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="px-4 py-3.5 space-y-1.5">
          <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
            {product.nombre || (
              <span className="text-gray-300 italic font-normal">Sin nombre</span>
            )}
          </p>

          {/* Price — dominant, brand-colored */}
          <p className="text-xl font-bold text-[#0f2e22] tabular-nums leading-none pt-0.5">
            {precioFormatted}
          </p>

          {location && (
            <div className="flex items-center gap-1 pt-0.5">
              <MapPin className="w-3 h-3 flex-shrink-0 text-gray-400" />
              <span className="text-[11px] text-gray-400 truncate">{location}</span>
            </div>
          )}

          {product.descripcion && (
            <p className="text-[11px] text-gray-400 line-clamp-2 pt-1 leading-relaxed">
              {product.descripcion}
            </p>
          )}
        </div>
      </div>

      {/* Conversion score */}
      <ProductConversionCard insights={insights} />

      {/* Subtle note */}
      <p className="text-[11px] text-center text-gray-400 px-1">
        Se actualiza en tiempo real
      </p>
    </div>
  )
}
