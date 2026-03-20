// src/types/product.ts

// 📦 Modelo base de producto (para listados, tarjetas, etc.)
export interface Product {
  id: string
  title: string
  description: string
  price: number
  image: string
  seller: {
    name: string
  }
}

// 📦 Producto en el panel del vendedor (respuesta de GET /api/seller/products)
export interface SellerProduct {
  id: string
  nombre: string
  descripcion?: string
  precio: number
  stock: number
  activo: boolean
  imagen_url?: string | null
  /** Código de referencia único de Flowjuyu. Formato: FJ-REG-CAT-YYMMDD-RAND6 */
  internal_code: string
  /** Código de inventario opcional definido por el vendedor */
  seller_sku?: string | null
}

// 🎯 Literales válidos para "confirmarOtro"
export type OtroTipo =
  | "categoria"
  | "tela"
  | "accesorio"
  | "tipo"
  | "material"

// 🔹 Opciones genéricas (categorías, clases, telas, accesorios, etc.)
export interface Opcion {
  id: number
  nombre: string
}

// 🔹 Clases con alias opcional
export interface Clase {
  id: number
  nombre: string
  alias?: string
}