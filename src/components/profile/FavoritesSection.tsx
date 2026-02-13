// src/components/profile/FavoritesSection.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  userId: string
}

interface Product {
  id: string
  name: string
  image: string
  price: number
}

export default function FavoritesSection({ userId }: Props) {
  const [favorites, setFavorites] = useState<Product[]>([])

  useEffect(() => {
    // Lógica para obtener favoritos desde API
    setFavorites([
      {
        id: 'p1',
        name: 'Huipil artesanal',
        image: '/productos/huipil.jpg',
        price: 220,
      },
    ])
  }, [userId])

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Favoritos</h2>
      {favorites.length === 0 ? (
        <p className="text-sm text-muted-foreground">No has marcado productos como favoritos.</p>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {favorites.map((product) => (
            <li key={product.id} className="border rounded p-3">
              <Link href={`/producto/${product.id}`}>
                <Image
                  src={product.image}
                  alt={product.name}
                  width={200}
                  height={200}
                  className="w-full h-40 object-cover rounded"
                />
                <p className="mt-2 text-sm font-medium truncate">{product.name}</p>
                <p className="text-sm text-muted-foreground">Q{product.price.toFixed(2)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
