"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import FallbackImg from "@/components/FallbackImg";
import { getApiUrl } from "@/lib/config";
import { getLivePlatformLabel, getLivePlatformTheme } from "@/lib/liveExternal";
import { fetchLiveSellers, type SellerLive } from "@/services/homeService";

type LivePreviewData = Pick<
  SellerLive,
  | "live_message"
  | "live_featured_products"
  | "live_platform"
  | "live_external_url"
  | "live_external_preview"
>;

const API = getApiUrl();

function LiveCard({
  seller,
  preview,
}: {
  seller: SellerLive;
  preview?: LivePreviewData;
}) {
  const ubicacion = seller.municipio || seller.departamento || "";
  const liveMessage = preview?.live_message ?? seller.live_message ?? null;
  const previewProduct =
    preview?.live_featured_products?.[0] ??
    seller.live_featured_products?.[0] ??
    null;
  const livePlatform = preview?.live_platform ?? seller.live_platform ?? null;
  const livePlatformLabel = getLivePlatformLabel(livePlatform);
  const liveExternalPreview =
    preview?.live_external_preview ?? seller.live_external_preview ?? null;
  const previewImage = liveExternalPreview?.image_url ?? previewProduct?.imagen_url;
  const platformTheme = getLivePlatformTheme(livePlatform);

  return (
    <Link
      href={`/store/${seller.id}/live?source=home`}
      className={[
        "group block min-w-[280px] overflow-hidden rounded-[24px] border border-[#0d2d20]/8 bg-white",
        "shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300",
        "hover:-translate-y-1 hover:border-[#0d2d20]/14 hover:shadow-[0_16px_44px_rgba(15,23,42,0.1)]",
        "md:min-w-0",
      ].join(" ")}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#e7e0d3]">
        {previewImage ? (
          <FallbackImg
            src={previewImage}
            fallback="/images/tiendas/default.jpg"
            alt={seller.nombre_comercio}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className={[
              "flex h-full w-full flex-col justify-between p-4",
              platformTheme.surfaceClass,
            ].join(" ")}
          >
            <div
              className={[
                "inline-flex w-fit items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                platformTheme.badgeClass,
              ].join(" ")}
            >
              {livePlatformLabel ? `Live en ${livePlatformLabel}` : "Live externo"}
            </div>
            <div>
              <p className="text-lg font-semibold leading-tight text-[#11110f]">
                {liveExternalPreview?.title || seller.nombre_comercio}
              </p>
              <p className="mt-1 text-xs text-[#11110f]/60">
                {liveExternalPreview?.description || "Abre la tienda para ver el live y sus productos."}
              </p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#11110f]/60 via-[#11110f]/10 to-transparent" />

        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-[#b42318]/10 bg-[#fff4f2] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[#b42318] shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ef4444]/50" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#dc2626]" />
          </span>
          En vivo
        </div>
      </div>

      <div className="relative px-4 pb-5 pt-0">
        <div className="-mt-8 flex items-end gap-3">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-4 border-white bg-[#f4ecdf] shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
            <FallbackImg
              src={seller.logo}
              fallback="/images/tiendas/default.jpg"
              alt={seller.nombre_comercio}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="pb-1">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#0d2d20]/42">
              Tienda activa
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <h3 className="line-clamp-2 font-serif italic text-[24px] leading-tight text-[#11110f]">
            {seller.nombre_comercio}
          </h3>

          {liveMessage ? (
            <p className="line-clamp-1 text-sm leading-6 text-[#0d2d20]/62">
              {liveMessage}
            </p>
          ) : null}

          {livePlatformLabel ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b42318]/72">
              En vivo en {livePlatformLabel}
            </p>
          ) : null}

          {liveExternalPreview?.title ? (
            <p className="line-clamp-1 text-xs text-[#0d2d20]/52">
              {liveExternalPreview.title}
            </p>
          ) : null}

          {previewProduct ? (
            <div className="flex items-center gap-3 rounded-[16px] border border-[#0d2d20]/8 bg-[#faf8f4] px-3 py-2">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-[12px] bg-[#ece4d7]">
                <FallbackImg
                  src={previewProduct.imagen_url}
                  fallback="/images/productos/default.jpg"
                  alt={previewProduct.nombre}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#0d2d20]/40">
                  Producto en preview
                </p>
                <p className="truncate text-sm font-medium text-[#11110f]">
                  {previewProduct.nombre}
                </p>
              </div>
            </div>
          ) : null}

          {ubicacion && (
            <div className="flex items-center gap-2 text-sm text-[#0d2d20]/62">
              <MapPin className="h-4 w-4 shrink-0 text-[#0d2d20]/45" aria-hidden="true" />
              <span className="truncate">{ubicacion}</span>
            </div>
          )}

          <div className="pt-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#0F3D3A]/10 bg-[#0F3D3A]/5 px-3 py-2 text-xs font-semibold text-[#0F3D3A] transition group-hover:border-[#0F3D3A]/20 group-hover:bg-[#0F3D3A]/8">
              Entrar a la sala live
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function LiveNowSection() {
  const [sellers, setSellers] = useState<SellerLive[]>([]);
  const [previewBySeller, setPreviewBySeller] = useState<
    Record<number, LivePreviewData>
  >({});
  const requestedSellerIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;

    fetchLiveSellers()
      .then((data) => {
        if (!cancelled) setSellers(data);
      })
      .catch(() => {
        if (!cancelled) setSellers([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!sellers.length || !API) return;

    sellers.forEach((seller) => {
      if (requestedSellerIds.current.has(seller.id)) return;

      requestedSellerIds.current.add(seller.id);

      void fetch(`${API}/api/public/seller/${seller.id}`, {
        cache: "no-store",
      })
        .then(async (res) => {
          if (!res.ok) return null;
          return (await res.json().catch(() => null)) as
            | {
                seller?: {
                  live_message?: string | null;
                  live_featured_products?: SellerLive["live_featured_products"];
                  live_platform?: SellerLive["live_platform"];
                  live_external_url?: SellerLive["live_external_url"];
                  live_external_preview?: SellerLive["live_external_preview"];
                };
              }
            | null;
        })
        .then((json) => {
          if (!json?.seller) return;

          setPreviewBySeller((current) => ({
            ...current,
            [seller.id]: {
              live_message: json.seller?.live_message ?? null,
              live_featured_products: json.seller?.live_featured_products ?? [],
              live_platform: json.seller?.live_platform ?? null,
              live_external_url: json.seller?.live_external_url ?? null,
              live_external_preview: json.seller?.live_external_preview ?? null,
            },
          }));
        })
        .catch(() => {});
    });
  }, [sellers]);

  if (!sellers.length) return null;

  return (
    <section className="relative overflow-hidden bg-[#faf7f1] py-16 md:py-20">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#0d2d20]/12 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 md:px-12">
        <div className="flex flex-col gap-3">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#b42318]/78">
            En vivo ahora
          </p>
          <div className="max-w-2xl space-y-3">
            <h2 className="font-serif italic text-[2rem] leading-[1.05] tracking-[-0.02em] text-[#11110f] md:text-[2.5rem]">
              En vivo ahora
            </h2>
            <p className="text-sm leading-6 text-[#0d2d20]/65 md:text-base">
              Tiendas mostrando productos en este momento
            </p>
          </div>
        </div>

        <div className="mt-8 h-px bg-gradient-to-r from-[#0d2d20]/18 to-transparent" />

        <div className="mt-8 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 lg:grid-cols-4">
          {sellers.map((seller) => (
            <div key={seller.id} className="snap-start md:min-w-0">
              <LiveCard seller={seller} preview={previewBySeller[seller.id]} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
