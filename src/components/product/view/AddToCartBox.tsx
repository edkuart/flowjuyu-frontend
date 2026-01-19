"use client";

import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";

type Props = {
  product: {
    id: string;
    nombre: string;
    precio: number;
    imagen_principal?: string | null;
    stock?: number | null;
  };
};

export default function AddToCartBox({ product }: Props) {
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.nombre,
      price: product.precio,
      image: product.imagen_principal ?? undefined,
    });
  };

  const sinStock = typeof product.stock === "number" && product.stock <= 0;

  return (
    <div className="mt-6 space-y-3">
      <button
        onClick={handleAdd}
        disabled={sinStock}
        className={`
          w-full flex items-center justify-center gap-2
          rounded-lg px-4 py-3 text-sm font-semibold
          transition
          ${
            sinStock
              ? "bg-gray-300 cursor-not-allowed text-gray-600"
              : "bg-black text-white hover:bg-zinc-800"
          }
        `}
      >
        <ShoppingCart className="w-4 h-4" />
        {sinStock ? "Sin stock" : "Agregar al carrito"}
      </button>

      {!sinStock && (
        <p className="text-xs text-zinc-500 text-center">
          Se agregará 1 unidad al carrito
        </p>
      )}
    </div>
  );
}
