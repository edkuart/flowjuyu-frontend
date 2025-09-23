// src/components/layout/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Search,
  Heart,
  ShoppingCart,
  Globe,
  Menu,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";

/** Mega-menú de categorías */
const CATEGORIES = [
  {
    title: "Ropa típica",
    items: [
      { name: "Huipiles", href: "/c/huipiles" },
      { name: "Blusas", href: "/c/blusas" },
      { name: "Fajas", href: "/c/fajas" },
      { name: "Ponchos", href: "/c/ponchos" },
    ],
  },
  {
    title: "Accesorios",
    items: [
      { name: "Carteras", href: "/c/carteras" },
      { name: "Collares", href: "/c/collares" },
      { name: "Pulseras", href: "/c/pulseras" },
      { name: "Sombreros", href: "/c/sombreros" },
    ],
  },
  {
    title: "Hogar",
    items: [
      { name: "Textiles", href: "/c/textiles" },
      { name: "Decoración", href: "/c/decoracion" },
      { name: "Cocina", href: "/c/cocina" },
    ],
  },
];

function useClickOutside<T extends HTMLElement>(
  open: boolean,
  onClose: () => void
) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);
  return ref;
}

export default function Header() {
  const { user, logout } = useAuth();
  const [catOpen, setCatOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);

  const catRef = useClickOutside<HTMLDivElement>(catOpen, () => setCatOpen(false));
  const helpRef = useClickOutside<HTMLDivElement>(helpOpen, () => setHelpOpen(false));
  const acctRef = useClickOutside<HTMLDivElement>(acctOpen, () => setAcctOpen(false));

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white">
      {/* Barra superior */}
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-3 sm:px-4">
        {/* Botón Sidebar (mobile) */}
        <SidebarTrigger className="md:hidden" />
        <Menu className="w-5 h-5 md:hidden text-zinc-700" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/cortelogo.png"
            alt="Flowjuyu"
            width={28}
            height={28}
            className="rounded"
            priority
          />
          <span className="hidden text-lg font-semibold sm:inline">Flowjuyu</span>
        </Link>

        {/* Categorías */}
        <div className="relative" ref={catRef}>
          <button
            className="flex items-center gap-2 rounded-md border px-3 py-1 text-sm hover:bg-zinc-50"
            onClick={() => setCatOpen((v) => !v)}
          >
            <span className="hidden sm:inline">Categorías</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {catOpen && (
            <div className="absolute left-0 top-10 w-[620px] rounded-md border bg-white p-4 shadow-md">
              <div className="grid grid-cols-3 gap-6">
                {CATEGORIES.map((col) => (
                  <div key={col.title}>
                    <p className="mb-2 text-sm font-semibold">{col.title}</p>
                    <ul className="space-y-1 text-sm">
                      {col.items.map((it) => (
                        <li key={it.name}>
                          <Link
                            onClick={() => setCatOpen(false)}
                            href={it.href}
                            className="block rounded px-2 py-1 hover:bg-zinc-50"
                          >
                            {it.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Buscador */}
        <div className="ml-1 flex flex-1 items-center">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              placeholder="Buscar en Flowjuyu"
              className="w-full rounded-md border bg-white py-2 pl-9 pr-3 text-sm outline-none placeholder:text-zinc-500"
            />
          </div>
        </div>

        {/* Atajos */}
        <div className="hidden items-center gap-3 sm:flex">
          <Link href="/wishlist" aria-label="Favoritos" className="text-zinc-700 hover:text-black">
            <Heart className="h-5 w-5" />
          </Link>
          <Link href="/carrito" aria-label="Carrito" className="relative text-zinc-700 hover:text-black">
            <ShoppingCart className="h-5 w-5" />
          </Link>
          <button
            className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs"
            title="Idioma"
            aria-label="Idioma"
          >
            <Globe className="h-4 w-4" />
            <span>ES</span>
          </button>
        </div>

        {/* Sesión / Cuenta */}
        <div className="relative ml-1" ref={acctRef}>
          {!user ? (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm hover:underline">
                Iniciar sesión
              </Link>
              {/* Crear cuenta */}
              <div className="relative">
                <button
                  onClick={() => setAcctOpen((v) => !v)}
                  className="flex items-center gap-1 text-sm hover:text-blue-600"
                >
                  Crear cuenta <ChevronDown className="h-4 w-4" />
                </button>
                {acctOpen && (
                  <div className="absolute right-0 top-7 w-48 rounded-md border bg-white shadow-md">
                    <Link href="/register/buyer" className="block px-4 py-2 text-sm hover:bg-zinc-50">Soy comprador</Link>
                    <Link href="/register/seller" className="block px-4 py-2 text-sm hover:bg-zinc-50">Soy vendedor</Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => setAcctOpen((v) => !v)}
                className="flex items-center gap-2 rounded-md border px-3 py-1 text-sm hover:bg-zinc-50"
              >
                <span className="hidden sm:inline">Mi cuenta</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {acctOpen && (
                <div className="absolute right-0 top-10 w-64 rounded-md border bg-white p-2 shadow-md">
                  <p className="px-3 pb-2 text-xs text-zinc-500">Hola, {user.nombre}</p>
                  <nav className="flex flex-col">
                    {/* Rutas dinámicas según rol */}
                    {user.rol === "comprador" && (
                      <Link href="/explorar" className="rounded px-3 py-2 text-sm hover:bg-zinc-50">Explorar</Link>
                    )}
                    {user.rol === "vendedor" && (
                      <>
                        <Link href="/seller/dashboard" className="rounded px-3 py-2 text-sm hover:bg-zinc-50">Dashboard</Link>
                        <Link href="/seller/products" className="rounded px-3 py-2 text-sm hover:bg-zinc-50">Mis productos</Link>
                        <Link href="/seller/profile" className="rounded px-3 py-2 text-sm hover:bg-zinc-50">Perfil público</Link>
                        <Link href="/seller/profile/business" className="rounded px-3 py-2 text-sm hover:bg-zinc-50">Mi negocio</Link>
                        <Link href="/seller/profile/validation" className="rounded px-3 py-2 text-sm hover:bg-zinc-50">Validación</Link>
                      </>
                    )}
                    {user.rol === "admin" && (
                      <Link href="/admin/dashboard" className="rounded px-3 py-2 text-sm hover:bg-zinc-50">Admin Panel</Link>
                    )}
                    <button
                      onClick={() => {
                        setAcctOpen(false);
                        logout();
                      }}
                      className="rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Cerrar sesión
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Barra secundaria */}
      <div className="border-t">
        <div className="mx-auto flex h-10 max-w-7xl items-center gap-5 px-3 text-sm text-zinc-700 sm:px-4">
          <Link href="/offers" className="hover:underline">Ofertas</Link>
          <Link href="/shipping" className="hover:underline">Envíos</Link>
          <Link href="/new-arrivals" className="hover:underline">Lo + nuevo</Link>
          <Link href="/gift-card" className="hover:underline">Gift card</Link>
          <Link href="/seller/onboarding" className="hover:underline">Vende en Flowjuyu</Link>
          {/* Ayuda */}
          <div className="relative" ref={helpRef}>
            <button
              onClick={() => setHelpOpen((v) => !v)}
              className={cn("flex items-center gap-1 hover:text-black", helpOpen && "text-black")}
            >
              Ayuda <ChevronDown className="h-4 w-4" />
            </button>
            {helpOpen && (
              <div className="absolute left-0 top-7 w-56 rounded-md border bg-white shadow-md">
                <Link href="/help/faq" className="block px-4 py-2 text-sm hover:bg-zinc-50">Preguntas frecuentes</Link>
                <Link href="/help/contact" className="block px-4 py-2 text-sm hover:bg-zinc-50">Contáctanos</Link>
                <Link href="/help/returns" className="block px-4 py-2 text-sm hover:bg-zinc-50">Devoluciones</Link>
              </div>
            )}
          </div>
          <span className="ml-auto hidden text-xs text-zinc-500 sm:inline">GT 100% chapines</span>
        </div>
      </div>
    </header>
  );
}
