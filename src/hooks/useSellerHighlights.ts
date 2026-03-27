// src/hooks/useSellerHighlights.ts
import { useApiFetch } from "./useApiFetch";

export type Tienda = {
  id: number;
  nombre?: string | null;
  nombre_comercio?: string | null;
  logo_url?: string | null;
  departamento?: string | null;
  municipio?: string | null;
};

export function useSellerHighlights() {
  return useApiFetch<Tienda>("/api/seller/sellers/top");
}
