"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Layers2, Pencil, Eye, EyeOff, Trash2, LayoutTemplate } from "lucide-react";
import { apiFetch } from "@/lib/api";
import CollectionArtworkPreview from "@/components/seller/CollectionArtworkPreview";

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
  const imageUrl = collection.promo_image_url ?? collection.background_image_url ?? null;
  const productCount = collection.product_count ?? collection.item_count ?? collection.products?.length ?? 0;

  return (
    <div className="relative flex h-64 items-center justify-center overflow-hidden border-b border-neutral-100 bg-[linear-gradient(180deg,#FBF8F1_0%,#F4EFE7_100%)] px-4 py-4">
      <div className="relative h-[220px] w-[220px] overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_18px_44px_rgba(15,61,58,0.12)]">
        <CollectionArtworkPreview
          name={collection.name}
          imageUrl={imageUrl}
          items={collection.items}
          backgroundColor={collection.background_color}
          backgroundStyle={collection.background_style}
          canvasWidth={collection.canvas_width}
          canvasHeight={collection.canvas_height}
          emptyTitle="Colección sin imagen"
          emptyDescription="Sube una portada o crea una en canvas cuando la necesites."
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent px-4 py-4 text-white">
          <p className="text-xs uppercase tracking-[0.24em] text-white/75">Colección</p>
          <p className="line-clamp-1 text-base font-semibold">{collection.name}</p>
          <p className="text-xs text-white/80">{productCount} {productCount === 1 ? "producto" : "productos"}</p>
        </div>
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/api/collections")
      .then((r) => r.json())
      .then((data) => setCollections(data.data ?? []))
      .catch(() => setError("No se pudieron cargar las colecciones"))
      .finally(() => setLoading(false));
  }, []);

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
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Mis Colecciones</h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-500">
            Esta sección ahora guarda la idea comercial de la colección: nombre, imagen promocional y productos. El canvas vive aparte y se usa solo cuando quieres diseñar la imagen.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/seller/templates"
            className="flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            <LayoutTemplate className="h-4 w-4" />
            Biblioteca visual
          </Link>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-[#0F3D3A] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#14544f]"
          >
            <Plus className="h-4 w-4" />
            Nueva colección
          </button>
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
        <div className="grid gap-6 rounded-[28px] border border-dashed border-neutral-200 bg-white p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div className="space-y-4">
            <span className="inline-flex rounded-full bg-[#0F3D3A]/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#0F3D3A]">
              Colecciones simplificadas
            </span>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Todavía no tienes colecciones</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
                Crea primero la colección como concepto comercial. Después puedes subir una imagen ya trabajada o entrar al canvas solo si quieres diseñarla aquí mismo.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0F3D3A] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#14544f]"
              >
                <Plus className="h-4 w-4" />
                Crear primera colección
              </button>
              <Link
                href="/seller/templates"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                <LayoutTemplate className="h-4 w-4" />
                Ver recursos visuales
              </Link>
            </div>
          </div>
          <div className="rounded-[28px] border border-neutral-100 bg-[linear-gradient(135deg,#FFF8F0_0%,#F6F0E8_45%,#EEE5DA_100%)] p-6 shadow-[0_24px_60px_rgba(15,61,58,0.08)]">
            <div className="rounded-[24px] border border-white/80 bg-white/85 p-6 backdrop-blur">
              <div className="flex h-52 flex-col items-center justify-center rounded-[20px] border border-dashed border-neutral-200 bg-[radial-gradient(circle_at_top,#F7E8D7_0%,#EAD3BB_48%,#E4D9CC_100%)] text-center text-neutral-600">
                <Layers2 className="mb-3 h-10 w-10 opacity-55" />
                <p className="text-sm font-semibold text-neutral-800">Aquí ya no vive el canvas</p>
                <p className="mt-1 max-w-xs text-xs leading-5 text-neutral-500">La colección empieza vacía y se completa con portada + productos. El diseño visual avanzado se abre aparte cuando hace falta.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && collections.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {collections.map((col) => {
            const productCount = col.product_count ?? col.item_count ?? col.products?.length ?? 0;
            return (
              <div
                key={col.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:shadow-md"
              >
                <CollectionPromoCard collection={col} />

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="line-clamp-1 font-semibold text-neutral-800">{col.name}</h3>
                      <p className="mt-1 text-xs text-neutral-500">{productCount} {productCount === 1 ? "producto vinculado" : "productos vinculados"}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                        col.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {col.status === "published" ? "Publicada" : "Borrador"}
                    </span>
                  </div>

                  <p className="line-clamp-2 min-h-10 text-sm text-neutral-500">
                    {col.description || "Sin descripción todavía. Puedes usarla para explicar el concepto o la intención de la colección."}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {(col.products ?? []).slice(0, 3).map((product) => (
                      <span key={product.id} className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-600">
                        {product.nombre}
                      </span>
                    ))}
                    {productCount > 3 && (
                      <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-500">
                        +{productCount - 3}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto flex items-center gap-2">
                    <Link
                      href={`/seller/collections/${col.id}`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
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
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-1 text-lg font-bold text-neutral-900">Nueva colección</h2>
            <p className="mb-5 text-sm text-neutral-500">
              Empieza con el nombre. Luego podrás agregar la imagen promocional, vincular productos y, si quieres, diseñar una portada en canvas aparte.
            </p>

            <input
              autoFocus
              type="text"
              placeholder="Ej. Artesanías de invierno"
              maxLength={120}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#0F3D3A] focus:ring-2 focus:ring-[#0F3D3A]/20"
            />

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => { setShowModal(false); setNewName(""); }}
                className="flex-1 rounded-lg border border-neutral-200 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="flex-1 rounded-lg bg-[#0F3D3A] py-2.5 text-sm font-medium text-white transition hover:bg-[#14544f] disabled:opacity-50"
              >
                {creating ? "Creando..." : "Crear colección"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
