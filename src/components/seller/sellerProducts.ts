const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800'

export async function fetchMyProductsPreview() {
  const res = await fetch(`${API}/api/seller/products?limit=6`, {
    credentials: 'include',
  })

  if (!res.ok) {
    throw new Error('Error obteniendo productos del vendedor')
  }

  return res.json()
}
