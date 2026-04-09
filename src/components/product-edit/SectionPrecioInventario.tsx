// src/components/product-edit/SectionPrecioInventario.tsx
//
// Edits: precio, stock
// Displays (read-only): internal_code, seller_sku
// Saves: full PUT via onSave
//
// Price input uses local string state to allow partial values while typing
// (e.g. "10." before the user finishes "10.5"). The numeric value is committed
// to product state on every valid change and finalized on blur. This prevents
// the `as unknown as number` double-cast hack while keeping the UX smooth.

"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { SectionCard } from "./SectionCard"
import type { CommonSectionProps } from "@/types/product-edit"

export function SectionPrecioInventario({
  product,
  updateFields,
  onSave,
  sectionState,
  isSaving,
  defaultExpanded,
  priority,
}: CommonSectionProps) {
  // ── Local price input state ──────────────────────────────────────────────
  //
  // Keeps a raw string for the <input> so the user can type "10." without the
  // trailing dot being stripped. The actual numeric value lives in product.precio.
  // On blur we finalize: strip the trailing dot, write the clean number to state.

  const [priceInput, setPriceInput] = useState(() =>
    product.precio > 0 ? String(product.precio) : ""
  )

  // Re-sync the display when the product is reloaded from the server (e.g.
  // after a silent reload triggered by an image upload).
  useEffect(() => {
    setPriceInput(product.precio > 0 ? String(product.precio) : "")
  }, [product.precio])

  function handlePrecioChange(raw: string) {
    setPriceInput(raw)
    // Don't commit partial/invalid intermediate values to product state.
    if (raw === "" || raw.endsWith(".") || raw.endsWith(",")) return
    const parsed = parseFloat(raw)
    if (!isNaN(parsed) && parsed > 0) {
      updateFields({ precio: parsed })
    } else {
      // Commit 0 as a sentinel — validateProduct will catch this before any PUT.
      updateFields({ precio: 0 })
    }
  }

  function handlePrecioBlur() {
    // Finalize: strip trailing punctuation, sync display with the committed value.
    const parsed = parseFloat(priceInput)
    if (!isNaN(parsed) && parsed > 0) {
      updateFields({ precio: parsed })
      setPriceInput(String(parsed))
    } else {
      updateFields({ precio: 0 })
      setPriceInput("")
    }
  }

  // ── Stock handler ────────────────────────────────────────────────────────

  function handleStockChange(raw: string) {
    if (raw === "") {
      updateFields({ stock: 0 })
      return
    }
    const n = parseInt(raw, 10)
    if (!isNaN(n) && n >= 0) {
      updateFields({ stock: n })
    }
  }

  return (
    <SectionCard
      title="Precio e inventario"
      description="Define cuánto cuesta y cuántas unidades tienes disponibles."
      onSave={onSave}
      sectionState={sectionState}
      isSaving={isSaving}
      saveLabel="Guardar"
      defaultExpanded={defaultExpanded}
      priority={priority}
    >
      <div className="grid grid-cols-2 gap-3">
        {/* Precio */}
        <div className="space-y-1.5">
          <Label htmlFor="edit-precio" className="text-xs font-medium text-gray-600">
            Precio (Q) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="edit-precio"
            type="number"
            min={0.01}
            step={0.01}
            value={priceInput}
            onChange={(e) => handlePrecioChange(e.target.value)}
            onBlur={handlePrecioBlur}
            placeholder="0.00"
            className="h-9 text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-[#0f2e22]/40 focus-visible:border-[#0f2e22]/50"
          />
        </div>

        {/* Stock */}
        <div className="space-y-1.5">
          <Label htmlFor="edit-stock" className="text-xs font-medium text-gray-600">
            Stock <span className="text-destructive">*</span>
          </Label>
          <Input
            id="edit-stock"
            type="number"
            min={0}
            step={1}
            value={product.stock}
            onChange={(e) => handleStockChange(e.target.value)}
            placeholder="0"
            className="h-9 text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-[#0f2e22]/40 focus-visible:border-[#0f2e22]/50"
          />
        </div>
      </div>

      {/* Read-only identifiers */}
      {(product.internal_code || product.seller_sku) && (
        <div className="bg-gray-50 border rounded-lg px-3 py-2 space-y-1">
          {product.internal_code && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Código FJ:</span>{" "}
              <span className="font-mono">{product.internal_code}</span>
            </p>
          )}
          {product.seller_sku && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">SKU:</span>{" "}
              <span className="font-mono">{product.seller_sku}</span>
            </p>
          )}
        </div>
      )}
    </SectionCard>
  )
}
