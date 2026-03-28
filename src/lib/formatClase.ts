// src/lib/formatClase.ts
//
// Helpers for displaying "clases" in dropdowns.
//
// CONTEXT: The DB stores clases with a `nombre` (verbose) and an `alias`
// (short, e.g. "primera", "segunda", "tercera"). The API returns them in
// insertion/alphabetical order which is not the logical tier order.
//
// These helpers are frontend-only and do not affect any API call or payload.

/** Canonical tier order for sorting clases in the UI. */
export const CLASE_ORDER = ["primera", "segunda", "tercera"]

type ClaseItem = { id: number; nombre: string; alias?: string }

/**
 * Returns a sorted copy of the clases array following CLASE_ORDER.
 * Items with an unrecognised or absent alias are placed at the end,
 * maintaining their relative order.
 */
export function sortClases<T extends ClaseItem>(clases: T[]): T[] {
  return [...clases].sort((a, b) => {
    const ia = a.alias ? CLASE_ORDER.indexOf(a.alias.toLowerCase()) : -1
    const ib = b.alias ? CLASE_ORDER.indexOf(b.alias.toLowerCase()) : -1
    const ra = ia === -1 ? CLASE_ORDER.length : ia
    const rb = ib === -1 ? CLASE_ORDER.length : ib
    return ra - rb
  })
}

/**
 * Returns a clean, human-readable label for a clase dropdown option.
 *
 * Input:  { alias: "primera", nombre: "Gama alta / primera clase" }
 * Output: "Primera — Gama alta"
 *
 * The redundant tier suffix (e.g. " / primera clase") is stripped from nombre
 * so the alias in the label is not repeated. Falls back to `nombre` alone when
 * alias is absent.
 */
export function formatClaseLabel(clase: ClaseItem): string {
  if (!clase.alias) return clase.nombre

  const alias = clase.alias.charAt(0).toUpperCase() + clase.alias.slice(1).toLowerCase()

  // Strip the repeated " / <alias> clase" suffix that some DB entries include
  const clean = clase.nombre
    .replace(/ \/ primera clase/gi, "")
    .replace(/ \/ segunda clase/gi, "")
    .replace(/ \/ tercera clase/gi, "")
    .trim()

  return `${alias} — ${clean}`
}
