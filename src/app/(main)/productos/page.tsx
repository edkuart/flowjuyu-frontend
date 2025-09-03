import { ProductCard } from "@/components/product/ProductCard"
import { Product } from "@/types/product"

const mockProducts: Product[] = [
  {
    id: "1",
    title: "Manzanas Orgánicas",
    description: "Deliciosas manzanas frescas de productores locales.",
    price: 15.5,
    image: "https://via.placeholder.com/400x400",
    seller: { name: "Finca El Rosario" }
  },
  {
    id: "2",
    title: "Queso artesanal",
    description: "Queso de cabra elaborado sin conservantes.",
    price: 25,
    image: "https://via.placeholder.com/400x400",
    seller: { name: "Quesería San Luis" }
  }
]

export default function ProductosPage() {
  return (
    <main className="min-h-screen p-6 bg-muted">
      <section className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Catálogo de productos</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {mockProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  )
}
