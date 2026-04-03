"use client";

import Link from "next/link";
import { Package } from "lucide-react";

import RecommendedSection from "@/components/home/RecommendedSection";
import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";

export default function BuyerOrdersPage() {
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {tr("empty.ordersPageTitle")}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {tr("empty.ordersPageSubtitle")}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-[#faf9f7] px-6 py-16 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-50 to-amber-100 shadow-inner">
          <Package className="h-9 w-9 text-orange-400" strokeWidth={1.5} />
        </div>

        <h2 className="mb-2 text-xl font-semibold text-gray-800">
          {tr("empty.noOrdersTitle")}
        </h2>
        <p className="max-w-xs text-sm leading-relaxed text-gray-500">
          {tr("empty.noOrdersDescription")}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-lg bg-[#0d2d20] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0d2d20]/90"
          >
            {tr("empty.exploreProducts")}
          </Link>
          <Link
            href="/buyer/favorites"
            className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            {tr("empty.viewFavorites")}
          </Link>
        </div>
      </div>

      <div className="-mx-4 mt-10 md:-mx-8">
        <RecommendedSection />
      </div>
    </div>
  );
}
