"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import Carousel from "@/components/Carousel"; // <-- lo dejamos solo para categorías
import FallbackImg from "@/components/FallbackImg";

type Categoria = {
  id: number;
  nombre: string;
  imagen_url?: string | null;
};

type Producto = {
  id: string;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
};

type Tienda = {
  id: number;
  nombre?: string | null;
  nombre_comercio?: string | null;
  logo_url?: string | null;
  departamento?: string | null;
  municipio?: string | null;
};

export default function HomePage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [nuevosProductos, setNuevosProductos] = useState<Producto[]>([]);
  const [tiendas, setTiendas] = useState<Tienda[]>([]);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

  useEffect(() => {
    async function loadAll() {
      try {
        const r1 = await fetch(`${API}/api/categorias`);
        setCategorias(await r1.json());

        const r2 = await fetch(`${API}/api/productos/nuevos`);
        setNuevosProductos(await r2.json());

        const r3 = await fetch(`${API}/api/vendedores/destacados`);
        setTiendas(await r3.json());
      } catch (e) {
        console.error("ERROR CARGANDO HOME:", e);
      }
    }

    loadAll();
  }, [API]);

  return (
    <main className="pb-10 space-y-12">

      {/* HERO */}
      <section className="relative h-[80vh] w-full">
        <Image
          src="/images/hero-cultural.jpg"
          alt="Hero"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold">
            Compra directo a artesanos guatemaltecos
          </h1>

          <p className="mt-3 text-lg md:text-xl">
            Explora cultura, identidad y talento
          </p>

          <Link href="/productos">
            <button className="bg-white text-black px-6 py-2 rounded-xl mt-4">
              Ver productos
            </button>
          </Link>
        </div>
      </section>

      {/* CATEGORÍAS — Carrusel se mantiene */}
      <section className="px-4 md:px-12">
        <h2 className="text-2xl font-semibold mb-6">Categorías</h2>

        {categorias.length > 0 ? (
          <Carousel itemsVisible={5} itemWidth={200}>
            {categorias.slice(0, 20).map((cat) => (
              <Link
                key={cat.id}
                href={`/categorias/${cat.nombre.toLowerCase()}`}
                className="flex-none w-[200px]"
              >
                <div className="border rounded-xl overflow-hidden bg-white">
                  <FallbackImg
                    src={cat.imagen_url}
                    fallback="/images/categorias/default.jpg"
                    alt={cat.nombre}
                    className="h-32 w-full object-cover"
                  />

                  <p className="text-center py-2">{cat.nombre}</p>
                </div>
              </Link>
            ))}
          </Carousel>
        ) : (
          <p className="text-gray-500">No hay categorías disponibles.</p>
        )}
      </section>

      {/* NUEVOS PRODUCTOS — SIN CARRUSEL */}
      <section className="px-4 md:px-12">
        <h2 className="text-2xl font-semibold mb-6">Nuevos productos</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {nuevosProductos.slice(0, 5).map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="border rounded-xl bg-white overflow-hidden"
            >
              <FallbackImg
                src={p.imagen_url}
                fallback="/images/productos/default.jpg"
                alt={p.nombre}
                className="h-40 w-full object-cover"
              />

              <div className="p-3">
                <h3 className="font-medium truncate">{p.nombre}</h3>
                <p className="text-gray-500">Q{Number(p.precio).toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TIENDAS — SIN CARRUSEL */}
      <section className="px-4 md:px-12">
        <h2 className="text-2xl font-semibold mb-6">Tiendas registradas</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {tiendas.slice(0, 5).map((t) => {
            const nombre = t.nombre_comercio || t.nombre || "Tienda";
            const slug = nombre.toLowerCase().replace(/\s+/g, "-");

            return (
              <div
                key={t.id}
                className="border rounded-xl p-4 bg-white text-center"
              >
                <FallbackImg
                  src={t.logo_url}
                  fallback="/images/tiendas/default.jpg"
                  alt={nombre}
                  className="w-20 h-20 rounded-full object-cover mx-auto"
                />

                <h3 className="font-semibold mt-3">{nombre}</h3>

                <p className="text-gray-500 text-sm">
                  {t.departamento}
                  {t.municipio ? `, ${t.municipio}` : ""}
                </p>

                <Link
                  href={`/tienda/${slug}`}
                  className="text-primary mt-2 block hover:underline"
                >
                  Ver tienda
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-primary text-white text-center py-10 px-6 rounded-xl mx-4 md:mx-12">
        <h3 className="text-2xl md:text-3xl font-bold mb-4">
          ¿Tienes un negocio de ropa típica?
        </h3>

        <p className="mb-6">
          Vende en Flowjuyu y conecta con compradores culturales
        </p>

        <Link href="/registro?vendedor=1">
          <button className="bg-white text-black px-6 py-3 rounded-xl">
            Crear tienda
          </button>
        </Link>
      </section>

    </main>
  );
}