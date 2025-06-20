'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSidebar } from '@/components/ui/sidebar/SidebarContext'
import { Menu, ShoppingCart } from 'lucide-react'

export function Header() {
  const { toggle } = useSidebar()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white shadow-md px-4 flex items-center justify-between">
      {/* Botón de menú */}
      <button onClick={toggle} className="text-gray-700 lg:hidden mr-2">
        <Menu className="w-6 h-6" />
      </button>

      {/* Logo + Nombre */}
      <Link href="/" className="flex items-center gap-2">
        <Image src="/cortelogo.png" alt="Flowjuyu" width={32} height={32} />
        <span className="font-bold text-lg text-gray-800">Flowjuyu</span>
      </Link>

      {/* Búsqueda */}
      <div className="flex-1 max-w-md mx-4 hidden md:flex">
        <input
          type="text"
          placeholder="¿Qué deseas comprar hoy?"
          className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:ring-primary/50"
        />
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-4">
        <Link href="/login" className="text-sm text-gray-700 hover:text-primary transition">
          Iniciar sesión
        </Link>
        <Link href="/registro" className="text-sm text-gray-700 hover:text-primary transition">
          Crear cuenta
        </Link>
        <Link href="/carrito" className="text-gray-700 hover:text-primary">
          <ShoppingCart className="w-5 h-5" />
        </Link>
        <select className="text-sm border rounded px-2 py-1 bg-white text-gray-700">
          <option value="es">ES</option>
          <option value="en">EN</option>
        </select>
      </div>
    </header>
  )
}
