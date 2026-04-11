/**
 * src/lib/sellerRouting.ts
 *
 * Determines where a seller should land when accessing /seller.
 *
 * Pure TypeScript — no React, no browser APIs.
 * Safe to import from server components and edge functions.
 *
 * State machine (evaluated top-to-bottom, first match wins):
 *
 *   null perfil         → /welcome          (buyer, no store yet)
 *   profile incomplete  → /seller/onboarding
 *   KYC pending/review  → /seller/status
 *   KYC rejected        → /seller/kyc-retry
 *   admin inactive      → /seller/status
 *   fully active        → /seller/dashboard
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type EstadoValidacion = "pendiente" | "aprobado" | "rechazado";
export type EstadoAdmin = "activo" | "inactivo" | "suspendido";

/**
 * Minimal profile shape needed to compute the entry point.
 * Returned by GET /api/seller/entry-point.
 */
export interface SellerEntryPerfil {
  nombre_comercio?: string | null;
  descripcion?: string | null;
  banner_url?: string | null;
  telefono?: string | null;
  telefono_comercio?: string | null;
  estado_validacion?: EstadoValidacion | null;
  estado_admin?: EstadoAdmin | null;
}

// ─── Completeness check ───────────────────────────────────────────────────────

/**
 * Required fields a seller must fill in before they can operate.
 * A field is "filled" when it is a non-empty string.
 */
const REQUIRED_FIELDS: ReadonlyArray<keyof SellerEntryPerfil> = [
  "nombre_comercio",
  "descripcion",
  "banner_url",
] as const;

/** Returns true when all required profile fields are present and non-empty. */
export function isSellerProfileComplete(perfil: SellerEntryPerfil): boolean {
  return REQUIRED_FIELDS.every((field) => {
    const value = perfil[field];
    return typeof value === "string" && value.trim().length > 0;
  });
}

// ─── Entry point resolver ─────────────────────────────────────────────────────

/**
 * Returns the path the seller should be redirected to when visiting /seller.
 *
 * Handles all null / partial data states safely — never throws.
 */
export function getSellerEntryPoint(perfil: SellerEntryPerfil | null): string {
  // 1. No profile — seller user exists but hasn't created a store yet.
  if (!perfil) {
    return "/welcome";
  }

  // 2. Profile incomplete — store was started but key fields are missing.
  if (!isSellerProfileComplete(perfil)) {
    return "/seller/onboarding";
  }

  // 3. KYC pending or under review — documents submitted, waiting for approval.
  if (
    perfil.estado_validacion === "pendiente" ||
    perfil.estado_validacion == null // treat unknown / null as pending
  ) {
    return "/seller/status";
  }

  // 4. KYC rejected — seller must resubmit documents.
  if (perfil.estado_validacion === "rechazado") {
    return "/seller/kyc-retry";
  }

  // 5. KYC approved but admin has not yet activated the account.
  //    Also covers "suspendido" — show status screen, not the dashboard.
  if (perfil.estado_admin !== "activo") {
    return "/seller/status";
  }

  // 6. Fully active seller.
  return "/seller/dashboard";
}
