// src/hooks/useProductCreate.ts
//
// Create-mode controller for the unified product editor.
// Keeps product data in a ProductEditData-compatible draft and stages images
// locally until the final POST creates the backend product.

"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { apiFetch } from "@/lib/api"
import { compressImages } from "@/lib/imageCompression"
import type { ProductEditData, SectionSaveState } from "@/types/product-edit"
import type {
  CreateProductResult,
  ProductCreateController,
  StagedProductImage,
} from "@/types/product-editor"

const DRAFT_KEY = "flowjuyu_product_draft_v2"
const MAX_IMAGES = 5
const IDLE_SECTION: SectionSaveState = { status: "idle", error: null }

const EMPTY_DRAFT: ProductEditData = {
  id: "__draft__",
  created_at: "",
  nombre: "",
  descripcion: null,
  precio: 0,
  stock: 0,
  activo: false,
  categoria_id: null,
  categoria_custom: null,
  clase_id: null,
  tela_id: null,
  tela_custom: null,
  departamento: null,
  municipio: null,
  departamento_custom: null,
  municipio_custom: null,
  accesorio_id: null,
  accesorio_custom: null,
  accesorio_tipo_id: null,
  accesorio_tipo_custom: null,
  accesorio_material_id: null,
  accesorio_material_custom: null,
  imagen_principal: null,
  imagenes: [],
  internal_code: null,
  seller_sku: null,
  useCustomSku: false,
  atributos: {},
}

function getSkuValidationError(product: ProductEditData): string | null {
  const sku = product.useCustomSku ? (product.seller_sku?.trim() ?? "") : ""
  if (!sku) return null
  if (sku.length > 100) return "El SKU no puede tener más de 100 caracteres."
  if (!/^[A-Za-z0-9_-]+$/.test(sku)) {
    return "El SKU solo puede usar letras, números, guion y guion bajo."
  }
  return null
}

function validateDraft(product: ProductEditData): string | null {
  if (!product.nombre?.trim()) return "El nombre del producto es obligatorio."
  if (!product.clase_id) return "La clasificación (Clase) es obligatoria."
  if (
    (product.categoria_id == null || product.categoria_id === 0) &&
    !product.categoria_custom?.trim()
  ) {
    return "Debe seleccionar una categoría o ingresar una personalizada."
  }
  if (!Number.isFinite(Number(product.precio)) || Number(product.precio) <= 0) {
    return "El precio debe ser mayor a 0."
  }
  if (!Number.isInteger(Number(product.stock)) || Number(product.stock) < 0) {
    return "El stock debe ser un número entero igual o mayor a 0."
  }
  const skuError = getSkuValidationError(product)
  if (skuError) return skuError
  return null
}

function appendNullable(form: FormData, key: string, value: unknown) {
  if (value === null || value === undefined || value === "") return
  form.set(key, String(value))
}

function buildCreateFormData(
  product: ProductEditData,
  files: File[],
  publish: boolean,
) {
  const form = new FormData()

  form.set("nombre", product.nombre)
  form.set("descripcion", product.descripcion ?? "")
  form.set("precio", String(product.precio))
  form.set("stock", String(product.stock))
  form.set("activo", publish ? "true" : "false")

  const manualSku = product.useCustomSku
    ? (product.seller_sku?.trim() ?? "")
    : ""
  appendNullable(form, "seller_sku", manualSku)
  appendNullable(form, "categoria_id", product.categoria_id)
  appendNullable(form, "categoria_custom", product.categoria_custom)
  appendNullable(form, "clase_id", product.clase_id)
  appendNullable(form, "tela_id", product.tela_id)
  appendNullable(form, "tela_custom", product.tela_custom)
  form.set("departamento", product.departamento ?? "")
  form.set("municipio", product.municipio ?? "")
  appendNullable(form, "departamento_custom", product.departamento_custom)
  appendNullable(form, "municipio_custom", product.municipio_custom)
  appendNullable(form, "accesorio_id", product.accesorio_id)
  appendNullable(form, "accesorio_custom", product.accesorio_custom)
  appendNullable(form, "accesorio_tipo_id", product.accesorio_tipo_id)
  appendNullable(form, "accesorio_tipo_custom", product.accesorio_tipo_custom)
  appendNullable(form, "accesorio_material_id", product.accesorio_material_id)
  appendNullable(
    form,
    "accesorio_material_custom",
    product.accesorio_material_custom,
  )

  // atributos — JSON-stringify so multipart transport preserves the object shape
  if (product.atributos && Object.keys(product.atributos).length > 0) {
    form.set("atributos", JSON.stringify(product.atributos))
  }

  files.slice(0, MAX_IMAGES).forEach((file) => form.append("imagenes", file))

  return form
}

