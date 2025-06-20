'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { SidebarTrigger } from '@/components/ui/sidebar/SidebarTrigger'

export default function Header() {
  const router = useRouter()

  return (
    <header className="bg-white dark:bg-zinc-900 shadow-md px-6 py-3 w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* IZQUIERDA: botón + logo */}
        <div className="flex items-center gap-3 min-w-[180px]">
          <SidebarTrigger />
          <Link href="/">
            <Image
              src="/cortelogo.png"
              alt="Flowjuyu logo"
              width={40}
              height={40}
              className="rounded-full"
            />
          </Link>
        </div>

        {/* CENTRO: barra de búsqueda */}
        <div className="flex-1 flex justify-center">
          <input
            type="text"
            placeholder="¿Qué deseas comprar hoy?"
            className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* DERECHA: login, cuenta, carrito, idioma */}
        <div className="flex items-center gap-4 text-sm min-w-[320px] justify-end">
          <Link href="/login" className="hover:text-primary">
            Iniciar sesión
          </Link>
          <Link href="/registro" className="hover:text-primary">
            Crear cuenta
          </Link>
          <button onClick={() => router.push('/carrito')} className="text-xl">🛒</button>
          <select
            defaultValue="es"
            onChange={(e) => router.replace(`/${e.target.value}`)}
            className="border border-gray-300 rounded px-2 py-1"
          >
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
        </div>
      </div>
    </header>
  )
}
