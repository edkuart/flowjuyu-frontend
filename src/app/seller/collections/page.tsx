"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Eye, EyeOff, Trash2, LayoutTemplate, Store } from "lucide-react";
import {
  SellerActionButton,
  SellerPill,
  SellerSurfaceCard,
} from "@/components/seller/ui/SellerPrimitives";
import { sellerFieldClassName } from "@/components/seller/ui/sellerFormStyles";
import { apiFetch } from "@/lib/api";
import { CollectionPreviewBox } from "@/components/seller/CollectionArtworkPreview";
import { apiGetVendedorPerfil } from "@/services/vendedorPerfil";

type CollectionProduct = {
  id: string;
  nombre: string;
  imagen_url?: string | null;
};

type CollectionCanvasItem = {
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
  items?: CollectionCanvasItem[];
  products?: CollectionProduct[];
  created_at: string;
};

function CollectionPromoCard({ collection }: { collection: Collection }) {
  const hasItems = (collection.items?.length ?? 0) > 0;
  // when canvas items exist, always render the canvas — promo_image_url is only a flat fallback for empty canvases
  const imageUrl = !hasItems ? (collection.promo_image_url ?? collection.background_image_url ?? null) : null;
  const productCount = collection.product_count ?? collection.item_count ?? collection.products?.length ?? 0;

  return (
    <CollectionPreviewBox
      name={collection.name}
      imageUrl={imageUrl}
      backgroundImageUrl={collection.background_image_url ?? undefined}
      items={collection.items}
      backgroundColor={collection.background_color}
      backgroundStyle={collection.background_style}
      canvasWidth={collection.canvas_width}
      canvasHeight={collection.canvas_height}
      maxWidth={600}
      maxHeight={600}
      emptyTitle="Colección sin imagen"
      emptyDescription="Sube una portada o crea una en canvas cuando la necesites."
      className="w-full border-b border-neutral-100"
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent px-3 py-3 text-white">
        <p className="line-clamp-1 text-sm font-semibold">{collection.name}</p>
        <p className="text-xs text-white/80">{productCount} {productCount === 1 ? "producto" : "productos"}</p>
      </div>
    </CollectionPreviewBox>
  );
}

