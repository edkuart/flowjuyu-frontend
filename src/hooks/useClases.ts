// src/hooks/useClases.ts
import { useAppData, type Clase } from "@/context/AppDataContext";

export type { Clase };

export function useClases(): { data: Clase[]; loading: boolean; error: false } {
  const { clases, loading } = useAppData();
  return { data: clases, loading, error: false };
}
