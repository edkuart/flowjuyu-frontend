"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { ProductReview } from "@/types/review";
import { ReviewList } from "./ReviewList";

type PublicReviewListProps = {
  sellerId: number;
  limit?: number;
};

function sanitizePublicReview(review: ProductReview): ProductReview {
  return {
    id: review.id,
    producto_id: review.producto_id ?? review.product_id,
    producto_nombre: review.producto_nombre ?? null,
    rating: review.rating,
    comentario: review.comentario ?? null,
    buyer_nombre: review.buyer_nombre,
    verified_purchase: Boolean(review.verified_purchase),
    order_date: review.order_date ?? null,
    created_at: review.created_at,
    seller_response: review.seller_response ?? null,
  };
}

export function PublicReviewList({
  sellerId,
  limit = 6,
}: PublicReviewListProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/reviews/seller/${sellerId}?limit=${limit}`);
      if (!res.ok) {
        setReviews([]);
        return;
      }

      const data = await res.json().catch(() => []);
      const safeReviews = Array.isArray(data)
        ? data.map((review) => sanitizePublicReview(review as ProductReview))
        : [];

      setReviews(safeReviews);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [limit, sellerId]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-10 text-center">
        <p className="text-sm text-neutral-500">Cargando reseñas publicadas…</p>
      </div>
    );
  }

  return (
    <ReviewList
      reviews={reviews}
      title="Reseñas de clientes"
      emptyTitle="Aún no hay reseñas publicadas"
      emptyDescription="Cuando tus compradores compartan su experiencia, esta sección se verá igual que en tu tienda pública."
    />
  );
}
