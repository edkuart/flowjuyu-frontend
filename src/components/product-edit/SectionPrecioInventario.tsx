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
import { SellerEducationHint } from "@/components/seller/SellerEducationHint"
import { SectionCard } from "./SectionCard"
import type { CommonSectionProps } from "@/types/product-edit"

const fieldLabelClass =
  "text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5f6f66]"
const fieldClass =
  "h-11 rounded-xl border border-[#0f2e22]/12 bg-white/95 text-[15px] shadow-[0_1px_0_rgba(15,46,34,0.04)] transition focus-visible:border-[#0f2e22]/28 focus-visible:ring-[3px] focus-visible:ring-[#0f2e22]/10"

export function SectionPrecioInventario({
  product,
  updateFields,
  onSave,
  sectionState,
  completionLabel,
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
      completionLabel={completionLabel}
      isSaving={isSaving}
      saveLabel="Guardar"
      defaultExpanded={defaultExpanded}
      priority={priority}
    >
      <SellerEducationHint title="Precio">
        <p>No pongas "precio por inbox". Se claro para generar confianza.</p>
      </SellerEducationHint>

      <div className="grid grid-cols-2 gap-3">
        {/* Precio */}
        <div className="space-y-1.5">
          <Label htmlFor="edit-precio" className={fieldLabelClass}>
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
            className={fieldClass}
          />
        </div>

        {/* Stock */}
        <div className="space-y-1.5">
          <Label htmlFor="edit-stock" className={fieldLabelClass}>
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
            className={fieldClass}
          />
        </div>
      </div>

      {/* Read-only identifiers */}
      {(product.internal_code || product.seller_sku) && (
        <div className="space-y-1 rounded-2xl border border-[#0f2e22]/10 bg-[#f7f4ee]/88 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          {product.internal_code && (
            <p className="text-[12px] text-[#738178]">
              <span className="font-semibold text-[#425149]">Código FJ:</span>{" "}
              <span className="font-mono">{product.internal_code}</span>
            </p>
          )}
          {product.seller_sku && (
            <p className="text-[12px] text-[#738178]">
              <span className="font-semibold text-[#425149]">SKU:</span>{" "}
              <span className="font-mono">{product.seller_sku}</span>
            </p>
          )}
        </div>
      )}
    </SectionCard>
  )
}
