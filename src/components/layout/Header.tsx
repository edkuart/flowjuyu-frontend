"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  Grid2x2,
  ChevronDown,
  Search,
  Heart,
  User,
  ShoppingCart,
  Globe,
  LogOut,
  LayoutDashboard,
  Store,
} from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar/SidebarTrigger";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import SearchBar from "@/components/ui/SearchBar";

/* ===========================
   🔹 Subcomponente: Categorías dinámicas
=========================== */
type Categoria = {
  id: number;
  nombre: string;
  imagen_url?: string | null;
};

function CategoriasDropdown() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch(`${API}/api/categorias`, {
          cache: "no-store",
        });

        if (!res.ok) {
          console.error("Error al cargar categorías:", res.status);
          return;
        }

        const data = await res.json();
        setCategorias(data);
      } catch (error) {
        console.error("Error al obtener categorías:", error);
      }
    };

    fetchCategorias();
  }, [API]);

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
              href={`/categorias/${encodeURIComponent(
                cat.nombre.toLowerCase()
              )}`}
              className="flex items-center gap-3 hover:text-primary transition group"
            >
              <div className="relative w-9 h-9 rounded-md overflow-hidden bg-gray-100 group-hover:scale-105 transition-transform">
                <Image
                  src={cat.imagen_url || "/images/categorias/default.jpg"}
                  alt={cat.nombre}
                  fill
                  sizes="40px"
                  className="object-cover"
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

