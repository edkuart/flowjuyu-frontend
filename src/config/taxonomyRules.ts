// src/config/taxonomyRules.ts
//
// Frontend taxonomy rule system.
//
// The DB does NOT enforce category → attribute relationships. clases, telas, and
// accesorios are all separate systems with no FK to categorias. This file is the
// single source of truth for the UI interpretation layer:
//
//   "Given a category name, which attribute groups should be shown?"
//
// RULES:
//   - This file is the ONLY place where category-driven field visibility lives.
//   - Backend contract is unchanged — clase_id is always required by the API.
//   - When showClase is false, the create flow auto-assigns the first available
//     clase so the backend constraint is still satisfied (see page.tsx).
//   - Add new entries when the DB gets new category names.
//   - Keys are lowercase + trimmed — matching is case-insensitive.

export type TaxonomyRule = {
  /** Show the clase select field in the UI */
  showClase: boolean
  /** Show the tela / material select field in the UI (requires clase to load options) */
  showTela: boolean
  /** Show the accesorio section (tipo, material) in the UI */
  showAccesorios: boolean
  /**
   * Which accesorio catalog to load from the API.
   * Only relevant when showAccesorios is true.
   * "normal"  → /api/accesorios?tipo=normal
   * "tipico"  → /api/accesorios?tipo=tipico
   */
  accesorioTipo?: "normal" | "tipico"
}

/**
 * Fallback applied when a category name has no explicit rule.
 * Defaults to showing clase (required by backend) but hiding tela and accesorios.
 */
export const DEFAULT_TAXONOMY_RULE: TaxonomyRule = {
  showClase: true,
  showTela: false,
  showAccesorios: false,
}

/**
 * Taxonomy rules keyed by lowercase, trimmed category name.
 *
 * Both singular and plural forms are listed because DB data may differ
 * across installations. Entries are intentionally explicit — no regex,
 * no fuzzy matching.
 */
const TAXONOMY_RULES: Record<string, TaxonomyRule> = {
  // ── Textiles ────────────────────────────────────────────────────────────────
  // clase (weave technique) + tela (fabric type) both apply
  "güipil":              { showClase: true,  showTela: true,  showAccesorios: false },
  "güipiles":            { showClase: true,  showTela: true,  showAccesorios: false },
  "huipil":              { showClase: true,  showTela: true,  showAccesorios: false },
  "huipiles":            { showClase: true,  showTela: true,  showAccesorios: false },
  "corte":               { showClase: true,  showTela: true,  showAccesorios: false },
  "cortes":              { showClase: true,  showTela: true,  showAccesorios: false },
  "faja":                { showClase: true,  showTela: true,  showAccesorios: false },
  "fajas":               { showClase: true,  showTela: true,  showAccesorios: false },
  "tela":                { showClase: true,  showTela: true,  showAccesorios: false },
  "telas":               { showClase: true,  showTela: true,  showAccesorios: false },

  // ── Calzado ─────────────────────────────────────────────────────────────────
  // clase is hidden from UI (auto-assigned); tela and accesorio not relevant
  "calzado":             { showClase: false, showTela: false, showAccesorios: false },
  "calzados":            { showClase: false, showTela: false, showAccesorios: false },

  // ── Accessories ─────────────────────────────────────────────────────────────
  // clase is hidden (auto-assigned); dedicated accesorio taxonomy is shown instead
  "accesorio":           { showClase: false, showTela: false, showAccesorios: true, accesorioTipo: "normal" },
  "accesorios":          { showClase: false, showTela: false, showAccesorios: true, accesorioTipo: "normal" },
  "accesorios típicos":  { showClase: false, showTela: false, showAccesorios: true, accesorioTipo: "tipico" },
}

/**
 * Returns the taxonomy rule for a given category name.
 * Matching is case-insensitive and whitespace-trimmed.
 * Falls back to DEFAULT_TAXONOMY_RULE when no rule is found.
 */
export function getTaxonomyRule(categoryName: string | null | undefined): TaxonomyRule {
  if (!categoryName) return DEFAULT_TAXONOMY_RULE
  const key = categoryName.toLowerCase().trim()
  return TAXONOMY_RULES[key] ?? DEFAULT_TAXONOMY_RULE
}
