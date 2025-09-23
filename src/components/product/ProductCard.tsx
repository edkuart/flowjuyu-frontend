// src/components/product/ProductCard.tsx
'use client'

import { Product } from "@/types/product"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Props {
  product: Product
  onAddToCart?: (p: Product) => void
}

export function ProductCard({ product, onAddToCart }: Props) {
  return (
    <div className="border rounded-xl p-4 shadow-sm space-y-2 bg-white dark:bg-zinc-900 hover:shadow-md transition">
      {/* Imagen del producto */}
      <Link href={`/producto/${product.id}`}>
        <div className="relative aspect-square w-full overflow-hidden rounded-lg">
          <Image
            src={product.image || "/placeholder.png"}
            alt={product.title}
            fill
            className="object-cover"
          />
        </div>
      </Link>

      {/* Información básica */}
      <h3 className="text-lg font-semibold">{product.title}</h3>
      {product.category && (
        <p className="text-xs text-gray-500">Categoría: {product.category}</p>
      )}
      <p className="text-muted-foreground text-sm line-clamp-2">
        {product.description}
      </p>
      <p className="text-primary font-bold text-lg">
        Q{product.price.toFixed(2)}
      </p>
      <p className="text-xs text-muted-foreground">
        Vendido por {product.seller?.name}
      </p>

      {/* Acciones */}
      <div className="flex gap-2 mt-2">
        <Link href={`/producto/${product.id}`} className="w-full">
          <Button variant="default" className="w-full">
            Ver detalles
          </Button>
        </Link>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => onAddToCart?.(product)}
        >
          Agregar al carrito
        </Button>
      </div>
    </div>
  )
}
