"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  X,
  Search,
  GripVertical,
  Check,
  Loader2,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

type CanvasItem = {
  id: number;
  product_id: string;
  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
  z_index: number;
  product_name: string;
  product_image: string | null;
  product_price: number;
};

type CollectionData = {
  id: number;
  name: string;
  description: string | null;
  status: "draft" | "published";
  background_color: string;
  background_image_url: string | null;
  canvas_width: number;
  canvas_height: number;
};

type Product = {
  id: string;
  nombre: string;
  imagen_url: string | null;
  precio: number;
};

const CANVAS_DEFAULTS = { width: 800, height: 600 };

// ─── Main component ───────────────────────────────────────────────────────────

export default function CollectionEditorPage() {
  const { id } = useParams<{ id: string }>();
  const collectionId = Number(id);

  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  // Local editable fields (synced to server on save)
  const [name, setName] = useState("");
  const [bgColor, setBgColor] = useState("#FFFFFF");

  const canvasRef = useRef<HTMLDivElement>(null);

  const dragState = useRef<{
    itemId: number;
    startPX: number;
    startPY: number;
    origX: number;
    origY: number;
  } | null>(null);

  const resizeState = useRef<{
    itemId: number;
    corner: "nw" | "ne" | "sw" | "se";
    startPX: number;
    startPY: number;
    origX: number;
    origY: number;
    origW: number;
    origH: number;
  } | null>(null);

  // Ref to always-current items for use inside pointer handlers
  const itemsRef = useRef<CanvasItem[]>([]);
  itemsRef.current = items;

  // ── Load data ──────────────────────────────────────────────────────────────

  useEffect(() => {
    Promise.all([
      apiFetch(`/api/collections/${collectionId}`).then((r) => r.json()),
      apiFetch("/api/seller/products").then((r) => r.json()),
    ])
      .then(([colRes, prodRes]) => {
        const col: CollectionData = colRes.data;
        setCollection(col);
        setItems(colRes.data.items ?? []);
        setName(col.name);
        setBgColor(col.background_color ?? "#FFFFFF");
        const rawProducts: Product[] =
          prodRes.data ?? prodRes.productos ?? prodRes ?? [];
        setProducts(rawProducts.filter((p: any) => p.activo !== false));
      })
      .finally(() => setLoading(false));
  }, [collectionId]);

  // ── Save collection metadata ───────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!collection) return;
    setSaving(true);
    try {
      await apiFetch(`/api/collections/${collectionId}`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          background_color: bgColor,
        }),
      });
      setCollection((prev) => prev ? { ...prev, name, background_color: bgColor } : prev);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [collectionId, name, bgColor, collection]);

  // ── Publish toggle ─────────────────────────────────────────────────────────

  const handleTogglePublish = useCallback(async () => {
    const res = await apiFetch(`/api/collections/${collectionId}/publish`, {
      method: "PATCH",
    });
    const data = await res.json();
    if (data.ok) {
      setCollection((prev) =>
        prev ? { ...prev, status: data.data.status } : prev
      );
    }
  }, [collectionId]);

  // ── Sidebar drag → canvas drop ─────────────────────────────────────────────

  const handleSidebarDragStart = (e: React.DragEvent, product: Product) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", JSON.stringify(product));
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleCanvasDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;

    let product: Product;
    try {
      product = JSON.parse(e.dataTransfer.getData("text/plain"));
    } catch {
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const pos_x = Math.max(0, e.clientX - rect.left - 75);
    const pos_y = Math.max(0, e.clientY - rect.top - 75);

    const res = await apiFetch(`/api/collections/${collectionId}/items`, {
      method: "POST",
      body: JSON.stringify({
        product_id: product.id,
        pos_x,
        pos_y,
        width: 150,
        height: 150,
        z_index: itemsRef.current.length,
      }),
    });
    const data = await res.json();

    if (data.ok) {
      const newItem: CanvasItem = {
        id: data.data.id,
        product_id: product.id,
        pos_x,
        pos_y,
        width: 150,
        height: 150,
        z_index: itemsRef.current.length,
        product_name: product.nombre,
        product_image: product.imagen_url,
        product_price: product.precio,
      };
      setItems((prev) => [...prev, newItem]);
    }
  };

  // ── Canvas item: pointer-based drag to reposition ──────────────────────────

  const handleItemPointerDown = (e: React.PointerEvent, itemId: number) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const item = itemsRef.current.find((i) => i.id === itemId);
    if (!item) return;
    dragState.current = {
      itemId,
      startPX: e.clientX,
      startPY: e.clientY,
      origX: item.pos_x,
      origY: item.pos_y,
    };
    setSelectedItemId(itemId);
    // Bring to front
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId ? { ...i, z_index: Math.max(...prev.map((x) => x.z_index)) + 1 } : i
      )
    );
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (!collection) return;

    // ── Resize ──
    if (resizeState.current) {
      const { itemId, corner, startPX, startPY, origX, origY, origW, origH } = resizeState.current;
      const dx = e.clientX - startPX;
      const dy = e.clientY - startPY;
      const MIN = 50;

      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== itemId) return item;
          let pos_x = item.pos_x, pos_y = item.pos_y;
          let width = item.width, height = item.height;
          switch (corner) {
            case "se":
              width = Math.max(MIN, origW + dx);
              height = Math.max(MIN, origH + dy);
              break;
            case "sw":
              width = Math.max(MIN, origW - dx);
              pos_x = origX + origW - width;
              height = Math.max(MIN, origH + dy);
              break;
            case "ne":
              width = Math.max(MIN, origW + dx);
              height = Math.max(MIN, origH - dy);
              pos_y = origY + origH - height;
              break;
            case "nw":
              width = Math.max(MIN, origW - dx);
              pos_x = origX + origW - width;
              height = Math.max(MIN, origH - dy);
              pos_y = origY + origH - height;
              break;
          }
          return { ...item, pos_x, pos_y, width, height };
        })
      );
      return;
    }

    // ── Move ──
    if (!dragState.current) return;
    const { itemId, startPX, startPY, origX, origY } = dragState.current;
    const dx = e.clientX - startPX;
    const dy = e.clientY - startPY;

    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          pos_x: Math.max(0, Math.min(collection.canvas_width - item.width, origX + dx)),
          pos_y: Math.max(0, Math.min(collection.canvas_height - item.height, origY + dy)),
        };
      })
    );
  };

  const handleCanvasPointerUp = async () => {
    // ── Resize end ──
    if (resizeState.current) {
      const { itemId } = resizeState.current;
      resizeState.current = null;
      const item = itemsRef.current.find((i) => i.id === itemId);
      if (item) {
        apiFetch(`/api/collections/${collectionId}/items/${itemId}`, {
          method: "PUT",
          body: JSON.stringify({ pos_x: item.pos_x, pos_y: item.pos_y, width: item.width, height: item.height }),
        });
      }
      return;
    }

    // ── Move end ──
    if (!dragState.current) return;
    const { itemId } = dragState.current;
    dragState.current = null;

    const item = itemsRef.current.find((i) => i.id === itemId);
    if (!item) return;

    apiFetch(`/api/collections/${collectionId}/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ pos_x: item.pos_x, pos_y: item.pos_y, z_index: item.z_index }),
    });
  };

  // ── Remove item from canvas ────────────────────────────────────────────────

  const handleRemoveItem = async (itemId: number) => {
    await apiFetch(`/api/collections/${collectionId}/items/${itemId}`, {
      method: "DELETE",
    });
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    if (selectedItemId === itemId) setSelectedItemId(null);
  };

  // ── Keyboard shortcuts ────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedItemId !== null) {
        handleRemoveItem(selectedItemId);
      }
      if (e.key === "Escape") setSelectedItemId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedItemId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Resize handle: pointer down on a corner ───────────────────────────────

  const handleResizePointerDown = (
    e: React.PointerEvent,
    itemId: number,
    corner: "nw" | "ne" | "sw" | "se"
  ) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const item = itemsRef.current.find((i) => i.id === itemId);
    if (!item) return;
    resizeState.current = {
      itemId,
      corner,
      startPX: e.clientX,
      startPY: e.clientY,
      origX: item.pos_x,
      origY: item.pos_y,
      origW: item.width,
      origH: item.height,
    };
  };

  // ── Filtered products for sidebar ──────────────────────────────────────────

  const filteredProducts = products.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  // ─────────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="py-20 text-center text-neutral-500">
        Colección no encontrada.{" "}
        <Link href="/seller/collections" className="underline">
          Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Topbar ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3">
        <Link
          href="/seller/collections"
          className="flex items-center gap-1.5 text-sm text-neutral-500 transition hover:text-neutral-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Colecciones
        </Link>

        <div className="mx-2 h-5 w-px bg-neutral-200" />

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la colección"
          maxLength={120}
          className="min-w-0 flex-1 bg-transparent text-base font-semibold text-neutral-800 outline-none placeholder:text-neutral-400"
        />

        {/* Status badge */}
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
            collection.status === "published"
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {collection.status === "published" ? "Publicada" : "Borrador"}
        </span>

        {/* Publish toggle */}
        <button
          onClick={handleTogglePublish}
          title={collection.status === "published" ? "Pasar a borrador" : "Publicar"}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50"
        >
          {collection.status === "published" ? (
            <>
              <EyeOff className="h-3.5 w-3.5" /> Despublicar
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" /> Publicar
            </>
          )}
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-[#0F3D3A] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[#14544f] disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : saved ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {saved ? "Guardado" : "Guardar"}
        </button>
      </div>

      {/* ── Editor body ─────────────────────────────────────────────────────── */}
      <div
        className="flex gap-4 overflow-hidden rounded-xl"
        style={{ height: "calc(100vh - 260px)" }}
      >
        {/* ── Product sidebar ────────────────────────────────────────────── */}
        <aside className="flex w-60 shrink-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-100 p-3">
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Mis productos
            </p>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full rounded-lg border border-neutral-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#0F3D3A] focus:ring-2 focus:ring-[#0F3D3A]/20"
              />
            </div>
          </div>

          <div className="flex-1 space-y-1.5 overflow-y-auto p-2">
            {filteredProducts.length === 0 && (
              <p className="py-8 text-center text-xs text-neutral-400">
                Sin resultados
              </p>
            )}
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                draggable
                onDragStart={(e) => handleSidebarDragStart(e, product)}
                className="flex cursor-grab items-center gap-2.5 rounded-lg border border-neutral-100 bg-neutral-50 p-2 transition hover:border-neutral-200 hover:bg-white active:cursor-grabbing"
                title="Arrastra al canvas"
              >
                <GripVertical className="h-3.5 w-3.5 shrink-0 text-neutral-300" />
                {product.imagen_url ? (
                  <img
                    src={product.imagen_url}
                    alt={product.nombre}
                    className="h-10 w-10 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 shrink-0 rounded-md bg-neutral-200" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-neutral-700">
                    {product.nombre}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Q{product.precio.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Canvas area ────────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
          {/* Canvas toolbar */}
          <div className="flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-2.5">
            <label className="flex items-center gap-2 text-xs text-neutral-500">
              Fondo:
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-6 w-10 cursor-pointer rounded border border-neutral-200"
                title="Color de fondo del canvas"
              />
            </label>
            <span className="text-xs text-neutral-400">
              {collection.canvas_width} × {collection.canvas_height} px
            </span>
            {selectedItemId && (
              <span className="ml-auto flex items-center gap-3 text-xs text-neutral-400">
                <span>Arrastra esquinas para redimensionar</span>
                <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[10px] font-mono">Delete</kbd>
                <span>eliminar</span>
                <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[10px] font-mono">Esc</kbd>
                <span>deseleccionar</span>
              </span>
            )}
            {!selectedItemId && items.length === 0 && (
              <span className="ml-auto text-xs text-neutral-400">
                Arrastra productos desde la barra izquierda al canvas
              </span>
            )}
          </div>

          {/* Scrollable canvas container */}
          <div
            className="flex flex-1 items-center justify-center overflow-auto p-8"
            onClick={() => setSelectedItemId(null)}
          >
            {/* The actual canvas */}
            <div
              ref={canvasRef}
              className="relative shrink-0 shadow-xl"
              style={{
                width: collection.canvas_width,
                height: collection.canvas_height,
                backgroundColor: bgColor,
              }}
              onDragOver={handleCanvasDragOver}
              onDrop={handleCanvasDrop}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              onPointerLeave={handleCanvasPointerUp}
            >
              {/* Empty state hint */}
              {items.length === 0 && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
                  <p className="text-sm font-medium text-neutral-400">
                    Canvas vacío
                  </p>
                  <p className="text-xs text-neutral-300">
                    Arrastra productos desde el panel izquierdo
                  </p>
                </div>
              )}

              {/* Canvas items */}
              {items.map((item) => {
                const isSelected = selectedItemId === item.id;
                return (
                  <div
                    key={item.id}
                    style={{
                      position: "absolute",
                      left: item.pos_x,
                      top: item.pos_y,
                      width: item.width,
                      height: item.height,
                      zIndex: item.z_index,
                      cursor: "grab",
                      touchAction: "none",
                    }}
                    className={`group rounded-lg transition-shadow ${
                      isSelected
                        ? "ring-2 ring-[#0F3D3A] ring-offset-1 shadow-lg"
                        : "hover:shadow-md"
                    }`}
                    onPointerDown={(e) => handleItemPointerDown(e, item.id)}
                  >
                    {/* Product image */}
                    {item.product_image ? (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="h-full w-full rounded-lg object-cover"
                        draggable={false}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-lg bg-neutral-200">
                        <span className="text-xs text-neutral-400">Sin imagen</span>
                      </div>
                    )}

                    {/* Overlay: name + price on hover */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-lg bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="truncate text-[11px] font-medium text-white">
                        {item.product_name}
                      </p>
                      <p className="text-[10px] text-white/80">
                        Q{item.product_price.toFixed(2)}
                      </p>
                    </div>

                    {/* Remove button + resize handles (visible when selected) */}
                    {isSelected && (
                      <>
                        <button
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.id); }}
                          className="absolute -right-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow transition hover:bg-red-600"
                          title="Quitar (Delete)"
                        >
                          <X className="h-3 w-3" />
                        </button>

                        {(["nw", "ne", "sw", "se"] as const).map((corner) => (
                          <div
                            key={corner}
                            onPointerDown={(e) => handleResizePointerDown(e, item.id, corner)}
                            style={{
                              position: "absolute",
                              width: 10,
                              height: 10,
                              background: "white",
                              border: "2px solid #0F3D3A",
                              borderRadius: 2,
                              zIndex: 10,
                              ...(corner === "nw" && { left: -5, top: -5, cursor: "nw-resize" }),
                              ...(corner === "ne" && { right: -5, top: -5, cursor: "ne-resize" }),
                              ...(corner === "sw" && { left: -5, bottom: -5, cursor: "sw-resize" }),
                              ...(corner === "se" && { right: -5, bottom: -5, cursor: "se-resize" }),
                            }}
                          />
                        ))}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
