"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ImageIcon, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import CollectionArtworkPreview from "@/components/seller/CollectionArtworkPreview";

type CollectionProduct = {
  id: string;
  nombre: string;
  precio?: number | string | null;
  imagen_url?: string | null;
  internal_code?: string | null;
  seller_sku?: string | null;
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

type CollectionData = {
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
  items?: CollectionCanvasItem[];
  products?: CollectionProduct[];
  product_count?: number;
  item_count?: number;
};

type Product = {
  id: string;
  nombre: string;
  imagen_url: string | null;
  precio: number;
  activo?: boolean;
};

export default function CollectionDetailPage() {
  const params = useParams();
  const collectionId = Number(params?.id);

  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [collectionRes, productsRes] = await Promise.all([
          apiFetch(`/api/collections/${collectionId}`).then((r) => r.json()),
          apiFetch("/api/seller/products").then((r) => r.json()),
        ]);

        if (cancelled) return;

        const nextCollection = collectionRes?.data ?? null;
        setCollection(nextCollection);
        setSelectedProductIds(
          Array.isArray(nextCollection?.products)
            ? nextCollection.products.map((product: CollectionProduct) => product.id)
            : []
        );
        const rawProducts = Array.isArray(productsRes) ? productsRes : productsRes?.data ?? productsRes?.productos ?? [];
        setProducts(Array.isArray(rawProducts) ? rawProducts.filter((product: Product) => product?.activo !== false) : []);
      } catch {
        if (!cancelled) setError("No se pudo cargar la colección");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (Number.isFinite(collectionId) && collectionId > 0) {
      load();
    } else {
      setError("Colección inválida");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [collectionId]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) =>
      [product.nombre, product.id].some((value) => value?.toLowerCase().includes(term))
    );
  }, [products, search]);

  const promoImageUrl = collection?.promo_image_url ?? collection?.background_image_url ?? null;
  const selectedProducts = products.filter((product) => selectedProductIds.includes(product.id));

  function toggleProduct(productId: string) {
    setSelectedProductIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  }

  async function saveCollection(overrides?: Partial<Pick<CollectionData, "status">>) {
    if (!collection) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await apiFetch(`/api/collections/${collection.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: collection.name,
          description: collection.description,
          promo_image_url: promoImageUrl,
          product_ids: selectedProductIds,
        }),
      });

      if (overrides?.status && overrides.status !== collection.status) {
        await apiFetch(`/api/collections/${collection.id}/publish`, { method: "PATCH" });
        setCollection((current) => (current ? { ...current, status: overrides.status! } : current));
      }

      setSuccess("Colección guardada");
    } catch {
      setError("No se pudo guardar la colección");
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !collection) return;

    const form = new FormData();
    form.append("image", file);

    setUploadingImage(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await apiFetch(`/api/collections/${collection.id}/images`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      const nextUrl = data?.promo_image_url ?? data?.url ?? null;
      setCollection((current) =>
        current
          ? {
              ...current,
              promo_image_url: nextUrl,
              background_image_url: nextUrl,
            }
          : current
      );
      setSuccess("Imagen promocional actualizada");
    } catch {
      setError("No se pudo subir la imagen");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  async function handleTogglePublish() {
    if (!collection) return;
    setPublishing(true);
    await saveCollection({ status: collection.status === "published" ? "draft" : "published" });
    setPublishing(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-neutral-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando colección...
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="py-20 text-center text-neutral-500">
        Colección no encontrada. <Link href="/seller/collections" className="underline">Volver</Link>
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
          <h1 className="mt-3 text-3xl font-bold text-neutral-900">{collection.name}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
            Aquí defines la colección como concepto comercial. Si quieres construir la imagen desde cero con capas y composición, entra al canvas como herramienta separada.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePublish}
            disabled={saving || publishing}
            className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60"
          >
            {publishing ? "Actualizando..." : collection.status === "published" ? "Pasar a borrador" : "Publicar"}
          </button>
          <button
            onClick={() => saveCollection()}
            disabled={saving}
            className="rounded-lg bg-[#0F3D3A] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#14544f] disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar colección"}
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6 rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0F3D3A]">Identidad de la colección</p>
            <h2 className="text-xl font-semibold text-neutral-900">Portada y mensaje</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <div className="space-y-3">
              <div className="relative h-[320px] overflow-hidden rounded-[26px] border border-neutral-200 bg-[linear-gradient(135deg,#FFF8F0_0%,#F5EEE5_42%,#E9DFD2_100%)]">
                <CollectionArtworkPreview
                  name={collection.name}
                  imageUrl={promoImageUrl}
                  items={collection.items}
                  backgroundColor={collection.background_color}
                  backgroundStyle={collection.background_style}
                  canvasWidth={collection.canvas_width}
                  canvasHeight={collection.canvas_height}
                />
              </div>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50">
                {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                {uploadingImage ? "Subiendo imagen..." : "Subir imagen promocional"}
                <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} />
              </label>

              <Link
                href={`/seller/collections/${collection.id}/canvas`}
                className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#0F3D3A]/30 bg-[#0F3D3A]/5 px-4 py-3 text-sm font-medium text-[#0F3D3A] transition hover:bg-[#0F3D3A]/8"
              >
                <Sparkles className="h-4 w-4" />
                Abrir editor canvas
              </Link>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">Nombre</label>
                <input
                  type="text"
                  maxLength={120}
                  value={collection.name}
                  onChange={(event) => setCollection((current) => current ? { ...current, name: event.target.value } : current)}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-[#0F3D3A] focus:ring-2 focus:ring-[#0F3D3A]/15"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">Descripción</label>
                <textarea
                  rows={5}
                  value={collection.description ?? ""}
                  onChange={(event) => setCollection((current) => current ? { ...current, description: event.target.value } : current)}
                  placeholder="Explica la idea, el tono o la inspiración detrás de esta colección."
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-[#0F3D3A] focus:ring-2 focus:ring-[#0F3D3A]/15"
                />
              </div>

              <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 text-sm text-neutral-600">
                <p className="font-semibold text-neutral-800">Estado actual</p>
                <p className="mt-1">{collection.status === "published" ? "Esta colección ya se muestra públicamente." : "Esta colección sigue como borrador."}</p>
                <p className="mt-2">Productos vinculados: <span className="font-semibold text-neutral-800">{selectedProductIds.length}</span></p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6 rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0F3D3A]">Productos</p>
              <h2 className="text-xl font-semibold text-neutral-900">Selecciona lo que vive dentro de la colección</h2>
              <p className="mt-1 text-sm text-neutral-500">Puedes usar una imagen ya hecha y luego asociar aquí los artículos que forman el conjunto.</p>
            </div>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">
              {selectedProductIds.length} seleccionados
            </span>
          </div>

          <div className="rounded-2xl border border-neutral-200 p-3">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar producto por nombre"
              className="w-full border-0 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-neutral-400"
            />
          </div>

          <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {filteredProducts.map((product) => {
              const selected = selectedProductIds.includes(product.id);
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => toggleProduct(product.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                    selected
                      ? "border-[#0F3D3A] bg-[#0F3D3A]/5"
                      : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  <div className="h-16 w-16 overflow-hidden rounded-xl bg-neutral-100">
                    {product.imagen_url ? (
                      <img src={product.imagen_url} alt={product.nombre} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-400">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-neutral-800">{product.nombre}</p>
                    <p className="text-xs text-neutral-500">Q{Number(product.precio ?? 0).toFixed(2)}</p>
                  </div>
                  <div className={`h-5 w-5 rounded-full border ${selected ? "border-[#0F3D3A] bg-[#0F3D3A]" : "border-neutral-300 bg-white"}`} />
                </button>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-500">
                No encontramos productos con ese criterio.
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0F3D3A]">Resumen visual</p>
            <h2 className="text-xl font-semibold text-neutral-900">Productos dentro de esta colección</h2>
          </div>
          <button
            onClick={() => setSelectedProductIds([])}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-600 transition hover:bg-neutral-50"
          >
            <Trash2 className="h-4 w-4" />
            Limpiar selección
          </button>
        </div>

        {selectedProducts.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-10 text-center text-sm text-neutral-500">
            Esta colección todavía está vacía. Selecciona productos a la derecha para empezar.
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {selectedProducts.map((product) => (
              <article key={product.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                <div className="aspect-[4/4.8] bg-neutral-100">
                  {product.imagen_url ? (
                    <img src={product.imagen_url} alt={product.nombre} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-neutral-400">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="space-y-1 p-4">
                  <p className="line-clamp-1 text-sm font-semibold text-neutral-800">{product.nombre}</p>
                  <p className="text-xs text-neutral-500">Q{Number(product.precio ?? 0).toFixed(2)}</p>
                </div>
              </article>
            ))}
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 text-neutral-500 transition hover:border-[#0F3D3A]/40 hover:bg-[#0F3D3A]/5 hover:text-[#0F3D3A]"
            >
              <Plus className="mb-2 h-5 w-5" />
              Agregar más productos
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
