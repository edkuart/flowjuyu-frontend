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
}: {
  estadoValidacion: EstadoValidacion
  productos: { activo?: boolean }[]
  perfil: SellerPerfil | null
}): SellerProgressResult {
  const perfilCompleto = Boolean(
    perfil?.nombre_comercio?.trim() &&
    perfil?.descripcion?.trim() &&
    (perfil?.logo || perfil?.imagen_url)
  )

  const hasActiveProduct = productos.some(p => p.activo === true)
  const isVerified = estadoValidacion === "aprobado"

  const steps: SellerProgressStep[] = [
    {
      key: "account",
      label: "Cuenta creada",
      description: "Tu cuenta de vendedor está activa.",
      done: true,
      href: "#",
    },
    {
      key: "profile",
      label: "Perfil completado",
      description: "Agrega nombre, descripción y logo de tu negocio.",
      done: perfilCompleto,
      href: "/seller/profile",
    },
    {
      key: "product",
      label: "Primer producto publicado",
      description: "Publica al menos un producto para aparecer en el catálogo.",
      done: hasActiveProduct,
      href: "/seller/products/new",
    },
    {
      key: "kyc",
      label: "Verificación aprobada",
      description: "Sube tu DPI y documentos de identidad para activar tu tienda.",
      done: isVerified,
      href: "/seller/account",
    },
  ]

  const completedCount = steps.filter(s => s.done).length
  const percentage = Math.round((completedCount / steps.length) * 100)

  /* ── Next step logic (priority order) ── */
  let nextStep: string | null = null
  let nextAction: string | null = null
  let nextHref: string | null = null

  if (!perfilCompleto) {
    nextStep = "Completa tu perfil"
    nextAction = "Completa tu perfil de vendedor"
    nextHref = "/seller/profile"
  } else if (!hasActiveProduct) {
    nextStep = "Crea tu primer producto"
    nextAction = "Crea y publica tu primer producto"
    nextHref = "/seller/products/new"
  } else if (!isVerified) {
    nextStep = "Verificación pendiente"
    nextAction = "Sube tus documentos de verificación"
    nextHref = "/seller/account"
  }

  return { steps, percentage, nextStep, nextAction, nextHref }
}
