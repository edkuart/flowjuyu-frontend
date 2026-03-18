// src/lib/sellerTrust.ts
//
// Trust & Conversion Layer (TCL) — Phase 8
// Pure function. No side effects. No fetching.
// Returns trust signals for public seller profile pages.

/* ──────────────────────────────────────────
   TYPES
────────────────────────────────────────── */

export type TrustBadgeType = "verified" | "active" | "location" | "products"

export interface TrustBadge {
  label: string
  type: TrustBadgeType
}

export interface SellerTrustResult {
  badges: TrustBadge[]
}

export interface TrustPerfil {
  nombre_comercio?: string | null
  departamento?: string | null
  municipio?: string | null
}

export type TrustEstado =
  | "pendiente"
  | "en_revision"
  | "aprobado"
  | "rechazado"
  | null

/* ──────────────────────────────────────────
   MAIN FUNCTION
   Badge order: verified → products → location → active
   Max 4 badges (naturally bounded by the 4 rules).
────────────────────────────────────────── */

export function getSellerTrustSignals({
  perfil,
  productos,
  estadoValidacion,
}: {
  perfil: TrustPerfil | null
  productos: unknown[]
  estadoValidacion: TrustEstado
}): SellerTrustResult {
  const badges: TrustBadge[] = []

  /* 1. Verification status — highest trust signal */
  if (estadoValidacion === "aprobado") {
    badges.push({ label: "Tienda verificada", type: "verified" })
  }

  /* 2. Active product catalogue */
  if (productos.length > 0) {
    badges.push({
      label: `${productos.length} producto${productos.length !== 1 ? "s" : ""} disponible${productos.length !== 1 ? "s" : ""}`,
      type: "products",
    })
  }

  /* 3. Physical location on record */
  if (perfil?.departamento || perfil?.municipio) {
    const location = [perfil?.municipio, perfil?.departamento]
      .filter(Boolean)
      .join(", ")
    badges.push({ label: location, type: "location" })
  }

  /* 4. Always — platform membership signal */
  badges.push({ label: "Vendedor en Flowjuyu", type: "active" })

  return { badges: badges.slice(0, 4) }
}
