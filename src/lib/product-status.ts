// src/lib/product-status.ts
//
// LÓGICA CENTRALIZADA de estados de producto.
//
// REGLA: ningún componente calcula stock/status por su cuenta.
// Todos llaman a estas funciones.
//
// Fuente de verdad: campo `stock` del producto
//   null / undefined  → "disponible"  (artesano confirma por WhatsApp)
//   === 0             → "agotado"     (sin stock)
//   === 1             → "pieza_unica" (última unidad — trigger de urgencia)
//   > 1               → "disponible"  (hay unidades)
//
// El estado "bajo_pedido" requiere un campo explícito `acepta_encargo: true`
// en el backend. Hasta que exista, se trata como "agotado".

import type { ProductStatus } from "@/types/artisan";

/* ─── Config por status ───────────────────────────────────── */

interface StatusConfig {
  label: string;
  /** Clase Tailwind para el badge background */
  bgClass: string;
  /** Clase Tailwind para el texto */
  textClass: string;
  /** Clase Tailwind para el border */
  borderClass: string;
  /** Si es true, el CTA de compra debe deshabilitarse */
  blocksAction: boolean;
  /** Peso para ordenar listas (menor = más prioritario) */
  sortWeight: number;
}

const STATUS_CONFIG: Record<ProductStatus, StatusConfig> = {
  pieza_unica: {
    label: "Última pieza",
    bgClass: "bg-[#0d2d20]",
    textClass: "text-white",
    borderClass: "border-transparent",
    blocksAction: false,
    sortWeight: 0,
  },
  disponible: {
    label: "Disponible",
    bgClass: "bg-white/80",
    textClass: "text-[#0d2d20]",
    borderClass: "border-[#0d2d20]/20",
    blocksAction: false,
    sortWeight: 1,
  },
  bajo_pedido: {
    label: "Bajo pedido",
    bgClass: "bg-[#f6f2ea]",
    textClass: "text-[#0d0d0b]/70",
    borderClass: "border-[#0d2d20]/15",
    blocksAction: false,
    sortWeight: 2,
  },
  agotado: {
    label: "Agotado",
    bgClass: "bg-[#0d0d0b]/8",
    textClass: "text-[#0d0d0b]/40",
    borderClass: "border-transparent",
    blocksAction: true,
    sortWeight: 3,
  },
};

/* ─── Derivation ──────────────────────────────────────────── */

/**
 * Deriva el ProductStatus a partir del campo `stock`.
 * No lanza excepciones — siempre devuelve un status válido.
 */
export function deriveProductStatus(
  stock?: number | null,
  aceptaEncargo?: boolean
): ProductStatus {
  // stock desconocido → el artesano confirma disponibilidad
  if (stock === null || stock === undefined) return "disponible";

  const n = Number(stock);

  if (!Number.isFinite(n) || n < 0) return "disponible";
  if (n === 0) return aceptaEncargo ? "bajo_pedido" : "agotado";
  if (n === 1) return "pieza_unica";
  return "disponible";
}

/**
 * Devuelve la configuración visual del status.
 */
export function getStatusConfig(status: ProductStatus): StatusConfig {
  return STATUS_CONFIG[status];
}

/**
 * Conveniencia: deriva status y devuelve config en un solo paso.
 */
export function getProductStatusConfig(
  stock?: number | null,
  aceptaEncargo?: boolean
): { status: ProductStatus } & StatusConfig {
  const status = deriveProductStatus(stock, aceptaEncargo);
  return { status, ...STATUS_CONFIG[status] };
}

/**
 * Devuelve true si el producto puede ser contactado/comprado.
 */
export function canPurchase(stock?: number | null): boolean {
  return !getStatusConfig(deriveProductStatus(stock)).blocksAction;
}

/**
 * Ordena un array de productos poniendo los disponibles primero
 * y los agotados al final.
 */
export function sortByAvailability<T extends { stock?: number | null }>(
  products: T[]
): T[] {
  return [...products].sort(
    (a, b) =>
      getStatusConfig(deriveProductStatus(a.stock)).sortWeight -
      getStatusConfig(deriveProductStatus(b.stock)).sortWeight
  );
}
