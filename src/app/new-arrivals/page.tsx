"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getProductImage } from "@/lib/getProductImage";

/* ===========================
   Tipos de datos
=========================== */
type Producto = {
  id: string;
  nombre: string;
  precio: number;
  descripcion?: string;
  imagen_url?: string | null;
  imagenes?: { url: string }[];
  categoria?: string;
  createdAt?: string;
};

export default function NewArrivalsPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para filtros
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("latest");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");

  // OJO: Si tu backend no está en el puerto 8800, cambia esto aquí
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

  /* ===========================
     1. Lógica de API (Modo Detective)
  =========================== */
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);
        console.log(`📡 Conectando a: ${API_URL}`);
        
        // 1. Intentamos rutas comunes
        let res = await fetch(`${API_URL}/api/productos`, { cache: "no-store" });
        
        if (!res.ok) {
           console.warn(" /api/productos falló, probando /api/products...");
           res = await fetch(`${API_URL}/api/products`, { cache: "no-store" });
        }

        if (!res.ok) throw new Error(`Error conexión: ${res.status}`);

        const data = await res.json();
        console.log(" RESPUESTA CRUDA DEL BACKEND:", data); // <--- MIRA ESTO EN LA CONSOLA (F12)
        
        // 2. BUSCADOR DE ARREGLOS (Aquí estaba el problema probable)
        // Buscamos el arreglo donde sea que esté escondido
        let listaRaw: any[] = [];

        if (Array.isArray(data)) {
            listaRaw = data;
        } else if (Array.isArray(data.products)) {
            listaRaw = data.products;
        } else if (Array.isArray(data.data)) {
            listaRaw = data.data;
        } else if (Array.isArray(data.items)) {
            listaRaw = data.items;
        } else {
            console.error(" No encontré un arreglo en la respuesta API");
        }

        console.log(` Se encontraron ${listaRaw.length} productos crudos.`);

        // 3. Normalización (Traductor a prueba de fallos)
        const listaLimpia: Producto[] = listaRaw.map((item: any) => ({
          // Nos aseguramos que el ID sea string
          id: item.id ? item.id.toString() : Math.random().toString().slice(2, 9),
          // Buscamos el nombre en inglés o español
          nombre: item.nombre || item.name || item.title || "Producto sin nombre",
          // Precio numérico seguro
          precio: Number(item.precio || item.price || 0),
          descripcion: item.descripcion || item.description || "",
          // Buscamos imagen en varios campos comunes
          imagen_url: item.imagen_url || item.img || item.image || item.imageUrl || null,
          categoria: item.categoria || item.category || "General",
          createdAt: item.createdAt || item.created_at || new Date().toISOString()
        }));

        // 4. Orden inicial por fecha
        listaLimpia.sort((a, b) => {
           const dateA = new Date(a.createdAt || 0).getTime();
           const dateB = new Date(b.createdAt || 0).getTime();
           return dateB - dateA; // Más nuevos primero
        });

        setProductos(listaLimpia);
      } catch (error) {
        console.error(" Error grave en fetch:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [API_URL]);

  /* ===========================
     2. Lógica de Filtrado (CORREGIDA)
  =========================== */
  
  // Cuántos días dura algo siendo "nuevo" 
  const DIAS_LIMITE = 30; 

  const productosFiltrados = productos
    .filter((p) => {
      // 1. Filtro de Busqueda
      const search = busqueda.toLowerCase();
      const coincideNombre = p.nombre.toLowerCase().includes(search) || 
                             (p.categoria || "").toLowerCase().includes(search);
      
      // 2. Filtro de Categoría
      let coincideCat = true;
      if (filtroCategoria !== "Todas") {
        const catFiltro = filtroCategoria.toLowerCase().slice(0, -1);
        const catProd = (p.categoria || "").toLowerCase();
        coincideCat = catProd.includes(catFiltro); 
      }

      // 3.Filtro de Tiempo
      const fechaCreacion = new Date(p.createdAt || 0).getTime();
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - DIAS_LIMITE); 
      
      const esReciente = fechaCreacion > fechaLimite.getTime();

      return coincideNombre && coincideCat && esReciente;
    })
    
    .sort((a, b) => {
      if (orden === "priceAsc") return a.precio - b.precio;
      if (orden === "priceDesc") return b.precio - a.precio;
      if (orden === "name") return a.nombre.localeCompare(b.nombre);
      return 0; 
    });
  /* ===========================
     3. Renderizado
  =========================== */
  return (
    <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-10 min-h-screen">
      <header className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Novedades</h1>
        <p className="text-muted-foreground">
          Descubre las últimas llegadas a nuestra colección.
        </p>
      </header>

      {/* Barra de Herramientas */}
      <section className="flex flex-col sm:flex-row flex-wrap items-center gap-3 bg-white p-4 rounded-lg border shadow-sm">
        <input
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="h-10 rounded-md border px-3 text-sm w-full sm:w-64 outline-none focus:ring-2 focus:ring-black/10"
        />
        
        <select 
          className="h-10 rounded-md border px-3 text-sm outline-none bg-white cursor-pointer"
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
        >
          <option value="latest">Más recientes</option>
          <option value="priceAsc">Precio: Bajo a Alto</option>
          <option value="priceDesc">Precio: Alto a Bajo</option>
          <option value="name">Nombre (A-Z)</option>
        </select>

        <select 
          className="h-10 rounded-md border px-3 text-sm outline-none bg-white cursor-pointer"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          <option value="Todas">Todas las categorías</option>
          <option value="Huipiles">Huipiles</option>
          <option value="Cortes">Cortes</option>
          <option value="Trajes">Trajes Completos</option>
          <option value="Joyeria">Joyería</option>
          <option value="Accesorios">Accesorios</option>
        </select>
        
        <div className="ml-auto text-sm text-gray-500 hidden sm:block">
            {productosFiltrados.length} resultados
        </div>
      </section>

      {/* Grid de Productos */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
          <p className="text-gray-500">Cargando novedades...</p>
        </div>
      ) : productosFiltrados.length === 0 ? (
        <div className="py-20 text-center text-gray-500 border rounded-xl bg-gray-50 border-dashed">
          <p className="text-lg font-medium">No se encontraron productos.</p>
          <p className="text-sm mt-2">Intenta cambiar los filtros o recargar la página.</p>
          {/* Debug info visible solo si está vacío */}
          <p className="text-xs text-gray-300 mt-4">Debug: Total Crudos cargados: {productos.length}</p>
        </div>
      ) : (
        <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {productosFiltrados.map((p) => (
            <article 
              key={p.id} 
              className="group flex flex-col rounded-xl border bg-white overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                {getProductImage(p) !== "/images/placeholder.png" ? (
                    <Image
                    src={getProductImage(p)}
                    alt={p.nombre}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-300 bg-gray-50">
                        <span>Sin imagen</span>
                    </div>
                )}
                
                {/* Badge de "Nuevo" si es reciente (opcional) */}
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-sm">
                    Nuevo
                </span>
              </div>
              
              <div className="p-4 flex flex-col flex-1">
                <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {p.nombre}
                    </h3>
                    <p className="text-xs text-gray-500 capitalize">
                        {p.categoria}
                    </p>
                </div>
                
                <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    Q{p.precio.toFixed(2)}
                  </span>
                  
                  <Link href={`/productos/${p.id}`}>
                    <button className="text-xs bg-black text-white px-3 py-2 rounded hover:bg-gray-800 transition-colors">
                      Ver
                    </button>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}