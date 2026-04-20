"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, RadioTower } from "lucide-react";

import LiveToggleCard from "@/components/seller/dashboard/LiveToggleCard";
import LivePreviewEditor from "@/components/seller/dashboard/LivePreviewEditor";
import { BaseCard } from "@/components/ui/BaseCard";
import { Button } from "@/components/ui/button";
import {
  updateSellerLiveConfig,
  updateSellerLiveCurrentProduct,
} from "@/services/sellerLive";

type SellerLivePanelProduct = {
  id: string;
  nombre: string;
  precio?: number | string | null;
  activo?: boolean;
  descripcion?: string | null;
  imagenes?: Array<{ url?: string | null }>;
  imagen_url?: string | null;
  internal_code?: string | null;
};

type Props = {
  isLive: boolean;
  liveStartedAt?: string | null;
  liveMessage?: string | null;
  liveFeaturedProductIds?: string[] | null;
  liveCurrentProductId?: string | null;
  products: SellerLivePanelProduct[];
  onStateChange?: (
    next: { is_live: boolean; live_started_at: string | null },
  ) => void;
  onConfigSave?: (
    next: {
      live_message: string | null;
      live_featured_product_ids: string[];
      live_current_product_id: string | null;
    },
  ) => void;
};

export default function SellerLivePanel({
  isLive,
  liveStartedAt = null,
  liveMessage = null,
  liveFeaturedProductIds = [],
  liveCurrentProductId = null,
  products,
  onStateChange,
  onConfigSave,
}: Props) {
  const [message, setMessage] = useState(liveMessage ?? "");
  const [selectedIds, setSelectedIds] = useState<string[]>(
    liveFeaturedProductIds ?? [],
  );
  const [currentProductId, setCurrentProductId] = useState<string>(
    liveCurrentProductId ?? "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingCurrentProduct, setIsSavingCurrentProduct] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const activeProducts = useMemo(
    () => products.filter((product) => product.activo !== false),
    [products],
  );

  useEffect(() => {
    setMessage(liveMessage ?? "");
  }, [liveMessage]);

  useEffect(() => {
    setSelectedIds(liveFeaturedProductIds ?? []);
  }, [liveFeaturedProductIds]);

  useEffect(() => {
    setCurrentProductId(liveCurrentProductId ?? "");
  }, [liveCurrentProductId]);

  async function handleSave() {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const result = await updateSellerLiveConfig({
        live_message: message.trim() || null,
        live_featured_product_ids: selectedIds,
      });

      const next = {
        live_message: result.liveMessage,
        live_featured_product_ids: result.liveFeaturedProductIds,
        live_current_product_id: currentProductId || null,
      };

      setMessage(result.liveMessage ?? "");
      setSelectedIds(result.liveFeaturedProductIds);
      setSuccess("Preview del live guardado correctamente.");
      onConfigSave?.(next);
    } catch (err: any) {
      setError(err?.message || "No se pudo guardar la configuración del live");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveCurrentProduct() {
    try {
      setIsSavingCurrentProduct(true);
      setError(null);
      setSuccess(null);

      const result = await updateSellerLiveCurrentProduct(currentProductId || null);

      setCurrentProductId(result.liveCurrentProductId ?? "");
      setSuccess(
        result.liveCurrentProductId
          ? "Producto actual del live guardado correctamente."
          : "Producto actual del live limpiado correctamente.",
      );
      onConfigSave?.({
        live_message: message.trim() || null,
        live_featured_product_ids: selectedIds,
        live_current_product_id: result.liveCurrentProductId,
      });
    } catch (err: any) {
      setError(err?.message || "No se pudo guardar el producto actual del live");
    } finally {
      setIsSavingCurrentProduct(false);
    }
  }

  return (
    <BaseCard
      className="rounded-xl border-[#0F3D3A]/10 bg-white"
      contentClassName="space-y-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0F3D3A]/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0F3D3A]/80 ring-1 ring-[#0F3D3A]/10">
            <RadioTower className="h-3.5 w-3.5" />
            Live
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Centro de control live
            </h2>
            <p className="max-w-3xl text-sm leading-relaxed text-neutral-600">
              Activa tu live y prepara el contexto que verán compradores y seguidores desde Home y tu tienda pública.
            </p>
          </div>
        </div>
      </div>

      <LiveToggleCard
        isLive={isLive}
        liveStartedAt={liveStartedAt}
        variant="plain"
        onStateChange={(newState, meta) => {
          setSuccess(null);
          setError(null);
          onStateChange?.({
            is_live: newState,
            live_started_at: meta?.liveStartedAt ?? null,
          });
        }}
      />

      <div className="h-px bg-gradient-to-r from-[#0F3D3A]/12 via-[#0F3D3A]/6 to-transparent" />

      <LivePreviewEditor
        products={products}
        message={message}
        selectedIds={selectedIds}
        onMessageChange={(nextMessage) => {
          setSuccess(null);
          setError(null);
          setMessage(nextMessage);
        }}
        onSelectedIdsChange={(nextIds) => {
          setSuccess(null);
          setError(null);
          setSelectedIds(nextIds);
        }}
        isSaving={isSaving}
        error={error}
        success={success}
        variant="plain"
        hideHeader
        hideSaveButton
      />

      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-[#fcfbf8] px-4 py-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-neutral-900">
            Producto en vivo
          </p>
          <p className="text-sm leading-relaxed text-neutral-600">
            Elige la pieza que quieres fijar ahora mismo en la barra inferior de tu tienda pública.
          </p>
        </div>

        {activeProducts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#0F3D3A]/12 bg-white px-4 py-4 text-sm text-neutral-600">
            Aún no tienes productos activos para marcar como producto actual del live.
          </div>
        ) : (
          <div className="space-y-3">
            <label
              htmlFor="live-current-product"
              className="text-sm font-medium text-neutral-900"
            >
              Producto actualmente en vivo
            </label>
            <select
              id="live-current-product"
              value={currentProductId}
              onChange={(event) => {
                setSuccess(null);
                setError(null);
                setCurrentProductId(event.target.value);
              }}
              className="min-h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-800 outline-none transition focus:border-[#0F3D3A]/30 focus:ring-2 focus:ring-[#0F3D3A]/10"
            >
              <option value="">Sin producto actual</option>
              {activeProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.nombre}
                </option>
              ))}
            </select>

            <Button
              type="button"
              onClick={handleSaveCurrentProduct}
              disabled={isSavingCurrentProduct}
              variant="outline"
              className="min-h-11 w-full rounded-xl border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50"
            >
              {isSavingCurrentProduct ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Marcar como producto actual
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <Button
        type="button"
        onClick={handleSave}
        disabled={isSaving}
        className="min-h-11 w-full rounded-xl bg-[#0F3D3A] text-white hover:bg-[#0c312f]"
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          "Guardar preview del live"
        )}
      </Button>
    </BaseCard>
  );
}
