import Image from "next/image"
import Link from "next/link"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

async function fetchStore(id: string) {
  const res = await fetch(`${API}/api/public/seller/${id}`, {
    cache: "no-store",
  })

  if (!res.ok) return null
  return res.json()
}

export default async function StorePage({
  params,
}: {
  params: { id: string }
}) {
  const data = await fetchStore(params.id)

  if (!data) {
    return (
      <div className="container mx-auto py-20 text-center">
        Tienda no encontrada
      </div>
    )
  }

  const { seller, products } = data

  return (
    <div className="container mx-auto px-4 py-12 space-y-10">

      {/* HEADER TIENDA */}
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24 rounded-full overflow-hidden border">
          <Image
            src={seller.logo || "/placeholder.jpg"}
            alt={seller.nombre_comercio}
            fill
            className="object-cover"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold">{seller.nombre_comercio}</h1>
          <p className="text-neutral-600">{seller.descripcion}</p>
          <p className="text-sm text-neutral-500 mt-1">
            📍 {seller.municipio}, {seller.departamento}
          </p>
          <p className="text-sm mt-1">
            ⭐ {seller.rating_avg} ({seller.rating_count} reseñas)
          </p>
        </div>
      </div>

      {/* PRODUCTOS */}
      <div>
        <h2 className="text-xl font-semibold mb-6">
          Productos del vendedor
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((p: any) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="relative h-56">
                <Image
                  src={p.imagen_url || "/placeholder.jpg"}
                  alt={p.nombre}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-4">
                <p className="font-medium">{p.nombre}</p>
                <p className="text-sm text-neutral-600">
                  Q{Number(p.precio).toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
