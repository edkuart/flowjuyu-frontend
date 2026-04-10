// src/hooks/useProductEdit.ts
//
// Core state machine for the section-based product edit experience.
//
// SAFETY CONTRACT (never violate):
//   1. One source of truth — all product fields live in state.data only.
//   2. productRef is synced after every state.data change so async callbacks
//      always read the latest snapshot, never a stale closure value.
//   3. Every PUT sends { ...productRef.current } — the FULL object.
//      Individual sections only call updateFields(); they NEVER construct
//      their own payload.
//   4. Global save lock (isSavingRef) — only one PUT/multipart in flight at a
//      time. Prevents concurrent writes that could race and overwrite each other.
//   5. On save error — state.data is NEVER touched. The user retries with
//      their changes intact.
//   6. clase_id and activo are validated before every PUT. Both cause silent
//      or hard backend failures if missing.
//   7. All scheduled SAVE_RESET timeouts are tracked and cancelled on unmount
//      to prevent stale dispatches after navigation.
//   8. Silent reload (load(true)) does NOT dispatch LOAD_START, so the page
//      never flashes the loading skeleton during a post-upload refresh.
//      It also calls invalidateCache() first to bypass the 60 s GET cache.

"use client"

import { useReducer, useRef, useCallback, useEffect } from "react"
import { apiFetch, invalidateCache } from "@/lib/api"
import { compressImages } from "@/lib/imageCompression"
import type { ProductEditData, SectionSaveState } from "@/types/product-edit"
import type { ProductEditController } from "@/types/product-editor"

// ─── State ────────────────────────────────────────────────────────────────────

interface ProductEditState {
  data: ProductEditData | null
  loadStatus: "idle" | "loading" | "loaded" | "error"
  loadError: string | null
  // Global PUT lock. True while any section is sending a request.
  isSaving: boolean
  savingSection: string | null
  // Per-section save feedback (for UI only — not part of product data).
  sectionStates: Record<string, SectionSaveState>
}

const INITIAL_STATE: ProductEditState = {
  data: null,
  loadStatus: "idle",
  loadError: null,
  isSaving: false,
  savingSection: null,
  sectionStates: {},
}

const IDLE_SECTION: SectionSaveState = { status: "idle", error: null }

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "LOAD_START" }
  | { type: "LOAD_SUCCESS"; payload: ProductEditData }
  | { type: "LOAD_ERROR"; error: string }
  | { type: "UPDATE_FIELDS"; payload: Partial<ProductEditData> }
  | { type: "SAVE_START"; section: string }
  | { type: "SAVE_SUCCESS"; section: string }
  | { type: "SAVE_ERROR"; section: string; error: string }
  | { type: "SAVE_RESET"; section: string }
  | { type: "IMAGE_REMOVED"; imageId: number }
  | { type: "PRINCIPAL_CHANGED"; url: string }

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: ProductEditState, action: Action): ProductEditState {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, loadStatus: "loading", loadError: null }

    case "LOAD_SUCCESS":
      return {
        ...state,
        loadStatus: "loaded",
        data: action.payload,
        loadError: null,
        // Reset all section states on fresh load
        sectionStates: {},
      }

    case "LOAD_ERROR":
      return { ...state, loadStatus: "error", loadError: action.error }

    case "UPDATE_FIELDS":
      if (!state.data) return state
      return {
        ...state,
        data: { ...state.data, ...action.payload },
      }

    case "SAVE_START":
      return {
        ...state,
        isSaving: true,
        savingSection: action.section,
        sectionStates: {
          ...state.sectionStates,
          [action.section]: { status: "saving", error: null },
        },
      }

    case "SAVE_SUCCESS":
      return {
        ...state,
        isSaving: false,
        savingSection: null,
        sectionStates: {
          ...state.sectionStates,
          [action.section]: { status: "success", error: null },
        },
      }

    case "SAVE_ERROR":
      // CRITICAL: only sectionStates changes. data is untouched.
      // The user's unsaved edits survive the error and can be retried.
      return {
        ...state,
        isSaving: false,
        savingSection: null,
        sectionStates: {
          ...state.sectionStates,
          [action.section]: { status: "error", error: action.error },
        },
      }

    case "SAVE_RESET":
      return {
        ...state,
        sectionStates: {
          ...state.sectionStates,
          [action.section]: IDLE_SECTION,
        },
      }

    // Image actions are immediate (dedicated endpoints) — no PUT involved.
    // They update only the imagenes array / imagen_principal in state.

    case "IMAGE_REMOVED": {
      if (!state.data) return state
      const removed = state.data.imagenes.find(
        (img) => img.id === action.imageId,
      )
      // If the deleted image was the principal, clear imagen_principal.
      // The backend removes the DB record; imagen_principal is ignored by the
      // PUT SET clause, so this is a UI consistency fix only.
      const newPrincipal =
        removed?.url === state.data.imagen_principal
          ? null
          : state.data.imagen_principal
      return {
        ...state,
        data: {
          ...state.data,
          imagenes: state.data.imagenes.filter(
            (img) => img.id !== action.imageId,
          ),
          imagen_principal: newPrincipal,
        },
      }
    }

    case "PRINCIPAL_CHANGED":
      if (!state.data) return state
      return {
        ...state,
        data: { ...state.data, imagen_principal: action.url },
      }

    default:
      return state
  }
}

