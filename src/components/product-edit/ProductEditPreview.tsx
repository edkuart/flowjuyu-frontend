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
import { formatMeasuresForStore } from "@/lib/productMeasures"
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
    const medidas = formatMeasuresForStore(a.medidas)
    if (medidas) parts.push(medidas)
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
    <div className="space-y-4">
      {/* Live label */}
      <div className="flex items-center gap-2 px-0.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
        </span>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
          Vista previa en tiempo real
        </p>
      </div>

      {/* ── Hero card ─────────────────────────────────────────────────────────── */}
      <div className="group overflow-hidden rounded-[28px] border border-[#0f2e22]/8 bg-white shadow-[0_18px_45px_-28px_rgba(15,46,34,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_55px_-28px_rgba(15,46,34,0.34)]">

        {/* Image area */}
        <div className="relative aspect-square overflow-hidden bg-[linear-gradient(135deg,#f7f4ee_0%,#efe7db_100%)]">
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
        <div className="space-y-2.5 px-4 pb-4 pt-4">
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

      <p className="text-center text-[10px] tracking-wide text-gray-300">
        Refleja cambios al instante
      </p>
    </div>
  )
}
