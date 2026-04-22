"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Layers2, Pencil, Eye, EyeOff, Trash2, Copy } from "lucide-react";
import { apiFetch } from "@/lib/api";

type CollectionPreviewItem = {
  id: number;
  element_type: string;
  content?: Record<string, any> | null;
  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
  z_index: number;
  product_image?: string | null;
};

type Collection = {
  id: number;
  name: string;
  description: string | null;
  status: "draft" | "published";
  background_color: string;
  background_style?: string | null;
  background_image_url?: string | null;
  canvas_width: number;
  canvas_height: number;
  item_count: number;
  created_at: string;
  items?: CollectionPreviewItem[];
};

function buildBoxShadow(shadow?: {
  shadowEnabled?: boolean;
  shadowX?: number;
  shadowY?: number;
  shadowBlur?: number;
  shadowSpread?: number;
  shadowColor?: string;
}) {
  if (!shadow?.shadowEnabled) return undefined;
  return `${shadow.shadowX ?? 0}px ${shadow.shadowY ?? 0}px ${Math.max(0, shadow.shadowBlur ?? 0)}px ${shadow.shadowSpread ?? 0}px ${shadow.shadowColor ?? "rgba(15,61,58,0.18)"}`;
}

function getShapePreviewStyle(content: Record<string, any>, scale: number) {
  const shapeType = String(content?.shapeType ?? "rect");
  const background = content?.gradientEnabled && content?.gradientColor2
    ? `linear-gradient(${content?.gradientAngle ?? 135}deg, ${content?.fillColor ?? "#0F3D3A"}, ${content?.gradientColor2})`
    : (content?.fillColor ?? "#0F3D3A");
  const borderWidth = Math.max(0, Number(content?.strokeWidth ?? 0) * scale);
  const shared = {
    background,
    opacity: content?.opacity ?? 1,
    border: borderWidth > 0 ? `${borderWidth}px solid ${content?.strokeColor ?? "transparent"}` : undefined,
    boxShadow: buildBoxShadow({
      shadowEnabled: content?.shadowEnabled,
      shadowX: (content?.shadowX ?? 0) * scale,
      shadowY: (content?.shadowY ?? 0) * scale,
      shadowBlur: (content?.shadowBlur ?? 0) * scale,
      shadowSpread: (content?.shadowSpread ?? 0) * scale,
      shadowColor: content?.shadowColor,
    }),
  } as const;

  if (shapeType === "circle") {
    return { ...shared, borderRadius: "999px" };
  }
  if (shapeType === "line") {
    return { ...shared, height: Math.max(2, Number(content?.strokeWidth ?? 4) * scale), borderRadius: 999 };
  }
  if (shapeType === "triangle") {
    return {
      ...shared,
      clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
    };
  }
  if (shapeType === "star") {
    return {
      ...shared,
      clipPath:
        "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
    };
  }
  return {
    ...shared,
    borderRadius: `${Math.max(0, Number(content?.borderRadius ?? 12) * scale)}px`,
  };
}

