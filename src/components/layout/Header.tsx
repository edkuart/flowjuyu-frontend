// src/components/layout/Header.tsx

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

  if (isSellerPanel) return null;

  return (
    <div className="w-full sticky top-0 z-50 shadow-md">

      {/* ================= Barra superior ================= */}
      <div className="bg-gradient-to-r from-[#0f2e22] to-[#184c37] text-white">

        <div className="max-w-screen-xl mx-auto h-14 md:h-16 px-4 md:px-8 flex items-center justify-between">

          {/* IZQUIERDA */}
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <SidebarTrigger className="text-white" />
            </div>

            <Link
              href="/"
              className="mr-4 md:mr-6 flex items-center shrink-0 rounded-lg bg-[#f6f2ea] px-2 py-1 shadow-sm"
            >
              {/* Móvil */}
              <div className="flex h-8 w-8 items-center justify-center overflow-hidden md:hidden">
                <Image
                  src="/flowjuyu-isotipo.png"
                  alt="Flowjuyu"
                  width={36}
                  height={36}
                  priority
                  className="object-contain scale-[2.3] translate-x-[0.6px] translate-y-[10px]"
                />
              </div>

              {/* Desktop */}
              <Image
                src="/flowjuyu-logo-completo.png"
                alt="Flowjuyu"
                width={170}
                height={52}
                priority
                className="hidden md:block object-contain h-10 w-auto"
              />
            </Link>
          </div>

          {/* CENTRO */}
          <div className="flex-1 max-w-3xl mx-auto hidden sm:flex">
            <SearchBar />
          </div>

          {/* Search móvil */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(v => !v)}
            className="sm:hidden p-2 rounded-full hover:bg-white/10 transition"
            aria-label="Buscar"
          >
            <Search className="w-5 h-5 text-white" />
          </button>

          {/* DERECHA */}
          <div className="flex items-center gap-3">

            {/* Cuenta */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setOpenAccount(v => !v)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-sm hover:bg-white/10 transition"
                >
                  <User className="w-4 h-4" />
                  Mi cuenta
                  <ChevronDown className="w-4 h-4" />
                </button>

                {openAccount && (
                  <div className="absolute right-0 top-full pt-2 w-56 z-50">
                    <div className="bg-white rounded-xl shadow-xl py-2 text-neutral-800">

                      {isBuyer && (
                        <Link
                          href="/buyer/orders"
                          onClick={() => setOpenAccount(false)}
                          className="block px-4 py-2 text-sm hover:bg-neutral-100"
                        >
                          Mis pedidos
                        </Link>
                      )}

                      {isSeller && (
                        <>
                          <Link
                            href="/seller/dashboard"
                            onClick={() => setOpenAccount(false)}
                            className="flex gap-2 px-4 py-2 text-sm hover:bg-neutral-100"
                          >
                            <LayoutDashboard className="w-4 h-4 text-[#0f2e22]" />
                            Dashboard vendedor
                          </Link>

                          <Link
                            href="/seller/products"
                            onClick={() => setOpenAccount(false)}
                            className="flex gap-2 px-4 py-2 text-sm hover:bg-neutral-100"
                          >
                            <Store className="w-4 h-4 text-[#0f2e22]" />
                            Mis productos
                          </Link>
                        </>
                      )}

                      <button
                        onClick={() => {
                          setOpenAccount(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm hover:bg-neutral-100"
                      >
                        <LogOut className="w-4 h-4 text-[#0f2e22]" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm hover:text-amber-300 transition"
                >
                  Iniciar sesión
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setOpenCreate(v => !v)}
                    className="inline-flex items-center gap-1 text-sm hover:text-amber-300 transition"
                  >
                    Crear cuenta <ChevronDown className="w-4 h-4" />
                  </button>

                  {openCreate && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-xl py-2 text-neutral-800">
                      <Link
                        href="/register/buyer"
                        onClick={() => setOpenCreate(false)}
                        className="block px-4 py-2 text-sm hover:bg-neutral-100"
                      >
                        Soy comprador
                      </Link>
                      <Link
                        href="/register/seller"
                        onClick={() => setOpenCreate(false)}
                        className="block px-4 py-2 text-sm hover:bg-neutral-100"
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
              className="relative p-2 rounded-full hover:bg-white/10 transition"
            >
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 rounded-full bg-amber-500 text-white text-[10px] px-1.5 py-[1px]">
                  {count}
                </span>
              )}
            </Link>

            {/* Idioma */}
            <button className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded border border-white/20 text-sm hover:bg-white/10 transition">
              <Globe className="w-4 h-4" />
              ES
            </button>

          </div>
        </div>
      </div>

      {/* Search móvil */}
      {mobileSearchOpen && (
        <div className="sm:hidden px-3 pb-3 bg-[#0f2e22]">
          <SearchBar />
        </div>
      )}

      {/* ================= Línea inferior ================= */}
      <nav className="bg-[#081a13] border-t border-white/10 text-white/80">
        <div className="max-w-7xl mx-auto h-10 px-4 md:px-8 flex items-center justify-between text-sm">

          <ul className="flex items-center gap-6">

            <li>
              <Link
                className="hover:text-amber-300 transition"
                href="/new-arrivals"
              >
                Lo + nuevo
              </Link>
            </li>

            <li>
              <Link
                className="hover:text-amber-300 transition"
                href="/sell"
              >
                Vende en Flowjuyu
              </Link>
            </li>

            <li ref={helpRef} className="relative">
              <button
                type="button"
                onClick={() => setHelpOpen(v => !v)}
                className="inline-flex items-center gap-1 hover:text-amber-300 transition"
              >
                Ayuda <ChevronDown className="w-4 h-4" />
              </button>

              {helpOpen && (
                <div className="absolute left-0 top-full w-52 rounded-xl bg-white shadow-xl py-2 text-neutral-800 z-50">

                  <Link
                    className="block px-4 py-2 hover:bg-neutral-100"
                    href="/ayuda/faq"
                    onClick={() => setHelpOpen(false)}
                  >
                    Preguntas frecuentes
                  </Link>

                  <Link
                    className="block px-4 py-2 hover:bg-neutral-100"
                    href="/ayuda/contacto"
                    onClick={() => setHelpOpen(false)}
                  >
                    Contáctanos
                  </Link>

                  <Link
                    className="block px-4 py-2 hover:bg-neutral-100"
                    href="/ayuda/devoluciones"
                    onClick={() => setHelpOpen(false)}
                  >
                    Devoluciones
                  </Link>

                </div>
              )}
            </li>

          </ul>

          <div className="hidden md:flex items-center gap-6 text-xs text-white/60">
            <span className="tracking-wide">100% chapines</span>
          </div>

        </div>
      </nav>
    </div>
  );
}