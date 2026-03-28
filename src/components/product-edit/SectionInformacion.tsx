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
}: CommonSectionProps) {
  return (
    <SectionCard
      title="Información básica"
      description="Nombre y descripción — lo primero que verán los compradores."
      onSave={onSave}
      sectionState={sectionState}
      isSaving={isSaving}
      saveLabel="Guardar información"
    >
      <div className="space-y-1">
        <Label htmlFor="edit-nombre">
          Nombre del producto <span className="text-destructive">*</span>
        </Label>
        <Input
          id="edit-nombre"
          value={product.nombre}
          onChange={(e) => updateFields({ nombre: e.target.value })}
          placeholder="Nombre del producto"
          maxLength={200}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="edit-descripcion">Descripción</Label>
        <Textarea
          id="edit-descripcion"
          value={product.descripcion ?? ""}
          onChange={(e) =>
            // Only null on truly empty — don't trim while typing, which
            // would cause cursor jumps when the user types spaces.
            updateFields({ descripcion: e.target.value === "" ? null : e.target.value })
          }
          placeholder="Describe el producto, técnica, materiales, dimensiones…"
          rows={4}
          className="resize-none"
          maxLength={2000}
        />
        <p className="text-xs text-muted-foreground text-right">
          {(product.descripcion ?? "").length}/2000
        </p>
      </div>
    </SectionCard>
  )
}
