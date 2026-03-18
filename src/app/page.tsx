// src/app/page.tsx

export const dynamic = "force-dynamic";

import { getHomeData } from "@/services/homeService";

import HeroSection from "@/components/home/HeroSection";
import TrendingSection from "@/components/home/TrendingSection";
import StoryBridgeSection from "@/components/home/StoryBridgeSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import NewProductsSection from "@/components/home/NewProductsSection";
import SellerHighlightSection from "@/components/home/SellerHighlightSection";
import SocialProofStrip from "@/components/home/SocialProofStrip";

/*
  Flujo de descubrimiento — diseñado como una narrativa, no como un catálogo:

  1. Hero            — primer impacto emocional + scroll hint
                       "Donde el hilo guarda memoria"

  2. Trending        — productos que generan confianza social
                       "Piezas que no se olvidan"

  3. StoryBridge     — pausa editorial. Sin productos, sin CTAs.
                       Rompe el ritmo de grid → grid → grid.
                       "Lo que ves aquí tardó días, semanas, a veces meses en nacer."

  4. Categories      — discovery tool por técnica y tradición
                       "Por tradición y técnica"

  5. New Products    — urgencia de novedad con contraste visual (dark)
                       "Recién salido del telar"

  6. SellerHighlight — el rostro humano del marketplace
                       "Conoce a quien las hace"

  7. SocialProof     — cierre de confianza. Valores verificables.
*/

export default async function HomePage(): Promise<React.ReactElement> {
  const {
    categorias,
    trendingProducts,
    nuevosProductos,
    tiendas,
  } = await getHomeData();

  return (
    <main>
      <HeroSection trendingProducts={trendingProducts} />
      <TrendingSection trendingProducts={trendingProducts} />
      <StoryBridgeSection />
      <CategoriesSection categorias={categorias} />
      <NewProductsSection nuevosProductos={nuevosProductos} />
      <SellerHighlightSection tiendas={tiendas} />
      <SocialProofStrip />
    </main>
  );
}
