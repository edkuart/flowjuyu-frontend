"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Layers2, Pencil, Eye, EyeOff, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Collection = {
  id: number;
  name: string;
  description: string | null;
  status: "draft" | "published";
  background_color: string;
  canvas_width: number;
  canvas_height: number;
  item_count: number;
  created_at: string;
};

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Mis Colecciones</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Crea looks y conjuntos con tus productos para mostrarlos en tu perfil público.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-[#0F3D3A] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#14544f]"
        >
          <Plus className="h-4 w-4" />
          Nueva colección
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-neutral-100" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && collections.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-white py-20 text-center">
          <Layers2 className="mb-4 h-12 w-12 text-neutral-300" />
          <h3 className="text-lg font-semibold text-neutral-700">
            Todavía no tienes colecciones
          </h3>
          <p className="mt-1 max-w-sm text-sm text-neutral-500">
            Crea tu primera colección y agrupa tus productos en looks y conjuntos únicos.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-6 flex items-center gap-2 rounded-lg bg-[#0F3D3A] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#14544f]"
          >
            <Plus className="h-4 w-4" />
            Crear primera colección
          </button>
        </div>
      )}

      {/* Grid */}
      {!loading && collections.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => (
            <div
              key={col.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:shadow-md"
            >
              {/* Preview header */}
              <div
                className="flex h-32 items-center justify-center"
                style={{ backgroundColor: col.background_color }}
              >
                <Layers2 className="h-10 w-10 text-neutral-400 opacity-40" />
                <span className="ml-2 text-sm font-medium text-neutral-500 opacity-50">
                  {col.canvas_width} × {col.canvas_height}
                </span>
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-1 font-semibold text-neutral-800">
                    {col.name}
                  </h3>
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

                <p className="text-xs text-neutral-500">
                  {col.item_count} {col.item_count === 1 ? "producto" : "productos"}
                </p>

                {/* Actions */}
                <div className="mt-auto flex items-center gap-2">
                  <Link
                    href={`/seller/collections/${col.id}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
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
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-1 text-lg font-bold text-neutral-900">
              Nueva colección
            </h2>
            <p className="mb-5 text-sm text-neutral-500">
              Dale un nombre a tu colección. Podrás cambiarlo después.
            </p>

            <input
              autoFocus
              type="text"
              placeholder="Ej. Colección Primavera 2025"
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
                {creating ? "Creando..." : "Crear y abrir editor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
