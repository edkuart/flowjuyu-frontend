// src/lib/seller-trust.ts
//
// LÓGICA CENTRALIZADA de confianza del vendedor.
//
// Fuente de verdad: campos `plan` y `plan_activo` del seller
//   plan="founder" + plan_activo=true  → "verificado"
//   plan_activo=true (cualquier plan)   → "activo"
//   plan_activo=false o sin datos       → "nuevo"
//
// "Verificado" en Flowjuyu significa:
//   - El artesano pasó el proceso KYC
//   - Tiene plan Founder activo (acceso a WhatsApp directo)
//   - Su identidad y ubicación fueron validadas

import type { SellerTrustLevel } from "@/types/artisan";

/* ─── Config por nivel ────────────────────────────────────── */

interface TrustConfig {
  label: string;
  /** Descripción corta para tooltips / accesibilidad */
  description: string;
  /** Si muestra el ShieldCheck de verificación */
  showShield: boolean;
  /** Clases del badge */
  bgClass: string;
  textClass: string;
  /** Habilita el botón de WhatsApp directo */
  enablesWhatsapp: boolean;
}

const TRUST_CONFIG: Record<SellerTrustLevel, TrustConfig> = {
  verificado: {
    label: "Verificado",
    description: "Artesano validado por Flowjuyu con identidad confirmada",
    showShield: true,
    bgClass: "bg-[#0d2d20]/8",
    textClass: "text-[#0d2d20]",
    enablesWhatsapp: true,
  },
  activo: {
    label: "Tienda activa",
    description: "Vendedor activo en Flowjuyu",
    showShield: false,
    bgClass: "bg-[#f6f2ea]",
    textClass: "text-[#0d0d0b]/60",
    enablesWhatsapp: false,
  },
  nuevo: {
    label: "Nuevo artesano",
    description: "Recién incorporado a la plataforma",
    showShield: false,
    bgClass: "bg-[#f6f2ea]",
    textClass: "text-[#0d0d0b]/40",
    enablesWhatsapp: false,
  },
};

/* ─── Derivation ──────────────────────────────────────────── */

/**
 * Deriva el SellerTrustLevel a partir de los campos del seller.
 */
export function deriveSellerTrust(
  plan?: string | null,
  planActivo?: boolean | null
): SellerTrustLevel {
  if (plan === "founder" && planActivo === true) return "verificado";
  if (planActivo === true) return "activo";
  return "nuevo";
}

/**
 * Devuelve la configuración visual del nivel de confianza.
 */
export function getTrustConfig(level: SellerTrustLevel): TrustConfig {
  return TRUST_CONFIG[level];
}

/**
 * Conveniencia: deriva trust level y devuelve config en un solo paso.
 */
export function getSellerTrustConfig(
  plan?: string | null,
  planActivo?: boolean | null
): { level: SellerTrustLevel } & TrustConfig {
  const level = deriveSellerTrust(plan, planActivo);
  return { level, ...TRUST_CONFIG[level] };
}

/**
 * Determina si el seller puede recibir contacto directo por WhatsApp.
 * Condición: plan founder activo + número de WhatsApp disponible.
 */
export function sellerCanReceiveWhatsapp(
  plan?: string | null,
  planActivo?: boolean | null,
  whatsapp?: string | null
): boolean {
  return (
    !!whatsapp &&
    deriveSellerTrust(plan, planActivo) === "verificado"
  );
}
