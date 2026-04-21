"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Save, Eye, EyeOff, X, Search, GripVertical,
  Check, Loader2, MousePointer2, Type, Square, ImageIcon,
  AlignLeft, AlignCenter, AlignRight, Copy,
  ChevronUp, ChevronDown, FlipHorizontal, FlipVertical,
  Grid3x3,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type EntranceAnim = "none" | "fadeIn" | "slideUp" | "slideLeft" | "zoomIn";
type MotionAnim   = "none" | "float" | "pulse" | "spin" | "shake" | "bounce";

type ContentText = {
  text: string;
  fontSize: number;
  fontFamily?: string;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  color: string;
  textAlign: "left" | "center" | "right";
  bgColor?: string;
  bgOpacity?: number;
  shadow?: boolean;
  shadowColor?: string;
  shadowX?: number;
  shadowY?: number;
  shadowBlur?: number;
  outline?: boolean;
  outlineColor?: string;
  outlineWidth?: number;
  flipX?: boolean;
  flipY?: boolean;
  rotation?: number;
  animation?: EntranceAnim;
  motion?: MotionAnim;
};

type ContentShape = {
  shapeType: "rectangle" | "circle";
  fillColor: string;
  gradientEnabled?: boolean;
  gradientColor2?: string;
  gradientAngle?: number;
  gradientType?: "linear" | "radial";
  borderRadius: number;
  opacity: number;
  strokeColor?: string;
  strokeWidth?: number;
  flipX?: boolean;
  flipY?: boolean;
  rotation?: number;
  animation?: EntranceAnim;
  motion?: MotionAnim;
};

type ContentImage = {
  url: string;
  objectFit?: "cover" | "contain";
  borderRadius?: number;
  opacity?: number;
  flipX?: boolean;
  flipY?: boolean;
  rotation?: number;
  animation?: EntranceAnim;
  motion?: MotionAnim;
};

type ContentProduct = {
  flipX?: boolean;
  flipY?: boolean;
  rotation?: number;
  animation?: EntranceAnim;
  motion?: MotionAnim;
};

type CanvasItem = {
  id: number;
  element_type: "product" | "text" | "shape" | "image";
  content: ContentText | ContentShape | ContentImage | ContentProduct | null;
  product_id: string | null;
  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
  z_index: number;
  product_name: string | null;
  product_image: string | null;
  product_price: number | null;
};

type CollectionData = {
  id: number;
  name: string;
  description: string | null;
  status: "draft" | "published";
  background_color: string;
  background_style: string | null;
  background_image_url: string | null;
  canvas_width: number;
  canvas_height: number;
  items?: CanvasItem[];
};

type Product = { id: string; nombre: string; imagen_url: string | null; precio: number; };
type ActiveTool = "select" | "text" | "shape" | "image";

// ─── Google Fonts ──────────────────────────────────────────────────────────────

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@400;600;700&family=Lato:ital,wght@0,400;0,700;1,400&family=Raleway:wght@400;600;700&family=Oswald:wght@400;600;700&family=Pacifico&family=Dancing+Script:wght@400;700&family=Nunito:wght@400;600;700&family=Bebas+Neue&family=Satisfy&family=Abril+Fatface&family=Josefin+Sans:ital,wght@0,400;0,700&display=swap";

