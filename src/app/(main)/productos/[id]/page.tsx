// src/app/product/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

type Producto = {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  imagenes?: string[];
  imagen_url?: string;
  categoria?: string;
  departamento?: string;
  municipio?: string;
  vendedor?: {
    id: string;
    nombre: string;
    departamento: string;
    municipio: string;
  };
};

export default function ProductPage() {
  const { id } = useParams();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);

  const [imagenActiva, setImagenActiva] = useState(0);
  const [relacionados, setRelacionados] = useState<Producto[]>([]);

  useEffect(() => {
    if (!id) return;

    async function loadProduct() {
      try {
        const res = await fetch(`${API}/api/products/${id}`);
        const data = await res.json();
        setProducto(data.data);

        if (data.related) setRelacionados(data.related);
      } catch (e) {
        console.error("Error obteniendo producto:", e);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <main className="p-10 text-center text-neutral-500">
        Cargando producto...
      </main>
    );
  }

  if (!producto) {
    return (
      <main className="p-10 text-center text-neutral-500">
        Producto no encontrado.
      </main>
    );
  }

  const imagenes = producto.imagenes?.length
    ? producto.imagenes
    : [producto.imagen_url || "/placeholder.jpg"];

  return (
    <main className="min-h-screen px-6 py-10 bg-neutral-50">
      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* ===================== */}
        {/* Galería de imágenes */}
        {/* ===================== */}
        <section className="space-y-4">
          <div className="relative w-full aspect-square bg-white rounded-lg border shadow-sm">
            <Image
              src={imagenes[imagenActiva]}
              alt={producto.nombre}
              fill
              className="object-contain p-4"
            />
          </div>

          <div className="flex gap-3 overflow-x-auto">
            {imagenes.map((img, i) => (
              <button
                key={i}
                onClick={() => setImagenActiva(i)}
                className={`border rounded-md w-20 h-20 relative ${
                  i === imagenActiva ? "border-neutral-800" : "border-neutral-300"
                }`}
              >
                <Image
                  src={img}
                  alt="miniatura"
                  fill
                  className="object-cover rounded"
                />
              </button>
            ))}
          </div>
        </section>

        {/* ===================== */}
        {/* Info principal */}
        {/* ===================== */}
        <section className="space-y-6">
          <h1 className="text-3xl font-bold text-neutral-900">
            {producto.nombre}
          </h1>

          <p className="text-2xl font-semibold text-orange-600">
            Q{producto.precio.toFixed(2)}
          </p>

          {producto.categoria && (
            <p className="text-sm text-neutral-500">
              Categoría: <span className="font-medium">{producto.categoria}</span>
            </p>
          )}

          {(producto.departamento || producto.municipio) && (
            <p className="text-sm text-neutral-500">
              Origen:{" "}
              <span className="font-medium">
                {producto.municipio ? `${producto.municipio}, ` : ""}
                {producto.departamento}
              </span>
            </p>
          )}

          {/* ===================== */}
          {/* Botones de compra */}
          {/* ===================== */}
          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold"
            >
              Comprar ahora
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full font-semibold"
            >
              Añadir al carrito
            </Button>
          </div>

          {/* ===================== */}
          {/* Descripción */}
          {/* ===================== */}
          {producto.descripcion && (
            <Card>
              <CardContent className="p-4 space-y-2">
                <h3 className="text-lg font-semibold">Descripción del producto</h3>
                <p className="text-neutral-700 leading-relaxed">
                  {producto.descripcion}
                </p>
              </CardContent>
            </Card>
          )}

          {/* ===================== */}
          {/* Info del vendedor */}
          {/* ===================== */}
          {producto.vendedor && (
            <Card>
              <CardContent className="p-4 space-y-1">
                <h3 className="text-base font-semibold">Vendedor</h3>

                <p className="font-medium">{producto.vendedor.nombre}</p>

                <p className="text-neutral-600 text-sm">
                  {producto.vendedor.municipio}, {producto.vendedor.departamento}
                </p>

                <Link
                  href={`/seller/${producto.vendedor.id}`}
                  className="text-orange-600 text-sm font-medium"
                >
                  Ver tienda →
                </Link>
              </CardContent>
            </Card>
          )}
        </section>
      </div>

      {/* ===================== */}
      {/* Productos relacionados */}
      {/* ===================== */}
      {relacionados.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Productos similares</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {relacionados.map((p) => (
              <Link href={`/product/${p.id}`} key={p.id}>
                <Card className="hover:shadow-md transition cursor-pointer">
                  <CardContent className="p-3">
                    <div className="relative w-full aspect-square rounded-md overflow-hidden">
                      <Image
                        src={p.imagen_url || "/placeholder.jpg"}
                        alt={p.nombre}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-medium mt-2 line-clamp-1">{p.nombre}</h3>
                    <p className="text-orange-600 font-bold text-sm">
                      Q{Number(p.precio).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
