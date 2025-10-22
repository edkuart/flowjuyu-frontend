"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Menu, Grid2x2, ChevronDown, Search, Heart, User, ShoppingCart,
  Globe, LogOut, LayoutDashboard, Store,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar/SidebarTrigger";
import { useAuth } from "@/context/AuthContext";

// ===========================
// 🔹 Subcomponente: Categorías dinámicas
// ===========================
type Categoria = {
  id: number;
  nombre: string;
  imagen_url?: string | null;
};

function CategoriasDropdown() {
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

  const chunkSize = 5;
  const bloques: Categoria[][] = [];
  for (let i = 0; i < categorias.length; i += chunkSize) {
    bloques.push(categorias.slice(i, i + chunkSize));
  }

   return (
  <div
    className="
      absolute left-0 top-full mt-2 z-50
      bg-white shadow-lg rounded-xl border border-gray-100
      p-5 grid gap-x-8 gap-y-4
      sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
      transition-all duration-200 animate-fade-in
      min-w-[450px] max-w-[90vw]
    "
  >
    {bloques.map((bloque, i) => (
      <div key={i} className="flex flex-col space-y-2 min-w-[160px]">
        {bloque.map((cat) => (
          <Link
            key={cat.id}
            href={`/categorias/${encodeURIComponent(cat.nombre.toLowerCase())}`}
            className="flex items-center gap-3 hover:text-primary transition group"
          >
            <div className="relative w-9 h-9 rounded-md overflow-hidden bg-gray-100 group-hover:scale-105 transition-transform">
              <Image
                src={cat.imagen_url || "/images/categorias/default.jpg"}
                alt={cat.nombre}
                fill
                sizes="40px"
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/images/categorias/default.jpg";
                }}
              />
            </div>
            <span className="text-sm font-medium text-gray-800 truncate">
              {cat.nombre}
            </span>
          </Link>
        ))}
      </div>
    ))}
  </div>
);
}

