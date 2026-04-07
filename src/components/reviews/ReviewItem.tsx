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

function formatVerifiedDate(iso?: string | null): string | null {
  if (!iso) return null
  return formatDate(iso)
}

/* ──────────────────────────────────────────
   COMPONENT
────────────────────────────────────────── */

export function ReviewItem({ review }: { review: Review }) {
  const displayDate = formatVerifiedDate(review.order_date ?? review.created_at)
  const buyerInitial = (review.buyer_nombre || review.producto_nombre || "R").charAt(0)

  return (
    <div className="flex items-start gap-4 px-5 py-4 border-b border-neutral-100 last:border-0">

      {/* Avatar placeholder */}
      <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-[11px] font-bold text-amber-500 uppercase leading-none">
          {buyerInitial}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">

        {/* Product + stars on one line */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="min-w-0">
            {review.producto_nombre ? (
              <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide truncate">
                {review.producto_nombre}
              </p>
            ) : null}
            <p className="text-sm font-semibold text-neutral-800 truncate">
              {review.buyer_nombre}
            </p>
          </div>
          <StarRow rating={review.rating} />
        </div>

        {review.verified_purchase && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
              Compra verificada
            </span>
            {displayDate && (
              <span className="text-[11px] text-neutral-400">
                Compra: {displayDate}
              </span>
            )}
          </div>
        )}

        {/* Comment */}
        {review.comentario && (
          <p className="text-sm text-neutral-700 leading-relaxed">
            {review.comentario}
          </p>
        )}

        {review.seller_response?.respuesta && (
          <div className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">
              Respuesta del vendedor
            </p>
            <p className="mt-1 text-sm leading-relaxed text-sky-900">
              {review.seller_response.respuesta}
            </p>
          </div>
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
