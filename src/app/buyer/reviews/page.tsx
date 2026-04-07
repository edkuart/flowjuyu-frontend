"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, MessageSquareDashed, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

type BuyerReview = {
  id:                string;
  producto_id:       string;
  producto_nombre:   string;
  rating:            number;
  comentario:        string | null;
  created_at:        string;
  order_date:        string | null;
  estado:            string;
  verified_purchase: boolean;
  can_edit?:         boolean;
  can_delete?:       boolean;
  seller_response?:  {
    respuesta: string;
  } | null;
};

export default function BuyerReviewsPage() {
  const [reviews, setReviews]  = useState<BuyerReview[]>([]);
  const [loading, setLoading]  = useState(true);
  const [error,   setError]    = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftRating, setDraftRating] = useState(5);
  const [draftComment, setDraftComment] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  async function loadReviews() {
    return apiFetch("/api/buyer/reviews")
      .then(async (res) => {
        if (!res.ok) throw new Error("Error al cargar reseñas");
        const json = await res.json();
        setReviews(json.reviews ?? []);
      })
      .catch(() => setError("No se pudieron cargar tus opiniones."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadReviews()
  }, []);

  function startEdit(review: BuyerReview) {
    setEditingId(review.id)
    setDraftRating(review.rating)
    setDraftComment(review.comentario ?? "")
  }

  async function submitEdit(reviewId: string) {
    setSavingId(reviewId)
    try {
      const res = await apiFetch(`/api/reviews/${reviewId}`, {
        method: "PUT",
        body: JSON.stringify({ rating: draftRating, comentario: draftComment }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.message || "No se pudo editar la reseña")
      }

      setEditingId(null)
      await loadReviews()
    } catch (err: any) {
      setError(err?.message || "No se pudo editar la reseña.")
    } finally {
      setSavingId(null)
    }
  }

  async function removeReview(reviewId: string) {
    setSavingId(reviewId)
    try {
      const res = await apiFetch(`/api/reviews/${reviewId}`, { method: "DELETE" })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.message || "No se pudo eliminar la reseña")
      }
      await loadReviews()
    } catch (err: any) {
      setError(err?.message || "No se pudo eliminar la reseña.")
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* Encabezado */}
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis opiniones</h1>
        <p className="text-sm text-gray-500 mt-1">
          Aquí puedes ver las reseñas que has dejado en tus compras.
        </p>
      </div>

      {/* Cargando */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-4" />
          <p className="text-sm font-medium">Cargando tus opiniones...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Vacío */}
      {!loading && !error && reviews.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <MessageSquareDashed className="w-10 h-10 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aún no has dejado opiniones
          </h3>
          <p className="text-gray-500 max-w-sm mb-8">
            Tus reseñas ayudan a otros compradores a elegir mejor. Cuando recibas un pedido, podrás compartir tu experiencia.
          </p>
          <Link href="/buyer/orders">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6 py-5 shadow-sm">
              Ir a mis pedidos
            </Button>
          </Link>
        </div>
      )}

      {/* Lista */}
      {!loading && !error && reviews.length > 0 && (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="flex flex-col sm:flex-row gap-5 border border-gray-100 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Info y comentario */}
              <div className="flex-1 flex flex-col justify-center space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {review.producto_nombre}
                    </h3>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-200 fill-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700">
                        Estado: {review.estado}
                      </span>
                      {review.verified_purchase && (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                          Compra verificada
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-medium shrink-0">
                    {new Date(review.order_date || review.created_at).toLocaleDateString("es-GT", {
                      year:  "numeric",
                      month: "long",
                      day:   "numeric",
                    })}
                  </span>
                </div>

                {editingId === review.id ? (
                  <div className="space-y-3 rounded-xl border border-orange-100 bg-orange-50 p-4">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setDraftRating(star)}
                          className={`text-xl ${star <= draftRating ? "text-amber-400" : "text-gray-300"}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={draftComment}
                      onChange={(e) => setDraftComment(e.target.value)}
                      className="min-h-24 w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm text-gray-700"
                      maxLength={500}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        disabled={savingId === review.id}
                        onClick={() => submitEdit(review.id)}
                      >
                        Guardar cambios
                      </Button>
                      <Button variant="outline" onClick={() => setEditingId(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : review.comentario ? (
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100/50">
                    "{review.comentario}"
                  </p>
                ) : null}

                {review.seller_response?.respuesta && (
                  <div className="rounded-xl border border-sky-100 bg-sky-50 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">
                      Respuesta del vendedor
                    </p>
                    <p className="mt-1 text-sm text-sky-950">
                      {review.seller_response.respuesta}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {review.can_edit && review.estado === "published" && (
                    <Button variant="outline" className="rounded-xl" onClick={() => startEdit(review)}>
                      Editar
                    </Button>
                  )}
                  {review.can_delete && review.estado !== "deleted" && (
                    <Button
                      variant="outline"
                      className="rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                      disabled={savingId === review.id}
                      onClick={() => removeReview(review.id)}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>

                <Link
                  href={`/products/${review.producto_id}`}
                  className="text-xs text-orange-600 hover:underline self-start"
                >
                  Ver producto →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
