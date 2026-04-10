// src/types/artisan.ts
//
// Tipo unificado para todo el marketplace Flowjuyu.
// Reemplaza la inconsistencia entre Product (title/price/image)
// y los tipos locales (nombre/precio/imagen_url) dispersos en componentes.
//
// REGLA: Cualquier componente que muestre un producto artesanal
// debe recibir ArtisanProduct, no tipos ad-hoc.

/* ─── Status ─────────────────────────────────────────────── */

/**
 * Estado de disponibilidad del producto.
 * Se DERIVA del campo `stock` — no es un campo independiente.
 * Ver: src/lib/product-status.ts
 */
export type ProductStatus =
  | "disponible"
  | "pieza_unica"
  | "bajo_pedido"
  | "agotado";

/**
 * Nivel de confianza del vendedor.
 * Se DERIVA de plan + plan_activo.
 * Ver: src/lib/seller-trust.ts
 */
export type SellerTrustLevel = "verificado" | "activo" | "nuevo";

/* ─── Seller ──────────────────────────────────────────────── */

export interface ArtisanSeller {
  id: number;
  nombre_comercio?: string | null;
  logo?: string | null;
  whatsapp?: string | null;
  plan?: "free" | "founder";
  plan_activo?: boolean;
  departamento?: string | null;
  municipio?: string | null;
  rating_avg?: number;
  total_reviews?: number;
}

interface LocalizedName {
  nombre: string;
  nombre_kiche?: string | null;
  nombre_kaqchikel?: string | null;
  nombre_qeqchi?: string | null;
}

/* ─── Product ─────────────────────────────────────────────── */

export interface ArtisanProduct {
  id: string;
  internal_code?: string | null;
  nombre: string;
  nombre_kiche?: string | null;
  nombre_kaqchikel?: string | null;
  nombre_qeqchi?: string | null;
  precio: number;
  imagen_url?: string | null;
  imagen_principal?: string | null;
  imagenes?: Array<{ url: string } | string>;
  descripcion?: string | null;
  descripcion_kiche?: string | null;
  descripcion_kaqchikel?: string | null;
  descripcion_qeqchi?: string | null;
  stock?: number | null;
  categoria?: (LocalizedName & { id: number }) | string | null;
  categoria_custom?: string | null;
  clase?: { id: number; nombre: string } | null;
  tela?: { id: number; nombre: string } | string | null;
  tela_custom?: string | null;
  departamento?: string | null;
  municipio?: string | null;
  departamento_custom?: string | null;
  municipio_custom?: string | null;
  rating_avg?: number;
  rating_count?: number;
  total_reviews?: number;
  trending_score?: number;
  created_at?: string | null;
  atributos?: import("@/types/product-edit").ProductAtributos | null;
  vendedor?: ArtisanSeller;
}

/* ─── Discovery ───────────────────────────────────────────── */

/**
 * Discovery / merchandising signal passed to ProductCardV2 from parent sections.
 *
 * "none"      — no badge (default)
 * "related"   — no badge, suppresses discovery badge slot
 * "trending"  — "Más vendido" badge
 * "new"       — time-aware "Llegó hoy / Llegó ayer / Nuevo" badge
 * "featured"  — "Destacado" badge
 * "low_stock" — "Últimas piezas" urgency badge (parent-driven, e.g. from API feed)
 * "sold_out"  — "Agotado" badge (parent-driven, for feeds without live stock)
 *
 * NOTE: "low_stock" and "sold_out" are presentation hints only.
 * They do NOT affect isAgotado — that is always derived from product.stock
 * via getProductState() in productCard.behavior.ts.
 */
export type DiscoverySignal =
  | "trending"
  | "new"
  | "featured"
  | "low_stock"
  | "sold_out"
  | "related"
  | "none";

/* ─── Helpers ─────────────────────────────────────────────── */

export function getPrimaryImage(product: ArtisanProduct): string {
  const first = product.imagenes?.[0];
  const fromImagenes = first
    ? typeof first === "string"
      ? first
      : first.url
    : null;
  return (
    product.imagen_principal ||
    product.imagen_url ||
    fromImagenes ||
    "/images/productos/default.jpg"
  );
}

export function getProductLocation(product: ArtisanProduct): string {
  return [
    product.municipio || product.municipio_custom,
    product.departamento || product.departamento_custom,
  ]
    .filter(Boolean)
    .join(", ");
}

export function getCategoryName(product: ArtisanProduct): string | null {
  const cat = product.categoria;
  if (!cat) return product.categoria_custom ?? null;
  if (typeof cat === "string") return cat;
  return cat.nombre ?? product.categoria_custom ?? null;
}
