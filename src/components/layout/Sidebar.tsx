'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

const categoriasMujer = [
  'Huipiles',
  'Cortes',
  'Fajas',
  'Tzutes',
  'Tocoyales',
  'Delantales',
  'Blusas típicas',
  'Trajes típicos completos',
  'Rebozos',
  'Chales',
  'Zapatos típicos',
  'Accesorios'
]

export default function Sidebar() {
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', escHandler)
    return () => window.removeEventListener('keydown', escHandler)
  }, [])

  return (
    <>
      {/* Botón para abrir cuando está cerrado */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed top-4 left-4 z-50 bg-white border border-gray-300 p-2 rounded-md shadow-md"
        >
          <Menu size={22} />
        </button>
      )}

      {/* Sidebar retráctil */}
      <aside
        className={`fixed top-0 left-0 h-full bg-zinc-900 text-white p-4 z-40 transform transition-transform duration-300
        ${open ? 'translate-x-0 w-64' : '-translate-x-full w-0'}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Image src="/cortelogo.png" alt="Logo" width={36} height={36} className="rounded-full" />
            <span className="font-bold text-lg">Flowjuyu</span>
          </div>
          <button onClick={() => setOpen(false)} className="text-white">
            <X size={20} />
          </button>
        </div>

        <div>
          <h3 className="text-sm text-gray-400 mb-2 uppercase">Ropa de mujer</h3>
          <ul className="space-y-2 text-sm">
            {categoriasMujer.map((cat) => (
              <li key={cat}>
                <Link
                  href={`/categorias/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setOpen(false)}
                  className="block hover:text-primary"
                >
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  )
}
