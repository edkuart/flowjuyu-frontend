// src/hooks/useAllSellers.ts
import { useApiFetch } from "./useApiFetch";

export type Artesano = {
  id: number;
  nombre_comercio?: string | null;
  nombre?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  descripcion?: string | null;
  departamento?: string | null;
  municipio?: string | null;
  rating_avg?: number | null;
  total_reviews?: number | null;
};

export function useAllSellers() {
  return useApiFetch<Artesano>("/api/seller/sellers/all");
}
