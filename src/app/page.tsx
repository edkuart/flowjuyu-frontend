// src/app/page.tsx

import { getHomeData } from "@/services/homeService";

import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import TrendingSection from "@/components/home/TrendingSection";
import NewProductsSection from "@/components/home/NewProductsSection";
import ShopsSection from "@/components/home/ShopsSection";
import SellerCTASection from "@/components/home/SellerCTASection";

export default async function HomePage(): Promise<React.ReactElement> {
  const {
    categorias,
    trendingProducts,
    nuevosProductos,
    tiendas,
  } = await getHomeData();

  return (
    <main className="pb-10 space-y-12">

      <HeroSection trendingProducts={trendingProducts} />

      <CategoriesSection categorias={categorias} />

      <TrendingSection trendingProducts={trendingProducts} />

      <NewProductsSection nuevosProductos={nuevosProductos} />

      <ShopsSection tiendas={tiendas} />

      <SellerCTASection />

    </main>
  );
}
