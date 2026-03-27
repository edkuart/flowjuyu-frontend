// src/hooks/prefetch.ts
//
// Fire-and-forget cache warming. Call on Link hover or route transitions
// to populate the apiFetch cache before the destination component mounts.
//
// Usage:
//   <Link href="/categorias" onMouseEnter={() => prefetch("/api/categorias")}>

import { apiFetch } from "@/lib/api";

export function prefetch(url: string): void {
  apiFetch(url).catch(() => {});
}
