"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

import ArtisanCard from "@/components/product/ArtisanCard";
import { useAuth } from "@/context/AuthContext";
import { useRecommendedProducts } from "@/hooks/useRecommendedProducts";
import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] rounded-sm bg-[#0d2d20]/8" />
          <div className="mt-3 space-y-2 px-0.5">
            <div className="h-3 w-3/4 rounded bg-[#0d2d20]/8" />
            <div className="h-3 w-1/2 rounded bg-[#0d2d20]/8" />
          </div>
        </div>
      ))}
    </div>
  );
}

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

  if (!user) return null;
  if (done && products.length === 0) return null;

  return (
    <section className="bg-[#faf7f2] py-16 md:py-20">
      <div className="mx-auto max-w-7xl space-y-10 px-4 md:px-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.25em] text-[#0d2d20] uppercase opacity-80">
              <Sparkles className="h-3.5 w-3.5" />
              {personalized
                ? tr("home.recommendedPersonalizedEyebrow")
                : tr("home.recommendedFallbackEyebrow")}
            </p>
            <h2 className="text-3xl leading-tight font-semibold tracking-tight text-neutral-900 md:text-4xl">
              {personalized
                ? tr("home.recommendedPersonalizedTitle")
                : tr("home.recommendedFallbackTitle")}
            </h2>
            <div className="h-[2px] w-16 rounded-full bg-gradient-to-r from-[#0d2d20] via-[#d97706] to-[#0d2d20]" />
          </div>

          {products.length > 0 && (
            <Link
              href="/productos"
              className="text-sm font-semibold tracking-wide text-[#0d2d20] transition-colors hover:opacity-70"
            >
              {tr("home.recommendedLink")} →
            </Link>
          )}
        </div>

        <div className="h-px bg-gradient-to-r from-[#0d2d20]/20 to-transparent" />

        {loading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {products.slice(0, 8).map((p) => (
              <ArtisanCard key={p.id} product={p} signal="none" />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