function loadStoredDraft() {
  if (typeof window === "undefined") return EMPTY_DRAFT
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return EMPTY_DRAFT
    const parsed = JSON.parse(raw) as Partial<ProductEditData>
    return {
      ...EMPTY_DRAFT,
      ...parsed,
      id: "__draft__",
      imagenes: [],
      useCustomSku: Boolean(parsed.useCustomSku ?? parsed.seller_sku),
    }
  } catch {
    return EMPTY_DRAFT
  }
}

function isEmptyDraft(product: ProductEditData) {
  return (
    !product.nombre &&
    !product.descripcion &&
    Number(product.precio) === 0 &&
    Number(product.stock) === 0 &&
    !product.categoria_id &&
    !product.categoria_custom &&
    !product.clase_id &&
    !product.tela_id &&
    !product.tela_custom &&
    !product.departamento &&
    !product.municipio &&
    !product.seller_sku &&
    !product.useCustomSku
  )
}

export function useProductCreate(): ProductCreateController {
  const [draft, setDraft] = useState<ProductEditData>(() => loadStoredDraft())
  const [stagedImages, setStagedImages] = useState<StagedProductImage[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [sectionStates, setSectionStates] = useState<
    Record<string, SectionSaveState>
  >({})

  const draftRef = useRef(draft)
  const stagedImagesRef = useRef(stagedImages)

  useEffect(() => {
    draftRef.current = draft
  }, [draft])
  useEffect(() => {
    stagedImagesRef.current = stagedImages
  }, [stagedImages])

  useEffect(() => {
    return () => {
      stagedImagesRef.current.forEach((image) =>
        URL.revokeObjectURL(image.previewUrl),
      )
    }
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        if (isEmptyDraft(draft)) {
          localStorage.removeItem(DRAFT_KEY)
        } else {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
        }
      } catch {
        /* local draft persistence is best-effort */
      }
    }, 800)

    return () => window.clearTimeout(timeout)
  }, [draft])

  const scheduleReset = useCallback((sectionId: string) => {
    window.setTimeout(() => {
      setSectionStates((prev) => ({ ...prev, [sectionId]: IDLE_SECTION }))
    }, 2500)
  }, [])

  const updateFields = useCallback((partial: Partial<ProductEditData>) => {
    setDraft((prev) => ({ ...prev, ...partial }))
  }, [])

  const saveDraft = useCallback(
    async (sectionId = "draft") => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftRef.current))
        setSectionStates((prev) => ({
          ...prev,
          [sectionId]: { status: "success", error: null },
        }))
        scheduleReset(sectionId)
      } catch {
        setSectionStates((prev) => ({
          ...prev,
          [sectionId]: {
            status: "error",
            error: "No se pudo guardar el borrador local.",
          },
        }))
      }
    },
    [scheduleReset],
  )

  const uploadImages = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return
      setIsSaving(true)
      setSectionStates((prev) => ({
        ...prev,
        imagenes: { status: "saving", error: null },
      }))

      try {
        const remainingSlots = MAX_IMAGES - stagedImagesRef.current.length
        const safeFiles = files.slice(0, Math.max(remainingSlots, 0))
        const compressed = await compressImages(safeFiles)
        const nextImages = compressed.map((file, index) => {
          const isFirstImage =
            stagedImagesRef.current.length === 0 && index === 0
          return {
            localId: `${Date.now()}-${index}-${file.name}`,
            file,
            previewUrl: URL.createObjectURL(file),
            isPrincipal: isFirstImage,
          }
        })

        setStagedImages((prev) => [...prev, ...nextImages])
        setSectionStates((prev) => ({
          ...prev,
          imagenes: { status: "success", error: null },
        }))
        scheduleReset("imagenes")
      } catch (err) {
        setSectionStates((prev) => ({
          ...prev,
          imagenes: {
            status: "error",
            error:
              err instanceof Error
                ? err.message
                : "Error al preparar imágenes.",
          },
        }))
      } finally {
        setIsSaving(false)
      }
    },
    [scheduleReset],
  )

  const deleteImage = useCallback(async (imageId: number | string) => {
    const localId = String(imageId)
    setStagedImages((prev) => {
      const removed = prev.find((img) => img.localId === localId)
      if (removed) URL.revokeObjectURL(removed.previewUrl)
      const next = prev.filter((img) => img.localId !== localId)
      if (removed?.isPrincipal && next[0]) {
        return next.map((img, index) => ({ ...img, isPrincipal: index === 0 }))
      }
      return next
    })
  }, [])

  const setPrincipalImage = useCallback(async (imageId: string) => {
    setStagedImages((prev) =>
      prev.map((img) => ({ ...img, isPrincipal: img.localId === imageId })),
    )
  }, [])

  const reorderImage = useCallback((fromIndex: number, toIndex: number) => {
    setStagedImages((prev) => {
      if (fromIndex === toIndex) return prev
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex >= prev.length
      ) {
        return prev
      }
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }, [])

  const createProduct = useCallback(async (options?: { publish?: boolean }) => {
    const product = draftRef.current
    const publish = Boolean(options?.publish)
    const validationError = validateDraft(product)

    if (validationError) {
      setSectionStates((prev) => ({
        ...prev,
        create: { status: "error", error: validationError },
      }))
      return null
    }

    setIsSaving(true)
    setSectionStates((prev) => ({
      ...prev,
      create: { status: "saving", error: null },
    }))

    try {
      const orderedImages = [...stagedImagesRef.current].sort((a, b) =>
        a.isPrincipal === b.isPrincipal ? 0 : a.isPrincipal ? -1 : 1,
      )
      const files = orderedImages.map((image) => image.file)
      const form = buildCreateFormData(product, files, publish)
      const res = await apiFetch("/api/productos", {
        method: "POST",
        body: form,
      })
      const body = (await res
        .json()
        .catch(() => ({}))) as CreateProductResult & { message?: string }

      if (!res.ok) {
        throw new Error(body.message ?? `Error ${res.status} al crear producto`)
      }

      localStorage.removeItem(DRAFT_KEY)
      stagedImagesRef.current.forEach((image) =>
        URL.revokeObjectURL(image.previewUrl),
      )
      setStagedImages([])
      setDraft(EMPTY_DRAFT)
      setSectionStates((prev) => ({
        ...prev,
        create: { status: "success", error: null },
      }))
      return body
    } catch (err) {
      setSectionStates((prev) => ({
        ...prev,
        create: {
          status: "error",
          error:
            err instanceof Error ? err.message : "Error al crear producto.",
        },
      }))
      return null
    } finally {
      setIsSaving(false)
    }
  }, [])

  const resetDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY)
    stagedImagesRef.current.forEach((image) =>
      URL.revokeObjectURL(image.previewUrl),
    )
    setStagedImages([])
    setDraft(EMPTY_DRAFT)
    setSectionStates({})
  }, [])

  const product = useMemo<ProductEditData>(() => {
    const principal =
      stagedImages.find((image) => image.isPrincipal) ?? stagedImages[0]
    return {
      ...draft,
      imagen_principal: principal?.previewUrl ?? null,
      imagenes: stagedImages.map((image, index) => ({
        id: index + 1,
        url: image.previewUrl,
      })),
    }
  }, [draft, stagedImages])

  const getSectionState = useCallback(
    (id: string): SectionSaveState => sectionStates[id] ?? IDLE_SECTION,
    [sectionStates],
  )

  return {
    mode: "create",
    product,
    loadStatus: "loaded",
    loadError: null,
    isSaving,
    savingSection: null,
    sectionStates,
    getSectionState,
    updateFields,
    saveSection: saveDraft,
    saveDraft,
    createProduct,
    imageMode: "staged",
    stagedImages,
    uploadImages,
    deleteImage,
    setPrincipalImage,
    reorderImage,
    resetDraft,
  }
}