// ─── Normalization ────────────────────────────────────────────────────────────
//
// Sanitizes the raw GET /edit response into a predictable local state shape.
// Key rules:
//   - Unknown fields are preserved via spread (index signature passthrough).
//   - activo coerced to boolean (DB drivers may return 0/1).
//   - precio/stock coerced to numbers.
//   - Empty strings normalized to null for all nullable text fields.
//   - imagenes always an array.
//
// This function is the only place where we cast to ProductEditData.
// All other code in the hook can rely on the normalized values being correct.

function normalizeProductEditData(
  raw: Record<string, unknown>,
): ProductEditData {
  return {
    // Spread first — preserves all unknown/hidden fields via index signature
    ...raw,
    // Override with normalized typed values
    activo: Boolean(raw.activo),
    precio: Number(raw.precio) || 0,
    stock: Math.max(0, Math.trunc(Number(raw.stock) || 0)),
    imagenes: Array.isArray(raw.imagenes) ? raw.imagenes : [],
    // Normalize empty strings → null for every nullable text field
    descripcion: raw.descripcion || null,
    categoria_custom: raw.categoria_custom || null,
    tela_custom: raw.tela_custom || null,
    departamento: raw.departamento || null,
    municipio: raw.municipio || null,
    departamento_custom: raw.departamento_custom || null,
    municipio_custom: raw.municipio_custom || null,
    accesorio_custom: raw.accesorio_custom || null,
    accesorio_tipo_custom: raw.accesorio_tipo_custom || null,
    accesorio_material_custom: raw.accesorio_material_custom || null,
    seller_sku: raw.seller_sku || null,
    useCustomSku: Boolean(raw.seller_sku),
    // Ensure atributos is always a plain object, never null/undefined
    atributos:
      raw.atributos && typeof raw.atributos === "object" && !Array.isArray(raw.atributos)
        ? (raw.atributos as ProductEditData["atributos"])
        : {},
  } as ProductEditData
}

// ─── Validation ───────────────────────────────────────────────────────────────

function getSkuValidationError(product: ProductEditData): string | null {
  const sku = product.useCustomSku ? (product.seller_sku?.trim() ?? "") : ""
  if (!sku) return null
  if (sku.length > 100) return "El SKU no puede tener más de 100 caracteres."
  if (!/^[A-Za-z0-9_-]+$/.test(sku)) {
    return "El SKU solo puede usar letras, números, guion y guion bajo."
  }
  return null
}

function validateProduct(product: ProductEditData): string | null {
  // clase_id: NOT NULL in DB. Missing → backend 500 on UPDATE.
  if (!product.clase_id) {
    return "La clasificación (Clase) es obligatoria antes de guardar."
  }
  if (!product.nombre?.trim()) {
    return "El nombre del producto es obligatorio."
  }
  const precio = Number(product.precio)
  if (!Number.isFinite(precio) || precio <= 0) {
    return "El precio debe ser mayor a 0."
  }
  const stock = Number(product.stock)
  if (!Number.isInteger(stock) || stock < 0) {
    return "El stock debe ser un número entero igual o mayor a 0."
  }
  if (
    (product.categoria_id == null || product.categoria_id === 0) &&
    !product.categoria_custom?.trim()
  ) {
    return "Debe seleccionar una categoría o ingresar una personalizada."
  }
  const skuError = getSkuValidationError(product)
  if (skuError) return skuError
  return null
}

// ─── FormData builder (for image upload PUT) ──────────────────────────────────
//
// The PUT endpoint uses multer (multipart/form-data) when files are attached.
// All product fields are appended as strings. null/undefined values are skipped
// — the backend controller maps missing fields to null via its own logic.
//
// Skipped keys:
//   "imagenes"         — multer upload field name; the existing gallery array
//   "imagen_principal" — read-only from GET; not in PUT SET clause
//   "created_at"/"id"  — not in UPDATE SET

const FORMDATA_SKIP = new Set([
  "imagenes",
  "imagen_principal",
  "created_at",
  "id",
  "seller_sku",
  "useCustomSku",
])

