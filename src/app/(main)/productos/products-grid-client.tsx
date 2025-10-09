"use client"

import { useMemo, useState } from "react"
import { ProductCard } from "@/components/product/ProductCard"
import type { Product } from "@/types/product"

type P = {
  initialProducts: (Product & { createdAt?: string })[]
  categories?: string[]
}

type Sort = "price_asc" | "price_desc" | "newest"

function getCategory(p: any): string | undefined {
  let cat: any =
    p?.category ??
    p?.categoryName ??
    p?.categoria ??
    p?.category_id ??
    p?.categoryId

  if (Array.isArray(cat)) {
    cat = cat[0]
  }
  if (cat && typeof cat === "object" && "name" in cat) {
    cat = cat.name
  }
  return cat != null ? String(cat) : undefined
}

export default function ProductsGridClient({ initialProducts, categories }: P) {
  const baseStats = useMemo(() => {
    const prices = initialProducts.map((p) => Number(p.price)).filter(Number.isFinite)
    const min = prices.length ? Math.min(...prices) : 0
    const max = prices.length ? Math.max(...prices) : 0
    return { min, max }
  }, [initialProducts])

  const inferredCategories = useMemo(() => {
    if (categories && categories.length) return categories
    const set = new Set<string>()
    for (const p of initialProducts) {
      const c = getCategory(p)
      if (c) set.add(c)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [initialProducts, categories])

  const [minPrice, setMinPrice] = useState<number>(baseStats.min)
  const [maxPrice, setMaxPrice] = useState<number>(baseStats.max)
  const [sort, setSort] = useState<Sort>("newest")
  const [search, setSearch] = useState<string>("")
  const [category, setCategory] = useState<string>("__all")

  const filtered = useMemo(() => {
    let list = initialProducts.filter((p) => {
      const price = Number(p.price)
      const okPrice = price >= minPrice && price <= maxPrice

      const okSearch =
        !search.trim() ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.description ?? "").toLowerCase().includes(search.toLowerCase())

      const prodCat = getCategory(p)
      const okCategory = category === "__all" || (prodCat && prodCat === category)

      return okPrice && okSearch && okCategory
    })

    switch (sort) {
      case "price_asc":
        list = list.slice().sort((a, b) => Number(a.price) - Number(b.price))
        break
      case "price_desc":
        list = list.slice().sort((a, b) => Number(b.price) - Number(a.price))
        break
      case "newest":
        list = list
          .slice()
          .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
        break
    }
    return list
  }, [initialProducts, minPrice, maxPrice, sort, search, category])

  const clampMin = (v: number) => Math.min(Math.max(v, baseStats.min), maxPrice)
  const clampMax = (v: number) => Math.max(Math.min(v, baseStats.max), minPrice)

  return (
<div className="flex flex-col md:flex-row gap-6 w-full items-start">
        {/* Sidebar filtros */}
      <aside className="bg-white rounded-xl border p-4 space-y-4">
        <h2 className="font-semibold text-lg">Filtros</h2>

        <div className="space-y-1">
          <label className="text-sm text-gray-600">Buscar</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Nombre o descripción…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-600">Categoría</label>
          <select
            className="w-full border rounded-lg px-3 py-2 bg-white"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="__all">Todas</option>
            {inferredCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Precio</span>
            <span className="text-sm font-medium">
              Q{minPrice.toFixed(2)} – Q{maxPrice.toFixed(2)}
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              min={baseStats.min}
              max={maxPrice}
              value={minPrice}
              onChange={(e) => setMinPrice(clampMin(Number(e.target.value)))}
              className="w-1/2 border rounded-lg px-2 py-1"
            />
            <input
              type="number"
              min={minPrice}
              max={baseStats.max}
              value={maxPrice}
              onChange={(e) => setMaxPrice(clampMax(Number(e.target.value)))}
              className="w-1/2 border rounded-lg px-2 py-1"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min={baseStats.min}
              max={baseStats.max}
              value={minPrice}
              onChange={(e) => setMinPrice(clampMin(Number(e.target.value)))}
              className="w-full"
            />
            <input
              type="range"
              min={baseStats.min}
              max={baseStats.max}
              value={maxPrice}
              onChange={(e) => setMaxPrice(clampMax(Number(e.target.value)))}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-600">Ordenar por</label>
          <select
            className="w-full border rounded-lg px-3 py-2 bg-white"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
          >
            <option value="newest">Más recientes</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
          </select>
        </div>

        <button
          onClick={() => {
            setSearch("")
            setMinPrice(baseStats.min)
            setMaxPrice(baseStats.max)
            setSort("newest")
            setCategory("__all")
          }}
          className="w-full mt-2 rounded-lg bg-gray-100 hover:bg-gray-200 px-3 py-2 text-sm font-medium"
        >
          Limpiar filtros
        </button>
      </aside>

      {/* Grid de productos */}
      <div className="w-full">
        {filtered.length === 0 ? (
          <p className="text-gray-500">No hay productos que cumplan el filtro.</p>
        ) : (
          <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(250px,1fr))] w-full">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
