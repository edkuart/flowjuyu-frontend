// src/components/product-edit/ProductEditPreview.tsx
//
// Hero preview panel — the "main object" of the edit experience.
// Styled to feel like a real product listing, not a widget.
// READ-ONLY. Updates in real time as the seller edits.

"use client"

import Image from "next/image"
import { MapPin, Package } from "lucide-react"
import { ProductConversionCard } from "@/components/product/ProductConversionCard"
import { ProductTitle } from "@/components/product/ProductTitle"
import { getProductConversionInsights } from "@/lib/productConversion"
import type { ProductEditData, ProductAtributos } from "@/types/product-edit"

interface Props {
  product: ProductEditData
}

// Build a compact single-line summary of the optional attributes for the preview.
// Returns null when there's nothing meaningful to show.
function buildAtributosLine(a: ProductAtributos | undefined): string | null {
  if (!a) return null
  const parts: string[] = []

  if (a.medidas) {
    const { largo, ancho, alto, unidad } = a.medidas
    const dims = [largo, ancho, alto].filter((n): n is number => n != null && n > 0)
    if (dims.length > 0) {
      const u = unidad ? ` ${unidad}` : ""
      parts.push(dims.join(" × ") + u)
    }
  }

  if (a.material_principal) parts.push(a.material_principal)
  if (a.tecnica) parts.push(a.tecnica)

  return parts.length > 0 ? parts.join(" · ") : null
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

  const atributosLine = buildAtributosLine(product.atributos)

  return (
    <div className="space-y-3">
      {/* Live label */}
      <div className="flex items-center gap-2 px-0.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.14em]">
          Vista previa en tiempo real
        </p>
      </div>

      {/* ── Hero card ─────────────────────────────────────────────────────────── */}
      <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_4px_28px_-8px_rgba(0,0,0,0.10)] transition-shadow duration-300 hover:shadow-[0_8px_36px_-8px_rgba(0,0,0,0.14)]">

        {/* Image area */}
        <div className="aspect-square bg-[#f5f4f2] relative overflow-hidden">
          {product.imagen_principal ? (
            <Image
              src={product.imagen_principal}
              alt={product.nombre || "Producto"}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              sizes="320px"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2.5">
              <Package className="w-9 h-9 text-gray-200" />
              <p className="text-[11px] text-gray-300 font-medium tracking-wide">Sin imagen</p>
            </div>
          )}

          {/* Status badge — backdrop blur */}
          <div className="absolute top-3 left-3">
            {product.activo ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/90 text-white backdrop-blur-sm shadow-sm">
                Publicado
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/85 text-gray-500 backdrop-blur-sm border border-white/60 shadow-sm">
                Borrador
              </span>
            )}
          </div>

          {/* Image count badge — bottom right */}
          {(product.imagenes?.length ?? 0) > 1 && (
            <div className="absolute bottom-2.5 right-2.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/40 text-white backdrop-blur-sm">
                {product.imagenes!.length} fotos
              </span>
            </div>
          )}
        </div>

        {/* Info area */}
        <div className="px-4 pt-4 pb-4 space-y-2">
          {/* Name */}
          <ProductTitle value={product.nombre ?? ""} variant="preview" />

          {/* Price — dominant */}
          <p className="text-2xl font-bold text-[#0f2e22] tabular-nums leading-none tracking-tight">
            {precioFormatted}
          </p>

          {/* Location */}
          {location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0 text-gray-300" />
              <span className="text-[11px] text-gray-400 truncate">{location}</span>
            </div>
          )}

          {/* Description excerpt */}
          {product.descripcion && (
            <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed pt-1 border-t border-gray-50">
              {product.descripcion}
            </p>
          )}

          {/* Attributes strip — medidas · material · técnica */}
          {atributosLine && (
            <p className="text-[10px] text-gray-300 truncate pt-1 border-t border-gray-50 font-medium tracking-wide">
              {atributosLine}
            </p>
          )}
        </div>
      </div>

      {/* Conversion score card */}
      <ProductConversionCard insights={insights} />

      <p className="text-[10px] text-center text-gray-300 tracking-wide">
        Refleja cambios al instante
      </p>
    </div>
  )
}
