//src/components/ui/ProductCard.tsx

import Link from "next/link";
import FallbackImg from "@/components/FallbackImg";

type Product = {
  id: string;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
  total_reviews?: number;
  rating_avg?: number;
};

type Props = {
  product: Product;
  showRating?: boolean;
};

export default function ProductCard({ product, showRating }: Props) {
  const renderStars = (rating: number) => {
    const full = Math.round(Math.max(0, Math.min(5, rating)));

    return (
      <span className="text-sm text-yellow-600">
        {"★".repeat(full)}
        <span className="text-gray-300">
          {"★".repeat(5 - full)}
        </span>
      </span>
    );
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className="group rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="overflow-hidden">
        <FallbackImg
          src={product.imagen_url}
          fallback="/images/productos/default.jpg"
          alt={product.nombre}
          className="h-52 w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-medium text-neutral-900 truncate group-hover:text-orange-600 transition-colors">
          {product.nombre}
        </h3>

        <p className="text-neutral-700 font-semibold">
          Q{Number(product.precio).toFixed(2)}
        </p>

        {showRating && product.rating_avg !== undefined && (
          <div className="flex items-center justify-between">
            {renderStars(Number(product.rating_avg))}
            <span className="text-xs text-gray-500">
              ({Number(product.total_reviews ?? 0)})
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
