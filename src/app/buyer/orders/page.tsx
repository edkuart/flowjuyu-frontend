"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import RecommendedSection from "@/components/home/RecommendedSection";

export default function BuyerOrdersPage() {
  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pedidos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Aquí podrás ver el estado y el historial de tus compras.
        </p>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-16 px-6 bg-[#faf9f7] rounded-2xl border border-gray-100 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center mb-6 shadow-inner">
          <Package className="w-9 h-9 text-orange-400" strokeWidth={1.5} />
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Aún no tienes pedidos
        </h2>
        <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
          Cuando compres una pieza, aquí aparecerá tu historial.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Link
            href="/"
            className="px-5 py-2.5 bg-[#0d2d20] text-white text-sm font-medium rounded-lg hover:bg-[#0d2d20]/90 transition-colors"
          >
            Explorar productos
          </Link>
          <Link
            href="/buyer/favorites"
            className="px-5 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Ver favoritos
          </Link>
        </div>
      </div>

      {/* Discovery section */}
      <div className="-mx-4 md:-mx-8 mt-10">
        <RecommendedSection />
      </div>
    </div>
  );
}