const GOOGLE_FONTS = [
  { label: "Sistema",           value: "inherit" },
  { label: "Montserrat",        value: "'Montserrat', sans-serif" },
  { label: "Lato",              value: "'Lato', sans-serif" },
  { label: "Nunito",            value: "'Nunito', sans-serif" },
  { label: "Raleway",           value: "'Raleway', sans-serif" },
  { label: "Josefin Sans",      value: "'Josefin Sans', sans-serif" },
  { label: "Oswald",            value: "'Oswald', sans-serif" },
  { label: "Bebas Neue",        value: "'Bebas Neue', sans-serif" },
  { label: "Abril Fatface",     value: "'Abril Fatface', serif" },
  { label: "Playfair Display",  value: "'Playfair Display', serif" },
  { label: "Pacifico",          value: "'Pacifico', cursive" },
  { label: "Dancing Script",    value: "'Dancing Script', cursive" },
  { label: "Satisfy",           value: "'Satisfy', cursive" },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_TEXT: ContentText = {
  text: "Texto",
  fontSize: 28,
  fontFamily: "inherit",
  fontWeight: "bold",
  fontStyle: "normal",
  color: "#1a1a1a",
  textAlign: "center",
  bgColor: undefined,
  bgOpacity: 0.6,
  shadow: false,
  shadowColor: "#000000",
  shadowX: 2,
  shadowY: 2,
  shadowBlur: 4,
  outline: false,
  outlineColor: "#000000",
  outlineWidth: 1,
  flipX: false,
  flipY: false,
  rotation: 0,
  animation: "none",
  motion: "none",
};

const DEFAULT_SHAPE: ContentShape = {
  shapeType: "rectangle",
  fillColor: "#0F3D3A",
  gradientEnabled: false,
  gradientColor2: "#AADDCC",
  gradientAngle: 135,
  gradientType: "linear",
  borderRadius: 12,
  opacity: 1,
  strokeColor: "#000000",
  strokeWidth: 0,
  flipX: false,
  flipY: false,
  rotation: 0,
  animation: "none",
  motion: "none",
};

const DEFAULT_IMAGE: ContentImage = {
  url: "",
  objectFit: "cover",
  borderRadius: 8,
  opacity: 1,
  flipX: false,
  flipY: false,
  rotation: 0,
  animation: "none",
  motion: "none",
};

const ENTRANCE_ANIMS: { value: EntranceAnim; label: string }[] = [
  { value: "none",      label: "Sin entrada" },
  { value: "fadeIn",    label: "Aparecer" },
  { value: "slideUp",   label: "Subir" },
  { value: "slideLeft", label: "Deslizar" },
  { value: "zoomIn",    label: "Zoom" },
];

const MOTION_ANIMS: { value: MotionAnim; label: string }[] = [
  { value: "none",   label: "Sin movimiento" },
  { value: "float",  label: "Flotar" },
  { value: "pulse",  label: "Pulso" },
  { value: "spin",   label: "Rotar" },
  { value: "shake",  label: "Vibrar" },
  { value: "bounce", label: "Rebotar" },
];

const MOTION_DURATION: Record<MotionAnim, string> = {
  none: "",
  float:  "3s ease-in-out infinite",
  pulse:  "2s ease-in-out infinite",
  spin:   "4s linear infinite",
  shake:  "0.5s ease-in-out infinite",
  bounce: "1s ease-in-out infinite",
};

const GRID_OPTIONS = [
  { label: "Off", value: 0 },
  { label: "8px",  value: 8 },
  { label: "16px", value: 16 },
  { label: "32px", value: 32 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getShapeBackground(sc: ContentShape): string {
  if (sc.gradientEnabled && sc.gradientColor2) {
    if (sc.gradientType === "radial")
      return `radial-gradient(circle, ${sc.fillColor}, ${sc.gradientColor2})`;
    return `linear-gradient(${sc.gradientAngle ?? 135}deg, ${sc.fillColor}, ${sc.gradientColor2})`;
  }
  return sc.fillColor || "#0F3D3A";
}

function buildTransform(rotation: number, flipX: boolean, flipY: boolean): string | undefined {
  const parts: string[] = [];
  if (rotation) parts.push(`rotate(${rotation}deg)`);
  if (flipX) parts.push("scaleX(-1)");
  if (flipY) parts.push("scaleY(-1)");
  return parts.length ? parts.join(" ") : undefined;
}

function snapToGrid(v: number, grid: number): number {
  if (grid === 0) return v;
  return Math.round(v / grid) * grid;
}

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CollectionEditorPage() {
  const { id } = useParams<{ id: string }>();
  const collectionId = Number(id);

  const [collection, setCollection]         = useState<CollectionData | null>(null);
  const [items, setItems]                   = useState<CanvasItem[]>([]);
  const [products, setProducts]             = useState<Product[]>([]);
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [saved, setSaved]                   = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [search, setSearch]                 = useState("");
  const [activeTool, setActiveTool]         = useState<ActiveTool>("select");
  const [name, setName]                     = useState("");
  const [bgColor, setBgColor]               = useState("#FFFFFF");
  const [bgGradient, setBgGradient]         = useState({
    enabled: false, color2: "#AADDCC", angle: 135, type: "linear" as "linear" | "radial",
  });
  const [textDefaults, setTextDefaults]     = useState<ContentText>({ ...DEFAULT_TEXT });
  const [shapeDefaults, setShapeDefaults]   = useState<ContentShape>({ ...DEFAULT_SHAPE });
  const [gridSnap, setGridSnap]             = useState(0);
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef                       = useRef<HTMLInputElement>(null);

  const canvasRef      = useRef<HTMLDivElement>(null);
  const dragState      = useRef<{ itemId: number; startPX: number; startPY: number; origX: number; origY: number } | null>(null);
  const resizeState    = useRef<{ itemId: number; corner: "nw"|"ne"|"sw"|"se"; startPX: number; startPY: number; origX: number; origY: number; origW: number; origH: number } | null>(null);
  const debounceTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});
  const itemsRef       = useRef<CanvasItem[]>([]);
  itemsRef.current     = items;

  const computedBg = bgGradient.enabled
    ? bgGradient.type === "radial"
      ? `radial-gradient(circle, ${bgColor}, ${bgGradient.color2})`
      : `linear-gradient(${bgGradient.angle}deg, ${bgColor}, ${bgGradient.color2})`
    : bgColor;

  // ── Load Google Fonts ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!document.getElementById("gf-collections")) {
      const link = document.createElement("link");
      link.id = "gf-collections";
      link.rel = "stylesheet";
      link.href = GOOGLE_FONTS_URL;
      document.head.appendChild(link);
    }
  }, []);

  // ── Load data ──────────────────────────────────────────────────────────────

  useEffect(() => {
    Promise.all([
      apiFetch(`/api/collections/${collectionId}`).then((r) => r.json()),
      apiFetch("/api/seller/products").then((r) => r.json()),
    ]).then(([colRes, prodRes]) => {
      const col: CollectionData | undefined = colRes?.data;
      if (!col) return;

      setCollection(col);
      setItems(col.items ?? []);
      setName(col.name);
      setBgColor(col.background_color ?? "#FFFFFF");

      const bs = col.background_style;
      if (bs) {
        const linMatch = bs.match(/linear-gradient\((\d+)deg,\s*([^,]+),\s*([^)]+)\)/);
        if (linMatch) {
          setBgColor(linMatch[2].trim());
          setBgGradient({ enabled: true, type: "linear", angle: Number(linMatch[1]), color2: linMatch[3].trim() });
        } else {
          const radMatch = bs.match(/radial-gradient\(circle,\s*([^,]+),\s*([^)]+)\)/);
          if (radMatch) {
            setBgColor(radMatch[1].trim());
            setBgGradient({ enabled: true, type: "radial", angle: 135, color2: radMatch[2].trim() });
          }
        }
      }

      const rawProducts: any = prodRes?.data ?? prodRes?.productos;
      const raw: Product[] = Array.isArray(rawProducts) ? rawProducts
        : Array.isArray(prodRes) ? prodRes : [];
      setProducts(raw.filter((p: any) => p.activo !== false));
    }).catch((err) => {
      console.error("[collections editor] load failed:", err);
    }).finally(() => setLoading(false));
  }, [collectionId]);

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!collection) return;
    setSaving(true);
    try {
      await apiFetch(`/api/collections/${collectionId}`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          background_color: bgColor,
          background_style: bgGradient.enabled ? computedBg : null,
        }),
      });
      setCollection((prev) => prev ? { ...prev, name, background_color: bgColor } : prev);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [collectionId, name, bgColor, bgGradient, computedBg, collection]);

  // ── Publish ────────────────────────────────────────────────────────────────

  const handleTogglePublish = useCallback(async () => {
    const res = await apiFetch(`/api/collections/${collectionId}/publish`, { method: "PATCH" });
    const data = await res.json();
    if (data.ok) setCollection((p) => p ? { ...p, status: data.data.status } : p);
  }, [collectionId]);

  // ── Image upload ───────────────────────────────────────────────────────────

  const handleImageFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!collection) return;
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setImageUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await apiFetch(`/api/collections/${collectionId}/images`, { method: "POST", body: form });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message);

      const pos_x = snapToGrid(Math.round((collection.canvas_width - 200) / 2), gridSnap);
      const pos_y = snapToGrid(Math.round((collection.canvas_height - 200) / 2), gridSnap);
      const content: ContentImage = { ...DEFAULT_IMAGE, url: data.url };

      const addRes = await apiFetch(`/api/collections/${collectionId}/items`, {
        method: "POST",
        body: JSON.stringify({ element_type: "image", content, pos_x, pos_y, width: 200, height: 200, z_index: itemsRef.current.length }),
      });
      const addData = await addRes.json();
      if (addData.ok) {
        setItems((prev) => [...prev, {
          id: addData.data.id, element_type: "image", content,
          product_id: null, pos_x, pos_y, width: 200, height: 200,
          z_index: prev.length,
          product_name: null, product_image: null, product_price: null,
        }]);
        setSelectedItemId(addData.data.id);
        setActiveTool("select");
      }
    } catch (err) {
      console.error("[image upload]", err);
      alert("Error al subir imagen");
    } finally {
      setImageUploading(false);
    }
  }, [collection, collectionId, gridSnap]);

  // ── Drag product from sidebar → canvas ─────────────────────────────────────

  const handleSidebarDragStart = (e: React.DragEvent, product: Product) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", JSON.stringify(product));
  };

  const handleCanvasDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; };

  const handleCanvasDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    let product: Product;
    try { product = JSON.parse(e.dataTransfer.getData("text/plain")); } catch { return; }
    const rect = canvasRef.current.getBoundingClientRect();
    const pos_x = snapToGrid(Math.max(0, e.clientX - rect.left - 75), gridSnap);
    const pos_y = snapToGrid(Math.max(0, e.clientY - rect.top - 75), gridSnap);
    const res = await apiFetch(`/api/collections/${collectionId}/items`, {
      method: "POST",
      body: JSON.stringify({ element_type: "product", product_id: product.id, pos_x, pos_y, width: 150, height: 150, z_index: itemsRef.current.length }),
    });
    const data = await res.json();
    if (data.ok) {
      setItems((prev) => [...prev, {
        id: data.data.id, element_type: "product", content: null,
        product_id: product.id, pos_x, pos_y, width: 150, height: 150,
        z_index: prev.length,
        product_name: product.nombre, product_image: product.imagen_url, product_price: product.precio,
      }]);
    }
  };

  // ── Canvas click → place text / shape ─────────────────────────────────────

  const handleCanvasClick = async (e: React.MouseEvent) => {
    if (activeTool === "select" || activeTool === "image") return;
    if (!canvasRef.current) return;
    if ((e.target as HTMLElement).closest("[data-canvas-item]")) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const pos_x = snapToGrid(Math.max(0, e.clientX - rect.left - 100), gridSnap);
    const pos_y = snapToGrid(Math.max(0, e.clientY - rect.top - 35), gridSnap);
    const element_type = activeTool;
    const content = element_type === "text" ? { ...textDefaults } : { ...shapeDefaults };
    const width = element_type === "text" ? 220 : 150;
    const height = element_type === "text" ? 70 : 150;
    const res = await apiFetch(`/api/collections/${collectionId}/items`, {
      method: "POST",
      body: JSON.stringify({ element_type, content, pos_x, pos_y, width, height, z_index: itemsRef.current.length }),
    });
    const data = await res.json();
    if (data.ok) {
      setItems((prev) => [...prev, {
        id: data.data.id, element_type, content,
        product_id: null, pos_x, pos_y, width, height, z_index: prev.length,
        product_name: null, product_image: null, product_price: null,
      }]);
      setSelectedItemId(data.data.id);
      setActiveTool("select");
    }
  };

  // ── Content update (debounced save) ───────────────────────────────────────

  const updateItemContent = useCallback((itemId: number, newContent: ContentText | ContentShape | ContentImage | ContentProduct) => {
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, content: newContent } : i));
    if (debounceTimers.current[itemId]) clearTimeout(debounceTimers.current[itemId]);
    debounceTimers.current[itemId] = setTimeout(() => {
      apiFetch(`/api/collections/${collectionId}/items/${itemId}`, {
        method: "PUT", body: JSON.stringify({ content: newContent }),
      });
      delete debounceTimers.current[itemId];
    }, 600);
  }, [collectionId]);

  // ── Canvas item: move ──────────────────────────────────────────────────────

  const handleItemPointerDown = (e: React.PointerEvent, itemId: number) => {
    if (activeTool !== "select") return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const item = itemsRef.current.find((i) => i.id === itemId);
    if (!item) return;
    dragState.current = { itemId, startPX: e.clientX, startPY: e.clientY, origX: item.pos_x, origY: item.pos_y };
    setSelectedItemId(itemId);
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, z_index: Math.max(...prev.map((x) => x.z_index)) + 1 } : i));
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (!collection) return;
    if (resizeState.current) {
      const { itemId, corner, startPX, startPY, origX, origY, origW, origH } = resizeState.current;
      const dx = e.clientX - startPX, dy = e.clientY - startPY, MIN = 40;
      setItems((prev) => prev.map((item) => {
        if (item.id !== itemId) return item;
        let pos_x = item.pos_x, pos_y = item.pos_y, width = item.width, height = item.height;
        switch (corner) {
          case "se": width = Math.max(MIN, origW + dx); height = Math.max(MIN, origH + dy); break;
          case "sw": width = Math.max(MIN, origW - dx); pos_x = origX + origW - width; height = Math.max(MIN, origH + dy); break;
          case "ne": width = Math.max(MIN, origW + dx); height = Math.max(MIN, origH - dy); pos_y = origY + origH - height; break;
          case "nw": width = Math.max(MIN, origW - dx); pos_x = origX + origW - width; height = Math.max(MIN, origH - dy); pos_y = origY + origH - height; break;
        }
        return { ...item, pos_x, pos_y, width, height };
      }));
      return;
    }
    if (!dragState.current) return;
    const { itemId, startPX, startPY, origX, origY } = dragState.current;
    const dx = e.clientX - startPX, dy = e.clientY - startPY;
    setItems((prev) => prev.map((item) => item.id !== itemId ? item : {
      ...item,
      pos_x: Math.max(0, Math.min(collection.canvas_width - item.width, origX + dx)),
      pos_y: Math.max(0, Math.min(collection.canvas_height - item.height, origY + dy)),
    }));
  };

  const handleCanvasPointerUp = async () => {
    if (resizeState.current) {
      const { itemId } = resizeState.current;
      resizeState.current = null;
      const item = itemsRef.current.find((i) => i.id === itemId);
      if (item) {
        const snappedX = snapToGrid(item.pos_x, gridSnap);
        const snappedY = snapToGrid(item.pos_y, gridSnap);
        if (snappedX !== item.pos_x || snappedY !== item.pos_y) {
          setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, pos_x: snappedX, pos_y: snappedY } : i));
        }
        apiFetch(`/api/collections/${collectionId}/items/${itemId}`, {
          method: "PUT", body: JSON.stringify({ pos_x: snappedX, pos_y: snappedY, width: item.width, height: item.height }),
        });
      }
      return;
    }
    if (!dragState.current) return;
    const { itemId } = dragState.current;
    dragState.current = null;
    const item = itemsRef.current.find((i) => i.id === itemId);
    if (item) {
      const snappedX = snapToGrid(item.pos_x, gridSnap);
      const snappedY = snapToGrid(item.pos_y, gridSnap);
      if (snappedX !== item.pos_x || snappedY !== item.pos_y) {
        setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, pos_x: snappedX, pos_y: snappedY } : i));
      }
      apiFetch(`/api/collections/${collectionId}/items/${itemId}`, {
        method: "PUT", body: JSON.stringify({ pos_x: snappedX, pos_y: snappedY, z_index: item.z_index }),
      });
    }
  };

  const handleResizePointerDown = (e: React.PointerEvent, itemId: number, corner: "nw"|"ne"|"sw"|"se") => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const item = itemsRef.current.find((i) => i.id === itemId);
    if (!item) return;
    resizeState.current = { itemId, corner, startPX: e.clientX, startPY: e.clientY, origX: item.pos_x, origY: item.pos_y, origW: item.width, origH: item.height };
  };

  const handleRemoveItem = async (itemId: number) => {
    await apiFetch(`/api/collections/${collectionId}/items/${itemId}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    if (selectedItemId === itemId) setSelectedItemId(null);
  };

  // ── Duplicate ─────────────────────────────────────────────────────────────

  const handleDuplicate = useCallback(async (itemId: number) => {
    const item = itemsRef.current.find((i) => i.id === itemId);
    if (!item) return;
    const maxZ = Math.max(...itemsRef.current.map((i) => i.z_index), 0);
    const res = await apiFetch(`/api/collections/${collectionId}/items`, {
      method: "POST",
      body: JSON.stringify({
        element_type: item.element_type,
        product_id: item.product_id,
        content: item.content,
        pos_x: item.pos_x + 20,
        pos_y: item.pos_y + 20,
        width: item.width,
        height: item.height,
        z_index: maxZ + 1,
      }),
    });
    const data = await res.json();
    if (data.ok) {
      setItems((prev) => [...prev, { ...item, id: data.data.id, pos_x: item.pos_x + 20, pos_y: item.pos_y + 20, z_index: maxZ + 1 }]);
      setSelectedItemId(data.data.id);
    }
  }, [collectionId]);

  // ── Z-order ───────────────────────────────────────────────────────────────

  const handleBringToFront = useCallback((itemId: number) => {
    const maxZ = Math.max(...itemsRef.current.map((i) => i.z_index), 0);
    const newZ = maxZ + 1;
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, z_index: newZ } : i));
    apiFetch(`/api/collections/${collectionId}/items/${itemId}`, {
      method: "PUT", body: JSON.stringify({ z_index: newZ }),
    });
  }, [collectionId]);

  const handleSendToBack = useCallback((itemId: number) => {
    const minZ = Math.min(...itemsRef.current.map((i) => i.z_index), 0);
    const newZ = minZ - 1;
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, z_index: newZ } : i));
    apiFetch(`/api/collections/${collectionId}/items/${itemId}`, {
      method: "PUT", body: JSON.stringify({ z_index: newZ }),
    });
  }, [collectionId]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedItemId !== null) handleRemoveItem(selectedItemId);
      if (e.key === "Escape") { setSelectedItemId(null); setActiveTool("select"); }
      if (e.ctrlKey && e.key === "d") { e.preventDefault(); if (selectedItemId !== null) handleDuplicate(selectedItemId); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedItemId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Computed shortcuts ───────────────────────────────────────────────────

  const selectedItem     = items.find((i) => i.id === selectedItemId) ?? null;
  const filteredProducts = products.filter((p) => p.nombre.toLowerCase().includes(search.toLowerCase()));

  function getItemTransform(item: CanvasItem): string | undefined {
    const rotation = (item.content as any)?.rotation ?? 0;
    const flipX    = (item.content as any)?.flipX ?? false;
    const flipY    = (item.content as any)?.flipY ?? false;
    return buildTransform(rotation, flipX, flipY);
  }

  function getMotionStyle(item: CanvasItem): React.CSSProperties {
    const m: MotionAnim = (item.content as any)?.motion ?? "none";
    if (!m || m === "none") return {};
    return { animation: `canvas-${m} ${MOTION_DURATION[m]}` };
  }

  // Grid overlay CSS
  const gridOverlayStyle: React.CSSProperties = gridSnap > 0 ? {
    backgroundImage: `
      linear-gradient(to right,  rgba(99,102,241,0.12) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(99,102,241,0.12) 1px, transparent 1px)
    `,
    backgroundSize: `${gridSnap}px ${gridSnap}px`,
  } : {};

  // ─── Loading guards ───────────────────────────────────────────────────────

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-neutral-400" /></div>;
  if (!collection) return <div className="py-20 text-center text-neutral-500">Colección no encontrada. <Link href="/seller/collections" className="underline">Volver</Link></div>;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">
      {/* Motion keyframes */}
      <style>{`
        @keyframes canvas-float  { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-10px)} }
        @keyframes canvas-pulse  { 0%,100%{transform:scale(1)}       50%{transform:scale(1.06)} }
        @keyframes canvas-spin   { from{transform:rotate(0deg)}      to{transform:rotate(360deg)} }
        @keyframes canvas-shake  { 0%,100%{transform:translateX(0)}  25%,75%{transform:translateX(-5px)}  50%{transform:translateX(5px)} }
        @keyframes canvas-bounce { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-14px)} }
      `}</style>

      {/* Hidden image input */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleImageFileChange}
      />

      {/* ── Topbar ── */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3">
        <Link href="/seller/collections" className="flex items-center gap-1.5 text-sm text-neutral-500 transition hover:text-neutral-800">
          <ArrowLeft className="h-4 w-4" /> Colecciones
        </Link>
        <div className="mx-2 h-5 w-px bg-neutral-200" />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" maxLength={120}
          className="min-w-0 flex-1 bg-transparent text-base font-semibold text-neutral-800 outline-none placeholder:text-neutral-400" />
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${collection.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
          {collection.status === "published" ? "Publicada" : "Borrador"}
        </span>
        <button onClick={handleTogglePublish}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50">
          {collection.status === "published" ? <><EyeOff className="h-3.5 w-3.5" /> Despublicar</> : <><Eye className="h-3.5 w-3.5" /> Publicar</>}
        </button>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-[#0F3D3A] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[#14544f] disabled:opacity-60">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          {saved ? "Guardado" : "Guardar"}
        </button>
      </div>

      {/* ── Editor body ── */}
      <div className="flex gap-3 overflow-hidden rounded-xl" style={{ height: "calc(100vh - 260px)" }}>

        {/* ── Left sidebar ── */}
        <aside className="flex w-56 shrink-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-100 p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Herramienta</p>
            <div className="grid grid-cols-4 gap-1">
              {([
                { tool: "select" as ActiveTool, icon: MousePointer2, label: "Mover" },
                { tool: "text"   as ActiveTool, icon: Type,           label: "Texto" },
                { tool: "shape"  as ActiveTool, icon: Square,         label: "Forma" },
                { tool: "image"  as ActiveTool, icon: ImageIcon,      label: "Imagen" },
              ] as const).map(({ tool, icon: Icon, label }) => (
                <button key={tool} onClick={() => { setActiveTool(tool); setSelectedItemId(null); }}
                  className={`flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-medium transition ${activeTool === tool ? "bg-[#0F3D3A] text-white" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"}`}>
                  <Icon className="h-3.5 w-3.5" />{label}
                </button>
              ))}
            </div>
          </div>

          {activeTool === "select" ? (
            <>
              <div className="border-b border-neutral-100 px-3 pt-3 pb-2">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Mis productos</p>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..."
                    className="w-full rounded-lg border border-neutral-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#0F3D3A]" />
                </div>
              </div>
              <div className="flex-1 space-y-1.5 overflow-y-auto p-2">
                {filteredProducts.length === 0 && <p className="py-8 text-center text-xs text-neutral-400">Sin resultados</p>}
                {filteredProducts.map((p) => (
                  <div key={p.id} draggable onDragStart={(e) => handleSidebarDragStart(e, p)}
                    className="flex cursor-grab items-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50 p-2 transition hover:bg-white active:cursor-grabbing">
                    <GripVertical className="h-3.5 w-3.5 shrink-0 text-neutral-300" />
                    {p.imagen_url ? <img src={p.imagen_url} alt={p.nombre} className="h-9 w-9 shrink-0 rounded-md object-cover" /> : <div className="h-9 w-9 shrink-0 rounded-md bg-neutral-200" />}
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-neutral-700">{p.nombre}</p>
                      <p className="text-[11px] text-neutral-400">Q{Number(p.precio).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : activeTool === "text" ? (
            <div className="flex-1 space-y-3 overflow-y-auto p-3">
              <p className="text-xs leading-relaxed text-neutral-500">Haz clic en el canvas para colocar texto.</p>
              <div>
                <label className="text-[11px] font-medium text-neutral-500">Fuente</label>
                <select value={textDefaults.fontFamily ?? "inherit"}
                  onChange={(e) => setTextDefaults((p) => ({ ...p, fontFamily: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-neutral-200 px-2 py-1.5 text-xs outline-none">
                  {GOOGLE_FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-neutral-500">Tamaño</label>
                <input type="number" min={10} max={120} value={textDefaults.fontSize}
                  onChange={(e) => setTextDefaults((p) => ({ ...p, fontSize: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-lg border border-neutral-200 px-2 py-1 text-xs outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-neutral-500">Color</label>
                <input type="color" value={textDefaults.color}
                  onChange={(e) => setTextDefaults((p) => ({ ...p, color: e.target.value }))}
                  className="mt-1 h-8 w-full cursor-pointer rounded-lg border border-neutral-200" />
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setTextDefaults((p) => ({ ...p, fontWeight: p.fontWeight === "bold" ? "normal" : "bold" }))}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-bold transition ${textDefaults.fontWeight === "bold" ? "border-[#0F3D3A] bg-[#0F3D3A] text-white" : "border-neutral-200 text-neutral-500"}`}>B</button>
                <button onClick={() => setTextDefaults((p) => ({ ...p, fontStyle: p.fontStyle === "italic" ? "normal" : "italic" }))}
                  className={`flex-1 rounded-lg border py-1.5 text-xs italic transition ${textDefaults.fontStyle === "italic" ? "border-[#0F3D3A] bg-[#0F3D3A] text-white" : "border-neutral-200 text-neutral-500"}`}>i</button>
              </div>
            </div>
          ) : activeTool === "shape" ? (
            <div className="flex-1 space-y-3 overflow-y-auto p-3">
              <p className="text-xs leading-relaxed text-neutral-500">Haz clic en el canvas para colocar una forma.</p>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-neutral-500">Tipo</label>
                <div className="flex gap-1.5">
                  {(["rectangle","circle"] as const).map((t) => (
                    <button key={t} onClick={() => setShapeDefaults((p) => ({ ...p, shapeType: t }))}
                      className={`flex-1 rounded-lg border py-1.5 text-xs transition ${shapeDefaults.shapeType === t ? "border-[#0F3D3A] bg-[#0F3D3A] text-white" : "border-neutral-200 text-neutral-500"}`}>
                      {t === "rectangle" ? "Rect." : "Círculo"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-neutral-500">Color</label>
                <input type="color" value={shapeDefaults.fillColor}
                  onChange={(e) => setShapeDefaults((p) => ({ ...p, fillColor: e.target.value }))}
                  className="mt-1 h-8 w-full cursor-pointer rounded-lg border border-neutral-200" />
              </div>
            </div>
          ) : (
            /* ── Image tool sidebar ── */
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4">
              <ImageIcon className="h-10 w-10 text-neutral-300" />
              <p className="text-center text-xs leading-relaxed text-neutral-500">Sube una foto o ilustración para añadirla al canvas.</p>
              <button
                onClick={() => imageInputRef.current?.click()}
                disabled={imageUploading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F3D3A] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#14544f] disabled:opacity-60">
                {imageUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
                {imageUploading ? "Subiendo…" : "Seleccionar imagen"}
              </button>
              <p className="text-center text-[10px] text-neutral-400">jpg · png · webp · gif · máx 8 MB</p>
            </div>
          )}
        </aside>

        {/* ── Canvas area ── */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 border-b border-neutral-200 bg-white px-4 py-2.5">
            {/* Solid color */}
            <label className="flex items-center gap-1.5 text-xs text-neutral-500">
              Fondo:
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                className="h-6 w-10 cursor-pointer rounded border border-neutral-200" />
            </label>

            {/* Gradient toggle */}
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-neutral-500">
              <input type="checkbox" checked={bgGradient.enabled}
                onChange={(e) => setBgGradient((p) => ({ ...p, enabled: e.target.checked }))}
                className="rounded" />
              Degradado
            </label>

            {bgGradient.enabled && (
              <>
                <input type="color" value={bgGradient.color2}
                  onChange={(e) => setBgGradient((p) => ({ ...p, color2: e.target.value }))}
                  className="h-6 w-10 cursor-pointer rounded border border-neutral-200" title="Color 2" />
                <select value={bgGradient.type}
                  onChange={(e) => setBgGradient((p) => ({ ...p, type: e.target.value as "linear" | "radial" }))}
                  className="rounded-lg border border-neutral-200 px-2 py-1 text-xs outline-none">
                  <option value="linear">Lineal</option>
                  <option value="radial">Radial</option>
                </select>
                {bgGradient.type === "linear" && (
                  <label className="flex items-center gap-1.5 text-xs text-neutral-500">
                    {bgGradient.angle}°
                    <input type="range" min={0} max={359} value={bgGradient.angle}
                      onChange={(e) => setBgGradient((p) => ({ ...p, angle: Number(e.target.value) }))}
                      className="w-20" />
                  </label>
                )}
              </>
            )}

            {/* Grid snap */}
            <div className="flex items-center gap-1 border-l border-neutral-200 pl-3">
              <Grid3x3 className="h-3.5 w-3.5 text-neutral-400" />
              <div className="flex gap-0.5">
                {GRID_OPTIONS.map((g) => (
                  <button key={g.value}
                    onClick={() => setGridSnap(g.value)}
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition ${gridSnap === g.value ? "bg-indigo-600 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs text-neutral-400">{collection.canvas_width} × {collection.canvas_height}</span>
            {activeTool !== "select" && activeTool !== "image" && (
              <span className="text-xs font-medium text-[#0F3D3A]">
                {activeTool === "text" ? "✏ Clic para texto" : "■ Clic para forma"}
              </span>
            )}
            {selectedItemId && activeTool === "select" && (
              <span className="ml-auto flex items-center gap-2 text-xs text-neutral-400">
                <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[10px]">Ctrl+D</kbd> duplicar
                <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[10px]">Delete</kbd> eliminar
                <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd> deselec.
              </span>
            )}
          </div>

          {/* Canvas */}
          <div className="flex flex-1 items-center justify-center overflow-auto p-8"
            onClick={() => { if (activeTool === "select") setSelectedItemId(null); }}>
            <div ref={canvasRef}
              className="relative shrink-0 shadow-xl"
              style={{
                width: collection.canvas_width, height: collection.canvas_height,
                background: computedBg,
                cursor: activeTool === "text" || activeTool === "shape" ? "crosshair" : "default",
                ...gridOverlayStyle,
              }}
              onDragOver={handleCanvasDragOver}
              onDrop={handleCanvasDrop}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              onPointerLeave={handleCanvasPointerUp}
              onClick={handleCanvasClick}
            >
              {items.length === 0 && activeTool === "select" && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
                  <p className="text-sm font-medium text-neutral-400">Canvas vacío</p>
                  <p className="text-xs text-neutral-300">Arrastra productos o usa Texto / Forma / Imagen</p>
                </div>
              )}

              {items.map((item) => {
                const isSelected  = selectedItemId === item.id;
                const tc          = item.content as ContentText;
                const sc          = item.content as ContentShape;
                const ic          = item.content as ContentImage;
                const motionStyle = getMotionStyle(item);

                return (
                  <div
                    key={item.id}
                    data-canvas-item="true"
                    style={{
                      position: "absolute",
                      left: item.pos_x, top: item.pos_y,
                      width: item.width, height: item.height,
                      zIndex: item.z_index,
                      transform: getItemTransform(item),
                      transformOrigin: "center center",
                      cursor: activeTool === "select" ? "grab" : "default",
                      touchAction: "none",
                    }}
                    className={`group rounded-lg ${isSelected ? "ring-2 ring-[#0F3D3A] ring-offset-1 shadow-lg" : "hover:shadow-md"}`}
                    onPointerDown={(e) => handleItemPointerDown(e, item.id)}
                    onClick={(e) => { e.stopPropagation(); if (activeTool === "select") setSelectedItemId(item.id); }}
                  >
                    {/* Motion wrapper */}
                    <div style={{ width: "100%", height: "100%", ...motionStyle }}>
                      {item.element_type === "product" && (
                        item.product_image
                          ? <img src={item.product_image} alt={item.product_name ?? ""} className="h-full w-full rounded-lg object-cover" draggable={false} />
                          : <div className="flex h-full w-full items-center justify-center rounded-lg bg-neutral-200"><span className="text-xs text-neutral-400">Sin imagen</span></div>
                      )}
                      {item.element_type === "text" && (() => {
                        const hasBg = tc?.bgColor && tc.bgColor !== "";
                        return (
                          <div style={{
                            width: "100%", height: "100%",
                            display: "flex", alignItems: "center",
                            padding: "8px 10px",
                            color: tc?.color || "#1a1a1a",
                            fontSize: tc?.fontSize || 24,
                            fontFamily: tc?.fontFamily || "inherit",
                            fontWeight: tc?.fontWeight || "bold",
                            fontStyle: tc?.fontStyle || "normal",
                            textAlign: tc?.textAlign || "center",
                            justifyContent: tc?.textAlign === "right" ? "flex-end" : tc?.textAlign === "center" ? "center" : "flex-start",
                            textShadow: tc?.shadow ? `${tc.shadowX ?? 2}px ${tc.shadowY ?? 2}px ${tc.shadowBlur ?? 4}px ${tc.shadowColor ?? "#000000"}` : undefined,
                            WebkitTextStroke: tc?.outline ? `${tc.outlineWidth ?? 1}px ${tc.outlineColor ?? "#000000"}` : undefined,
                            whiteSpace: "pre-wrap", wordBreak: "break-word",
                            userSelect: "none", overflow: "hidden", lineHeight: 1.2,
                            background: hasBg ? hexToRgba(tc.bgColor!, tc.bgOpacity ?? 0.6) : undefined,
                            borderRadius: hasBg ? 8 : undefined,
                          }}>
                            {tc?.text || "Texto"}
                          </div>
                        );
                      })()}
                      {item.element_type === "shape" && (
                        <div style={{
                          width: "100%", height: "100%",
                          background: getShapeBackground(sc),
                          borderRadius: sc?.shapeType === "circle" ? "50%" : `${sc?.borderRadius ?? 8}px`,
                          opacity: sc?.opacity ?? 1,
                          border: (sc?.strokeWidth ?? 0) > 0 ? `${sc.strokeWidth}px solid ${sc.strokeColor ?? "#000000"}` : undefined,
                          boxSizing: "border-box",
                        }} />
                      )}
                      {item.element_type === "image" && (
                        ic?.url
                          ? <img src={ic.url} alt="" draggable={false}
                              style={{
                                width: "100%", height: "100%",
                                objectFit: ic.objectFit ?? "cover",
                                borderRadius: ic.borderRadius ?? 8,
                                opacity: ic.opacity ?? 1,
                                display: "block",
                              }} />
                          : <div className="flex h-full w-full items-center justify-center rounded-lg bg-neutral-200">
                              <ImageIcon className="h-8 w-8 text-neutral-400" />
                            </div>
                      )}
                      {item.element_type === "product" && (
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-lg bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <p className="truncate text-[11px] font-medium text-white">{item.product_name}</p>
                          <p className="text-[10px] text-white/80">Q{Number(item.product_price ?? 0).toFixed(2)}</p>
                        </div>
                      )}
                    </div>

                    {isSelected && activeTool === "select" && (
                      <>
                        {/* Delete */}
                        <button onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.id); }}
                          className="absolute -right-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600">
                          <X className="h-3 w-3" />
                        </button>
                        {/* Duplicate */}
                        <button onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => { e.stopPropagation(); handleDuplicate(item.id); }}
                          title="Duplicar (Ctrl+D)"
                          className="absolute -left-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white shadow hover:bg-blue-600">
                          <Copy className="h-3 w-3" />
                        </button>
                        {/* Resize handles */}
                        {(["nw","ne","sw","se"] as const).map((corner) => (
                          <div key={corner} onPointerDown={(e) => handleResizePointerDown(e, item.id, corner)}
                            style={{
                              position: "absolute", width: 10, height: 10,
                              background: "white", border: "2px solid #0F3D3A", borderRadius: 2, zIndex: 10,
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

        {/* ── Right properties panel ── */}
        <aside className="flex w-60 shrink-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-100 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Propiedades</p>
          </div>

          {!selectedItem ? (
            <div className="flex flex-1 items-center justify-center p-4 text-center">
              <p className="text-xs leading-relaxed text-neutral-300">Selecciona un elemento para editar</p>
            </div>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto p-3">

              {/* ── TEXT specific ── */}
              {selectedItem.element_type === "text" && (() => {
                const c = selectedItem.content as ContentText;
                const upd = (patch: Partial<ContentText>) => updateItemContent(selectedItem.id, { ...c, ...patch });
                return (
                  <>
                    <div>
                      <label className="text-[11px] font-medium text-neutral-500">Texto</label>
                      <textarea value={c?.text ?? ""} onChange={(e) => upd({ text: e.target.value })}
                        rows={3} className="mt-1 w-full resize-none rounded-lg border border-neutral-200 p-2 text-xs outline-none focus:border-[#0F3D3A]" />
                    </div>
                    {/* Font family */}
                    <div>
                      <label className="text-[11px] font-medium text-neutral-500">Fuente</label>
                      <select value={c?.fontFamily ?? "inherit"}
                        onChange={(e) => upd({ fontFamily: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-neutral-200 px-2 py-1.5 text-xs outline-none focus:border-[#0F3D3A]"
                        style={{ fontFamily: c?.fontFamily ?? "inherit" }}>
                        {GOOGLE_FONTS.map((f) => (
                          <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[11px] font-medium text-neutral-500">Tamaño</label>
                        <input type="number" min={10} max={120} value={c?.fontSize ?? 24}
                          onChange={(e) => upd({ fontSize: Number(e.target.value) })}
                          className="mt-1 w-full rounded-lg border border-neutral-200 px-2 py-1 text-xs outline-none focus:border-[#0F3D3A]" />
                      </div>
                      <div className="flex-1">
                        <label className="text-[11px] font-medium text-neutral-500">Color</label>
                        <input type="color" value={c?.color ?? "#1a1a1a"} onChange={(e) => upd({ color: e.target.value })}
                          className="mt-1 h-8 w-full cursor-pointer rounded-lg border border-neutral-200" />
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => upd({ fontWeight: c.fontWeight === "bold" ? "normal" : "bold" })}
                        className={`flex-1 rounded-lg border py-1.5 text-xs font-bold transition ${c?.fontWeight === "bold" ? "border-[#0F3D3A] bg-[#0F3D3A] text-white" : "border-neutral-200 text-neutral-500"}`}>B</button>
                      <button onClick={() => upd({ fontStyle: c.fontStyle === "italic" ? "normal" : "italic" })}
                        className={`flex-1 rounded-lg border py-1.5 text-xs italic transition ${c?.fontStyle === "italic" ? "border-[#0F3D3A] bg-[#0F3D3A] text-white" : "border-neutral-200 text-neutral-500"}`}>i</button>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-neutral-500">Alineación</label>
                      <div className="flex gap-1.5">
                        {(["left","center","right"] as const).map((align) => (
                          <button key={align} onClick={() => upd({ textAlign: align })}
                            className={`flex-1 rounded-lg border py-1.5 transition ${c?.textAlign === align ? "border-[#0F3D3A] bg-[#0F3D3A] text-white" : "border-neutral-200 text-neutral-400"}`}>
                            {align === "left" ? <AlignLeft className="mx-auto h-3 w-3" /> : align === "center" ? <AlignCenter className="mx-auto h-3 w-3" /> : <AlignRight className="mx-auto h-3 w-3" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Text background */}
                    <div className="border-t border-neutral-100 pt-2">
                      <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-neutral-600">
                        <input type="checkbox" checked={!!(c?.bgColor)}
                          onChange={(e) => upd({ bgColor: e.target.checked ? "#000000" : undefined })}
                          className="rounded" />
                        Fondo de texto
                      </label>
                      {c?.bgColor && (
                        <div className="mt-2 flex items-end gap-2">
                          <div className="flex-1">
                            <label className="text-[10px] text-neutral-400">Color</label>
                            <input type="color" value={c.bgColor}
                              onChange={(e) => upd({ bgColor: e.target.value })}
                              className="mt-0.5 h-7 w-full cursor-pointer rounded border border-neutral-200" />
                          </div>
                          <div className="flex-1">
                            <label className="text-[10px] text-neutral-400">Opacidad: {Math.round((c.bgOpacity ?? 0.6) * 100)}%</label>
                            <input type="range" min={0.05} max={1} step={0.05} value={c.bgOpacity ?? 0.6}
                              onChange={(e) => upd({ bgOpacity: Number(e.target.value) })}
                              className="mt-0.5 w-full" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Shadow */}
                    <div className="border-t border-neutral-100 pt-2">
                      <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-neutral-600">
                        <input type="checkbox" checked={c?.shadow ?? false}
                          onChange={(e) => upd({ shadow: e.target.checked })} className="rounded" />
                        Sombra
                      </label>
                      {c?.shadow && (
                        <div className="mt-2 space-y-2">
                          <div className="flex gap-1.5">
                            <div className="flex-1">
                              <label className="text-[10px] text-neutral-400">X</label>
                              <input type="number" min={-20} max={20} value={c.shadowX ?? 2}
                                onChange={(e) => upd({ shadowX: Number(e.target.value) })}
                                className="mt-0.5 w-full rounded border border-neutral-200 px-1.5 py-1 text-xs outline-none" />
                            </div>
                            <div className="flex-1">
                              <label className="text-[10px] text-neutral-400">Y</label>
                              <input type="number" min={-20} max={20} value={c.shadowY ?? 2}
                                onChange={(e) => upd({ shadowY: Number(e.target.value) })}
                                className="mt-0.5 w-full rounded border border-neutral-200 px-1.5 py-1 text-xs outline-none" />
                            </div>
                            <div className="flex-1">
                              <label className="text-[10px] text-neutral-400">Blur</label>
                              <input type="number" min={0} max={30} value={c.shadowBlur ?? 4}
                                onChange={(e) => upd({ shadowBlur: Number(e.target.value) })}
                                className="mt-0.5 w-full rounded border border-neutral-200 px-1.5 py-1 text-xs outline-none" />
                            </div>
                          </div>
                          <input type="color" value={c.shadowColor ?? "#000000"}
                            onChange={(e) => upd({ shadowColor: e.target.value })}
                            className="h-7 w-full cursor-pointer rounded border border-neutral-200" title="Color sombra" />
                        </div>
                      )}
                    </div>
                    {/* Outline */}
                    <div className="border-t border-neutral-100 pt-2">
                      <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-neutral-600">
                        <input type="checkbox" checked={c?.outline ?? false}
                          onChange={(e) => upd({ outline: e.target.checked })} className="rounded" />
                        Borde de texto
                      </label>
                      {c?.outline && (
                        <div className="mt-2 flex gap-2">
                          <div className="flex-1">
                            <label className="text-[10px] text-neutral-400">Grosor: {c.outlineWidth ?? 1}px</label>
                            <input type="range" min={1} max={8} value={c.outlineWidth ?? 1}
                              onChange={(e) => upd({ outlineWidth: Number(e.target.value) })}
                              className="mt-0.5 w-full" />
                          </div>
                          <div className="flex-1">
                            <label className="text-[10px] text-neutral-400">Color</label>
                            <input type="color" value={c.outlineColor ?? "#000000"}
                              onChange={(e) => upd({ outlineColor: e.target.value })}
                              className="mt-0.5 h-7 w-full cursor-pointer rounded border border-neutral-200" />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}

              {/* ── SHAPE specific ── */}
              {selectedItem.element_type === "shape" && (() => {
                const c = selectedItem.content as ContentShape;
                const upd = (patch: Partial<ContentShape>) => updateItemContent(selectedItem.id, { ...c, ...patch });
                return (
                  <>
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-neutral-500">Tipo</label>
                      <div className="flex gap-1.5">
                        {(["rectangle","circle"] as const).map((t) => (
                          <button key={t} onClick={() => upd({ shapeType: t })}
                            className={`flex-1 rounded-lg border py-1.5 text-xs transition ${c?.shapeType === t ? "border-[#0F3D3A] bg-[#0F3D3A] text-white" : "border-neutral-200 text-neutral-500"}`}>
                            {t === "rectangle" ? "Rect." : "Círculo"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-neutral-500">
                        {c?.gradientEnabled ? "Color 1" : "Color"}
                      </label>
                      <input type="color" value={c?.fillColor ?? "#0F3D3A"} onChange={(e) => upd({ fillColor: e.target.value })}
                        className="mt-1 h-8 w-full cursor-pointer rounded-lg border border-neutral-200" />
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-neutral-600">
                      <input type="checkbox" checked={c?.gradientEnabled ?? false}
                        onChange={(e) => upd({ gradientEnabled: e.target.checked })} className="rounded" />
                      Degradado
                    </label>
                    {c?.gradientEnabled && (
                      <>
                        <div>
                          <label className="text-[11px] font-medium text-neutral-500">Color 2</label>
                          <input type="color" value={c?.gradientColor2 ?? "#AADDCC"}
                            onChange={(e) => upd({ gradientColor2: e.target.value })}
                            className="mt-1 h-8 w-full cursor-pointer rounded-lg border border-neutral-200" />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-medium text-neutral-500">Tipo degradado</label>
                          <div className="flex gap-1.5">
                            {(["linear","radial"] as const).map((t) => (
                              <button key={t} onClick={() => upd({ gradientType: t })}
                                className={`flex-1 rounded-lg border py-1.5 text-xs transition ${(c?.gradientType ?? "linear") === t ? "border-[#0F3D3A] bg-[#0F3D3A] text-white" : "border-neutral-200 text-neutral-500"}`}>
                                {t === "linear" ? "Lineal" : "Radial"}
                              </button>
                            ))}
                          </div>
                        </div>
                        {(c?.gradientType ?? "linear") === "linear" && (
                          <div>
                            <label className="text-[11px] font-medium text-neutral-500">Ángulo: {c?.gradientAngle ?? 135}°</label>
                            <input type="range" min={0} max={359} value={c?.gradientAngle ?? 135}
                              onChange={(e) => upd({ gradientAngle: Number(e.target.value) })}
                              className="mt-1 w-full" />
                          </div>
                        )}
                      </>
                    )}
                    {c?.shapeType !== "circle" && (
                      <div>
                        <label className="text-[11px] font-medium text-neutral-500">Redondeo: {c?.borderRadius ?? 8}px</label>
                        <input type="range" min={0} max={80} value={c?.borderRadius ?? 8}
                          onChange={(e) => upd({ borderRadius: Number(e.target.value) })}
                          className="mt-1 w-full" />
                      </div>
                    )}
                    <div>
                      <label className="text-[11px] font-medium text-neutral-500">Opacidad: {Math.round(((c?.opacity ?? 1)) * 100)}%</label>
                      <input type="range" min={0.05} max={1} step={0.05} value={c?.opacity ?? 1}
                        onChange={(e) => upd({ opacity: Number(e.target.value) })}
                        className="mt-1 w-full" />
                    </div>
                    {/* Stroke */}
                    <div className="border-t border-neutral-100 pt-2">
                      <label className="text-[11px] font-medium text-neutral-500">Borde: {c?.strokeWidth ?? 0}px</label>
                      <input type="range" min={0} max={20} value={c?.strokeWidth ?? 0}
                        onChange={(e) => upd({ strokeWidth: Number(e.target.value) })}
                        className="mt-1 w-full" />
                      {(c?.strokeWidth ?? 0) > 0 && (
                        <input type="color" value={c?.strokeColor ?? "#000000"}
                          onChange={(e) => upd({ strokeColor: e.target.value })}
                          className="mt-1 h-7 w-full cursor-pointer rounded border border-neutral-200" title="Color borde" />
                      )}
                    </div>
                  </>
                );
              })()}

              {/* ── IMAGE specific ── */}
              {selectedItem.element_type === "image" && (() => {
                const c = selectedItem.content as ContentImage;
                const upd = (patch: Partial<ContentImage>) => updateItemContent(selectedItem.id, { ...c, ...patch });
                return (
                  <>
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-neutral-500">Ajuste</label>
                      <div className="flex gap-1.5">
                        {(["cover","contain"] as const).map((fit) => (
                          <button key={fit} onClick={() => upd({ objectFit: fit })}
                            className={`flex-1 rounded-lg border py-1.5 text-xs transition ${(c?.objectFit ?? "cover") === fit ? "border-[#0F3D3A] bg-[#0F3D3A] text-white" : "border-neutral-200 text-neutral-500"}`}>
                            {fit === "cover" ? "Llenar" : "Contener"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-neutral-500">Redondeo: {c?.borderRadius ?? 8}px</label>
                      <input type="range" min={0} max={100} value={c?.borderRadius ?? 8}
                        onChange={(e) => upd({ borderRadius: Number(e.target.value) })}
                        className="mt-1 w-full" />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-neutral-500">Opacidad: {Math.round((c?.opacity ?? 1) * 100)}%</label>
                      <input type="range" min={0.05} max={1} step={0.05} value={c?.opacity ?? 1}
                        onChange={(e) => upd({ opacity: Number(e.target.value) })}
                        className="mt-1 w-full" />
                    </div>
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      disabled={imageUploading}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-neutral-200 py-1.5 text-xs text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-60">
                      {imageUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImageIcon className="h-3 w-3" />}
                      Cambiar imagen
                    </button>
                  </>
                );
              })()}

              {/* ── PRODUCT info ── */}
              {selectedItem.element_type === "product" && selectedItem.product_name && (
                <div className="rounded-lg bg-neutral-50 p-2">
                  <p className="text-[11px] text-neutral-400">Producto</p>
                  <p className="truncate text-xs font-medium text-neutral-700">{selectedItem.product_name}</p>
                  <p className="text-[11px] text-neutral-400">Q{Number(selectedItem.product_price ?? 0).toFixed(2)}</p>
                </div>
              )}

              {/* ── SHARED: Rotation + Flip ── */}
              <div className="border-t border-neutral-100 pt-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Transformación</p>
                <div>
                  <label className="text-[11px] font-medium text-neutral-500">
                    Ángulo: {(selectedItem.content as any)?.rotation ?? 0}°
                  </label>
                  <input type="range" min={0} max={359}
                    value={(selectedItem.content as any)?.rotation ?? 0}
                    onChange={(e) => {
                      const c = selectedItem.content as any ?? {};
                      updateItemContent(selectedItem.id, { ...c, rotation: Number(e.target.value) });
                    }}
                    className="mt-1 w-full" />
                </div>
                <div className="mt-2">
                  <label className="mb-1 block text-[11px] font-medium text-neutral-500">Voltear</label>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        const c = selectedItem.content as any ?? {};
                        updateItemContent(selectedItem.id, { ...c, flipX: !(c.flipX ?? false) });
                      }}
                      className={`flex flex-1 items-center justify-center gap-1 rounded-lg border py-1.5 text-xs transition ${
                        (selectedItem.content as any)?.flipX ? "border-[#0F3D3A] bg-[#0F3D3A] text-white" : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                      }`}>
                      <FlipHorizontal className="h-3 w-3" /> Horiz.
                    </button>
                    <button
                      onClick={() => {
                        const c = selectedItem.content as any ?? {};
                        updateItemContent(selectedItem.id, { ...c, flipY: !(c.flipY ?? false) });
                      }}
                      className={`flex flex-1 items-center justify-center gap-1 rounded-lg border py-1.5 text-xs transition ${
                        (selectedItem.content as any)?.flipY ? "border-[#0F3D3A] bg-[#0F3D3A] text-white" : "border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                      }`}>
                      <FlipVertical className="h-3 w-3" /> Vert.
                    </button>
                  </div>
                </div>
              </div>

              {/* ── SHARED: Layer order + Duplicate ── */}
              <div className="border-t border-neutral-100 pt-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Capas</p>
                <div className="flex gap-1.5">
                  <button onClick={() => handleBringToFront(selectedItem.id)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-neutral-200 py-1.5 text-xs text-neutral-600 transition hover:bg-neutral-50">
                    <ChevronUp className="h-3 w-3" /> Al frente
                  </button>
                  <button onClick={() => handleSendToBack(selectedItem.id)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-neutral-200 py-1.5 text-xs text-neutral-600 transition hover:bg-neutral-50">
                    <ChevronDown className="h-3 w-3" /> Al fondo
                  </button>
                </div>
                <button onClick={() => handleDuplicate(selectedItem.id)}
                  className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-neutral-200 py-1.5 text-xs text-neutral-600 transition hover:bg-neutral-50">
                  <Copy className="h-3 w-3" /> Duplicar <span className="text-neutral-400">(Ctrl+D)</span>
                </button>
              </div>

              {/* ── SHARED: Animations ── */}
              <div className="border-t border-neutral-100 pt-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Animación</p>
                <div>
                  <label className="text-[11px] font-medium text-neutral-500">Entrada</label>
                  <select value={(selectedItem.content as any)?.animation ?? "none"}
                    onChange={(e) => {
                      const c = selectedItem.content as any ?? {};
                      updateItemContent(selectedItem.id, { ...c, animation: e.target.value });
                    }}
                    className="mt-1 w-full rounded-lg border border-neutral-200 px-2 py-1.5 text-xs outline-none focus:border-[#0F3D3A]">
                    {ENTRANCE_ANIMS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
                <div className="mt-2">
                  <label className="text-[11px] font-medium text-neutral-500">Movimiento continuo</label>
                  <select value={(selectedItem.content as any)?.motion ?? "none"}
                    onChange={(e) => {
                      const c = selectedItem.content as any ?? {};
                      updateItemContent(selectedItem.id, { ...c, motion: e.target.value });
                    }}
                    className="mt-1 w-full rounded-lg border border-neutral-200 px-2 py-1.5 text-xs outline-none focus:border-[#0F3D3A]">
                    {MOTION_ANIMS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </div>
              </div>

            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
