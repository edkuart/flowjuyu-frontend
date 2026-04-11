// src/lib/sellerProgress.ts
//
// Central logic for the Seller Activation System (SAS).
// Pure function — no side effects, no fetching.
// Import and call from any page or component.

/* ──────────────────────────────────────────
   TYPES
────────────────────────────────────────── */

export type EstadoValidacion =
  | "pendiente"
  | "en_revision"
  | "aprobado"
  | "rechazado"
  | null

/**
 * Minimal perfil shape needed to compute progress.
 * Accepts both `logo` (my-business page) and `imagen_url` (VendedorPerfil)
 * so callers can pass either shape without mapping.
 */
export interface SellerPerfil {
  nombre_comercio?: string | null
  descripcion?: string | null
  logo?: string | null       // used by SellerProfile in my-business
  imagen_url?: string | null // used by VendedorPerfil from API
}

export interface SellerProgressStep {
  key: string
  label: string
  description: string
  done: boolean
  href: string
}

export interface SellerProgressResult {
  steps: SellerProgressStep[]
  percentage: number
  /** Short label for the next pending step, or null when complete */
  nextStep: string | null
  /** Full CTA sentence for the next pending step */
  nextAction: string | null
  /** Route the user should go to for the next step */
  nextHref: string | null
}

/* ──────────────────────────────────────────
   STEP ORDER
   1. Account created    → always true
   2. Profile completed  → nombre_comercio + descripcion + logo/imagen_url
   3. First product live → productos.some(p => p.activo === true)
   4. Verification done  → estadoValidacion === "aprobado"
────────────────────────────────────────── */

export function getSellerProgress({
  estadoValidacion,
  productos,
  perfil,
  storeShared = false,
}: {
  estadoValidacion: EstadoValidacion
  productos: {
    activo?: boolean
    descripcion?: string | null
    imagenes?: Array<{ url?: string | null }>
    imagen_url?: string | null
  }[]
  perfil: SellerPerfil | null
  storeShared?: boolean
}): SellerProgressResult {
  const perfilCompleto = Boolean(
    perfil?.nombre_comercio?.trim() &&
    perfil?.descripcion?.trim() &&
    (perfil?.logo || perfil?.imagen_url)
  )

  const hasProduct = productos.length > 0
  const hasStrongImages = productos.some((product) => {
    const imageCount = product.imagenes?.filter((image) => image?.url)?.length ?? 0
    return imageCount >= 2 || Boolean(product.imagen_url)
  })
  const hasClearDescription = productos.some(
    (product) => (product.descripcion?.trim().length ?? 0) >= 60,
  )
  const hasActiveProduct = productos.some((product) => product.activo === true)
  const isVerified = estadoValidacion === "aprobado"
  const profileDone = perfilCompleto || isVerified

  const steps: SellerProgressStep[] = [
    {
      key: "profile",
      label: "Completar perfil",
      description: "Agrega nombre, descripción y logo para inspirar confianza.",
      done: profileDone,
      href: "/seller/profile",
    },
    {
      key: "product",
      label: "Subir producto",
      description: "Publica al menos un producto para empezar a vender.",
      done: hasProduct,
      href: "/seller/products/new",
    },
    {
      key: "photos",
      label: "Mejorar fotos",
      description: "Usa fotos claras y suficientes para que el producto se entienda.",
      done: hasStrongImages,
      href: hasProduct ? "/seller/products" : "/seller/products/new",
    },
    {
      key: "description",
      label: "Agregar descripcion clara",
      description: "Explica material, tamano, colores o uso para generar confianza.",
      done: hasClearDescription,
      href: hasProduct ? "/seller/products" : "/seller/products/new",
    },
    {
      key: "share",
      label: "Compartir tienda",
      description: "Comparte tu tienda para conseguir primeras visitas.",
      done: storeShared,
      href: "/seller/my-business",
    },
  ]

  const completedCount = steps.filter(s => s.done).length
  const percentage = Math.round((completedCount / steps.length) * 100)

  /* ── Next step logic (priority order) ── */
  let nextStep: string | null = null
  let nextAction: string | null = null
  let nextHref: string | null = null

  if (!profileDone) {
    nextStep = "Completa tu perfil"
    nextAction = "Completa tu perfil de vendedor"
    nextHref = "/seller/profile"
  } else if (!hasProduct) {
    nextStep = "Sube tu primer producto"
    nextAction = "Sube tu primer producto"
    nextHref = "/seller/products/new"
  } else if (!hasStrongImages) {
    nextStep = "Mejora tus fotos"
    nextAction = "Agrega fotos mas claras a tu producto"
    nextHref = "/seller/products"
  } else if (!hasClearDescription) {
    nextStep = "Aclara tu descripcion"
    nextAction = "Completa una descripcion que genere confianza"
    nextHref = "/seller/products"
  } else if (!storeShared) {
    nextStep = "Comparte tu tienda"
    nextAction = "Comparte tu tienda para atraer visitas"
    nextHref = "/seller/my-business"
  }

  return { steps, percentage, nextStep, nextAction, nextHref }
}
