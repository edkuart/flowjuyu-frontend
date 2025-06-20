'use client'

import { Menu } from 'lucide-react'
import { useSidebar } from './SidebarContext'
import { cn } from '@/lib/utils' // <- si no tienes esta utilidad, te la paso

interface SidebarTriggerProps {
  className?: string
}

export function SidebarTrigger({ className }: SidebarTriggerProps) {
  const { toggle } = useSidebar()

  return (
    <button
      onClick={toggle}
      className={cn('p-2 rounded hover:bg-gray-100', className)}
      aria-label="Abrir menú lateral"
    >
      <Menu className="w-6 h-6" />
    </button>
  )
}