// ===========================
// 🔸 Componente principal: Header
// ===========================
export default function Header() {
  const { user, logout } = useAuth();
  const [q, setQ] = useState("");
  const [openCats, setOpenCats] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [cartCount] = useState<number>(0);

  const helpRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!helpRef.current) return;
      if (!helpRef.current.contains(e.target as Node)) setHelpOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setHelpOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function onSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const query = q.trim();
    if (!query) return;
    window.location.href = `/buscar?q=${encodeURIComponent(query)}`;
  }

  return (
    <div className="w-full border-b bg-white relative z-50 shadow-sm">

      {/* Barra superior */}
      <div className="max-w-screen-xl mx-auto h-16 px-3 md:px-6 flex items-center gap-3">
        {/* Izquierda */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="md:hidden text-zinc-700">
            <Menu className="w-5 h-5" />
          </SidebarTrigger>

          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/cortelogo.png"
              alt="Flowjuyu"
              width={34}
              height={34}
              className="rounded-sm"
              priority
            />
            <span className="hidden sm:block text-lg font-semibold tracking-tight">
              Flowjuyu
            </span>
          </Link>

          {/* 🔹 Categorías dinámicas */}
          <div
            className="relative hidden md:block"
            onMouseEnter={() => setOpenCats(true)}
            onMouseLeave={() => {setTimeout(() => setOpenCats(false), 1000);

            }}
            >
              <button
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-zinc-50"
              aria-haspopup="menu"
              aria-expanded={openCats}
              >
                <Grid2x2 className="w-4 h-4" />
                Categorías
                <ChevronDown className="w-4 h-4" />
              </button>

            {openCats && <CategoriasDropdown />}
          </div>
        </div>

        {/* Centro: buscador */}
        <form
          onSubmit={onSearch}
          className="flex-1 max-w-3xl mx-auto hidden sm:flex"
          role="search"
          aria-label="Buscador"
        >
          <div className="relative flex-1">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar en Flowjuyu"
              className="w-full h-10 rounded-full border pl-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-zinc-100"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5 text-zinc-600" />
            </button>
          </div>
        </form>

        {/* Móvil: búsqueda rápida */}
        <button
          onClick={() => {
            const term = prompt("¿Qué deseas buscar?") || "";
            if (term.trim())
              window.location.href = `/buscar?q=${encodeURIComponent(
                term.trim()
              )}`;
          }}
          className="sm:hidden p-2 rounded-md hover:bg-zinc-50"
          aria-label="Buscar"
        >
          <Search className="w-5 h-5 text-zinc-700" />
        </button>

        {/* Derecha */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/favoritos"
            className="p-2 rounded-full hover:bg-zinc-50"
            aria-label="Favoritos"
            title="Favoritos"
          >
            <Heart className="w-5 h-5 text-zinc-700" />
          </Link>

          {/* Cuenta */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setOpenAccount((v) => !v)}
                onBlur={() => setTimeout(() => setOpenAccount(false), 150)}
                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-zinc-50"
                aria-haspopup="menu"
                aria-expanded={openAccount}
              >
                <User className="w-4 h-4" />
                Mi cuenta
                <ChevronDown className="w-4 h-4" />
              </button>

              {openAccount && (
                <div className="absolute right-0 mt-2 w-56 rounded-md border bg-white shadow-sm py-1 z-50">
                  <div className="px-3 py-2 text-xs text-zinc-500">
                    Hola,{" "}
                    <span className="font-medium text-zinc-700">
                      {user.nombre}
                    </span>
                  </div>

                  {user.rol === "vendedor" && (
                    <>
                      <Link
                        href="/seller/dashboard"
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50"
                        onClick={() => setOpenAccount(false)}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard vendedor
                      </Link>
                      <Link
                        href="/seller/products"
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50"
                        onClick={() => setOpenAccount(false)}
                      >
                        <Store className="w-4 h-4" />
                        Mis productos
                      </Link>
                    </>
                  )}

                  {user.rol === "comprador" && (
                    <Link
                      href="/orders"
                      className="block px-3 py-2 text-sm hover:bg-zinc-50"
                      onClick={() => setOpenAccount(false)}
                    >
                      Mis pedidos
                    </Link>
                  )}

                  {user.rol === "admin" && (
                    <Link
                      href="/admin/dashboard"
                      className="block px-3 py-2 text-sm hover:bg-zinc-50"
                      onClick={() => setOpenAccount(false)}
                    >
                      Panel administrador
                    </Link>
                  )}

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm hover:underline">
                Iniciar sesión
              </Link>

              <div className="relative">
                <button
                  onClick={() => setOpenCreate((v) => !v)}
                  onBlur={() => setTimeout(() => setOpenCreate(false), 150)}
                  className="inline-flex items-center gap-1 text-sm hover:text-zinc-900"
                  aria-haspopup="menu"
                  aria-expanded={openCreate}
                >
                  Crear cuenta
                  <ChevronDown className="w-4 h-4" />
                </button>

                {openCreate && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md border bg-white shadow-sm py-1 z-50">
                    <Link
                      href="/register/buyer"
                      className="block px-3 py-2 text-sm hover:bg-zinc-50"
                      onClick={() => setOpenCreate(false)}
                    >
                      Soy comprador
                    </Link>
                    <Link
                      href="/register/seller"
                      className="block px-3 py-2 text-sm hover:bg-zinc-50"
                      onClick={() => setOpenCreate(false)}
                    >
                      Soy vendedor
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Carrito */}
          <Link
            href="/carrito"
            className="relative p-2 rounded-full hover:bg-zinc-50"
            aria-label="Carrito"
            title="Carrito"
          >
            <ShoppingCart className="w-5 h-5 text-zinc-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 rounded-full bg-zinc-900 text-white text-[10px] px-1.5 py-[1px]">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Idioma */}
          <button className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded border text-sm hover:bg-zinc-50">
            <Globe className="w-4 h-4" />
            ES
          </button>
        </div>
      </div>

      {/* Fila secundaria */}
      <nav className="border-t">
        <div className="max-w-7xl mx-auto h-10 px-3 md:px-6 flex items-center justify-between text-sm">
          <ul className="flex items-center gap-4 text-zinc-700">
            <li><Link className="hover:underline" href="/offers">Ofertas</Link></li>
            <li><Link className="hover:underline" href="/shipments">Envíos</Link></li>
            <li><Link className="hover:underline" href="/new-arrivals">Lo + nuevo</Link></li>
            <li><Link className="hover:underline" href="/sell">Vende en Flowjuyu</Link></li>

            {/* Ayuda */}
            <li
              ref={helpRef}
              className="relative"
              onMouseEnter={() => setHelpOpen(true)}
            >
              <button
                type="button"
                onClick={() => setHelpOpen((v) => !v)}
                className="inline-flex items-center gap-1 hover:underline"
                aria-haspopup="menu"
                aria-expanded={helpOpen}
              >
                Ayuda <ChevronDown className="w-4 h-4" />
              </button>

              {helpOpen && (
                <div className="absolute left-0 top-full w-52 rounded-md border bg-white shadow-sm py-1 z-50">
                  <Link className="block px-3 py-2 hover:bg-zinc-50" href="/help/faq">
                    Preguntas frecuentes
                  </Link>
                  <Link className="block px-3 py-2 hover:bg-zinc-50" href="/help/contact">
                    Contáctanos
                  </Link>
                  <Link className="block px-3 py-2 hover:bg-zinc-50" href="/help/returns">
                    Devoluciones
                  </Link>
                </div>
              )}
            </li>
          </ul>

          <div className="hidden md:flex items-center gap-6 text-xs text-zinc-600">
            <span>🇬🇹 100% chapines</span>
          </div>
        </div>
      </nav>
    </div>
  );
}
