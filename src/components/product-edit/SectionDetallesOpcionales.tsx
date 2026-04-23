// src/components/product-edit/SectionDetallesOpcionales.tsx
//
// Optional product details stored as JSONB in productos.atributos.
// Fields: medidas (largo/ancho/alto/unidad), material_principal, tecnica, cuidados.
// All fields are optional — never blocks save of other sections.
// Saves: full PUT (via onSave → saveSection("detalles"))

"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatMeasuresHelper } from "@/lib/productMeasures"
import { SectionCard } from "./SectionCard"
import type { CommonSectionProps, ProductAtributos, ProductMedidas } from "@/types/product-edit"

const UNIT_OPTIONS = [
  { value: "cm", label: "Centímetros (cm)" },
  { value: "vara", label: "Varas" },
  { value: "pulg", label: "Pulgadas" },
  { value: "m", label: "Metros (m)" },
] as const
const fieldLabelClass =
  "text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5f6f66]"
const fieldClass =
  "h-11 rounded-xl border border-[#0f2e22]/12 bg-white/95 text-[15px] shadow-[0_1px_0_rgba(15,46,34,0.04)] transition focus-visible:border-[#0f2e22]/28 focus-visible:ring-[3px] focus-visible:ring-[#0f2e22]/10"
const textareaClass =
  "rounded-2xl border border-[#0f2e22]/12 bg-white/95 text-[15px] shadow-[0_1px_0_rgba(15,46,34,0.04)] transition focus-visible:border-[#0f2e22]/28 focus-visible:ring-[3px] focus-visible:ring-[#0f2e22]/10"

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
  const helper = formatMeasuresHelper(m)

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
            <Label className={fieldLabelClass}>{label}</Label>
            <Input
              inputMode="decimal"
              placeholder="—"
              value={dimToDisplay(m[field])}
              onChange={(e) => setDim(field, e.target.value)}
              className={`${fieldClass} h-11 tabular-nums`}
            />
          </div>
        ))}
      </div>

      {/* Unit — narrow, separate row */}
      <div className="space-y-1">
        <Label className={fieldLabelClass}>Unidad</Label>
        <Select value={m.unidad ?? ""} onValueChange={setUnidad}>
          <SelectTrigger className={`${fieldClass} max-w-[240px] justify-between`}>
            <SelectValue placeholder="Selecciona una unidad" />
          </SelectTrigger>
          <SelectContent className="z-[70] rounded-2xl border border-[#0f2e22]/10 bg-white shadow-[0_18px_50px_rgba(15,46,34,0.14)]">
            {UNIT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[11px] leading-relaxed text-[#8b9690]">
          Si ingresas medidas en cm, te mostramos la equivalencia en varas y pulgadas.
        </p>
      </div>

      {helper && (
        <p className="rounded-xl bg-[#0f2e22]/4 px-3 py-2 text-[11px] leading-relaxed text-[#0f2e22]/72">
          {helper}
        </p>
      )}
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
  completionLabel,
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
      completionLabel={completionLabel}
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
        <Label className={fieldLabelClass}>
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
          className={fieldClass}
        />
      </div>

      {/* ── Técnica ──────────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label className={fieldLabelClass}>
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
          className={fieldClass}
        />
      </div>

      {/* ── Cuidados ─────────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label className={fieldLabelClass}>
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
          className={`resize-none ${textareaClass}`}
        />
        {cuidadosLen > 400 && (
          <p className="text-[10px] text-right tabular-nums text-[#99a49e]">
            {cuidadosLen}/500
          </p>
        )}
      </div>
    </SectionCard>
  )
}
