"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Eye, Layers2, Loader2, Sparkles, Store } from "lucide-react";
import {
  SellerActionButton,
  SellerPill,
  SellerSurfaceCard,
} from "@/components/seller/ui/SellerPrimitives";
import { apiFetch } from "@/lib/api";
import { apiGetVendedorPerfil } from "@/services/vendedorPerfil";
import { updateSellerLiveConfig } from "@/services/sellerLive";
import CollectionArtworkPreview, {
  CollectionPreviewBox,
} from "@/components/seller/CollectionArtworkPreview";

type CollectionItem = {
  id?: number | null;
  element_type: "product" | "text" | "shape" | "image";
  content?: Record<string, unknown> | null;
  product_id?: string | null;
  pos_x?: number;
  pos_y?: number;
  width?: number;
  height?: number;
  z_index?: number;
  product_name?: string | null;
  product_image?: string | null;
};

type CollectionProduct = {
  id: string;
  nombre: string;
  precio?: number | string | null;
  imagen_url?: string | null;
};

type Collection = {
  id: number;
  name: string;
  description: string | null;
  status: "draft" | "published";
  promo_image_url?: string | null;
  background_image_url?: string | null;
  background_color?: string | null;
  background_style?: string | null;
  canvas_width?: number;
  canvas_height?: number;
  item_count?: number;
  product_count?: number;
  items?: CollectionItem[];
  products?: CollectionProduct[];
};

