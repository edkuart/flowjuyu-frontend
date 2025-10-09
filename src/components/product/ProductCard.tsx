"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Product } from "@/types/product"

interface Props {
  product: Product
  canEdit?: boolean
  onAddToCart?: (p: Product) => void // opcional si luego usas un CartContext
}

function formatPrice(v: number | string) {
  const n = typeof v === "string" ? Number(v) : v
  return Number.isFinite(n) ? `Q${n.toFixed(2)}` : "Q0.00"
}

export function ProductCard({ product, canEdit = false, onAddToCart }: Props) {
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const addToCart = () => {
    try {
      setAdding(true)

      if (onAddToCart) {
        onAddToCart(product)
      } else {
        // carrito simple en localStorage
        const raw = localStorage.getItem("cart")
        const cart: any[] = raw ? JSON.parse(raw) : []
        const idx = cart.findIndex((i) => String(i.id) === String(product.id))

        if (idx >= 0) {
          cart[idx].qty = (cart[idx].qty || 1) + 1
        } else {
          cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image ?? "/images/placeholder.jpg",
            qty: 1,
          })
        }
        localStorage.setItem("cart", JSON.stringify(cart))
        // notifica por si tu header escucha y actualiza el badge
        window.dispatchEvent(new CustomEvent("cart:update", { detail: cart }))
      }

      setAdded(true)
      setTimeout(() => setAdded(false), 1200)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="group rounded-2xl border bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Imagen rectangular responsiva */}
      <div className="relative aspect-[4/5] w-full bg-muted overflow-hidden">
        <Image
          src={product.image || "/images/placeholder.jpg"}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
        />
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-base font-semibold leading-tight line-clamp-2">
          {product.title}
        </h3>

        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold">
            {formatPrice(product.price)}
          </span>
          {product.seller?.name && (
            <span className="text-xs text-muted-foreground">
              Vendido por {product.seller.name}
            </span>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="p-4 pt-0 flex gap-2">
        <Link href={`/producto/${product.id}`} className="w-1/2">
          <Button variant="outline" className="w-full">
            Ver detalles
          </Button>
        </Link>

        <Button onClick={addToCart} disabled={adding} className="w-1/2">
          {added ? "Agregado ✓" : adding ? "Agregando…" : "Agregar"}
        </Button>
      </div>

      {canEdit && (
        <div className="px-4 pb-4">
          <Link href={`/seller/products/${product.id}/edit`} className="block">
            <Button variant="secondary" className="w-full">
              Editar
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
