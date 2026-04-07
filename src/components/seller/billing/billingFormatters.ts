// src/components/seller/billing/billingFormatters.ts
//
// Pure formatting helpers for billing UI. No React here — safe to import
// in both client and server components.

/** Format a Guatemala quetzal amount: "Q 299.00" */
export function formatQ(amount: number): string {
  return `Q ${amount.toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/** Format a DATEONLY string "2026-05-15" → "15 de mayo de 2026" */
export function formatDate(dateOnly: string | null | undefined): string {
  if (!dateOnly) return "—"
  // Parse as UTC midnight to avoid timezone shift
  const [y, m, d] = dateOnly.split("-").map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.toLocaleDateString("es-GT", {
    day:   "numeric",
    month: "long",
    year:  "numeric",
    timeZone: "UTC",
  })
}

/** Format an ISO datetime string to a short date+time: "15 may 2026, 14:30" */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("es-GT", {
    day:    "numeric",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  })
}

/** Billing cycle in plain Spanish */
export function cycleLabelShort(cycle: "monthly" | "yearly"): string {
  return cycle === "monthly" ? "mensual" : "anual"
}

export function cycleLabelLong(cycle: "monthly" | "yearly"): string {
  return cycle === "monthly" ? "Mensual" : "Anual"
}

/** "12 días" / "1 día" / "Hoy" / "Vencido hace 3 días" */
export function daysLabel(days: number | null): string {
  if (days === null) return "—"
  if (days > 1)  return `${days} días`
  if (days === 1) return "Mañana"
  if (days === 0) return "Hoy"
  const abs = Math.abs(days)
  return abs === 1 ? "Venció ayer" : `Venció hace ${abs} días`
}
