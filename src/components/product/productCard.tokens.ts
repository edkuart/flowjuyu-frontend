// src/components/product/productCard.tokens.ts
//
// Design tokens for the ProductCardV2 system.
//
// Every Tailwind class string used in ProductCardV2 and its subcomponents
// lives here. NO styling is written inline in the component file.
//
// HOW TO USE
//   import { CARD_TOKENS as T } from "./productCard.tokens";
//   className={T.shell.base}
//
// HOW TO EXTEND
//   1. Add a new key to the relevant section below.
//   2. Reference it in the component — never the reverse.
//
// PALETTE (for reference — do not import these as variables)
//   #0d2d20  Primary green (brand, prices, borders, badges)
//   #0d0d0b  Near-black text
//   #ede8e0  Warm sand (image background)
//   #faf7f2  Page background
//
// IMPORTANT: These are Tailwind class strings, not CSS variables.
// Tailwind must see the full class names to include them in the build.

import type { ProductCardVariant } from "@/types/productCard";

// ─── Card shell ───────────────────────────────────────────────────────────────

const shell = {
  /** Base structural + visual card wrapper */
  base: "overflow-hidden rounded-sm border border-[#0d2d20]/10 bg-white",
  /** Hover lift + shadow elevation */
  hover: "hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(13,45,32,0.10)]",
  /** Transition applied to the article element */
  transition: "transition-all duration-300",
  /** Applied to the Link wrapper when product is agotado */
  agotadoOpacity: "opacity-60",
} as const;

// ─── Image ────────────────────────────────────────────────────────────────────

const image = {
  /** Aspect ratio wrapper — always 4/5, no exceptions */
  wrapper: "relative aspect-[4/5] overflow-hidden bg-[#ede8e0]",
  /**
   * Applied to the Next/Image element.
   * object-cover is HARDCODED. No prop or token exists to change image fit.
   * If you need object-contain, you are building a different component.
   */
  base: "object-cover object-center",
  /** Scale animation on hover — only when product is NOT agotado */
  hoverScale: "group-hover:scale-[1.04]",
  /** Image transform transition */
  transition: "transition-transform duration-700",
  /** Absolute fallback when src errors */
  fallback: "/images/productos/default.jpg" as string,
  /** Responsive `sizes` defaults per variant */
  sizes: {
    default: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
    minimal: "(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw",
  } as Record<ProductCardVariant, string>,
} as const;

// ─── Badge overlay slots ──────────────────────────────────────────────────────
// StatusBadge and DiscoveryBadge handle their own positioning internally
// (variant="overlay" sets absolute top-3 left-3 z-10).
// These tokens are for the favorite button slot only.

const badge = {
  /** Positioning for the top-right favorite button slot */
  favoriteSlot:
    "absolute top-3 right-3 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100",
} as const;

// ─── Content area ─────────────────────────────────────────────────────────────

const content = {
  default: "space-y-[10px] p-4",
  minimal: "space-y-2 p-3",
} as const satisfies Record<ProductCardVariant, string>;

// ─── Typography ───────────────────────────────────────────────────────────────

const title = {
  base: "line-clamp-2 font-serif italic leading-snug text-[#0d0d0b]",
  /** Size per variant */
  size: {
    default: "text-[15px]",
    minimal: "text-[13px]",
  } as Record<ProductCardVariant, string>,
} as const;

const price = {
  base: "font-semibold tracking-wide text-[#0d2d20]",
  /** Size per variant */
  size: {
    default: "text-[13px]",
    minimal: "text-[12px]",
  } as Record<ProductCardVariant, string>,
  /** The "GTQ" currency suffix (default variant only) */
  suffix: "text-[10px] tracking-wide text-[#0d0d0b]/35",
  /** Wrapper to align price + suffix on baseline */
  wrapper: "flex items-baseline gap-2",
} as const;

const seller = {
  /** Seller name attribution line */
  name: "truncate text-[10px] tracking-[0.18em] text-[#0d0d0b]/40 uppercase",
} as const;

const rating = {
  wrapper: "flex items-center gap-[6px]",
  stars: "flex gap-[2px]",
  starFilled: "text-[#0d2d20]",
  starEmpty: "text-[#0d2d20]/20",
  count: "text-[11px] leading-none text-[#0d0d0b]/50",
} as const;

const cta = {
  /** "Ver pieza →" underline link */
  viewPiece:
    "inline-flex items-center gap-2 border-b border-[#0d2d20]/25 pb-[2px] text-[10px] tracking-[0.22em] text-[#0d2d20] uppercase transition-colors group-hover:border-[#0d2d20]/70",
  /** "Agotado" / not available label */
  agotadoLabel: "text-[10px] tracking-[0.22em] text-[#0d0d0b]/30 uppercase",
} as const;

// ─── Export ───────────────────────────────────────────────────────────────────
//
// INTERNAL USE ONLY — do not import CARD_TOKENS outside ProductCardV2.tsx.
// An ESLint rule in eslint.config.mjs enforces this boundary.
// To adjust card styling, edit this file directly.

export const CARD_TOKENS = {
  shell,
  image,
  badge,
  content,
  title,
  price,
  seller,
  rating,
  cta,
} as const;

export type CardTokens = typeof CARD_TOKENS;
