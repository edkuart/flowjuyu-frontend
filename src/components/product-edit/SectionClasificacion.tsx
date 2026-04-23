// src/components/product-edit/SectionClasificacion.tsx
//
// Edits: categoria, clase, tela, accesorios (all taxonomy + custom fields)
// Saves: full PUT via onSave
//
// SAFETY RULES enforced here:
//   1. clase_id is ALWAYS kept in state — even when the UI hides it.
//      It is NEVER set to null by this component.
//   2. Changing categoria does NOT clear clase_id.
//   3. Changing clase_id clears tela_id/tela_custom (telas are clase-specific)
//      but keeps accesorio fields intact.
//   4. Changing accesorio_id clears tipo + material (they depend on parent).

"use client"

import { useEffect, useMemo, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { SectionCard } from "./SectionCard"
import { apiFetch } from "@/lib/api"
import { getTaxonomyRule } from "@/config/taxonomyRules"
import { sortClases, formatClaseLabel } from "@/lib/formatClase"
import type { CommonSectionProps, Opcion, ClaseOpcion } from "@/types/product-edit"

// Sentinel used in <select> to represent "custom / free-text entry"
const OTROS = "__OTROS__"
// Sentinel used in tela <select> to represent "not applicable"
const NA = "__NA__"
const fieldLabelClass =
  "text-[11px] font-semibold uppercase tracking-[0.08em] text-[#5f6f66]"
const fieldClass =
  "h-11 w-full rounded-xl border border-[#0f2e22]/12 bg-white/95 px-3 text-[15px] shadow-[0_1px_0_rgba(15,46,34,0.04)] transition outline-none focus:border-[#0f2e22]/28 focus:ring-[3px] focus:ring-[#0f2e22]/10 disabled:cursor-not-allowed disabled:opacity-50"

// ── Inline select helper ───────────────────────────────────────────────────────

function FieldSelect({
  id,
  label,
  required,
  value,
  onChange,
  options,
  includeOtros,
  includeNA,
  disabled,
  placeholder,
}: {
  id: string
  label: string
  required?: boolean
  value: string
  onChange: (v: string) => void
  options: Opcion[]
  includeOtros?: boolean
  includeNA?: boolean
  disabled?: boolean
  placeholder?: string
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className={fieldLabelClass}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <select
        id={id}
        className={fieldClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{placeholder ?? "Seleccione…"}</option>
        {options.map((o) => (
          <option key={o.id} value={String(o.id)}>
            {o.nombre}
          </option>
        ))}
        {includeNA && <option value={NA}>— No aplica —</option>}
        {includeOtros && <option value={OTROS}>Otro (personalizado)…</option>}
      </select>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SectionClasificacion({
  product,
  updateFields,
  onSave,
  sectionState,
  completionLabel,
  isSaving,
  defaultExpanded,
  priority,
}: CommonSectionProps) {
  // ── Catalogs (fetched once on mount) ──────────────────────────────────────
  const [categorias, setCategorias] = useState<Opcion[]>([])
  const [clases, setClases] = useState<ClaseOpcion[]>([])
  const [telas, setTelas] = useState<Opcion[]>([])
  const [accesorios, setAccesorios] = useState<Opcion[]>([])
  const [accesorioTipos, setAccesorioTipos] = useState<Opcion[]>([])
  const [accesorioMateriales, setAccesorioMateriales] = useState<Opcion[]>([])

  // ── Taxonomy rule — derived from the currently selected category ──────────
  // Determines which attribute groups are shown. This is a pure UI concern;
  // the backend payload (via full PUT spread) is unchanged regardless.
  const rule = useMemo(() => {
    const cat = categorias.find((c) => c.id === product.categoria_id)
    return getTaxonomyRule(cat?.nombre)
  }, [categorias, product.categoria_id])

  // ── UI state for "Otros" text inputs ──────────────────────────────────────
  // These hold the free-text while the user is typing.
  // When confirmed they are written into product state via updateFields.
  const [categoriaInput, setCategoriaInput] = useState(product.categoria_custom ?? "")
  const [telaInput, setTelaInput] = useState(product.tela_custom ?? "")
  const [accesorioInput, setAccesorioInput] = useState(product.accesorio_custom ?? "")
  const [tipoInput, setTipoInput] = useState(product.accesorio_tipo_custom ?? "")
  const [materialInput, setMaterialInput] = useState(product.accesorio_material_custom ?? "")

  // Re-sync local text inputs when the server value changes (e.g. after a silent
  // reload triggered by image upload). When the user is typing, updateFields()
  // keeps product.*_custom and the local input in sync — so these effects are
  // no-ops during normal typing (same value → React bails out, no re-render).
  // They only matter when the product is freshly loaded from the server.
  useEffect(() => { setCategoriaInput(product.categoria_custom ?? "") }, [product.categoria_custom])
  useEffect(() => { setTelaInput(product.tela_custom ?? "") }, [product.tela_custom])
  useEffect(() => { setAccesorioInput(product.accesorio_custom ?? "") }, [product.accesorio_custom])
  useEffect(() => { setTipoInput(product.accesorio_tipo_custom ?? "") }, [product.accesorio_tipo_custom])
  useEffect(() => { setMaterialInput(product.accesorio_material_custom ?? "") }, [product.accesorio_material_custom])

  // ── Derived select values ─────────────────────────────────────────────────
  // We map numeric IDs → string values for the <select> elements,
  // and handle the "OTROS" case when a custom text is set but no FK.
  const categoriaSel = product.categoria_custom
    ? OTROS
    : product.categoria_id
    ? String(product.categoria_id)
    : ""

  const claseSel = product.clase_id ? String(product.clase_id) : ""

  const telaSel = product.tela_custom
    ? OTROS
    : product.tela_id
    ? String(product.tela_id)
    : ""

  const accesorioSel = product.accesorio_custom
    ? OTROS
    : product.accesorio_id
    ? String(product.accesorio_id)
    : ""

  const tipoSel = product.accesorio_tipo_custom
    ? OTROS
    : product.accesorio_tipo_id
    ? String(product.accesorio_tipo_id)
    : ""

  const materialSel = product.accesorio_material_custom
    ? OTROS
    : product.accesorio_material_id
    ? String(product.accesorio_material_id)
    : ""

  // ── Fetch catalogs ────────────────────────────────────────────────────────

  useEffect(() => {
    apiFetch("/api/categorias")
      .then((r) => r.json())
      .then((data: unknown) => {
        // Public route returns { success: true, data: [...] }; product route returns plain array.
        const arr = Array.isArray(data)
          ? data
          : Array.isArray((data as { data?: unknown })?.data)
          ? (data as { data: Opcion[] }).data
          : []
        if (arr.length > 0) setCategorias(arr as Opcion[])
      })
      .catch(() => {})

    apiFetch("/api/clases")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setClases(data))
      .catch(() => {})

  }, [])

  // Fetch accesorios when the category taxonomy changes (tipo depends on category)
  useEffect(() => {
    if (!rule.showAccesorios || !rule.accesorioTipo) {
      setAccesorios([])
      return
    }
    apiFetch(`/api/accesorios?tipo=${rule.accesorioTipo}`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setAccesorios(data))
      .catch(() => setAccesorios([]))
  }, [rule.showAccesorios, rule.accesorioTipo])

  // Fetch telas when clase_id changes (only when the category requires tela)
  useEffect(() => {
    if (!rule.showTela || !product.clase_id) {
      setTelas([])
      return
    }
    apiFetch(`/api/telas?clase_id=${product.clase_id}`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setTelas(data))
      .catch(() => setTelas([]))
  }, [rule.showTela, product.clase_id])

  // Fetch accesorio subtypes when accesorio_id changes
  useEffect(() => {
    if (!product.accesorio_id) {
      setAccesorioTipos([])
      setAccesorioMateriales([])
      return
    }
    apiFetch(`/api/accesorio-tipos?accesorio_id=${product.accesorio_id}`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setAccesorioTipos(data))
      .catch(() => setAccesorioTipos([]))

    apiFetch(`/api/accesorio-materiales?accesorio_id=${product.accesorio_id}`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setAccesorioMateriales(data))
      .catch(() => setAccesorioMateriales([]))
  }, [product.accesorio_id])

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleCategoriaChange(val: string) {
    if (val === OTROS) {
      // Switch to custom mode — keep categoria_id as-is until user types
      updateFields({ categoria_id: null, categoria_custom: categoriaInput || null })
    } else if (val === "") {
      updateFields({ categoria_id: null, categoria_custom: null })
    } else {
      updateFields({ categoria_id: Number(val), categoria_custom: null })
    }
  }

  function handleClaseChange(val: string) {
    if (val === "" || val === "0") {
      // Do NOT set clase_id to null — it would fail backend NOT NULL constraint.
      // Instead, keep existing value. The user must pick a valid option.
      // This guards against accidental clearance.
      return
    }
    // Changing clase clears tela since telas are clase-specific
    updateFields({ clase_id: Number(val), tela_id: null, tela_custom: null })
    setTelaInput("")
  }

  function handleTelaChange(val: string) {
    if (val === NA || val === "") {
      updateFields({ tela_id: null, tela_custom: null })
    } else if (val === OTROS) {
      updateFields({ tela_id: null, tela_custom: telaInput || null })
    } else {
      updateFields({ tela_id: Number(val), tela_custom: null })
    }
  }

  function handleAccesorioChange(val: string) {
    if (val === "" ) {
      updateFields({
        accesorio_id: null, accesorio_custom: null,
        accesorio_tipo_id: null, accesorio_tipo_custom: null,
        accesorio_material_id: null, accesorio_material_custom: null,
      })
    } else if (val === OTROS) {
      updateFields({
        accesorio_id: null, accesorio_custom: accesorioInput || null,
        accesorio_tipo_id: null, accesorio_tipo_custom: null,
        accesorio_material_id: null, accesorio_material_custom: null,
      })
    } else {
      // Changing parent accesorio clears its sub-fields
      updateFields({
        accesorio_id: Number(val), accesorio_custom: null,
        accesorio_tipo_id: null, accesorio_tipo_custom: null,
        accesorio_material_id: null, accesorio_material_custom: null,
      })
    }
  }

  function handleTipoChange(val: string) {
    if (val === "" ) {
      updateFields({ accesorio_tipo_id: null, accesorio_tipo_custom: null })
    } else if (val === OTROS) {
      updateFields({ accesorio_tipo_id: null, accesorio_tipo_custom: tipoInput || null })
    } else {
      updateFields({ accesorio_tipo_id: Number(val), accesorio_tipo_custom: null })
    }
  }

  function handleMaterialChange(val: string) {
    if (val === "") {
      updateFields({ accesorio_material_id: null, accesorio_material_custom: null })
    } else if (val === OTROS) {
      updateFields({ accesorio_material_id: null, accesorio_material_custom: materialInput || null })
    } else {
      updateFields({ accesorio_material_id: Number(val), accesorio_material_custom: null })
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SectionCard
      title="Clasificación"
      description="Categoría, clase y tela — ayuda a los compradores a encontrar tu producto."
      onSave={onSave}
      sectionState={sectionState}
      completionLabel={completionLabel}
      isSaving={isSaving}
      saveLabel="Guardar"
      defaultExpanded={defaultExpanded}
      priority={priority}
    >
      {/* ── Categoría ─────────────────────────────────────────────────── */}
      <FieldSelect
        id="edit-categoria"
        label="Categoría"
        required
        value={categoriaSel}
        onChange={handleCategoriaChange}
        options={categorias}
        includeOtros
      />
      {categoriaSel === OTROS && (
        <div className="flex gap-2 -mt-2">
          <Input
            className="h-11 flex-1 rounded-xl border border-[#0f2e22]/12 bg-white/95 text-[15px] shadow-[0_1px_0_rgba(15,46,34,0.04)] focus-visible:border-[#0f2e22]/28 focus-visible:ring-[3px] focus-visible:ring-[#0f2e22]/10"
            placeholder="Nombre de categoría personalizada"
            value={categoriaInput}
            onChange={(e) => {
              setCategoriaInput(e.target.value)
              updateFields({ categoria_id: null, categoria_custom: e.target.value || null })
            }}
          />
        </div>
      )}

      {/* ── Clase ─────────────────────────────────────────────────────────
          clase_id is REQUIRED (NOT NULL in DB). We never allow it to become
          empty — if the user tries to clear it, the select resets to its
          current value via handleClaseChange's guard.
          Hidden for categories where showClase is false (e.g. accessories,
          calzado) — the existing clase_id is preserved in state and included
          in the PUT payload via the full-spread pattern.
      ──────────────────────────────────────────────────────────────────── */}
      {rule.showClase && (
        <div className="space-y-1">
          <Label htmlFor="edit-clase" className={fieldLabelClass}>
            Clase <span className="text-destructive">*</span>
          </Label>
          <select
            id="edit-clase"
            className={fieldClass}
            value={claseSel}
            onChange={(e) => handleClaseChange(e.target.value)}
          >
            {/* Placeholder only shown when no clase is selected yet */}
            {!product.clase_id && (
              <option value="" disabled>
                Seleccione una clase
              </option>
            )}
            {sortClases(clases).map((c) => (
              <option key={c.id} value={String(c.id)}>
                {formatClaseLabel(c)}
              </option>
            ))}
          </select>
          {!product.clase_id && (
            <p className="text-[12px] text-destructive">
              La clase es obligatoria. Debe seleccionar una opción.
            </p>
          )}
        </div>
      )}

      {/* ── Tela (conditional on taxonomy rule + clase_id) ────────────── */}
      {rule.showTela && product.clase_id && (
        <>
          <FieldSelect
            id="edit-tela"
            label="Tela / Material"
            value={telaSel}
            onChange={handleTelaChange}
            options={telas}
            includeOtros
            includeNA
            disabled={!product.clase_id}
            placeholder="Seleccione…"
          />
          {telaSel === OTROS && (
            <div className="flex gap-2 -mt-2">
              <Input
                className="h-11 flex-1 rounded-xl border border-[#0f2e22]/12 bg-white/95 text-[15px] shadow-[0_1px_0_rgba(15,46,34,0.04)] focus-visible:border-[#0f2e22]/28 focus-visible:ring-[3px] focus-visible:ring-[#0f2e22]/10"
                placeholder="Nombre de tela o material personalizado"
                value={telaInput}
                onChange={(e) => {
                  setTelaInput(e.target.value)
                  updateFields({ tela_id: null, tela_custom: e.target.value || null })
                }}
              />
            </div>
          )}
        </>
      )}

      {/* ── Accesorio ──────────────────────────────────────────────────── */}
      {rule.showAccesorios && (
        <>
          <hr className="border-[#0f2e22]/8" />

          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#7e8a83]">
            Accesorio (opcional)
          </p>

          <FieldSelect
            id="edit-accesorio"
            label="Tipo de accesorio"
            value={accesorioSel}
            onChange={handleAccesorioChange}
            options={accesorios}
            includeOtros
            placeholder="Ninguno"
          />
          {accesorioSel === OTROS && (
            <div className="flex gap-2 -mt-2">
              <Input
                className="h-11 flex-1 rounded-xl border border-[#0f2e22]/12 bg-white/95 text-[15px] shadow-[0_1px_0_rgba(15,46,34,0.04)] focus-visible:border-[#0f2e22]/28 focus-visible:ring-[3px] focus-visible:ring-[#0f2e22]/10"
                placeholder="Nombre de accesorio personalizado"
                value={accesorioInput}
                onChange={(e) => {
                  setAccesorioInput(e.target.value)
                  updateFields({ accesorio_id: null, accesorio_custom: e.target.value || null })
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Accesorio subtypes — only when a structured accesorio_id is selected */}
      {rule.showAccesorios && product.accesorio_id && (
        <>
          {/* Tipo only applies to normal accessories (not accesorios típicos) */}
          {rule.accesorioTipo === "normal" && (
            <>
              <FieldSelect
                id="edit-accesorio-tipo"
                label="Subtipo de accesorio"
                value={tipoSel}
                onChange={handleTipoChange}
                options={accesorioTipos}
                includeOtros
                placeholder="Ninguno"
              />
              {tipoSel === OTROS && (
                <div className="flex gap-2 -mt-2">
                  <Input
                    className="h-11 flex-1 rounded-xl border border-[#0f2e22]/12 bg-white/95 text-[15px] shadow-[0_1px_0_rgba(15,46,34,0.04)] focus-visible:border-[#0f2e22]/28 focus-visible:ring-[3px] focus-visible:ring-[#0f2e22]/10"
                    placeholder="Subtipo personalizado"
                    value={tipoInput}
                    onChange={(e) => {
                      setTipoInput(e.target.value)
                      updateFields({ accesorio_tipo_id: null, accesorio_tipo_custom: e.target.value || null })
                    }}
                  />
                </div>
              )}
            </>
          )}

          <FieldSelect
            id="edit-accesorio-material"
            label="Material del accesorio"
            value={materialSel}
            onChange={handleMaterialChange}
            options={accesorioMateriales}
            includeOtros
            placeholder="Ninguno"
          />
          {materialSel === OTROS && (
            <div className="flex gap-2 -mt-2">
              <Input
                className="h-11 flex-1 rounded-xl border border-[#0f2e22]/12 bg-white/95 text-[15px] shadow-[0_1px_0_rgba(15,46,34,0.04)] focus-visible:border-[#0f2e22]/28 focus-visible:ring-[3px] focus-visible:ring-[#0f2e22]/10"
                placeholder="Material personalizado"
                value={materialInput}
                onChange={(e) => {
                  setMaterialInput(e.target.value)
                  updateFields({ accesorio_material_id: null, accesorio_material_custom: e.target.value || null })
                }}
              />
            </div>
          )}
        </>
      )}
    </SectionCard>
  )
}
