// src/types/review.ts

export type Review = {
  id: number
  producto_nombre: string
  producto_id: string
  /** 1–5 */
  rating: number
  comentario: string
  created_at?: string
}
