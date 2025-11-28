// src/app/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Categoria = {
  id: number;
  nombre: string;
  imagen_url?: string | null;
};

type Producto = {
  id: number;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
  created_at?: string;
};

type Tienda = {
  id: number;
  nombre: string;
  logo_url?: string | null;
  descripcion?: string | null;
  departamento?: string | null;
  municipio?: string | null;
};

export default function HomePage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nuevosProductos, setNuevosProductos] = useState<Producto[]>([]);
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800/api";

  // Cargar categorías, nuevos productos y tiendas
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch(`${API}/categorias`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setCategorias(data);
      } catch (error) {
        console.error("Error al obtener categorías:", error);
      }
    };

    const fetchNuevosProductos = async () => {
      try {
        const res = await fetch(`${API}/productos/nuevos`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setNuevosProductos(data);
      } catch (error) {
        console.error("Error al obtener nuevos productos:", error);
      }
    };

    const fetchTiendas = async () => {
      try {
        const res = await fetch(`${API}/vendedores/destacados`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setTiendas(data);
      } catch (error) {
        console.error("Error al obtener tiendas:", error);
      }
    };

    fetchCategorias();
    fetchNuevosProductos();
    fetchTiendas();
  }, [API]);

  return (
    <main className="space-y-12 pb-10">
      {/* 🏞️ Hero Banner Cultural */}
      <section className="relative h-[80vh] w-full">
        <Image
          src="/images/hero-cultural.jpg"
          alt="Hero cultural"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Compra directo a artesanos guatemaltecos
          </h1>
          <p className="text-lg md:text-xl mb-4">
            Explora cultura, identidad y talento
          </p>
          <Link href="/productos">
            <button className="bg-white text-black px-6 py-2 rounded-xl font-semibold hover:bg-gray-100 transition">
              Ver productos
            </button>
          </Link>
        </div>
      </section>

      {/* 🧵 Categorías Dinámicas */}
      <section className="px-4 md:px-12">
        <h2 className="text-2xl font-semibold mb-6">Categorías</h2>
        <div className="overflow-x-auto whitespace-nowrap flex gap-4">
          {categorias.length > 0 ? (
            categorias.map((cat) => (
              <Link
                href={`/categorias/${encodeURIComponent(cat.nombre.toLowerCase())}`}
                key={cat.id}
                className="flex-shrink-0 w-48"
              >
                <div className="border rounded-xl overflow-hidden hover:shadow-lg transition">
                  <Image
                    src={
                      cat.imagen_url ||
                      "https://yjoybxvmnfwkuzrthdge.supabase.co/storage/v1/object/public/Categorias/default.jpg"
                    }
                    alt={cat.nombre}
                    width={300}
                    height={200}
                    className="w-full h-40 object-cover"
                  />
                  <p className="text-center font-medium py-2 capitalize">
                    {cat.nombre}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Cargando categorías...</p>
          )}
        </div>
      </section>

      {/* 🆕 Nuevos productos (últimos 7 días) */}
      <section className="px-4 md:px-12">
        <h2 className="text-2xl font-semibold mb-6">Nuevos productos</h2>

        {nuevosProductos.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No hay productos nuevos registrados esta semana.
          </p>
        ) : (
          <div className="overflow-x-auto whitespace-nowrap flex gap-4">
            {nuevosProductos.map((p) => (
              <div
                key={p.id}
                className="flex-shrink-0 w-60 border rounded-xl overflow-hidden hover:shadow-md bg-white"
              >
                <Image
                  src={p.imagen_url || "/images/productos/default.jpg"}
                  alt={p.nombre}
                  width={240}
                  height={240}
                  className="w-full h-40 object-cover"
                />
                <div className="p-2">
                  <h3 className="font-medium truncate">{p.nombre}</h3>
                  <p className="text-sm text-gray-500">
                    Q{Number(p.precio || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 🏪 Tiendas registradas */}
      <section className="px-4 md:px-12 mt-8">
        <h2 className="text-2xl font-semibold mb-6">Tiendas registradas</h2>

        {tiendas.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No hay tiendas registradas actualmente.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {tiendas.map((t) => (
              <div
                key={t.id}
                className="border rounded-xl p-4 bg-white hover:shadow-md transition-all flex flex-col items-center text-center"
              >
                <div className="relative w-20 h-20 mb-3">
                  <Image
                    src={t.logo_url || "/images/tiendas/default.jpg"}
                    alt={`Logo de ${t.nombre}`}
                    fill
                    className="rounded-full object-cover border border-gray-200"
                  />
                </div>
                <h3 className="font-medium text-base text-gray-800 truncate w-full">
                  {t.nombre}
                </h3>
                {t.departamento && (
                  <p className="text-xs text-gray-500">
                    {t.departamento}
                    {t.municipio ? `, ${t.municipio}` : ""}
                  </p>
                )}
                <Link
                  href={`/tienda/${t.nombre.toLowerCase().replace(/\s+/g, "-")}`}
                  className="mt-2 text-sm text-primary hover:underline"
                >
                  Ver tienda
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA para Vendedores */}
      <section className="bg-primary text-white text-center py-10 px-6 rounded-xl mx-4 md:mx-12">
        <h3 className="text-2xl md:text-3xl font-bold mb-4">
          ¿Tienes un negocio de ropa típica?
        </h3>
        <p className="mb-6">
          Vende en Flowjuyu y conecta con compradores culturales
        </p>
        <Link href="/registro?vendedor=1">
          <button className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition">
            Crear tienda
          </button>
        </Link>
      </section>
    </main>
  );
}
