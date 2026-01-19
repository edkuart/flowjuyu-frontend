"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function ProductInfo({
  nombre,
  descripcion,
  precio,
  productId,
  imagen_principal,
}: {
  nombre: string;
  descripcion?: string | null;
  precio: any;
  productId: string;
  imagen_principal?: string | null;
}) {
  const { addItem } = useCart();
  const router = useRouter();

  const precioNumber = Number(precio || 0);

  // ⚪ Añadir al carrito (NO navega)
  function handleAddToCart() {
    addItem({
      id: productId,
      name: nombre,
      price: Number(precioNumber), // 🔒 blindado
      image: imagen_principal || "/images/categorias/default.jpg",
    });
  }

  // 🟠 Comprar ahora (agrega + navega)
  function handleBuyNow() {
    addItem({
      id: productId,
      name: nombre,
      price: Number(precioNumber), // 🔒 blindado
      image: imagen_principal || "/images/categorias/default.jpg",
    });

    router.push("/carrito");
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900">{nombre}</h1>

      <p className="text-2xl font-semibold text-neutral-700">
        Q{precioNumber.toFixed(2)}
      </p>

      <p className="text-neutral-600 leading-relaxed">
        {descripcion || "Sin descripción disponible"}
      </p>

      <div className="space-y-3">
        {/* 🟠 COMPRAR AHORA */}
        <Button
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold"
          onClick={handleBuyNow}
        >
          Comprar ahora
        </Button>

        {/* ⚪ AÑADIR AL CARRITO */}
        <Button
          variant="outline"
          className="w-full font-semibold"
          onClick={handleAddToCart}
        >
          Añadir al carrito
        </Button>
      </div>
    </section>
  );
}
