// src/hooks/useNewProducts.ts
import { useApiFetch } from "./useApiFetch";

export type NewProducto = {
  id: string;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
  imagenes?: { url: string }[];
  created_at?: string | null;
};

export function useNewProducts() {
  return useApiFetch<NewProducto>("/api/productos/nuevos");
}
