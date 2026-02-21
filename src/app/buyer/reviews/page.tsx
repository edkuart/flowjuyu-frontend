"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, Pencil, Trash2, MessageSquareDashed, Loader2 } from "lucide-react";

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
        comentario: "Excelente calidad, llegó rápido! Los colores son súper vivos y la tela se siente muy resistente.",
        fecha: "2025-01-14"
      },
      {
        id: "2",
        producto: {
          nombre: "Huipil bordado artesanal",
          imagen_url: "/images/demo-product2.jpg"
        },
        rating: 4,
        comentario: "Muy bonito aunque esperaba un poco más gruesa la tela. De todas formas el diseño es precioso.",
        fecha: "2025-01-10"
      }
    ];

    setTimeout(() => {
      setReviews(fake);
      setLoading(false);
    }, 800); // Subí un poco el tiempo solo para que aprecies el loading state
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">

      {/* Título */}
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis opiniones</h1>
        <p className="text-sm text-gray-500 mt-1">
          Aquí podrás ver y editar las reseñas que has dejado en tus compras.
        </p>
      </div>

      {/* ESTADO DE CARGA */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-4" />
          <p className="text-sm font-medium">Cargando tus opiniones...</p>
        </div>
      )}

      {/* ESTADO VACÍO */}
      {!loading && reviews.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <MessageSquareDashed className="w-10 h-10 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aún no has dejado opiniones
          </h3>
          <p className="text-gray-500 max-w-sm mb-8">
            Tus reseñas ayudan a otros compradores a elegir mejor. Cuando compres un producto, podrás compartir tu experiencia.
          </p>
          <Link href="/buyer/orders">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6 py-5 shadow-sm transition-all">
              Ir a mis pedidos
            </Button>
          </Link>
        </div>
      )}

      {/* LISTA DE RESEÑAS */}
      {!loading && reviews.length > 0 && (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="flex flex-col sm:flex-row gap-5 border border-gray-100 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              {/* IMAGEN DEL PRODUCTO */}
              <div className="shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 relative">
                  {/* Aquí asumo que la ruta es correcta, en tu código asugúrate de tener las imágenes de demo */}
                  <Image
                    src={review.producto.imagen_url}
                    alt={review.producto.nombre}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* INFORMACIÓN Y COMENTARIO */}
              <div className="flex-1 flex flex-col justify-center space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {review.producto.nombre}
                    </h3>
                    {/* ESTRELLAS MEJORADAS (Muestra 5, rellena según rating) */}
                    <div className="flex items-center gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${
                            i < review.rating 
                              ? "text-amber-400 fill-amber-400" 
                              : "text-gray-200 fill-gray-200"
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">
                    {new Date(review.fecha).toLocaleDateString("es-GT", {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100/50">
                  "{review.comentario}"
                </p>
              </div>

              {/* ACCIONES (Botones) */}
              <div className="flex sm:flex-col gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-gray-100 sm:pl-5 shrink-0 justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 sm:flex-none text-gray-600 hover:text-orange-600 hover:bg-orange-50 border-gray-200 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4 mr-2" /> 
                  Editar
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> 
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}