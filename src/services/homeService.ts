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
  rating_avg?: number;
  rating_count?: number;
  categoria?: {
    id: number | null;
    nombre: string | null;
  };
  departamento?: string | null;
  municipio?: string | null;
  created_at?: string | null;
};

export type Tienda = {
  id: number;
  nombre?: string | null;
  nombre_comercio?: string | null;
  logo_url?: string | null;
  departamento?: string | null;
  municipio?: string | null;
};

export type SellerLive = {
  id: number;
  nombre_comercio: string;
  logo?: string | null;
  banner_url?: string | null;
  departamento?: string | null;
  municipio?: string | null;
  live_started_at?: string | null;
  live_message?: string | null;
  live_platform?: "tiktok" | "instagram" | "facebook" | null;
  live_external_url?: string | null;
  live_external_preview?: {
    title?: string | null;
    description?: string | null;
    image_url?: string | null;
    site_name?: string | null;
    canonical_url?: string | null;
  } | null;
  live_featured_products?: Array<{
    id: string;
    nombre: string;
    precio: number | string;
    imagen_url?: string | null;
    internal_code?: string | null;
    sku?: string | null;
  }>;
};

export type HomeCatalogSection = {
  key: "featured" | "new_arrivals" | "trending";
  title: string;
  items: Producto[];
};

export type HomeCatalogData = {
  seed: string;
  seed_window: string;
  overlap_used: number;
  max_overlap: number;
  sections: {
    featured: HomeCatalogSection;
    new_arrivals: HomeCatalogSection;
    trending: HomeCatalogSection;
  };
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

export const fetchLiveSellers = () =>
  fetchJSON<SellerLive>("/api/public/sellers/live");

export async function fetchHomeCatalog(): Promise<HomeCatalogData | null> {
  if (!API) {
    console.warn("[homeService] API URL not set — skipping /api/home/products");
    return null;
  }

  try {
    const url = `${API}/api/home/products`;
    console.log(`[homeService] → GET ${url}`);

    const res = await fetch(url, { cache: "no-store" });

    console.log(`[homeService] ← /api/home/products status=${res.status} ok=${res.ok}`);

    if (!res.ok) return null;

    const json = await res.json();
    const data = json?.data ?? null;

    console.log("HOME DATA:", data);

    if (!data?.sections) {
      console.warn("[homeService] /api/home/products missing sections", json);
      return null;
    }

    return data as HomeCatalogData;
  } catch (error) {
    console.error("[homeService] FETCH ERROR /api/home/products:", error);
    return null;
  }
}

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
