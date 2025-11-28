"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Categoria = {
  id: number;
  nombre: string;
  imagen_url?: string | null;
};

export default function CategoriasDropdown() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800/api";

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch(`${API}/categorias`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setCategorias(data);
        }
      } catch (error) {
        console.error("Error al obtener categorías:", error);
      }
    };
    fetchCategorias();
  }, []);

  // 🔹 Agrupar categorías en bloques de 5
  const chunkSize = 5;
  const bloques: Categoria[][] = [];
  for (let i = 0; i < categorias.length; i += chunkSize) {
    bloques.push(categorias.slice(i, i + chunkSize));
  }

  return (
    <div
      className="
        absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50
        bg-white shadow-xl rounded-xl
        p-6 grid gap-x-10 gap-y-6
        grid-cols-auto-fit
        transition-all duration-300 animate-fade-in
        min-w-[400px] max-w-[90vw]
        overflow-hidden
        "
    >
      {bloques.map((bloque, i) => (
        <div key={i} className="flex flex-col space-y-3 min-w-[160px]">
          {bloque.map((cat) => (
            <Link
              key={cat.id}
              href={`/categorias/${encodeURIComponent(cat.nombre.toLowerCase())}`}
              className="flex items-center gap-3 hover:text-primary transition group"
            >
              <div className="relative w-8 h-8 rounded-md overflow-hidden bg-gray-100 group-hover:scale-105 transition-transform">
                <Image
                  src={cat.imagen_url || "/images/categorias/default.jpg"}
                  alt={cat.nombre}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/images/categorias/default.jpg";
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-800">
                {cat.nombre}
              </span>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
