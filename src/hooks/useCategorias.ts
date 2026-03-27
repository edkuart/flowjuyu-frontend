// src/hooks/useCategorias.ts
import { useAppData, type Categoria } from "@/context/AppDataContext";

export type { Categoria };

export type CatalogoState = { data: Categoria[]; loading: boolean; error: false };

export function useCategorias(): CatalogoState {
  const { categorias, loading } = useAppData();
  return { data: categorias, loading, error: false };
}
