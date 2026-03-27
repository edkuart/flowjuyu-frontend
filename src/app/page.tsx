// src/app/page.tsx

export const dynamic = "force-dynamic";

import { fetchTrendingProducts } from "@/services/homeService";

import HeroSection            from "@/components/home/HeroSection";
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
  4. Categories      — discovery tool                                  [deferred — client fetch]
  5. New Products    — urgencia de novedad                             [deferred — client fetch]
  6. Recommended     — personalizado para usuario autenticado          [deferred — client fetch]
  7. SellerHighlight — el rostro humano del marketplace                [deferred — client fetch]
  8. SocialProof     — cierre de confianza, sin datos
*/

export default async function HomePage(): Promise<React.ReactElement> {
  // Only fetch above-the-fold data server-side.
  // Everything below the fold self-fetches client-side after mount.
  const trendingProducts = await fetchTrendingProducts();

  console.log(`[HomePage] trendingProducts → ${trendingProducts.length} items`);

  return (
    <main>
      <HeroSection trendingProducts={trendingProducts} />
      <TrendingSection trendingProducts={trendingProducts} />
      <StoryBridgeSection />
      <CategoriesSection />
      <NewProductsSection />
      <RecommendedSection />
      <SellerHighlightSection />
      <SocialProofStrip />
    </main>
  );
}
