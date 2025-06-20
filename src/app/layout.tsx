import './globals.css'
import type { Metadata } from 'next'
import { geistSans, geistMono } from '@/lib/fonts'
import { NextIntlClientProvider } from 'next-intl'

import { SidebarProvider } from '@/components/ui/sidebar/SidebarContext'
import { AppSidebar } from '@/components/ui/sidebar/AppSidebar'
import Header from '@/components/layout/Header'

export const metadata: Metadata = {
  title: 'Flowjuyu | Cortes Marketplace',
  description: 'Compra directo al productor',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <SidebarProvider>
          <Header /> 
          <AppSidebar />
          <main className="pt-16 min-h-screen">
            <NextIntlClientProvider locale="es">
              {children}
            </NextIntlClientProvider>
          </main>
        </SidebarProvider>
      </body>
    </html>
  )
}
