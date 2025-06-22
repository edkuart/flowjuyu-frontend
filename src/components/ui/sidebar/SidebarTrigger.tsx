'use client'

import { Menu } from 'lucide-react'
import { useSidebar } from './SidebarContext'

interface Props {
  className?: string
}

export function SidebarTrigger({ className }: Props) {
  const { toggle } = useSidebar()

  return (
    <button
      onClick={toggle}
      className={`inline-flex items-center justify-center ${className}`}
      aria-label="Abrir menú"
    >
      <Menu className="w-6 h-6 text-black" />
    </button>
  )
}