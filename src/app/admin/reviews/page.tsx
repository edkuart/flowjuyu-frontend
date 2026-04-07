"use client"

import { useEffect, useState } from "react"
import { authFetch } from "@/lib/authFetch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

type AdminReview = {
  id: string
  producto_nombre: string | null
  buyer_nombre: string
  seller_nombre: string
  rating: number
  comentario: string | null
  estado: string
  report_count: number
  helpful_count?: number
  review_signal?: {
    risk_score: number
    trust_score: number
    quality_score: number
  } | null
  verified_purchase: boolean
  order_date: string | null
  created_at: string
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [onlyHighRisk, setOnlyHighRisk] = useState(false)
  const [onlyFlagged, setOnlyFlagged] = useState(false)
  const [minReports, setMinReports] = useState(0)

  async function loadReviews() {
    try {
      const params = new URLSearchParams()
      if (onlyHighRisk) params.set("high_risk", "true")
      if (onlyFlagged) params.set("estado", "flagged")
      if (minReports > 0) params.set("min_reports", String(minReports))
      const query = params.toString()
      const res = await authFetch(`${API_URL}/api/admin/reviews${query ? `?${query}` : ""}`)
      if (!res.ok) throw new Error("No se pudieron cargar las reseñas")
      const json = await res.json()
      setReviews(json.reviews ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [onlyHighRisk, onlyFlagged, minReports])

  async function updateStatus(reviewId: string, action: "hide" | "restore") {
    setBusyId(reviewId)
    try {
      await authFetch(`${API_URL}/api/admin/reviews/${reviewId}/${action}`, { method: "PATCH" })
      await loadReviews()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Moderación de reseñas</h1>
        <p className="text-sm text-muted-foreground">
          Oculta o restaura reseñas sin borrarlas físicamente.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant={onlyHighRisk ? "default" : "outline"} onClick={() => setOnlyHighRisk((v) => !v)}>
          Alto riesgo
        </Button>
        <Button variant={onlyFlagged ? "default" : "outline"} onClick={() => setOnlyFlagged((v) => !v)}>
          Flagged
        </Button>
        <Button variant={minReports > 0 ? "default" : "outline"} onClick={() => setMinReports((v) => (v > 0 ? 0 : 1))}>
          Con reportes
        </Button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-sm text-neutral-500">
          Cargando reseñas...
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-neutral-900">
                      {review.producto_nombre || "Producto"}
                    </h2>
                    <Badge variant="secondary">{review.estado}</Badge>
                    {review.verified_purchase && (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        Compra verificada
                      </Badge>
                    )}
                    {review.report_count > 0 && (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                        {review.report_count} reportes
                      </Badge>
                    )}
                    {typeof review.review_signal?.risk_score === "number" && (
                      <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">
                        Risk {(review.review_signal.risk_score * 100).toFixed(0)}%
                      </Badge>
                    )}
                  </div>

                  <div className="text-sm text-neutral-600">
                    <p>Buyer: {review.buyer_nombre}</p>
                    <p>Seller: {review.seller_nombre}</p>
                    <p>Rating: {review.rating}/5</p>
                    <p>
                      Fecha: {new Date(review.order_date || review.created_at).toLocaleDateString("es-GT")}
                    </p>
                    <p>Helpful votes: {review.helpful_count ?? 0}</p>
                  </div>

                  {review.review_signal && (
                    <div className="grid gap-2 rounded-xl bg-neutral-50 p-3 text-xs text-neutral-600 sm:grid-cols-3">
                      <p>Trust: {(review.review_signal.trust_score * 100).toFixed(0)}%</p>
                      <p>Quality: {(review.review_signal.quality_score * 100).toFixed(0)}%</p>
                      <p>Risk: {(review.review_signal.risk_score * 100).toFixed(0)}%</p>
                    </div>
                  )}

                  {review.comentario && (
                    <p className="rounded-xl bg-neutral-50 px-4 py-3 text-sm leading-relaxed text-neutral-700">
                      {review.comentario}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {review.estado === "hidden_by_admin" ? (
                    <Button
                      disabled={busyId === review.id}
                      onClick={() => updateStatus(review.id, "restore")}
                    >
                      Restaurar
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      disabled={busyId === review.id}
                      onClick={() => updateStatus(review.id, "hide")}
                    >
                      Ocultar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {reviews.length === 0 && (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-10 text-center text-sm text-neutral-500">
              No hay reseñas para moderar.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
