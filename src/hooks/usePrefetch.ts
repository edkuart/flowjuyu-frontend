// src/hooks/usePrefetch.ts
//
// Debounced prefetch for hover-intent navigation.
//
// Fires apiFetch (which populates the cache) only after the pointer
// has rested on the element for DELAY_MS. Cancelled if the pointer
// leaves before the timer fires — prevents noise from fast sweeps.
//
// Usage:
//   const prefetchHandlers = usePrefetch(`/api/products/${product.id}`);
//   <Link {...prefetchHandlers} href="...">

import { useCallback, useRef } from "react";
import { prefetch } from "./prefetch";

const DELAY_MS = 150;

export function usePrefetch(url: string) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onMouseEnter = useCallback(() => {
    timer.current = setTimeout(() => prefetch(url), DELAY_MS);
  }, [url]);

  const onMouseLeave = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  return { onMouseEnter, onMouseLeave } as const;
}
