"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageSquareText,
  Sparkles,
} from "lucide-react";

import {
  SellerActionButton,
  SellerIconBadge,
  SellerPill,
} from "@/components/seller/ui/SellerPrimitives";
import { sellerFieldClassName } from "@/components/seller/ui/sellerFormStyles";
import { BaseCard } from "@/components/ui/BaseCard";
import { updateSellerLiveConfig } from "@/services/sellerLive";

type SellerPreviewProduct = {
  id: string;
  nombre: string;
  precio?: number | string | null;
  imagen_url?: string | null;
  activo?: boolean;
};

type Props = {
  products: SellerPreviewProduct[];
  initialMessage?: string | null;
  initialFeaturedProductIds?: string[] | null;
  message?: string;
  selectedIds?: string[];
  onMessageChange?: (nextMessage: string) => void;
  onSelectedIdsChange?: (nextIds: string[]) => void;
  onSave?: (next: {
    live_message: string | null;
    live_featured_product_ids: string[];
  }) => void;
  isSaving?: boolean;
  error?: string | null;
  success?: string | null;
  variant?: "card" | "plain";
  hideHeader?: boolean;
  hideSaveButton?: boolean;
};

const MESSAGE_MAX = 160;
const FEATURED_MAX = 3;
const EMPTY_FEATURED_IDS: string[] = [];

