'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { SidebarTrigger } from '@/components/ui/sidebar/SidebarTrigger'

export default function Header() {
  const router = useRouter()

  return (
    <header className="h-[var(--header-height)] bg-white dark:bg-zinc-900 shadow-md flex items-center px-6">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto gap-4 flex-wrap">
        {/* ───── Izquierda: Logo + Búsqueda ───── */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Botón ☰ (móvil) */}
          <SidebarTrigger className="lg:hidden text-zinc-700" />

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

          <input
            type="text"
            placeholder="¿Qué deseas comprar hoy?"
            className="border border-gray-300 rounded-lg px-4 py-2 w-[250px] md:w-[400px] focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* ───── Derecha: Acciones ───── */}
        <div className="flex items-center gap-4 text-sm">
          <Link href="/login" className="hover:text-primary">
            Iniciar sesión
          </Link>
          <Link href="/registro" className="hover:text-primary">
            Crear cuenta
          </Link>

          <button
            onClick={() => router.push('/carrito')}
            className="text-xl"
            aria-label="Carrito"
          >
            🛒
          </button>

          <select
            defaultValue="es"
            onChange={(e) => router.replace(`/${e.target.value}`)}
            className="border border-gray-300 rounded px-2 py-1"
            aria-label="Idioma"
          >
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
        </div>
      </div>
    </header>
  )
}