/* ===========================
   🔸 Componente principal: Header
=========================== */
export default function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart(); // ✅ contador REAL del carrito

  const [openCats, setOpenCats] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // ✅ mantenemos cartCount como tú lo tenías, pero ahora lo alimentamos del contexto
  const [cartCount, setCartCount] = useState<number>(0);

  // ✅ extra: buscador móvil (para usar ícono Search y no quede import “unused”)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const helpRef = useRef<HTMLLIElement>(null);
  const catsRef = useRef<HTMLDivElement>(null);

  // ✅ sincroniza contador real
  useEffect(() => {
    setCartCount(count);
  }, [count]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (catsRef.current && !catsRef.current.contains(e.target as Node)) {
        setOpenCats(false);
      }

      if (helpRef.current && !helpRef.current.contains(e.target as Node)) {
        setHelpOpen(false);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHelpOpen(false);
        setOpenAccount(false);
        setOpenCreate(false);
        setOpenCats(false);
        setMobileSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // ✅ helper: soporta roles nuevos y viejos (buyer/seller vs comprador/vendedor)
  const isBuyer =
    user?.rol === "buyer" || user?.rol === "comprador" || user?.role === "buyer";
  const isSeller =
    user?.rol === "seller" || user?.rol === "vendedor" || user?.role === "seller";

  return (
    <div className="w-full border-b bg-white relative z-50 shadow-sm">
      {/* ================= Barra superior ================= */}
      <div className="max-w-screen-xl mx-auto h-16 px-3 md:px-6 flex items-center gap-3">
        {/* Izquierda */}
        <div className="flex items-center gap-3">
          {/* Sidebar (móvil) */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mantengo SidebarTrigger como lo tenías */}
            <SidebarTrigger className="text-zinc-700" />

            {/* ✅ Uso Menu para que no quede import sin usar (opcional UX) */}
            <button
              type="button"
              onClick={() => setOpenCats((v) => !v)}
              className="p-2 rounded-md hover:bg-zinc-50"
              aria-label="Abrir categorías"
            >
              <Menu className="w-5 h-5 text-zinc-700" />
            </button>
          </div>

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

          {/* 🔹 Categorías dinámicas (CLICK) */}
          <div ref={catsRef} className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setOpenCats((v) => !v)}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-zinc-50"
              aria-haspopup="menu"
              aria-expanded={openCats}
            >
              <Grid2x2 className="w-4 h-4" />
              Categorías
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  openCats ? "rotate-180" : ""
                }`}
              />
            </button>

            {openCats && <CategoriasDropdown />}
          </div>

          {/* ✅ Categorías dropdown en móvil también (cuando presionas Menu) */}
          <div className="relative md:hidden">
            {openCats && <CategoriasDropdown />}
          </div>
        </div>

        {/* Centro */}
        <div className="flex-1 max-w-3xl mx-auto hidden sm:flex">
          <SearchBar />
        </div>

        {/* ✅ Botón de búsqueda móvil (usa icono Search del import) */}
        <button
          type="button"
          onClick={() => setMobileSearchOpen((v) => !v)}
          className="sm:hidden p-2 rounded-full hover:bg-zinc-50"
          aria-label="Buscar"
        >
          <Search className="w-5 h-5 text-zinc-700" />
        </button>

        {/* Derecha */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/favoritos" className="p-2 rounded-full hover:bg-zinc-50">
            <Heart className="w-5 h-5 text-zinc-700" />
          </Link>

          {/* Cuenta */}
          {user ? (
            <div
              className="relative"
              onMouseEnter={() => setOpenAccount(true)}
              onMouseLeave={() => setOpenAccount(false)}
            >
              <button className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-zinc-50">
                <User className="w-4 h-4" />
                Mi cuenta
                <ChevronDown className="w-4 h-4" />
              </button>

              {openAccount && (
                <div className="absolute right-0 mt-2 w-56 rounded-md border bg-white shadow-sm py-1 z-50">
                  {isBuyer && (
                    <Link
                      href="/buyer/orders"
                      className="block px-3 py-2 text-sm hover:bg-zinc-50"
                    >
                      Mis pedidos
                    </Link>
                  )}

                  {isSeller && (
                    <>
                      <Link
                        href="/seller/dashboard"
                        className="flex gap-2 px-3 py-2 text-sm hover:bg-zinc-50"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard vendedor
                      </Link>

                      <Link
                        href="/seller/products"
                        className="flex gap-2 px-3 py-2 text-sm hover:bg-zinc-50"
                      >
                        <Store className="w-4 h-4" />
                        Mis productos
                      </Link>
                    </>
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
                  onBlur={() => setTimeout(() => setOpenCreate(false), 100)}
                  className="inline-flex items-center gap-1 text-sm hover:text-zinc-900"
                >
                  Crear cuenta <ChevronDown className="w-4 h-4" />
                </button>

                {openCreate && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md border bg-white shadow-sm py-1 z-50">
                    <Link
                      href="/register/buyer"
                      className="block px-3 py-2 text-sm hover:bg-zinc-50"
                    >
                      Soy comprador
                    </Link>
                    <Link
                      href="/register/seller"
                      className="block px-3 py-2 text-sm hover:bg-zinc-50"
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

      {/* ✅ SearchBar en móvil desplegable */}
      {mobileSearchOpen && (
        <div className="sm:hidden px-3 pb-3">
          <SearchBar />
        </div>
      )}

      {/* ================= Línea inferior ================= */}
      <nav className="border-t">
        <div className="max-w-7xl mx-auto h-10 px-3 md:px-6 flex items-center justify-between text-sm">
          <ul className="flex items-center gap-4 text-zinc-700">
            <li>
              <Link className="hover:underline" href="/offers">
                Ofertas
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/shipments">
                Envíos
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/new-arrivals">
                Lo + nuevo
              </Link>
            </li>
            <li>
              <Link className="hover:underline" href="/sell">
                Vende en Flowjuyu
              </Link>
            </li>

            <li ref={helpRef} className="relative">
              <button
                type="button"
                onClick={() => setHelpOpen((v) => !v)}
                className="inline-flex items-center gap-1 hover:underline"
              >
                Ayuda <ChevronDown className="w-4 h-4" />
              </button>

              {helpOpen && (
                <div className="absolute left-0 top-full w-52 rounded-md border bg-white shadow-sm py-1 z-50">
                  <Link
                    className="block px-3 py-2 hover:bg-zinc-50"
                    href="/help/faq"
                  >
                    Preguntas frecuentes
                  </Link>
                  <Link
                    className="block px-3 py-2 hover:bg-zinc-50"
                    href="/help/contact"
                  >
                    Contáctanos
                  </Link>
                  <Link
                    className="block px-3 py-2 hover:bg-zinc-50"
                    href="/help/returns"
                  >
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
