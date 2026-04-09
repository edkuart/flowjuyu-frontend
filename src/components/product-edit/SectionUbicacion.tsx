// src/components/product-edit/SectionUbicacion.tsx
//
// Edits: departamento, municipio, departamento_custom, municipio_custom
// These fields exist in the DB but are NOT in the Sequelize model.
// They are managed via raw SQL in the backend — they exist and they work.
// Saves: full PUT via onSave

"use client"

import { useMemo } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { SectionCard } from "./SectionCard"
import { departamentosConMunicipios } from "@/data/municipios"
import type { CommonSectionProps } from "@/types/product-edit"

export function SectionUbicacion({
  product,
  updateFields,
  onSave,
  sectionState,
  isSaving,
  defaultExpanded,
  priority,
}: CommonSectionProps) {
  // Derive municipios list from selected departamento
  const municipios = useMemo(() => {
    if (!product.departamento) return []
    const dep = departamentosConMunicipios.find(
      (d) => d.nombre === product.departamento
    )
    return dep?.municipios ?? []
  }, [product.departamento])

  function handleDepartamentoChange(dep: string) {
    updateFields({
      departamento: dep || null,
      // Clear municipio when department changes — the old value may not exist
      municipio: null,
      municipio_custom: null,
    })
  }

  function handleMunicipioChange(mun: string) {
    updateFields({ municipio: mun || null })
  }

  return (
    <SectionCard
      title="Ubicación de origen"
      description="Origen del producto — opcional. Ayuda a compradores a encontrar artesanías de su región."
      onSave={onSave}
      sectionState={sectionState}
      isSaving={isSaving}
      saveLabel="Guardar"
      defaultExpanded={defaultExpanded}
      priority={priority}
    >

      {/* Departamento */}
      <div className="space-y-1">
        <Label htmlFor="edit-departamento">Departamento</Label>
        <select
          id="edit-departamento"
          className="w-full border rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring h-9"
          value={product.departamento ?? ""}
          onChange={(e) => handleDepartamentoChange(e.target.value)}
        >
          <option value="">— Sin especificar —</option>
          {departamentosConMunicipios.map((d) => (
            <option key={d.nombre} value={d.nombre}>
              {d.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Municipio — only show when a departamento is selected */}
      {product.departamento && (
        <div className="space-y-1">
          <Label htmlFor="edit-municipio">Municipio</Label>
          <select
            id="edit-municipio"
            className="w-full border rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring h-9"
            value={product.municipio ?? ""}
            onChange={(e) => handleMunicipioChange(e.target.value)}
          >
            <option value="">— Sin especificar —</option>
            {municipios.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Custom overrides (rarely used — only shown when already set) */}
      {product.departamento_custom && (
        <div className="space-y-1">
          <Label htmlFor="edit-dep-custom">
            Departamento personalizado
          </Label>
          <Input
            id="edit-dep-custom"
            value={product.departamento_custom}
            onChange={(e) =>
              updateFields({ departamento_custom: e.target.value || null })
            }
          />
        </div>
      )}

      {product.municipio_custom && (
        <div className="space-y-1">
          <Label htmlFor="edit-mun-custom">
            Municipio personalizado
          </Label>
          <Input
            id="edit-mun-custom"
            value={product.municipio_custom}
            onChange={(e) =>
              updateFields({ municipio_custom: e.target.value || null })
            }
          />
        </div>
      )}
    </SectionCard>
  )
}
