"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Save, Eye, EyeOff, X, Search, GripVertical,
  Check, Loader2, MousePointer2, Type, Square, ImageIcon,
  AlignLeft, AlignCenter, AlignRight, Copy,
  ChevronUp, ChevronDown, FlipHorizontal, FlipVertical,
  Grid3x3, Undo2, Redo2, Lock, Unlock,
  AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type EntranceAnim = "none" | "fadeIn" | "slideUp" | "slideLeft" | "zoomIn";
type MotionAnim   = "none" | "float" | "pulse" | "spin" | "shake" | "bounce";
type HistoryEntry = { undo: () => void; redo: () => void };

type ContentText = {
  text: string;
  fontSize: number;
  fontFamily?: string;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  color: string;
  textAlign: "left" | "center" | "right";
  letterSpacing?: number;
  lineHeight?: number;
  paddingX?: number;
  paddingY?: number;
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
  shapeType: "rectangle" | "circle" | "triangle" | "star" | "line";
  fillColor: string;
  gradientEnabled?: boolean;
  gradientColor2?: string;
  gradientAngle?: number;
  gradientType?: "linear" | "radial";
  borderRadius: number;
  opacity: number;
  strokeColor?: string;
  strokeWidth?: number;
  shadowEnabled?: boolean;
  shadowX?: number;
  shadowY?: number;
  shadowBlur?: number;
  shadowSpread?: number;
  shadowColor?: string;
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
  shadowEnabled?: boolean;
  shadowX?: number;
  shadowY?: number;
  shadowBlur?: number;
  shadowSpread?: number;
  shadowColor?: string;
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
type SelectSidebarTab = "products" | "templates";

type CollectionTemplate = {
  id: number;
  name: string;
  thumbnail_url: string | null;
  items_snapshot?: CanvasItem[];
  canvas_width: number;
  canvas_height: number;
  background_color: string;
  background_style: string | null;
  background_image_url: string | null;
  item_count: number;
  created_at: string;
};

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
  letterSpacing: 0,
  lineHeight: 1.2,
  paddingX: 10,
  paddingY: 8,
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
  shadowEnabled: false,
  shadowX: 4,
  shadowY: 4,
  shadowBlur: 8,
  shadowSpread: 0,
  shadowColor: "rgba(0,0,0,0.3)",
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
  shadowEnabled: false,
  shadowX: 4,
  shadowY: 4,
  shadowBlur: 8,
  shadowSpread: 0,
  shadowColor: "rgba(0,0,0,0.3)",
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

const SHAPE_TYPES: { value: ContentShape["shapeType"]; label: string }[] = [
  { value: "rectangle", label: "Rect." },
  { value: "circle",    label: "Círculo" },
  { value: "triangle",  label: "Triáng." },
  { value: "star",      label: "Estrella" },
  { value: "line",      label: "Línea" },
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

function getShapeClipPath(shapeType: ContentShape["shapeType"]): string | undefined {
  if (shapeType === "triangle") return "polygon(50% 0%, 0% 100%, 100% 100%)";
  if (shapeType === "star") return "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";
  return undefined;
}

function getShapeBorderRadius(sc: ContentShape): string {
  if (sc.shapeType === "circle") return "50%";
  if (sc.shapeType === "triangle" || sc.shapeType === "star" || sc.shapeType === "line") return "0";
  return `${sc.borderRadius ?? 8}px`;
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

function buildBoxShadow(c: { shadowEnabled?: boolean; shadowX?: number; shadowY?: number; shadowBlur?: number; shadowSpread?: number; shadowColor?: string }): string | undefined {
  if (!c.shadowEnabled) return undefined;
  return `${c.shadowX ?? 4}px ${c.shadowY ?? 4}px ${c.shadowBlur ?? 8}px ${c.shadowSpread ?? 0}px ${c.shadowColor ?? "rgba(0,0,0,0.3)"}`;
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
  const [templates, setTemplates]           = useState<CollectionTemplate[]>([]);
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [saved, setSaved]                   = useState(false);
  const [templateSaving, setTemplateSaving] = useState(false);
  const [templateApplyingId, setTemplateApplyingId] = useState<number | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<CollectionTemplate | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [search, setSearch]                 = useState("");
  const [activeTool, setActiveTool]         = useState<ActiveTool>("select");
  const [selectSidebarTab, setSelectSidebarTab] = useState<SelectSidebarTab>("products");
  const [name, setName]                     = useState("");
  const [templateName, setTemplateName]     = useState("");
  const [templateIsPublic, setTemplateIsPublic] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateError, setTemplateError]   = useState<string | null>(null);
  const [bgColor, setBgColor]               = useState("#FFFFFF");
  const [bgGradient, setBgGradient]         = useState({
    enabled: false, color2: "#AADDCC", angle: 135, type: "linear" as "linear" | "radial",
  });
  const [textDefaults, setTextDefaults]     = useState<ContentText>({ ...DEFAULT_TEXT });
  const [shapeDefaults, setShapeDefaults]   = useState<ContentShape>({ ...DEFAULT_SHAPE });
  const [gridSnap, setGridSnap]             = useState(0);
  const [imageUploading, setImageUploading]     = useState(false);
  const [bgImageUploading, setBgImageUploading] = useState(false);
  const [editingTextId, setEditingTextId]       = useState<number | null>(null);
  const [lockedItemIds, setLockedItemIds]       = useState<Set<number>>(new Set());

  // Undo/redo state (buttons only; logic is all in refs)
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const canvasRef       = useRef<HTMLDivElement>(null);
  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const imageInputRef   = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const dragState      = useRef<{ itemId: number; startPX: number; startPY: number; origX: number; origY: number } | null>(null);
  const resizeState    = useRef<{ itemId: number; corner: "nw"|"ne"|"sw"|"se"; startPX: number; startPY: number; origX: number; origY: number; origW: number; origH: number } | null>(null);
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const itemsRef       = useRef<CanvasItem[]>([]);
  itemsRef.current     = items;

  // Undo/redo refs
  const historyRef     = useRef<HistoryEntry[]>([]);
  const historyIdxRef  = useRef(-1);
  // Content snapshot: captured on item select, compared on deselect
  const selectedContentSnapshot = useRef<{ itemId: number; content: any } | null>(null);
  // Position snapshot for X/Y/W/H input blur
  const posSnapshot = useRef<{ itemId: number; pos_x: number; pos_y: number; width: number; height: number } | null>(null);

  const computedBg = bgGradient.enabled
    ? bgGradient.type === "radial"
      ? `radial-gradient(circle, ${bgColor}, ${bgGradient.color2})`
      : `linear-gradient(${bgGradient.angle}deg, ${bgColor}, ${bgGradient.color2})`
    : bgColor;

  const isPreviewingTemplate = previewTemplate !== null;
  const displayCanvasWidth = previewTemplate?.canvas_width ?? collection?.canvas_width ?? 800;
  const displayCanvasHeight = previewTemplate?.canvas_height ?? collection?.canvas_height ?? 600;
  const displayBackground = previewTemplate
    ? (previewTemplate.background_style || previewTemplate.background_color || "#FFFFFF")
    : computedBg;
  const displayBackgroundImageUrl = previewTemplate?.background_image_url ?? collection?.background_image_url ?? null;
  const displayItems = previewTemplate?.items_snapshot ?? items;

  useEffect(() => {
    if (!isPreviewingTemplate) {
      setPreviewScale(1);
      return;
    }

    const updatePreviewScale = () => {
      const viewport = canvasViewportRef.current;
      if (!viewport) return;

      const widthRatio = (viewport.clientWidth - 32) / displayCanvasWidth;
      const heightRatio = (viewport.clientHeight - 32) / displayCanvasHeight;
      const nextScale = Math.min(widthRatio, heightRatio, 1);
      setPreviewScale(Number.isFinite(nextScale) && nextScale > 0 ? nextScale : 1);
      viewport.scrollTo({ left: 0, top: 0 });
    };

    updatePreviewScale();
    window.addEventListener("resize", updatePreviewScale);
    return () => window.removeEventListener("resize", updatePreviewScale);
  }, [displayCanvasHeight, displayCanvasWidth, isPreviewingTemplate]);

  // ── Undo/redo core ────────────────────────────────────────────────────────

  const record = useCallback((cmd: HistoryEntry) => {
    historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
    historyRef.current.push(cmd);
    historyIdxRef.current = historyRef.current.length - 1;
    if (historyRef.current.length > 50) { historyRef.current.shift(); historyIdxRef.current--; }
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const doUndo = useCallback(() => {
    if (historyIdxRef.current < 0) return;
    historyRef.current[historyIdxRef.current].undo();
    historyIdxRef.current--;
    setCanUndo(historyIdxRef.current >= 0);
    setCanRedo(true);
  }, []);

  const doRedo = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current++;
    historyRef.current[historyIdxRef.current].redo();
    setCanUndo(true);
    setCanRedo(historyIdxRef.current < historyRef.current.length - 1);
  }, []);

  // ── Content snapshot: flush on item deselect, capture on select ───────────

  useEffect(() => {
    const prev = selectedContentSnapshot.current;
    if (prev) {
      const item = itemsRef.current.find((i) => i.id === prev.itemId);
      if (item && JSON.stringify(item.content) !== JSON.stringify(prev.content)) {
        const itemId = prev.itemId;
        const prevContent = prev.content;
        const newContent = item.content;
        record({
          undo: () => {
            setItems((p) => p.map((i) => i.id === itemId ? { ...i, content: prevContent } : i));
            apiFetch(`/api/collections/${collectionId}/items/${itemId}`, {
              method: "PUT", body: JSON.stringify({ content: prevContent }),
            });
          },
          redo: () => {
            setItems((p) => p.map((i) => i.id === itemId ? { ...i, content: newContent } : i));
            apiFetch(`/api/collections/${collectionId}/items/${itemId}`, {
              method: "PUT", body: JSON.stringify({ content: newContent }),
            });
          },
        });
      }
    }
    if (selectedItemId !== null) {
      const item = itemsRef.current.find((i) => i.id === selectedItemId);
      selectedContentSnapshot.current = item
        ? { itemId: selectedItemId, content: JSON.parse(JSON.stringify(item.content)) }
        : null;
    } else {
      selectedContentSnapshot.current = null;
    }
  }, [selectedItemId]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const loadCollection = useCallback(async () => {
    const colRes = await apiFetch(`/api/collections/${collectionId}`).then((r) => r.json());
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
        } else {
          setBgGradient({ enabled: false, color2: "#AADDCC", angle: 135, type: "linear" });
        }
      }
    } else {
      setBgGradient({ enabled: false, color2: "#AADDCC", angle: 135, type: "linear" });
    }
  }, [collectionId]);

  const loadProducts = useCallback(async () => {
    const prodRes = await apiFetch("/api/seller/products").then((r) => r.json());
    const rawProducts: any = prodRes?.data ?? prodRes?.productos;
    const raw: Product[] = Array.isArray(rawProducts) ? rawProducts
      : Array.isArray(prodRes) ? prodRes : [];
    setProducts(raw.filter((p: any) => p.activo !== false));
  }, []);

  const loadTemplates = useCallback(async () => {
    const templatesRes = await apiFetch("/api/collections/templates/mine").then((r) => r.json());
    setTemplates(Array.isArray(templatesRes?.data) ? templatesRes.data : []);
  }, []);

  useEffect(() => {
    Promise.all([loadCollection(), loadProducts(), loadTemplates()])
      .catch((err) => {
        console.error("[collections editor] load failed:", err);
      })
      .finally(() => setLoading(false));
  }, [loadCollection, loadProducts, loadTemplates]);

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
          background_image_url: collection.background_image_url,
        }),
      });
      setCollection((prev) => prev ? {
        ...prev,
        name,
        background_color: bgColor,
        background_style: bgGradient.enabled ? computedBg : null,
      } : prev);
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

  const handleBackgroundImageFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!collection) return;
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setBgImageUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const uploadRes = await apiFetch(`/api/collections/${collectionId}/images`, { method: "POST", body: form });
      const uploadData = await uploadRes.json();
      if (!uploadData.ok) throw new Error(uploadData.message);

      const nextUrl = uploadData.url as string;
      await apiFetch(`/api/collections/${collectionId}`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          background_color: bgColor,
          background_style: bgGradient.enabled ? computedBg : null,
          background_image_url: nextUrl,
        }),
      });

      setCollection((prev) => prev ? { ...prev, background_image_url: nextUrl } : prev);
    } catch (err) {
      console.error("[background image upload]", err);
      alert("Error al subir el fondo");
    } finally {
      setBgImageUploading(false);
    }
  }, [bgColor, bgGradient.enabled, collection, collectionId, computedBg, name]);

  const handleRemoveBackgroundImage = useCallback(async () => {
    if (!collection?.background_image_url) return;
    setBgImageUploading(true);
    try {
      await apiFetch(`/api/collections/${collectionId}`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          background_color: bgColor,
          background_style: bgGradient.enabled ? computedBg : null,
          background_image_url: null,
        }),
      });
      setCollection((prev) => prev ? { ...prev, background_image_url: null } : prev);
    } catch (err) {
      console.error("[background image remove]", err);
      alert("Error al quitar el fondo");
    } finally {
      setBgImageUploading(false);
    }
  }, [bgColor, bgGradient.enabled, collection?.background_image_url, collectionId, computedBg, name]);

  const handleSaveTemplate = useCallback(async () => {
    if (!collection || !templateName.trim()) return;
    setTemplateSaving(true);
    setTemplateError(null);

    try {
      const res = await apiFetch(`/api/collections/${collectionId}/templates`, {
        method: "POST",
        body: JSON.stringify({
          name: templateName.trim(),
          is_public: templateIsPublic,
          items_snapshot: items,
          canvas_width: collection.canvas_width,
          canvas_height: collection.canvas_height,
          background_color: bgColor,
          background_style: bgGradient.enabled ? computedBg : null,
          background_image_url: collection.background_image_url,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message ?? "No se pudo guardar la plantilla");

      setShowTemplateModal(false);
      setTemplateName("");
      await loadTemplates();
      setSelectSidebarTab("templates");
      setActiveTool("select");
    } catch (err: any) {
      setTemplateError(err?.message ?? "No se pudo guardar la plantilla");
    } finally {
      setTemplateSaving(false);
    }
  }, [bgColor, bgGradient.enabled, collection, collectionId, computedBg, items, loadTemplates, templateIsPublic, templateName]);

  const handlePreviewTemplate = useCallback(async (template: CollectionTemplate) => {
    setTemplateApplyingId(template.id);
    setTemplateError(null);
    try {
      const res = await apiFetch(`/api/collections/templates/${template.id}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.message ?? "No se pudo cargar la plantilla");

      setPreviewTemplate(data.data);
      setSelectedItemId(null);
      setEditingTextId(null);
      setActiveTool("select");
    } catch (err: any) {
      setTemplateError(err?.message ?? "No se pudo cargar la vista previa");
    } finally {
      setTemplateApplyingId((prev) => prev === template.id ? null : prev);
    }
  }, []);

  const handleCancelTemplatePreview = useCallback(() => {
    setPreviewTemplate(null);
    setTemplateApplyingId(null);
    setTemplateError(null);
  }, []);

  const handleApplyTemplate = useCallback(async (templateId: number) => {
    setTemplateApplyingId(templateId);
    setTemplateError(null);
    try {
      const res = await apiFetch(`/api/collections/${collectionId}/apply-template`, {
        method: "POST",
        body: JSON.stringify({ template_id: templateId }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.message ?? "No se pudo aplicar la plantilla");

      await loadCollection();
      setPreviewTemplate(null);
      setSelectedItemId(null);
      setEditingTextId(null);
      setActiveTool("select");

      if (data?.data?.skipped_products > 0) {
        alert(`Plantilla aplicada. ${data.data.skipped_products} producto(s) no eran válidos para esta tienda y se omitieron.`);
      }
    } catch (err: any) {
      setTemplateError(err?.message ?? "No se pudo aplicar la plantilla");
    } finally {
      setTemplateApplyingId(null);
    }
  }, [collectionId, loadCollection]);

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
    const isLine = element_type === "shape" && shapeDefaults.shapeType === "line";
    const width  = element_type === "text" ? 220 : 150;
    const height = element_type === "text" ? 70  : isLine ? 8 : 150;
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
    const key = String(itemId);
    if (debounceTimers.current[key]) clearTimeout(debounceTimers.current[key]);
    debounceTimers.current[key] = setTimeout(() => {
      apiFetch(`/api/collections/${collectionId}/items/${itemId}`, {
        method: "PUT", body: JSON.stringify({ content: newContent }),
      });
      delete debounceTimers.current[key];
    }, 600);
  }, [collectionId]);

  // ── Position/size change from X/Y/W/H inputs ─────────────────────────────

  const handlePositionChange = useCallback((itemId: number, field: "pos_x" | "pos_y" | "width" | "height", rawValue: number) => {
    let value = rawValue;
    if (field === "width" || field === "height") value = Math.max(10, value);
    if (field === "pos_x" || field === "pos_y") value = Math.max(0, value);
    setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, [field]: value } : i));
  }, []);

  const handlePosInputFocus = useCallback((itemId: number) => {
    if (posSnapshot.current?.itemId === itemId) return;
    const item = itemsRef.current.find((i) => i.id === itemId);
    if (item) posSnapshot.current = { itemId, pos_x: item.pos_x, pos_y: item.pos_y, width: item.width, height: item.height };
  }, []);

  const handlePosInputBlur = useCallback((itemId: number) => {
    if (!posSnapshot.current || posSnapshot.current.itemId !== itemId) return;
    const prev = { ...posSnapshot.current };
    posSnapshot.current = null;
    const item = itemsRef.current.find((i) => i.id === itemId);
    if (!item) return;
    const curr = { pos_x: item.pos_x, pos_y: item.pos_y, width: item.width, height: item.height };
    apiFetch(`/api/collections/${collectionId}/items/${itemId}`, { method: "PUT", body: JSON.stringify(curr) });
    if (prev.pos_x !== curr.pos_x || prev.pos_y !== curr.pos_y || prev.width !== curr.width || prev.height !== curr.height) {
      record({
        undo: () => {
          setItems((p) => p.map((i) => i.id === itemId ? { ...i, ...prev } : i));
          apiFetch(`/api/collections/${collectionId}/items/${itemId}`, { method: "PUT", body: JSON.stringify(prev) });
        },
        redo: () => {
          setItems((p) => p.map((i) => i.id === itemId ? { ...i, ...curr } : i));
          apiFetch(`/api/collections/${collectionId}/items/${itemId}`, { method: "PUT", body: JSON.stringify(curr) });
        },
      });
    }
  }, [collectionId, record]);

  // ── Canvas item: move ──────────────────────────────────────────────────────

  const handleItemPointerDown = (e: React.PointerEvent, itemId: number) => {
    if (activeTool !== "select") return;
    if (lockedItemIds.has(itemId)) { setSelectedItemId(itemId); return; }
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
      const { itemId, origX, origY, origW, origH } = resizeState.current;
      resizeState.current = null;
      const item = itemsRef.current.find((i) => i.id === itemId);
      if (item) {
        const snX = snapToGrid(item.pos_x, gridSnap);
        const snY = snapToGrid(item.pos_y, gridSnap);
        if (snX !== item.pos_x || snY !== item.pos_y) {
          setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, pos_x: snX, pos_y: snY } : i));
        }
        const curr = { pos_x: snX, pos_y: snY, width: item.width, height: item.height };
        apiFetch(`/api/collections/${collectionId}/items/${itemId}`, { method: "PUT", body: JSON.stringify(curr) });
        if (snX !== origX || snY !== origY || item.width !== origW || item.height !== origH) {
          const prev = { pos_x: origX, pos_y: origY, width: origW, height: origH };
          record({
            undo: () => {
              setItems((p) => p.map((i) => i.id === itemId ? { ...i, ...prev } : i));
              apiFetch(`/api/collections/${collectionId}/items/${itemId}`, { method: "PUT", body: JSON.stringify(prev) });
            },
            redo: () => {
              setItems((p) => p.map((i) => i.id === itemId ? { ...i, ...curr } : i));
              apiFetch(`/api/collections/${collectionId}/items/${itemId}`, { method: "PUT", body: JSON.stringify(curr) });
            },
          });
        }
      }
      return;
    }
    if (!dragState.current) return;
    const { itemId, origX, origY } = dragState.current;
    dragState.current = null;
    const item = itemsRef.current.find((i) => i.id === itemId);
    if (item) {
      const snX = snapToGrid(item.pos_x, gridSnap);
      const snY = snapToGrid(item.pos_y, gridSnap);
      if (snX !== item.pos_x || snY !== item.pos_y) {
        setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, pos_x: snX, pos_y: snY } : i));
      }
      apiFetch(`/api/collections/${collectionId}/items/${itemId}`, {
        method: "PUT", body: JSON.stringify({ pos_x: snX, pos_y: snY, z_index: item.z_index }),
      });
      if (snX !== origX || snY !== origY) {
        const prev = { pos_x: origX, pos_y: origY };
        const curr = { pos_x: snX, pos_y: snY };
        record({
          undo: () => {
            setItems((p) => p.map((i) => i.id === itemId ? { ...i, ...prev } : i));
            apiFetch(`/api/collections/${collectionId}/items/${itemId}`, { method: "PUT", body: JSON.stringify({ ...prev, z_index: item.z_index }) });
          },
          redo: () => {
            setItems((p) => p.map((i) => i.id === itemId ? { ...i, ...curr } : i));
            apiFetch(`/api/collections/${collectionId}/items/${itemId}`, { method: "PUT", body: JSON.stringify({ ...curr, z_index: item.z_index }) });
          },
        });
      }
    }
  };

  const handleResizePointerDown = (e: React.PointerEvent, itemId: number, corner: "nw"|"ne"|"sw"|"se") => {
    if (lockedItemIds.has(itemId)) return;
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

  // ── Align to canvas ───────────────────────────────────────────────────────

  type AlignDir = "left" | "center-h" | "right" | "top" | "center-v" | "bottom";

  const alignItem = useCallback((itemId: number, dir: AlignDir) => {
    if (!collection) return;
    const item = itemsRef.current.find((i) => i.id === itemId);
    if (!item) return;
    let newX = item.pos_x, newY = item.pos_y;
    const cw = collection.canvas_width, ch = collection.canvas_height;
    switch (dir) {
      case "left":     newX = 0; break;
      case "center-h": newX = Math.round((cw - item.width)  / 2); break;
      case "right":    newX = cw - item.width; break;
      case "top":      newY = 0; break;
      case "center-v": newY = Math.round((ch - item.height) / 2); break;
      case "bottom":   newY = ch - item.height; break;
    }
    const prev = { pos_x: item.pos_x, pos_y: item.pos_y };
    const curr = { pos_x: newX, pos_y: newY };
    setItems((p) => p.map((i) => i.id === itemId ? { ...i, ...curr } : i));
    apiFetch(`/api/collections/${collectionId}/items/${itemId}`, { method: "PUT", body: JSON.stringify(curr) });
    record({
      undo: () => {
        setItems((p) => p.map((i) => i.id === itemId ? { ...i, ...prev } : i));
        apiFetch(`/api/collections/${collectionId}/items/${itemId}`, { method: "PUT", body: JSON.stringify(prev) });
      },
      redo: () => {
        setItems((p) => p.map((i) => i.id === itemId ? { ...i, ...curr } : i));
        apiFetch(`/api/collections/${collectionId}/items/${itemId}`, { method: "PUT", body: JSON.stringify(curr) });
      },
    });
  }, [collection, collectionId, record]);

  // ── Canvas resize ─────────────────────────────────────────────────────────

  const handleCanvasResize = useCallback(async (width: number, height: number) => {
    setCollection((prev) => prev ? { ...prev, canvas_width: width, canvas_height: height } : prev);
    await apiFetch(`/api/collections/${collectionId}`, {
      method: "PUT",
      body: JSON.stringify({ canvas_width: width, canvas_height: height }),
    });
  }, [collectionId]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedItemId !== null) handleRemoveItem(selectedItemId);
      if (e.key === "Escape") {
        setEditingTextId(null);
        setSelectedItemId(null);
        setActiveTool("select");
      }
      if (e.ctrlKey && e.key === "d") { e.preventDefault(); if (selectedItemId !== null) handleDuplicate(selectedItemId); }
      if (e.ctrlKey && e.key === "z") { e.preventDefault(); doUndo(); }
      if (e.ctrlKey && (e.key === "y" || e.key === "Y")) { e.preventDefault(); doRedo(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedItemId, doUndo, doRedo]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <input
        ref={bgImageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleBackgroundImageFileChange}
      />

      {/* ── Topbar ── */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3">
        <Link href="/seller/collections" className="flex items-center gap-1.5 text-sm text-neutral-500 transition hover:text-neutral-800">
          <ArrowLeft className="h-4 w-4" /> Colecciones
        </Link>
        <div className="mx-2 h-5 w-px bg-neutral-200" />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" maxLength={120}
          className="min-w-0 flex-1 bg-transparent text-base font-semibold text-neutral-800 outline-none placeholder:text-neutral-400" />

        {/* Undo/Redo buttons */}
        <div className="flex items-center gap-1 border-l border-neutral-200 pl-3">
          <button onClick={doUndo} disabled={!canUndo} title="Deshacer (Ctrl+Z)"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition hover:bg-neutral-50 disabled:opacity-30">
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={doRedo} disabled={!canRedo} title="Rehacer (Ctrl+Y)"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition hover:bg-neutral-50 disabled:opacity-30">
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${collection.status === "published" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
          {collection.status === "published" ? "Publicada" : "Borrador"}
        </span>
        <button onClick={handleTogglePublish}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50">
          {collection.status === "published" ? <><EyeOff className="h-3.5 w-3.5" /> Despublicar</> : <><Eye className="h-3.5 w-3.5" /> Publicar</>}
        </button>
        <button
          onClick={() => {
            setTemplateName(name ? `${name} plantilla` : "Nueva plantilla");
            setTemplateError(null);
            setShowTemplateModal(true);
          }}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50"
        >
          <Copy className="h-3.5 w-3.5" />
          Guardar plantilla
        </button>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-[#0F3D3A] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[#14544f] disabled:opacity-60">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          {saved ? "Guardado" : "Guardar"}
        </button>
      </div>

      {isPreviewingTemplate && previewTemplate && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#0F3D3A]/20 bg-[#ECF6F3] px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-[#0F3D3A]">Vista previa de plantilla</p>
            <p className="text-xs text-[#2E5D57]">
              Estás viendo <span className="font-semibold">{previewTemplate.name}</span>. Tu canvas actual sigue intacto hasta que pulses aplicar.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancelTemplatePreview}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50"
            >
              Cancelar preview
            </button>
            <button
              onClick={() => handleApplyTemplate(previewTemplate.id)}
              disabled={templateApplyingId === previewTemplate.id}
              className="flex items-center gap-1.5 rounded-lg bg-[#0F3D3A] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#14544f] disabled:opacity-60"
            >
              {templateApplyingId === previewTemplate.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />}
              Aplicar plantilla
            </button>
          </div>
        </div>
      )}

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

      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Guardar como plantilla</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Guarda el canvas actual para reutilizarlo luego desde el editor.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setTemplateError(null);
                }}
                className="rounded-lg border border-neutral-200 p-2 text-neutral-500 transition hover:bg-neutral-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Nombre</label>
                <input
                  autoFocus
                  type="text"
                  maxLength={120}
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-[#0F3D3A] focus:ring-2 focus:ring-[#0F3D3A]/20"
                  placeholder="Ej. Plantilla catálogo artesanal"
                />
              </div>

              <label className="flex items-start gap-3 rounded-xl border border-neutral-200 p-3 text-sm text-neutral-600">
                <input
                  type="checkbox"
                  checked={templateIsPublic}
                  onChange={(e) => setTemplateIsPublic(e.target.checked)}
                  className="mt-0.5 rounded"
                />
                <span>
                  Hacer pública esta plantilla para que aparezca en la galería reutilizable.
                </span>
              </label>

              <div className="rounded-xl bg-neutral-50 p-3 text-xs text-neutral-500">
                Snapshot actual: {items.length} elementos, canvas {collection.canvas_width} × {collection.canvas_height}.
              </div>

              {templateError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {templateError}
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setTemplateError(null);
                }}
                className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={templateSaving || !templateName.trim()}
                className="flex-1 rounded-xl bg-[#0F3D3A] py-2.5 text-sm font-medium text-white transition hover:bg-[#14544f] disabled:opacity-60"
              >
                {templateSaving ? "Guardando..." : "Guardar plantilla"}
              </button>
            </div>
          </div>
        </div>
      )}

          {activeTool === "select" ? (
            <>
              <div className="border-b border-neutral-100 px-3 pt-3 pb-2">
                <div className="mb-2 grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setSelectSidebarTab("products")}
                    className={`rounded-lg px-2 py-1.5 text-[11px] font-medium transition ${selectSidebarTab === "products" ? "bg-[#0F3D3A] text-white" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"}`}
                  >
                    Productos
                  </button>
                  <button
                    onClick={() => setSelectSidebarTab("templates")}
                    className={`rounded-lg px-2 py-1.5 text-[11px] font-medium transition ${selectSidebarTab === "templates" ? "bg-[#0F3D3A] text-white" : "bg-neutral-50 text-neutral-500 hover:bg-neutral-100"}`}
                  >
                    Plantillas
                  </button>
                </div>
                {selectSidebarTab === "products" ? (
                  <>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Mis productos</p>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..."
                        className="w-full rounded-lg border border-neutral-200 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-[#0F3D3A]" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Plantillas</p>
                      <button
                        onClick={() => {
                          setTemplateName(name ? `${name} plantilla` : "Nueva plantilla");
                          setTemplateError(null);
                          setShowTemplateModal(true);
                        }}
                        className="text-[10px] font-medium text-[#0F3D3A] transition hover:text-[#14544f]"
                      >
                        Guardar
                      </button>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-neutral-400">Usa una base prediseñada o guarda el estado actual para reutilizarlo.</p>
                  </>
                )}
              </div>
              <div className="flex-1 space-y-1.5 overflow-y-auto p-2">
                {selectSidebarTab === "products" ? (
                  <>
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
                  </>
                ) : (
                  <>
                    {templateError && (
                      <div className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-2 text-[11px] text-red-700">
                        {templateError}
                      </div>
                    )}
                    {templates.length === 0 && (
                      <p className="py-8 text-center text-xs text-neutral-400">Todavía no hay plantillas públicas.</p>
                    )}
                    {templates.map((template) => (
                      <div key={template.id} className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
                        <div
                          className="relative h-24 w-full overflow-hidden border-b border-neutral-100 bg-white"
                        >
                          <div
                            className="absolute left-1/2 top-1/2 overflow-hidden rounded-md shadow-sm"
                            style={{
                              width: Math.max(84, template.canvas_width * 0.09),
                              height: Math.max(64, template.canvas_height * 0.09),
                              transform: "translate(-50%, -50%)",
                              background: template.background_style || template.background_color || "#FFFFFF",
                            }}
                          >
                            {template.background_image_url && (
                              <img
                                src={template.background_image_url}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover"
                              />
                            )}
                            {(template.items_snapshot ?? []).slice(0, 6).map((item, index) => {
                              const scale = 0.09;
                              const left = (Number(item.pos_x ?? 0) * scale);
                              const top = (Number(item.pos_y ?? 0) * scale);
                              const width = Math.max(8, Number(item.width ?? 60) * scale);
                              const height = Math.max(8, Number(item.height ?? 40) * scale);
                              const content = item.content as any;

                              if (item.element_type === "text") {
                                return (
                                  <div
                                    key={`${template.id}-mini-text-${index}`}
                                    style={{
                                      position: "absolute",
                                      left,
                                      top,
                                      width,
                                      height,
                                      color: content?.color ?? "#1a1a1a",
                                      fontSize: Math.max(4, Number(content?.fontSize ?? 16) * scale * 0.7),
                                      fontWeight: content?.fontWeight ?? "bold",
                                      lineHeight: content?.lineHeight ?? 1,
                                      overflow: "hidden",
                                      whiteSpace: "pre-wrap",
                                      wordBreak: "break-word",
                                      opacity: 0.95,
                                    }}
                                  >
                                    {String(content?.text ?? "").slice(0, 24)}
                                  </div>
                                );
                              }

                              if (item.element_type === "shape") {
                                return (
                                  <div
                                    key={`${template.id}-mini-shape-${index}`}
                                    style={{
                                      position: "absolute",
                                      left,
                                      top,
                                      width,
                                      height,
                                      background: content?.gradientEnabled && content?.gradientColor2
                                        ? `linear-gradient(${content?.gradientAngle ?? 135}deg, ${content?.fillColor}, ${content?.gradientColor2})`
                                        : (content?.fillColor ?? "#0F3D3A"),
                                      borderRadius: content?.shapeType === "circle" ? "999px" : `${Math.max(0, Number(content?.borderRadius ?? 8) * scale)}px`,
                                      opacity: content?.opacity ?? 1,
                                    }}
                                  />
                                );
                              }

                              if (item.element_type === "image" || item.element_type === "product") {
                                const imageUrl = content?.url || item.product_image;
                                return imageUrl ? (
                                  <img
                                    key={`${template.id}-mini-image-${index}`}
                                    src={imageUrl}
                                    alt=""
                                    style={{
                                      position: "absolute",
                                      left,
                                      top,
                                      width,
                                      height,
                                      objectFit: "cover",
                                      borderRadius: `${Math.max(2, Number(content?.borderRadius ?? 8) * scale)}px`,
                                    }}
                                  />
                                ) : (
                                  <div
                                    key={`${template.id}-mini-placeholder-${index}`}
                                    style={{
                                      position: "absolute",
                                      left,
                                      top,
                                      width,
                                      height,
                                      background: item.element_type === "product" ? "#dbe4ea" : "#e5e7eb",
                                      borderRadius: "4px",
                                    }}
                                  />
                                );
                              }

                              return null;
                            })}
                          </div>
                          <div className="pointer-events-none absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                            {template.canvas_width}×{template.canvas_height}
                          </div>
                        </div>
                        <div className="space-y-2 p-2.5">
                          <div>
                            <p className="line-clamp-1 text-xs font-semibold text-neutral-800">{template.name}</p>
                            <p className="text-[11px] text-neutral-400">{template.item_count} elementos</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                            onClick={() => handlePreviewTemplate(template)}
                            disabled={templateApplyingId === template.id}
                            className={`flex items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs font-medium transition disabled:opacity-60 ${
                                previewTemplate?.id === template.id
                                  ? "border-[#0F3D3A] bg-[#0F3D3A] text-white"
                                  : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                              }`}
                            >
                              {templateApplyingId === template.id && previewTemplate?.id !== template.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
                              {previewTemplate?.id === template.id ? "Viendo" : "Preview"}
                            </button>
                            <button
                              onClick={() => previewTemplate?.id === template.id ? handleApplyTemplate(template.id) : handlePreviewTemplate(template)}
                              disabled={templateApplyingId === template.id}
                              className="flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60"
                            >
                              {templateApplyingId === template.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Copy className="h-3 w-3" />}
                              {previewTemplate?.id === template.id ? "Aplicar" : "Abrir"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
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
                <div className="grid grid-cols-3 gap-1">
                  {SHAPE_TYPES.map((t) => (
                    <button key={t.value} onClick={() => setShapeDefaults((p) => ({ ...p, shapeType: t.value }))}
                      className={`rounded-lg border py-1.5 text-[10px] transition ${shapeDefaults.shapeType === t.value ? "border-[#0F3D3A] bg-[#0F3D3A] text-white" : "border-neutral-200 text-neutral-500"}`}>
                      {t.label}
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
            <label className="flex items-center gap-1.5 text-xs text-neutral-500">
              Fondo:
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                className="h-6 w-10 cursor-pointer rounded border border-neutral-200" />
            </label>
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
            <div className="flex items-center gap-1 border-l border-neutral-200 pl-3">
              <button
                onClick={() => bgImageInputRef.current?.click()}
                disabled={bgImageUploading}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-2 py-1 text-xs text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-60"
              >
                {bgImageUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
                {collection.background_image_url ? "Cambiar fondo" : "Subir fondo"}
              </button>
              {collection.background_image_url && (
                <button
                  onClick={handleRemoveBackgroundImage}
                  disabled={bgImageUploading}
                  className="rounded-lg border border-neutral-200 px-2 py-1 text-xs text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-60"
                >
                  Quitar fondo
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 border-l border-neutral-200 pl-3">
              <Grid3x3 className="h-3.5 w-3.5 text-neutral-400" />
              <div className="flex gap-0.5">
                {GRID_OPTIONS.map((g) => (
                  <button key={g.value} onClick={() => setGridSnap(g.value)}
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition ${gridSnap === g.value ? "bg-indigo-600 text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Canvas size presets */}
            <div className="flex items-center gap-1 border-l border-neutral-200 pl-3">
              <span className="text-[10px] text-neutral-400">Canvas:</span>
              {([
                { label: "800²",   w: 800,  h: 800  },
                { label: "8×12",   w: 800,  h: 1200 },
                { label: "12×8",   w: 1200, h: 800  },
                { label: "1×1",    w: 1080, h: 1080 },
              ] as const).map((p) => {
                const active = collection.canvas_width === p.w && collection.canvas_height === p.h;
                return (
                  <button key={p.label} onClick={() => handleCanvasResize(p.w, p.h)}
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition ${active ? "bg-[#0F3D3A] text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>
                    {p.label}
                  </button>
                );
              })}
            </div>
            <span className="text-xs text-neutral-400">{displayCanvasWidth} × {displayCanvasHeight}</span>
            {!isPreviewingTemplate && activeTool !== "select" && activeTool !== "image" && (
              <span className="text-xs font-medium text-[#0F3D3A]">
                {activeTool === "text" ? "✏ Clic para texto" : "■ Clic para forma"}
              </span>
            )}
            {!isPreviewingTemplate && selectedItemId && activeTool === "select" && (
              <span className="ml-auto flex items-center gap-2 text-xs text-neutral-400">
                <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[10px]">Ctrl+Z</kbd> deshacer
                <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[10px]">Delete</kbd> eliminar
              </span>
            )}
          </div>

          {/* Canvas */}
          <div
            ref={canvasViewportRef}
            className={`flex flex-1 items-center justify-center p-8 ${isPreviewingTemplate ? "overflow-hidden" : "overflow-auto"}`}
            onClick={() => { if (!isPreviewingTemplate && activeTool === "select") { setSelectedItemId(null); setEditingTextId(null); } }}>
            <div
              style={
                isPreviewingTemplate
                  ? {
                      width: displayCanvasWidth * previewScale,
                      height: displayCanvasHeight * previewScale,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }
                  : undefined
              }
            >
              <div ref={canvasRef}
                className="relative shrink-0 shadow-xl"
                style={{
                  width: displayCanvasWidth, height: displayCanvasHeight,
                  background: displayBackground,
                  cursor: !isPreviewingTemplate && (activeTool === "text" || activeTool === "shape") ? "crosshair" : "default",
                  ...(isPreviewingTemplate ? {
                    transform: `scale(${previewScale})`,
                    transformOrigin: "center center",
                  } : {}),
                  ...gridOverlayStyle,
                }}
                onDragOver={isPreviewingTemplate ? undefined : handleCanvasDragOver}
                onDrop={isPreviewingTemplate ? undefined : handleCanvasDrop}
                onPointerMove={isPreviewingTemplate ? undefined : handleCanvasPointerMove}
                onPointerUp={isPreviewingTemplate ? undefined : handleCanvasPointerUp}
                onPointerLeave={isPreviewingTemplate ? undefined : handleCanvasPointerUp}
                onClick={isPreviewingTemplate ? undefined : handleCanvasClick}
              >
              {displayBackgroundImageUrl && (
                <img
                  src={displayBackgroundImageUrl}
                  alt=""
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  style={{ zIndex: 0, objectFit: "cover" }}
                  draggable={false}
                />
              )}
              {displayItems.length === 0 && activeTool === "select" && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
                  <p className="text-sm font-medium text-neutral-400">Canvas vacío</p>
                  <p className="text-xs text-neutral-300">Arrastra productos o usa Texto / Forma / Imagen</p>
                </div>
              )}

              {displayItems.map((item) => {
                const isSelected    = selectedItemId === item.id;
                const isLocked      = lockedItemIds.has(item.id);
                const tc            = item.content as ContentText;
                const sc            = item.content as ContentShape;
                const ic            = item.content as ContentImage;
                const motionStyle   = getMotionStyle(item);
                const isEditingText = editingTextId === item.id;

                return (
                  <div
                    key={item.id}
                    data-canvas-item="true"
                    style={{
                      position: "absolute",
                      left: item.pos_x, top: item.pos_y,
                      width: item.width, height: item.height,
                      zIndex: (item.z_index ?? 0) + 1,
                      transform: getItemTransform(item),
                      transformOrigin: "center center",
                      cursor: !isPreviewingTemplate && activeTool === "select" ? (isLocked ? "default" : isEditingText ? "text" : "grab") : "default",
                      touchAction: "none",
                    }}
                    className={`group rounded-lg ${!isPreviewingTemplate && isSelected ? "ring-2 ring-[#0F3D3A] ring-offset-1 shadow-lg" : !isPreviewingTemplate ? "hover:shadow-md" : ""}`}
                    onPointerDown={isPreviewingTemplate ? undefined : (e) => handleItemPointerDown(e, item.id)}
                    onClick={isPreviewingTemplate ? undefined : (e) => { e.stopPropagation(); if (activeTool === "select") setSelectedItemId(item.id); }}
                    onDoubleClick={isPreviewingTemplate ? undefined : (e) => {
                      e.stopPropagation();
                      if (item.element_type === "text" && activeTool === "select") {
                        setSelectedItemId(item.id);
                        setEditingTextId(item.id);
                      }
                    }}
                  >
                    {/* Motion wrapper */}
                    <div style={{ width: "100%", height: "100%", position: "relative", ...motionStyle }}>
                      {item.element_type === "product" && (
                        item.product_image
                          ? <img src={item.product_image} alt={item.product_name ?? ""} className="h-full w-full rounded-lg object-cover" draggable={false} />
                          : <div className="flex h-full w-full items-center justify-center rounded-lg bg-neutral-200"><span className="text-xs text-neutral-400">Sin imagen</span></div>
                      )}

                      {item.element_type === "text" && (() => {
                        const hasBg = tc?.bgColor && tc.bgColor !== "";
                        return (
                          <>
                            <div style={{
                              width: "100%", height: "100%",
                              display: "flex", alignItems: "center",
                              padding: `${tc?.paddingY ?? 8}px ${tc?.paddingX ?? 10}px`,
                              color: tc?.color || "#1a1a1a",
                              fontSize: tc?.fontSize || 24,
                              fontFamily: tc?.fontFamily || "inherit",
                              fontWeight: tc?.fontWeight || "bold",
                              fontStyle: tc?.fontStyle || "normal",
                              letterSpacing: `${tc?.letterSpacing ?? 0}px`,
                              textAlign: tc?.textAlign || "center",
                              justifyContent: tc?.textAlign === "right" ? "flex-end" : tc?.textAlign === "center" ? "center" : "flex-start",
                              textShadow: tc?.shadow ? `${tc.shadowX ?? 2}px ${tc.shadowY ?? 2}px ${tc.shadowBlur ?? 4}px ${tc.shadowColor ?? "#000000"}` : undefined,
                              WebkitTextStroke: tc?.outline ? `${tc.outlineWidth ?? 1}px ${tc.outlineColor ?? "#000000"}` : undefined,
                              whiteSpace: "pre-wrap", wordBreak: "break-word",
                              userSelect: "none", overflow: "hidden", lineHeight: tc?.lineHeight ?? 1.2,
                              background: hasBg ? hexToRgba(tc.bgColor!, tc.bgOpacity ?? 0.6) : undefined,
                              borderRadius: hasBg ? 8 : undefined,
                              opacity: isEditingText ? 0.3 : 1,
                            }}>
                              {tc?.text || "Texto"}
                            </div>
                            {/* Inline text editor overlay */}
                            {isEditingText && (
                              <textarea
                                autoFocus
                                value={tc?.text ?? ""}
                                onChange={(e) => updateItemContent(item.id, { ...tc, text: e.target.value })}
                                onBlur={() => setEditingTextId(null)}
                                onKeyDown={(e) => {
                                  if (e.key === "Escape") { e.stopPropagation(); setEditingTextId(null); }
                                }}
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  position: "absolute", inset: 0, zIndex: 20,
                                  width: "100%", height: "100%",
                                  resize: "none", padding: `${tc?.paddingY ?? 8}px ${tc?.paddingX ?? 10}px`,
                                  color: tc?.color || "#1a1a1a",
                                  fontSize: tc?.fontSize || 24,
                                  fontFamily: tc?.fontFamily || "inherit",
                                  fontWeight: tc?.fontWeight || "bold",
                                  fontStyle: tc?.fontStyle || "normal",
                                  letterSpacing: `${tc?.letterSpacing ?? 0}px`,
                                  textAlign: tc?.textAlign || "center",
                                  background: hasBg ? hexToRgba(tc.bgColor!, tc.bgOpacity ?? 0.6) : "rgba(255,255,255,0.9)",
                                  border: "2px dashed #0F3D3A",
                                  borderRadius: 4, outline: "none",
                                  lineHeight: tc?.lineHeight ?? 1.2, boxSizing: "border-box",
                                }}
                              />
                            )}
                          </>
                        );
                      })()}

                      {item.element_type === "shape" && (
                        <div style={{
                          width: "100%", height: "100%",
                          background: getShapeBackground(sc),
                          borderRadius: getShapeBorderRadius(sc),
                          clipPath: getShapeClipPath(sc?.shapeType),
                          opacity: sc?.opacity ?? 1,
                          boxShadow: buildBoxShadow(sc),
                          border: (sc?.strokeWidth ?? 0) > 0 && sc?.shapeType !== "triangle" && sc?.shapeType !== "star"
                            ? `${sc.strokeWidth}px solid ${sc.strokeColor ?? "#000000"}`
                            : undefined,
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
                                boxShadow: buildBoxShadow(ic),
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

                    {!isPreviewingTemplate && isSelected && activeTool === "select" && !isEditingText && (
                      <>
                        {/* Lock badge */}
                        {isLocked && (
                          <div className="pointer-events-none absolute -left-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-white shadow">
                            <Lock className="h-3 w-3" />
                          </div>
                        )}
                        {!isLocked && (<>
                          <button onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.id); }}
                            className="absolute -right-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600">
                            <X className="h-3 w-3" />
                          </button>
                          <button onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); handleDuplicate(item.id); }}
                            title="Duplicar (Ctrl+D)"
                            className="absolute -left-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white shadow hover:bg-blue-600">
                            <Copy className="h-3 w-3" />
                          </button>
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
                          {/* Double-click hint for text */}
                          {item.element_type === "text" && (
                            <div className="pointer-events-none absolute inset-x-0 -bottom-5 flex justify-center">
                              <span className="rounded bg-black/60 px-1.5 py-0.5 text-[9px] text-white">doble clic para editar</span>
                            </div>
                          )}
                        </>)}
                      </>
                    )}
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right properties panel ── */}
        <aside className="flex w-60 shrink-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="border-b border-neutral-100 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Propiedades</p>
          </div>

          {isPreviewingTemplate ? (
            <div className="flex flex-1 flex-col justify-between p-4">
              <div>
                <p className="text-sm font-semibold text-neutral-800">Preview activa</p>
                <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                  Estás viendo la plantilla sobre el canvas sin reemplazar tu diseño actual. Puedes inspeccionar composición, colores y proporciones antes de aplicarla.
                </p>
                {previewTemplate && (
                  <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                    <p className="text-xs font-semibold text-neutral-700">{previewTemplate.name}</p>
                    <p className="mt-1 text-[11px] text-neutral-500">
                      {previewTemplate.item_count} elementos · {previewTemplate.canvas_width} × {previewTemplate.canvas_height}
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => previewTemplate && handleApplyTemplate(previewTemplate.id)}
                  disabled={!previewTemplate || templateApplyingId === previewTemplate.id}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#0F3D3A] py-2.5 text-sm font-medium text-white transition hover:bg-[#14544f] disabled:opacity-60"
                >
                  {previewTemplate && templateApplyingId === previewTemplate.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
                  Aplicar esta plantilla
                </button>
                <button
                  onClick={handleCancelTemplatePreview}
                  className="w-full rounded-xl border border-neutral-200 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
                >
                  Volver a mi canvas
                </button>
              </div>
            </div>
          ) : !selectedItem ? (
            <div className="flex flex-1 items-center justify-center p-4 text-center">
              <p className="text-xs leading-relaxed text-neutral-300">Selecciona un elemento para editar</p>
            </div>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto p-3">

              {/* ── Position & size inputs ── */}
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Posición y tamaño</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["pos_x", "pos_y", "width", "height"] as const).map((field) => (
                    <div key={field}>
                      <label className="text-[10px] text-neutral-400">{field === "pos_x" ? "X" : field === "pos_y" ? "Y" : field === "width" ? "Ancho" : "Alto"}</label>
                      <input
                        type="number"
                        value={Math.round(selectedItem[field])}
                        onChange={(e) => handlePositionChange(selectedItem.id, field, Number(e.target.value))}
                        onFocus={() => handlePosInputFocus(selectedItem.id)}
                        onBlur={() => handlePosInputBlur(selectedItem.id)}
                        className="mt-0.5 w-full rounded-lg border border-neutral-200 px-2 py-1 text-xs outline-none focus:border-[#0F3D3A]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* ── TEXT specific ── */}
              {selectedItem.element_type === "text" && (() => {
                const c = selectedItem.content as ContentText;
                const upd = (patch: Partial<ContentText>) => updateItemContent(selectedItem.id, { ...c, ...patch });
                return (
                  <>
                    <div className="border-t border-neutral-100 pt-2">
                      <label className="text-[11px] font-medium text-neutral-500">Texto</label>
                      <textarea value={c?.text ?? ""} onChange={(e) => upd({ text: e.target.value })}
                        rows={3} className="mt-1 w-full resize-none rounded-lg border border-neutral-200 p-2 text-xs outline-none focus:border-[#0F3D3A]" />
                    </div>
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
                      <div>
                        <label className="text-[11px] font-medium text-neutral-500">Letter spacing: {c?.letterSpacing ?? 0}px</label>
                        <input type="range" min={-2} max={10} step={0.5} value={c?.letterSpacing ?? 0}
                          onChange={(e) => upd({ letterSpacing: Number(e.target.value) })}
                          className="mt-1 w-full" />
                      </div>
                      <div className="mt-2">
                        <label className="text-[11px] font-medium text-neutral-500">Line height: {(c?.lineHeight ?? 1.2).toFixed(1)}</label>
                        <input type="range" min={0.8} max={3} step={0.1} value={c?.lineHeight ?? 1.2}
                          onChange={(e) => upd({ lineHeight: Number(e.target.value) })}
                          className="mt-1 w-full" />
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-medium text-neutral-500">Padding X: {c?.paddingX ?? 10}px</label>
                          <input type="range" min={0} max={40} value={c?.paddingX ?? 10}
                            onChange={(e) => upd({ paddingX: Number(e.target.value) })}
                            className="mt-1 w-full" />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-neutral-500">Padding Y: {c?.paddingY ?? 8}px</label>
                          <input type="range" min={0} max={40} value={c?.paddingY ?? 8}
                            onChange={(e) => upd({ paddingY: Number(e.target.value) })}
                            className="mt-1 w-full" />
                        </div>
                      </div>
                    </div>
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
                    <div className="border-t border-neutral-100 pt-2">
                      <label className="mb-1 block text-[11px] font-medium text-neutral-500">Tipo</label>
                      <div className="grid grid-cols-3 gap-1">
                        {SHAPE_TYPES.map((t) => (
                          <button key={t.value} onClick={() => upd({ shapeType: t.value })}
                            className={`rounded-lg border py-1.5 text-[10px] transition ${c?.shapeType === t.value ? "border-[#0F3D3A] bg-[#0F3D3A] text-white" : "border-neutral-200 text-neutral-500"}`}>
                            {t.label}
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
                    {(c?.shapeType === "rectangle") && (
                      <div>
                        <label className="text-[11px] font-medium text-neutral-500">Redondeo: {c?.borderRadius ?? 8}px</label>
                        <input type="range" min={0} max={80} value={c?.borderRadius ?? 8}
                          onChange={(e) => upd({ borderRadius: Number(e.target.value) })}
                          className="mt-1 w-full" />
                      </div>
                    )}
                    <div>
                      <label className="text-[11px] font-medium text-neutral-500">Opacidad: {Math.round((c?.opacity ?? 1) * 100)}%</label>
                      <input type="range" min={0.05} max={1} step={0.05} value={c?.opacity ?? 1}
                        onChange={(e) => upd({ opacity: Number(e.target.value) })}
                        className="mt-1 w-full" />
                    </div>
                    {(c?.shapeType === "rectangle" || c?.shapeType === "circle" || c?.shapeType === "line") && (
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
                    )}
                    <div className="border-t border-neutral-100 pt-2">
                      <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-neutral-600">
                        <input type="checkbox" checked={c?.shadowEnabled ?? false}
                          onChange={(e) => upd({ shadowEnabled: e.target.checked })} className="rounded" />
                        Sombra
                      </label>
                      {c?.shadowEnabled && (
                        <div className="mt-2 space-y-2">
                          <div className="grid grid-cols-2 gap-1.5">
                            <div>
                              <label className="text-[10px] text-neutral-400">X</label>
                              <input type="number" min={-40} max={40} value={c.shadowX ?? 4}
                                onChange={(e) => upd({ shadowX: Number(e.target.value) })}
                                className="mt-0.5 w-full rounded border border-neutral-200 px-1.5 py-1 text-xs outline-none" />
                            </div>
                            <div>
                              <label className="text-[10px] text-neutral-400">Y</label>
                              <input type="number" min={-40} max={40} value={c.shadowY ?? 4}
                                onChange={(e) => upd({ shadowY: Number(e.target.value) })}
                                className="mt-0.5 w-full rounded border border-neutral-200 px-1.5 py-1 text-xs outline-none" />
                            </div>
                            <div>
                              <label className="text-[10px] text-neutral-400">Blur</label>
                              <input type="number" min={0} max={80} value={c.shadowBlur ?? 8}
                                onChange={(e) => upd({ shadowBlur: Number(e.target.value) })}
                                className="mt-0.5 w-full rounded border border-neutral-200 px-1.5 py-1 text-xs outline-none" />
                            </div>
                            <div>
                              <label className="text-[10px] text-neutral-400">Spread</label>
                              <input type="number" min={-20} max={40} value={c.shadowSpread ?? 0}
                                onChange={(e) => upd({ shadowSpread: Number(e.target.value) })}
                                className="mt-0.5 w-full rounded border border-neutral-200 px-1.5 py-1 text-xs outline-none" />
                            </div>
                          </div>
                          <input type="color" value={c.shadowColor ?? "#000000"}
                            onChange={(e) => upd({ shadowColor: e.target.value })}
                            className="h-7 w-full cursor-pointer rounded border border-neutral-200" />
                        </div>
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
                    <div className="border-t border-neutral-100 pt-2">
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
                    <div className="border-t border-neutral-100 pt-2">
                      <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-neutral-600">
                        <input type="checkbox" checked={c?.shadowEnabled ?? false}
                          onChange={(e) => upd({ shadowEnabled: e.target.checked })} className="rounded" />
                        Sombra
                      </label>
                      {c?.shadowEnabled && (
                        <div className="mt-2 space-y-2">
                          <div className="grid grid-cols-2 gap-1.5">
                            <div>
                              <label className="text-[10px] text-neutral-400">X</label>
                              <input type="number" min={-40} max={40} value={c.shadowX ?? 4}
                                onChange={(e) => upd({ shadowX: Number(e.target.value) })}
                                className="mt-0.5 w-full rounded border border-neutral-200 px-1.5 py-1 text-xs outline-none" />
                            </div>
                            <div>
                              <label className="text-[10px] text-neutral-400">Y</label>
                              <input type="number" min={-40} max={40} value={c.shadowY ?? 4}
                                onChange={(e) => upd({ shadowY: Number(e.target.value) })}
                                className="mt-0.5 w-full rounded border border-neutral-200 px-1.5 py-1 text-xs outline-none" />
                            </div>
                            <div>
                              <label className="text-[10px] text-neutral-400">Blur</label>
                              <input type="number" min={0} max={80} value={c.shadowBlur ?? 8}
                                onChange={(e) => upd({ shadowBlur: Number(e.target.value) })}
                                className="mt-0.5 w-full rounded border border-neutral-200 px-1.5 py-1 text-xs outline-none" />
                            </div>
                            <div>
                              <label className="text-[10px] text-neutral-400">Spread</label>
                              <input type="number" min={-20} max={40} value={c.shadowSpread ?? 0}
                                onChange={(e) => upd({ shadowSpread: Number(e.target.value) })}
                                className="mt-0.5 w-full rounded border border-neutral-200 px-1.5 py-1 text-xs outline-none" />
                            </div>
                          </div>
                          <input type="color" value={c.shadowColor ?? "#000000"}
                            onChange={(e) => upd({ shadowColor: e.target.value })}
                            className="h-7 w-full cursor-pointer rounded border border-neutral-200" />
                        </div>
                      )}
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

              {/* ── SHARED: Alignment ── */}
              <div className="border-t border-neutral-100 pt-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Alinear al canvas</p>
                <div className="grid grid-cols-3 gap-1">
                  {([
                    { dir: "left"     as AlignDir, Icon: AlignHorizontalJustifyStart,  title: "Izquierda" },
                    { dir: "center-h" as AlignDir, Icon: AlignHorizontalJustifyCenter, title: "Centro H" },
                    { dir: "right"    as AlignDir, Icon: AlignHorizontalJustifyEnd,    title: "Derecha" },
                    { dir: "top"      as AlignDir, Icon: AlignVerticalJustifyStart,    title: "Arriba" },
                    { dir: "center-v" as AlignDir, Icon: AlignVerticalJustifyCenter,   title: "Centro V" },
                    { dir: "bottom"   as AlignDir, Icon: AlignVerticalJustifyEnd,      title: "Abajo" },
                  ]).map(({ dir, Icon, title }) => (
                    <button key={dir} onClick={() => alignItem(selectedItem.id, dir)} title={title}
                      className="flex items-center justify-center rounded-lg border border-neutral-200 py-1.5 text-neutral-500 transition hover:bg-neutral-50 hover:text-[#0F3D3A]">
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* ── SHARED: Layer order + Duplicate + Lock ── */}
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
                <div className="mt-1.5 flex gap-1.5">
                  <button onClick={() => handleDuplicate(selectedItem.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 py-1.5 text-xs text-neutral-600 transition hover:bg-neutral-50">
                    <Copy className="h-3 w-3" /> Duplicar
                  </button>
                  <button
                    onClick={() => setLockedItemIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(selectedItem.id)) next.delete(selectedItem.id);
                      else next.add(selectedItem.id);
                      return next;
                    })}
                    title={lockedItemIds.has(selectedItem.id) ? "Desbloquear" : "Bloquear"}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs transition ${
                      lockedItemIds.has(selectedItem.id)
                        ? "border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}>
                    {lockedItemIds.has(selectedItem.id) ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                    {lockedItemIds.has(selectedItem.id) ? "Bloqueado" : "Bloquear"}
                  </button>
                </div>
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
