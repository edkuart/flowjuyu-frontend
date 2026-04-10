// src/components/product/productGrid.config.ts
//
// Grid layout configurations for every context where product cards appear.
//
// HOW TO USE
//   import { PRODUCT_GRID } from "@/components/product/productGrid.config";
//   <div className={PRODUCT_GRID.home}>
//
// HOW TO ADD A NEW GRID
//   Add a new key below. Never write grid classes inline in a section component.
//
// COLUMN SCALE
//   All grids follow a mobile-first 2-column base.
//   Column counts increase progressively with breakpoints.
//
// GAP SCALE
//   gap-4  (16px) — default, used in most grids
//   gap-6  (24px) — only when cards have more breathing room (home featured)

export const PRODUCT_GRID = {
  /**
   * Home section grids — trending, recommended.
   * 4 columns on md+. Max 4 items shown.
   */
  home: "grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6",

  /**
   * New arrivals section — 3 columns on md+.
   * Designed for exactly 3 items.
   */
  new: "grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6",

  /**
   * Store / seller catalog — dense grid for browsing.
   * Expands to 5–6 columns on large screens.
   */
  store: "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6",

  /**
   * Product detail related items — 4 columns, no gap increase on desktop.
   */
  related: "grid grid-cols-2 gap-4 sm:grid-cols-4",

  /**
   * Full catalog / discovery page — medium density, 5 columns max.
   */
  catalog:
    "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
} as const satisfies Record<string, string>;

export type ProductGridKey = keyof typeof PRODUCT_GRID;
