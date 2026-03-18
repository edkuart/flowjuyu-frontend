import { getApiUrl } from "@/lib/config"
const API = getApiUrl()

// =====================================================
// 🔎 PREVIEW DASHBOARD (solo activos)
// =====================================================
export async function fetchMyProductsPreview() {
  if (typeof window === "undefined") return []

  const token = window.localStorage.getItem("token")
  if (!token) throw new Error("No hay token disponible")

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

// =====================================================
// 📦 LISTADO COMPLETO DEL VENDEDOR
// =====================================================
export async function fetchSellerProducts() {
  if (typeof window === "undefined") return []

  const token = window.localStorage.getItem("token")
  if (!token) throw new Error("No hay token disponible")

  const res = await fetch(`${API}/api/seller/products`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error("Error obteniendo productos")
  }

  return res.json()
}

// =====================================================
// 🔄 ACTIVAR / DESACTIVAR PRODUCTO
// =====================================================
export async function toggleProductActive(
  id: string,
  activo: boolean
) {
  if (typeof window === "undefined") return

  const token = window.localStorage.getItem("token")
  if (!token) throw new Error("No hay token disponible")

  const res = await fetch(`${API}/api/productos/${id}/activo`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ activo }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.message || "No se pudo actualizar estado")
  }

  return data
}
