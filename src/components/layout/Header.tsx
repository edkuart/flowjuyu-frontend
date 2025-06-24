'use client'

import Link from 'next/link'
import Image from 'next/image'
import { SidebarTrigger } from '@/components/ui/sidebar/SidebarTrigger'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 bg-white">
      {/* Izquierda: Logo + Botón Sidebar */}
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

      {/* Centro: Barra de búsqueda */}
      <input
        type="text"
        placeholder="¿Qué deseas buscar?"
        className="px-4 py-1 rounded border border-zinc-300 w-80"
      />

      {/* Derecha: Links de cuenta, carrito e idioma */}
      <div className="flex items-center gap-4 relative">
        <Link href="/login">Iniciar sesión</Link>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-1"
          >
            Crear cuenta
            <ChevronDown className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 bg-white border rounded shadow w-48 z-50">
              <Link
                href="/register"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                Soy comprador
              </Link>
              <Link
                href="/register/vendedor"
                className="block px-4 py-2 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                Soy vendedor
              </Link>
            </div>
          )}
        </div>

        <button>
          <Image src="/cart-icon.svg" alt="Carrito" width={24} height={24} />
        </button>

        <select defaultValue="ES" className="border rounded px-2 py-1">
          <option value="ES">ES</option>
          <option value="EN">EN</option>
        </select>
      </div>
    </div>
  )
}
