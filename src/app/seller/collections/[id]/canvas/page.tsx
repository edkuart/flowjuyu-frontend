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
  Minus, Plus, Sparkles,
} from "lucide-react";
import { apiFetch, invalidateCache } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  SellerActionButton,
  SellerPill,
  SellerSurfaceCard,
} from "@/components/seller/ui/SellerPrimitives";
import CollectionArtworkPreview from "@/components/seller/CollectionArtworkPreview";
import { PageBackNav } from "@/components/ui/PageBackNav";
import { FloatingActionDock } from "@/components/ui/FloatingActionDock";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  shapeType: "rectangle" | "circle" | "triangle" | "star" | "line" | "capsule" | "arch" | "blob" | "sparkle" | "wave" | "diamond";
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
type ActiveTool = "select" | "text" | "shape" | "image" | "decor";
type SelectSidebarTab = "products" | "templates";
type MobilePanel = "tools" | "library" | "properties" | null;
type TemplateScopeFilter = "all" | "mine" | "system";

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
  owner_scope?: "mine" | "system";
};

type GraphicPreset = {
  id: string;
  label: string;
  group: "Editorial" | "Simbolos" | "Outline" | "Emoji";
  width: number;
  height: number;
  objectFit?: "cover" | "contain";
  svg: string;
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

type BackgroundGradientState = {
  enabled: boolean;
  color2: string;
  angle: number;
  type: "linear" | "radial";
};

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const GRAPHIC_PRESETS: GraphicPreset[] = [
  {
    id: "editorial-spark",
    label: "Spark editorial",
    group: "Editorial",
    width: 180,
    height: 180,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" fill="none"><path d="M90 12L101 63L152 74L101 85L90 136L79 85L28 74L79 63L90 12Z" fill="#F5E7D6"/><path d="M90 44L97 74L128 81L97 88L90 118L83 88L52 81L83 74L90 44Z" fill="#D9B183"/><circle cx="90" cy="81" r="8" fill="#9E6B49"/><circle cx="127" cy="42" r="7" fill="#E7D1B6"/><circle cx="54" cy="121" r="6" fill="#E7D1B6"/></svg>`,
  },
  {
    id: "editorial-camellia",
    label: "Flor editorial",
    group: "Editorial",
    width: 200,
    height: 200,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none"><path d="M82 100a18 18 0 1 0 36 0a18 18 0 1 0 -36 0" stroke="#C78467" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M100 40a18 18 0 0 1 18 18c0 3.4 -1.5 8.6 -4.7 15.7l-4.3 8.3l10.4 -11.2c3 -3.5 5.4 -5.8 7.4 -7a17.8 17.8 0 0 1 24.2 6.6a18.1 18.1 0 0 1 -6.5 24.4c-2.2 1.3 -5.9 2.4 -11 3.2l-15.8 2.2l14.2 1.9c5.9 .8 10.1 2 12.5 3.4a18.1 18.1 0 0 1 6.5 24.4a17.8 17.8 0 0 1 -24.2 6.5c-2 -1.2 -4.4 -3.5 -7.4 -7l-10.4 -11.2l4.3 8.1c3.2 7.2 4.7 12.4 4.7 15.8a18 18 0 0 1 -36 0c0 -3.4 1.5 -8.6 4.7 -15.8l4.3 -8.1l-10.4 11.2c-3 3.5 -5.4 5.8 -7.4 7a17.8 17.8 0 0 1 -24.2 -6.5a18.1 18.1 0 0 1 6.5 -24.4c2.2 -1.3 5.9 -2.4 11 -3.2l15.8 -2.2l-14.2 -1.9c-5.9 -.8 -10.1 -2 -12.5 -3.4a18.1 18.1 0 0 1 -6.5 -24.4a17.8 17.8 0 0 1 24.2 -6.6c2 1.2 4.4 3.5 7.4 7l10.4 11.2l-4.3 -8.3c-3.2 -7.1 -4.7 -12.3 -4.7 -15.7a18 18 0 0 1 18 -18" stroke="#E4B9A7" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="100" cy="100" r="8" fill="#8F563D"/></svg>`,
  },
  {
    id: "editorial-ribbon",
    label: "Lazo",
    group: "Editorial",
    width: 240,
    height: 120,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 120" fill="none"><path d="M74 61C46 29 29 27 20 39C11 51 19 76 44 83C61 88 76 79 92 66" stroke="#EAD9BE" stroke-width="10" stroke-linecap="round"/><path d="M166 61C194 29 211 27 220 39C229 51 221 76 196 83C179 88 164 79 148 66" stroke="#EAD9BE" stroke-width="10" stroke-linecap="round"/><ellipse cx="120" cy="58" rx="18" ry="14" fill="#D4AD79"/><path d="M101 58C108 70 132 70 139 58" stroke="#B68253" stroke-width="8" stroke-linecap="round"/><path d="M110 69L102 103" stroke="#B68253" stroke-width="8" stroke-linecap="round"/><path d="M130 69L138 103" stroke="#B68253" stroke-width="8" stroke-linecap="round"/><path d="M102 103L118 91" stroke="#C79663" stroke-width="6" stroke-linecap="round"/><path d="M138 103L122 91" stroke="#C79663" stroke-width="6" stroke-linecap="round"/></svg>`,
  },
  {
    id: "editorial-orbit",
    label: "Orbitas",
    group: "Editorial",
    width: 220,
    height: 220,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" fill="none"><circle cx="110" cy="110" r="16" fill="#B88A5A"/><ellipse cx="110" cy="110" rx="74" ry="29" stroke="#F1E5D5" stroke-width="6"/><ellipse cx="110" cy="110" rx="29" ry="74" stroke="#D8C2A4" stroke-width="6"/><path d="M55 55C83 37 136 37 165 55" stroke="#E7D4BA" stroke-width="4" stroke-linecap="round"/><circle cx="56" cy="110" r="7" fill="#F1E5D5"/><circle cx="110" cy="54" r="7" fill="#D8C2A4"/><circle cx="164" cy="110" r="7" fill="#E7D4BA"/><circle cx="110" cy="166" r="7" fill="#C99B68"/></svg>`,
  },
  {
    id: "editorial-shell",
    label: "Concha",
    group: "Editorial",
    width: 200,
    height: 180,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 180" fill="none"><path d="M100 22C137 22 166 48 174 86H26C34 48 63 22 100 22Z" fill="#F4E8DB"/><path d="M28 91C34 133 63 160 100 160C137 160 166 133 172 91H28Z" fill="#D7B18C"/><path d="M49 91V149" stroke="#C78F67" stroke-width="6" stroke-linecap="round"/><path d="M73 91V157" stroke="#C78F67" stroke-width="6" stroke-linecap="round"/><path d="M100 91V161" stroke="#C78F67" stroke-width="6" stroke-linecap="round"/><path d="M127 91V157" stroke="#C78F67" stroke-width="6" stroke-linecap="round"/><path d="M151 91V149" stroke="#C78F67" stroke-width="6" stroke-linecap="round"/><path d="M62 64C71 55 84 50 100 50C116 50 129 55 138 64" stroke="#E8D1BC" stroke-width="4" stroke-linecap="round"/></svg>`,
  },
  {
    id: "symbol-heart",
    label: "Corazon",
    group: "Simbolos",
    width: 170,
    height: 150,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 150" fill="none"><path d="M85 142C84 142 83 141 82 140L38 98C23 84 14 70 14 54C14 33 30 18 50 18C64 18 76 24 85 36C94 24 106 18 120 18C140 18 156 33 156 54C156 70 147 84 132 98L88 140C87 141 86 142 85 142Z" fill="#A43242"/></svg>`,
  },
  {
    id: "symbol-moon",
    label: "Luna",
    group: "Simbolos",
    width: 160,
    height: 160,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" fill="none"><path d="M106 14C86 24 73 45 73 68C73 97 93 121 121 128C110 137 96 142 80 142C42 142 12 112 12 74C12 36 42 6 80 6C89 6 98 9 106 14Z" fill="#F0E5CF"/></svg>`,
  },
  {
    id: "symbol-badge",
    label: "Sello",
    group: "Simbolos",
    width: 180,
    height: 180,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" fill="none"><path d="M90 14L106 25L126 23L133 42L152 50L150 70L163 86L153 103L156 123L137 131L130 150L109 148L90 160L71 148L50 150L43 131L24 123L27 103L17 86L30 70L28 50L47 42L54 23L74 25L90 14Z" fill="#F5EBD9"/><circle cx="90" cy="86" r="38" fill="#B68959"/><circle cx="90" cy="86" r="19" fill="#F8F1E5"/><path d="M65 136L75 108L90 118L105 108L115 136" fill="#D1A46E"/></svg>`,
  },
  {
    id: "symbol-leaf",
    label: "Hoja",
    group: "Simbolos",
    width: 180,
    height: 180,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" fill="none"><path d="M142 34C142 105 108 148 49 150C47 90 77 43 142 34Z" fill="#2F6A57"/><path d="M57 144C80 119 103 92 130 50" stroke="#E0ECE3" stroke-width="7" stroke-linecap="round"/><path d="M82 108C92 113 102 118 111 126" stroke="#E0ECE3" stroke-width="5" stroke-linecap="round"/><path d="M97 87C106 92 115 98 123 105" stroke="#E0ECE3" stroke-width="5" stroke-linecap="round"/><path d="M73 126C81 129 89 135 95 142" stroke="#D0DED5" stroke-width="4" stroke-linecap="round"/></svg>`,
  },
  {
    id: "symbol-sun",
    label: "Sol",
    group: "Simbolos",
    width: 180,
    height: 180,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" fill="none"><circle cx="90" cy="90" r="30" fill="#F5C565"/><path d="M90 18V36" stroke="#F2DEC0" stroke-width="8" stroke-linecap="round"/><path d="M90 144V162" stroke="#F2DEC0" stroke-width="8" stroke-linecap="round"/><path d="M18 90H36" stroke="#F2DEC0" stroke-width="8" stroke-linecap="round"/><path d="M144 90H162" stroke="#F2DEC0" stroke-width="8" stroke-linecap="round"/><path d="M39 39L52 52" stroke="#F2DEC0" stroke-width="8" stroke-linecap="round"/><path d="M128 128L141 141" stroke="#F2DEC0" stroke-width="8" stroke-linecap="round"/><path d="M128 52L141 39" stroke="#F2DEC0" stroke-width="8" stroke-linecap="round"/><path d="M39 141L52 128" stroke="#F2DEC0" stroke-width="8" stroke-linecap="round"/><circle cx="90" cy="90" r="44" stroke="#F8EDD8" stroke-opacity=".45" stroke-width="4"/></svg>`,
  },
  {
    id: "symbol-eye",
    label: "Ojo",
    group: "Simbolos",
    width: 220,
    height: 130,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 130" fill="none"><path d="M18 65C38 34 70 18 110 18C150 18 182 34 202 65C182 96 150 112 110 112C70 112 38 96 18 65Z" fill="#F7F2EA"/><path d="M18 65C38 34 70 18 110 18C150 18 182 34 202 65C182 96 150 112 110 112C70 112 38 96 18 65Z" stroke="#E0D0BC" stroke-width="4"/><circle cx="110" cy="65" r="26" fill="#2E5D57"/><circle cx="110" cy="65" r="12" fill="#111827"/><circle cx="118" cy="57" r="4" fill="#fff"/><path d="M36 40C58 22 81 14 110 14C139 14 162 22 184 40" stroke="#EADBC8" stroke-width="3" stroke-linecap="round"/></svg>`,
  },
  {
    id: "symbol-handmade",
    label: "Handmade",
    group: "Simbolos",
    width: 220,
    height: 120,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 120" fill="none"><rect x="8" y="14" width="204" height="92" rx="24" fill="#F6ECDD"/><path d="M53 73C61 48 78 34 101 34C121 34 135 46 138 65C141 84 128 98 108 100C84 103 65 92 53 73Z" fill="#B1734C"/><path d="M130 38C147 52 159 69 168 91" stroke="#2E5D57" stroke-width="7" stroke-linecap="round"/><path d="M147 36C160 46 169 57 177 71" stroke="#2E5D57" stroke-width="7" stroke-linecap="round"/><path d="M92 46C95 56 95 67 91 79" stroke="#EFDCC5" stroke-width="5" stroke-linecap="round"/><path d="M108 44C111 57 111 70 107 84" stroke="#EFDCC5" stroke-width="5" stroke-linecap="round"/></svg>`,
  },
  {
    id: "outline-heart-line",
    label: "Heart line",
    group: "Outline",
    width: 180,
    height: 160,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 160" fill="none"><path d="M146 82L90 138L34 82a37 37 0 1 1 56 -49a37 37 0 1 1 56 49Z" stroke="#E7D7C0" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "outline-sun-line",
    label: "Sun line",
    group: "Outline",
    width: 180,
    height: 180,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" fill="none"><path d="M60 90a30 30 0 1 0 60 0a30 30 0 1 0 -60 0" stroke="#E7D7C0" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 90h8m60 -68v8m60 60h8m-68 60v8m-48 -116l5 5m91 -5l-5 5m0 86l5 5m-91 -5l-5 5" stroke="#E7D7C0" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "outline-eye-line",
    label: "Eye line",
    group: "Outline",
    width: 220,
    height: 120,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 120" fill="none"><path d="M92 60a18 18 0 1 0 36 0a18 18 0 0 0 -36 0" stroke="#D8C6AB" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M198 60c-22 36 -50 54 -88 54c-38 0 -66 -18 -88 -54c22 -36 50 -54 88 -54c38 0 66 18 88 54" stroke="#D8C6AB" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "outline-moon-stars",
    label: "Moon stars",
    group: "Outline",
    width: 180,
    height: 180,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" fill="none"><path d="M92 26c1 0 2 0 2.9 0a55 55 0 0 0 58 91.3A66 66 0 1 1 92 26Z" stroke="#D8C6AB" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M124 52a14 14 0 0 1 14 14a14 14 0 0 1 14 -14a14 14 0 0 1 -14 -14a14 14 0 0 1 -14 14m-36 84a42 42 0 0 1 42 -42a42 42 0 0 1 -42 -42a42 42 0 0 1 -42 42a42 42 0 0 1 42 42" stroke="#E7D7C0" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "outline-bow-line",
    label: "Bow line",
    group: "Outline",
    width: 230,
    height: 120,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 230 120" fill="none"><path d="M72 60C42 25 24 24 14 38C4 52 14 79 41 86C58 90 76 82 93 67" stroke="#D8C6AB" stroke-width="8" stroke-linecap="round"/><path d="M158 60C188 25 206 24 216 38C226 52 216 79 189 86C172 90 154 82 137 67" stroke="#D8C6AB" stroke-width="8" stroke-linecap="round"/><path d="M96 57C108 71 122 71 134 57" stroke="#B68A5C" stroke-width="8" stroke-linecap="round"/><path d="M110 69L100 104" stroke="#B68A5C" stroke-width="8" stroke-linecap="round"/><path d="M120 69L130 104" stroke="#B68A5C" stroke-width="8" stroke-linecap="round"/></svg>`,
  },
  {
    id: "outline-flower-tabler",
    label: "Flower outline",
    group: "Outline",
    width: 190,
    height: 190,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#D9B99A" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><path d="M12 2a3 3 0 0 1 3 3c0 .562 -.259 1.442 -.776 2.64l-.724 1.36l1.76 -1.893c.499 -.6 .922 -1 1.27 -1.205a2.968 2.968 0 0 1 4.07 1.099a3.011 3.011 0 0 1 -1.09 4.098c-.374 .217 -.99 .396 -1.846 .535l-2.664 .366l2.4 .326c1 .145 1.698 .337 2.11 .576a3.011 3.011 0 0 1 1.09 4.098a2.968 2.968 0 0 1 -4.07 1.098c-.348 -.202 -.771 -.604 -1.27 -1.205l-1.76 -1.893l.724 1.36c.516 1.199 .776 2.079 .776 2.64a3 3 0 0 1 -6 0c0 -.562 .259 -1.442 .776 -2.64l.724 -1.36l-1.76 1.893c-.499 .601 -.922 1 -1.27 1.205a2.968 2.968 0 0 1 -4.07 -1.098a3.011 3.011 0 0 1 1.09 -4.098c.374 -.218 .99 -.396 1.846 -.536l2.664 -.366l-2.4 -.325c-1 -.145 -1.698 -.337 -2.11 -.576a3.011 3.011 0 0 1 -1.09 -4.099a2.968 2.968 0 0 1 4.07 -1.099c.348 .203 .771 .604 1.27 1.205l1.76 1.894c-1 -2.292 -1.5 -3.625 -1.5 -4a3 3 0 0 1 3 -3"/></svg>`,
  },
  {
    id: "outline-leaf-tabler",
    label: "Leaf outline",
    group: "Outline",
    width: 190,
    height: 190,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#87A892" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 21c.5 -4.5 2.5 -8 7 -10"/><path d="M9 18c6.218 0 10.5 -3.288 11 -12v-2h-4.014c-9 0 -11.986 4 -12 9c0 1 0 3 2 5h3l.014 0"/></svg>`,
  },
  {
    id: "outline-heart-tabler",
    label: "Heart icon",
    group: "Outline",
    width: 190,
    height: 170,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C56F7F" stroke-width="1.95" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"/></svg>`,
  },
  {
    id: "outline-eye-tabler",
    label: "Eye icon",
    group: "Outline",
    width: 220,
    height: 140,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C7B59C" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0"/><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"/></svg>`,
  },
  {
    id: "outline-moon-tabler",
    label: "Moon icon",
    group: "Outline",
    width: 190,
    height: 190,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#D8C6AB" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454l0 .008"/></svg>`,
  },
  {
    id: "outline-sun-tabler",
    label: "Sun icon",
    group: "Outline",
    width: 190,
    height: 190,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#D8B36A" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/><path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7"/></svg>`,
  },
  {
    id: "outline-sparkles-tabler",
    label: "Sparkles icon",
    group: "Outline",
    width: 210,
    height: 190,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#E2CBAA" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6"/></svg>`,
  },
  {
    id: "outline-star-tabler",
    label: "Star icon",
    group: "Outline",
    width: 190,
    height: 190,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#D4B187" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873l-6.158 -3.245"/></svg>`,
  },
  {
    id: "outline-diamond-tabler",
    label: "Diamond icon",
    group: "Outline",
    width: 190,
    height: 190,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#D8C0A2" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 5h12l3 5l-8.5 9.5a.7 .7 0 0 1 -1 0l-8.5 -9.5l3 -5"/><path d="M10 12l-2 -2.2l.6 -1"/></svg>`,
  },
  {
    id: "outline-butterfly-tabler",
    label: "Butterfly icon",
    group: "Outline",
    width: 210,
    height: 190,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#D7B6A4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 18.176a3 3 0 1 1 -4.953 -2.449l-.025 .023a4.502 4.502 0 0 1 1.483 -8.75c1.414 0 2.675 .652 3.5 1.671a4.5 4.5 0 1 1 4.983 7.079a3 3 0 1 1 -4.983 2.25l-.005 .176"/><path d="M12 19v-10"/><path d="M9 3l3 2l3 -2"/></svg>`,
  },
  {
    id: "outline-rosette-check-tabler",
    label: "Rosette check",
    group: "Outline",
    width: 200,
    height: 200,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#D2B28B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 7.2a2.2 2.2 0 0 1 2.2 -2.2h1a2.2 2.2 0 0 0 1.55 -.64l.7 -.7a2.2 2.2 0 0 1 3.12 0l.7 .7c.412 .41 .97 .64 1.55 .64h1a2.2 2.2 0 0 1 2.2 2.2v1c0 .58 .23 1.138 .64 1.55l.7 .7a2.2 2.2 0 0 1 0 3.12l-.7 .7a2.2 2.2 0 0 0 -.64 1.55v1a2.2 2.2 0 0 1 -2.2 2.2h-1a2.2 2.2 0 0 0 -1.55 .64l-.7 .7a2.2 2.2 0 0 1 -3.12 0l-.7 -.7a2.2 2.2 0 0 0 -1.55 -.64h-1a2.2 2.2 0 0 1 -2.2 -2.2v-1a2.2 2.2 0 0 0 -.64 -1.55l-.7 -.7a2.2 2.2 0 0 1 0 -3.12l.7 -.7a2.2 2.2 0 0 0 .64 -1.55v-1"/><path d="M9 12l2 2l4 -4"/></svg>`,
  },
  {
    id: "outline-rosette-discount-tabler",
    label: "Rosette discount",
    group: "Outline",
    width: 200,
    height: 200,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#D0AD86" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 15l6 -6"/><path d="M9 9.5a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0" fill="currentColor"/><path d="M14 14.5a.5 .5 0 1 0 1 0a.5 .5 0 1 0 -1 0" fill="currentColor"/><path d="M5 7.2a2.2 2.2 0 0 1 2.2 -2.2h1a2.2 2.2 0 0 0 1.55 -.64l.7 -.7a2.2 2.2 0 0 1 3.12 0l.7 .7a2.2 2.2 0 0 0 1.55 .64h1a2.2 2.2 0 0 1 2.2 2.2v1a2.2 2.2 0 0 0 .64 1.55l.7 .7a2.2 2.2 0 0 1 0 3.12l-.7 .7a2.2 2.2 0 0 0 -.64 1.55v1a2.2 2.2 0 0 1 -2.2 2.2h-1a2.2 2.2 0 0 0 -1.55 .64l-.7 .7a2.2 2.2 0 0 1 -3.12 0l-.7 -.7a2.2 2.2 0 0 0 -1.55 -.64h-1a2.2 2.2 0 0 1 -2.2 -2.2v-1a2.2 2.2 0 0 0 -.64 -1.55l-.7 -.7a2.2 2.2 0 0 1 0 -3.12l.7 -.7a2.2 2.2 0 0 0 .64 -1.55v-1"/></svg>`,
  },
  {
    id: "outline-wand-tabler",
    label: "Wand icon",
    group: "Outline",
    width: 210,
    height: 190,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#D8C6AB" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 21l15 -15l-3 -3l-15 15l3 3"/><path d="M15 6l3 3"/><path d="M9 3a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2"/><path d="M19 13a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2"/></svg>`,
  },
  {
    id: "outline-rosette-tabler",
    label: "Rosette icon",
    group: "Outline",
    width: 200,
    height: 200,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#D3B693" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 7.2a2.2 2.2 0 0 1 2.2 -2.2h1a2.2 2.2 0 0 0 1.55 -.64l.7 -.7a2.2 2.2 0 0 1 3.12 0l.7 .7c.412 .41 .97 .64 1.55 .64h1a2.2 2.2 0 0 1 2.2 2.2v1c0 .58 .23 1.138 .64 1.55l.7 .7a2.2 2.2 0 0 1 0 3.12l-.7 .7a2.2 2.2 0 0 0 -.64 1.55v1a2.2 2.2 0 0 1 -2.2 2.2h-1a2.2 2.2 0 0 0 -1.55 .64l-.7 .7a2.2 2.2 0 0 1 -3.12 0l-.7 -.7a2.2 2.2 0 0 0 -1.55 -.64h-1a2.2 2.2 0 0 1 -2.2 -2.2v-1a2.2 2.2 0 0 0 -.64 -1.55l-.7 -.7a2.2 2.2 0 0 1 0 -3.12l.7 -.7a2.2 2.2 0 0 0 .64 -1.55v-1"/></svg>`,
  },
  {
    id: "outline-badge-tabler",
    label: "Badge icon",
    group: "Outline",
    width: 190,
    height: 210,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C9AE8F" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 17v-13l-5 3l-5 -3v13l5 3l5 -3"/></svg>`,
  },
  {
    id: "outline-badges-tabler",
    label: "Badges icon",
    group: "Outline",
    width: 210,
    height: 210,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C9AE8F" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 17v-4l-5 3l-5 -3v4l5 3l5 -3"/><path d="M17 8v-4l-5 3l-5 -3v4l5 3l5 -3"/></svg>`,
  },
  {
    id: "outline-stars-tabler",
    label: "Stars icon",
    group: "Outline",
    width: 220,
    height: 190,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#D8C09A" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17.8 19.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138"/><path d="M6.2 19.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138"/><path d="M12 9.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138"/></svg>`,
  },
  {
    id: "outline-crown-line",
    label: "Crown line",
    group: "Outline",
    width: 220,
    height: 150,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 150" fill="none"><path d="M32 112L48 48L86 82L110 40L134 82L172 48L188 112H32Z" stroke="#D3B692" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><path d="M42 112H178" stroke="#D3B692" stroke-width="8" stroke-linecap="round"/><circle cx="48" cy="46" r="7" fill="#E9D5BC"/><circle cx="110" cy="38" r="7" fill="#E9D5BC"/><circle cx="172" cy="46" r="7" fill="#E9D5BC"/></svg>`,
  },
  {
    id: "outline-branch-line",
    label: "Branch line",
    group: "Outline",
    width: 220,
    height: 190,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 190" fill="none"><path d="M38 156C87 128 127 93 176 34" stroke="#95A992" stroke-width="7" stroke-linecap="round"/><path d="M88 109C74 96 62 93 48 96" stroke="#C2D3C0" stroke-width="6" stroke-linecap="round"/><path d="M114 88C101 74 88 70 74 74" stroke="#C2D3C0" stroke-width="6" stroke-linecap="round"/><path d="M140 66C129 52 117 47 103 50" stroke="#C2D3C0" stroke-width="6" stroke-linecap="round"/><path d="M111 125C127 118 139 108 146 92" stroke="#C2D3C0" stroke-width="6" stroke-linecap="round"/><path d="M137 103C153 95 165 83 172 69" stroke="#C2D3C0" stroke-width="6" stroke-linecap="round"/></svg>`,
  },
  {
    id: "outline-lotus-line",
    label: "Lotus line",
    group: "Outline",
    width: 220,
    height: 170,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 170" fill="none"><path d="M110 42C123 56 126 75 110 92C94 75 97 56 110 42Z" stroke="#D7B4A7" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M77 62C92 67 101 79 98 99C79 99 68 88 67 71" stroke="#E6C6BB" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M143 62C128 67 119 79 122 99C141 99 152 88 153 71" stroke="#E6C6BB" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M53 95C74 92 90 99 98 118C73 123 57 116 46 102" stroke="#D7B4A7" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M167 95C146 92 130 99 122 118C147 123 163 116 174 102" stroke="#D7B4A7" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M70 132H150" stroke="#DCC7AE" stroke-width="6" stroke-linecap="round"/></svg>`,
  },
  {
    id: "outline-shell-line",
    label: "Shell line",
    group: "Outline",
    width: 210,
    height: 180,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 180" fill="none"><path d="M32 92C39 47 68 22 105 22C142 22 171 47 178 92C171 132 143 158 105 158C67 158 39 132 32 92Z" stroke="#D8B796" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M54 90V143" stroke="#D8B796" stroke-width="5" stroke-linecap="round"/><path d="M79 90V152" stroke="#D8B796" stroke-width="5" stroke-linecap="round"/><path d="M105 90V157" stroke="#D8B796" stroke-width="5" stroke-linecap="round"/><path d="M131 90V152" stroke="#D8B796" stroke-width="5" stroke-linecap="round"/><path d="M156 90V143" stroke="#D8B796" stroke-width="5" stroke-linecap="round"/></svg>`,
  },
  {
    id: "outline-perfume-line",
    label: "Perfume line",
    group: "Outline",
    width: 180,
    height: 220,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 220" fill="none"><rect x="54" y="74" width="72" height="102" rx="18" stroke="#D6B797" stroke-width="7"/><path d="M70 74V50C70 40 78 32 88 32H92C102 32 110 40 110 50V74" stroke="#D6B797" stroke-width="7" stroke-linecap="round"/><rect x="74" y="16" width="32" height="18" rx="6" stroke="#D6B797" stroke-width="7"/><path d="M90 97V125" stroke="#E6D7C4" stroke-width="5" stroke-linecap="round"/><path d="M76 111H104" stroke="#E6D7C4" stroke-width="5" stroke-linecap="round"/></svg>`,
  },
  {
    id: "outline-handbag-line",
    label: "Handbag line",
    group: "Outline",
    width: 210,
    height: 180,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 180" fill="none"><path d="M52 72H158L149 146H61L52 72Z" stroke="#D2B090" stroke-width="7" stroke-linejoin="round"/><path d="M78 72V62C78 47 90 35 105 35C120 35 132 47 132 62V72" stroke="#D2B090" stroke-width="7" stroke-linecap="round"/><path d="M82 92H128" stroke="#E7D5BF" stroke-width="5" stroke-linecap="round"/></svg>`,
  },
  {
    id: "outline-scissors-line",
    label: "Scissors line",
    group: "Outline",
    width: 220,
    height: 180,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 180" fill="none"><circle cx="60" cy="122" r="20" stroke="#CDA885" stroke-width="7"/><circle cx="60" cy="58" r="20" stroke="#CDA885" stroke-width="7"/><path d="M78 110L168 44" stroke="#CDA885" stroke-width="7" stroke-linecap="round"/><path d="M78 70L168 136" stroke="#CDA885" stroke-width="7" stroke-linecap="round"/><circle cx="174" cy="40" r="7" fill="#E7D6C1"/><circle cx="174" cy="140" r="7" fill="#E7D6C1"/></svg>`,
  },
  {
    id: "outline-spool-line",
    label: "Spool line",
    group: "Outline",
    width: 180,
    height: 210,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 210" fill="none"><path d="M56 38H124" stroke="#C6A37E" stroke-width="7" stroke-linecap="round"/><path d="M56 172H124" stroke="#C6A37E" stroke-width="7" stroke-linecap="round"/><path d="M70 48C78 70 78 140 70 162" stroke="#C6A37E" stroke-width="7" stroke-linecap="round"/><path d="M110 48C102 70 102 140 110 162" stroke="#C6A37E" stroke-width="7" stroke-linecap="round"/><path d="M78 56H102" stroke="#E8D9C8" stroke-width="4" stroke-linecap="round"/><path d="M78 78H102" stroke="#E8D9C8" stroke-width="4" stroke-linecap="round"/><path d="M78 100H102" stroke="#E8D9C8" stroke-width="4" stroke-linecap="round"/><path d="M78 122H102" stroke="#E8D9C8" stroke-width="4" stroke-linecap="round"/><path d="M78 144H102" stroke="#E8D9C8" stroke-width="4" stroke-linecap="round"/></svg>`,
  },
  {
    id: "outline-feather-line",
    label: "Feather line",
    group: "Outline",
    width: 200,
    height: 200,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none"><path d="M48 148C82 145 108 129 129 100C146 77 154 50 152 30C132 33 104 45 82 67C56 93 43 121 48 148Z" stroke="#D6C1A6" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M56 142L142 56" stroke="#D6C1A6" stroke-width="5" stroke-linecap="round"/><path d="M81 117L65 101" stroke="#E7DAC7" stroke-width="4" stroke-linecap="round"/><path d="M103 96L85 78" stroke="#E7DAC7" stroke-width="4" stroke-linecap="round"/><path d="M122 77L107 62" stroke="#E7DAC7" stroke-width="4" stroke-linecap="round"/></svg>`,
  },
  {
    id: "outline-petal-duo",
    label: "Petal duo",
    group: "Outline",
    width: 210,
    height: 170,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 170" fill="none"><path d="M80 130C57 118 49 94 62 69C88 71 101 87 103 114C99 120 90 126 80 130Z" stroke="#DBB6A8" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M130 130C153 118 161 94 148 69C122 71 109 87 107 114C111 120 120 126 130 130Z" stroke="#DBB6A8" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M105 48V126" stroke="#D8C7AF" stroke-width="5" stroke-linecap="round"/></svg>`,
  },
  {
    id: "outline-comet-line",
    label: "Comet line",
    group: "Outline",
    width: 220,
    height: 170,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 170" fill="none"><circle cx="148" cy="58" r="16" stroke="#D6C0A2" stroke-width="7"/><path d="M42 126C74 108 105 88 134 67" stroke="#E8D9C6" stroke-width="7" stroke-linecap="round"/><path d="M60 142C88 120 114 101 137 83" stroke="#E8D9C6" stroke-width="5" stroke-linecap="round"/><path d="M26 111C56 97 83 82 110 62" stroke="#F1E7D7" stroke-width="4" stroke-linecap="round"/></svg>`,
  },
  {
    id: "outline-orb-cluster",
    label: "Orb cluster",
    group: "Outline",
    width: 190,
    height: 190,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 190" fill="none"><circle cx="95" cy="95" r="28" stroke="#D7C2A7" stroke-width="6"/><circle cx="52" cy="72" r="12" stroke="#E8DAC8" stroke-width="5"/><circle cx="138" cy="72" r="12" stroke="#E8DAC8" stroke-width="5"/><circle cx="72" cy="138" r="10" stroke="#E8DAC8" stroke-width="4"/><circle cx="124" cy="138" r="10" stroke="#E8DAC8" stroke-width="4"/><path d="M64 78L82 87" stroke="#E8DAC8" stroke-width="4" stroke-linecap="round"/><path d="M126 87L144 78" stroke="#E8DAC8" stroke-width="4" stroke-linecap="round"/></svg>`,
  },
  {
    id: "outline-face-abstract",
    label: "Abstract face",
    group: "Outline",
    width: 210,
    height: 220,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 220" fill="none"><path d="M129 27C107 54 101 89 110 120C118 147 118 167 96 189" stroke="#D7B9A6" stroke-width="7" stroke-linecap="round"/><path d="M85 61C100 55 117 58 127 71" stroke="#E8D9C8" stroke-width="5" stroke-linecap="round"/><path d="M77 109C90 99 107 99 120 109" stroke="#E8D9C8" stroke-width="5" stroke-linecap="round"/><path d="M74 154C93 165 118 165 137 154" stroke="#D7B9A6" stroke-width="6" stroke-linecap="round"/></svg>`,
  },
  {
    id: "outline-swirl-knot",
    label: "Swirl knot",
    group: "Outline",
    width: 210,
    height: 190,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 190" fill="none"><path d="M52 106C52 78 74 56 102 56C124 56 142 70 150 89C157 106 173 118 190 118" stroke="#D7C0A6" stroke-width="7" stroke-linecap="round"/><path d="M158 84C158 112 136 134 108 134C86 134 68 120 60 101C53 84 37 72 20 72" stroke="#D7C0A6" stroke-width="7" stroke-linecap="round"/><circle cx="105" cy="95" r="15" stroke="#E9DDCB" stroke-width="5"/></svg>`,
  },
  {
    id: "outline-moon-phase-line",
    label: "Moon phase",
    group: "Outline",
    width: 220,
    height: 100,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 100" fill="none"><circle cx="32" cy="50" r="18" stroke="#D8C6AB" stroke-width="5"/><path d="M84 50a18 18 0 1 0 0 -36" stroke="#D8C6AB" stroke-width="5" stroke-linecap="round"/><circle cx="110" cy="50" r="18" stroke="#D8C6AB" stroke-width="5"/><path d="M110 32V68" stroke="#D8C6AB" stroke-width="5"/><path d="M136 50a18 18 0 1 1 0 -36" stroke="#D8C6AB" stroke-width="5" stroke-linecap="round"/><circle cx="188" cy="50" r="18" stroke="#D8C6AB" stroke-width="5"/></svg>`,
  },
  {
    id: "emoji-smile",
    label: "Smile premium",
    group: "Emoji",
    width: 180,
    height: 180,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" fill="none"><circle cx="90" cy="90" r="82" fill="#F4D8A8"/><ellipse cx="62" cy="74" rx="10" ry="14" fill="#3A2A22"/><ellipse cx="118" cy="74" rx="10" ry="14" fill="#3A2A22"/><path d="M54 111C64 126 78 134 90 134C102 134 116 126 126 111" stroke="#3A2A22" stroke-width="10" stroke-linecap="round"/></svg>`,
  },
  {
    id: "emoji-star-eyes",
    label: "Star eyes",
    group: "Emoji",
    width: 180,
    height: 180,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" fill="none"><circle cx="90" cy="90" r="82" fill="#FFD56B"/><path d="M56 65L61 78L75 79L64 88L67 102L56 94L45 102L48 88L37 79L51 78L56 65Z" fill="#C2473E"/><path d="M124 65L129 78L143 79L132 88L135 102L124 94L113 102L116 88L105 79L119 78L124 65Z" fill="#C2473E"/><path d="M55 118C68 132 81 138 90 138C99 138 112 132 125 118" stroke="#5A3826" stroke-width="11" stroke-linecap="round"/></svg>`,
  },
  {
    id: "emoji-wink",
    label: "Wink",
    group: "Emoji",
    width: 180,
    height: 180,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" fill="none"><circle cx="90" cy="90" r="82" fill="#F3D39B"/><ellipse cx="62" cy="76" rx="10" ry="14" fill="#3A2A22"/><path d="M106 76C114 72 122 72 130 76" stroke="#3A2A22" stroke-width="8" stroke-linecap="round"/><path d="M54 117C68 130 81 136 90 136C99 136 112 130 126 117" stroke="#3A2A22" stroke-width="10" stroke-linecap="round"/></svg>`,
  },
  {
    id: "emoji-kiss-heart",
    label: "Kiss heart",
    group: "Emoji",
    width: 190,
    height: 180,
    objectFit: "contain",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 180" fill="none"><circle cx="84" cy="90" r="78" fill="#F4D4A6"/><ellipse cx="58" cy="76" rx="10" ry="13" fill="#412D23"/><ellipse cx="111" cy="76" rx="10" ry="13" fill="#412D23"/><path d="M72 121C78 114 90 114 96 121" stroke="#412D23" stroke-width="9" stroke-linecap="round"/><path d="M138 45C145 34 158 33 165 44C171 54 165 63 150 76C135 63 130 54 138 45Z" fill="#B83C52"/></svg>`,
  },
];

const EDITOR_ZOOM_MIN = 0.25;
const EDITOR_ZOOM_MAX = 2;
const EDITOR_ZOOM_STEP = 0.25;
const VIEWPORT_ZOOM_STEP = 0.1;
const MOBILE_EDITOR_BASE_SCALE_MIN = 0.3;
const MOBILE_EDITOR_EFFECTIVE_SCALE_MIN = 0.35;

const SHAPE_TYPES: { value: ContentShape["shapeType"]; label: string }[] = [
  { value: "rectangle", label: "Rect." },
  { value: "circle",    label: "Círculo" },
  { value: "triangle",  label: "Triáng." },
  { value: "star",      label: "Estrella" },
  { value: "line",      label: "Línea" },
  { value: "capsule",   label: "Cápsula" },
  { value: "arch",      label: "Arco" },
  { value: "blob",      label: "Blob" },
  { value: "sparkle",   label: "Sparkle" },
  { value: "wave",      label: "Onda" },
  { value: "diamond",   label: "Diamante" },
];

const DECORATIVE_SHAPE_TYPES: ContentShape["shapeType"][] = [
  "capsule",
  "arch",
  "blob",
  "sparkle",
  "wave",
  "diamond",
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
  if (shapeType === "sparkle") return "polygon(50% 0%, 59% 34%, 84% 16%, 66% 41%, 100% 50%, 66% 59%, 84% 84%, 59% 66%, 50% 100%, 41% 66%, 16% 84%, 34% 59%, 0% 50%, 34% 41%, 16% 16%, 41% 34%)";
  if (shapeType === "wave") return "polygon(0% 46%, 8% 39%, 16% 37%, 25% 41%, 33% 49%, 42% 58%, 50% 61%, 58% 57%, 67% 47%, 75% 38%, 84% 35%, 92% 39%, 100% 46%, 100% 100%, 0% 100%)";
  if (shapeType === "diamond") return "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
  return undefined;
}

function getShapeBorderRadius(sc: ContentShape): string {
  if (sc.shapeType === "circle") return "50%";
  if (sc.shapeType === "capsule") return "999px";
  if (sc.shapeType === "arch") return "999px 999px 18px 18px";
  if (sc.shapeType === "blob") return "58% 42% 57% 43% / 39% 44% 56% 61%";
  if (sc.shapeType === "triangle" || sc.shapeType === "star" || sc.shapeType === "line" || sc.shapeType === "sparkle" || sc.shapeType === "wave" || sc.shapeType === "diamond") return "0";
  return `${sc.borderRadius ?? 8}px`;
}

function isBorderFriendlyShape(shapeType: ContentShape["shapeType"]): boolean {
  return shapeType === "rectangle" || shapeType === "circle" || shapeType === "line" || shapeType === "capsule" || shapeType === "arch" || shapeType === "blob";
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

function buildBoxShadow(c: { shadowEnabled?: boolean; shadowX?: number; shadowY?: number; shadowBlur?: number; shadowSpread?: number; shadowColor?: string } | null | undefined): string | undefined {
  if (!c?.shadowEnabled) return undefined;
  return `${c.shadowX ?? 4}px ${c.shadowY ?? 4}px ${c.shadowBlur ?? 8}px ${c.shadowSpread ?? 0}px ${c.shadowColor ?? "rgba(0,0,0,0.3)"}`;
}

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

function getCanvasFormatLabel(width: number, height: number): string {
  if (width === height) return "Cuadrado";
  if (height > width) return "Vertical";
  return "Horizontal";
}

function getCanvasSnapshotKey(width: number, height: number): string {
  return `${width}x${height}`;
}

function cloneCanvasItems(items: CanvasItem[]): CanvasItem[] {
  return JSON.parse(JSON.stringify(items));
}

function getTemplateMeta(name: string) {
  const [familyRaw, variantRaw] = name.split("/").map((part) => part.trim());
  const family = familyRaw || name;
  const variant = variantRaw || "Base";

  const descriptions: Record<string, string> = {
    "Maison Editorial": "Lanzamiento premium con aire editorial y pieza hero dominante.",
    "Signature Drop": "Campana de drop con tension visual, contraste y energia comercial.",
    "Crafted Heritage": "Narrativa de oficio, origen y textura para colecciones artesanales premium.",
    "Modern Atelier": "Moda refinada con composicion limpia, serena y contemporanea.",
    "Premium Offer": "Oferta elegante con foco en conversion sin perder valor de marca.",
    "Lookbook Grid": "Vitrina de varias piezas con ritmo editorial y lectura clara.",
  };

  const tones: Record<string, string> = {
    "Maison Editorial": "Editorial",
    "Signature Drop": "Drop",
    "Crafted Heritage": "Heritage",
    "Modern Atelier": "Atelier",
    "Premium Offer": "Oferta",
    "Lookbook Grid": "Lookbook",
  };

  return {
    family,
    variant,
    tone: tones[family] ?? "Premium",
    description: descriptions[family] ?? "Plantilla premium para lanzamientos de coleccion.",
  };
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CollectionEditorPage() {
  const { id } = useParams<{ id: string }>();
  const collectionId = Number(id);
  const { ready: authReady, token: authToken, refreshAuth } = useAuth();

  const [collection, setCollection]         = useState<CollectionData | null>(null);
  const [items, setItems]                   = useState<CanvasItem[]>([]);
  const [products, setProducts]             = useState<Product[]>([]);
  const [templates, setTemplates]           = useState<CollectionTemplate[]>([]);
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [saved, setSaved]                   = useState(false);
  const [templateSaving, setTemplateSaving] = useState(false);
  const [templateApplyingId, setTemplateApplyingId] = useState<number | null>(null);
  const [templatePreviewLoadingId, setTemplatePreviewLoadingId] = useState<number | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<CollectionTemplate | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [editorCanvasScale, setEditorCanvasScale] = useState(1);
  const [editorZoom, setEditorZoom] = useState(1);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [search, setSearch]                 = useState("");
  const [activeTool, setActiveTool]         = useState<ActiveTool>("select");
  const [selectSidebarTab, setSelectSidebarTab] = useState<SelectSidebarTab>("products");
  const [templateScopeFilter, setTemplateScopeFilter] = useState<TemplateScopeFilter>("all");
  const [name, setName]                     = useState("");
  const [templateName, setTemplateName]     = useState("");
  const [templateIsPublic, setTemplateIsPublic] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateError, setTemplateError]   = useState<string | null>(null);
  const [originalCanvasSize, setOriginalCanvasSize] = useState<{ width: number; height: number } | null>(null);
  const [bgColor, setBgColor]               = useState("#FFFFFF");
  const [bgGradient, setBgGradient]         = useState<BackgroundGradientState>({
    enabled: false, color2: "#AADDCC", angle: 135, type: "linear" as "linear" | "radial",
  });
  const [textDefaults, setTextDefaults]     = useState<ContentText>({ ...DEFAULT_TEXT });
  const [shapeDefaults, setShapeDefaults]   = useState<ContentShape>({ ...DEFAULT_SHAPE });
  const [gridSnap, setGridSnap]             = useState(0);
  const [imageUploading, setImageUploading]     = useState(false);
  const [bgImageUploading, setBgImageUploading] = useState(false);
  const [editingTextId, setEditingTextId]       = useState<number | null>(null);
  const [mobileTextEditorDraft, setMobileTextEditorDraft] = useState("");
  const [lockedItemIds, setLockedItemIds]       = useState<Set<number>>(new Set());

  // Undo/redo state (buttons only; logic is all in refs)
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);
  const [mobileCanvasControlsOpen, setMobileCanvasControlsOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [mobileViewportWidth, setMobileViewportWidth] = useState(0);

  const canvasRef       = useRef<HTMLDivElement>(null);
  const canvasAreaRef = useRef<HTMLDivElement>(null);
  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const imageInputRef   = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const canvasSettingsSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasLayoutSnapshotsRef = useRef<Record<string, CanvasItem[]>>({});
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
  const runtimeViewportWidth =
    mobileViewportWidth || (typeof window !== "undefined" ? window.innerWidth : 0);
  const isCompactPreviewViewport = isPreviewingTemplate && runtimeViewportWidth > 0 && runtimeViewportWidth < 768;
  const mobilePreviewFitScale =
    isCompactPreviewViewport
      ? Math.min(
          Math.max(
            (Math.min(runtimeViewportWidth, canvasAreaRef.current?.clientWidth || runtimeViewportWidth) - 56) /
              displayCanvasWidth,
            0.12,
          ),
          1,
        )
      : null;
  const previewBaseScale = isPreviewingTemplate
    ? (mobilePreviewFitScale ?? previewScale)
    : 1;
  const effectivePreviewScale = isPreviewingTemplate
    ? previewBaseScale * previewZoom
    : 1;
  const effectiveCanvasScale = isPreviewingTemplate ? effectivePreviewScale : editorCanvasScale * editorZoom;
  const previewChromePadding = isPreviewingTemplate ? (isCompactPreviewViewport ? 20 : 52) : 0;
  const previewStageWidth = (displayCanvasWidth * effectivePreviewScale) + previewChromePadding;
  const previewStageHeight = (displayCanvasHeight * effectivePreviewScale) + previewChromePadding;
  const compactPreviewCanvasWidth = Math.max(160, Math.round(displayCanvasWidth * effectivePreviewScale));
  const compactPreviewCanvasHeight = Math.max(90, Math.round(displayCanvasHeight * effectivePreviewScale));
  const isEditorFitMode = !isPreviewingTemplate && editorZoom === 1 && editorCanvasScale < 0.999;
  const isMobileToolsPanelOpen = mobilePanel === "tools" || mobilePanel === "library";
  const minEditorEffectiveScale = isMobileViewport ? MOBILE_EDITOR_EFFECTIVE_SCALE_MIN : EDITOR_ZOOM_MIN;
  const minPreviewEffectiveScale = isMobileViewport ? MOBILE_EDITOR_EFFECTIVE_SCALE_MIN : EDITOR_ZOOM_MIN;
  const editorZoomMax = Math.max(EDITOR_ZOOM_MAX, Number((1 / Math.max(editorCanvasScale, 0.01)).toFixed(2)));
  const previewZoomMax = Math.max(EDITOR_ZOOM_MAX, Number((1 / Math.max(previewBaseScale, 0.01)).toFixed(2)));
  const minEffectiveEditorScale = Math.max(minEditorEffectiveScale, editorCanvasScale * EDITOR_ZOOM_MIN);
  const minEffectivePreviewScale = Math.max(minPreviewEffectiveScale, previewBaseScale * EDITOR_ZOOM_MIN);
  const maxEffectiveEditorScale = Math.max(1, editorCanvasScale * editorZoomMax);
  const maxEffectivePreviewScale = Math.max(1, previewBaseScale * previewZoomMax);
  const displayEditorZoomLabel = `${Math.round((editorCanvasScale * editorZoom) * 100)}%`;
  const displayPreviewZoomLabel = `${Math.round(effectivePreviewScale * 100)}%`;
  const activeZoomLabel = isPreviewingTemplate ? displayPreviewZoomLabel : displayEditorZoomLabel;
  const canZoomOut = isPreviewingTemplate
    ? effectivePreviewScale > minEffectivePreviewScale
    : (editorCanvasScale * editorZoom) > minEffectiveEditorScale;
  const canZoomIn = isPreviewingTemplate
    ? effectivePreviewScale < maxEffectivePreviewScale
    : (editorCanvasScale * editorZoom) < maxEffectiveEditorScale;
  const canvasPresetOptions = [
    ...(originalCanvasSize
      ? [{
          label: "Orig.",
          w: originalCanvasSize.width,
          h: originalCanvasSize.height,
        }]
      : []),
    { label: "800²", w: 800, h: 800 },
    { label: "8×12", w: 800, h: 1200 },
    { label: "12×8", w: 1200, h: 800 },
    { label: "1×1", w: 1080, h: 1080 },
  ];
  const mobileEditingTextItem =
    isMobileViewport && editingTextId !== null
      ? items.find((item) => item.id === editingTextId && item.element_type === "text") ?? null
      : null;
  const mobileEditingTextContent = mobileEditingTextItem?.content as ContentText | null;

  const scrollSectionIntoView = useCallback((ref: React.RefObject<HTMLElement | HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const resetCanvasViewport = useCallback(() => {
    const viewport = canvasViewportRef.current;
    if (!viewport) return;

    const run = () => viewport.scrollTo({ left: 0, top: 0 });
    run();
    window.requestAnimationFrame(() => {
      run();
      window.requestAnimationFrame(run);
    });
  }, []);

  const persistCollectionCanvasSettings = useCallback(async (overrides?: {
    name?: string;
    backgroundColor?: string;
    backgroundGradient?: BackgroundGradientState;
    backgroundImageUrl?: string | null;
    canvasWidth?: number;
    canvasHeight?: number;
  }) => {
    if (!collection) return;

    const nextName = overrides?.name ?? name;
    const nextBackgroundColor = overrides?.backgroundColor ?? bgColor;
    const nextBackgroundGradient = overrides?.backgroundGradient ?? bgGradient;
    const nextBackgroundStyle = nextBackgroundGradient.enabled
      ? nextBackgroundGradient.type === "radial"
        ? `radial-gradient(circle, ${nextBackgroundColor}, ${nextBackgroundGradient.color2})`
        : `linear-gradient(${nextBackgroundGradient.angle}deg, ${nextBackgroundColor}, ${nextBackgroundGradient.color2})`
      : null;
    const nextBackgroundImageUrl =
      overrides && "backgroundImageUrl" in overrides
        ? overrides.backgroundImageUrl ?? null
        : collection.background_image_url;
    const nextCanvasWidth = overrides?.canvasWidth ?? collection.canvas_width;
    const nextCanvasHeight = overrides?.canvasHeight ?? collection.canvas_height;

    setSaving(true);
    try {
      await apiFetch(`/api/collections/${collectionId}`, {
        method: "PUT",
        body: JSON.stringify({
          name: nextName,
          background_color: nextBackgroundColor,
          background_style: nextBackgroundStyle,
          background_image_url: nextBackgroundImageUrl,
          canvas_width: nextCanvasWidth,
          canvas_height: nextCanvasHeight,
        }),
      });

      setCollection((prev) => prev ? {
        ...prev,
        name: nextName,
        background_color: nextBackgroundColor,
        background_style: nextBackgroundStyle,
        background_image_url: nextBackgroundImageUrl,
        canvas_width: nextCanvasWidth,
        canvas_height: nextCanvasHeight,
      } : prev);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [bgColor, bgGradient, collection, collectionId, name]);

  const queueCanvasSettingsSave = useCallback((overrides?: Parameters<typeof persistCollectionCanvasSettings>[0]) => {
    if (canvasSettingsSaveTimerRef.current) {
      clearTimeout(canvasSettingsSaveTimerRef.current);
    }

    canvasSettingsSaveTimerRef.current = setTimeout(() => {
      void persistCollectionCanvasSettings(overrides);
    }, 300);
  }, [persistCollectionCanvasSettings]);

  useEffect(() => () => {
    if (canvasSettingsSaveTimerRef.current) {
      clearTimeout(canvasSettingsSaveTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (!mobileEditingTextItem) {
      setMobileTextEditorDraft("");
      return;
    }

    setMobileTextEditorDraft((mobileEditingTextItem.content as ContentText)?.text ?? "");
  }, [mobileEditingTextItem]);

  const flushPendingCanvasSettingsSave = useCallback(async () => {
    if (canvasSettingsSaveTimerRef.current) {
      clearTimeout(canvasSettingsSaveTimerRef.current);
      canvasSettingsSaveTimerRef.current = null;
    }

    await persistCollectionCanvasSettings();
  }, [persistCollectionCanvasSettings]);

  const flushPendingItemContentSaves = useCallback(async () => {
    const pendingItemIds = Object.keys(debounceTimers.current)
      .map((key) => Number(key))
      .filter((value) => Number.isFinite(value));

    pendingItemIds.forEach((itemId) => {
      const key = String(itemId);
      const timer = debounceTimers.current[key];
      if (timer) {
        clearTimeout(timer);
        delete debounceTimers.current[key];
      }
    });

    if (pendingItemIds.length === 0) return;

    const uniqueItemIds = Array.from(new Set(pendingItemIds));
    await Promise.all(uniqueItemIds.map((itemId) => {
      const item = itemsRef.current.find((candidate) => candidate.id === itemId);
      if (!item) return Promise.resolve();

      return apiFetch(`/api/collections/${collectionId}/items/${itemId}`, {
        method: "PUT",
        body: JSON.stringify({ content: item.content }),
      });
    }));
  }, [collectionId]);

  const persistItemContentImmediately = useCallback(async (
    itemId: number,
    newContent: ContentText | ContentShape | ContentImage | ContentProduct,
  ) => {
    const key = String(itemId);
    if (debounceTimers.current[key]) {
      clearTimeout(debounceTimers.current[key]);
      delete debounceTimers.current[key];
    }

    setItems((prev) => prev.map((item) => item.id === itemId ? { ...item, content: newContent } : item));
    await apiFetch(`/api/collections/${collectionId}/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ content: newContent }),
    });
  }, [collectionId]);

  useEffect(() => {
    if (!collection || isPreviewingTemplate) return;
    canvasLayoutSnapshotsRef.current[getCanvasSnapshotKey(collection.canvas_width, collection.canvas_height)] = cloneCanvasItems(items);
  }, [collection, isPreviewingTemplate, items]);

  const handleBackgroundColorChange = useCallback((nextColor: string) => {
    setBgColor(nextColor);
    queueCanvasSettingsSave({ backgroundColor: nextColor });
  }, [queueCanvasSettingsSave]);

  const handleBackgroundGradientChange = useCallback((updater: (current: BackgroundGradientState) => BackgroundGradientState) => {
    setBgGradient((current) => {
      const nextGradient = updater(current);
      queueCanvasSettingsSave({ backgroundGradient: nextGradient });
      return nextGradient;
    });
  }, [queueCanvasSettingsSave]);

  const clientPointToCanvasPoint = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / effectiveCanvasScale,
      y: (clientY - rect.top) / effectiveCanvasScale,
    };
  }, [effectiveCanvasScale]);

  useEffect(() => {
    if (!isPreviewingTemplate) {
      setPreviewScale(1);
      return;
    }

    let frameA = 0;
    let frameB = 0;
    const updatePreviewScale = () => {
      const viewport = canvasViewportRef.current;
      if (!viewport) return;

      const mobileViewport = window.innerWidth < 768 || viewport.clientWidth < 768;
      const viewportPadding = mobileViewport ? 28 : 116;
      const widthRatio = (viewport.clientWidth - viewportPadding) / displayCanvasWidth;
      const heightRatio = (viewport.clientHeight - viewportPadding) / displayCanvasHeight;
      const nextScale = Math.min(widthRatio, heightRatio, 1);
      setPreviewScale(Number.isFinite(nextScale) && nextScale > 0 ? nextScale : 1);
      viewport.scrollTo({ left: 0, top: 0 });
    };

    const schedulePreviewScaleUpdate = () => {
      window.cancelAnimationFrame(frameA);
      window.cancelAnimationFrame(frameB);
      frameA = window.requestAnimationFrame(() => {
        frameB = window.requestAnimationFrame(updatePreviewScale);
      });
    };

    schedulePreviewScaleUpdate();
    window.addEventListener("resize", schedulePreviewScaleUpdate);

    const viewport = canvasViewportRef.current;
    const resizeObserver =
      viewport && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => schedulePreviewScaleUpdate())
        : null;

    if (viewport && resizeObserver) {
      resizeObserver.observe(viewport);
    }

    return () => {
      window.cancelAnimationFrame(frameA);
      window.cancelAnimationFrame(frameB);
      window.removeEventListener("resize", schedulePreviewScaleUpdate);
      resizeObserver?.disconnect();
    };
  }, [displayCanvasHeight, displayCanvasWidth, isPreviewingTemplate]);

  useEffect(() => {
    if (isPreviewingTemplate) {
      setEditorCanvasScale(1);
      return;
    }

    const updateEditorScale = () => {
      const viewport = canvasViewportRef.current;
      if (!viewport) return;
      const mobileViewport = window.innerWidth < 768 || viewport.clientWidth < 768;

      if (mobileViewport) {
        const availableWidth = Math.max(180, viewport.clientWidth - 18);
        const widthRatio = availableWidth / displayCanvasWidth;
        const fitScale = Math.min(widthRatio, 1);

        setEditorCanvasScale(Math.max(MOBILE_EDITOR_BASE_SCALE_MIN, fitScale));
      } else {
        setEditorCanvasScale(1);
      }

      viewport.scrollTo({ left: 0, top: 0 });
    };

    updateEditorScale();
    window.addEventListener("resize", updateEditorScale);
    return () => window.removeEventListener("resize", updateEditorScale);
  }, [displayCanvasHeight, displayCanvasWidth, isPreviewingTemplate]);

  useEffect(() => {
    if (isEditorFitMode) {
      resetCanvasViewport();
    }
  }, [displayCanvasHeight, displayCanvasWidth, isEditorFitMode, resetCanvasViewport]);

  useEffect(() => {
    const syncResponsiveEditorState = () => {
      setIsMobileViewport(window.innerWidth < 768);
      setMobileViewportWidth(window.innerWidth);
      if (window.innerWidth >= 768) {
        setMobilePanel(null);
        setMobileCanvasControlsOpen(false);
        setEditingTextId(null);
      }
    };

    syncResponsiveEditorState();
    window.addEventListener("resize", syncResponsiveEditorState);
    return () => window.removeEventListener("resize", syncResponsiveEditorState);
  }, []);

  const handleEditorZoomChange = useCallback((nextZoom: number) => {
    const maxZoom = Math.max(EDITOR_ZOOM_MAX, Number((1 / Math.max(editorCanvasScale, 0.01)).toFixed(2)));
    const clamped = Math.min(maxZoom, Math.max(EDITOR_ZOOM_MIN, Number(nextZoom.toFixed(2))));
    setEditorZoom(clamped);
  }, [editorCanvasScale]);

  const handlePreviewZoomChange = useCallback((nextZoom: number) => {
    const maxZoom = Math.max(EDITOR_ZOOM_MAX, Number((1 / Math.max(previewBaseScale, 0.01)).toFixed(2)));
    const clamped = Math.min(maxZoom, Math.max(EDITOR_ZOOM_MIN, Number(nextZoom.toFixed(2))));
    setPreviewZoom(clamped);
  }, [previewBaseScale]);

  const handleResetEditorZoom = useCallback(() => {
    setEditorZoom(1);
    resetCanvasViewport();
  }, [resetCanvasViewport]);

  const handleResetPreviewZoom = useCallback(() => {
    setPreviewZoom(1);
    resetCanvasViewport();
  }, [resetCanvasViewport]);

  const handleZoomOut = useCallback(() => {
    handleEditorZoomChange(editorZoom - EDITOR_ZOOM_STEP);
  }, [editorZoom, handleEditorZoomChange]);

  const handleZoomIn = useCallback(() => {
    handleEditorZoomChange(editorZoom + EDITOR_ZOOM_STEP);
  }, [editorZoom, handleEditorZoomChange]);

  const handlePreviewZoomOut = useCallback(() => {
    handlePreviewZoomChange(previewZoom - EDITOR_ZOOM_STEP);
  }, [handlePreviewZoomChange, previewZoom]);

  const handlePreviewZoomIn = useCallback(() => {
    handlePreviewZoomChange(previewZoom + EDITOR_ZOOM_STEP);
  }, [handlePreviewZoomChange, previewZoom]);

  const handleViewportZoomChange = useCallback((nextScale: number) => {
    if (isPreviewingTemplate) {
      const clampedEffectiveScale = Math.min(maxEffectivePreviewScale, Math.max(minEffectivePreviewScale, Number(nextScale.toFixed(2))));
      setPreviewZoom(Number((clampedEffectiveScale / Math.max(previewBaseScale, 0.01)).toFixed(2)));
      return;
    }

    const clampedEffectiveScale = Math.min(maxEffectiveEditorScale, Math.max(minEffectiveEditorScale, Number(nextScale.toFixed(2))));
    setEditorZoom(Number((clampedEffectiveScale / Math.max(editorCanvasScale, 0.01)).toFixed(2)));
  }, [
    editorCanvasScale,
    isPreviewingTemplate,
    minEffectiveEditorScale,
    minEffectivePreviewScale,
    maxEffectiveEditorScale,
    maxEffectivePreviewScale,
    previewBaseScale,
  ]);

  const handleViewportZoomOut = useCallback(() => {
    const currentScale = isPreviewingTemplate ? effectivePreviewScale : (editorCanvasScale * editorZoom);
    handleViewportZoomChange(currentScale - VIEWPORT_ZOOM_STEP);
  }, [editorCanvasScale, editorZoom, effectivePreviewScale, handleViewportZoomChange, isPreviewingTemplate]);

  const handleViewportZoomIn = useCallback(() => {
    const currentScale = isPreviewingTemplate ? effectivePreviewScale : (editorCanvasScale * editorZoom);
    handleViewportZoomChange(currentScale + VIEWPORT_ZOOM_STEP);
  }, [editorCanvasScale, editorZoom, effectivePreviewScale, handleViewportZoomChange, isPreviewingTemplate]);

  const handleViewportZoomReset = useCallback(() => {
    if (isPreviewingTemplate) {
      handleResetPreviewZoom();
      return;
    }

    handleResetEditorZoom();
  }, [handleResetEditorZoom, handleResetPreviewZoom, isPreviewingTemplate]);

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
    setOriginalCanvasSize((prev) => prev ?? { width: col.canvas_width, height: col.canvas_height });
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
    if (!authReady) return;

    let cancelled = false;

    const bootstrap = async () => {
      const storedToken = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
      let usableToken = authToken ?? storedToken;

      if (!usableToken) {
        await refreshAuth();
        usableToken = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
      }

      if (!usableToken) {
        return;
      }

      await Promise.all([loadCollection(), loadProducts(), loadTemplates()]);
    };

    setLoading(true);
    bootstrap()
      .catch((err) => {
        console.error("[collections editor] load failed:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authReady, authToken, loadCollection, loadProducts, loadTemplates, refreshAuth]);

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    await flushPendingItemContentSaves();
    await flushPendingCanvasSettingsSave();
  }, [flushPendingCanvasSettingsSave, flushPendingItemContentSaves]);

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
      await persistCollectionCanvasSettings({ backgroundImageUrl: nextUrl });
    } catch (err) {
      console.error("[background image upload]", err);
      alert("Error al subir el fondo");
    } finally {
      setBgImageUploading(false);
    }
  }, [collection, collectionId, persistCollectionCanvasSettings]);

  const handleRemoveBackgroundImage = useCallback(async () => {
    if (!collection?.background_image_url) return;
    setBgImageUploading(true);
    try {
      await persistCollectionCanvasSettings({ backgroundImageUrl: null });
    } catch (err) {
      console.error("[background image remove]", err);
      alert("Error al quitar el fondo");
    } finally {
      setBgImageUploading(false);
    }
  }, [collection?.background_image_url, persistCollectionCanvasSettings]);

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

      invalidateCache("/api/collections/templates/mine");
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
    setTemplatePreviewLoadingId(template.id);
    setPreviewZoom(1);
    setTemplateError(null);
    try {
      const res = await apiFetch(`/api/collections/templates/${template.id}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.message ?? "No se pudo cargar la plantilla");

      const normalizedPreview = {
        ...data.data,
        items_snapshot: Array.isArray(data.data?.items_snapshot)
          ? data.data.items_snapshot.map((item: CanvasItem, index: number) => ({
              ...item,
              id: Number.isFinite(item?.id) ? item.id : -((template.id * 1000) + index + 1),
            }))
          : [],
      };

      setPreviewTemplate(normalizedPreview);
      setSelectedItemId(null);
      setEditingTextId(null);
      setActiveTool("select");
      setMobilePanel(null);
      resetCanvasViewport();
    } catch (err: any) {
      setTemplateError(err?.message ?? "No se pudo cargar la vista previa");
    } finally {
      setTemplatePreviewLoadingId((prev) => prev === template.id ? null : prev);
    }
  }, [resetCanvasViewport]);

  const handleCancelTemplatePreview = useCallback(() => {
    setPreviewTemplate(null);
    setTemplatePreviewLoadingId(null);
    setTemplateApplyingId(null);
    setPreviewZoom(1);
    setMobilePanel(null);
    setTemplateError(null);
    resetCanvasViewport();
  }, [resetCanvasViewport]);

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

      invalidateCache(`/api/collections/${collectionId}`);
      await loadCollection();
      setPreviewTemplate(null);
      setSelectedItemId(null);
      setEditingTextId(null);
      setActiveTool("select");
      setMobilePanel(null);
      resetCanvasViewport();

      if (data?.data?.skipped_products > 0) {
        alert(`Plantilla aplicada. ${data.data.skipped_products} producto(s) no eran válidos para esta tienda y se omitieron.`);
      }
    } catch (err: any) {
      setTemplateError(err?.message ?? "No se pudo aplicar la plantilla");
    } finally {
      setTemplateApplyingId(null);
    }
  }, [collectionId, loadCollection, resetCanvasViewport]);

  // ── Drag product from sidebar → canvas ─────────────────────────────────────

  const handleSidebarDragStart = (e: React.DragEvent, product: Product) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", JSON.stringify(product));
  };

  const handleCanvasDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; };

  const handleCanvasDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const point = clientPointToCanvasPoint(e.clientX, e.clientY);
    if (!point) return;
    let product: Product;
    try { product = JSON.parse(e.dataTransfer.getData("text/plain")); } catch { return; }
    const pos_x = snapToGrid(Math.max(0, point.x - 75), gridSnap);
    const pos_y = snapToGrid(Math.max(0, point.y - 75), gridSnap);
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
    if (activeTool === "select" || activeTool === "image" || activeTool === "decor") return;
    if ((e.target as HTMLElement).closest("[data-canvas-item]")) return;
    const point = clientPointToCanvasPoint(e.clientX, e.clientY);
    if (!point) return;
    const pos_x = snapToGrid(Math.max(0, point.x - 100), gridSnap);
    const pos_y = snapToGrid(Math.max(0, point.y - 35), gridSnap);
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

  const openTextEditor = useCallback((itemId: number) => {
    const item = itemsRef.current.find((candidate) => candidate.id === itemId);
    if (!item || item.element_type !== "text") return;

    setSelectedItemId(itemId);
    if (isMobileViewport) {
      setMobilePanel("properties");
      setMobileTextEditorDraft(((item.content as ContentText)?.text) ?? "");
    }
    setEditingTextId(itemId);
  }, [isMobileViewport]);

  const handleMobileTextEditorConfirm = useCallback(async () => {
    if (!mobileEditingTextItem || !mobileEditingTextContent) {
      setEditingTextId(null);
      return;
    }

    const nextContent: ContentText = { ...mobileEditingTextContent, text: mobileTextEditorDraft };
    await persistItemContentImmediately(mobileEditingTextItem.id, nextContent);
    setEditingTextId(null);
  }, [mobileEditingTextContent, mobileEditingTextItem, mobileTextEditorDraft, persistItemContentImmediately]);

  const handleMobileTextEditorOpenChange = useCallback((open: boolean) => {
    if (open) return;
    setEditingTextId(null);
  }, []);

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

  const handleAddGraphicPreset = useCallback(async (preset: GraphicPreset) => {
    const nextWidth = Math.min(preset.width, Math.max(120, Math.floor((collection?.canvas_width ?? 800) * 0.42)));
    const aspectRatio = preset.height / preset.width;
    const nextHeight = Math.max(80, Math.round(nextWidth * aspectRatio));
    const pos_x = snapToGrid(Math.max(24, Math.round(((collection?.canvas_width ?? 800) - nextWidth) / 2)), gridSnap);
    const pos_y = snapToGrid(Math.max(24, Math.round(((collection?.canvas_height ?? 600) - nextHeight) / 2)), gridSnap);
    const content: ContentImage = {
      ...DEFAULT_IMAGE,
      url: svgToDataUrl(preset.svg),
      objectFit: preset.objectFit ?? "contain",
      borderRadius: 0,
      opacity: 1,
    };

    const res = await apiFetch(`/api/collections/${collectionId}/items`, {
      method: "POST",
      body: JSON.stringify({
        element_type: "image",
        content,
        pos_x,
        pos_y,
        width: nextWidth,
        height: nextHeight,
        z_index: itemsRef.current.length,
      }),
    });
    const data = await res.json();
    if (data.ok) {
      setItems((prev) => [...prev, {
        id: data.data.id,
        element_type: "image",
        content,
        product_id: null,
        pos_x,
        pos_y,
        width: nextWidth,
        height: nextHeight,
        z_index: prev.length,
        product_name: null,
        product_image: null,
        product_price: null,
      }]);
      setSelectedItemId(data.data.id);
      setActiveTool("select");
      setMobilePanel(null);
    }
  }, [collection?.canvas_height, collection?.canvas_width, collectionId, gridSnap]);

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
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (!collection) return;
    if (resizeState.current) {
      const { itemId, corner, startPX, startPY, origX, origY, origW, origH } = resizeState.current;
      const dx = (e.clientX - startPX) / effectiveCanvasScale;
      const dy = (e.clientY - startPY) / effectiveCanvasScale;
      const MIN = 40;
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
    const dx = (e.clientX - startPX) / effectiveCanvasScale;
    const dy = (e.clientY - startPY) / effectiveCanvasScale;
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

  const normalizeCanvasZOrder = useCallback((list: CanvasItem[]) => {
    return [...list]
      .sort((a, b) => (a.z_index ?? 0) - (b.z_index ?? 0) || a.id - b.id)
      .map((item, index) => ({ ...item, z_index: index + 1 }));
  }, []);

  const handleMoveLayer = useCallback((itemId: number, direction: "forward" | "backward") => {
    const ordered = normalizeCanvasZOrder(itemsRef.current);
    const currentIndex = ordered.findIndex((item) => item.id === itemId);
    if (currentIndex === -1) return;

    const targetIndex = direction === "forward" ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex < 0 || targetIndex >= ordered.length) return;

    const reordered = [...ordered];
    const [movedItem] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, movedItem);
    const normalized = reordered.map((item, index) => ({ ...item, z_index: index + 1 }));

    setItems(normalized);
    normalized.forEach((item) => {
      apiFetch(`/api/collections/${collectionId}/items/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ z_index: item.z_index }),
      });
    });
  }, [collectionId, normalizeCanvasZOrder]);

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
    if (!collection) return;
    if (collection.canvas_width === width && collection.canvas_height === height) return;

    const currentWidth = collection.canvas_width;
    const currentHeight = collection.canvas_height;
    const currentKey = getCanvasSnapshotKey(currentWidth, currentHeight);
    const nextKey = getCanvasSnapshotKey(width, height);
    canvasLayoutSnapshotsRef.current[currentKey] = cloneCanvasItems(itemsRef.current);

    const savedSnapshot = canvasLayoutSnapshotsRef.current[nextKey];
    const resizedItems = savedSnapshot
      ? cloneCanvasItems(savedSnapshot)
      : itemsRef.current.map((item) => {
          const nextPosX = Math.round((item.pos_x / Math.max(currentWidth, 1)) * width);
          const nextPosY = Math.round((item.pos_y / Math.max(currentHeight, 1)) * height);
          const nextItemWidth = Math.max(24, Math.round((item.width / Math.max(currentWidth, 1)) * width));
          const nextItemHeight = Math.max(24, Math.round((item.height / Math.max(currentHeight, 1)) * height));

          return {
            ...item,
            pos_x: Math.max(0, Math.min(width - nextItemWidth, nextPosX)),
            pos_y: Math.max(0, Math.min(height - nextItemHeight, nextPosY)),
            width: nextItemWidth,
            height: nextItemHeight,
          };
        });

    canvasLayoutSnapshotsRef.current[nextKey] = cloneCanvasItems(resizedItems);
    setItems(resizedItems);
    setCollection((prev) => prev ? { ...prev, canvas_width: width, canvas_height: height } : prev);

    await persistCollectionCanvasSettings({ canvasWidth: width, canvasHeight: height });
    await Promise.all(resizedItems.map((item) =>
      apiFetch(`/api/collections/${collectionId}/items/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({
          pos_x: item.pos_x,
          pos_y: item.pos_y,
          width: item.width,
          height: item.height,
        }),
      }),
    ));
  }, [collection, collectionId, persistCollectionCanvasSettings]);

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
  const currentCanvasWidth = collection?.canvas_width ?? 800;
  const currentCanvasHeight = collection?.canvas_height ?? 600;
  const currentCanvasFormat = getCanvasFormatLabel(currentCanvasWidth, currentCanvasHeight);
  const templatePriority: Record<string, number> = {
    "Crafted Heritage": 0,
    "Lookbook Grid": 1,
  };
  const mineTemplatesCount = templates.filter((template) => template.owner_scope === "mine").length;
  const systemTemplatesCount = templates.filter((template) => template.owner_scope !== "mine").length;
  const visibleTemplates = templates.filter((template) => {
    if (templateScopeFilter === "mine") return template.owner_scope === "mine";
    if (templateScopeFilter === "system") return template.owner_scope !== "mine";
    return true;
  });
  const sortedTemplates = [...visibleTemplates].sort((a, b) => {
    const metaA = getTemplateMeta(a.name);
    const metaB = getTemplateMeta(b.name);
    const exactSizeA = a.canvas_width === currentCanvasWidth && a.canvas_height === currentCanvasHeight ? 0 : 1;
    const exactSizeB = b.canvas_width === currentCanvasWidth && b.canvas_height === currentCanvasHeight ? 0 : 1;
    const formatA = getCanvasFormatLabel(a.canvas_width, a.canvas_height) === currentCanvasFormat ? 0 : 1;
    const formatB = getCanvasFormatLabel(b.canvas_width, b.canvas_height) === currentCanvasFormat ? 0 : 1;
    const priorityA = templatePriority[metaA.family] ?? 99;
    const priorityB = templatePriority[metaB.family] ?? 99;
    return (
      exactSizeA - exactSizeB ||
      formatA - formatB ||
      priorityA - priorityB ||
      metaA.family.localeCompare(metaB.family) ||
      metaA.variant.localeCompare(metaB.variant)
    );
  });
  const featuredTemplates = sortedTemplates.filter((template) => {
    const family = getTemplateMeta(template.name).family;
    return family in templatePriority;
  });
  const regularTemplates = sortedTemplates.filter((template) => {
    const family = getTemplateMeta(template.name).family;
    return !(family in templatePriority);
  });

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

  const effectiveGridScale = Math.max(effectiveCanvasScale, 0.01);
  const gridLineThickness = Math.min(4, Math.max(1, Math.ceil(1 / effectiveGridScale)));
  const majorGridStep = gridSnap > 0 ? gridSnap * 4 : 0;
  const showMajorGrid = gridSnap >= 8;
  const minorGridOpacity = effectiveGridScale < 0.75 ? 0.18 : 0.12;
  const majorGridOpacity = effectiveGridScale < 0.75 ? 0.34 : 0.22;
  const gridOverlayStyle: React.CSSProperties = gridSnap > 0 ? {
    backgroundImage: `
      linear-gradient(to right, rgba(99,102,241,${minorGridOpacity}) ${gridLineThickness}px, transparent ${gridLineThickness}px),
      linear-gradient(to bottom, rgba(99,102,241,${minorGridOpacity}) ${gridLineThickness}px, transparent ${gridLineThickness}px)
      ${showMajorGrid ? `,
      linear-gradient(to right, rgba(99,102,241,${majorGridOpacity}) ${gridLineThickness}px, transparent ${gridLineThickness}px),
      linear-gradient(to bottom, rgba(99,102,241,${majorGridOpacity}) ${gridLineThickness}px, transparent ${gridLineThickness}px)` : ""}
    `,
    backgroundSize: showMajorGrid
      ? `${gridSnap}px ${gridSnap}px, ${gridSnap}px ${gridSnap}px, ${majorGridStep}px ${majorGridStep}px, ${majorGridStep}px ${majorGridStep}px`
      : `${gridSnap}px ${gridSnap}px, ${gridSnap}px ${gridSnap}px`,
    backgroundPosition: "top left",
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
      <SellerSurfaceCard className="flex flex-wrap items-center gap-2 rounded-xl px-3 py-3 sm:gap-3 sm:px-4">
        <PageBackNav
          onClick={() => {
            window.location.href = "/seller/collections"
          }}
          label="Colecciones"
        />
        <div className="hidden h-5 w-px bg-neutral-200 sm:block" />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" maxLength={120}
          className="order-last w-full min-w-0 bg-transparent text-base font-semibold text-neutral-800 outline-none placeholder:text-neutral-400 sm:order-none sm:flex-1" />

        {/* Undo/Redo buttons */}
        <div className="ml-auto flex items-center gap-1 border-l border-neutral-200 pl-2 sm:ml-0 sm:pl-3">
          <button onClick={doUndo} disabled={!canUndo} title="Deshacer (Ctrl+Z)"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition hover:bg-neutral-50 disabled:opacity-30">
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={doRedo} disabled={!canRedo} title="Rehacer (Ctrl+Y)"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition hover:bg-neutral-50 disabled:opacity-30">
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <SellerPill tone={collection.status === "published" ? "success" : "warning"} className="shrink-0 px-2.5 py-0.5 text-[11px] uppercase tracking-wide">
          {collection.status === "published" ? "Publicada" : "Borrador"}
        </SellerPill>
        <button onClick={handleTogglePublish}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50">
          {collection.status === "published" ? <><EyeOff className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Despublicar</span><span className="sm:hidden">Estado</span></> : <><Eye className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Publicar</span><span className="sm:hidden">Estado</span></>}
        </button>
        <button
          onClick={() => {
            setTemplateName(name ? `${name} plantilla` : "Nueva plantilla");
            setTemplateError(null);
            setMobilePanel(null);
            setMobileCanvasControlsOpen(false);
            setShowTemplateModal(true);
          }}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50"
        >
          <Copy className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Guardar plantilla</span>
          <span className="sm:hidden">Guardar temp.</span>
        </button>
        <SellerActionButton onClick={handleSave} disabled={saving}
          className="px-4 py-1.5 text-xs font-medium disabled:opacity-60">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          {saved ? "Guardado" : "Guardar"}
        </SellerActionButton>
      </SellerSurfaceCard>

      {isPreviewingTemplate && previewTemplate && (
        <div className="flex flex-col gap-3 rounded-xl border border-[var(--seller-line-strong)] bg-[color:color-mix(in_srgb,var(--seller-accent)_8%,white)] px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--seller-accent)]">Vista previa de plantilla</p>
            <p className="text-xs text-[var(--seller-text)]">
              Estás viendo <span className="font-semibold">{previewTemplate.name}</span>. Tu canvas actual sigue intacto hasta que pulses aplicar.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              onClick={handleCancelTemplatePreview}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Seguir editando
            </button>
            <button
              onClick={() => handleApplyTemplate(previewTemplate.id)}
              disabled={templateApplyingId === previewTemplate.id}
              className="seller-button-primary flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition disabled:opacity-60"
            >
              {templateApplyingId === previewTemplate.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />}
              Usar plantilla
            </button>
          </div>
        </div>
      )}

      {mobilePanel && (
        <button
          onClick={() => setMobilePanel(null)}
          className="fixed inset-0 z-30 bg-black/35 md:hidden"
          aria-label="Cerrar panel móvil"
        />
      )}

      <div className={`grid gap-1.5 md:hidden ${isPreviewingTemplate ? "grid-cols-2" : "grid-cols-4"}`}>
        {!isPreviewingTemplate && (
          <button
            onClick={() => {
              setSelectedItemId(null);
              setMobilePanel((prev) => prev === "tools" ? null : "tools");
            }}
            className={`min-w-0 rounded-xl border px-2 py-2 text-[11px] font-medium leading-none transition ${mobilePanel === "tools" ? "border-[var(--seller-accent)] bg-[var(--seller-accent)] text-white" : "border-[var(--seller-line-strong)] bg-white text-[var(--seller-text)] hover:bg-[var(--seller-panel)]"}`}
          >
            Herram.
          </button>
        )}
        <button
          onClick={() => {
            setActiveTool("select");
            setSelectedItemId(null);
            setSelectSidebarTab("templates");
            setMobileCanvasControlsOpen(false);
            setMobilePanel((prev) => prev === "library" ? null : "library");
          }}
          className={`min-w-0 rounded-xl border px-2 py-2 text-[11px] font-medium leading-none transition ${mobilePanel === "library" ? "border-[var(--seller-accent)] bg-[var(--seller-accent)] text-white" : "border-[var(--seller-line-strong)] bg-white text-[var(--seller-text)] hover:bg-[var(--seller-panel)]"}`}
        >
          Plantillas
        </button>
        {!isPreviewingTemplate && (
          <button
            onClick={() => {
              setMobilePanel(null);
              setMobileCanvasControlsOpen(false);
              scrollSectionIntoView(canvasAreaRef);
            }}
            className="min-w-0 rounded-xl border border-neutral-200 bg-white px-2 py-2 text-[11px] font-medium leading-none text-neutral-700 transition hover:bg-neutral-50"
          >
            Canvas
          </button>
        )}
        <button
          onClick={() => setMobilePanel("properties")}
          className="min-w-0 rounded-xl border border-neutral-200 bg-white px-2 py-2 text-[11px] font-medium leading-none text-neutral-700 transition hover:bg-neutral-50"
        >
          Propiedades
        </button>
      </div>

      {/* ── Editor body ── */}
      <div
        className={`flex flex-col gap-3 overflow-visible rounded-xl pb-24 md:h-[calc(100vh-260px)] md:flex-row md:overflow-hidden md:pb-0 ${
          isPreviewingTemplate && isCompactPreviewViewport ? "pb-6" : ""
        }`}
      >

        {/* ── Left sidebar ── */}
        <aside ref={leftPanelRef} className={`${isMobileToolsPanelOpen ? "fixed inset-x-3 bottom-24 top-20 z-40 flex" : "hidden"} order-2 h-auto w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-[var(--seller-line-strong)] bg-white shadow-[0_24px_60px_rgba(15,61,58,0.18)] md:static md:inset-auto md:order-none md:flex md:max-h-none md:w-56 md:rounded-xl md:shadow-none md:z-auto`}>
          <div className="border-b border-neutral-100 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                {mobilePanel === "library" ? "Biblioteca" : "Herramienta"}
              </p>
              <button
                onClick={() => setMobilePanel(null)}
                className="rounded-lg border border-neutral-200 p-1.5 text-neutral-400 transition hover:bg-neutral-50 md:hidden"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {mobilePanel !== "library" && (
              <div className="grid grid-cols-4 gap-1">
                {([
                  { tool: "select" as ActiveTool, icon: MousePointer2, label: "Mover" },
                  { tool: "text"   as ActiveTool, icon: Type,           label: "Texto" },
                  { tool: "shape"  as ActiveTool, icon: Square,         label: "Forma" },
                  { tool: "image"  as ActiveTool, icon: ImageIcon,      label: "Imagen" },
                  { tool: "decor"  as ActiveTool, icon: Sparkles,       label: "Decor" },
                ] as const).map(({ tool, icon: Icon, label }) => (
                  <button key={tool} onClick={() => { setActiveTool(tool); setSelectedItemId(null); setMobilePanel("tools"); }}
                    className={`flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-medium transition ${activeTool === tool ? "bg-[var(--seller-accent)] text-white" : "bg-[var(--seller-panel)] text-[var(--seller-muted)] hover:bg-[var(--seller-panel-soft)]"}`}>
                    <Icon className="h-3.5 w-3.5" />{label}
                  </button>
                ))}
              </div>
            )}
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
                    className={`rounded-lg px-2 py-1.5 text-[11px] font-medium transition ${selectSidebarTab === "products" ? "bg-[var(--seller-accent)] text-white" : "bg-[var(--seller-panel)] text-[var(--seller-muted)] hover:bg-[var(--seller-panel-soft)]"}`}
                  >
                    Productos
                  </button>
                  <button
                    onClick={() => setSelectSidebarTab("templates")}
                    className={`rounded-lg px-2 py-1.5 text-[11px] font-medium transition ${selectSidebarTab === "templates" ? "bg-[var(--seller-accent)] text-white" : "bg-[var(--seller-panel)] text-[var(--seller-muted)] hover:bg-[var(--seller-panel-soft)]"}`}
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
                    <p className="mt-1 text-[11px] leading-relaxed text-neutral-400">
                      {sortedTemplates.length} visibles · {mineTemplatesCount} mias · {systemTemplatesCount} sistema
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-1">
                      {([
                        { value: "all", label: "Todas" },
                        { value: "mine", label: "Mias" },
                        { value: "system", label: "Sistema" },
                      ] as const).map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setTemplateScopeFilter(option.value)}
                          className={`rounded-lg px-2 py-1.5 text-[11px] font-medium transition ${
                            templateScopeFilter === option.value
                              ? "bg-[var(--seller-accent)] text-white"
                              : "bg-[var(--seller-panel)] text-[var(--seller-muted)] hover:bg-[var(--seller-panel-soft)]"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
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
                    {sortedTemplates.length === 0 && (
                      <p className="py-8 text-center text-xs text-neutral-400">
                        {templateScopeFilter === "mine"
                          ? "Todavia no has guardado plantillas tuyas."
                          : templateScopeFilter === "system"
                            ? "No hay plantillas del sistema disponibles."
                            : "Todavia no hay plantillas disponibles."}
                      </p>
                    )}
                    {featuredTemplates.length > 0 && (
                      <div className="space-y-2 pb-1">
                        <div className="flex items-center justify-between gap-2 px-1">
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#0F3D3A]">Nuevas</p>
                          <span className="text-[10px] text-neutral-400">recientes</span>
                        </div>
                        {featuredTemplates.map((template) => {
                          const templateMeta = getTemplateMeta(template.name);
                          const ownerScope = template.owner_scope === "mine" ? "mine" : "system";
                          const miniScale = Math.min(148 / template.canvas_width, 112 / template.canvas_height);
                          const miniWidth = Math.max(98, template.canvas_width * miniScale);
                          const miniHeight = Math.max(74, template.canvas_height * miniScale);

                          return (
                            <div key={`featured-${template.id}`} className="overflow-hidden rounded-2xl border border-[#0F3D3A]/15 bg-[color:color-mix(in_srgb,#0F3D3A_3%,white)] shadow-[0_8px_30px_rgba(15,61,58,0.06)]">
                              <div className="relative h-24 w-full overflow-hidden border-b border-neutral-100 bg-[linear-gradient(180deg,#FAF8F4_0%,#F2EEE6_100%)] md:h-32">
                                <div className="absolute inset-x-3 bottom-2 top-2 rounded-[18px] border border-white/80 bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-[2px] md:inset-x-4 md:bottom-3 md:top-3 md:rounded-[20px]" />
                                <div
                                  className="absolute left-1/2 top-1/2 overflow-hidden rounded-xl border border-white/80 shadow-[0_18px_40px_rgba(15,61,58,0.18)]"
                                  style={{
                                    width: miniWidth,
                                    height: miniHeight,
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
                                  {(template.items_snapshot ?? []).slice(0, 10).map((item, index) => {
                                    const scale = miniScale;
                                    const left = (Number(item.pos_x ?? 0) * scale);
                                    const top = (Number(item.pos_y ?? 0) * scale);
                                    const width = Math.max(8, Number(item.width ?? 60) * scale);
                                    const height = Math.max(8, Number(item.height ?? 40) * scale);
                                    const content = item.content as any;

                                    if (item.element_type === "text") {
                                      return (
                                        <div
                                          key={`${template.id}-featured-text-${index}`}
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
                                            letterSpacing: `${(content?.letterSpacing ?? 0) * scale}px`,
                                            overflow: "hidden",
                                            whiteSpace: "pre-wrap",
                                            wordBreak: "break-word",
                                            opacity: 0.95,
                                          }}
                                        >
                                          {String(content?.text ?? "").slice(0, 30)}
                                        </div>
                                      );
                                    }

                                    if (item.element_type === "shape") {
                                      return (
                                        <div
                                          key={`${template.id}-featured-shape-${index}`}
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

                                    if (item.element_type === "image" || item.element_type === "product") {
                                      const imageUrl = content?.url || item.product_image;
                                      return imageUrl ? (
                                        <img
                                          key={`${template.id}-featured-image-${index}`}
                                          src={imageUrl}
                                          alt=""
                                          style={{
                                            position: "absolute",
                                            left,
                                            top,
                                            width,
                                            height,
                                            objectFit: content?.objectFit ?? "cover",
                                            borderRadius: `${Math.max(2, Number(content?.borderRadius ?? 8) * scale)}px`,
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
                                      ) : (
                                        <div
                                          key={`${template.id}-featured-placeholder-${index}`}
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
                                <div className="pointer-events-none absolute left-2 top-2 rounded-full border border-white/70 bg-white/85 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-500 shadow-sm md:left-3 md:top-3 md:text-[10px] md:tracking-[0.18em]">
                                  {getCanvasFormatLabel(template.canvas_width, template.canvas_height)}
                                </div>
                                <div className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-[#0F3D3A] px-2 py-1 text-[9px] font-medium text-white shadow-sm md:text-[10px]">
                                  Nuevo
                                </div>
                              </div>
                              <div className="space-y-2 p-2.5 md:space-y-2.5 md:p-3">
                                <div>
                                  <div className="mb-1.5 flex flex-wrap gap-1.5 md:mb-2">
                                    <span className="rounded-full bg-[#EAF3F1] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#0F3D3A] md:text-[10px]">
                                      {templateMeta.tone}
                                    </span>
                                    <span className="rounded-full bg-neutral-100 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-500 md:text-[10px]">
                                      {templateMeta.variant}
                                    </span>
                                    <span className={`rounded-full px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] md:text-[10px] ${
                                      ownerScope === "mine"
                                        ? "bg-[#EEF6FF] text-[#1D4ED8]"
                                        : "bg-[#FFF5E8] text-[#9A5B13]"
                                    }`}>
                                      {ownerScope === "mine" ? "Mia" : "Sistema"}
                                    </span>
                                  </div>
                                  <p className="line-clamp-1 text-xs font-semibold text-neutral-800">{templateMeta.family}</p>
                                  <p className="mt-1 text-[10px] text-neutral-400 md:mt-2 md:text-[11px]">{template.item_count} elementos</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => handlePreviewTemplate(template)}
                                    disabled={templatePreviewLoadingId === template.id || templateApplyingId === template.id}
                                    className={`flex items-center justify-center gap-1.5 rounded-lg border py-1.5 text-[11px] font-medium transition disabled:opacity-60 md:text-xs ${
                                      previewTemplate?.id === template.id
                                        ? "border-[#0F3D3A] bg-[#0F3D3A] text-white"
                                        : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                                    }`}
                                  >
                                    {templatePreviewLoadingId === template.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
                                    {previewTemplate?.id === template.id ? "Viendo" : "Preview"}
                                  </button>
                                  <button
                                    onClick={() => handleApplyTemplate(template.id)}
                                    disabled={templatePreviewLoadingId === template.id || templateApplyingId === template.id}
                                    className="flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 py-1.5 text-[11px] font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60 md:text-xs"
                                  >
                                    {templateApplyingId === template.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Copy className="h-3 w-3" />}
                                    Aplicar
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {regularTemplates.map((template) => {
                      const templateMeta = getTemplateMeta(template.name);
                      const ownerScope = template.owner_scope === "mine" ? "mine" : "system";
                      const miniScale = Math.min(148 / template.canvas_width, 112 / template.canvas_height);
                      const miniWidth = Math.max(98, template.canvas_width * miniScale);
                      const miniHeight = Math.max(74, template.canvas_height * miniScale);

                      return (
                        <div key={template.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_8px_30px_rgba(15,61,58,0.06)]">
                          <div className="relative h-24 w-full overflow-hidden border-b border-neutral-100 bg-[linear-gradient(180deg,#FAF8F4_0%,#F2EEE6_100%)] md:h-32">
                            <div className="absolute inset-x-3 bottom-2 top-2 rounded-[18px] border border-white/80 bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-[2px] md:inset-x-4 md:bottom-3 md:top-3 md:rounded-[20px]" />
                            <div
                              className="absolute left-1/2 top-1/2 overflow-hidden rounded-xl border border-white/80 shadow-[0_18px_40px_rgba(15,61,58,0.18)]"
                              style={{
                                width: miniWidth,
                                height: miniHeight,
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
                              {(template.items_snapshot ?? []).slice(0, 10).map((item, index) => {
                                const scale = miniScale;
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
                                        letterSpacing: `${(content?.letterSpacing ?? 0) * scale}px`,
                                        overflow: "hidden",
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                        opacity: 0.95,
                                      }}
                                    >
                                      {String(content?.text ?? "").slice(0, 30)}
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
                                        objectFit: content?.objectFit ?? "cover",
                                        borderRadius: `${Math.max(2, Number(content?.borderRadius ?? 8) * scale)}px`,
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
                            <div className="pointer-events-none absolute left-2 top-2 rounded-full border border-white/70 bg-white/85 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-500 shadow-sm md:left-3 md:top-3 md:text-[10px] md:tracking-[0.18em]">
                              {getCanvasFormatLabel(template.canvas_width, template.canvas_height)}
                            </div>
                            <div className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-black/65 px-2 py-1 text-[9px] font-medium text-white shadow-sm md:text-[10px]">
                              {template.canvas_width}×{template.canvas_height}
                            </div>
                          </div>
                          <div className="space-y-2 p-2.5 md:space-y-2.5 md:p-3">
                            <div>
                              <div className="mb-1.5 flex flex-wrap gap-1.5 md:mb-2">
                                <span className="rounded-full bg-[#F3F7F6] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#0F3D3A] md:text-[10px]">
                                  {templateMeta.tone}
                                </span>
                                <span className="rounded-full bg-neutral-100 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-neutral-500 md:text-[10px]">
                                  {templateMeta.variant}
                                </span>
                                <span className={`rounded-full px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] md:text-[10px] ${
                                  ownerScope === "mine"
                                    ? "bg-[#EEF6FF] text-[#1D4ED8]"
                                    : "bg-[#FFF5E8] text-[#9A5B13]"
                                }`}>
                                  {ownerScope === "mine" ? "Mia" : "Sistema"}
                                </span>
                              </div>
                              <p className="line-clamp-1 text-xs font-semibold text-neutral-800">{templateMeta.family}</p>
                              <p className="mt-1 hidden line-clamp-2 text-[11px] leading-relaxed text-neutral-500 md:block">{templateMeta.description}</p>
                              <p className="mt-1 text-[10px] text-neutral-400 md:mt-2 md:text-[11px]">{template.item_count} elementos</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handlePreviewTemplate(template)}
                                disabled={templatePreviewLoadingId === template.id || templateApplyingId === template.id}
                                className={`flex items-center justify-center gap-1.5 rounded-lg border py-1.5 text-[11px] font-medium transition disabled:opacity-60 md:text-xs ${
                                  previewTemplate?.id === template.id
                                    ? "border-[#0F3D3A] bg-[#0F3D3A] text-white"
                                    : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                                }`}
                              >
                                {templatePreviewLoadingId === template.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Eye className="h-3 w-3" />}
                                {previewTemplate?.id === template.id ? "Viendo" : "Preview"}
                              </button>
                              <button
                                onClick={() => handleApplyTemplate(template.id)}
                                disabled={templatePreviewLoadingId === template.id || templateApplyingId === template.id}
                                className="flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 py-1.5 text-[11px] font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60 md:text-xs"
                              >
                                {templateApplyingId === template.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Copy className="h-3 w-3" />}
                                Aplicar
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
              <p className="text-xs leading-relaxed text-neutral-500">Haz clic en el canvas para colocar una forma o un decorativo editorial.</p>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-neutral-500">Básicas</label>
                <div className="grid grid-cols-3 gap-1">
                  {SHAPE_TYPES.slice(0, 5).map((t) => (
                    <button key={t.value} onClick={() => setShapeDefaults((p) => ({ ...p, shapeType: t.value }))}
                      className={`rounded-lg border py-1.5 text-[10px] transition ${shapeDefaults.shapeType === t.value ? "border-[#0F3D3A] bg-[#0F3D3A] text-white" : "border-neutral-200 text-neutral-500"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <label className="block text-[11px] font-medium text-neutral-500">Decorativos</label>
                  <span className="text-[10px] text-neutral-400">ideal para plantillas premium</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {SHAPE_TYPES.filter((t) => DECORATIVE_SHAPE_TYPES.includes(t.value)).map((t) => (
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
          ) : activeTool === "decor" ? (
            <div className="flex-1 space-y-3 overflow-y-auto p-3">
              <p className="text-xs leading-relaxed text-neutral-500">Inserta gráficos listos para enriquecer plantillas premium: editoriales, símbolos y emojis curados.</p>
              {([
                { group: "Editorial" as const, subtitle: "acentos suaves para composiciones premium" },
                { group: "Simbolos" as const, subtitle: "elementos con narrativa, craft y marca" },
                { group: "Outline" as const, subtitle: "línea fina para un look más lujo/editorial" },
                { group: "Emoji" as const, subtitle: "emoji curado, menos infantil y más usable" },
              ] as const).map(({ group, subtitle }) => {
                const presets = GRAPHIC_PRESETS.filter((preset) => preset.group === group);
                return (
                  <div key={group}>
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-500">{group}</label>
                        <p className="mt-0.5 text-[10px] leading-relaxed text-neutral-400">{subtitle}</p>
                      </div>
                      <span className="text-[10px] text-neutral-400">{presets.length} piezas</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {presets.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => handleAddGraphicPreset(preset)}
                          className="overflow-hidden rounded-xl border border-neutral-200 bg-white text-left transition hover:border-[#0F3D3A]/30 hover:shadow-sm"
                        >
                          <div className="flex h-24 items-center justify-center bg-[linear-gradient(180deg,#FAF7F2_0%,#F2ECE2_100%)] p-3">
                            <img
                              src={svgToDataUrl(preset.svg)}
                              alt={preset.label}
                              className="max-h-full max-w-full object-contain"
                              draggable={false}
                            />
                          </div>
                          <div className="border-t border-neutral-100 px-2.5 py-2">
                            <p className="text-[11px] font-medium text-neutral-700">{preset.label}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
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
        <div
          ref={canvasAreaRef}
          className={`order-1 flex flex-col overflow-hidden rounded-xl border border-[var(--seller-line-strong)] bg-neutral-100 md:order-none ${
            isPreviewingTemplate && isCompactPreviewViewport ? "min-h-0 flex-none" : "min-h-0 flex-1 md:min-h-[64vh]"
          }`}
        >
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[var(--seller-line)] bg-white px-3 py-2.5 sm:gap-3 sm:px-4">
            <div className="flex w-full items-center justify-between gap-2 sm:hidden">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400">Canvas</p>
                <p className="mt-1 text-xs text-neutral-500">{displayCanvasWidth} × {displayCanvasHeight} · {bgGradient.enabled ? "degradado" : "color plano"}</p>
              </div>
              {!isPreviewingTemplate && (
                <button
                  onClick={() => setMobileCanvasControlsOpen((prev) => !prev)}
                  className="rounded-lg border border-[var(--seller-line-strong)] px-3 py-1.5 text-xs font-medium text-[var(--seller-text)] transition hover:bg-[var(--seller-panel)]"
                >
                  {mobileCanvasControlsOpen ? "Ocultar" : "Canvas"}
                </button>
              )}
            </div>

            <div className={`${isPreviewingTemplate || mobileCanvasControlsOpen ? "flex" : "hidden"} w-full flex-wrap items-center gap-2 sm:flex sm:w-auto sm:gap-3`}>
            {isPreviewingTemplate ? (
              <>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-neutral-400">Zoom:</span>
                  <button
                    onClick={handleViewportZoomOut}
                    disabled={!canZoomOut}
                    className="flex h-6 w-6 items-center justify-center rounded border border-neutral-200 text-neutral-500 transition hover:bg-neutral-50 disabled:opacity-40"
                    title="Alejar"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <button
                    onClick={handleViewportZoomReset}
                    className="rounded px-2 py-0.5 text-[10px] font-medium text-neutral-500 transition hover:bg-neutral-100"
                    title="Restablecer zoom"
                  >
                    {activeZoomLabel}
                  </button>
                  <button
                    onClick={handleViewportZoomIn}
                    disabled={!canZoomIn}
                    className="flex h-6 w-6 items-center justify-center rounded border border-neutral-200 text-neutral-500 transition hover:bg-neutral-50 disabled:opacity-40"
                    title="Acercar"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <span className="w-full text-xs text-neutral-400 sm:w-auto">{displayCanvasWidth} × {displayCanvasHeight}</span>
              </>
            ) : (
              <>
                <label className="flex items-center gap-1.5 text-xs text-neutral-500">
                  Fondo:
                  <input type="color" value={bgColor} onChange={(e) => handleBackgroundColorChange(e.target.value)}
                    className="h-6 w-10 cursor-pointer rounded border border-neutral-200" />
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-neutral-500">
                  <input type="checkbox" checked={bgGradient.enabled}
                    onChange={(e) => handleBackgroundGradientChange((current) => ({ ...current, enabled: e.target.checked }))}
                    className="rounded" />
                  Degradado
                </label>
                {bgGradient.enabled && (
                  <>
                    <input type="color" value={bgGradient.color2}
                      onChange={(e) => handleBackgroundGradientChange((current) => ({ ...current, color2: e.target.value }))}
                      className="h-6 w-10 cursor-pointer rounded border border-neutral-200" title="Color 2" />
                    <select value={bgGradient.type}
                      onChange={(e) => handleBackgroundGradientChange((current) => ({ ...current, type: e.target.value as "linear" | "radial" }))}
                      className="rounded-lg border border-neutral-200 px-2 py-1 text-xs outline-none">
                      <option value="linear">Lineal</option>
                      <option value="radial">Radial</option>
                    </select>
                    {bgGradient.type === "linear" && (
                      <label className="flex items-center gap-1.5 text-xs text-neutral-500">
                        {bgGradient.angle}°
                        <input type="range" min={0} max={359} value={bgGradient.angle}
                          onChange={(e) => handleBackgroundGradientChange((current) => ({ ...current, angle: Number(e.target.value) }))}
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
                        className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition ${gridSnap === g.value ? "bg-[var(--seller-accent)] text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 border-l border-neutral-200 pl-3">
                  <span className="text-[10px] text-neutral-400">Canvas:</span>
                  {canvasPresetOptions.map((p, index) => {
                    const active = collection.canvas_width === p.w && collection.canvas_height === p.h;
                    return (
                      <button key={`${p.label}-${p.w}-${p.h}-${index}`} onClick={() => handleCanvasResize(p.w, p.h)}
                        className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition ${active ? "bg-[var(--seller-accent)] text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"}`}>
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-1 border-l border-neutral-200 pl-3">
                  <span className="text-[10px] text-neutral-400">Zoom:</span>
                  <button
                    onClick={handleViewportZoomOut}
                    disabled={!canZoomOut}
                    className="flex h-6 w-6 items-center justify-center rounded border border-neutral-200 text-neutral-500 transition hover:bg-neutral-50 disabled:opacity-40"
                    title="Alejar"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <button
                    onClick={handleViewportZoomReset}
                    className="rounded px-2 py-0.5 text-[10px] font-medium text-neutral-500 transition hover:bg-neutral-100"
                    title="Restablecer zoom"
                  >
                    {activeZoomLabel}
                  </button>
                  <button
                    onClick={handleViewportZoomIn}
                    disabled={!canZoomIn}
                    className="flex h-6 w-6 items-center justify-center rounded border border-neutral-200 text-neutral-500 transition hover:bg-neutral-50 disabled:opacity-40"
                    title="Acercar"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <span className="w-full text-xs text-neutral-400 sm:w-auto">{displayCanvasWidth} × {displayCanvasHeight}</span>
                {activeTool !== "select" && activeTool !== "image" && (
                  <span className="text-xs font-medium text-[#0F3D3A] sm:ml-auto">
                    {activeTool === "text" ? "✏ Clic para texto" : "■ Clic para forma"}
                  </span>
                )}
                {selectedItemId && activeTool === "select" && (
                  <span className="flex w-full items-center gap-2 text-xs text-neutral-400 sm:ml-auto sm:w-auto">
                    <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[10px]">Ctrl+Z</kbd> deshacer
                    <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[10px]">Delete</kbd> eliminar
                  </span>
                )}
              </>
            )}
            </div>
          </div>

          {/* Canvas */}
          {isPreviewingTemplate && isCompactPreviewViewport ? (
            <div
              ref={canvasViewportRef}
              className="relative flex-none overflow-auto bg-[radial-gradient(circle_at_top,#F9F6EE_0%,#EFE6D8_48%,#E7DDD0_100%)] px-2 py-3"
            >
              <div
                className="mx-auto shrink-0"
                style={{
                  width: compactPreviewCanvasWidth,
                }}
              >
                <div
                  className="overflow-hidden rounded-[22px] border border-white/80 bg-white shadow-[0_18px_40px_rgba(15,61,58,0.18)]"
                  style={{
                    width: compactPreviewCanvasWidth,
                    height: compactPreviewCanvasHeight,
                  }}
                >
                  <CollectionArtworkPreview
                    name={previewTemplate?.name ?? "Vista previa"}
                    items={displayItems}
                    backgroundColor={previewTemplate?.background_color ?? null}
                    backgroundStyle={displayBackground}
                    canvasWidth={displayCanvasWidth}
                    canvasHeight={displayCanvasHeight}
                    imageFit="contain"
                    className="h-full w-full"
                    emptyTitle="Vista previa"
                    emptyDescription="La plantilla se mostrará aquí antes de aplicarla."
                  />
                </div>
              </div>
            </div>
          ) : (
          <div
            ref={canvasViewportRef}
            className={`relative flex flex-1 items-center justify-center ${
              isPreviewingTemplate ? "p-1.5 sm:p-5 lg:p-8" : "p-3 sm:p-5 lg:p-8"
            } ${
              isPreviewingTemplate
                ? `${isCompactPreviewViewport ? "overflow-hidden" : "overflow-auto"} bg-[radial-gradient(circle_at_top,#F9F6EE_0%,#EFE6D8_48%,#E7DDD0_100%)]`
                : isEditorFitMode
                  ? "overflow-hidden"
                  : "overflow-auto"
            }`}
            style={
              isPreviewingTemplate
                ? { alignItems: isCompactPreviewViewport ? "center" : "flex-start", justifyContent: isCompactPreviewViewport ? "center" : "flex-start" }
                : !isEditorFitMode
                  ? { alignItems: "flex-start", justifyContent: "flex-start" }
                  : undefined
            }
            onClick={() => { if (!isPreviewingTemplate && activeTool === "select") { setSelectedItemId(null); setEditingTextId(null); } }}>
            <div
              style={
                isPreviewingTemplate || editorCanvasScale !== 1 || editorZoom !== 1
                  ? {
                      width: isPreviewingTemplate ? previewStageWidth : isEditorFitMode ? "100%" : displayCanvasWidth * effectiveCanvasScale,
                      height: isPreviewingTemplate ? previewStageHeight : displayCanvasHeight * effectiveCanvasScale,
                      display: "flex",
                      alignItems: isPreviewingTemplate ? (isCompactPreviewViewport ? "center" : "flex-start") : isEditorFitMode ? "center" : "flex-start",
                      justifyContent: isPreviewingTemplate ? (isCompactPreviewViewport ? "center" : "flex-start") : isEditorFitMode ? "center" : "flex-start",
                      maxWidth: "100%",
                    }
                  : undefined
              }
            >
              {isPreviewingTemplate && (
                <div
                  className={`pointer-events-none absolute border border-white/80 bg-white/40 backdrop-blur-[3px] ${
                    isCompactPreviewViewport
                      ? "rounded-[20px] shadow-[0_18px_48px_rgba(15,61,58,0.12)]"
                      : "rounded-[36px] shadow-[0_28px_90px_rgba(15,61,58,0.12)]"
                  }`}
                  style={{ width: previewStageWidth, height: previewStageHeight }}
                />
              )}
              <div
                style={
                  isPreviewingTemplate || editorCanvasScale !== 1 || editorZoom !== 1
                    ? {
                        width: displayCanvasWidth * effectiveCanvasScale,
                        height: displayCanvasHeight * effectiveCanvasScale,
                        position: "relative",
                      }
                    : undefined
                }
              >
              <div ref={canvasRef}
                className={`relative shrink-0 overflow-hidden ${isPreviewingTemplate ? "border border-white/80 shadow-[0_30px_80px_rgba(15,61,58,0.22)]" : "shadow-xl"}`}
                style={{
                  width: displayCanvasWidth, height: displayCanvasHeight,
                  background: displayBackground,
                  cursor: !isPreviewingTemplate && (activeTool === "text" || activeTool === "shape") ? "crosshair" : "default",
                  ...((isPreviewingTemplate || editorCanvasScale !== 1 || editorZoom !== 1) ? {
                    transform: `scale(${effectiveCanvasScale})`,
                    transformOrigin: "top left",
                    ...(isPreviewingTemplate ? { borderRadius: 24 } : {}),
                  } : {}),
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
              {!isPreviewingTemplate && gridSnap > 0 && (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ ...gridOverlayStyle, zIndex: 1 }}
                />
              )}
              {displayItems.length === 0 && activeTool === "select" && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
                  <p className="text-sm font-medium text-neutral-400">Canvas vacío</p>
                  <p className="text-xs text-neutral-300">Arrastra productos o usa Texto / Forma / Imagen</p>
                </div>
              )}

              {displayItems.map((item, itemIndex) => {
                const isSelected    = selectedItemId === item.id;
                const isLocked      = lockedItemIds.has(item.id);
                const tc            = item.content as ContentText;
                const sc            = item.content as ContentShape;
                const ic            = item.content as ContentImage;
                const pc            = item.content as ContentProduct;
                const motionStyle   = getMotionStyle(item);
                const isEditingText = editingTextId === item.id;

                return (
                  <div
                    key={`${item.id ?? "preview"}-${item.element_type}-${item.z_index}-${item.pos_x}-${item.pos_y}-${itemIndex}`}
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
                    onClick={isPreviewingTemplate ? undefined : (e) => {
                      e.stopPropagation();
                      if (activeTool !== "select") return;
                      if (isMobileViewport && item.element_type === "text" && selectedItemId === item.id) {
                        openTextEditor(item.id);
                        return;
                      }
                      setSelectedItemId(item.id);
                    }}
                    onDoubleClick={isPreviewingTemplate ? undefined : (e) => {
                      e.stopPropagation();
                      if (item.element_type === "text" && activeTool === "select") {
                        openTextEditor(item.id);
                      }
                    }}
                  >
                    {/* Motion wrapper */}
                    <div style={{ width: "100%", height: "100%", position: "relative", ...motionStyle }}>
                      {item.element_type === "product" && (
                        item.product_image
                          ? <img
                              src={item.product_image}
                              alt={item.product_name ?? ""}
                              draggable={false}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: pc?.objectFit ?? "cover",
                                borderRadius: pc?.borderRadius ?? 8,
                                opacity: pc?.opacity ?? 1,
                                boxShadow: buildBoxShadow(pc),
                                display: "block",
                              }}
                            />
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
                            {!isMobileViewport && isEditingText && (
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
                          border: (sc?.strokeWidth ?? 0) > 0 && isBorderFriendlyShape(sc?.shapeType ?? "rectangle")
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
                        <div
                          className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100"
                          style={{
                            borderBottomLeftRadius: pc?.borderRadius ?? 8,
                            borderBottomRightRadius: pc?.borderRadius ?? 8,
                          }}
                        >
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
          )}
        </div>

        {/* ── Right properties panel ── */}
        <aside ref={rightPanelRef} className={`${mobilePanel === "properties" ? "fixed inset-x-3 bottom-24 top-20 z-40 flex" : "hidden"} order-3 h-auto w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_24px_60px_rgba(15,61,58,0.18)] md:static md:inset-auto md:order-none md:flex md:max-h-none md:w-60 md:rounded-xl md:shadow-none md:z-auto`}>
          <div className="border-b border-neutral-100 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Propiedades</p>
              <button
                onClick={() => setMobilePanel(null)}
                className="rounded-lg border border-neutral-200 p-1.5 text-neutral-400 transition hover:bg-neutral-50 md:hidden"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {isPreviewingTemplate ? (
            <div className="flex flex-1 flex-col overflow-y-auto">
              <div className="p-4">
                <p className="text-sm font-semibold text-neutral-800">Preview activa</p>
                <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                  Estás viendo la plantilla sobre el canvas sin reemplazar tu diseño actual. Puedes inspeccionar composición, colores y proporciones antes de aplicarla.
                </p>
                {previewTemplate && (
                  <div className="mt-4 space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                    <p className="text-xs font-semibold text-neutral-700">{previewTemplate.name}</p>
                    <p className="mt-1 text-[11px] text-neutral-500">
                      {previewTemplate.item_count} elementos · {previewTemplate.canvas_width} × {previewTemplate.canvas_height}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-500">
                      <div className="rounded-lg border border-neutral-200 bg-white px-2.5 py-2">
                        <p className="font-semibold text-neutral-700">Formato</p>
                        <p className="mt-1">{getCanvasFormatLabel(previewTemplate.canvas_width, previewTemplate.canvas_height)}</p>
                      </div>
                      <div className="rounded-lg border border-neutral-200 bg-white px-2.5 py-2">
                        <p className="font-semibold text-neutral-700">Zoom</p>
                        <p className="mt-1">{Math.round(effectivePreviewScale * 100)}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2 border-t border-neutral-100 px-4 py-3">
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
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-[11px] font-medium text-neutral-500">Texto</label>
                        {isMobileViewport && (
                          <button
                            onClick={() => openTextEditor(selectedItem.id)}
                            className="rounded-lg border border-[#0F3D3A]/15 px-2 py-1 text-[11px] font-medium text-[#0F3D3A] transition hover:bg-[#0F3D3A]/5"
                          >
                            Editar cómodo
                          </button>
                        )}
                      </div>
                      {isMobileViewport ? (
                        <button
                          onClick={() => openTextEditor(selectedItem.id)}
                          className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-left text-xs text-neutral-600 transition hover:border-[#0F3D3A]/25 hover:bg-[#0F3D3A]/[0.04]"
                        >
                          {c?.text?.trim() ? c.text : "Tocar para escribir en una caja más cómoda"}
                        </button>
                      ) : (
                        <textarea value={c?.text ?? ""} onChange={(e) => upd({ text: e.target.value })}
                          rows={3} className="mt-1 w-full resize-none rounded-lg border border-neutral-200 p-2 text-xs outline-none focus:border-[#0F3D3A]" />
                      )}
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
                      <label className="mb-1 block text-[11px] font-medium text-neutral-500">Básicas</label>
                      <div className="grid grid-cols-3 gap-1">
                        {SHAPE_TYPES.slice(0, 5).map((t) => (
                          <button key={t.value} onClick={() => upd({ shapeType: t.value })}
                            className={`rounded-lg border py-1.5 text-[10px] transition ${c?.shapeType === t.value ? "border-[#0F3D3A] bg-[#0F3D3A] text-white" : "border-neutral-200 text-neutral-500"}`}>
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <label className="block text-[11px] font-medium text-neutral-500">Decorativos</label>
                        <span className="text-[10px] text-neutral-400">figuras más editoriales</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {SHAPE_TYPES.filter((t) => DECORATIVE_SHAPE_TYPES.includes(t.value)).map((t) => (
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
                    {isBorderFriendlyShape(c?.shapeType ?? "rectangle") && (
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
                  <button onClick={() => handleMoveLayer(selectedItem.id, "forward")}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-neutral-200 py-1.5 text-xs text-neutral-600 transition hover:bg-neutral-50">
                    <ChevronUp className="h-3 w-3" /> Subir capa
                  </button>
                  <button onClick={() => handleMoveLayer(selectedItem.id, "backward")}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-neutral-200 py-1.5 text-xs text-neutral-600 transition hover:bg-neutral-50">
                    <ChevronDown className="h-3 w-3" /> Bajar capa
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

        <Dialog open={Boolean(mobileEditingTextItem)} onOpenChange={handleMobileTextEditorOpenChange}>
          <DialogContent className="max-w-[calc(100%-1.5rem)] rounded-[24px] p-0 sm:max-w-lg" showCloseButton={false}>
            <div className="overflow-hidden rounded-[24px]">
              <DialogHeader className="border-b border-neutral-100 px-4 py-4 text-left">
                <DialogTitle className="text-base text-neutral-900">Editar texto</DialogTitle>
                <DialogDescription className="text-xs leading-relaxed text-neutral-500">
                  Escribe con comodidad en esta caja y confirma cuando quieras ver el resultado final en el canvas.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 px-4 py-4">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-neutral-500">Contenido</label>
                  <textarea
                    autoFocus
                    value={mobileTextEditorDraft}
                    onChange={(e) => setMobileTextEditorDraft(e.target.value)}
                    rows={7}
                    className="min-h-[180px] w-full resize-none rounded-2xl border border-neutral-200 px-3 py-3 text-sm leading-relaxed outline-none focus:border-[#0F3D3A]"
                    placeholder="Escribe aquí tu texto..."
                  />
                </div>

                <div className="rounded-[22px] border border-[#0F3D3A]/10 bg-[linear-gradient(180deg,#fffdf9_0%,#f7f3ec_100%)] p-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">Vista previa</p>
                  <div
                    className="min-h-[120px] whitespace-pre-wrap break-words rounded-[18px] border border-white/80 bg-white/90 p-3 shadow-[0_10px_30px_rgba(15,61,58,0.08)]"
                    style={{
                      color: mobileEditingTextContent?.color || "#1a1a1a",
                      fontSize: Math.max(16, mobileEditingTextContent?.fontSize ?? 24),
                      fontFamily: mobileEditingTextContent?.fontFamily || "inherit",
                      fontWeight: mobileEditingTextContent?.fontWeight || "bold",
                      fontStyle: mobileEditingTextContent?.fontStyle || "normal",
                      letterSpacing: `${mobileEditingTextContent?.letterSpacing ?? 0}px`,
                      lineHeight: mobileEditingTextContent?.lineHeight ?? 1.2,
                      textAlign: mobileEditingTextContent?.textAlign || "left",
                    }}
                  >
                    {mobileTextEditorDraft.trim() || "La vista previa de tu texto aparecerá aquí."}
                  </div>
                </div>
              </div>

              <DialogFooter className="border-t border-neutral-100 px-4 py-4">
                <button
                  onClick={() => setEditingTextId(null)}
                  className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => void handleMobileTextEditorConfirm()}
                  className="rounded-xl bg-[#0F3D3A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#14544f]"
                >
                  Confirmar texto
                </button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        <div className="fixed inset-x-3 bottom-3 z-40 md:hidden">
          <FloatingActionDock
            variant="editorial"
            actions={[
              {
                key: "select",
                label: "Mover",
                icon: MousePointer2,
                active: activeTool === "select" && mobilePanel !== "properties",
                onClick: () => {
                  setActiveTool("select");
                  setMobilePanel("tools");
                },
              },
              {
                key: "text",
                label: "Texto",
                icon: Type,
                active: activeTool === "text",
                onClick: () => {
                  setActiveTool("text");
                  setMobilePanel("tools");
                },
              },
              {
                key: "shape",
                label: "Forma",
                icon: Square,
                active: activeTool === "shape",
                onClick: () => {
                  setActiveTool("shape");
                  setMobilePanel("tools");
                },
              },
              {
                key: "image",
                label: "Imagen",
                icon: ImageIcon,
                active: activeTool === "image",
                onClick: () => {
                  setActiveTool("image");
                  setMobilePanel("tools");
                },
              },
              {
                key: "decor",
                label: "Decor",
                icon: Sparkles,
                active: activeTool === "decor",
                onClick: () => {
                  setActiveTool("decor");
                  setMobilePanel("tools");
                },
              },
              {
                key: "props",
                label: "Editar",
                icon: selectedItem ? AlignHorizontalJustifyCenter : Grid3x3,
                active: mobilePanel === "properties",
                onClick: () => setMobilePanel("properties"),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}





