"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Layers2, Loader2, Sparkles, Store } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { apiGetVendedorPerfil } from "@/services/vendedorPerfil";
import { updateSellerLiveConfig } from "@/services/sellerLive";
import CollectionArtworkPreview from "@/components/seller/CollectionArtworkPreview";

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
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/seller/collections" className="flex items-center gap-1.5 text-sm text-neutral-500 transition hover:text-neutral-800">
            <ArrowLeft className="h-4 w-4" />
            Volver a colecciones
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-neutral-900">Colección en tienda</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
            Elige qué colección publicada quieres destacar dentro de tu tienda pública. Esta selección se mostrará como bloque principal antes del resto de colecciones.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/seller/my-business" className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50">
            Ver tienda
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-[#0F3D3A] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#14544f] disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar en tienda"}
          </button>
        </div>
      </div>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6 rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0F3D3A]">Publicación</p>
            <h2 className="mt-1 text-xl font-semibold text-neutral-900">Así quedará en tu storefront</h2>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-neutral-200 bg-[linear-gradient(180deg,#FBF8F1_0%,#F4EFE7_100%)] p-4">
            <div className="rounded-[24px] border border-white/80 bg-white/85 p-4 shadow-[0_18px_44px_rgba(15,61,58,0.08)] backdrop-blur">
              <div className="aspect-[4/5] overflow-hidden rounded-[22px] border border-neutral-100 bg-[linear-gradient(135deg,#FFF8F0_0%,#F5EEE5_42%,#E9DFD2_100%)]">
                {selectedCollection ? (
                  <CollectionArtworkPreview
                    name={selectedCollection.name}
                    imageUrl={selectedCollection.promo_image_url ?? selectedCollection.background_image_url ?? null}
                    items={selectedCollection.items}
                    backgroundColor={selectedCollection.background_color}
                    backgroundStyle={selectedCollection.background_style}
                    canvasWidth={selectedCollection.canvas_width}
                    canvasHeight={selectedCollection.canvas_height}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-neutral-500">
                    <Store className="h-10 w-10 opacity-50" />
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">Aún no hay colección destacada</p>
                      <p className="mt-1 text-xs leading-5 text-neutral-500">Selecciona una colección publicada para darle una sección propia en tu tienda.</p>
                    </div>
                  </div>
                )}
              </div>
              {selectedCollection ? (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">Destacada en tienda</p>
                  <h3 className="text-lg font-semibold text-neutral-900">{selectedCollection.name}</h3>
                  <p className="text-sm text-neutral-500">
                    {selectedCollection.product_count ?? selectedCollection.item_count ?? selectedCollection.products?.length ?? 0} productos vinculados
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 text-sm text-neutral-600">
            <p className="font-semibold text-neutral-800">Qué hace esta sección</p>
            <p className="mt-2">La colección elegida se fija arriba en tu tienda pública como conjunto protagonista. Las demás colecciones siguen apareciendo debajo.</p>
          </div>
        </div>

        <div className="space-y-6 rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0F3D3A]">Colecciones publicadas</p>
              <h2 className="mt-1 text-xl font-semibold text-neutral-900">Selecciona la colección que vive en tienda</h2>
              <p className="mt-1 text-sm text-neutral-500">Solo las colecciones publicadas pueden destacarse en el storefront del vendedor.</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCollectionId(null)}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-600 transition hover:bg-neutral-50"
            >
              Quitar selección
            </button>
          </div>

          {publishedCollections.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-10 text-center text-sm text-neutral-500">
              Aún no tienes colecciones publicadas. Publica una colección primero para enlazarla a tu tienda.
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
                    className={`overflow-hidden rounded-[24px] border text-left transition ${isSelected ? "border-[#0F3D3A] bg-[#0F3D3A]/5 shadow-[0_16px_36px_rgba(15,61,58,0.10)]" : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm"}`}
                  >
                    <div className="h-52 overflow-hidden border-b border-neutral-100 bg-[linear-gradient(135deg,#FFF8F0_0%,#F5EEE5_42%,#E9DFD2_100%)]">
                      <CollectionArtworkPreview
                        name={collection.name}
                        imageUrl={collection.promo_image_url ?? collection.background_image_url ?? null}
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
                          <p className="mt-1 text-sm text-neutral-500">{totalProducts} productos en el conjunto</p>
                        </div>
                        {isSelected ? <span className="rounded-full bg-[#0F3D3A] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">En tienda</span> : null}
                      </div>
                      <p className="line-clamp-2 text-sm text-neutral-500">
                        {collection.description || "Colección publicada lista para aparecer en el storefront de tu tienda."}
                      </p>
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
              <p className="font-semibold">Tienes {draftCollections.length} colecciones aún en borrador.</p>
              <p className="mt-1">Esas no pueden mostrarse en la tienda hasta que las publiques desde su editor.</p>
            </div>
          ) : null}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/seller/collections" className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50">
          <Layers2 className="h-4 w-4" />
          Ir a mis colecciones
        </Link>
        <Link href="/seller/my-business" className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50">
          <Eye className="h-4 w-4" />
          Revisar tienda pública
        </Link>
      </div>
    </div>
  );
}
