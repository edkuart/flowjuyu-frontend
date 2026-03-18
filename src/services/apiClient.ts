/**
 * src/services/apiClient.ts
 *
 * Thin re-export so existing imports of apiFetch from this path keep working.
 * All logic lives in src/lib/api.ts — do not duplicate it here.
 */
export { apiFetch } from "@/lib/api"
