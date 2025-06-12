import { getProductById } from "@/lib/mock-products"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface PageProps {
  params: { id: string }
}

export default function ProductDetailPage({ params }: PageProps) {
  const product = getProductById(params.id)

  if (!product) return notFound()

  return (
    <main className="min-h-screen p-6 bg-muted">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm">
        <div className="relative aspect-square w-full rounded-lg overflow-hidden">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <p className="text-muted-foreground">{product.description}</p>
          <p className="text-lg font-semibold text-primary">Q{product.price.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">Vendido por {product.seller.name}</p>
          <Button size="lg" className="mt-4 w-full">Agregar al carrito</Button>
        </div>
      </div>
    </main>
  )
}