function buildFormData(product: ProductEditData, files: File[]): FormData {
  const form = new FormData()

  for (const [key, value] of Object.entries(product)) {
    if (FORMDATA_SKIP.has(key)) continue
    if (value === null || value === undefined) continue
    // Objects (e.g. atributos JSONB) must be JSON-stringified for multipart transport
    if (typeof value === "object" && !Array.isArray(value)) {
      form.append(key, JSON.stringify(value))
    } else {
      form.append(key, String(value))
    }
  }

  const manualSku = product.useCustomSku
    ? (product.seller_sku?.trim() ?? "")
    : ""
  if (manualSku) {
    form.append("seller_sku", manualSku)
  }

  // Multer field name must match .array("imagenes", 5) in the route
  const safeFiles = files.slice(0, 5)
  for (const file of safeFiles) {
    form.append("imagenes", file)
  }

  return form
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseProductEditReturn extends ProductEditController {
  product: ProductEditData | null
  saveSection: (sectionId: string) => Promise<void>
  uploadImages: (files: File[]) => Promise<void>
  deleteImage: (imageId: number | string) => Promise<void>
  setPrincipalImage: (imageUrl: string) => Promise<void>
}

export function useProductEdit(productId: string): UseProductEditReturn {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  // ── Refs for stable async reads ───────────────────────────────────────────
  //
  // productRef: always holds the latest state.data so async callbacks never
  //   read a stale closure snapshot (see safety contract point 2).
  //
  // isSavingRef: mirrors state.isSaving so callbacks with [] deps can check
  //   the current lock without needing isSaving in their dependency arrays.
  //   This keeps deleteImage and setPrincipalImage callbacks stable.

  const productRef = useRef<ProductEditData | null>(null)
  const isSavingRef = useRef(false)

  useEffect(() => {
    productRef.current = state.data
  }, [state.data])
  useEffect(() => {
    isSavingRef.current = state.isSaving
  }, [state.isSaving])

  // ── Timeout cleanup ───────────────────────────────────────────────────────
  //
  // Tracks all pending SAVE_RESET timeouts and cancels them if the component
  // unmounts before they fire (e.g., user navigates away within 3 seconds).

  const pendingTimeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(
    new Set(),
  )

  useEffect(() => {
    return () => {
      for (const id of pendingTimeoutsRef.current) clearTimeout(id)
    }
  }, [])

  // Schedules an auto-clear of a section's success feedback after 3 s.
  const scheduleReset = useCallback((section: string) => {
    const id = setTimeout(() => {
      pendingTimeoutsRef.current.delete(id)
      dispatch({ type: "SAVE_RESET", section })
    }, 3000)
    pendingTimeoutsRef.current.add(id)
  }, []) // dispatch and pendingTimeoutsRef are both stable references

  // ── Load ─────────────────────────────────────────────────────────────────
  //
  // silent=true: skips LOAD_START so the page doesn't flash the loading
  //   skeleton during a post-upload refresh. Also calls invalidateCache() to
  //   bypass the apiFetch in-memory GET cache (60 s TTL) so newly uploaded
  //   images actually appear.
  //
  // silent=false (default): initial load — shows skeleton while fetching.

  const load = useCallback(
    async (silent = false) => {
      if (!silent) dispatch({ type: "LOAD_START" })

      // Always bypass the GET cache before loading/reloading product edit data.
      // Without this, a 60 s cache hit would return stale image lists after upload.
      invalidateCache(`/api/productos/${productId}`)

      try {
        const res = await apiFetch(`/api/productos/${productId}/edit`)
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            message?: string
          }
          throw new Error(
            body.message ?? `Error ${res.status} al cargar producto`,
          )
        }
        const json = (await res.json()) as { product: Record<string, unknown> }
        const normalized = normalizeProductEditData(json.product)
        dispatch({ type: "LOAD_SUCCESS", payload: normalized })
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Error al cargar producto"
        // On silent reload failure, don't overwrite error state if data is loaded.
        // The editor stays functional; the user can retry image upload.
        if (!silent) dispatch({ type: "LOAD_ERROR", error: msg })
      }
    },
    [productId],
  )

  useEffect(() => {
    load()
  }, [load])

  // ── updateFields ──────────────────────────────────────────────────────────
  // Sections call this to modify their slice. The full product is preserved.

  const updateFields = useCallback((partial: Partial<ProductEditData>) => {
    dispatch({ type: "UPDATE_FIELDS", payload: partial })
  }, [])

  // ── saveSection (FULL PUT) ────────────────────────────────────────────────

  const saveSection = useCallback(
    async (sectionId: string) => {
      const product = productRef.current
      if (!product) return
      if (isSavingRef.current) return

      const validationError = validateProduct(product)
      if (validationError) {
        dispatch({
          type: "SAVE_ERROR",
          section: sectionId,
          error: validationError,
        })
        return
      }

      dispatch({ type: "SAVE_START", section: sectionId })

      try {
        // FULL payload — spread the entire product. Unknown fields from the
        // index signature pass through harmlessly. imagen_principal, imagenes,
        // id, created_at are ignored by the backend's named replacement system.
        const { useCustomSku, ...payload } = product
        payload.seller_sku = useCustomSku
          ? product.seller_sku?.trim() || null
          : null

        const res = await apiFetch(`/api/productos/${product.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            message?: string
          }
          throw new Error(body.message ?? `Error ${res.status} al guardar`)
        }

        dispatch({ type: "SAVE_SUCCESS", section: sectionId })
        scheduleReset(sectionId)
      } catch (err: unknown) {
        // state.data is NOT reset — the user's edits survive and can be retried
        const msg =
          err instanceof Error
            ? err.message
            : "Error al guardar. Intenta de nuevo."
        dispatch({ type: "SAVE_ERROR", section: sectionId, error: msg })
      }
    },
    [scheduleReset],
    // isSaving is read from isSavingRef (stable) — no need to list it as dep.
    // scheduleReset has [] deps and is stable after first render.
  )

  // ── uploadImages (PUT multipart) ──────────────────────────────────────────
  // After upload, calls load(true) — silent reload — to get server-assigned
  // image IDs and the updated imagen_principal without flashing the skeleton.

  const uploadImages = useCallback(
    async (files: File[]) => {
      const product = productRef.current
      if (!product || files.length === 0) return
      if (isSavingRef.current) return

      const validationError = validateProduct(product)
      if (validationError) {
        dispatch({
          type: "SAVE_ERROR",
          section: "imagenes",
          error: validationError,
        })
        return
      }

      dispatch({ type: "SAVE_START", section: "imagenes" })

      try {
        const compressedFiles = await compressImages(files)
        const form = buildFormData(product, compressedFiles)

        const res = await apiFetch(`/api/productos/${product.id}`, {
          method: "PUT",
          body: form,
        })

        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as {
            message?: string
          }
          throw new Error(
            body.message ?? `Error ${res.status} al subir imágenes`,
          )
        }

        // Silent reload — syncs imagenes + imagen_principal from server
        // without triggering LOAD_START (no skeleton flash).
        await load(true)

        dispatch({ type: "SAVE_SUCCESS", section: "imagenes" })
        scheduleReset("imagenes")
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Error al subir imágenes."
        dispatch({ type: "SAVE_ERROR", section: "imagenes", error: msg })
      }
    },
    [load, scheduleReset],
  )

  // ── deleteImage ───────────────────────────────────────────────────────────
  // Waits for server confirmation before updating local state.
  // If the deleted image was the principal, the reducer also clears
  // imagen_principal from state (see IMAGE_REMOVED case above).

  const deleteImage = useCallback(async (imageId: number | string) => {
    const product = productRef.current
    if (!product) return
    if (isSavingRef.current) return
    const persistedImageId = Number(imageId)
    if (!Number.isFinite(persistedImageId)) return

    const res = await apiFetch(
      `/api/productos/${product.id}/imagenes/${persistedImageId}`,
      { method: "DELETE" },
    )
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string }
      throw new Error(body.message ?? "Error al eliminar imagen")
    }
    dispatch({ type: "IMAGE_REMOVED", imageId: persistedImageId })
  }, [])

  // ── setPrincipalImage ─────────────────────────────────────────────────────

  const setPrincipalImage = useCallback(async (imageUrl: string) => {
    const product = productRef.current
    if (!product) return
    if (isSavingRef.current) return

    const res = await apiFetch(`/api/productos/${product.id}/set-principal`, {
      method: "PATCH",
      body: JSON.stringify({ imagen_url: imageUrl }),
    })
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string }
      throw new Error(body.message ?? "Error al cambiar imagen principal")
    }
    dispatch({ type: "PRINCIPAL_CHANGED", url: imageUrl })
  }, [])

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getSectionState = useCallback(
    (id: string): SectionSaveState => state.sectionStates[id] ?? IDLE_SECTION,
    [state.sectionStates],
  )

  return {
    mode: "edit",
    product: state.data,
    loadStatus: state.loadStatus,
    loadError: state.loadError,
    isSaving: state.isSaving,
    savingSection: state.savingSection,
    sectionStates: state.sectionStates,
    getSectionState,
    updateFields,
    saveSection,
    imageMode: "persisted",
    stagedImages: [],
    uploadImages,
    deleteImage,
    setPrincipalImage,
    reload: load,
  }
}
