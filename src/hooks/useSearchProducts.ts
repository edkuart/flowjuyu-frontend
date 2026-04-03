"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useDebounce } from "./useDebounce";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

// ─── Domain Types ──────────────────────────────────────────────────────────────

export type Categoria = {
  id: number;
  nombre: string;
  nombre_kiche?: string | null;
  nombre_kaqchikel?: string | null;
  nombre_qeqchi?: string | null;
};
export type Clase = { id: number; nombre: string };
export type Tela = { id: number; nombre: string };
export type Accesorio = { id: number; nombre: string };
export type AccesorioTipo = { id: number; nombre: string };
export type AccesorioMaterial = { id: number; nombre: string };

export type Producto = {
  id: string;
  nombre: string;
  nombre_kiche?: string | null;
  nombre_kaqchikel?: string | null;
  nombre_qeqchi?: string | null;
  precio: number | string;
  categoria?: string | null;
  categoria_obj?: Categoria | null;
  imagen_url?: string | null;
  imagenes?: { url: string }[];
  departamento?: string | null;
  municipio?: string | null;
};

export type SearchFilters = {
  query: string;
  categoriaId: number | null;
  claseId: number | null;
  telaId: number | null;
  accesorioId: number | null;
  accesorioTipoId: number | null;
  accesorioMaterialId: number | null;
  departamento: string;
  municipio: string;
  precioMin: number;
  precioMax: number;
  sort: string;
};

// ─── API Fetchers (module-level, no closures over component state) ─────────────

async function fetchCatalog<T>(path: string): Promise<T[]> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`Catalog fetch failed: ${path}`);
  const json = await res.json();
  // Guard: some API responses wrap the array ({ data: [...] } or similar).
  // Always return an array so callers can safely call .find() / .map().
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  return [];
}

