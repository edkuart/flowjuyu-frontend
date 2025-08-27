'use client'

import { Product } from "@/types/product"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Props {
  product: Product
  canEdit?: boolean   
}

export function ProductCard({ product, canEdit = false }: Props) {
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
      <p className="text-muted-foreground text-sm line-clamp-2">
        {product.description}
      </p>

      <p className="text-primary font-bold text-lg">
        Q{product.price.toFixed(2)}
      </p>

      <p className="text-xs text-muted-foreground">
        Vendido por {product.seller.name}
      </p>

      {/* Botones */}
      <div className="flex gap-2">
        <Button variant="default" className="flex-1">
          Ver detalles
        </Button>

        {canEdit && (
          <Link href={`/seller/products/${product.id}/edit`} className="flex-1">
            <Button variant="outline" className="w-full">
              Editar
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
