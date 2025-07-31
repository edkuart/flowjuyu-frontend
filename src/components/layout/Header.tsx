"use client";

import Link from "next/link";
import Image from "next/image";
import { SidebarTrigger } from "@/components/ui/sidebar/SidebarTrigger";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 bg-white">
      {/* Izquierda: Logo + Sidebar */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-zinc-700" />
        <Link href="/">
          <Image
            src="/cortelogo.png"
            alt="Flowjuyu logo"
            width={40}
            height={40}
            className="rounded-full"
            priority
          />
        </Link>
      </div>

      {/* Centro: Búsqueda */}
      <input
        type="text"
        placeholder="¿Qué deseas buscar?"
        className="px-4 py-1 rounded border border-zinc-300 w-80"
      />

      {/* Derecha */}
      <div className="flex items-center gap-4 relative">
        {user ? (
          <>
            <span className="font-semibold">Hola, {user.nombre}</span>

            {/* Menú dinámico según rol */}
            {user.rol === "comprador" && (
              <>
                <Link href="/explorar" className="hover:underline">
                  Explorar
                </Link>
                <Link href="/carrito" className="hover:underline">
                  Carrito
                </Link>
              </>
            )}

            {user.rol === "vendedor" && (
              <>
                <Link href="/seller/dashboard" className="hover:underline">
                  Dashboard
                </Link>
                <Link href="/seller/productos" className="hover:underline">
                  Mis productos
                </Link>
              </>
            )}

            {user.rol === "admin" && (
              <Link href="/admin/dashboard" className="hover:underline">
                Admin Panel
              </Link>
            )}

            <button
              onClick={logout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:underline">
              Iniciar sesión
            </Link>

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-1 hover:text-blue-600"
              >
                Crear cuenta
                <ChevronDown className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 bg-white border rounded shadow w-48 z-50">
                  <Link
                    href="/register/buyer"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    Soy comprador
                  </Link>
                  <Link
                    href="/register/seller"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    Soy vendedor
                  </Link>
                </div>
              )}
            </div>
          </>
        )}

        {/* Icono Carrito solo para compradores */}
        {user?.rol === "comprador" && (
          <Link href="/carrito">
            <Image src="/cart-icon.svg" alt="Carrito" width={24} height={24} />
          </Link>
        )}

        <select defaultValue="ES" className="border rounded px-2 py-1">
          <option value="ES">ES</option>
          <option value="EN">EN</option>
        </select>
      </div>
    </div>
  );
}