function CollectionCanvasPreview({ collection }: { collection: Collection }) {
  const previewFrameWidth = 220;
  const previewFrameHeight = 220;
  const canvasRatio = collection.canvas_width / Math.max(1, collection.canvas_height);
  const previewItems = (collection.items ?? []).slice(0, 12);
  const itemBounds = previewItems.reduce(
    (acc, item) => {
      const x = Number(item.pos_x ?? 0);
      const y = Number(item.pos_y ?? 0);
      const width = Math.max(1, Number(item.width ?? 0));
      const height = Math.max(1, Number(item.height ?? 0));

      return {
        minX: Math.min(acc.minX, x),
        minY: Math.min(acc.minY, y),
        maxX: Math.max(acc.maxX, x + width),
        maxY: Math.max(acc.maxY, y + height),
      };
    },
    {
      minX: collection.canvas_width * 0.18,
      minY: collection.canvas_height * 0.14,
      maxX: collection.canvas_width * 0.82,
      maxY: collection.canvas_height * 0.72,
    }
  );
  const contentWidth = Math.max(1, itemBounds.maxX - itemBounds.minX);
  const contentHeight = Math.max(1, itemBounds.maxY - itemBounds.minY);
  const contentCenterX = itemBounds.minX + contentWidth / 2;
  const contentCenterY = itemBounds.minY + contentHeight / 2;
  const zoomFactor = previewItems.length > 0
    ? Math.min(
        1.1,
        Math.max(
          canvasRatio < 0.9 ? 0.98 : 1,
          Math.min(
            (collection.canvas_width * 0.92) / contentWidth,
            (collection.canvas_height * 0.9) / contentHeight
          )
        )
      )
    : (canvasRatio < 0.9 ? 1.02 : canvasRatio > 1.2 ? 1.01 : 1);
  const scale = Math.max(
    previewFrameWidth / Math.max(1, collection.canvas_width),
    previewFrameHeight / Math.max(1, collection.canvas_height)
  ) * zoomFactor;
  const previewWidth = Math.max(previewFrameWidth, collection.canvas_width * scale);
  const previewHeight = Math.max(previewFrameHeight, collection.canvas_height * scale);
  const overflowX = Math.max(0, previewWidth - previewFrameWidth);
  const overflowY = Math.max(0, previewHeight - previewFrameHeight);
  const scaledCenterX = contentCenterX * scale;
  const scaledCenterY = contentCenterY * scale;
  const targetCenterX = previewFrameWidth / 2;
  const targetCenterY = previewFrameHeight * (canvasRatio < 0.9 ? 0.38 : 0.44);
  const offsetX = Math.min(
    overflowX,
    Math.max(0, scaledCenterX - targetCenterX)
  );
  const offsetY = Math.min(
    overflowY,
    Math.max(0, scaledCenterY - targetCenterY)
  );

  return (
    <div className="relative flex h-64 items-center justify-center overflow-hidden border-b border-neutral-100 bg-[linear-gradient(180deg,#FBF8F1_0%,#F4EFE7_100%)] px-4 py-4">
      <div
        className="relative overflow-hidden rounded-[24px] border border-white/80 bg-white shadow-[0_16px_38px_rgba(15,61,58,0.12)]"
        style={{
          width: previewFrameWidth,
          height: previewFrameHeight,
        }}
      >
        <div
          className="absolute overflow-hidden"
          style={{
            width: previewWidth,
            height: previewHeight,
            left: -offsetX,
            top: -offsetY,
            background: collection.background_style || collection.background_color || "#FFFFFF",
          }}
        >
          {collection.background_image_url && (
            <img
              src={collection.background_image_url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          {previewItems.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 text-[10px] font-medium text-neutral-400">
              <Layers2 className="h-4 w-4 opacity-60" />
              <span>
                {collection.canvas_width} × {collection.canvas_height}
              </span>
            </div>
          )}

          {previewItems.map((item) => {
            const left = Number(item.pos_x ?? 0) * scale;
            const top = Number(item.pos_y ?? 0) * scale;
            const width = Math.max(8, Number(item.width ?? 60) * scale);
            const height = Math.max(8, Number(item.height ?? 40) * scale);
            const content = item.content ?? {};

            if (item.element_type === "text") {
              return (
                <div
                  key={`collection-preview-text-${collection.id}-${item.id}`}
                  style={{
                    position: "absolute",
                    left,
                    top,
                    width,
                    minHeight: height,
                    color: content?.color ?? "#1A1A1A",
                    fontSize: Math.max(6, Number(content?.fontSize ?? 16) * scale * 0.72),
                    fontWeight: content?.fontWeight ?? "700",
                    lineHeight: content?.lineHeight ?? 1.1,
                    letterSpacing: `${(content?.letterSpacing ?? 0) * scale}px`,
                    padding: `${Math.max(0, Number(content?.paddingY ?? 0) * scale)}px ${Math.max(0, Number(content?.paddingX ?? 0) * scale)}px`,
                    overflow: "hidden",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    opacity: 0.96,
                  }}
                >
                  {String(content?.text ?? "").slice(0, 52)}
                </div>
              );
            }

            if (item.element_type === "shape") {
              const shapeStyle = getShapePreviewStyle(content, scale);
              return (
                <div
                  key={`collection-preview-shape-${collection.id}-${item.id}`}
                  style={{
                    position: "absolute",
                    left,
                    top,
                    width,
                    height,
                    ...shapeStyle,
                  }}
                />
              );
            }

            if (item.element_type === "image" || item.element_type === "product") {
              const imageUrl = String(content?.url ?? item.product_image ?? "");
              if (imageUrl) {
                return (
                  <img
                    key={`collection-preview-image-${collection.id}-${item.id}`}
                    src={imageUrl}
                    alt=""
                    style={{
                      position: "absolute",
                      left,
                      top,
                      width,
                      height,
                      objectFit: "cover",
                      borderRadius: `${Math.max(2, Number(content?.borderRadius ?? 10) * scale)}px`,
                      boxShadow: buildBoxShadow({
                        shadowEnabled: content?.shadowEnabled,
                        shadowX: (content?.shadowX ?? 0) * scale,
                        shadowY: (content?.shadowY ?? 0) * scale,
                        shadowBlur: (content?.shadowBlur ?? 0) * scale,
                        shadowSpread: (content?.shadowSpread ?? 0) * scale,
                        shadowColor: content?.shadowColor,
                      }),
                    }}
                  />
                );
              }

              return (
                <div
                  key={`collection-preview-placeholder-${collection.id}-${item.id}`}
                  style={{
                    position: "absolute",
                    left,
                    top,
                    width,
                    height,
                    borderRadius: `${Math.max(2, Number(content?.borderRadius ?? 10) * scale)}px`,
                    background: item.element_type === "product" ? "#DCE5E0" : "#E7E5E4",
                  }}
                />
              );
            }

            return null;
          })}
        </div>
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55)",
          }}
        />
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

  useEffect(() => {
    const collectionsNeedingPreview = collections.filter(
      (collection) =>
        !Array.isArray(collection.items) ||
        collection.items.length === 0 ||
        collection.background_style === undefined
    );

    if (collectionsNeedingPreview.length === 0) return;

    let cancelled = false;

    Promise.all(
      collectionsNeedingPreview.map(async (collection) => {
        try {
          const res = await apiFetch(`/api/collections/${collection.id}`);
          const data = await res.json();
          if (!data?.ok || !data?.data) return null;

          return {
            id: collection.id,
            items: Array.isArray(data.data.items) ? data.data.items : [],
            background_style: data.data.background_style ?? null,
            background_image_url: data.data.background_image_url ?? null,
            background_color: data.data.background_color ?? collection.background_color,
            canvas_width: data.data.canvas_width ?? collection.canvas_width,
            canvas_height: data.data.canvas_height ?? collection.canvas_height,
          };
        } catch {
          return null;
        }
      })
    ).then((results) => {
      if (cancelled) return;
      const updates = results.filter(Boolean) as Array<Partial<Collection> & { id: number }>;
      if (updates.length === 0) return;

      setCollections((current) =>
        current.map((collection) => {
          const update = updates.find((item) => item.id === collection.id);
          return update ? { ...collection, ...update } : collection;
        })
      );
    });

    return () => {
      cancelled = true;
    };
  }, [collections]);

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
        <div className="flex items-center gap-2">
          <Link
            href="/seller/templates"
            className="flex items-center gap-2 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            <Copy className="h-4 w-4" />
            Ver plantillas
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
              <CollectionCanvasPreview collection={col} />

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
