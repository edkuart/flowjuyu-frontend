"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

import ProductCardV2 from "@/components/product/ProductCardV2";
import { PRODUCT_GRID } from "@/components/product/productGrid.config";
import { useAuth } from "@/context/AuthContext";
import { useRecommendedProducts } from "@/hooks/useRecommendedProducts";
import { useNewProducts } from "@/hooks/useNewProducts";
import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] rounded-sm bg-[#0d2d20]/8" />
          <div className="mt-3 space-y-2 px-0.5">
            <div className="h-3 w-3/4 rounded bg-[#0d2d20]/8" />
            <div className="h-3 w-1/2 rounded bg-[#0d2d20]/8" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Guest fallback: shows new products to all non-authenticated visitors ──
function GuestProductsSection() {
  const { data: newProducts, loading } = useNewProducts();
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  // Show at most 8 products from the already-cached new products list
  const products = newProducts.slice(0, 8);

  if (loading && products.length === 0) {
    return (
      <section className="relative bg-[#f3f0e8] py-20 md:py-24">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#0d2d20]/12 to-transparent" />
        <div className="mx-auto max-w-7xl space-y-10 px-4 md:px-12">
          <SkeletonGrid />
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="relative bg-[#f3f0e8] py-20 md:py-24">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#0d2d20]/12 to-transparent" />
      <div className="mx-auto max-w-7xl space-y-10 px-4 md:px-12">

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#0d2d20] opacity-80">
              <span className="text-[#d4a853] mr-2" aria-hidden>✦</span>
              {tr("home.trendingEyebrow")}
            </p>
            <h2 className="font-serif italic text-[2rem] md:text-[2.75rem] leading-[1.05] tracking-[-0.02em] text-neutral-900">
              Piezas que no te puedes perder
            </h2>
            <div className="h-[2px] w-16 rounded-full bg-gradient-to-r from-[#0d2d20] via-[#d97706] to-[#0d2d20]" />
          </div>
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.26em] text-[#0d2d20]/60 hover:text-[#0d2d20] transition-colors"
          >
            Ver catálogo <span>→</span>
          </Link>
        </div>

        <div className="h-px bg-gradient-to-r from-[#0d2d20]/20 to-transparent" />

        <div className={PRODUCT_GRID.home}>
          {products.map((p) => (
            <ProductCardV2 key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Authenticated: personalized recommendations ──
export default function RecommendedSection() {
  const { user } = useAuth();
  const {
    data: products,
    loading,
    personalized,
    done,
  } = useRecommendedProducts();
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  // Guest visitors: show fallback public section instead of nothing
  if (!user) return <GuestProductsSection />;

  if (done && products.length === 0) return null;

  return (
    <section className="relative bg-[#f3f0e8] py-20 md:py-24">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#0d2d20]/12 to-transparent" />
      <div className="mx-auto max-w-7xl space-y-10 px-4 md:px-12">

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <p className="flex items-center gap-2 text-[10px] font-medium tracking-[0.28em] text-[#0d2d20] uppercase opacity-80">
              <Sparkles className="h-3.5 w-3.5" />
              {personalized
                ? tr("home.recommendedPersonalizedEyebrow")
                : tr("home.recommendedFallbackEyebrow")}
            </p>
            <h2 className="font-serif italic text-[2rem] md:text-[2.75rem] leading-[1.05] tracking-[-0.02em] text-neutral-900">
              {personalized
                ? tr("home.recommendedPersonalizedTitle")
                : tr("home.recommendedFallbackTitle")}
            </h2>
            <div className="h-[2px] w-16 rounded-full bg-gradient-to-r from-[#0d2d20] via-[#d97706] to-[#0d2d20]" />
          </div>

          {products.length > 0 && (
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.26em] text-[#0d2d20]/60 hover:text-[#0d2d20] transition-colors"
            >
              {tr("home.recommendedLink")} <span>→</span>
            </Link>
          )}
        </div>

        <div className="h-px bg-gradient-to-r from-[#0d2d20]/20 to-transparent" />

        {loading ? (
          <SkeletonGrid />
        ) : (
          <div className={PRODUCT_GRID.home}>
            {products.slice(0, 8).map((p) => (
              <ProductCardV2 key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
