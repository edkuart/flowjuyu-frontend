// src/components/reviews/ReviewList.tsx
import type { Review } from "@/types/review"
import { ReviewItem } from "./ReviewItem"

/* ──────────────────────────────────────────
   HELPERS
────────────────────────────────────────── */

function avg(reviews: Review[]): number {
  if (reviews.length === 0) return 0
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
}

function AvgStars({ rating }: { rating: number }) {
  const filled = Math.round(rating)
  return (
    <div className="flex gap-[2px]" aria-label={`${rating.toFixed(1)} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`text-sm leading-none ${
            n <= filled ? "text-amber-400" : "text-neutral-200"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

/* ──────────────────────────────────────────
   COMPONENT
────────────────────────────────────────── */

export interface ReviewListProps {
  reviews: Review[]
  title?: string
  emptyTitle?: string
  emptyDescription?: string
}

export function ReviewList({
  reviews,
  title = "Reseñas de tus clientes",
  emptyTitle = "Aún no tienes reseñas",
  emptyDescription = "Las reseñas de tus clientes aparecerán aquí una vez que recibas tu primera calificación",
}: ReviewListProps) {

  /* ── Empty state ── */
  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-10 text-center space-y-2">
        <p className="text-3xl text-neutral-200 leading-none">★</p>
        <p className="text-sm font-semibold text-neutral-500">{emptyTitle}</p>
        <p className="text-xs text-neutral-400 leading-snug">
          {emptyDescription}
        </p>
      </div>
    )
  }

  const score  = avg(reviews)
  const count  = reviews.length
  const plural = count === 1 ? "reseña" : "reseñas"

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">

      {/* ── Header ── */}
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between gap-4">
        <p className="text-sm font-bold text-neutral-800">{title}</p>

        {/* Score summary */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <AvgStars rating={score} />
          <span className="text-sm font-black text-neutral-800 tabular-nums">
            {score.toFixed(1)}
          </span>
          <span className="text-xs text-neutral-400">
            · {count} {plural}
          </span>
        </div>
      </div>

      {/* ── List ── */}
      <div>
        {reviews.map((r) => (
          <ReviewItem key={r.id} review={r} />
        ))}
      </div>
    </div>
  )
}
