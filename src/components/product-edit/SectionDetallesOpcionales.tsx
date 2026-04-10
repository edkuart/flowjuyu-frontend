// src/components/product-edit/SectionDetallesOpcionales.tsx
//
// Optional product details stored as JSONB in productos.atributos.
// Fields: medidas (largo/ancho/alto/unidad), material_principal, tecnica, cuidados.
// All fields are optional — never blocks save of other sections.
// Saves: full PUT (via onSave → saveSection("detalles"))

"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SectionCard } from "./SectionCard"
import type { CommonSectionProps, ProductAtributos, ProductMedidas } from "@/types/product-edit"

// ── Helpers ───────────────────────────────────────────────────────────────────

// Display a number as a clean string in the input (no trailing zeros from toFixed)
function dimToDisplay(n: number | null | undefined): string {
  if (n == null) return ""
  return String(n)
}

// Parse a text input to a positive number, or null if invalid/empty
function parseDim(raw: string): number | null {
  const s = raw.trim()
  if (!s) return null
  const n = Number(s)
  return Number.isFinite(n) && n > 0 ? n : null
}

// ── Sub-component: Medidas ────────────────────────────────────────────────────

interface MedidasProps {
  medidas: ProductMedidas | undefined
  onChange: (next: ProductMedidas) => void
}

function MedidasFields({ medidas, onChange }: MedidasProps) {
  const m: ProductMedidas = medidas ?? { largo: null, ancho: null, alto: null, unidad: null }

  function setDim(field: "largo" | "ancho" | "alto", raw: string) {
    onChange({ ...m, [field]: parseDim(raw) })
  }

  function setUnidad(raw: string) {
    onChange({ ...m, unidad: raw.trim() || null })
  }

  return (
    <div className="space-y-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
        Medidas
      </p>

      {/* Dimension inputs — 3-col grid, compact on mobile */}
      <div className="grid grid-cols-3 gap-2">
        {(
          [
            { field: "largo", label: "Largo" },
            { field: "ancho", label: "Ancho" },
            { field: "alto",  label: "Alto"  },
          ] as const
        ).map(({ field, label }) => (
          <div key={field} className="space-y-1">
            <Label className="text-[11px] text-gray-500">{label}</Label>
            <Input
              inputMode="decimal"
              placeholder="—"
              value={dimToDisplay(m[field])}
              onChange={(e) => setDim(field, e.target.value)}
              className="h-8 text-sm tabular-nums"
            />
          </div>
        ))}
      </div>

      {/* Unit — narrow, separate row */}
      <div className="space-y-1">
        <Label className="text-[11px] text-gray-500">Unidad</Label>
        <Input
          placeholder="cm, pulg, m…"
          value={m.unidad ?? ""}
          onChange={(e) => setUnidad(e.target.value)}
          maxLength={20}
          className="h-8 text-sm max-w-[140px]"
        />
      </div>
    </div>
  )
}

// ── Optional label ─────────────────────────────────────────────────────────────

function OptionalTag() {
  return (
    <span className="ml-1 text-[10px] font-normal text-gray-400">(opcional)</span>
  )
}

// ── Main section ──────────────────────────────────────────────────────────────

export function SectionDetallesOpcionales({
  product,
  updateFields,
  onSave,
  sectionState,
  isSaving,
  defaultExpanded,
  priority,
}: CommonSectionProps) {
  const atributos: ProductAtributos = product.atributos ?? {}

  function setAtributo<K extends keyof ProductAtributos>(
    key: K,
    value: ProductAtributos[K],
  ) {
    updateFields({ atributos: { ...atributos, [key]: value } })
  }

  const cuidadosLen = (atributos.cuidados ?? "").length

  return (
    <SectionCard
      title="Detalles del producto"
      description="Medidas, materiales y técnica — ayuda a los compradores a conocer mejor lo que ofreces."
      sectionState={sectionState}
      isSaving={isSaving}
      onSave={onSave}
      defaultExpanded={defaultExpanded}
      priority={priority}
    >
      {/* ── Medidas ─────────────────────────────────────────────────────────── */}
      <MedidasFields
        medidas={atributos.medidas}
        onChange={(next) => setAtributo("medidas", next)}
      />

      {/* ── Divider ─────────────────────────────────────────────────────────── */}
      <div className="border-t border-gray-100" />

      {/* ── Material principal ───────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label className="text-[12px] font-medium text-gray-700">
          Material principal
          <OptionalTag />
        </Label>
        <Input
          placeholder="ej. algodón, cuero, madera"
          value={atributos.material_principal ?? ""}
          onChange={(e) =>
            setAtributo("material_principal", e.target.value || undefined)
          }
          maxLength={500}
          className="h-9 text-sm"
        />
      </div>

      {/* ── Técnica ──────────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label className="text-[12px] font-medium text-gray-700">
          Técnica de elaboración
          <OptionalTag />
        </Label>
        <Input
          placeholder="ej. tejido a mano, bordado, tallado"
          value={atributos.tecnica ?? ""}
          onChange={(e) =>
            setAtributo("tecnica", e.target.value || undefined)
          }
          maxLength={500}
          className="h-9 text-sm"
        />
      </div>

      {/* ── Cuidados ─────────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label className="text-[12px] font-medium text-gray-700">
          Instrucciones de cuidado
          <OptionalTag />
        </Label>
        <Textarea
          placeholder="ej. Lavar a mano con agua fría. No usar secadora."
          value={atributos.cuidados ?? ""}
          onChange={(e) =>
            setAtributo("cuidados", e.target.value || undefined)
          }
          maxLength={500}
          rows={3}
          className="text-sm resize-none"
        />
        {cuidadosLen > 400 && (
          <p className="text-[10px] text-right text-gray-400 tabular-nums">
            {cuidadosLen}/500
          </p>
        )}
      </div>
    </SectionCard>
  )
}
