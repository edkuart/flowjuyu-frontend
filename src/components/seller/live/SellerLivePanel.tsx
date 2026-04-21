"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Facebook,
  Instagram,
  Loader2,
  Music2,
  RadioTower,
} from "lucide-react";

import LiveToggleCard from "@/components/seller/dashboard/LiveToggleCard";
import LivePreviewEditor from "@/components/seller/dashboard/LivePreviewEditor";
import { BaseCard } from "@/components/ui/BaseCard";
import { Button } from "@/components/ui/button";
import {
  getLivePlatformLabel,
  isValidLiveExternalUrl,
  LIVE_PLATFORM_OPTIONS,
  type LivePlatform,
} from "@/lib/liveExternal";
import {
  updateSellerLiveConfig,
  updateSellerLiveExternal,
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

type SellerLiveCollection = {
  id: number;
  name: string;
  status?: string;
  item_count?: number;
};

type LiveExternalPreview = {
  title?: string | null;
  description?: string | null;
  image_url?: string | null;
  site_name?: string | null;
  canonical_url?: string | null;
};

type Props = {
  isLive: boolean;
  liveStartedAt?: string | null;
  liveMessage?: string | null;
  liveFeaturedProductIds?: string[] | null;
  liveCollectionId?: number | null;
  liveExternalUrl?: string | null;
  livePlatform?: LivePlatform | null;
  liveExternalPreview?: LiveExternalPreview | null;
  viewerCount?: number | null;
  buyerViewerCount?: number | null;
  guestViewerCount?: number | null;
  externalClicksTotal?: number | null;
  externalClicksLast24h?: number | null;
  productClicksTotal?: number | null;
  whatsappClicksTotal?: number | null;
  collections?: SellerLiveCollection[];
  products: SellerLivePanelProduct[];
  onStateChange?: (
    next: { is_live: boolean; live_started_at: string | null },
  ) => void;
  onConfigSave?: (
    next: {
      live_message: string | null;
      live_featured_product_ids: string[];
      live_collection_id: number | null;
      live_external_url: string | null;
      live_platform: LivePlatform | null;
    },
  ) => void;
};

export default function SellerLivePanel({
  isLive,
  liveStartedAt = null,
  liveMessage = null,
  liveFeaturedProductIds = [],
  liveCollectionId = null,
  liveExternalUrl = null,
  livePlatform = null,
  liveExternalPreview = null,
  viewerCount = null,
  buyerViewerCount = null,
  guestViewerCount = null,
  externalClicksTotal = null,
  externalClicksLast24h = null,
  productClicksTotal = null,
  whatsappClicksTotal = null,
  collections = [],
  products,
  onStateChange,
  onConfigSave,
}: Props) {
  const [message, setMessage] = useState(liveMessage ?? "");
  const [selectedIds, setSelectedIds] = useState<string[]>(
    liveFeaturedProductIds ?? [],
  );
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | "">(
    liveCollectionId ?? "",
  );
  const [externalUrl, setExternalUrl] = useState(liveExternalUrl ?? "");
  const [platform, setPlatform] = useState<LivePlatform | "">(
    livePlatform ?? "",
  );
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [isExternalOpen, setIsExternalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setMessage(liveMessage ?? "");
  }, [liveMessage]);

  useEffect(() => {
    setSelectedIds(liveFeaturedProductIds ?? []);
  }, [liveFeaturedProductIds]);

  useEffect(() => {
    setSelectedCollectionId(liveCollectionId ?? "");
  }, [liveCollectionId]);

  useEffect(() => {
    setExternalUrl(liveExternalUrl ?? "");
  }, [liveExternalUrl]);

  useEffect(() => {
    setPlatform(livePlatform ?? "");
  }, [livePlatform]);

  const platformLabel = getLivePlatformLabel(platform || null);
  const externalUrlPlaceholder =
    LIVE_PLATFORM_OPTIONS.find((option) => option.value === platform)
      ?.placeholder ?? "https://...";
  const selectedCollection = useMemo(
    () =>
      collections.find((collection) => collection.id === selectedCollectionId) ??
      null,
    [collections, selectedCollectionId],
  );
  const activeCollections = useMemo(
    () =>
      collections.filter(
        (collection) =>
          !collection.status ||
          collection.status === "active" ||
          collection.status === "published",
      ),
    [collections],
  );
  const usesCollectionSource = Boolean(selectedCollectionId && selectedCollection);
  const hasExternalSetup = Boolean(platform && externalUrl.trim());
  const hasPreviewMetadata = Boolean(
    liveExternalPreview?.title ||
      liveExternalPreview?.description ||
      liveExternalPreview?.image_url,
  );
  const liveMetricCards = [
    viewerCount !== null
      ? {
          label: "Viendo ahora",
          value: String(viewerCount),
          tone:
            "border-[#0F3D3A]/10 bg-[#0F3D3A]/5 text-[#0F3D3A]",
        }
      : null,
    buyerViewerCount !== null
      ? {
          label: "Compradores",
          value: String(buyerViewerCount),
          tone:
            "border-[#0F3D3A]/10 bg-[#0F3D3A]/5 text-[#0F3D3A]",
        }
      : null,
    guestViewerCount !== null
      ? {
          label: "Invitados",
          value: String(guestViewerCount),
          tone: "border-neutral-200 bg-white text-neutral-700",
        }
      : null,
    externalClicksTotal !== null
      ? {
          label: "Salidas al live",
          value: String(externalClicksTotal),
          tone: "border-neutral-200 bg-white text-neutral-700",
        }
      : null,
    externalClicksLast24h !== null
      ? {
          label: "Últimas 24h",
          value: String(externalClicksLast24h),
          tone: "border-neutral-200 bg-white text-neutral-700",
        }
      : null,
    productClicksTotal !== null
      ? {
          label: "Clicks producto",
          value: String(productClicksTotal),
          tone: "border-neutral-200 bg-white text-neutral-700",
        }
      : null,
    whatsappClicksTotal !== null
      ? {
          label: "Clicks WhatsApp",
          value: String(whatsappClicksTotal),
          tone: "border-neutral-200 bg-white text-neutral-700",
        }
      : null,
  ].filter(Boolean) as Array<{
    label: string;
    value: string;
    tone: string;
  }>;

  const PlatformIcon =
    platform === "instagram"
      ? Instagram
      : platform === "facebook"
        ? Facebook
        : Music2;

  async function handleSave() {
    const normalizedUrl = externalUrl.trim();

    if ((platform && !normalizedUrl) || (!platform && normalizedUrl)) {
      setError("Selecciona una plataforma y agrega la URL del live, o deja ambos campos vacíos.");
      setSuccess(null);
      return;
    }

    if (normalizedUrl && !isValidLiveExternalUrl(normalizedUrl)) {
      setError("Ingresa una URL válida para tu live externo.");
      setSuccess(null);
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const [configResult, externalResult] = await Promise.all([
        updateSellerLiveConfig({
          live_message: message.trim() || null,
          live_featured_product_ids: selectedIds,
          live_collection_id: selectedCollectionId || null,
        }),
        updateSellerLiveExternal({
          live_platform: platform || null,
          live_external_url: normalizedUrl || null,
        }),
      ]);

      const next = {
        live_message: configResult.liveMessage,
        live_featured_product_ids: configResult.liveFeaturedProductIds,
        live_collection_id: configResult.liveCollectionId,
        live_external_url: externalResult.liveExternalUrl,
        live_platform: externalResult.livePlatform,
      };

      setMessage(configResult.liveMessage ?? "");
      setSelectedIds(configResult.liveFeaturedProductIds);
      setSelectedCollectionId(configResult.liveCollectionId ?? "");
      setExternalUrl(externalResult.liveExternalUrl ?? "");
      setPlatform(externalResult.livePlatform ?? "");
      setSuccess("Preview del live guardado correctamente.");
      onConfigSave?.(next);
    } catch (err: any) {
      setError(err?.message || "No se pudo guardar la configuración del live");
    } finally {
      setIsSaving(false);
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
            {isLive && liveMetricCards.length > 0 ? (
              <div className="space-y-2 pt-1">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-500">
                  Sesiones activas y respuesta del live
                </p>
                <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {liveMetricCards.map((metric) => (
                    <div
                      key={metric.label}
                      className={`min-w-[138px] snap-start rounded-2xl border px-3 py-3 shadow-sm ${metric.tone}`}
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] opacity-70">
                        {metric.label}
                      </p>
                      <p className="pt-1 text-lg font-semibold tracking-tight">
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
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
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-neutral-900">
              Colección del live
            </p>
            <p className="text-sm leading-relaxed text-neutral-600">
              {usesCollectionSource
                ? `Usando ${selectedCollection?.name ?? "una colección"} para poblar el bloque live.`
                : "Usando selección manual de productos para el bloque live."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCollectionOpen((current) => !current)}
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 transition hover:border-[#0F3D3A]/15 hover:text-[#0F3D3A]"
          >
            {isCollectionOpen ? "Ocultar" : "Editar"}
            {isCollectionOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="rounded-xl border border-[#0F3D3A]/10 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0F3D3A]/70">
            Fuente actual del live
          </p>
          <p className="mt-2 text-sm font-medium text-neutral-900">
            {usesCollectionSource
              ? `Colección: ${selectedCollection?.name ?? "Colección seleccionada"}`
              : "Selección manual de productos"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-500">
            {usesCollectionSource
              ? "Los productos del bloque live público saldrán automáticamente de esta colección al guardar."
              : "Seguirás controlando manualmente los productos destacados desde la lista superior."}
          </p>
        </div>

        {isCollectionOpen ? (
          collections.length === 0 ? (
            <div className="space-y-3 rounded-xl border border-dashed border-neutral-200 bg-white px-4 py-4 text-sm text-neutral-600">
              <p>
                Aún no tienes colecciones creadas. Mientras tanto, puedes seguir usando la selección manual de productos destacados.
              </p>
              <Link
                href="/seller/collections"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#0F3D3A]/15 bg-[#f5faf8] px-4 text-sm font-semibold text-[#0F3D3A] transition hover:border-[#0F3D3A]/25 hover:bg-[#edf6f2]"
              >
                Crear o revisar colecciones
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <select
                value={selectedCollectionId}
                onChange={(event) => {
                  setSuccess(null);
                  setError(null);
                  const nextValue = Number(event.target.value);
                  setSelectedCollectionId(Number.isInteger(nextValue) && nextValue > 0 ? nextValue : "");
                }}
                className="min-h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-800 outline-none transition focus:border-[#0F3D3A]/30 focus:ring-2 focus:ring-[#0F3D3A]/10"
              >
                <option value="">Usar selección manual</option>
                {activeCollections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                    {collection.item_count ? ` · ${collection.item_count} items` : ""}
                  </option>
                ))}
              </select>

              {selectedCollectionId ? (
                <div className="rounded-xl border border-[#0F3D3A]/10 bg-[#f5faf8] px-4 py-3 text-xs text-[#0F3D3A]">
                  <p className="font-medium">
                    La colección elegida tendrá prioridad sobre la selección manual de productos destacados.
                  </p>
                  <p className="mt-1 text-[#0F3D3A]/80">
                    {selectedCollection?.item_count
                      ? `${selectedCollection.item_count} item(s) se usarán como base del preview live.`
                      : "La colección se aplicará en cuanto tenga productos activos vinculados."}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-neutral-500">
                  Si no eliges colección, el live seguirá usando tus productos destacados manuales.
                </p>
              )}
            </div>
          )
        ) : null}
      </div>

      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-[#fcfbf8] px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-neutral-900">
              Transmisión externa
            </p>
            <p className="text-sm leading-relaxed text-neutral-600">
              {hasExternalSetup
                ? `Configurado para ${platformLabel ?? "tu plataforma externa"}.`
                : "Aún no has conectado una plataforma externa para tu live."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsExternalOpen((current) => !current)}
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 transition hover:border-[#0F3D3A]/15 hover:text-[#0F3D3A]"
          >
            {isExternalOpen ? "Ocultar" : "Editar"}
            {isExternalOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="rounded-xl border border-[#0F3D3A]/10 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <PlatformIcon className="h-4 w-4 text-[#0F3D3A]" />
            <p className="text-sm font-medium text-neutral-900">
              {platformLabel && externalUrl.trim()
                ? `En vivo en ${platformLabel}`
                : "Sin plataforma conectada"}
            </p>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-neutral-500">
            {externalUrl.trim()
              ? externalUrl
              : "Conecta tu link externo para que compradores puedan abrir tu live desde la tienda."}
          </p>
        </div>

        {externalUrl.trim() ? (
          <div
            className={[
              "rounded-xl border px-4 py-3 text-sm",
              liveExternalPreview?.title ||
              liveExternalPreview?.description ||
              liveExternalPreview?.image_url
                ? "border-emerald-200 bg-emerald-50/70 text-emerald-900"
                : "border-amber-200 bg-amber-50/80 text-amber-900",
            ].join(" ")}
          >
            <p className="font-medium">
              {liveExternalPreview?.title ||
              liveExternalPreview?.description ||
              liveExternalPreview?.image_url
                ? "Preview detectado"
                : "Preview visual no detectado"}
            </p>
            <p className="mt-1 text-xs leading-relaxed opacity-80">
              {liveExternalPreview?.title ||
              liveExternalPreview?.description ||
              liveExternalPreview?.image_url
                ? "La URL externa ya expone metadata usable y la tienda pública mostrará una tarjeta enriquecida del live."
                : "Esta URL no expone metadata visual accesible por ahora. Flowjuyu usará un fallback premium de plataforma y activos de tu tienda."}
            </p>
          </div>
        ) : null}

        {isExternalOpen ? (
          <>
            <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Plataforma
                </span>
                <select
                  value={platform}
                  onChange={(event) => {
                    setSuccess(null);
                    setError(null);
                    setPlatform(event.target.value as LivePlatform | "");
                  }}
                  className="min-h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-800 outline-none transition focus:border-[#0F3D3A]/30 focus:ring-2 focus:ring-[#0F3D3A]/10"
                >
                  <option value="">Selecciona plataforma</option>
                  {LIVE_PLATFORM_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  URL del live
                </span>
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(event) => {
                    setSuccess(null);
                    setError(null);
                    setExternalUrl(event.target.value);
                  }}
                  placeholder={externalUrlPlaceholder}
                  className="min-h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-800 outline-none transition placeholder:text-neutral-400 focus:border-[#0F3D3A]/30 focus:ring-2 focus:ring-[#0F3D3A]/10"
                />
              </label>
            </div>

            {!hasExternalSetup ? (
              <p className="text-xs text-neutral-500">
                Ejemplo: TikTok · https://www.tiktok.com/@tu-cuenta/live
              </p>
            ) : null}
          </>
        ) : null}
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
