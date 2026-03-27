// src/hooks/useAccesorios.ts
//
// Merges accesoriosNormal + accesoriosTipico from AppDataContext,
// deduplicating by id. Memoized — stable reference between renders.

import { useMemo } from "react";
import { useAppData, type Accesorio } from "@/context/AppDataContext";

export type { Accesorio };

export function useAccesorios(): { data: Accesorio[]; loading: boolean; error: false } {
  const { accesoriosNormal, accesoriosTipico, loading } = useAppData();

  const data = useMemo(() => {
    const map = new Map<number, Accesorio>();
    [...accesoriosNormal, ...accesoriosTipico].forEach((a) => {
      if (!map.has(a.id)) map.set(a.id, a);
    });
    return [...map.values()];
  }, [accesoriosNormal, accesoriosTipico]);

  return { data, loading, error: false };
}
