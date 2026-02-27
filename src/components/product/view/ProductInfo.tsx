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
  rating_avg = 0,
  rating_count = 0,

  sellerId,
  sellerWhatsapp,
  sellerPlan,
  sellerPlanActivo,

}: {
  nombre: string;
  descripcion?: string | null;
  precio: any;
  productId: string;
  imagen_principal?: string | null;
  rating_avg?: number;
  rating_count?: number;

  sellerId?: number;
  sellerWhatsapp?: string | null;
  sellerPlan?: "free" | "founder";
  sellerPlanActivo?: boolean;
}) {
  const { addItem } = useCart();
  const router = useRouter();

  const precioNumber = Number(precio || 0);

  /* =====================================================
     🟢 WHATSAPP VISIBILITY (FOUNDER ONLY)
  ===================================================== */
  const showWhatsapp =
    !!sellerWhatsapp &&
    sellerPlan === "founder" &&
    sellerPlanActivo === true;

  /* =====================================================
     🛒 CART ACTIONS
  ===================================================== */
  function handleAddToCart() {
    addItem({
      id: productId,
      name: nombre,
      price: Number(precioNumber),
      image: imagen_principal || "/images/categorias/default.jpg",
    });
  }

  function handleBuyNow() {
    addItem({
      id: productId,
      name: nombre,
      price: Number(precioNumber),
      image: imagen_principal || "/images/categorias/default.jpg",
    });

    router.push("/carrito");
  }

  /* =====================================================
     💬 WHATSAPP ACTION + TRACKING
  ===================================================== */
  async function handleWhatsappClick() {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/intentions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: productId,
            seller_id: sellerId,
            source: "product_whatsapp",
          }),
        }
      );

      const mensaje = `
Hola 👋

Estoy interesado en el producto "${nombre}" que vi en Flowjuyu.

¿Sigue disponible?
      `.trim();

      const url = `https://wa.me/${sellerWhatsapp}?text=${encodeURIComponent(
        mensaje
      )}`;

      window.open(url, "_blank");
    } catch (error) {
      // fallback si falla el tracking
      window.open(`https://wa.me/${sellerWhatsapp}`, "_blank");
    }
  }

  /* =====================================================
     🎨 RENDER
  ===================================================== */
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-900">{nombre}</h1>

      <p className="text-2xl font-semibold text-neutral-700">
        Q{precioNumber.toFixed(2)}
      </p>

      {/* ⭐ Rating */}
      {rating_count > 0 ? (
        <div className="flex items-center gap-2">
          <div className="flex text-yellow-500 text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>
                {i < Math.round(rating_avg) ? "★" : "☆"}
              </span>
            ))}
          </div>

          <span className="text-sm text-neutral-600">
            {rating_avg.toFixed(1)} ({rating_count} reseñas)
          </span>
        </div>
      ) : (
        <p className="text-sm text-neutral-400">
          Sin reseñas todavía
        </p>
      )}

      <p className="text-neutral-600 leading-relaxed">
        {descripcion || "Sin descripción disponible"}
      </p>

      {/* =====================================================
         ACTION BUTTONS
      ===================================================== */}
      <div className="space-y-3">

        {/* Comprar ahora */}
        <Button
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold"
          onClick={handleBuyNow}
        >
          Comprar ahora
        </Button>

        {/* Añadir carrito */}
        <Button
          variant="outline"
          className="w-full font-semibold"
          onClick={handleAddToCart}
        >
          Añadir al carrito
        </Button>

        {/* WhatsApp Founder */}
        {showWhatsapp && (
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
            onClick={handleWhatsappClick}
          >
            💬 Comprar por WhatsApp
          </Button>
        )}

      </div>
    </section>
  );
}