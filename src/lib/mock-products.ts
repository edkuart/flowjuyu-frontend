import { Product } from "@/types/product"

export const mockProducts: Product[] = [
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

export function getProductById(id: string): Product | undefined {
  return mockProducts.find(p => p.id === id)
}
