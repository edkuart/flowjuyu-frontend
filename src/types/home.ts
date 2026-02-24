export type Categoria = {
  id: number;
  nombre: string;
  imagen_url?: string | null;
};

export type Producto = {
  id: string;
  nombre: string;
  precio: number;
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

export type Tienda = {
  id: number;
  nombre?: string | null;
  nombre_comercio?: string | null;
  logo_url?: string | null;
  departamento?: string | null;
  municipio?: string | null;
};
