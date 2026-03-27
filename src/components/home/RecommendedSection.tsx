"use client";

// src/components/home/RecommendedSection.tsx
//
// Shows personalized product recommendations for authenticated users.
// Fetches client-side because the JWT lives in localStorage.
// Renders nothing for unauthenticated visitors.

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRecommendedProducts } from "@/hooks/useRecommendedProducts";
import ArtisanCard from "@/components/product/ArtisanCard";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] rounded-sm bg-[#0d2d20]/8" />
          <div className="mt-3 space-y-2 px-0.5">
            <div className="h-3 bg-[#0d2d20]/8 rounded w-3/4" />
            <div className="h-3 bg-[#0d2d20]/8 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function RecommendedSection() {
  const { user } = useAuth();
  const { data: products, loading, personalized, done } = useRecommendedProducts();

  if (!user) return null;
  if (done && products.length === 0) return null;

  return (
    <section className="bg-[#faf7f2] py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 md:px-12 space-y-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-4">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-[#0d2d20] opacity-80">
              <Sparkles className="w-3.5 h-3.5" />
              {personalized
                ? "Basado en tus gustos y favoritos"
                : "Lo más valorado del catálogo"}
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-neutral-900">
              {personalized ? "Recomendados para ti" : "Piezas destacadas"}
            </h2>
            <div className="h-[2px] w-16 bg-gradient-to-r from-[#0d2d20] via-[#d97706] to-[#0d2d20] rounded-full" />
          </div>

          {products.length > 0 && (
            <Link
              href="/productos"
              className="text-sm font-semibold tracking-wide text-[#0d2d20] hover:opacity-70 transition-colors"
            >
              Ver catálogo completo →
            </Link>
          )}
        </div>

        <div className="h-px bg-gradient-to-r from-[#0d2d20]/20 to-transparent" />

        {/* Grid */}
        {loading ? (
          <SkeletonGrid />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.slice(0, 8).map((p) => (
              <ArtisanCard key={p.id} product={p} signal="none" />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
