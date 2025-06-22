'use client'

import Link from 'next/link'
import Image from 'next/image'
import { SidebarTrigger } from '@/components/ui/sidebar/SidebarTrigger'

export default function Header() {
  return (
    <div className="flex items-center justify-between px-4 h-16">
      {/* Izquierda: Logo + Botón Sidebar */}
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-zinc-700" />

        <Link href="/">
          <Image
            src="/cortelogo.png"
            alt="Flowjuyu logo"
            width={40}
            height={40}
            className="rounded-full cursor-pointer"
            priority
          />
        </Link>
      </div>

      {/* Centro: Barra de búsqueda */}
      <input
        type="text"
        placeholder="Buscar..."
        className="px-4 py-1 rounded border border-zinc-300 w-80"
      />

      {/* Derecha: Links de cuenta, carrito e idioma */}
      <div className="flex items-center gap-4">
        <Link href="/login">Iniciar sesión</Link>
        <Link href="/register">Crear cuenta</Link>

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
