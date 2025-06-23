// src/providers/ClientProviders.tsx
'use client'

import { SessionProvider } from 'next-auth/react'
import { SidebarProvider } from '@/components/ui/sidebar/SidebarContext'
import { NextIntlClientProvider } from 'next-intl'

interface Props {
  children: React.ReactNode
}

export function ClientProviders({ children }: Props) {
  return (
    <SessionProvider>
      <SidebarProvider>
        <NextIntlClientProvider locale="es">
          {children}
        </NextIntlClientProvider>
      </SidebarProvider>
    </SessionProvider>
  )
}
