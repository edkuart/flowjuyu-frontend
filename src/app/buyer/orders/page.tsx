"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Star } from "lucide-react";

import RecommendedSection from "@/components/home/RecommendedSection";
import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";
import { apiFetch } from "@/lib/api";

type PendingReview = {
  order_id: number;
  order_item_id: number;
  product_id: string;
  product_name: string;
  seller_id: number;
  order_date: string;
};

export default function BuyerOrdersPage() {
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);
  const [pending, setPending] = useState<PendingReview[]>([]);

  useEffect(() => {
    apiFetch("/api/buyer/reviews/pending")
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        setPending(json.pending ?? []);
      })
      .catch(() => {});
  }, []);

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

      {pending.length > 0 && (
        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-amber-900">
              Pendientes de reseña
            </h2>
          </div>
          <div className="space-y-3">
            {pending.slice(0, 4).map((item) => (
              <div
                key={item.order_item_id}
                className="flex flex-col gap-3 rounded-xl border border-amber-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Compra completada el {new Date(item.order_date).toLocaleDateString("es-GT")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                    Pendiente de reseña
                  </span>
                  <Link
                    href={`/products/${item.product_id}#reviews`}
                    className="text-sm font-medium text-orange-600 hover:underline"
                  >
                    Reseñar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
