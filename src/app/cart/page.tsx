"use client";

import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, subtotal, setQty, removeItem, clear } = useCart();

  if (items.length === 0) {
    return (
      <p className="text-center mt-10">
        Tu carrito está vacío 🛒
      </p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Carrito</h1>

      {items.map((it) => (
        <div
          key={it.id}
          className="flex items-center gap-4 border p-4 rounded"
        >
          <Image
            src={it.image || "/images/categorias/default.jpg"} // ✅ FIX
            alt={it.name}
            width={80}
            height={80}
            className="rounded"
          />

          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{it.name}</div>
            <div className="text-xs text-zinc-500">
              Q {Number(it.price).toFixed(2)} {/* ✅ FIX */}
            </div>

            <div className="mt-3 inline-flex items-center gap-2">
              <button
                className="px-2 h-7 border rounded"
                onClick={() => setQty(it.id, it.qty - 1)}
              >
                −
              </button>

              <span className="text-sm w-7 text-center">
                {it.qty}
              </span>

              <button
                className="px-2 h-7 border rounded"
                onClick={() => setQty(it.id, it.qty + 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="text-right">
            <div className="font-bold">
              Q {(it.qty * Number(it.price)).toFixed(2)}
            </div>
            <button
              onClick={() => removeItem(it.id)}
              className="text-xs text-red-500"
            >
              Quitar
            </button>
          </div>
        </div>
      ))}

      <div className="border-t pt-4 flex justify-between">
        <span className="font-bold">Total</span>
        <span className="font-bold">
          Q {subtotal.toFixed(2)}
        </span>
      </div>

      <button
        onClick={clear}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Vaciar carrito
      </button>
    </div>
  );
}
