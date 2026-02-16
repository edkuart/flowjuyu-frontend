const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

export async function fetchMyProductsPreview() {
  if (typeof window === "undefined") {
    return []
  }

  const token = window.localStorage.getItem("token")

  if (!token) {
    throw new Error("No hay token disponible")
  }

  const res = await fetch(`${API}/api/seller/products`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error("Error obteniendo productos del vendedor")
  }

  const data = await res.json()

  return (data || [])
    .filter((p: any) => p.activo === true)
    .slice(0, 6)
    .map((p: any) => ({
      id: p.id,
      nombre: p.nombre,
      precio: Number(p.precio),
      imagen_url: p.imagen_url ?? null,
    }))
}
