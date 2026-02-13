"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, Pencil, Trash2 } from "lucide-react";

type Review = {
  id: string;
  producto: {
    nombre: string;
    imagen_url: string;
  };
  rating: number;
  comentario: string;
  fecha: string;
};

export default function BuyerReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulación temporal hasta conectar backend
    const fake = [
      {
        id: "1",
        producto: {
          nombre: "Corte típico azul",
          imagen_url: "/images/demo-product.jpg"
        },
        rating: 5,
        comentario: "Excelente calidad, llegó rápido!",
        fecha: "2025-01-14"
      },
      {
        id: "2",
        producto: {
          nombre: "Huipil bordado artesanal",
          imagen_url: "/images/demo-product2.jpg"
        },
        rating: 4,
        comentario: "Muy bonito aunque esperaba un poco más gruesa la tela.",
        fecha: "2025-01-10"
      }
    ];

    setTimeout(() => {
      setReviews(fake);
      setLoading(false);
    }, 400);
  }, []);

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-2xl font-bold">Mis opiniones</h1>
        <p className="text-muted-foreground">
          Aquí podrás ver y editar las reseñas que has dejado en tus compras.
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-muted-foreground">Cargando opiniones...</p>
      )}

      {/* VACÍO */}
      {!loading && reviews.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <div className="text-6xl">📝</div>
          <p className="text-lg font-medium">Aún no has dejado opiniones</p>
          <p className="text-sm text-muted-foreground">
            Cuando compres un producto podrás compartir tu experiencia.
          </p>

          <Link href="/buyer/orders">
            <Button className="bg-zinc-900 text-white hover:bg-zinc-800">
              Ir a mis pedidos
            </Button>
          </Link>
        </div>
      )}

      {/* LISTA DE RESEÑAS */}
      <div className="space-y-4">
        {!loading &&
          reviews.map((review) => (
            <div
              key={review.id}
              className="flex gap-4 border rounded-xl p-4 bg-white shadow-sm"
            >
              {/* IMAGEN */}
              <div className="w-20 h-20 rounded-lg overflow-hidden border">
                <Image
                  src={review.producto.imagen_url}
                  alt={review.producto.nombre}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              </div>

              {/* INFORMACIÓN */}
              <div className="flex-1 space-y-2">
                <p className="font-semibold text-zinc-800">
                  {review.producto.nombre}
                </p>

                {/* ESTRELLAS */}
                <div className="flex items-center gap-1 text-yellow-500">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>

                <p className="text-sm text-zinc-600">{review.comentario}</p>

                <p className="text-xs text-zinc-500">
                  {new Date(review.fecha).toLocaleDateString("es-GT")}
                </p>
              </div>

              {/* ACCIONES */}
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm">
                  <Pencil className="w-4 h-4 mr-1" /> Editar
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                </Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