function areStringArraysEqual(left: string[], right: string[]) {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function formatPrice(value?: number | string | null) {
  const amount = Number(value ?? 0);
  if (Number.isNaN(amount)) return null;
  return `Q${amount.toFixed(2)}`;
}

export default function LivePreviewEditor({
  products,
  initialMessage = null,
  initialFeaturedProductIds = EMPTY_FEATURED_IDS,
  message,
  selectedIds,
  onMessageChange,
  onSelectedIdsChange,
  onSave,
  isSaving: externalSaving,
  error: externalError,
  success: externalSuccess,
  variant = "card",
  hideHeader = false,
  hideSaveButton = false,
}: Props) {
  const activeProducts = useMemo(
    () => products.filter((product) => product.activo !== false),
    [products],
  );
  const [internalSelectedIds, setInternalSelectedIds] = useState<string[]>(
    initialFeaturedProductIds ?? [],
  );
  const [internalMessage, setInternalMessage] = useState(initialMessage ?? "");
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [internalSaving, setInternalSaving] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [internalSuccess, setInternalSuccess] = useState<string | null>(null);

  useEffect(() => {
    setInternalMessage(initialMessage ?? "");
  }, [initialMessage]);

  useEffect(() => {
    const nextIds = initialFeaturedProductIds ?? EMPTY_FEATURED_IDS;
    setInternalSelectedIds((current) =>
      areStringArraysEqual(current, nextIds) ? current : nextIds,
    );
  }, [initialFeaturedProductIds]);

  const currentMessage = message ?? internalMessage;
  const currentSelectedIds = selectedIds ?? internalSelectedIds;
  const isSaving = externalSaving ?? internalSaving;
  const error = externalError ?? internalError;
  const success = externalSuccess ?? internalSuccess;
  const hasProducts = activeProducts.length > 0;
  const selectedProducts = useMemo(
    () =>
      currentSelectedIds
        .map((id) => activeProducts.find((product) => product.id === id) ?? null)
        .filter((product): product is SellerPreviewProduct => Boolean(product)),
    [activeProducts, currentSelectedIds],
  );

  useEffect(() => {
    if (!hasProducts) {
      setIsProductPickerOpen((current) => (current ? false : current));
      return;
    }

    if (activeProducts.length <= FEATURED_MAX) {
      setIsProductPickerOpen((current) => (current ? current : true));
    }
  }, [activeProducts.length, hasProducts]);

  function updateMessage(nextMessage: string) {
    if (onMessageChange) {
      onMessageChange(nextMessage);
      return;
    }

    setInternalMessage(nextMessage);
  }

  function updateSelectedIds(nextIds: string[]) {
    if (onSelectedIdsChange) {
      onSelectedIdsChange(nextIds);
      return;
    }

    setInternalSelectedIds(nextIds);
  }

  function toggleProduct(productId: string) {
    if (!externalSuccess) setInternalSuccess(null);
    if (!externalError) setInternalError(null);

    const nextIds = (() => {
      const current = currentSelectedIds;
      if (current.includes(productId)) {
        return current.filter((id) => id !== productId);
      }

      if (current.length >= FEATURED_MAX) {
        if (!externalError) {
          setInternalError("Solo puedes destacar hasta 3 productos.");
        }
        return current;
      }

      return [...current, productId];
    })();

    updateSelectedIds(nextIds);
  }

  async function handleSave() {
    try {
      setInternalSaving(true);
      if (!externalError) setInternalError(null);
      if (!externalSuccess) setInternalSuccess(null);

      const payload = {
        live_message: currentMessage.trim() || null,
        live_featured_product_ids: currentSelectedIds,
      };

      const result = await updateSellerLiveConfig(payload);

      updateMessage(result.liveMessage ?? "");
      updateSelectedIds(result.liveFeaturedProductIds);
      if (!externalSuccess) {
        setInternalSuccess("Preview del live guardado correctamente.");
      }
      onSave?.({
        live_message: result.liveMessage,
        live_featured_product_ids: result.liveFeaturedProductIds,
      });
    } catch (err: any) {
      if (!externalError) {
        setInternalError(
          err?.message || "No se pudo guardar la configuración del live",
        );
      }
    } finally {
      setInternalSaving(false);
    }
  }

  const content = (
    <div className="space-y-5">
      {!hideHeader ? (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--seller-line)] bg-[color:color-mix(in_srgb,var(--seller-accent)_6%,white)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--seller-accent)]">
              <MessageSquareText className="h-3.5 w-3.5" />
              Live preview
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
                Prepara lo que verá la audiencia
              </h2>
              <p className="text-sm leading-relaxed text-neutral-600">
                Agrega un mensaje corto y elige hasta 3 productos activos para
                acompañar tu estado en vivo.
              </p>
            </div>
          </div>

          <SellerIconBadge className="h-11 w-11 shrink-0">
            <Sparkles className="h-5 w-5" />
          </SellerIconBadge>
        </div>
      ) : null}

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="live-message"
            className="text-sm font-medium text-neutral-900"
          >
            Mensaje corto del live
          </label>
          <span className="text-xs text-neutral-500">
            {currentMessage.length}/{MESSAGE_MAX}
          </span>
        </div>
        <textarea
          id="live-message"
          value={currentMessage}
          onChange={(event) => {
            if (!externalSuccess) setInternalSuccess(null);
            if (!externalError) setInternalError(null);
            updateMessage(event.target.value.slice(0, MESSAGE_MAX));
          }}
          rows={3}
          placeholder="Ej. Hoy estoy mostrando piezas nuevas y respondiendo preguntas en tiempo real."
          className={sellerFieldClassName}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-neutral-900">
              Productos destacados
            </p>
            <p className="text-xs text-neutral-500">
              Selecciona hasta 3 productos activos para el preview live.
            </p>
          </div>
          <span className="text-xs text-neutral-500">
            {currentSelectedIds.length}/{FEATURED_MAX}
          </span>
        </div>

        {!hasProducts ? (
          <div className="rounded-xl border border-dashed border-[#0F3D3A]/12 bg-[#faf8f4] px-4 py-5 text-sm text-neutral-600">
            Aún no tienes productos activos para destacar en el live. Publica
            uno primero y luego podrás usar este preview.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="seller-panel-subtle rounded-xl px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--seller-accent)]/70">
                    Seleccionados ahora
                  </p>
                  <p className="mt-1 text-sm text-neutral-600">
                    {selectedProducts.length > 0
                      ? `${selectedProducts.length} producto(s) listos para el preview`
                      : "Aún no has elegido productos para mostrar."}
                  </p>
                </div>

                <SellerActionButton
                  type="button"
                  onClick={() => setIsProductPickerOpen((current) => !current)}
                  tone="neutral"
                  className="min-h-10 px-3"
                >
                  {isProductPickerOpen ? "Ocultar lista" : "Ver lista"}
                  {isProductPickerOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </SellerActionButton>
              </div>

              {selectedProducts.length > 0 ? (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {selectedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex min-w-[180px] items-center gap-2 rounded-xl border border-[#0F3D3A]/10 bg-[#f5faf8] px-2 py-2"
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#f3efe7]">
                        {product.imagen_url ? (
                          <Image
                            src={product.imagen_url}
                            alt={product.nombre}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                            Sin foto
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-neutral-900">
                          {product.nombre}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {formatPrice(product.precio) ?? "Precio no disponible"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {isProductPickerOpen ? (
              <div className="max-h-[320px] overflow-y-auto pr-1">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {activeProducts.map((product) => {
                    const selected = currentSelectedIds.includes(product.id);

                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => toggleProduct(product.id)}
                        className={[
                          "group flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all",
                          selected
                            ? "border-[#0F3D3A]/25 bg-[#f2f6f4] shadow-sm"
                            : "border-neutral-200 bg-white hover:border-[#0F3D3A]/15 hover:bg-[#faf8f4]",
                        ].join(" ")}
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#f3efe7]">
                          {product.imagen_url ? (
                            <Image
                              src={product.imagen_url}
                              alt={product.nombre}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                              Sin foto
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-medium text-neutral-900">
                            {product.nombre}
                          </p>
                          <p className="mt-1 text-xs text-neutral-500">
                            {formatPrice(product.precio) ??
                              "Precio no disponible"}
                          </p>
                        </div>

                        <div
                          className={[
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                            selected
                              ? "border-[var(--seller-accent)] bg-[var(--seller-accent)] text-white"
                              : "border-neutral-300 bg-white text-transparent",
                          ].join(" ")}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      {!hideSaveButton ? (
        <SellerActionButton
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="min-h-11 w-full"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
          "Guardar preview del live"
        )}
        </SellerActionButton>
      ) : null}
    </div>
  );

  if (variant === "plain") {
    return content;
  }

  return (
    <BaseCard
      className="rounded-xl border-[var(--seller-line-strong)] bg-white"
      contentClassName="space-y-5"
    >
      {content}
    </BaseCard>
  );
}
