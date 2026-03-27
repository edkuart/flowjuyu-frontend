// src/hooks/useRecommendedProducts.ts
//
// Auth-gated hook — fetches only when a user is authenticated.
// Intentionally NOT routed through the shared cache because
// recommendations are personalised per JWT.

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import type { ArtisanProduct } from "@/types/artisan";

export type RecommendedState = {
  data: ArtisanProduct[];
  loading: boolean;
  error: boolean;
  personalized: boolean;
  done: boolean;
};

export function useRecommendedProducts(): RecommendedState {
  const { user } = useAuth();

  const [state, setState] = useState<RecommendedState>({
    data: [],
    loading: false,
    error: false,
    personalized: false,
    done: false,
  });

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setState((s) => ({ ...s, loading: true, done: false }));

    apiFetch("/api/products/recommended")
      .then(async (res) => {
        if (!res.ok || cancelled) return;
        const json = await res.json();
        if (cancelled) return;

        const data: ArtisanProduct[] = (json.data ?? []).map((p: Record<string, unknown>) => ({
          id: p.id,
          nombre: p.nombre,
          precio: p.precio,
          imagen_url: p.imagen_url,
          rating_avg: p.rating_avg,
          rating_count: p.rating_count,
          departamento: p.departamento,
          municipio: p.municipio,
          categoria: p.categoria_id
            ? { id: p.categoria_id, nombre: (p.categoria_nombre as string) ?? "" }
            : null,
        }));

        setState({
          data,
          loading: false,
          error: false,
          personalized: (json.personalized as boolean) ?? false,
          done: true,
        });
      })
      .catch(() => {
        if (!cancelled)
          setState((s) => ({ ...s, loading: false, error: true, done: true }));
      });

    return () => { cancelled = true; };
  }, [user]);

  return state;
}
