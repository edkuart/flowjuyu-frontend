// src/components/reviews/ReviewItem.tsx
// Pure display component — no client state needed
import type { Review } from "@/types/review"

/* ──────────────────────────────────────────
   STAR ROW
────────────────────────────────────────── */

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-[1px]" aria-label={`${rating} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`text-[13px] leading-none ${
            n <= rating ? "text-amber-400" : "text-neutral-200"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

/* ──────────────────────────────────────────
   DATE FORMATTER
────────────────────────────────────────── */

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("es-GT", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return iso
  }
}

/* ──────────────────────────────────────────
   COMPONENT
────────────────────────────────────────── */

export function ReviewItem({ review }: { review: Review }) {
  return (
    <div className="flex items-start gap-4 px-5 py-4 border-b border-neutral-100 last:border-0">

      {/* Avatar placeholder — first letter of product name */}
      <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-[11px] font-bold text-amber-500 uppercase leading-none">
          {review.producto_nombre.charAt(0)}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">

        {/* Product + stars on one line */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide truncate">
            {review.producto_nombre}
          </p>
          <StarRow rating={review.rating} />
        </div>

        {/* Comment */}
        {review.comentario && (
          <p className="text-sm text-neutral-700 leading-relaxed">
            {review.comentario}
          </p>
        )}

        {/* Date */}
        {review.created_at && (
          <p className="text-[11px] text-neutral-400">
            {formatDate(review.created_at)}
          </p>
        )}
      </div>
    </div>
  )
}