export default function CollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedStoreCollectionId, setSelectedStoreCollectionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      apiFetch("/api/collections").then((r) => r.json()),
      apiGetVendedorPerfil(),
    ])
      .then(([collectionsRes, profileRes]) => {
        if (cancelled) return;
        setCollections(collectionsRes.data ?? []);
        const rawStoreCollectionId = Number(profileRes?.perfil?.live_collection_id);
        setSelectedStoreCollectionId(Number.isInteger(rawStoreCollectionId) && rawStoreCollectionId > 0 ? rawStoreCollectionId : null);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudieron cargar las colecciones");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const publishedCollections = collections.filter((collection) => collection.status === "published");
  const draftCollections = collections.filter((collection) => collection.status !== "published");
  const selectedStoreCollection = collections.find((collection) => collection.id === selectedStoreCollectionId) ?? null;
  const fallbackPublishedCollection = publishedCollections[0] ?? null;
  const storeCollectionPreview = selectedStoreCollection ?? fallbackPublishedCollection;
  const hasPublishedCollections = publishedCollections.length > 0;
  const storePreviewWidth = Math.max(1, Number(storeCollectionPreview?.canvas_width ?? 1080));
  const storePreviewHeight = Math.max(1, Number(storeCollectionPreview?.canvas_height ?? 1080));

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await apiFetch("/api/collections", {
        method: "POST",
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push(`/seller/collections/${data.data.id}`);
      }
    } catch {
      setError("Error al crear la colección");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar esta colección?")) return;
    await apiFetch(`/api/collections/${id}`, { method: "DELETE" });
    setCollections((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleTogglePublish(id: number) {
    const res = await apiFetch(`/api/collections/${id}/publish`, { method: "PATCH" });
    const data = await res.json();
    if (data.ok) {
      setCollections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: data.data.status } : c))
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f5ef]">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.18em] text-[var(--seller-accent)] uppercase">
              Colecciones · Flowjuyu Seller
            </p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--seller-ink)] sm:text-[28px] sm:leading-[1.05]">
              Mis colecciones
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--seller-muted)]">
              En tienda:{" "}
              <span className="font-medium text-[var(--seller-ink)]">
                {selectedStoreCollection
                  ? selectedStoreCollection.name
                  : hasPublishedCollections
                  ? "sin destacar"
                  : "sin publicadas"}
              </span>
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/seller/templates"
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--seller-line-strong)] px-4 py-2.5 text-sm font-medium text-[var(--seller-text)] transition hover:bg-[var(--seller-panel)]"
            >
              <LayoutTemplate className="h-4 w-4" />
              Plantillas
            </Link>
            <SellerActionButton
              onClick={() => setShowModal(true)}
              className="px-4 py-2.5"
            >
              <Plus className="h-4 w-4" />
              Nueva colección
            </SellerActionButton>
          </div>
        </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-xl bg-neutral-100" />
          ))}
        </div>
      )}

      {!loading && collections.length === 0 && (
        <SellerSurfaceCard className="border-dashed p-6 sm:p-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--seller-ink)]">No tienes colecciones</h2>
            <div className="flex flex-wrap gap-3">
              <SellerActionButton
                onClick={() => setShowModal(true)}
                className="px-5 py-2.5"
              >
                <Plus className="h-4 w-4" />
                Crear colección
              </SellerActionButton>
              <Link
                href="/seller/templates"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--seller-line-strong)] px-5 py-2.5 text-sm font-medium text-[var(--seller-text)] transition hover:bg-[var(--seller-panel)]"
              >
                <LayoutTemplate className="h-4 w-4" />
                Plantillas
              </Link>
            </div>
          </div>
        </SellerSurfaceCard>
      )}

      {!loading && collections.length > 0 && (
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {collections.map((col) => {
            const productCount = col.product_count ?? col.item_count ?? col.products?.length ?? 0;
            return (
              <div
                key={col.id}
                className="group seller-surface-card relative flex flex-col overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-28px_rgba(15,61,58,0.25)]"
              >
                <CollectionPromoCard collection={col} />

                <div className="flex flex-1 flex-col gap-2.5 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="line-clamp-1 font-semibold text-neutral-800">{col.name}</h3>
                      <p className="mt-1 text-xs text-neutral-500">{productCount} {productCount === 1 ? "producto" : "productos"}</p>
                    </div>
                    <span>
                      <SellerPill tone={col.status === "published" ? "success" : "warning"} className="shrink-0 px-2 py-0.5 text-[11px] uppercase tracking-wide">
                      {col.status === "published" ? "Publicada" : "Borrador"}
                      </SellerPill>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(col.products ?? []).slice(0, 3).map((product) => (
                      <SellerPill key={product.id} tone="neutral" className="px-2.5 py-1 text-[11px] font-medium text-[var(--seller-text)]">
                        {product.nombre}
                      </SellerPill>
                    ))}
                    {productCount > 3 && (
                      <SellerPill tone="neutral" className="px-2.5 py-1 text-[11px] font-medium text-[var(--seller-muted)]">
                        +{productCount - 3}
                      </SellerPill>
                    )}
                  </div>

                  <div className="mt-auto flex items-center gap-2">
                    <Link
                      href={`/seller/collections/${col.id}`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--seller-line-strong)] py-2 text-xs font-medium text-[var(--seller-text)] transition hover:bg-[var(--seller-panel)]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Abrir colección
                    </Link>

                    <button
                      onClick={() => handleTogglePublish(col.id)}
                      title={col.status === "published" ? "Despublicar" : "Publicar"}
                      className="rounded-lg border border-neutral-200 p-2 text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-700"
                    >
                      {col.status === "published" ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(col.id)}
                      title="Eliminar"
                      className="rounded-lg border border-neutral-200 p-2 text-neutral-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <SellerSurfaceCard className="w-full max-w-md p-6 shadow-xl">
            <h2 className="mb-1 text-lg font-bold text-[var(--seller-ink)]">Nueva colección</h2>

            <input
              autoFocus
              type="text"
              placeholder="Ej. Artesanías de invierno"
              maxLength={120}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className={sellerFieldClassName}
            />

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => { setShowModal(false); setNewName(""); }}
                className="flex-1 rounded-lg border border-[var(--seller-line-strong)] py-2.5 text-sm font-medium text-[var(--seller-muted)] transition hover:bg-[var(--seller-panel)]"
              >
                Cancelar
              </button>
              <SellerActionButton
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="flex-1 py-2.5 text-sm font-medium"
              >
                {creating ? "Creando..." : "Crear colección"}
              </SellerActionButton>
            </div>
          </SellerSurfaceCard>
        </div>
      )}
      </div>
    </div>
  );
}
