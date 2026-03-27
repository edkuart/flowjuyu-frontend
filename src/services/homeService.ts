//src/services/homeService.ts

import { getApiUrl } from "@/lib/config"
const API = getApiUrl();

/* ================================
   Tipos
================================ */

export type Categoria = {
  id: number;
  nombre: string;
  imagen_url?: string | null;
};

export type TrendingProducto = {
  id: string;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
  total_reviews: number;
  rating_avg: number;
  trending_score: number;
};

export type Producto = {
  id: string;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
};

export type Tienda = {
  id: number;
  nombre?: string | null;
  nombre_comercio?: string | null;
  logo_url?: string | null;
  departamento?: string | null;
  municipio?: string | null;
};

/* ================================
   Fetch Helper
================================ */

async function fetchJSON<T>(endpoint: string): Promise<T[]> {
  if (!API) {
    console.warn(`[homeService] API URL not set — skipping ${endpoint}`);
    return [];
  }

  try {
    const url = `${API}${endpoint}`;
    console.log(`[homeService] → GET ${url}`);

    const res = await fetch(url, { cache: "no-store" });

    console.log(`[homeService] ← ${endpoint} status=${res.status} ok=${res.ok}`);

    if (!res.ok) return [];

    const json = await res.json();

    console.log(`[homeService] ${endpoint} raw shape:`, Array.isArray(json) ? `array[${json.length}]` : `object keys=[${Object.keys(json ?? {}).join(",")}]`);

    if (Array.isArray(json)) return json as T[];
    if (Array.isArray(json?.data)) {
      console.log(`[homeService] ${endpoint} extracted json.data — ${json.data.length} items`);
      return json.data as T[];
    }

    console.warn(`[homeService] ${endpoint} unrecognised shape — returning []`, json);
    return [];
  } catch (error) {
    console.error(`[homeService] FETCH ERROR ${endpoint}:`, error);
    return [];
  }
}

/* ================================
   Individual fetchers
   (used by self-fetching client components)
================================ */

export const fetchTrendingProducts = () =>
  fetchJSON<TrendingProducto>("/api/products/trending");

export const fetchCategorias = () =>
  fetchJSON<Categoria>("/api/categorias");

export const fetchNuevosProductos = () =>
  fetchJSON<Producto>("/api/productos/nuevos");

export const fetchTiendas = () =>
  fetchJSON<Tienda>("/api/seller/sellers/top");

/* ================================
   Home Data Aggregator (kept for
   any non-homepage callers)
================================ */

export async function getHomeData(): Promise<{
  categorias: Categoria[];
  trendingProducts: TrendingProducto[];
  nuevosProductos: Producto[];
  tiendas: Tienda[];
}> {
  const [
    categorias,
    trendingProducts,
    nuevosProductos,
    tiendas,
  ] = await Promise.all([
    fetchCategorias(),
    fetchTrendingProducts(),
    fetchNuevosProductos(),
    fetchTiendas(),
  ]);

  return { categorias, trendingProducts, nuevosProductos, tiendas };
}
