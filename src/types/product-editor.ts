import type { ProductEditData, SectionSaveState } from "@/types/product-edit"

export type ProductEditorMode = "create" | "edit"
export type ProductImageMode = "staged" | "persisted"

export type StagedProductImage = {
  localId: string
  file: File
  previewUrl: string
  isPrincipal: boolean
}

export type CreateProductResult = {
  id?: string
  internal_code?: string
}

export interface ProductEditorController {
  mode: ProductEditorMode
  product: ProductEditData | null
  loadStatus: "idle" | "loading" | "loaded" | "error"
  loadError: string | null
  isSaving: boolean
  savingSection: string | null
  sectionStates: Record<string, SectionSaveState>
  getSectionState: (id: string) => SectionSaveState
  updateFields: (partial: Partial<ProductEditData>) => void
  saveSection: (sectionId: string) => Promise<void>
  imageMode: ProductImageMode
  stagedImages: StagedProductImage[]
  uploadImages: (files: File[]) => Promise<void>
  deleteImage: (imageId: number | string) => Promise<void>
  setPrincipalImage: (imageUrlOrId: string) => Promise<void>
  reorderImage?: (fromIndex: number, toIndex: number) => void
}

export interface ProductCreateController extends ProductEditorController {
  mode: "create"
  saveDraft: (sectionId?: string) => Promise<void>
  createProduct: (options?: { publish?: boolean }) => Promise<CreateProductResult | null>
  resetDraft: () => void
}

export interface ProductEditController extends ProductEditorController {
  mode: "edit"
  reload: () => Promise<void>
}
