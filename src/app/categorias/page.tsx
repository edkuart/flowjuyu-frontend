"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const API = "http://localhost:8800"; // 🔥 FORZADO PARA DEBUG

type Producto = {
  id: string;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
};

export default function CategoriaPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug)
    ? params.slug[0]
    : params.slug;

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoria, setCategoria] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    console.log("SLUG:", slug);
    const url = `${API}/api/categorias/${slug}/productos`;
    console.log("FETCH:", url);

    fetch(url, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        console.log("DATA:", data);
        setCategoria(data.categoria?.nombre || slug);
        setProductos(data.productos || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="p-10 text-center">Cargando…</div>;
  }

  return (
    <main className="px-6 py-10">
      <h1 className="text-3xl font-bold mb-6 capitalize">{categoria}</h1>

      {productos.length === 0 ? (
        <p className="text-gray-500">No hay productos en esta categoría.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {productos.map((p) => (
            <Link key={p.id} href={`/product/${p.id}`}>
              <div className="border rounded-lg p-3 hover:shadow">
                <Image
                  src={p.imagen_url || "/placeholder.jpg"}
                  alt={p.nombre}
                  width={300}
                  height={200}
                  className="w-full h-40 object-cover"
                />
                <p className="mt-2 font-medium">{p.nombre}</p>
                <p className="text-sm">Q{Number(p.precio).toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
