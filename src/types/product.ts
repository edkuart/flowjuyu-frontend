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