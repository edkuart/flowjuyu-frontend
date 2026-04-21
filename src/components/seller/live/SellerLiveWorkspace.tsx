"use client";

import { useEffect, useState } from "react";

import LiveToggleCard from "@/components/seller/dashboard/LiveToggleCard";
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

type SellerCollection = {
  id: number;
  name: string;
  status?: string;
  item_count?: number;
};

type LiveWorkspaceProfile = SellerPerfil & {
  user_id?: number | null;
  is_live?: boolean | null;
  live_started_at?: string | null;
  live_message?: string | null;
  live_featured_product_ids?: string[] | null;
  live_collection_id?: number | null;
  live_external_url?: string | null;
  live_platform?: "tiktok" | "instagram" | "facebook" | null;
};

type LiveExternalPreview = {
  title?: string | null;
  description?: string | null;
  image_url?: string | null;
  site_name?: string | null;
  canonical_url?: string | null;
};

type LiveViewerStats = {
  total: number;
  buyers: number;
  guests: number;
  internal: number;
};

type LiveEngagementStats = {
  externalClicksTotal: number;
  externalClicksLast24h: number;
  productClicksTotal: number;
  whatsappClicksTotal: number;
};

export function SellerLiveWorkspace() {
  const [loading, setLoading] = useState(true);
  const [sellerProducts, setSellerProducts] = useState<SellerProduct[]>([]);
  const [sellerCollections, setSellerCollections] = useState<SellerCollection[]>([]);
  const [sellerProfile, setSellerProfile] = useState<LiveWorkspaceProfile | null>(null);
  const [viewerStats, setViewerStats] = useState<LiveViewerStats | null>(null);
  const [liveExternalPreview, setLiveExternalPreview] =
    useState<LiveExternalPreview | null>(null);
  const [liveEngagementStats, setLiveEngagementStats] =
    useState<LiveEngagementStats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, productsRes, collectionsRes] = await Promise.all([
          apiGetVendedorPerfil().catch(() => null),
          apiFetch("/api/seller/products")
            .then(async (res) => {
              if (!res.ok) return [];
              const data = await res.json().catch(() => []);
              return Array.isArray(data) ? data : data.data || [];
            })
            .catch(() => []),
          apiFetch("/api/collections")
            .then(async (res) => {
              if (!res.ok) return [];
              const data = await res.json().catch(() => null);
              return Array.isArray(data) ? data : data?.data || [];
            })
            .catch(() => []),
        ]);

        if (profileRes?.ok && profileRes.perfil) {
          setSellerProfile(profileRes.perfil);
        }

        setSellerProducts(productsRes);
        setSellerCollections(collectionsRes);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  useEffect(() => {
    const sellerId = Number(sellerProfile?.user_id);

    if (!Number.isFinite(sellerId) || sellerId <= 0 || !sellerProfile?.live_external_url) {
      setLiveExternalPreview(null);
      return;
    }

    let cancelled = false;

    const loadPublicPreview = async () => {
      try {
        const res = await apiFetch(`/api/public/seller/${sellerId}`, {
          method: "GET",
        });
        if (!res.ok) {
          if (!cancelled) setLiveExternalPreview(null);
          return;
        }

        const json = await res.json().catch(() => null);
        if (!cancelled) {
          setLiveExternalPreview(json?.seller?.live_external_preview ?? null);
        }
      } catch {
        if (!cancelled) setLiveExternalPreview(null);
      }
    };

    void loadPublicPreview();

    return () => {
      cancelled = true;
    };
  }, [sellerProfile?.live_external_url, sellerProfile?.user_id]);

  useEffect(() => {
    if (!sellerProfile?.is_live) {
      setLiveEngagementStats(null);
      return;
    }

    let cancelled = false;

    const fetchLiveMetrics = async () => {
      try {
        const res = await apiFetch("/api/analytics/seller/live-metrics", {
          method: "GET",
        });
        if (!res.ok) return;

        const json = await res.json().catch(() => null);
        if (!cancelled) {
          setLiveEngagementStats({
            externalClicksTotal: Number(json?.data?.external_clicks_total ?? 0),
            externalClicksLast24h: Number(json?.data?.external_clicks_last_24h ?? 0),
            productClicksTotal: Number(json?.data?.product_clicks_total ?? 0),
            whatsappClicksTotal: Number(json?.data?.whatsapp_clicks_total ?? 0),
          });
        }
      } catch {
        if (!cancelled) {
          setLiveEngagementStats({
            externalClicksTotal: 0,
            externalClicksLast24h: 0,
            productClicksTotal: 0,
            whatsappClicksTotal: 0,
          });
        }
      }
    };

    void fetchLiveMetrics();

    const interval = window.setInterval(() => {
      void fetchLiveMetrics();
    }, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [sellerProfile?.is_live]);

  useEffect(() => {
    const sellerId = Number(sellerProfile?.user_id);

    if (!sellerProfile?.is_live || !Number.isFinite(sellerId) || sellerId <= 0) {
      setViewerStats(null);
      return;
    }

    let cancelled = false;

    const fetchViewerCount = async () => {
      try {
        const res = await apiFetch(`/api/analytics/live-viewers/${sellerId}`, {
          method: "GET",
        });
        if (!res.ok) return;

        const json = await res.json().catch(() => null);
        const total = Number(json?.data?.viewer_count);
        const buyers = Number(json?.data?.buyer_viewer_count);
        const guests = Number(json?.data?.guest_viewer_count);
        const internal = Number(json?.data?.internal_viewer_count);

        if (!cancelled) {
          setViewerStats({
            total: Number.isFinite(total) ? total : 0,
            buyers: Number.isFinite(buyers) ? buyers : 0,
            guests: Number.isFinite(guests) ? guests : 0,
            internal: Number.isFinite(internal) ? internal : 0,
          });
        }
      } catch {
        if (!cancelled) {
          setViewerStats({
            total: 0,
            buyers: 0,
            guests: 0,
            internal: 0,
          });
        }
      }
    };

    void fetchViewerCount();

    const interval = window.setInterval(() => {
      void fetchViewerCount();
    }, 15000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [sellerProfile?.is_live, sellerProfile?.user_id]);

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
                  Desde aquí puedes activar el live, preparar el preview y conectar la transmisión externa que verán compradores y seguidores.
                </p>
              </div>
            </BaseCard>
          </BaseSection>

          <BaseSection>
            <BaseSectionHeading
              eyebrow="Live"
              title="Centro de control del live"
              description="Controla tu estado en vivo, el mensaje, los productos destacados y el enlace a tu transmisión externa."
            />

            {!sellerProfile?.is_live ? (
              <BaseCard
                className="mb-6 border-[#0F3D3A]/10 bg-white"
                contentClassName="space-y-5"
              >
                <div className="space-y-2 text-center sm:text-left">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0F3D3A]/60">
                    Empieza tu transmisión
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
                    Activa el modo en vivo para mostrar tus productos en tiempo real
                  </h2>
                  <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
                    Cuando estés listo, inicia live desde aquí y luego completa el preview para que compradores y seguidores entiendan qué estás vendiendo ahora.
                  </p>
                </div>

                <div className="rounded-2xl border border-dashed border-[#0F3D3A]/12 bg-[#fcfbf8] px-4 py-4">
                  <LiveToggleCard
                    isLive={false}
                    liveStartedAt={null}
                    variant="plain"
                    onStateChange={(newState, meta) => {
                      setSellerProfile((current) =>
                        current
                          ? {
                              ...current,
                              is_live: newState,
                              live_started_at: meta?.liveStartedAt ?? null,
                            }
                          : current,
                      );
                    }}
                  />
                </div>
              </BaseCard>
            ) : null}

            <SellerLivePanel
              isLive={Boolean(sellerProfile?.is_live)}
              liveStartedAt={sellerProfile?.live_started_at ?? null}
              liveMessage={sellerProfile?.live_message ?? null}
              liveFeaturedProductIds={sellerProfile?.live_featured_product_ids ?? []}
              liveCollectionId={sellerProfile?.live_collection_id ?? null}
              liveExternalUrl={sellerProfile?.live_external_url ?? null}
              livePlatform={sellerProfile?.live_platform ?? null}
              liveExternalPreview={liveExternalPreview}
              viewerCount={viewerStats?.total ?? null}
              buyerViewerCount={viewerStats?.buyers ?? null}
              guestViewerCount={viewerStats?.guests ?? null}
              externalClicksTotal={liveEngagementStats?.externalClicksTotal ?? null}
              externalClicksLast24h={liveEngagementStats?.externalClicksLast24h ?? null}
              productClicksTotal={liveEngagementStats?.productClicksTotal ?? null}
              whatsappClicksTotal={liveEngagementStats?.whatsappClicksTotal ?? null}
              collections={sellerCollections}
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
                live_collection_id,
                live_external_url,
                live_platform,
              }) => {
                setSellerProfile((current) =>
                  current
                    ? {
                        ...current,
                        live_message,
                        live_featured_product_ids,
                        live_collection_id,
                        live_external_url,
                        live_platform,
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