async function fetchProducts(
  filters: SearchFilters,
): Promise<{ data: Producto[]; related: Producto[] }> {
  const p = new URLSearchParams();

  if (filters.query.trim()) p.set("search", filters.query.trim());
  if (filters.categoriaId) p.set("categoria_id", String(filters.categoriaId));
  if (filters.claseId) p.set("clase_id", String(filters.claseId));
  if (filters.telaId) p.set("tela_id", String(filters.telaId));
  if (filters.accesorioId) p.set("accesorio_id", String(filters.accesorioId));
  if (filters.accesorioTipoId)
    p.set("accesorio_tipo_id", String(filters.accesorioTipoId));
  if (filters.accesorioMaterialId)
    p.set("accesorio_material_id", String(filters.accesorioMaterialId));
  if (filters.departamento) p.set("departamento", filters.departamento);
  if (filters.municipio) p.set("municipio", filters.municipio);
  if (filters.sort) p.set("sort", filters.sort);
  // Always send price bounds so the backend can apply range filtering
  p.set("precioMin", String(filters.precioMin));
  p.set("precioMax", String(filters.precioMax));

  const res = await fetch(`${API}/api/products?${p}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Product search failed: ${res.status}`);
  return res.json();
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useSearchProducts() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Ref keeps the latest searchParams accessible in stable callbacks without
  // being in their dependency arrays (avoids recreating callbacks on every URL change).
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  // ── Controlled input state (immediate feedback; debounced before URL write) ──
  const [inputValue, setInputValue] = useState(
    () => searchParams.get("search") || searchParams.get("q") || "",
  );

  const debouncedQuery = useDebounce(inputValue, 300);

  // One-way sync: debouncedQuery → URL.
  // Guards:
  //   1. Early return when values match → prevents write-on-mount and re-entry loops.
  //   2. Reads searchParamsRef (not `searchParams` from closure) → always current URL.
  //   3. `router` and `searchParams` intentionally omitted from deps → adding either
  //      creates a cycle: URL change → searchParams change → effect re-runs → URL change.
  useEffect(() => {
    const current = (
      searchParamsRef.current.get("search") ||
      searchParamsRef.current.get("q") ||
      ""
    ).trim();

    if (debouncedQuery.trim() === current) return;

    const p = new URLSearchParams(searchParamsRef.current.toString());
    p.delete("q"); // normalise legacy `q` param to `search`
    if (debouncedQuery.trim()) {
      p.set("search", debouncedQuery.trim());
    } else {
      p.delete("search");
    }
    router.replace(`/search?${p.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  // ── URL → filters (URL is the single source of truth for all filter state) ──
  const filters = useMemo<SearchFilters>(
    () => ({
      query: searchParams.get("search") || searchParams.get("q") || "",
      categoriaId: searchParams.get("categoria_id")
        ? Number(searchParams.get("categoria_id"))
        : null,
      claseId: searchParams.get("clase_id")
        ? Number(searchParams.get("clase_id"))
        : null,
      telaId: searchParams.get("tela_id")
        ? Number(searchParams.get("tela_id"))
        : null,
      accesorioId: searchParams.get("accesorio_id")
        ? Number(searchParams.get("accesorio_id"))
        : null,
      accesorioTipoId: searchParams.get("accesorio_tipo_id")
        ? Number(searchParams.get("accesorio_tipo_id"))
        : null,
      accesorioMaterialId: searchParams.get("accesorio_material_id")
        ? Number(searchParams.get("accesorio_material_id"))
        : null,
      departamento: searchParams.get("departamento") || "",
      municipio: searchParams.get("municipio") || "",
      precioMin: Number(searchParams.get("precioMin") ?? 0),
      precioMax: Number(searchParams.get("precioMax") ?? 2000),
      sort: searchParams.get("sort") || "",
    }),
    [searchParams],
  );

  // ── Stable URL mutation helper ─────────────────────────────────────────────
  // `router` is a stable reference from Next.js — safe as the only dep.
  // `searchParamsRef.current` is always up-to-date without being a dep.
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const p = new URLSearchParams(searchParamsRef.current.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === null) p.delete(k);
        else p.set(k, v);
      }
      router.replace(`/search?${p.toString()}`, { scroll: false });
    },
    [router],
  );

  // ── Setters — each is stable; all category-dependent cascades are explicit ──

  // Changing category resets ALL sub-filters that are category-scoped.
  const setCategoriaId = useCallback(
    (id: number | null) =>
      updateParams({
        categoria_id: id ? String(id) : null,
        clase_id: null,
        tela_id: null,
        accesorio_id: null,
        accesorio_tipo_id: null,
        accesorio_material_id: null,
      }),
    [updateParams],
  );

  // Changing clase resets tela (tela options depend on clase).
  const setClaseId = useCallback(
    (id: number | null) =>
      updateParams({ clase_id: id ? String(id) : null, tela_id: null }),
    [updateParams],
  );

  const setTelaId = useCallback(
    (id: number | null) => updateParams({ tela_id: id ? String(id) : null }),
    [updateParams],
  );

  // Changing accesorio resets tipo and material (they depend on the accesorio).
  const setAccesorioId = useCallback(
    (id: number | null) =>
      updateParams({
        accesorio_id: id ? String(id) : null,
        accesorio_tipo_id: null,
        accesorio_material_id: null,
      }),
    [updateParams],
  );

  const setAccesorioTipoId = useCallback(
    (id: number | null) =>
      updateParams({ accesorio_tipo_id: id ? String(id) : null }),
    [updateParams],
  );

  const setAccesorioMaterialId = useCallback(
    (id: number | null) =>
      updateParams({ accesorio_material_id: id ? String(id) : null }),
    [updateParams],
  );

  // Changing departamento resets municipio (municipio list depends on departamento).
  const setDepartamento = useCallback(
    (v: string) => updateParams({ departamento: v || null, municipio: null }),
    [updateParams],
  );

  const setMunicipio = useCallback(
    (v: string) => updateParams({ municipio: v || null }),
    [updateParams],
  );

  // Omit default values from URL to keep it clean; restore defaults on read.
  // precioMin default = 0, precioMax default = 2000.
  const setPrecioMin = useCallback(
    (v: number) => updateParams({ precioMin: v !== 0 ? String(v) : null }),
    [updateParams],
  );

  const setPrecioMax = useCallback(
    (v: number) => updateParams({ precioMax: v !== 2000 ? String(v) : null }),
    [updateParams],
  );

  const setSort = useCallback(
    (v: string) => updateParams({ sort: v || null }),
    [updateParams],
  );

  // Reset clears local input state AND the URL in one pass.
  const resetFilters = useCallback(() => {
    setInputValue("");
    router.replace("/search", { scroll: false });
  }, [router]);

  // ── Static catalog queries (rarely change, long staleTime) ────────────────

  const { data: categorias = [] } = useQuery<Categoria[]>({
    queryKey: ["catalog", "categorias"],
    queryFn: () => fetchCatalog<Categoria>("/api/categorias"),
    staleTime: 5 * 60_000,
  });

  const { data: clases = [] } = useQuery<Clase[]>({
    queryKey: ["catalog", "clases"],
    queryFn: () => fetchCatalog<Clase>("/api/clases"),
    staleTime: 5 * 60_000,
  });

  // ── Category-derived flags (depend on categorias being loaded first) ───────

  const categoriaNombre = useMemo(() => {
    const cat = categorias.find((c) => c.id === filters.categoriaId);
    return (cat?.nombre || "").toLowerCase();
  }, [categorias, filters.categoriaId]);

  // Booleans are cheap — no useMemo needed; they gate `enabled` on queries below.
  const esTextil =
    categoriaNombre.includes("huipil") ||
    categoriaNombre.includes("hupil") ||
    categoriaNombre.includes("corte");
  const esCalzado = categoriaNombre.includes("calzado");
  const esAccesorios = categoriaNombre.includes("accesorio");
  const accesorioTipo =
    categoriaNombre.includes("típic") || categoriaNombre.includes("tipic")
      ? "tipico"
      : "normal";

  // ── Dynamic catalog queries (enabled only when their context is active) ────

  const { data: telas = [] } = useQuery<Tela[]>({
    queryKey: ["catalog", "telas", filters.claseId],
    queryFn: () => fetchCatalog<Tela>(`/api/telas?clase_id=${filters.claseId}`),
    // Only fetch telas when: it's a textile category, not calzado, AND clase is selected.
    enabled: esTextil && !esCalzado && filters.claseId !== null,
    staleTime: 5 * 60_000,
  });

  const { data: accesorios = [] } = useQuery<Accesorio[]>({
    queryKey: ["catalog", "accesorios", accesorioTipo],
    queryFn: () =>
      fetchCatalog<Accesorio>(`/api/accesorios?tipo=${accesorioTipo}`),
    enabled: esAccesorios,
    staleTime: 5 * 60_000,
  });

  const { data: accesorioTipos = [] } = useQuery<AccesorioTipo[]>({
    queryKey: ["catalog", "accesorio-tipos", filters.accesorioId],
    queryFn: () =>
      fetchCatalog<AccesorioTipo>(
        `/api/accesorio-tipos?accesorio_id=${filters.accesorioId}`,
      ),
    enabled: filters.accesorioId !== null,
    staleTime: 5 * 60_000,
  });

  const { data: accesorioMateriales = [] } = useQuery<AccesorioMaterial[]>({
    queryKey: ["catalog", "accesorio-materiales", filters.accesorioId],
    queryFn: () =>
      fetchCatalog<AccesorioMaterial>(
        `/api/accesorio-materiales?accesorio_id=${filters.accesorioId}`,
      ),
    enabled: filters.accesorioId !== null,
    staleTime: 5 * 60_000,
  });

  // ── Product query ──────────────────────────────────────────────────────────
  // queryKey includes the full filters object — React Query deep-compares via JSON.
  // placeholderData: keepPreviousData (v5 API) keeps stale results visible while
  // refetching, preventing the grid from flickering empty on filter changes.
  const {
    data: productsData,
    isLoading, // true only on first fetch (no data yet)
    isFetching, // true on every in-flight request including refetches
  } = useQuery({
    queryKey: ["products", filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const productos = productsData?.data ?? [];
  const relacionados = productsData?.related ?? [];

  // ── Active filter pills ────────────────────────────────────────────────────

  const filtrosActivos = useMemo(() => {
    const pills: string[] = [];

    const cat = categorias.find((x) => x.id === filters.categoriaId);
    if (cat) pills.push(cat.nombre);

    if (filters.departamento) pills.push(filters.departamento);
    if (filters.municipio) pills.push(filters.municipio);
    if (filters.precioMin > 0) pills.push(`Min Q${filters.precioMin}`);
    if (filters.precioMax < 2000) pills.push(`Max Q${filters.precioMax}`);

    const clase = clases.find((x) => x.id === filters.claseId);
    if (clase) pills.push(clase.nombre);

    const tela = telas.find((x) => x.id === filters.telaId);
    if (tela) pills.push(tela.nombre);

    const acc = accesorios.find((x) => x.id === filters.accesorioId);
    if (acc) pills.push(acc.nombre);

    const accTipo = accesorioTipos.find(
      (x) => x.id === filters.accesorioTipoId,
    );
    if (accTipo) pills.push(accTipo.nombre);

    const accMat = accesorioMateriales.find(
      (x) => x.id === filters.accesorioMaterialId,
    );
    if (accMat) pills.push(accMat.nombre);

    return pills;
  }, [
    filters,
    categorias,
    clases,
    telas,
    accesorios,
    accesorioTipos,
    accesorioMateriales,
  ]);

  return {
    // Controlled input (local state, debounced before URL write)
    inputValue,
    setInputValue,

    // All filter values (derived from URL — single source of truth)
    filters,

    // Stable setters (all memoised; recreated only when `router` changes)
    setCategoriaId,
    setClaseId,
    setTelaId,
    setAccesorioId,
    setAccesorioTipoId,
    setAccesorioMaterialId,
    setDepartamento,
    setMunicipio,
    setPrecioMin,
    setPrecioMax,
    setSort,
    resetFilters,

    // Products
    productos,
    relacionados,
    isLoading,
    isFetching,

    // Catalogs (gated: returns [] when category context doesn't apply)
    categorias,
    clases,
    telas: esTextil && !esCalzado ? telas : [],
    accesorios: esAccesorios ? accesorios : [],
    accesorioTipos,
    accesorioMateriales,

    // Derived
    filtrosActivos,
  };
}
