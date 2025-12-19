"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
};

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  // ============================
  //  Cargar productos públicos
  // ============================
  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch(`${API}/api/products`, {
          cache: "no-store",
        });

        const data = await res.json();

        // El backend devuelve: { data: [...] }
        const lista = data.data || data || [];

        if (Array.isArray(lista)) {
          setProductos(lista);
        } else {
          setProductos([]);
        }
      } catch (error) {
        console.error("Error cargando productos:", error);
        setProductos([]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  // ============================
  //  Loading
  // ============================
  if (loading) {
    return (
      <main className="p-10 text-center text-neutral-500">
        Cargando productos...
      </main>
    );
  }

  // ============================
  //  Sin productos
  // ============================
  if (productos.length === 0) {
    return (
      <main className="p-10 text-center text-neutral-500">
        No hay productos disponibles.
      </main>
    );
  }

  // ============================
  //  Render principal
  // ============================
  return (
    <main className="min-h-screen px-6 py-10 bg-neutral-50">
      <h1 className="text-3xl font-bold mb-8">Productos disponibles</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productos.map((p) => (
          <Link href={`/product/${p.id}`} key={p.id}>
            <div className="border rounded-xl bg-white shadow hover:shadow-md transition p-3 cursor-pointer">

              {/* Imagen */}
              <div className="relative w-full aspect-square rounded-md overflow-hidden bg-neutral-100">
                <Image
                  src={p.imagen_url || "/placeholder.jpg"}
                  alt={p.nombre}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Nombre */}
              <h3 className="font-medium mt-2 line-clamp-1">{p.nombre}</h3>

              {/* Precio */}
              <p className="text-orange-600 font-bold text-sm">
                Q{Number(p.precio).toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
