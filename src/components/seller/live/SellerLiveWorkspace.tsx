"use client";

import { useEffect, useState } from "react";

import SellerLivePanel from "@/components/seller/live/SellerLivePanel";
import { BaseCard } from "@/components/ui/BaseCard";
import { BaseSection } from "@/components/ui/BaseSection";
import { BaseSectionHeading } from "@/components/ui/BaseSectionHeading";
import { apiFetch } from "@/lib/api";
import { apiGetVendedorPerfil } from "@/services/vendedorPerfil";
import type { SellerPerfil } from "@/lib/sellerProgress";

type SellerProduct = {
  id: string;
  nombre: string;
  precio?: number | string | null;
  activo?: boolean;
  descripcion?: string | null;
  imagenes?: Array<{ url?: string | null }>;
  imagen_url?: string | null;
  internal_code?: string | null;
};

type LiveWorkspaceProfile = SellerPerfil & {
  is_live?: boolean | null;
  live_started_at?: string | null;
  live_message?: string | null;
  live_featured_product_ids?: string[] | null;
  live_current_product_id?: string | null;
};

export function SellerLiveWorkspace() {
  const [loading, setLoading] = useState(true);
  const [sellerProducts, setSellerProducts] = useState<SellerProduct[]>([]);
  const [sellerProfile, setSellerProfile] = useState<LiveWorkspaceProfile | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, productsRes] = await Promise.all([
          apiGetVendedorPerfil().catch(() => null),
          apiFetch("/api/seller/products")
            .then(async (res) => {
              if (!res.ok) return [];
              const data = await res.json().catch(() => []);
              return Array.isArray(data) ? data : data.data || [];
            })
            .catch(() => []),
        ]);

        if (profileRes?.ok && profileRes.perfil) {
          setSellerProfile(profileRes.perfil);
        }

        setSellerProducts(productsRes);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 bg-[#f6f1e8] px-4 py-8">
      {loading ? (
        <div className="space-y-4">
          <div className="h-40 animate-pulse rounded-[28px] bg-white/70" />
          <div className="h-[540px] animate-pulse rounded-[28px] bg-white/70" />
        </div>
      ) : (
        <>
          <BaseSection>
            <BaseCard
              className="border border-[#0F3D3A]/10 bg-gradient-to-br from-[#0F3D3A] via-[#14544f] to-[#1b6b63] text-white"
              contentClassName="space-y-4"
            >
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  Live workspace
                </p>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Gestiona tu live en una sola vista
                </h1>
                <p className="max-w-3xl text-sm leading-relaxed text-white/80">
                  Desde aquí puedes activar el live, preparar el preview y elegir el producto que quieres fijar en la tienda pública mientras vendes.
                </p>
              </div>
            </BaseCard>
          </BaseSection>

          <BaseSection>
            <BaseSectionHeading
              eyebrow="Live"
              title="Centro de control del live"
              description="Controla tu estado en vivo, el mensaje, los productos destacados y la pieza que quieres vender ahora mismo."
            />
            <SellerLivePanel
              isLive={Boolean(sellerProfile?.is_live)}
              liveStartedAt={sellerProfile?.live_started_at ?? null}
              liveMessage={sellerProfile?.live_message ?? null}
              liveFeaturedProductIds={sellerProfile?.live_featured_product_ids ?? []}
              liveCurrentProductId={sellerProfile?.live_current_product_id ?? null}
              products={sellerProducts}
              onStateChange={({ is_live, live_started_at }) => {
                setSellerProfile((current) =>
                  current
                    ? {
                        ...current,
                        is_live,
                        live_started_at,
                      }
                    : current,
                );
              }}
              onConfigSave={({
                live_message,
                live_featured_product_ids,
                live_current_product_id,
              }) => {
                setSellerProfile((current) =>
                  current
                    ? {
                        ...current,
                        live_message,
                        live_featured_product_ids,
                        live_current_product_id,
                      }
                    : current,
                );
              }}
            />
          </BaseSection>
        </>
      )}
    </main>
  );
}
