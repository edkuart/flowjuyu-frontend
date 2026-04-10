// src/components/product-edit/SectionInformacion.tsx
//
// Edits: nombre, descripcion
// Saves: full PUT (via onSave → saveSection("informacion"))

"use client"

import { useMemo, useRef } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { SectionCard } from "./SectionCard"
import type { CommonSectionProps } from "@/types/product-edit"

const SKU_PATTERN = /^[A-Za-z0-9_-]+$/

function buildAutoSkuPreview(nombre: string, fallbackCode: string) {
  const prefix = nombre
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .map((word) =>
      word
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, ""),
    )
    .filter(Boolean)
    .join("-")
    .slice(0, 10)

  return prefix ? `AUTO-${prefix}-${fallbackCode}` : `AUTO-${fallbackCode}`
}

export function SectionInformacion({
  product,
  updateFields,
  onSave,
  sectionState,
  isSaving,
  defaultExpanded,
  priority,
}: CommonSectionProps) {
  const autoSkuSuffixRef = useRef(
    Math.random().toString(36).slice(2, 8).toUpperCase(),
  )
  const sellerSku = product.seller_sku ?? ""
  const trimmedSellerSku = sellerSku.trim()
  const isManualSku = Boolean(product.useCustomSku)
  const autoSkuPreview = useMemo(
    () => buildAutoSkuPreview(product.nombre, autoSkuSuffixRef.current),
    [product.nombre],
  )
  const sellerSkuError = !isManualSku
    ? null
    : trimmedSellerSku.length > 100
      ? "Máximo 100 caracteres."
      : trimmedSellerSku && !SKU_PATTERN.test(trimmedSellerSku)
        ? "Solo letras, números, guion y guion bajo."
        : null

  return (
    <SectionCard
      title="Información"
      description="Nombre y descripción — lo primero que verán los compradores."
      onSave={onSave}
      sectionState={sectionState}
      isSaving={isSaving}
      saveLabel="Guardar"
      defaultExpanded={defaultExpanded}
      priority={priority}
    >
      <div className="space-y-1.5">
        <Label
          htmlFor="edit-nombre"
          className="text-xs font-medium text-gray-600"
        >
          Nombre <span className="text-destructive">*</span>
        </Label>
        <Input
          id="edit-nombre"
          value={product.nombre}
          onChange={(e) => updateFields({ nombre: e.target.value })}
          placeholder="Nombre del producto"
          maxLength={200}
          className="h-9 border-gray-200 text-sm focus-visible:border-[#0f2e22]/50 focus-visible:ring-1 focus-visible:ring-[#0f2e22]/40"
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="edit-descripcion"
          className="text-xs font-medium text-gray-600"
        >
          Descripción
        </Label>
        <Textarea
          id="edit-descripcion"
          value={product.descripcion ?? ""}
          onChange={(e) =>
            updateFields({
              descripcion: e.target.value === "" ? null : e.target.value,
            })
          }
          placeholder="Técnica, materiales, dimensiones, historia del artesano…"
          rows={3}
          className="resize-none border-gray-200 text-sm focus-visible:border-[#0f2e22]/50 focus-visible:ring-1 focus-visible:ring-[#0f2e22]/40"
          maxLength={2000}
        />
        <p className="text-right text-[11px] text-gray-300">
          {(product.descripcion ?? "").length} / 2000
        </p>
      </div>

      <div className="space-y-3 rounded-lg border border-gray-100 bg-gray-50/70 p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-0.5">
            <Label
              htmlFor="edit-sku-mode"
              className="text-xs font-medium text-gray-700"
            >
              SKU del vendedor
            </Label>
            <p className="text-muted-foreground text-[11px] leading-snug">
              Usa un código automático o define tu propio identificador interno.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-white px-2.5 py-2 text-xs text-gray-600">
            <span
              className={
                !isManualSku ? "font-medium text-[#0f2e22]" : undefined
              }
            >
              Automático
            </span>
            <Switch
              id="edit-sku-mode"
              checked={isManualSku}
              onCheckedChange={(checked) =>
                updateFields({
                  useCustomSku: checked,
                  seller_sku: checked ? sellerSku : null,
                })
              }
              aria-label="Usar SKU manual"
            />
            <span
              className={isManualSku ? "font-medium text-[#0f2e22]" : undefined}
            >
              Manual
            </span>
          </div>
        </div>

        {isManualSku ? (
          <div className="space-y-1.5">
            <Label
              htmlFor="edit-seller-sku"
              className="text-xs font-medium text-gray-600"
            >
              SKU manual
            </Label>
            <Input
              id="edit-seller-sku"
              value={sellerSku}
              onChange={(e) => updateFields({ seller_sku: e.target.value })}
              placeholder="Ej. HUIPIL-AZUL-001"
              maxLength={100}
              aria-invalid={Boolean(sellerSkuError)}
              className="h-9 border-gray-200 font-mono text-sm focus-visible:border-[#0f2e22]/50 focus-visible:ring-1 focus-visible:ring-[#0f2e22]/40"
            />
            <div className="flex items-start justify-between gap-3 text-[11px]">
              <p
                className={
                  sellerSkuError ? "text-destructive" : "text-muted-foreground"
                }
              >
                {sellerSkuError ??
                  "Opcional. Solo letras, números, guion y guion bajo."}
              </p>
              <span className="shrink-0 text-gray-300">
                {sellerSku.length} / 100
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-gray-200 bg-white px-3 py-2">
            <p className="text-[11px] font-medium text-gray-500">
              Vista previa
            </p>
            <p className="mt-1 font-mono text-sm font-medium break-words text-[#0f2e22]">
              {autoSkuPreview}
            </p>
            <p className="text-muted-foreground mt-1 text-[11px] leading-snug">
              Este código es solo una referencia visual. El sistema asignará el
              identificador final al crear el producto.
            </p>
          </div>
        )}
      </div>
    </SectionCard>
  )
}
