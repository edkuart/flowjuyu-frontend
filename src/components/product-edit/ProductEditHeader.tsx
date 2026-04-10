// src/components/product-edit/ProductEditHeader.tsx
//
// Read-only identity card shown at the top of the edit page.
// Displays: context label, product name, activo badge, internal_code.
// Does NOT allow toggling activo — that uses PATCH /activo (separate flow).

"use client"

import { Badge } from "@/components/ui/badge"
import { ProductTitle } from "@/components/product/ProductTitle"
import type { ProductEditData } from "@/types/product-edit"

interface Props {
  product: ProductEditData
}

export function ProductEditHeader({ product }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {/* Brand accent bar */}
      <div className="h-[3px] bg-[#0f2e22]" />

      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#0f2e22] uppercase tracking-widest mb-1.5">
              Editar producto
            </p>
            <h1>
              <ProductTitle value={product.nombre ?? ""} variant="editor" />
            </h1>
            {(product.internal_code || product.seller_sku) && (
              <div className="flex items-center gap-2 mt-2">
                {product.internal_code && (
                  <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                    {product.internal_code}
                  </span>
                )}
                {product.seller_sku && (
                  <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                    SKU: {product.seller_sku}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex-shrink-0 mt-1">
            {product.activo ? (
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 font-medium text-[11px] px-2.5">
                Publicado
              </Badge>
            ) : (
              <Badge variant="outline" className="text-gray-400 font-medium text-[11px] px-2.5">
                Borrador
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Bottom context strip */}
      <div className="px-5 py-2.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
        <p className="text-[11px] text-gray-400">
          Los cambios se guardan por sección — no hay botón global.
        </p>
        <p className="text-[11px] text-gray-400 font-mono tabular-nums">
          #{String(product.id).slice(-6)}
        </p>
      </div>
    </div>
  )
}
