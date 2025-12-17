"use client";

import { Button } from "@/components/ui/button";

export default function ProductInfo({
  nombre,
  descripcion,
  precio
}: {
  nombre: string;
  descripcion?: string | null;
  precio: any;
}) {
  const precioNumber = Number(precio || 0);

  function handleAddToCart() {
    console.log("🛒 Agregado al carrito");
  }

  function handleBuyNow() {
    console.log("⚡ Comprar ahora");
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
        <Button
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold"
          onClick={handleBuyNow}
        >
          Comprar ahora
        </Button>

        <Button variant="outline" className="w-full font-semibold" onClick={handleAddToCart}>
          Añadir al carrito
        </Button>
      </div>
    </section>
  );
}
