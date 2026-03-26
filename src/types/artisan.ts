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
  | "disponible"   // stock > 1 o null (artesano confirma)
  | "pieza_unica"  // stock === 1 — la última pieza disponible
  | "bajo_pedido"  // stock === 0 pero acepta encargos (flag manual)
  | "agotado";     // stock === 0 sin encargos

/**
 * Nivel de confianza del vendedor.
 * Se DERIVA de plan + plan_activo.
 * Ver: src/lib/seller-trust.ts
 */
export type SellerTrustLevel =
  | "verificado"  // plan="founder" && plan_activo=true
  | "activo"      // plan_activo=true (cualquier plan)
  | "nuevo";      // recién registrado o sin actividad

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

/* ─── Product ─────────────────────────────────────────────── */

export interface ArtisanProduct {
  id: string;
  nombre: string;
  precio: number;

  // Imágenes — normalizar en el punto de entrada (page.tsx)
  imagen_url?: string | null;
  imagen_principal?: string | null;
  imagenes?: Array<{ url: string } | string>;

  // Contenido
  descripcion?: string | null;

  // Disponibilidad — fuente de verdad para status
  stock?: number | null;

  // Clasificación
  categoria?: { id: number; nombre: string } | string | null;
  categoria_custom?: string | null;
  clase?: { id: number; nombre: string } | null;
  tela?: { id: number; nombre: string } | string | null;
  tela_custom?: string | null;

  // Origen
  departamento?: string | null;
  municipio?: string | null;
  departamento_custom?: string | null;
  municipio_custom?: string | null;

  // Social proof
  rating_avg?: number;
  rating_count?: number;
  total_reviews?: number;

  // Discovery signals
  trending_score?: number;
  created_at?: string | null;

  // Relaciones
  vendedor?: ArtisanSeller;
}

/* ─── Discovery ───────────────────────────────────────────── */

/**
 * Señal que determinó por qué este producto está en una sección.
 * Permite que ArtisanCard sepa qué badge mostrar sin lógica extra.
 */
export type DiscoverySignal =
  | "trending"    // viene de /api/products/trending
  | "new"         // viene de /api/productos/nuevos
  | "featured"    // curado manualmente
  | "related"     // relacionado con el producto actual
  | "none";       // sin señal — card estándar

/* ─── Helpers ─────────────────────────────────────────────── */

/** Devuelve la primera imagen disponible del producto */
export function getPrimaryImage(product: ArtisanProduct): string {
  const first = product.imagenes?.[0];
  const fromImagenes = first
    ? typeof first === "string" ? first : first.url
    : null;
  return (
    product.imagen_principal ||
    product.imagen_url ||
    fromImagenes ||
    "/images/productos/default.jpg"
  );
}

/** Devuelve la cadena de ubicación del producto */
export function getProductLocation(product: ArtisanProduct): string {
  return [
    product.municipio || product.municipio_custom,
    product.departamento || product.departamento_custom,
  ]
    .filter(Boolean)
    .join(", ");
}

/** Devuelve el nombre de la categoría como string */
export function getCategoryName(product: ArtisanProduct): string | null {
  const cat = product.categoria;
  if (!cat) return product.categoria_custom ?? null;
  if (typeof cat === "string") return cat;
  return cat.nombre ?? product.categoria_custom ?? null;
}
