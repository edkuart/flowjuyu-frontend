"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/context/useLanguage";
import { createT } from "@/i18n/utils/t";
import esDictionary from "@/i18n/dictionaries/es";

interface Review {
  id: string;
  rating: number;
  comentario: string | null;
  created_at: string;
  buyer_nombre: string;
  verified_purchase: boolean;
  order_date: string | null;
  helpful_count?: number;
  review_signal?: {
    quality_score: number;
    trust_score: number;
  } | null;
  seller_response?: {
    respuesta: string;
  } | null;
}

interface ReviewsData {
  reviews: Review[];
  rating_avg: number;
  rating_count: number;
  breakdown?: Record<string, number>;
}

type ReviewSort = "newest" | "highest_rating" | "lowest_rating" | "most_helpful";

function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-sm";
  return (
    <div className={`flex text-yellow-400 ${cls}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < Math.round(rating) ? "★" : "☆"}</span>
      ))}
    </div>
  );
}

function RatingDistribution({
  total,
  breakdown,
}: {
  total: number;
  breakdown?: Record<string, number>;
}) {
  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((stars) => {
        const count = breakdown?.[String(stars)] ?? 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={stars} className="flex items-center gap-2 text-sm">
            <span className="text-neutral-500 w-3 text-right text-xs">{stars}</span>
            <span className="text-yellow-400 text-xs">★</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-neutral-400 w-4 text-xs text-right">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function StarSelector({
  value,
  onChange,
  labels,
}: {
  value: number;
  onChange: (v: number) => void;
  labels: string[];
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const star = i + 1;
          const filled = star <= (hovered || value);
          return (
            <button
              key={star}
              type="button"
              className={`text-3xl transition-colors ${
                filled ? "text-yellow-400" : "text-gray-200"
              } hover:text-yellow-400`}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => onChange(star)}
              aria-label={`${star} ${labels[star - 1] ?? ""}`}
            >
              ★
            </button>
          );
        })}
      </div>
      <p className="text-xs mt-1.5 h-4 text-amber-600 font-medium">
        {hovered > 0 ? labels[hovered - 1] : value > 0 ? labels[value - 1] : ""}
      </p>
    </div>
  );
}

function ReviewCard({
  review,
  verifiedLabel,
  onVote,
}: {
  review: Review;
  verifiedLabel: string;
  onVote: (reviewId: string) => void;
}) {
  const formattedDate = new Date(review.order_date || review.created_at).toLocaleDateString("es-GT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const initial = (review.buyer_nombre || "C").charAt(0).toUpperCase();

  return (
    <div className="border border-neutral-100 rounded-2xl p-5 bg-white shadow-sm space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">
            {initial}
          </div>
          <div>
            <p className="font-semibold text-neutral-800 text-sm leading-none">
              {review.buyer_nombre || verifiedLabel}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {review.verified_purchase && (
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  {verifiedLabel}
                </span>
              )}
              <p className="text-xs text-neutral-400">{formattedDate}</p>
            </div>
          </div>
        </div>
        <StarDisplay rating={review.rating} size="sm" />
      </div>
      {review.comentario && (
        <p className="text-neutral-600 text-sm leading-relaxed border-t border-neutral-50 pt-3">
          {review.comentario}
        </p>
      )}
      {review.seller_response?.respuesta && (
        <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">
            Respuesta del vendedor
          </p>
          <p className="mt-1 text-sm leading-relaxed text-sky-950">
            {review.seller_response.respuesta}
          </p>
        </div>
      )}
      <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
        <button
          type="button"
          onClick={() => onVote(review.id)}
          className="text-sm font-medium text-neutral-600 transition-colors hover:text-orange-600"
        >
          ¿Te fue útil esta reseña?
        </button>
        <span className="text-xs text-neutral-400">
          {review.helpful_count ?? 0} voto{(review.helpful_count ?? 0) === 1 ? "" : "s"} útiles
        </span>
      </div>
    </div>
  );
}

type EligibilityReason = "no_purchase" | "already_reviewed" | "not_authenticated" | "error";

interface EligibilityState {
  loading:  boolean;
  eligible: boolean;
  reason?:  EligibilityReason;
}

export default function ProductReviews({ productId }: { productId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  const starLabels = tr("pdp.starLabels").split(",");

  const [data, setData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [eligibility, setEligibility] = useState<EligibilityState>({ loading: false, eligible: false });
  const [sort, setSort] = useState<ReviewSort>("newest");
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/products/${productId}/reviews?sort=${sort}`);
      if (!res.ok) {
        setData({ reviews: [], rating_avg: 0, rating_count: 0 });
        return;
      }
      const json = await res.json();
      setData({
        reviews:      json.reviews ?? [],
        rating_avg:   json.rating_avg ?? 0,
        rating_count: json.rating_count ?? 0,
        breakdown:    json.breakdown ?? undefined,
      });
    } catch {
      setData({ reviews: [], rating_avg: 0, rating_count: 0 });
    } finally {
      setLoading(false);
    }
  }, [productId, sort]);

  // Check eligibility whenever the authenticated user changes.
  // Only buyers need this — sellers and guests skip the call.
  const checkEligibility = useCallback(async () => {
    if (!user || (user as any).role !== "buyer") {
      setEligibility({ loading: false, eligible: false });
      return;
    }

    setEligibility({ loading: true, eligible: false });
    try {
      const res = await apiFetch(`/api/products/${productId}/reviews/eligibility`);
      if (!res.ok) {
        setEligibility({ loading: false, eligible: false, reason: "error" });
        return;
      }
      const json = await res.json();
      setEligibility({ loading: false, eligible: json.eligible ?? false, reason: json.reason });
    } catch {
      setEligibility({ loading: false, eligible: false, reason: "error" });
    }
  }, [productId, user]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);
  useEffect(() => { checkEligibility(); }, [checkEligibility]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    if (rating === 0) {
      setFormError(tr("pdp.reviewsRatingRequired"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        body: JSON.stringify({ rating, comentario }),
      });

      if (res.status === 401) { setFormError(tr("pdp.reviewsSession401")); return; }
      if (res.status === 403) { setFormError(tr("pdp.reviewsRole403")); return; }
      if (res.status === 409) { setFormError("Ya dejaste una reseña para este producto"); return; }
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setFormError(json.message || tr("pdp.reviewsErrorGeneric"));
        return;
      }

      setRating(0);
      setComentario("");
      setFormSuccess(true);
      // Re-check eligibility so the form hides (already_reviewed state)
      checkEligibility();
      await fetchReviews();
    } catch {
      setFormError(tr("pdp.reviewsErrorNetwork"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVote(reviewId: string) {
    const previous = data;
    if (previous) {
      setData({
        ...previous,
        reviews: previous.reviews.map((review) =>
          review.id === reviewId
            ? { ...review, helpful_count: (review.helpful_count ?? 0) + 1 }
            : review
        ),
      });
    }

    try {
      const res = await apiFetch(`/api/reviews/${reviewId}/vote`, { method: "POST" });
      if (res.status === 409) {
        const undo = await apiFetch(`/api/reviews/${reviewId}/vote`, { method: "DELETE" });
        if (!undo.ok) throw new Error("No se pudo actualizar el voto");
      } else if (!res.ok) {
        throw new Error("No se pudo registrar el voto");
      }
      await fetchReviews();
    } catch {
      setData(previous);
    }
  }

  return (
    <section id="reviews" className="space-y-8 scroll-mt-8">

      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-neutral-900">
          {tr("pdp.reviewsSectionTitle")}
        </h2>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as ReviewSort)}
          className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600"
        >
          <option value="newest">Más recientes</option>
          <option value="most_helpful">Más útiles</option>
          <option value="highest_rating">Mejor calificadas</option>
          <option value="lowest_rating">Peor calificadas</option>
        </select>
        {!loading && data && data.rating_count > 0 && (
          <span className="text-sm text-neutral-400 font-normal">
            ({data.rating_count}{" "}
            {data.rating_count === 1 ? tr("pdp.review") : tr("pdp.reviews")})
          </span>
        )}
      </div>

      {!loading && data && data.rating_count > 0 && (
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center bg-amber-50 border border-amber-100 rounded-2xl p-6">
          <div className="text-center flex-shrink-0">
            <p className="text-6xl font-black text-neutral-900 leading-none">
              {data.rating_avg.toFixed(1)}
            </p>
            <StarDisplay rating={data.rating_avg} size="lg" />
            <p className="text-xs text-neutral-400 mt-1">
              {tr("pdp.reviewsBasedOn")} {data.rating_count}{" "}
              {data.rating_count === 1 ? tr("pdp.review") : tr("pdp.reviews")}
            </p>
          </div>
          <div className="hidden sm:block w-px h-20 bg-amber-200" />
          <div className="flex-1 w-full">
            <RatingDistribution total={data.rating_count} breakdown={data.breakdown} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Reviews list */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : !data || data.reviews.length === 0 ? (
            <div className="border border-dashed border-neutral-200 rounded-2xl p-10 text-center bg-gray-50">
              <p className="text-4xl mb-3">✍️</p>
              <p className="font-semibold text-neutral-600">{tr("pdp.reviewsNoReviews")}</p>
              <p className="text-sm text-neutral-400 mt-1">{tr("pdp.reviewsBeFirst")}</p>
            </div>
          ) : (
            data.reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                verifiedLabel={tr("pdp.reviewsVerifiedBuyer")}
                onVote={handleVote}
              />
            ))
          )}
        </div>

        {/* Review form — auth + purchase gated */}
        <div className="lg:col-span-1">
          {!user ? (
            /* ── Guest ──────────────────────────────────────────────── */
            <div className="border border-yellow-200 rounded-2xl p-6 bg-yellow-50 space-y-5 sticky top-6">
              <div className="text-center space-y-2">
                <p className="text-3xl">✨</p>
                <h3 className="font-bold text-neutral-800 text-lg leading-snug">
                  {tr("pdp.reviewsGuestTitle")}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {tr("pdp.reviewsGuestSub")}
                </p>
              </div>
              <div className="space-y-2.5">
                <Button
                  className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-bold"
                  onClick={() => router.push("/login")}
                >
                  {tr("pdp.reviewsGuestLogin")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-10 font-semibold border-neutral-300 text-neutral-700"
                  onClick={() => router.push("/register")}
                >
                  {tr("pdp.reviewsGuestRegister")}
                </Button>
              </div>
              <p className="text-xs text-neutral-400 text-center leading-relaxed">
                {tr("pdp.reviewsGuestFooter")}
              </p>
            </div>

          ) : eligibility.loading ? (
            /* ── Checking eligibility ──────────────────────────────── */
            <div className="border border-neutral-100 rounded-2xl p-6 bg-white shadow-md shadow-neutral-100 sticky top-6">
              <div className="h-32 animate-pulse bg-gray-100 rounded-xl" />
            </div>

          ) : eligibility.eligible ? (
            /* ── Eligible buyer — show form ────────────────────────── */
            <div className="border border-neutral-100 rounded-2xl p-6 bg-white shadow-md shadow-neutral-100 space-y-5 sticky top-6">
              <div>
                <h3 className="font-bold text-neutral-800 text-lg">
                  {tr("pdp.reviewsWriteTitle")}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {tr("pdp.reviewsWriteSub")}
                </p>
              </div>

              {formSuccess && (
                <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-700 text-sm font-medium flex items-center gap-2">
                  <span>✔</span>
                  {tr("pdp.reviewsSuccess")}
                </div>
              )}

              {formError && (
                <div className="rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-3 text-yellow-800 text-sm">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">
                    {tr("pdp.reviewsRatingLabel")}
                  </label>
                  <StarSelector value={rating} onChange={setRating} labels={starLabels} />
                </div>

                <div>
                  <label
                    htmlFor="comentario"
                    className="block text-sm font-semibold text-neutral-700 mb-2"
                  >
                    {tr("pdp.reviewsCommentLabel")}{" "}
                    <span className="text-neutral-400 font-normal">
                      ({tr("common.optional")})
                    </span>
                  </label>
                  <textarea
                    id="comentario"
                    rows={4}
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder={tr("pdp.reviewsCommentPlaceholder")}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none bg-gray-50 focus:bg-white transition-colors"
                    maxLength={500}
                  />
                  <p className="text-xs text-neutral-400 mt-1 text-right">
                    {comentario.length}/500
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-sm shadow-orange-100"
                >
                  {submitting ? tr("pdp.reviewsSubmitting") : tr("pdp.reviewsPublish")}
                </Button>
              </form>
            </div>

          ) : eligibility.reason === "already_reviewed" ? (
            /* ── Already reviewed ──────────────────────────────────── */
            <div className="border border-green-200 rounded-2xl p-6 bg-green-50 space-y-3 sticky top-6 text-center">
              <p className="text-3xl">✅</p>
              <p className="font-semibold text-neutral-800 text-sm">
                Ya dejaste tu opinión sobre este producto.
              </p>
              <p className="text-xs text-neutral-400">
                Gracias por ayudar a la comunidad Flowjuyu.
              </p>
            </div>

          ) : (
            /* ── Not eligible (no purchase) ────────────────────────── */
            <div className="border border-neutral-100 rounded-2xl p-6 bg-gray-50 space-y-3 sticky top-6 text-center">
              <p className="text-3xl">🛒</p>
              <p className="font-semibold text-neutral-700 text-sm">
                Solo puedes reseñar productos que hayas comprado.
              </p>
              <p className="text-xs text-neutral-400">
                Después de recibir tu pedido, podrás compartir tu experiencia.
              </p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
