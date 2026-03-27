// src/context/AppDataContext.tsx
//
// Single source of truth for shared, public catalogue data.
// Fetches once at app startup — all consumers read from context,
// eliminating duplicate network requests across SearchBar, dropdowns,
// category sections, and filter sidebars.

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { apiFetch } from "@/lib/api";

export type Categoria  = { id: number; nombre: string; imagen_url?: string | null };
export type Clase      = { id: number; nombre: string; alias?: string | null };
export type Accesorio  = { id: number; nombre: string; categoria_tipo?: string | null };

type AppData = {
  categorias:       Categoria[];
  clases:           Clase[];
  accesoriosNormal: Accesorio[];
  accesoriosTipico: Accesorio[];
  loading:          boolean;
};

const DEFAULT: AppData = {
  categorias:       [],
  clases:           [],
  accesoriosNormal: [],
  accesoriosTipico: [],
  loading:          true,
};

const AppDataContext = createContext<AppData>(DEFAULT);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppData>(DEFAULT);
  const fetched = useRef(false); // guards against React Strict Mode double-fire

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;

    const get = (path: string) =>
      apiFetch(path)
        .then((r) => (r.ok ? r.json() : []))
        .catch((): unknown[] => []);

    Promise.all([
      get("/api/categorias"),
      get("/api/clases"),
      get("/api/accesorios?tipo=normal"),
      get("/api/accesorios?tipo=tipico"),
    ]).then(([categorias, clases, accesoriosNormal, accesoriosTipico]) => {
        const normalize = (res: any) =>
          Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
            ? res
            : [];

        setState({
          categorias:       normalize(categorias),
          clases:           normalize(clases),
          accesoriosNormal: normalize(accesoriosNormal),
          accesoriosTipico: normalize(accesoriosTipico),
          loading: false,
        });
      });
  }, []);

  return (
    <AppDataContext.Provider value={state}>
      {children}
    </AppDataContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAppData(): AppData {
  return useContext(AppDataContext);
}
