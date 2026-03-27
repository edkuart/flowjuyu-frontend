// src/hooks/useApiFetch.ts
//
// Generic base hook for public, cacheable GET endpoints.
// Handles cancellation, response normalisation, and consistent state shape.
//
// ⚠️  Internal — callers outside src/hooks should use the named hooks
//      (useTrendingProducts, useNewProducts, etc.) not this directly.

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export type FetchState<T> = {
  data: T[];
  loading: boolean;
  error: boolean;
};

function toArray<T>(json: unknown): T[] {
  if (Array.isArray(json)) return json as T[];
  const obj = json as Record<string, unknown> | null;
  if (!obj) return [];
  if (Array.isArray(obj.data))       return obj.data       as T[];
  if (Array.isArray(obj.sellers))    return obj.sellers    as T[];
  if (Array.isArray(obj.productos))  return obj.productos  as T[];
  if (Array.isArray(obj.categorias)) return obj.categorias as T[];
  if (Array.isArray(obj.items))      return obj.items      as T[];
  return [];
}

export function useApiFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: [],
    loading: true,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;

    apiFetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((json: unknown) => {
        if (cancelled) return;
        setState({ data: toArray<T>(json), loading: false, error: false });
      })
      .catch(() => {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: true }));
      });

    return () => { cancelled = true; };
  }, [url]); // url is always a stable string literal in callers

  return state;
}