export default function SellerStoreCollectionPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [profileRes, collectionsRes] = await Promise.all([
          apiGetVendedorPerfil(),
          apiFetch("/api/collections").then((response) => response.json()),
        ]);

        if (cancelled) return;

        setSelectedCollectionId(
          Number.isInteger(Number(profileRes?.perfil?.live_collection_id)) && Number(profileRes?.perfil?.live_collection_id) > 0
            ? Number(profileRes.perfil?.live_collection_id)
            : null,
        );
        setCollections(Array.isArray(collectionsRes?.data) ? collectionsRes.data : []);
      } catch {
        if (!cancelled) setError("No se pudo cargar la configuración de la tienda.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const publishedCollections = useMemo(
    () => collections.filter((collection) => collection.status === "published"),
    [collections],
  );
  const draftCollections = useMemo(
    () => collections.filter((collection) => collection.status !== "published"),
    [collections],
  );
  const selectedCollection = useMemo(
    () => collections.find((collection) => collection.id === selectedCollectionId) ?? null,
    [collections, selectedCollectionId],
  );
  const fallbackPublishedCollection = useMemo(
    () => publishedCollections[0] ?? null,
    [publishedCollections],
  );
  const previewCollection = selectedCollection ?? fallbackPublishedCollection;
  const hasPublishedCollections = publishedCollections.length > 0;
  const previewWidth = Math.max(1, Number(previewCollection?.canvas_width ?? 1080));
  const previewHeight = Math.max(1, Number(previewCollection?.canvas_height ?? 1080));
  const previewProductCount =
    previewCollection?.product_count ?? previewCollection?.item_count ?? previewCollection?.products?.length ?? 0;

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const result = await updateSellerLiveConfig({ live_collection_id: selectedCollectionId });
      setSelectedCollectionId(result.liveCollectionId ?? null);
      setSuccess(result.liveCollectionId ? "Colección enlazada a tu tienda pública." : "Se quitó la colección destacada de tu tienda.");
    } catch (err: any) {
      setError(err?.message || "No se pudo guardar la colección en tienda.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-neutral-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando colección en tienda...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <button
            onClick={() => (window.location.href = "/seller/collections")}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--seller-muted)] transition hover:text-[var(--seller-ink)]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Colecciones
          </button>
          <h1 className="mt-3 text-3xl font-bold text-[var(--seller-ink)]">Colección en tienda</h1>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:justify-end">
          <Link href="/seller/my-business" className="inline-flex items-center justify-center rounded-lg border border-[var(--seller-line-strong)] px-4 py-2 text-sm font-medium text-[var(--seller-text)] transition hover:bg-[var(--seller-panel)]">
            Ver tienda
          </Link>
          <SellerActionButton
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium"
          >
            {saving ? "Guardando..." : "Guardar en tienda"}
          </SellerActionButton>
        </div>
      </div>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <SellerSurfaceCard className="space-y-6 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--seller-accent)]">Publicación</p>
            <h2 className="mt-1 text-xl font-semibold text-neutral-900">Estado actual</h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className="grid grid-cols-2 gap-3">
              <div className="seller-panel-subtle rounded-2xl px-3 py-3 sm:px-4 sm:py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">Estado</p>
                <p className="mt-1.5 text-sm font-semibold text-neutral-900 sm:mt-2 sm:text-base">
                  {selectedCollection ? "Activa" : hasPublishedCollections ? "Pendiente" : "Vacía"}
                </p>
              </div>
              <div className="seller-panel-subtle rounded-2xl px-3 py-3 sm:px-4 sm:py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">Colección actual</p>
                <p className="mt-1.5 line-clamp-2 text-sm font-semibold text-neutral-900 sm:mt-2 sm:text-base">
                  {previewCollection ? previewCollection.name : "Sin selección"}
                </p>
              </div>
              <div className="seller-panel-subtle rounded-2xl px-3 py-3 sm:px-4 sm:py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">Formato</p>
                <p className="mt-1.5 text-sm font-semibold text-neutral-900 sm:mt-2 sm:text-base">
                  {previewCollection ? `${previewWidth} × ${previewHeight}` : "Sin formato"}
                </p>
              </div>
              <div className="seller-panel-subtle rounded-2xl px-3 py-3 sm:px-4 sm:py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">Publicadas</p>
                <p className="mt-1.5 text-sm font-semibold text-neutral-900 sm:mt-2 sm:text-base">{publishedCollections.length}</p>
              </div>
            </div>

            {previewCollection ? (
              <CollectionPreviewBox
                name={previewCollection.name}
                imageUrl={!(previewCollection.items?.length) ? (previewCollection.promo_image_url ?? previewCollection.background_image_url ?? null) : null}
                backgroundImageUrl={previewCollection.background_image_url ?? undefined}
                items={previewCollection.items}
                backgroundColor={previewCollection.background_color}
                backgroundStyle={previewCollection.background_style}
                canvasWidth={previewCollection.canvas_width}
                canvasHeight={previewCollection.canvas_height}
                maxWidth={360}
                maxHeight={360}
                imageFit="contain"
                className="rounded-[22px] border border-neutral-200 shadow-[0_14px_32px_rgba(15,61,58,0.08)]"
              />
            ) : (
              <div className="flex aspect-square w-full max-w-[360px] flex-col items-center justify-center gap-3 rounded-[22px] border border-neutral-200 bg-[radial-gradient(circle_at_top,#F7E8D7_0%,#EAD3BB_48%,#E4D9CC_100%)] px-6 text-center text-neutral-500 shadow-[0_14px_32px_rgba(15,61,58,0.08)]">
                <Store className="h-10 w-10 opacity-50" />
                <p className="text-sm font-semibold text-neutral-800">Sin colección</p>
              </div>
            )}
          </div>
        </SellerSurfaceCard>

        <SellerSurfaceCard className="space-y-6 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--seller-accent)]">Colecciones publicadas</p>
              <h2 className="mt-1 text-xl font-semibold text-neutral-900">Elige la colección</h2>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCollectionId(null)}
              disabled={!selectedCollectionId}
              className="rounded-lg border border-[var(--seller-line-strong)] px-3 py-2 text-sm text-[var(--seller-muted)] transition hover:bg-[var(--seller-panel)]"
            >
              Quitar selección
            </button>
          </div>

          {publishedCollections.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-10 text-center text-sm text-neutral-500">
              No hay colecciones publicadas.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {publishedCollections.map((collection) => {
                const isSelected = collection.id === selectedCollectionId;
                const totalProducts = collection.product_count ?? collection.item_count ?? collection.products?.length ?? 0;
                return (
                  <button
                    key={collection.id}
                    type="button"
                    onClick={() => setSelectedCollectionId(collection.id)}
                    className={`overflow-hidden rounded-[24px] border text-left transition ${isSelected ? "border-[var(--seller-accent)] bg-[color:color-mix(in_srgb,var(--seller-accent)_5%,white)] shadow-[0_16px_36px_rgba(15,61,58,0.10)]" : "border-[var(--seller-line-strong)] bg-white hover:border-[var(--seller-line-strong)] hover:shadow-sm"}`}
                  >
                    <div className="h-52 overflow-hidden border-b border-neutral-100 bg-[linear-gradient(135deg,#FFF8F0_0%,#F5EEE5_42%,#E9DFD2_100%)]">
                      <CollectionArtworkPreview
                        name={collection.name}
                        imageUrl={!(collection.items?.length) ? (collection.promo_image_url ?? collection.background_image_url ?? null) : null}
                        backgroundImageUrl={collection.background_image_url ?? undefined}
                        items={collection.items}
                        backgroundColor={collection.background_color}
                        backgroundStyle={collection.background_style}
                        canvasWidth={collection.canvas_width}
                        canvasHeight={collection.canvas_height}
                      />
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-neutral-900">{collection.name}</p>
                          <p className="mt-1 text-sm text-neutral-500">{totalProducts} productos</p>
                        </div>
                        {isSelected ? <SellerPill tone="default" className="bg-[var(--seller-accent)] px-2.5 py-1 text-[11px] uppercase tracking-wide text-white border-[var(--seller-accent)]">En tienda</SellerPill> : null}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Layers2 className="h-3.5 w-3.5" />
                        <span>{collection.canvas_width ?? 1080} × {collection.canvas_height ?? 1080}</span>
                        <Sparkles className="ml-2 h-3.5 w-3.5" />
                        <span>Publicada</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {draftCollections.length > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
              <p className="font-semibold">{draftCollections.length} en borrador.</p>
            </div>
          ) : null}
        </SellerSurfaceCard>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/seller/collections" className="inline-flex items-center gap-2 rounded-lg border border-[var(--seller-line-strong)] px-4 py-2 text-sm font-medium text-[var(--seller-text)] transition hover:bg-[var(--seller-panel)]">
          <Layers2 className="h-4 w-4" />
          Ir a mis colecciones
        </Link>
        <Link href="/seller/my-business" className="inline-flex items-center gap-2 rounded-lg border border-[var(--seller-line-strong)] px-4 py-2 text-sm font-medium text-[var(--seller-text)] transition hover:bg-[var(--seller-panel)]">
          <Eye className="h-4 w-4" />
          Revisar tienda pública
        </Link>
      </div>
    </div>
  );
}
