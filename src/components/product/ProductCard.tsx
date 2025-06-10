'use client'

import { Product } from "@/types/product"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface Props {
  product: Product
}

export function ProductCard({ product }: Props) {
  return (
    <div className="border rounded-xl p-4 shadow-sm space-y-2 bg-white dark:bg-zinc-900">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover"
        />
      </div>
      <h3 className="text-lg font-semibold">{product.title}</h3>
      <p className="text-muted-foreground text-sm line-clamp-2">{product.description}</p>
      <p className="text-primary font-bold text-lg">Q{product.price.toFixed(2)}</p>
      <p className="text-xs text-muted-foreground">Vendido por {product.seller.name}</p>
      <Button variant="default" className="w-full">Ver detalles</Button>
    </div>
  )
}
