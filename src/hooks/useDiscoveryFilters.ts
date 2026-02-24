"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";

export function useDiscoveryFilters() {
  const params = useSearchParams();
  const router = useRouter();

  const filters = useMemo(() => ({
    categoriaId: params.get("categoria_id")
      ? Number(params.get("categoria_id"))
      : null,

    precioMin: Number(params.get("precioMin") || 0),
    precioMax: Number(params.get("precioMax") || 2000),

    sort: params.get("sort") || "",
    departamento: params.get("departamento") || "",
    municipio: params.get("municipio") || "",
  }), [params]);

  function setFilter(key: string, value: string | number | null) {
    const p = new URLSearchParams(params.toString());

    if (value === null || value === "" || value === 0) {
      p.delete(key);
    } else {
      p.set(key, String(value));
    }

    router.replace(`?${p.toString()}`, { scroll: false });
  }

  function resetFilters() {
    router.replace("?", { scroll: false });
  }

  return { filters, setFilter, resetFilters };
}