// src/types/product-edit.ts
//
// Exact shape of what GET /api/productos/:id/edit returns inside { product: ... }.
// Field names come from the SQL SELECT aliases in getProductForEdit — NOT the
// Sequelize model (which is incomplete). Never guess fields; every field here
// was verified against the raw SQL query in product.controller.ts.

export interface ProductGalleryImage {
  id: number
  url: string
}

// ── Optional product attributes stored in JSONB ───────────────────────────────
// Mirror of the backend ALLOWED_ATRIBUTO_KEYS set.

export interface ProductMedidas {
  // Stored as positive numbers in the DB (backend parses from form string)
  largo: number | null
  ancho: number | null
  alto: number | null
  // Unit stays a string (e.g. "cm", "pulg")
  unidad: string | null
}

export interface ProductAtributos {
  medidas?: ProductMedidas
  material_principal?: string
  tecnica?: string
  cuidados?: string
}

export interface ProductEditData {
  // ── Identity (read-only, not sent in PUT UPDATE SET) ─────────────────────
  id: string
  created_at: string

  // ── Core fields (PUT requires: nombre, precio, stock) ────────────────────
  nombre: string
  descripcion: string | null
  precio: number
  stock: number

  // ── Status — MUST always be present in PUT payload.
  //    If omitted the backend coercion makes it false → silent deactivation.
  activo: boolean

  // ── Category — one of (categoria_id) or (categoria_custom) must be set ──
  categoria_id: number | null
  categoria_custom: string | null

  // ── Textile taxonomy ─────────────────────────────────────────────────────
  // clase_id is NOT NULL in the DB. The backend 400s on create if missing
  // and 500s on update if the SET clause receives NULL.
  clase_id: number | null // null only transiently during initial load
  tela_id: number | null
  tela_custom: string | null

  // ── Location (fields exist in DB but NOT in the Sequelize model) ─────────
  departamento: string | null
  municipio: string | null
  departamento_custom: string | null
  municipio_custom: string | null

  // ── Accessories ───────────────────────────────────────────────────────────
  accesorio_id: number | null
  accesorio_custom: string | null
  accesorio_tipo_id: number | null
  accesorio_tipo_custom: string | null
  accesorio_material_id: number | null
  accesorio_material_custom: string | null

  // ── Images ───────────────────────────────────────────────────────────────
  // imagen_principal is aliased from imagen_url in the SELECT query.
  // The PUT UPDATE statement does NOT include imagen_url in its SET clause
  // (it's only updated when new files are uploaded). Spreading this into the
  // PUT body is harmless — named replacements ignore unknown keys.
  imagen_principal: string | null

  // Gallery from producto_imagenes table. Never sent in PUT body (skipped in
  // FormData construction). Managed via dedicated DELETE + PATCH endpoints.
  imagenes: ProductGalleryImage[]

  // ── Optional product attributes (JSONB) ──────────────────────────────────
  // Flexible key-value store for non-taxonomic product details.
  // Allowed keys: medidas, material_principal, tecnica, cuidados.
  // Sent in every PUT payload; backend validates and sanitises.
  atributos: ProductAtributos

  // ── Backend-managed identifiers (read-only) ───────────────────────────────
  // Set by the backend on product creation. Returned by GET /edit but absent
  // from the Sequelize model. internal_code stays read-only; seller_sku can be
  // seller-managed through the editor and is submitted only in manual mode.
  internal_code?: string | null
  seller_sku?: string | null
  useCustomSku: boolean

  // ── Index signature ───────────────────────────────────────────────────────
  // Preserves any fields the backend adds to GET /edit in the future without
  // requiring a frontend change. Spread { ...product } into every PUT payload.
  [key: string]: unknown
}

// ── Section save state ────────────────────────────────────────────────────────

export type SectionStatus = "idle" | "saving" | "success" | "error"

export interface SectionSaveState {
  status: SectionStatus
  error: string | null
}

// ── Catalog types (fetched from taxonomy endpoints) ──────────────────────────

export interface Opcion {
  id: number
  nombre: string
}

export interface ClaseOpcion extends Opcion {
  alias?: string
}

// ── Shared props for PUT-backed edit sections ─────────────────────────────────
//
// All sections that save via the full PUT pattern share this prop shape.
// SectionImagenes does NOT use this — it has dedicated image endpoints.

export interface CommonSectionProps {
  product: ProductEditData
  updateFields: (partial: Partial<ProductEditData>) => void
  onSave: () => void
  sectionState: SectionSaveState
  completionLabel?: string
  isSaving: boolean
  defaultExpanded?: boolean
  priority?: "high" | "low"
}
