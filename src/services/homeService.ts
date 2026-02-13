//src/services/homeService.ts

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

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
  try {
    const res = await fetch(`${API}${endpoint}`, {
      cache: "no-store",
    });

    if (!res.ok) return [];

    const json = await res.json();

    if (Array.isArray(json)) return json as T[];
    if (Array.isArray(json?.data)) return json.data as T[];

    return [];
  } catch (error) {
    console.error(`Error fetching ${endpoint}`, error);
    return [];
  }
}

/* ================================
   Home Data Aggregator
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
    fetchJSON<Categoria>("/api/categorias"),
    fetchJSON<TrendingProducto>("/api/products/trending"),
    fetchJSON<Producto>("/api/productos/nuevos"),
    fetchJSON<Tienda>("/api/vendedores/destacados"),
  ]);

  return {
    categorias,
    trendingProducts,
    nuevosProductos,
    tiendas,
  };
}
