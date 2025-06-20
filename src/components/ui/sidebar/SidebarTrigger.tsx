'use client'

import { AlignLeft } from 'lucide-react'
import { useSidebar } from './SidebarContext'

export function SidebarTrigger() {
  const { toggle } = useSidebar()

  return (
    <button onClick={toggle} aria-label="Abrir menú">
      <AlignLeft className="w-6 h-6" />
    </button>
  )
}
