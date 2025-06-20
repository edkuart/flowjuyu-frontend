'use client'

import { useSidebar } from './SidebarContext'
import { X } from 'lucide-react'

export function AppSidebar() {
  const { open, close } = useSidebar()

  return (
    <aside
      className={`fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] z-40 bg-white shadow transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Menú</h2>
        <button onClick={close} className="p-1" aria-label="Cerrar menú">
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="p-4 space-y-2">
        <a href="/categorias/huipiles" onClick={close} className="block hover:text-primary">Huipiles</a>
        <a href="/categorias/fajas" onClick={close} className="block hover:text-primary">Fajas</a>
        <a href="/perfil" onClick={close} className="block hover:text-primary">Mi perfil</a>
      </nav>
    </aside>
  )
}
