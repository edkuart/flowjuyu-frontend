"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, useMemo } from "react";
import {
  Search,
  User,
  ShoppingCart,
  Globe,
  LogOut,
  LayoutDashboard,
  Store,
  ChevronDown,
} from "lucide-react";
import { usePathname } from "next/navigation";

import { SidebarTrigger } from "@/components/ui/sidebar/SidebarTrigger";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import SearchBar from "@/components/ui/SearchBar";
import SellerTopbar from "@/components/seller/SellerTopbar";

export default function Header() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const pathname = usePathname();

  const [openCreate, setOpenCreate] = useState(false);
  const [openAccount, setOpenAccount] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const helpRef = useRef<HTMLLIElement>(null);

  const isSellerPanel = pathname.startsWith("/seller");

  // ===========================
  // Normalización de rol (optimizado)
  // ===========================
  const normalizedRole = useMemo(() => {
    if (!user) return null;

    const raw = user.role ?? user.rol ?? null;
    if (!raw) return null;

    if (raw === "buyer" || raw === "comprador") return "buyer";
    if (raw === "seller" || raw === "vendedor") return "seller";

    return null;
  }, [user]);

  const isBuyer = normalizedRole === "buyer";
  const isSeller = normalizedRole === "seller";

  // ===========================
  // Cerrar dropdowns externos
  // ===========================
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) {
        setHelpOpen(false);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHelpOpen(false);
        setOpenAccount(false);
        setOpenCreate(false);
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

  // ===========================
  // Header minimal para Seller
  // ===========================
  if (isSellerPanel) {
    return null;
  }

  // ===========================
  // Header Marketplace
  // ===========================
  return (
    <div className="w-full bg-white/95 backdrop-blur border-b border-neutral-100 shadow-sm sticky top-0 z-50">

      {/* ================= Barra superior ================= */}
      <div className="max-w-screen-xl mx-auto h-14 md:h-16 px-4 md:px-8 flex items-center justify-between">

        {/* IZQUIERDA */}
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <SidebarTrigger className="text-zinc-700" />
          </div>

          <Link href="/" className="flex items-center">
            <Image
              src="/logo-flowjuyu.png"
              alt="Flowjuyu"
              width={140}
              height={40}
              priority
              className="object-contain h-7 sm:h-8 md:h-9 lg:h-10 w-auto"
            />
          </Link>
        </div>

        {/* CENTRO (search desktop) */}
        <div className="flex-1 max-w-3xl mx-auto hidden sm:flex">
          <SearchBar />
        </div>

        {/* Botón búsqueda móvil */}
        <button
          type="button"
          onClick={() => setMobileSearchOpen(v => !v)}
          className="sm:hidden p-2 rounded-full hover:bg-zinc-50"
          aria-label="Buscar"
        >
          <Search className="w-5 h-5 text-zinc-700" />
        </button>

        {/* DERECHA */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Cuenta */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setOpenAccount(v => !v)}
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm hover:bg-neutral-100 transition"
              >
                <User className="w-4 h-4" />
                Mi cuenta
                <ChevronDown className="w-4 h-4" />
              </button>

              {openAccount && (
                <div className="absolute right-0 top-full pt-2 w-56 z-50 transition-all duration-150 ease-out">
                  <div className="bg-white border rounded-md shadow-sm py-1">

                    {isBuyer && (
                      <Link
                        href="/buyer/orders"
                        onClick={() => setOpenAccount(false)}
                        className="block px-3 py-2 text-sm hover:bg-zinc-50"
                      >
                        Mis pedidos
                      </Link>
                    )}

                    {isSeller && (
                      <>
                        <Link
                          href="/seller/dashboard"
                          onClick={() => setOpenAccount(false)}
                          className="flex gap-2 px-3 py-2 text-sm hover:bg-zinc-50"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard vendedor
                        </Link>

                        <Link
                          href="/seller/products"
                          onClick={() => setOpenAccount(false)}
                          className="flex gap-2 px-3 py-2 text-sm hover:bg-zinc-50"
                        >
                          <Store className="w-4 h-4" />
                          Mis productos
                        </Link>
                      </>
                    )}

                    <button
                      onClick={() => {
                        setOpenAccount(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-zinc-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </div>
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
                  onClick={() => setOpenCreate(v => !v)}
                  className="inline-flex items-center gap-1 text-sm hover:text-zinc-900"
                >
                  Crear cuenta <ChevronDown className="w-4 h-4" />
                </button>

                {openCreate && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md border bg-white shadow-sm py-1 z-50 transition-all duration-150 ease-out">
                    <Link
                      href="/register/buyer"
                      onClick={() => setOpenCreate(false)}
                      className="block px-3 py-2 text-sm hover:bg-zinc-50"
                    >
                      Soy comprador
                    </Link>
                    <Link
                      href="/register/seller"
                      onClick={() => setOpenCreate(false)}
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
            {count > 0 && (
              <span className="absolute -top-1 -right-1 rounded-full bg-zinc-900 text-white text-[10px] px-1.5 py-[1px]">
                {count}
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

      {/* SearchBar móvil */}
      {mobileSearchOpen && (
        <div className="sm:hidden px-3 pb-3">
          <SearchBar />
        </div>
      )}

      {/* ================= Línea inferior ================= */}
      <nav className="border-t border-neutral-100">
        <div className="max-w-7xl mx-auto h-10 px-4 md:px-8 flex items-center justify-between text-sm">

          <ul className="flex items-center gap-4 text-zinc-700">

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
                onClick={() => setHelpOpen(v => !v)}
                className="inline-flex items-center gap-1 hover:underline"
              >
                Ayuda <ChevronDown className="w-4 h-4" />
              </button>

              {helpOpen && (
                <div className="absolute left-0 top-full w-52 rounded-md border bg-white shadow-sm py-1 z-50 transition-all duration-150 ease-out">
                  <Link
                    className="block px-3 py-2 hover:bg-zinc-50"
                    href="/help/faq"
                    onClick={() => setHelpOpen(false)}
                  >
                    Preguntas frecuentes
                  </Link>
                  <Link
                    className="block px-3 py-2 hover:bg-zinc-50"
                    href="/help/contact"
                    onClick={() => setHelpOpen(false)}
                  >
                    Contáctanos
                  </Link>
                  <Link
                    className="block px-3 py-2 hover:bg-zinc-50"
                    href="/help/returns"
                    onClick={() => setHelpOpen(false)}
                  >
                    Devoluciones
                  </Link>
                </div>
              )}
            </li>

          </ul>

          <div className="hidden md:flex items-center gap-6 text-xs text-zinc-600">
            <span>100% chapines</span>
          </div>

        </div>
      </nav>
    </div>
  );
}