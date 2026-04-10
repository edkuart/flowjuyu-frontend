// src/components/product/ui/StatusBadge.tsx
//
// ÚNICO componente de badges de estado en todo el sistema.
// Nunca escribir clases de color de badge en línea en otros componentes.
//
// Variantes de posición:
//  - "overlay"  → absoluto en imagen (top-left por defecto)
//  - "inline"   → flujo normal del documento
//
// Variantes de tamaño:
//  - "sm"  → text-[9px], usado en cards compactas
//  - "md"  → text-[10px], usado en cards estándar (default)

import { deriveProductStatus, getStatusConfig } from "@/lib/product-status";
import { deriveSellerTrust, getTrustConfig } from "@/lib/seller-trust";
import type { ProductStatus, SellerTrustLevel, DiscoverySignal } from "@/types/artisan";

/* ─── Product Status Badge ────────────────────────────────── */

interface ProductStatusBadgeProps {
  stock?: number | null;
  /** Pasa directamente si ya tienes el status calculado */
  status?: ProductStatus;
  variant?: "overlay" | "inline";
  size?: "sm" | "md";
  className?: string;
}

export function ProductStatusBadge({
  stock,
  status: statusProp,
  variant = "overlay",
  size = "md",
  className = "",
}: ProductStatusBadgeProps) {
  const status = statusProp ?? deriveProductStatus(stock);
  const config = getStatusConfig(status);

  // "disponible" con stock desconocido (null) no muestra badge —
  // no añadir ruido visual cuando no hay información extra que dar
  if (status === "disponible") return null;

  const sizeClass = size === "sm" ? "text-[9px] px-[8px] py-[3px]" : "text-[10px] px-[10px] py-[4px]";
  const posClass = variant === "overlay" ? "absolute top-3 left-3 z-10" : "";

  return (
    <span
      className={`
        ${posClass}
        ${sizeClass}
        ${config.bgClass}
        ${config.textClass}
        border ${config.borderClass}
        uppercase tracking-[0.20em]
        font-medium
        backdrop-blur-sm
        ${className}
      `}
    >
      {config.label}
    </span>
  );
}

/* ─── Discovery Signal Badge ──────────────────────────────── */

interface DiscoveryBadgeProps {
  signal: DiscoverySignal;
  createdAt?: string | null;
  variant?: "overlay" | "inline";
  size?: "sm" | "md";
  className?: string;
}

const DISCOVERY_CONFIG: Record<
  Exclude<DiscoverySignal, "none" | "related">,
  { label: string; bgClass: string; textClass: string }
> = {
  trending: {
    label: "Más vendido",
    bgClass: "bg-[#0d2d20]",
    textClass: "text-white",
  },
  new: {
    label: "Nuevo",
    bgClass: "bg-white/85",
    textClass: "text-[#0d2d20]",
  },
  featured: {
    label: "Destacado",
    bgClass: "bg-[#0d2d20]",
    textClass: "text-white",
  },
  // Availability signals — parent-driven hints, purely visual.
  // They do NOT affect card interactivity (that is controlled by isAgotado / stock).
  low_stock: {
    label: "Últimas piezas",
    bgClass: "bg-[#d97706]",
    textClass: "text-white",
  },
  sold_out: {
    label: "Agotado",
    bgClass: "bg-[#0d0d0b]/10",
    textClass: "text-[#0d0d0b]/50",
  },
};

/** Calcula el label temporal para productos nuevos */
function getNewLabel(createdAt?: string | null): string {
  if (!createdAt) return "Nuevo";
  const diff = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "Llegó hoy";
  if (diff === 1) return "Llegó ayer";
  if (diff <= 7) return `Hace ${diff} días`;
  return "Nuevo";
}

export function DiscoveryBadge({
  signal,
  createdAt,
  variant = "overlay",
  size = "md",
  className = "",
}: DiscoveryBadgeProps) {
  if (signal === "none" || signal === "related") return null;

  const config = DISCOVERY_CONFIG[signal];
  const label = signal === "new" ? getNewLabel(createdAt) : config.label;

  const sizeClass = size === "sm" ? "text-[9px] px-[8px] py-[3px]" : "text-[10px] px-[10px] py-[4px]";
  const posClass = variant === "overlay" ? "absolute top-3 left-3 z-10" : "";

  return (
    <span
      className={`
        ${posClass}
        ${sizeClass}
        ${config.bgClass}
        ${config.textClass}
        border border-transparent
        uppercase tracking-[0.20em]
        font-medium
        backdrop-blur-sm
        ${className}
      `}
    >
      {label}
    </span>
  );
}

/* ─── Seller Trust Badge ──────────────────────────────────── */

interface SellerTrustBadgeProps {
  plan?: string | null;
  planActivo?: boolean | null;
  /** Pasa directamente si ya tienes el nivel calculado */
  level?: SellerTrustLevel;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function SellerTrustBadge({
  plan,
  planActivo,
  level: levelProp,
  showLabel = true,
  size = "md",
  className = "",
}: SellerTrustBadgeProps) {
  const level = levelProp ?? deriveSellerTrust(plan, planActivo);
  const config = getTrustConfig(level);

  // Solo mostrar badge para niveles que aportan información visible
  if (level === "activo") return null;

  const sizeClass = size === "sm"
    ? "text-[9px] gap-[4px]"
    : "text-[10px] gap-[5px]";

  return (
    <span
      className={`
        inline-flex items-center
        ${sizeClass}
        ${config.bgClass}
        ${config.textClass}
        uppercase tracking-[0.18em]
        px-2 py-[3px]
        ${className}
      `}
      title={config.description}
    >
      {config.showShield && (
        <svg
          width={size === "sm" ? "10" : "11"}
          height={size === "sm" ? "10" : "11"}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )}
      {showLabel && config.label}
    </span>
  );
}
