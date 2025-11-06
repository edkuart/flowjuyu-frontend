//src/app/categorias/[slug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
  categoria?: { nombre: string };
};

export default function CategoriaPage() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [categoriaNombre, setCategoriaNombre] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await fetch(`${API}/categorias/${slug}/productos`);
        const data = await res.json();
        setCategoriaNombre(data?.categoria?.nombre || "");
        setProductos(data?.productos || []);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProductos();
  }, [slug]);

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">Cargando productos...</div>
    );

  return (
    <main className="px-4 md:px-12 py-10">
      <h1 className="text-3xl font-bold mb-6 capitalize">
        {categoriaNombre || slug}
      </h1>

      {productos.length === 0 ? (
        <p className="text-gray-500">No hay productos en esta categoría.</p>
      ) : (
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {productos.map((p) => (
            <div
              key={p.id}
              className="border rounded-xl overflow-hidden hover:shadow-md bg-white"
            >
              <Image
                src={p.imagen_url || "/images/productos/default.jpg"}
                alt={p.nombre}
                width={300}
                height={200}
                className="w-full h-40 object-cover"
              />
              <div className="p-3">
                <h3 className="font-medium text-sm line-clamp-1">{p.nombre}</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Q{Number(p.precio || 0).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10">
        <Link href="/">
          <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80">
            Volver al inicio
          </button>
        </Link>
      </div>
    </main>
  );
}