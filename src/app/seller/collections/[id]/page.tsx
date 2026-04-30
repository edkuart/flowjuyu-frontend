"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronDown, ChevronLeft, ExternalLink, ImageIcon, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import {
  SellerActionButton,
  SellerPill,
  SellerSurfaceCard,
} from "@/components/seller/ui/SellerPrimitives";
import { sellerFieldClassName } from "@/components/seller/ui/sellerFormStyles";
import { apiFetch } from "@/lib/api";
import { CollectionPreviewBox } from "@/components/seller/CollectionArtworkPreview";

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
  const [otherEditorOpen, setOtherEditorOpen] = useState(false);
  const otherEditorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!otherEditorOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (otherEditorRef.current && !otherEditorRef.current.contains(e.target as Node)) {
        setOtherEditorOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [otherEditorOpen]);

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

  const hasCanvasItems = (collection?.items?.length ?? 0) > 0;
  const promoImageUrl = !hasCanvasItems ? (collection?.promo_image_url ?? collection?.background_image_url ?? null) : null;
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
      const res = await apiFetch(`/api/collections/${collection.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: collection.name,
          description: collection.description,
          promo_image_url: promoImageUrl,
          product_ids: selectedProductIds,
        }),
      });
      if (!res.ok) throw new Error("save_failed");

      if (overrides?.status && overrides.status !== collection.status) {
        const pubRes = await apiFetch(`/api/collections/${collection.id}/publish`, { method: "PATCH" });
        if (!pubRes.ok) throw new Error("publish_failed");
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
    <div className="min-w-0 space-y-6 pb-12 md:space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <button
            onClick={() => (window.location.href = "/seller/collections")}
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--seller-muted)] transition hover:text-[var(--seller-ink)]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Colecciones
          </button>
          <h1 className="mt-3 break-words text-3xl font-bold text-[var(--seller-ink)]">{collection.name}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--seller-muted)]">
            Aquí defines la colección como concepto comercial. Si quieres construir la imagen desde cero con capas y composición, entra al canvas como herramienta separada.
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto md:flex-wrap md:justify-end">
          <button
            onClick={handleTogglePublish}
            disabled={saving || publishing}
            className="min-w-0 rounded-lg border border-[var(--seller-line-strong)] px-3 py-2 text-center text-sm font-medium text-[var(--seller-text)] transition hover:bg-[var(--seller-panel)] disabled:opacity-60 md:px-4"
          >
            {publishing ? "Actualizando..." : collection.status === "published" ? "Pasar a borrador" : "Publicar"}
          </button>
          <SellerActionButton
            onClick={() => saveCollection()}
            disabled={saving}
            className="min-w-0 px-3 py-2 text-center text-sm font-medium md:px-4"
          >
            {saving ? "Guardando..." : "Guardar colección"}
          </SellerActionButton>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <SellerSurfaceCard className="min-w-0 space-y-6 p-5 sm:p-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--seller-accent)]">Identidad de la colección</p>
            <h2 className="text-xl font-semibold text-neutral-900">Portada y mensaje</h2>
          </div>

          <div className="min-w-0 space-y-5">
            <CollectionPreviewBox
              name={collection.name}
              imageUrl={promoImageUrl}
              backgroundImageUrl={collection.background_image_url ?? undefined}
              items={collection.items}
              backgroundColor={collection.background_color}
              backgroundStyle={collection.background_style}
              canvasWidth={collection.canvas_width}
              canvasHeight={collection.canvas_height}
              maxWidth={700}
              maxHeight={520}
              className="w-full rounded-[22px]"
            />

            <div className="grid grid-cols-2 gap-3">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--seller-line-strong)] px-4 py-3 text-sm font-medium text-[var(--seller-text)] transition hover:bg-[var(--seller-panel)]">
                {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                {uploadingImage ? "Subiendo..." : "Subir imagen"}
                <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} />
              </label>

              <Link
                href={`/seller/collections/${collection.id}/canvas`}
                className="seller-option-card-active flex items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm font-medium text-[var(--seller-accent)] transition"
              >
                <Sparkles className="h-4 w-4" />
                Editor canvas
              </Link>
            </div>

            {/* External editors dropdown */}
            <div ref={otherEditorRef} className="relative">
              <button
                type="button"
                onClick={() => setOtherEditorOpen((v) => !v)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--seller-line-strong)] px-4 py-3 text-sm font-medium text-[var(--seller-text)] transition hover:bg-[var(--seller-panel)]"
              >
                <ExternalLink className="h-4 w-4" />
                Editar en otro editor
                <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${otherEditorOpen ? "rotate-180" : ""}`} />
              </button>

              {otherEditorOpen && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-[var(--seller-line-strong)] bg-white shadow-xl">
                  <p className="border-b border-neutral-100 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    Diseña tu imagen y luego súbela aquí
                  </p>
                  {[
                    {
                      name: "Canva",
                      description: "Plantillas y diseño fácil",
                      href: "https://www.canva.com/create/",
                      color: "text-[#7B2FBE]",
                      bg: "hover:bg-purple-50",
                    },
                    {
                      name: "Adobe Express",
                      description: "Diseño profesional rápido",
                      href: "https://new.express.adobe.com/",
                      color: "text-[#FF0000]",
                      bg: "hover:bg-red-50",
                    },
                    {
                      name: "Photopea",
                      description: "Editor avanzado tipo Photoshop, gratis",
                      href: "https://www.photopea.com/",
                      color: "text-[#0073E6]",
                      bg: "hover:bg-blue-50",
                    },
                  ].map((editor) => (
                    <a
                      key={editor.name}
                      href={editor.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOtherEditorOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 transition ${editor.bg}`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-semibold ${editor.color}`}>{editor.name}</p>
                        <p className="text-xs text-neutral-500">{editor.description}</p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-neutral-300" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">Nombre</label>
              <input
                type="text"
                maxLength={120}
                value={collection.name}
                onChange={(event) => setCollection((current) => current ? { ...current, name: event.target.value } : current)}
                className={sellerFieldClassName}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">Descripción</label>
              <textarea
                rows={4}
                value={collection.description ?? ""}
                onChange={(event) => setCollection((current) => current ? { ...current, description: event.target.value } : current)}
                placeholder="Explica la idea, el tono o la inspiración detrás de esta colección."
                className={sellerFieldClassName}
              />
            </div>

            <div className="seller-panel-subtle rounded-2xl p-4 text-sm text-neutral-600">
              <p className="font-semibold text-neutral-800">Estado actual</p>
              <p className="mt-1">{collection.status === "published" ? "Esta colección ya se muestra públicamente." : "Esta colección sigue como borrador."}</p>
              <p className="mt-2">Productos vinculados: <span className="font-semibold text-neutral-800">{selectedProductIds.length}</span></p>
            </div>
          </div>
        </SellerSurfaceCard>

        <SellerSurfaceCard className="min-w-0 space-y-6 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--seller-accent)]">Productos</p>
              <h2 className="text-xl font-semibold text-neutral-900">Selecciona lo que vive dentro de la colección</h2>
              <p className="mt-1 text-sm text-neutral-500">Puedes usar una imagen ya hecha y luego asociar aquí los artículos que forman el conjunto.</p>
            </div>
            <SellerPill tone="neutral" className="px-3 py-1 text-xs font-semibold">
              {selectedProductIds.length} seleccionados
            </SellerPill>
          </div>

          <div className="rounded-2xl border border-[var(--seller-line-strong)] p-3">
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
                      ? "border-[var(--seller-accent)] bg-[color:color-mix(in_srgb,var(--seller-accent)_5%,white)]"
                      : "border-[var(--seller-line-strong)] hover:border-[var(--seller-line-strong)] hover:bg-[var(--seller-panel)]"
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
                  <div className={`h-5 w-5 rounded-full border ${selected ? "border-[var(--seller-accent)] bg-[var(--seller-accent)]" : "border-neutral-300 bg-white"}`} />
                </button>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-500">
                No encontramos productos con ese criterio.
              </div>
            )}
          </div>

          <div className="border-t border-[var(--seller-line-strong)] pt-4">
            <SellerActionButton
              onClick={() => saveCollection()}
              disabled={saving}
              className="w-full py-2.5 text-center text-sm font-medium"
            >
              {saving ? "Guardando..." : `Guardar selección (${selectedProductIds.length})`}
            </SellerActionButton>
          </div>
        </SellerSurfaceCard>
      </div>

      <SellerSurfaceCard className="min-w-0 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--seller-accent)]">Resumen visual</p>
            <h2 className="text-xl font-semibold text-neutral-900">Productos dentro de esta colección</h2>
          </div>
          <button
            onClick={() => setSelectedProductIds([])}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--seller-line-strong)] px-3 py-2 text-sm text-[var(--seller-muted)] transition hover:bg-[var(--seller-panel)]"
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
              className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--seller-line-strong)] bg-[var(--seller-panel)] text-[var(--seller-muted)] transition hover:border-[color:color-mix(in_srgb,var(--seller-accent)_25%,transparent)] hover:bg-[color:color-mix(in_srgb,var(--seller-accent)_5%,white)] hover:text-[var(--seller-accent)]"
            >
              <Plus className="mb-2 h-5 w-5" />
              Agregar más productos
            </button>
          </div>
        )}
      </SellerSurfaceCard>
    </div>
  );
}
