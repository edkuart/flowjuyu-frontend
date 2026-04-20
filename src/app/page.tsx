// src/app/page.tsx

export const dynamic = "force-dynamic";

import { fetchHomeCatalog, fetchTrendingProducts } from "@/services/homeService";

import HeroSection            from "@/components/home/HeroSection";
import LiveNowSection         from "@/components/home/LiveNowSection";
import TrendingSection        from "@/components/home/TrendingSection";
import StoryBridgeSection     from "@/components/home/StoryBridgeSection";
import CategoriesSection      from "@/components/home/CategoriesSection";
import NewProductsSection     from "@/components/home/NewProductsSection";
import SellerHighlightSection from "@/components/home/SellerHighlightSection";
import SocialProofStrip       from "@/components/home/SocialProofStrip";
import RecommendedSection     from "@/components/home/RecommendedSection";

/*
  Flujo de descubrimiento — diseñado como una narrativa, no como un catálogo:

  1. Hero            — primer impacto emocional + scroll hint         [CRITICAL — server fetch]
  2. Trending        — productos que generan confianza social          [CRITICAL — server fetch]
  3. StoryBridge     — pausa editorial, sin datos
  4. SellerHighlight — el rostro humano del marketplace (moved up)    [deferred — client fetch]
  5. New Products    — urgencia de novedad                             [deferred — client fetch]
  6. Recommended     — más piezas / personalized para auth user        [deferred — client fetch]
  7. Categories      — discovery tool (moved down)                    [deferred — client fetch]
  8. SocialProof     — cierre de confianza, sin datos
*/

export default async function HomePage(): Promise<React.ReactElement> {
  // Only fetch above-the-fold data server-side.
  // Everything below the fold self-fetches client-side after mount.
  const homeCatalog = await fetchHomeCatalog();
  const fallbackTrendingProducts = await fetchTrendingProducts();
  const featuredProducts =
    homeCatalog?.sections.featured.items?.length
      ? homeCatalog.sections.featured.items
      : fallbackTrendingProducts;
  const trendingProducts =
    homeCatalog?.sections.trending.items?.length
      ? homeCatalog.sections.trending.items
      : fallbackTrendingProducts;
  const newArrivalProducts = homeCatalog?.sections.new_arrivals.items ?? [];

  console.log("[HomePage] home sections", {
    featured: featuredProducts.map((p) => p.id),
    newArrivals: newArrivalProducts.map((p) => p.id),
    trending: trendingProducts.map((p) => p.id),
  });

  return (
    <main>
      <HeroSection featuredProducts={featuredProducts} />
      <LiveNowSection />
      <TrendingSection trendingProducts={trendingProducts} />
      <StoryBridgeSection />
      <SellerHighlightSection />
      <NewProductsSection initialProducts={newArrivalProducts} />
      <RecommendedSection />
      <CategoriesSection />
      <SocialProofStrip />
    </main>
  );
}
