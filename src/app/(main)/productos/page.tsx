import ProductsGridClient from "./products-grid-client"
import { Product } from "@/types/product"

type Raw = {
  id: string | number
  nombre: string
  descripcion?: string | null
  precio: string | number
  imagen_url?: string | null
  created_at?: string | null
  vendedor_nombre?: string | null
}

const CANDIDATE_BASES = [
  process.env.BACKEND_URL,
  process.env.NEXT_PUBLIC_API_BASE,
  "http://localhost:8800",
].filter(Boolean) as string[]

const CANDIDATE_PREFIXES = [
  process.env.BACKEND_PREFIX ?? "",
  "/api",
  "",
]

async function fetchProductos(): Promise<Product[]> {
  for (const base of CANDIDATE_BASES) {
    for (const rawPrefix of CANDIDATE_PREFIXES) {
      const prefix = rawPrefix.replace(/\/+$/, "")
      const url = `${base}${prefix}/productos`

      const res = await fetch(url, { cache: "no-store" })
      const ct = res.headers.get("content-type") || ""
      if (!ct.includes("application/json")) continue

      const json = await res.json()
      if (!res.ok || !json?.ok) continue

      return (json.data as Raw[]).map((p) => ({
        id: String(p.id),
        title: p.nombre,
        description: p.descripcion ?? "",
        price: Number(p.precio),
        image: p.imagen_url?.startsWith("http")
        ? p.imagen_url
        : p.imagen_url
        ? `${base}/${p.imagen_url.replace(/^\/+/, "")}`
        : "/images/placeholder.jpg",
        seller: { name: p.vendedor_nombre ?? "Vendedor" },
        createdAt: p.created_at ?? "",
      }))
    }
  }
  return []
}

export default async function ProductosPage() {
  const productos = await fetchProductos()

  return (
    <main className="min-h-screen p-6 bg-muted">
      <section className="w-full max-w-screen-2xl mx-auto px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-6">Productos</h1>
        <ProductsGridClient initialProducts={productos} />
      </section>
    </main>
  )
}
