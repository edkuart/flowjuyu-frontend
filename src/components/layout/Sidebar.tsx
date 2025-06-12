// src/components/layout/Sidebar.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <aside className="h-screen w-64 bg-zinc-900 text-white fixed top-0 left-0 flex flex-col z-50 p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Image
            src="/cortelogo.png"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="text-lg font-bold">Flowjuyu</span>
        </div>
        <button
          className="lg:hidden text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className={`flex-col gap-4 ${open ? 'flex' : 'hidden'} lg:flex`}>
        <Link href="/" className="hover:text-primary transition-colors">
          Inicio
        </Link>
        <Link href="/dashboard" className="hover:text-primary transition-colors">
          Dashboard
        </Link>
      </nav>
    </aside>
  )
}
