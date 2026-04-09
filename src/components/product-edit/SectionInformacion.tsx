// src/components/product-edit/SectionInformacion.tsx
//
// Edits: nombre, descripcion
// Saves: full PUT (via onSave → saveSection("informacion"))

"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SectionCard } from "./SectionCard"
import type { CommonSectionProps } from "@/types/product-edit"

export function SectionInformacion({
  product,
  updateFields,
  onSave,
  sectionState,
  isSaving,
  defaultExpanded,
  priority,
}: CommonSectionProps) {
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
        <Label htmlFor="edit-nombre" className="text-xs font-medium text-gray-600">
          Nombre <span className="text-destructive">*</span>
        </Label>
        <Input
          id="edit-nombre"
          value={product.nombre}
          onChange={(e) => updateFields({ nombre: e.target.value })}
          placeholder="Nombre del producto"
          maxLength={200}
          className="h-9 text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-[#0f2e22]/40 focus-visible:border-[#0f2e22]/50"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="edit-descripcion" className="text-xs font-medium text-gray-600">
          Descripción
        </Label>
        <Textarea
          id="edit-descripcion"
          value={product.descripcion ?? ""}
          onChange={(e) =>
            updateFields({ descripcion: e.target.value === "" ? null : e.target.value })
          }
          placeholder="Técnica, materiales, dimensiones, historia del artesano…"
          rows={3}
          className="resize-none text-sm border-gray-200 focus-visible:ring-1 focus-visible:ring-[#0f2e22]/40 focus-visible:border-[#0f2e22]/50"
          maxLength={2000}
        />
        <p className="text-[11px] text-gray-300 text-right">
          {(product.descripcion ?? "").length} / 2000
        </p>
      </div>
    </SectionCard>
  )
}
