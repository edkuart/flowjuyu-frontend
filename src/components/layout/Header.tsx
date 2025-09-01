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

type Cat = { id: string; name: string; href: string; items?: { name: string; href: string }[] };

const CATEGORIES: Cat[] = [
  {
    id: "ropa",
    name: "Ropa típica",
    href: "/categorias/ropa-tipica",
    items: [
      { name: "Huipiles", href: "/categorias/huipiles" },
      { name: "Blusas", href: "/categorias/blusas" },
      { name: "Fajas", href: "/categorias/fajas" },
      { name: "Ponchos", href: "/categorias/ponchos" },
    ],
  },
  {
    id: "accesorios",
    name: "Accesorios",
    href: "/categorias/accesorios",
    items: [
      { name: "Carteras", href: "/categorias/carteras" },
      { name: "Collares", href: "/categorias/collares" },
      { name: "Pulseras", href: "/categorias/pulseras" },
      { name: "Sombreros", href: "/categorias/sombreros" },
    ],
  },
  {
    id: "hogar",
    name: "Hogar",
    href: "/categorias/hogar",
    items: [
      { name: "Textiles", href: "/categorias/textiles" },
      { name: "Decoración", href: "/categorias/decoracion" },
      { name: "Cocina", href: "/categorias/cocina" },
    ],
  },
];

export default function Header() {
  const { user, logout } = useAuth();
  const [q, setQ] = useState("");
  const [openCats, setOpenCats] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [cartCount] = useState<number>(0);

  // Cerrar “Ayuda” al hacer click fuera o presionar Esc
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
    <div className="w-full border-b bg-white">
      {/* Barra superior */}
      <div className="max-w-7xl mx-auto h-16 px-3 md:px-6 flex items-center gap-3">
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
            <span className="hidden sm:block text-lg font-semibold tracking-tight">Flowjuyu</span>
          </Link>

          {/* Categorías */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setOpenCats((v) => !v)}
              onBlur={() => setTimeout(() => setOpenCats(false), 150)}
              className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-zinc-50"
              aria-haspopup="menu"
              aria-expanded={openCats}
            >
              <Grid2x2 className="w-4 h-4" />
              Categorías
              <ChevronDown className="w-4 h-4" />
            </button>

            {openCats && (
              <div className="absolute mt-2 w-[560px] rounded-md border bg-white shadow-sm p-4 grid grid-cols-2 gap-4 z-50">
                {CATEGORIES.map((cat) => (
                  <div key={cat.id}>
                    <Link
                      href={cat.href}
                      className="font-medium text-sm hover:underline"
                      onClick={() => setOpenCats(false)}
                    >
                      {cat.name}
                    </Link>
                    <ul className="mt-2 space-y-1">
                      {cat.items?.map((it) => (
                        <li key={it.href}>
                          <Link
                            href={it.href}
                            className="text-sm text-zinc-600 hover:text-zinc-900"
                            onClick={() => setOpenCats(false)}
                          >
                            {it.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
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

        {/* Móvil: botón de búsqueda */}
        <button
          onClick={() => {
            const term = prompt("¿Qué deseas buscar?") || "";
            if (term.trim()) window.location.href = `/buscar?q=${encodeURIComponent(term.trim())}`;
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
                    Hola, <span className="font-medium text-zinc-700">{user.nombre}</span>
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

          {/* Idioma (placeholder) */}
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

            {/* Ayuda: abierto por hover/click, cierra por click fuera/Esc */}
            <li
              ref={helpRef}
              className="relative"
              onMouseEnter={() => setHelpOpen(true)}
            >
              <button
                type="button"
                onClick={() => setHelpOpen(v => !v)}
                className="inline-flex items-center gap-1 hover:underline"
                aria-haspopup="menu"
                aria-expanded={helpOpen}
              >
                Ayuda <ChevronDown className="w-4 h-4" />
              </button>

              {helpOpen && (
                <div
                  className="absolute left-0 top-full w-52 rounded-md border bg-white shadow-sm py-1 z-50"
                  role="menu"
                >
                  <Link className="block px-3 py-2 hover:bg-zinc-50" href="/help/faq" role="menuitem">
                    Preguntas frecuentes
                  </Link>
                  <Link className="block px-3 py-2 hover:bg-zinc-50" href="/help/contact" role="menuitem">
                    Contáctanos
                  </Link>
                  <Link className="block px-3 py-2 hover:bg-zinc-50" href="/help/returns" role="menuitem">
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
