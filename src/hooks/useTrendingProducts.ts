// src/hooks/useTrendingProducts.ts
import { useApiFetch } from "./useApiFetch";

export type TrendingProducto = {
  id: string;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
  total_reviews: number;
  rating_avg: number;
  trending_score: number;
};

export function useTrendingProducts() {
  return useApiFetch<TrendingProducto>("/api/products/trending");
}
